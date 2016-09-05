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
        require(["../../lib/polymer/Gestures.js", "../../lib/jamtis/requestAnimationFunction.js", "../../lib/early-element/early-element.js"], (...args) => resolve(args));
    });
    const style_ready = (async () => {
        const style = document.createElement("style");
        style.textContent = await (await fetch(document.currentScript.src + "/../graphjs-display.css")).text();
        return style;
    })();
    const [{
        default: Gestures
    }, {
        default: requestAnimationFunction
    }, {
        default: EarlyElement
    }] = await dependencies_ready;
    const __private = {};
    class GraphjsDisplay extends EarlyElement {
        createdCallback() {
            const _private = {
                circles: new Map,
                paths: new Map,
                updatedNodes: new Set
            };
            Object.defineProperties(this, {
                private: {
                    value: new WeakMap
                },
                root: {
                    value: this.attachShadow({
                        mode: "open"
                    }),
                    enumerable: true
                },
                detailView: {
                    set(detail_view) {
                        const _detail_view = _private.detailView;
                        // assign new detail-view
                        _private.detail_view = detail_view;
                        detail_view.id = "detail-view";
                        // add gesture listener to new detail-view
                        Gestures.add(detail_view, "tap", this.constructor._detailViewTap);
                        // detail_view.addEventListener("tap", this._detailViewTap);
                        if (_detail_view) {
                            // from gesture listener from old detail-view
                            Gestures.remove(_detail_view, "tap", this.constructor._detailViewTap);
                            this.root.replaceChild(detail_view, _detail_view);
                        } else {
                            this.root.appendChild(detail_view);
                        }
                    },
                    get() {
                        return _private.detail_view;
                    },
                    enumerable: true
                },
                svg: {
                    value: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
                    enumerable: true
                },
                // requestAnimationFunctions must be per-instance to avoid global interference
                _updateGraph: {
                    value: requestAnimationFunction(() => {
                        let updated_circles;
                        let updated_paths;
                        if (_private.updatedNodes && _private.updatedNodes.size !== _private.graph.size) {
                            // console.log("partial update");
                            updated_circles = new Map;
                            updated_paths = new Map;
                            const links = new Set;
                            for (const node of _private.updatedNodes) {
                                // list links
                                const relations = _private.graph.get(node);
                                for (const [, link] of relations.sources) {
                                    links.add(link);
                                }
                                for (const [, link] of relations.targets) {
                                    links.add(link);
                                }
                                updated_circles.set(node, _private.circles.get(node));
                            }
                            for (const link of links) {
                                updated_paths.set(link, _private.paths.get(link));
                            }
                            _private.updatedNodes.clear();
                        } else {
                            // console.log("full update");
                            updated_circles = _private.circles;
                            updated_paths = _private.paths;
                            _private.updatedNodes = new Set;
                        }
                        for (const [{x, y, radius}, circle] of updated_circles) {
                            circle.cx.baseVal.value = x;
                            circle.cy.baseVal.value = y;
                            circle.r.baseVal.value = radius;
                        }
                        for (const [link, path] of updated_paths) {
                            path.setAttribute("d", this.constructor.calcPath(link));
                        }
                    }),
                    configurable: true,
                    writable: true
                }
            });
            this.private.set(__private, _private);
            (async () => {
                const style = await style_ready;
                this.root.appendChild(style.cloneNode(true)); 
            })();
            Object.assign(this.svg.viewBox.baseVal, {
                x: -1000,
                y: -1000,
                width: 2000,
                height: 2000
            });
            this.root.appendChild(this.svg);
            // check for assignments before registration
            this.adoptProperties();
            // default detail-view
            if (!this.detailView) {
                this.detailView = this.querySelector("#detail-view") || document.createElement("graphjs-detail-view");
            }
            // fire update-event
            this.dispatchEvent(new CustomEvent("update"));
        }
        updateGraph(nodes) {
            const _private = this.private.get(__private);
            if (nodes === undefined) {
                _private.updatedNodes = null;
            } else if (_private.updatedNodes) {
                // accumulate nodes
                for (const node of nodes) {
                    _private.updatedNodes.add(node);
                }
            }
            this._updateGraph();
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
                Object.defineProperties(path, {
                    __link: {
                        value: link
                    },
                    __host: {
                        value: this
                    }
                });
                _private.paths.set(link, path);
                this.svg.appendChild(path);
            }
            for (const [node] of graph) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                Object.defineProperties(circle, {
                    __node: {
                        value: node
                    },
                    __host: {
                        value: this
                    }
                });
                _private.circles.set(node, circle);
                this.svg.appendChild(circle);
                // add gestures
                Gestures.add(circle, "tap", this.constructor._tap);
                Gestures.add(circle, "track", this.constructor._track);
            }
            this.updateGraph();
        }
        calcPath(link) {
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
        /*
         * Called on tap-event.
         * */
        static _detailViewTap() {
            this.classList.remove("visible");
            this.parentNode.host.svg.style.transform = "";
        }
        /*
         * Called on tap-event.
         * */
        static _tap(event) {
            // console.log("tap event", event);
            const graphjsDisplay = this.__host;
            const svg = graphjsDisplay.svg;
            const {width: svg_width, height: svg_height, x, y} = svg.viewBox.baseVal;
            // compute layout
            const {width, height} = graphjsDisplay.getBoundingClientRect();
            const min = Math.min(width, height);
            // compute layout
            const {strokeWidth} = getComputedStyle(this);
            // modify layout
            graphjsDisplay.detailView.classList.add("visible");
            Object.assign(svg.style, {
                transform: `scale(${Math.max(svg_width, svg_height) / (this.r.baseVal.value - parseFloat(strokeWidth)) * 2})`,
                transformOrigin: `${(this.cx.baseVal.value * min - x * width) / svg_width}px ${(this.cy.baseVal.value * min - y * height) / svg_height}px`
            });
        }
        /*
         * Called on track-event.
         * */
        static _track(event) {
            // console.log("track event", event);
            const circle = this;
            const node = circle.__node;
            node.x += event.detail.ddx || 0;
            node.y += event.detail.ddy || 0;
            // paint tracked node
            const graphjsDisplay = circle.__host;
            graphjsDisplay.updateGraph([node]);
        }
    };
    document.registerElement("graphjs-display", GraphjsDisplay);
})();