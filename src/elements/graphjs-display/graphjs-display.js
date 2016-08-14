const _private = {};
const ready = new Promise(async resolve => {
    // require bootstrap
    if (window.require) {
        init();
    } else {
        const setter = Object.getOwnPropertyDescriptor(window, "require").set;
        Object.defineProperty(window, "require", {
            set(_require) {
                if (setter) {
                    setter(_require);
                } else {
                    delete window.require;
                    window.require = _require;
                }
                setTimeout(init, 0);
            },
            configurable: true
        });
    }
    // init function when require is provided
    async function init() {
        // static update function - critical
        try {
            // uri relative to app.html
            const css_promise = fetch("../elements/graphjs-display/graphjs-display.css");
            let _resolve;
            const dependencies_promise = new Promise(resolve => {
                _resolve = resolve;
            });
            require(["../../build/lib/polymer/Gestures.js", "../../build/lib/jamtis/requestAnimationFunction.js"], _resolve);
            const STYLE_ELEMENT = document.createElement("style");
            STYLE_ELEMENT.textContent = await(await css_promise).text();
            const[{
                default: Gestures
            }, {
                default: requestAnimationFunction
            }] = await dependencies_promise;
            // ready
            resolve({
                STYLE_ELEMENT,
                Gestures,
                requestAnimationFunction
            });
        } catch (e) {
            console.error(e);
        }
    }
});
class GraphjsDisplay extends HTMLElement {
    createdCallback() {
        Object.defineProperty(this, "private", {
            value: new WeakMap
        });
        this.private.set(_private, {
            circles: new Map,
            paths: new Map
        });
        this.root = this.createShadowRoot();
        this.root.appendChild(STYLE_ELEMENT.cloneNode(true));
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(svg.viewBox.baseVal, {
            x: -1000,
            y: -1000,
            width: 2000,
            height: 2000
        });
        Object.defineProperty(this, "svg", {
            value: svg,
            enumerable: true
        });
        this.root.appendChild(svg);
        // check for assignments before registering
        if (this.graph) {
            const _graph = this.graph;
            // delete own graph property to use prototype property
            delete this.graph;
            this.graph = _graph;
        }
    }
    set graph(graph) {
        this.svg.innerHTML = "";
        this[$graph] = graph;
        this[$circles].clear();
        this[$paths].clear();
        // console.log("set graph", graph);
        // append links before nodes
        for (const link of graph.links) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path[$reference] = link;
            this[$paths].set(link, path);
            this.svg.appendChild(path);
        }
        for (const[node] of graph) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle[$reference] = node;
            this[$circles].set(node, circle);
            this.svg.appendChild(circle);
            // add gestures !!!
            Gestures.add(circle, "tap", this.constructor._tap);
            Gestures.add(circle, "track", this.constructor._track);
        }
        this.updateGraph();
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
            const {source, target} = link;if (source === target || source.x === target.x && source.y === target.y) {
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
    static _tap(event) {
        console.log("tap event");
    }
    static _track(event) {
        console.log("track event", event);
        const circle = event.currentTarget;
        const node = circle[$reference];
        node.x = event.detail.ddx || 0;
        node.y = event.detail.ddy || 0;
        this.constructor._paintTrackedNode(node);
    }
    static _paintTrackedNode(node) {
        const relations = this[$graph].get(node);
        const links = new Set;
        for (const [,link] of relations.dependents) {
            links.add(link);
        }
        for (const [,link] of relations.dependencies) {
            links.add(link);
        }
        for (const link of links) {
            link._path.setAttribute("d", this.calcPath(link));
        }
    }
    async updateGraph() {
        await ready;
        await this.updateGraph();
    }

}
(async() => {
    await ready;
    const updateGraph = requestAnimationFunction(function() {
        for (const[node, circle] of this[$circles]) {
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
        for (const[link, path] of this[$paths]) {
            path.setAttribute("d", this.calcPath(link));
        }
    });
    Object.defineProperties(GraphjsDisplay.prototype, {
        updateGraph: {
            async value() {
                updateGraph();
            }
        },
        writable: true,
        configurable: true
    });
    document.registerElement("graphjs-display", GraphjsDisplay);
})();
export default GraphjsDisplay;