(async() => {
    const $nodes = Symbol("nodes");
    const $links = Symbol("links");
    // static update function - critical
    try {
        const updateDOM = requestAnimationFunction((nodes, links) => {
            for (const [node, circle] of nodes) {
                if (circle.cx.baseVal.value !== node.x) {
                    circle.cx.baseVal.value = node.x || 0;
                }
                if (circle.cy.baseVal.value !== node.y) {
                    circle.cy.baseVal.value = node.y || 0;
                }
                if (circle.r.baseVal.value !== node.radius) {
                    circle.r.baseVal.value = node.radius || 0;
                }
            }
            for (const [link, path] of links) {
                path.setAttribute("d", GraphjsDisplay.calcPath(link));
            }
        });
        class GraphjsDisplay extends HTMLElement {
            createdCallback() {
                this[$nodes] = new Map;
                this[$links] = new Map;
                this.root = this.createShadowRoot();
                const style = document.createElement("style");
                style.textContent = css;
                this.root.appendChild(style);
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                Object.assign(svg.viewBox.baseVal, {
                    x: -1000,
                    y: -1000,
                    width: 2000,
                    height: 2000
                });
                Object.defineProperty(this, "svg", {
                    value: svg
                });
                this.root.appendChild(svg);
                // check for assignments before registering
                if (this.graph) {
                    const _graph = this.graph;
                    Object.defineProperty(this, "graph", Object.getOwnPropertyDescriptor(GraphjsDisplay.prototype, "graph"));
                    this.graph = _graph;
                }
            }
            set graph(graph) {
                this.svg.innerHTML = "";
                this[$nodes].clear();
                this[$links].clear();
                // console.log("set graph", graph);
                // append links before nodes
                for (const link of graph.links) {
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    path.reference = link;
                    this[$links].set(link, path);
                    this.svg.appendChild(path);
                }
                for (const[node] of graph) {
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.reference = node;
                    this[$nodes].set(node, circle);
                    this.svg.appendChild(circle);
                }
                this.updateGraph();
            }
            updateGraph() {
                updateDOM(this[$nodes], this[$links]);
            }
            static calcPath(link) {
                if (link.nodes) {
                    // undirected link
                    const [source, target] = Array.from(link.nodes);
                    if (!target || source.x === target.x && source.y === target.y) {
                        const short = source.radius / 3;
                        const long = source.radius * 3;
                        return `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`;
                    } else {
                        const x_diff = target.x - source.x;
                        const y_diff = target.y - source.y;
                        const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
                        const xr_diff = x_diff / r_diff;
                        const yr_diff = y_diff / r_diff;
                        const offset = 2;
                        const m1_x = source.x + xr_diff * offset;
                        const m1_y = source.y + yr_diff * offset;
                        const m2_x = target.x - xr_diff * offset;
                        const m2_y = target.y - yr_diff * offset;
                        return `M ${m1_x} ${m1_y}L ${source.x + yr_diff} ${source.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m1_x} ${m1_y}L ${m2_x} ${m2_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m2_x} ${m2_y}`;
                    }
                } else {
                    // directed link
                    const {source, target} = link;
                    if (source === target || source.x === target.x && source.y === target.y) {
                        const short = source.radius / 3;
                        const long = source.radius * 3;
                        return `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`;
                    } else {
                        const x_diff = target.x - source.x;
                        const y_diff = target.y - source.y;
                        const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
                        const xr_diff = x_diff / r_diff;
                        const yr_diff = y_diff / r_diff;
                        const offset = 2;
                        const m_x = target.x - xr_diff * offset;
                        const m_y = target.y - yr_diff * offset;
                        return `M ${source.x} ${source.y}L ${m_x} ${m_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m_x} ${m_y}`;
                    }
                }
            }
        }
        // uri relative to app.html
        const response = await fetch("../elements/graphjs-display/graphjs-display.css");
        const css = await response.text();
        document.registerElement("graphjs-display", GraphjsDisplay);
    } catch (e) {
        console.error(e);
    }
})();

/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@gmx.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
function requestAnimationFunction(callback, weak = true) {
    if (typeof callback != "function") throw Error("{callback} is not a function");
    //{updated} defines whether the frame has been animated since the last call
    let updated = true;
    //{args} is passed to the callback on frame animation
    //arguments are stored out of 'update'-closure to make them overridable (in case of {weak} != false)
    let args;
    return function update(..._args) {
        //set arguments on first call (after frame animation)
        if (args === undefined) args = _args;
        if (updated) {
            //request callback to be executed on animation frame
            //calling with {undefined} as pointer because {requestAnimationFrame} is already bound to the context
            requestAnimationFrame(() => {
                //{updated} must be set to true before the callback is called
                //otherwise a call of the own 'update'-function would not request the callback
                //to be called again on the next frame animation
                updated = true;
                //call the callback
                callback(...args);
            });
            //determine that the frame has not been animated since the last (current) call of the 'update'-function
            updated = false;
        }
        //override arguments if {weak} != false;
        else if (!!weak) args = _args;
    };
}