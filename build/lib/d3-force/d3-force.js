define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _asyncToGenerator(fn) {
        return function () {
            var gen = fn.apply(this, arguments);
            return new Promise(function (resolve, reject) {
                function step(key, arg) {
                    try {
                        var info = gen[key](arg);
                        var value = info.value;
                    } catch (error) {
                        reject(error);
                        return;
                    }

                    if (info.done) {
                        resolve(value);
                    } else {
                        return Promise.resolve(value).then(function (value) {
                            return step("next", value);
                        }, function (err) {
                            return step("throw", err);
                        });
                    }
                }

                return step("next");
            });
        };
    }

    const $nodes = Symbol("nodes");
    const $updated = Symbol("updated");
    const $worker = Symbol("worker");
    const $tick_promise = Symbol("tick_promise");
    class D3Force {
        constructor() {
            {
                let resolve;
                const promise = new Promise(_resolve => {
                    resolve = _resolve;
                });
                this[$tick_promise] = {
                    promise,
                    resolve
                };
            }
            // uri relative to app.html
            const worker = new Worker("../elements/d3-force/d3-force-worker.js");
            this[$worker] = worker;
            worker.addEventListener("message", _ref => {
                let data = _ref.data;

                // skip old calculation results if updated
                if (!this[$updated]) {
                    let i = 0;
                    const nodes = this[$nodes];
                    for (const _ref2 of data.nodes) {
                        const x = _ref2.x;
                        const y = _ref2.y;

                        nodes[i].x = x;
                        nodes[i].y = y;
                    }
                    // replace old promise
                    const resolve = this[$tick_promise].resolve;

                    let _resolve;
                    const promise = new Promise(__resolve => {
                        _resolve = __resolve;
                    });
                    this[$tick_promise] = {
                        promise,
                        resolve: _resolve
                    };
                    // resolve old promise
                    resolve();
                }
                this[$updated] = false;
            });
        }
        set configuration(config) {
            this[$worker].postMessage({
                configuration: config
            });
        }
        set graph(graph) {
            if (this[$nodes]) {
                this[$updated] = true;
            }
            const nodes = Array.from(graph.keys());
            this[$nodes] = nodes;
            const links_string = JSON.stringify(Array.from(graph.links).map(_ref3 => {
                let source = _ref3.source;
                let target = _ref3.target;
                return [nodes.indexOf(source), nodes.indexOf(target)];
            }));
            const sanitized_nodes = this[$nodes].map(_ref4 => {
                let x = _ref4.x;
                let y = _ref4.y;
                return { x, y };
            });
            const nodes_string = JSON.stringify(sanitized_nodes);
            this[$worker].postMessage({
                graph: {
                    nodes: nodes_string,
                    links: links_string
                }
            });
        }
        start() {
            this[$worker].postMessage({
                run: true
            });
        }
        stop() {
            this[$worker].postMessage({
                run: false
            });
        }
        tick() {
            var _this = this;

            return _asyncToGenerator(function* () {
                yield _this[$tick_promise].promise;
            })();
        }
    }exports.default = D3Force;
    ;
});