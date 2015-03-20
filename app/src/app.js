Promise.all(["bin/graph.m.c", "app/bin/2d3.m.c"].map(name => System.import(name))).then(([graphjs, _2d3]) => {
    console.log("init");
    const svg = document.querySelector("svg");
    window.graph = new graphjs.Tree(true);
    const length = 1000;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length * 2; ++i) graph.addEdge(i % length, Math.floor(Math.random() * length));
    window.d3svg = new _2d3.D3SVG(svg, graph);
}).catch(e => {
    console.error(e);
});