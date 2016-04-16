define(["../../lib/graph.js"], function (_graph) {
    "use strict";

    const graph = new _graph.Graph();
    for (let i = 0; i < 20; ++i) {
        graph.addNode({
            x: Math.random() * 500,
            y: Math.random() * 500,
            radius: 10
        });
    }
    const nodes = Array.from(graph.nodes.keys());
    for (let i = 0; i < 10; ++i) {
        graph.addEdge(nodes[Math.floor(Math.random() * nodes.length)], nodes[Math.floor(Math.random() * nodes.length)]);
    }
    if (window.Polymer) initialize();else addEventListener("WebComponentsReady", initialize);

    function initialize() {
        const display = document.querySelector("graphjs-display");
        window.display = display;
        display.graph = graph;
        const d3_force = document.querySelector("d3-force");
        window.d3_force = d3_force;
        d3_force.start = true;
        d3_force.send();
    }
});
