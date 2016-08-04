define(["../lib/graph.js", "../lib/d3-force/d3-force.js"], function (_graph, _d3Force) {
    "use strict";

    var _graph2 = _interopRequireDefault(_graph);

    var _d3Force2 = _interopRequireDefault(_d3Force);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

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

    const graph = new _graph2.default();
    for (let i = 0; i < 5; ++i) {
        graph.addNode({
            x: Math.random() * 500,
            y: Math.random() * 500,
            radius: 10,
            index: i
        });
    }
    const nodes = Array.from(graph.keys());
    for (let i = 0; i < 1000; ++i) {
        graph.addLink(nodes[Math.floor(Math.random() * nodes.length)], nodes[Math.floor(Math.random() * nodes.length)]);
    }
    _asyncToGenerator(function* () {
        const display = document.querySelector("graphjs-display");
        window.display = display;
        display.graph = graph;

        const d3_force = new _d3Force2.default();
        d3_force.graph = graph;
        window.d3_force = d3_force;
        while (true) {
            yield d3_force.tick();
            console.log("ticked");
            display.updateGraph();
        }
    })();

    window.Graph = _graph2.default;
    //window.AcyclicGraph = AcyclicGraph;
});