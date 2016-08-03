"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

_asyncToGenerator(function* () {
    const $nodes = Symbol("nodes");
    const $links = Symbol("links");
    try {
        class GraphjsDisplay extends HTMLElement {
            createdCallback() {
                this[$nodes] = new Map();
                this[$links] = new Map();
                this.root = this.createShadowRoot();
                const style = document.createElement("style");
                style.textContent = css;
                this.root.appendChild(style);
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
                for (const _ref2 of graph) {
                    var _ref3 = _slicedToArray(_ref2, 1);

                    const node = _ref3[0];

                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.reference = node;
                    this[$nodes].set(node, circle);
                    this.svg.appendChild(circle);
                }
                this.updateGraph();
            }
            updateGraph() {
                for (const _ref4 of this[$nodes]) {
                    var _ref5 = _slicedToArray(_ref4, 2);

                    const node = _ref5[0];
                    const circle = _ref5[1];

                    circle.cx.baseVal.value = node.x || 0;
                    circle.cy.baseVal.value = node.y || 0;
                    circle.r.baseVal.value = node.radius || 0;
                }
                for (const _ref6 of this[$links]) {
                    var _ref7 = _slicedToArray(_ref6, 2);

                    const link = _ref7[0];
                    const path = _ref7[1];

                    path.setAttribute("d", __calcPath(link));
                }
            }
        };
        const response = yield fetch("../elements/graphjs-display.css");
        const css = yield response.text();
        document.registerElement("graphjs-display", GraphjsDisplay);
    } catch (e) {
        console.error(e);
    }
    function __calcPath(_ref8) {
        let source = _ref8.source;
        let target = _ref8.target;

        if (source === target) {
            const short = source.radius / 3;
            const long = source.radius * 3;
            return `M ${ source.x } ${ source.y }c ${ short } ${ long } ${ long } ${ short } 0 0`;
        } else {
            const x_diff = target.x - source.x;
            const y_diff = target.y - source.y;
            const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
            const xr_diff = x_diff / r_diff;
            const yr_diff = y_diff / r_diff;
            const offset = 2;
            const m_x = target.x - xr_diff * offset;
            const m_y = target.y - yr_diff * offset;
            return `M ${ source.x } ${ source.y }L ${ m_x } ${ m_y }L ${ target.x + yr_diff } ${ target.y - xr_diff }l ${ -2 * yr_diff } ${ 2 * xr_diff }L ${ m_x } ${ m_y }`;
        }
    }
})();