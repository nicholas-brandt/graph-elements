// import UndirectedGraph from "../lib/UndirectedGraph.js";
import AcyclicUndirectedGraph from "../lib/undirected/AcyclicUndirectedGraph.js";
import D3Force from "../lib/d3-force/d3-force.js";
import Gestures from "../lib/polymer/gestures.js";

const graph = new AcyclicUndirectedGraph;
window.graph = graph;
for (let i = 0; i < 100; ++i) {
    graph.addNode({
        x: Math.random() * 500,
        y: Math.random() * 500,
        radius: 10,
        index: i
    });
}
const nodes = Array.from(graph.keys());
for (let i = 0; i < 300; ++i) {
    graph.addLink(nodes[Math.floor(Math.random() * nodes.length)], nodes[Math.floor(Math.random() * nodes.length)]);
}
(async () => {
    const display = document.querySelector("graphjs-display");
    window.display = display;
    display.graph = graph;
    
    const d3_force = new D3Force;
    d3_force.configuration = {
        link: {
            distance: 80
        },
        charge: -70,
        alpha: 0,
        alphaTarget: 2
    };
    setTimeout(() => {
        d3_force.configuration = {
            alphaTarget: 0,
            charge: -50
        };
    }, 5000);
    d3_force.graph = graph;
    window.d3_force = d3_force;
    d3_force.start();
    while (true) {
        await d3_force.tick();
        console.log("ticked");
        display.updateGraph();
    }
})();