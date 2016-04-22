define(["../../lib/graph.js", "../../lib/conditioned-graph.js"], function (_graph, _conditionedGraph) {
    "use strict";

    var _graph2 = _interopRequireDefault(_graph);

    var _conditionedGraph2 = _interopRequireDefault(_conditionedGraph);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    const graph = new class HybridGraph extends _conditionedGraph2.default {
        preCondition(source, target) {
            return this.get(target).in < 3 && this.get(source).out < 3;
        }
        postCondition() {
            return this.getMaximalCycleLength() <= 6;
        }
    }();
    graph.maxCycleLength = 3;
    graph.maxOutLinks = 3;
    graph.maxInLinks = 3;
    for (let i = 0; i < 50; ++i) {
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
    if (window.Polymer) initialize();else addEventListener("WebComponentsReady", initialize);

    function initialize() {
        const display = document.querySelector("graphjs-display");
        window.display = display;
        display.graph = graph;
        const d3_force = document.querySelector("d3-force");
        window.d3_force = d3_force;
        d3_force.nodes = nodes;
        d3_force.links = Array.from(graph.links);
        d3_force.start = true;
        d3_force.send();
    }

    window.Graph = _graph2.default;
    //window.AcyclicGraph = AcyclicGraph;
});
