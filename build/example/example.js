import Graph from "https://cdn.jsdelivr.net/gh/mhelvens/graph.js/dist/graph.es6.js";

window.Graph = Graph;
const graph = new Graph();
/*
graph.addVertex(0);
graph.addVertex(1);
graph.addEdge(0, 1);
const n = 5e2;
for (let i = 2; i < n; ++i) {
    graph.addVertex(i, {
        x: Math.random() * 600 - 300,
        y: Math.random() * 600 - 300
    });
}
 // for(let i = 0; i < 3e2; ++i) graph.addEdge(Math.floor(Math.random() * 100), Math.floor(Math.random() * 100));
for (let i = 0, a; i < 2 * n; ++i) {
    graph.addEdge(a = Math.floor(Math.random() * i) % n, Math.floor(Math.random() * n) % (a + 1));
    // graph.addEdge(i % n, (i + 1) % n);
}
*/
window.graph = graph;
console.log(graph);
(async () => {
    await customElements.whenDefined("graph-display");
    const graphDisplay = document.querySelector("graph-display");
    graphDisplay.graph = graph;
    window.graphDisplay = graphDisplay;
})();