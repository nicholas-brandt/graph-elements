"use strict";
Promise.all(["bin/graph.c", "app/2d3.c"].map(name => System.import(name))).then(([graphjs, _2d3]) => {
    const svg = document.querySelector("svg");
    const graph = new graphjs.Graph(true);
    const length = 300;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length; ++i) graph.addEdge(i % length, (i+1)%length);
    const d3svg = new _2d3.D3SVG(svg, graph);
})["catch"](e => {
    console.error(e);
});