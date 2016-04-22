import Graph from "../../lib/graph.js";
import ConditionedGraph from "../../lib/conditioned-graph.js";

const graph = new class HybridGraph extends ConditionedGraph {
    preCondition(source, target) {
        return this.get(target).in < 3 && this.get(source).out < 3;
    }
    postCondition() {
        return this.getMaximalCycleLength() <= 6;
    }
};
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
if (window.Polymer) initialize();
else addEventListener("WebComponentsReady", initialize);

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

window.Graph = Graph;
//window.AcyclicGraph = AcyclicGraph;