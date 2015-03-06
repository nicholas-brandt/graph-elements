"use strict";
System.import("graph.c").then(function(graphjs) {
    window.graphjs = graphjs;
    console.log("graphjs loaded");
    console.log("length: " + length);
    for (let name of["Graph", "AcyclicGraph", "Tree"]) {
        for (let edges of edge_array) {
            const graph = new graphjs[name];
            const dgraph = new graphjs[name](true);
            applyModel(graph, edges, name, edges.density);
            applyModel(dgraph, edges, name, edges.density);
        }
    }
})["catch"](function(e) {
    console.error(e);
});

function applyModel(graph, edges, name, densitiy) {
    console.log("\n" + name + " | " + graph.directed + " | " + densitiy);
    console.time("init");
    for (let node of nodes) graph.addNode(node);
    for (let edge of edges) graph.addEdge(edge[0], edge[1]);
    console.timeEnd("init");
    console.time("Cycle check");
    console.log("Cycle: " + graph.hasCycle());
    console.timeEnd("Cycle check");
}
console.time("preparation");
const length = 50;
const nodes = [];
const edge_array = [];
const densities = [0, 0.01, 0.5, 1];
for (let i = 0; i < length; ++i) nodes.push(i);
for (let density of densities) {
    const edges = [];
    for (var i = 0; i < Math.pow(length, 2) * density; ++i) edges.push([Math.floor(Math.random() * length), Math.floor(Math.random() * length)]);
    edges.density = density;
    edge_array.push(edges);
}
//model.edges.push([0, 1], [1, 2], [2, 0]);
console.timeEnd("preparation");