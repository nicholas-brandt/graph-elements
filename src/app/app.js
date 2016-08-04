import Graph from "../lib/graph.js";
import D3Force from "../lib/d3-force/d3-force.js";

const graph = new Graph;
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
(async () => {
    const display = document.querySelector("graphjs-display");
    window.display = display;
    display.graph = graph;
    
    const d3_force = new D3Force;
    d3_force.graph = graph;
    window.d3_force = d3_force;
    while (true) {
        await d3_force.tick();
        console.log("ticked");
        display.updateGraph();
    }
})();

window.Graph = Graph;
//window.AcyclicGraph = AcyclicGraph;