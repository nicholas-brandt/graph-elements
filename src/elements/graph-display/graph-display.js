"use strict";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-display/graph-display.css -->";
class GraphDisplay extends HTMLElement {
    constructor() {
        super();
        Object.defineProperties(this, {
            // elements
            svg: {
                value: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
                enumerable: true
            },
            circles: {
                value: new Map,
                enumerable: true
            },
            paths: {
                value: new Set,
                enumerable: true
            },
            // private properties
            __updatedNodeKeys: {
                value: new Set
            },
            __graph: {
                value: undefined,
                configurable: true,
                writable: true
            },
            // requestAnimationFunctions must be per-instance to avoid global interference
            _updateGraph: {
                value: requestAnimationFunction(this.__updateGraph.bind(this)),
                configurable: true,
                writable: true
            },
            __delta: {
                value: [0, 0],
                writable: true
            }
        });
        this.configuration = {
            radius: 10
        };
        new ResizeObserver(this.__resize.bind(this)).observe(this);
        this.attachShadow({
            mode: "open"
        })
        // add style
        this.shadowRoot.appendChild(style.cloneNode(true));
        this.shadowRoot.appendChild(this.svg);
        // migrate all children
        for (const child of this.children) {
            this.shadowRoot.appendChild(child);
        }
        // trigger init resize
        this.__resize();
    }
    updateGraph(node_keys) {
        if (!node_keys) {
            this.__updatedNodeKeys.clear();
        } else {
            // accumulate nodes
            for (const node_key of node_keys) {
                this.__updatedNodeKeys.add(node_key);
            }
        }
        this._updateGraph();
    }
    __updateGraph() {
        let updated_circles;
        let updated_paths;
        if (this.__updatedNodeKeys.size % this.graph.vertexCount()) {
            // gather updated circles from keys
            updated_circles = new Set;
            for (const updated_node_key of this.__updatedNodeKeys) {
                updated_circles.add(this.circles.get(updated_node_key));
            }
            // adapt paths of updated circles
            updated_paths = new Set;
            for (const path of this.paths) {
                if (updated_circles.has(path.__source) || updated_circles.has(path.__target)) {
                    updated_paths.add(path);
                }
            }
        } else {
            // console.log("full update");
            updated_circles = this.circles.values();
            updated_paths = this.paths;
        }
        for (const {x, y, radius, circle} of updated_circles) {
            circle.cx.baseVal.value = x;
            circle.cy.baseVal.value = y;
            circle.r.baseVal.value = radius || this.configuration.radius;
        }
        for (const path of updated_paths) {
            path.setAttribute("d", this.__calcPath(path));
        }
        this.__updatedNodeKeys.clear();
    }
    set graph(graph) {
        this.__graph = graph;
        // clear
        this.svg.innerHTML = "";
        this.circles.clear();
        this.paths.clear();
        for (let [key, value] of graph.vertices()) {
            if (!(value instanceof Object)) {
                value = {value};
                graph.setVertex(key, value);
            }
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            Object.defineProperties(circle, {
                __node: {
                    value: key
                },
                __host: {
                    value: this
                }
            });
            value.circle = circle;
            value.hammer = new Hammer(circle);
            value.x |= 0;
            value.y |= 0;
            // necessary to make circle.cx.baseVal.value += dx work ...
            circle.setAttribute("cx", value.x);
            circle.setAttribute("cy", value.y);
            
            value.hammer.on("pan", this.__track.bind(this, key, value));
            this.circles.set(key, value);
        }
        for (const [source_key, target_key] of graph.edges()) {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            Object.defineProperties(path, {
                __source: {
                    value: this.circles.get(source_key)
                },
                __target: {
                    value: this.circles.get(target_key)
                },
                __host: {
                    value: this
                }
            });
            this.paths.add(path);
            this.svg.appendChild(path);
        }
        for (const [key, {circle}] of this.circles) {
            this.svg.appendChild(circle);
        }
        this.updateGraph();
    }
    get graph() {
        return this.__graph;
    }
    __calcPath({__source: source, __target: target}) {
        /*if (link.nodes) {
            // undirected link
            const [source, target] = [...link.nodes];
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
            const {source, target} = link;*/
            if (source === target || source.x === target.x && source.y === target.y) {
                const short = (source.radius || this.configuration.radius) / 3;
                const long = (source.radius || this.configuration.radius) * 3;
                return `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`;
            } else {
                const x_diff = target.x - source.x;
                const y_diff = target.y - source.y;
                const r_diff = Math.hypot(x_diff, y_diff) / (target.radius || this.configuration.radius);
                const xr_diff = x_diff / r_diff;
                const yr_diff = y_diff / r_diff;
                const offset = 2;
                const m_x = target.x - xr_diff * offset;
                const m_y = target.y - yr_diff * offset;
                return `M ${source.x} ${source.y}L ${m_x} ${m_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m_x} ${m_y}`;
            }
        // }
    }
    /*
     * Called on track-event.
     * */
    __track(node_key, circle_object, event) {
        // console.log("track event", event);
        const circle = circle_object.circle;
        circle_object.x += (event.deltaX - this.__delta[0]) || 0;
        circle_object.y += (event.deltaY - this.__delta[1]) || 0;
        this.__delta = event.isFinal ? [0, 0] : [event.deltaX, event.deltaY];
        // paint tracked node
        this.updateGraph([node_key]);
    }
    __resize() {
        const {width, height} = this.svg.getBoundingClientRect();
        Object.assign(this.svg.viewBox.baseVal, {
            x: -width / 2,
            y: -height / 2,
            width,
            height
        });
    }
}
(async () => {
    if (!window.Hammer) {
        await new Promise(resolve => {
            Object.defineProperty(window, "Hammer", {
                set(value) {
                    delete window.Hammer;
                    window.Hammer = value;
                    setTimeout(resolve);
                }
            });
        });
    }
    customElements.define("graph-display", GraphDisplay);
})();