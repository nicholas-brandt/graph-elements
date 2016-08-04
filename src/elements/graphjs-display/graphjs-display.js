(async() => {
    const $nodes = Symbol("nodes");
    const $links = Symbol("links");
    try {
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
                for (const[node, circle] of this[$nodes]) {
                    circle.cx.baseVal.value = node.x || 0;
                    circle.cy.baseVal.value = node.y || 0;
                    circle.r.baseVal.value = node.radius || 0;
                }
                for (const[link, path] of this[$links]) {
                    path.setAttribute("d", this._calcPath(link));
                }
            }
            _calcPath(link) {
                return this.constructor.calcPath(link);
            }
            static calcPath({source, target}) {
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
        // uri relative to app.html
        const response = await fetch("../elements/graphjs-display/graphjs-display.css");
        const css = await response.text();
        document.registerElement("graphjs-display", GraphjsDisplay);
    } catch (e) {
        console.error(e);
    }
})();