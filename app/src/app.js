Promise.all(["bin/graph.c", "app/2d3.c"].map(name => System.import(name))).then(([graphjs, _2d3]) => {
    const svg = document.querySelector("svg");
    window.graph = new graphjs.Tree(true);
    const length = 100;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length * 2; ++i) graph.addEdge(i % length, Math.floor(Math.random() * length));
    window.d3svg = new _2d3.D3SVG(svg, graph);
})["catch"](e => {
    console.error(e);
});