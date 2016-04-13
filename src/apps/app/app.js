import Graph from "../../lib/graph.js";

const graph = new Graph;
for (let i = 0; i < 10; ++i) {
    graph.addNode({
        x: Math.random() * 10,
        y: Math.random() * 10,
        radius: 1
    });
}
if (window.Polymer) initialize();
else addEventListener("WebComponentsReady", initialize);

function initialize() {
    window.display = document.querySelector("graphjs-display");
    display.graph = graph;
}