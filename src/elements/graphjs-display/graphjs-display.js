(async() => {
    "use strict";
    const require_ready = new Promise(resolve => {
        // require bootstrap
        if (window.require) {
            resolve();
        } else {
            const descriptor = Object.getOwnPropertyDescriptor(window, "require");
            const setter = descriptor && descriptor.set;
            Object.defineProperty(window, "require", {
                set(require) {
                    if (setter) {
                        setter(require);
                    } else {
                        delete window.require;
                        window.require = require;
                    }
                    setTimeout(resolve, 0);
                },
                configurable: true
            });
        }
    });
    const dependencies_ready = new Promise(async resolve => {
        await require_ready;
        require(["../../lib/polymer/Gestures.js", "../../lib/jamtis/requestAnimationFunction.js"], (...args) => resolve(args));
    });
    const fetchCSS = (async() => {
        return (await fetch(document.currentScript.src + "/../graphjs-display.css")).text();
    })();
    const STYLE_ELEMENT = document.createElement("style");
    STYLE_ELEMENT.textContent = await fetchCSS;
    const[{
        default: Gestures
    }, {
        default: requestAnimationFunction
    }] = await dependencies_ready;
    const __private = {};
    class GraphjsDisplay extends HTMLElement {
        createdCallback() {
            Object.defineProperties(this, {
                private: {
                    value: new WeakMap
                },
                root: {
                    value: this.createShadowRoot(),
                    enumerable: true
                },
                svg: {
                    value: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
                    enumerable: true
                }
            });
            this.private.set(__private, {
                circles: new Map,
                paths: new Map
            });
            this.root.appendChild(STYLE_ELEMENT.cloneNode(true));
            Object.assign(this.svg.viewBox.baseVal, {
                x: -1000,
                y: -1000,
                width: 2000,
                height: 2000
            });
            this.root.appendChild(this.svg);
            // check for assignments before registration
            if (this.graph) {
                const _graph = this.graph;
                // delete own graph property to use prototype property
                delete this.graph;
                this.graph = _graph;
            }
            // fire update-event
            this.dispatchEvent(new CustomEvent("update"));
        }
        set graph(graph) {
            this.svg.innerHTML = "";
            const _private = this.private.get(__private);
            _private.graph = graph;
            _private.circles.clear();
            _private.paths.clear();
            // console.log("set graph", graph);
            // append links before nodes
            for (const link of graph.links) {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.__reference = link;
                _private.paths.set(link, path);
                this.svg.appendChild(path);
            }
            for (const [node] of graph) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.__reference = node;
                _private.circles.set(node, circle);
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
            const node = circle.__reference;
            node.x = event.detail.ddx || 0;
            node.y = event.detail.ddy || 0;
            this.constructor._paintTrackedNode(node);
        }
        static _paintTrackedNode(node) {
            const relations = this.private.get(__private).graph.get(node);
            const links = new Set;
            for (const[, link] of relations.dependents) {
                links.add(link);
            }
            for (const[, link] of relations.dependencies) {
                links.add(link);
            }
            for (const link of links) {
                link.__path.setAttribute("d", this.constructor.calcPath(link));
            }
        }
    };
    Object.defineProperties(GraphjsDisplay.prototype, {
        updateGraph: {
            value: requestAnimationFunction(function() {
                const _private = this.private.get(__private);
                for (const[node, circle] of _private.circles) {
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
                for (const[link, path] of _private.paths) {
                    path.setAttribute("d", this.constructor.calcPath(link));
                }
            }),
            writable: true,
            configurable: true
        }
    });
    document.registerElement("graphjs-display", GraphjsDisplay);
})();