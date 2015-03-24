Promise.all(["build/graph.m.c", "build/app/2d3.m.c"].map(name => System.import(name))).then(([graphjs, _2d3]) => {
    console.log("init");
    const svg = document.querySelector("svg");
    window.graph = new graphjs.Tree(true);
    const length = 200;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length * 2; ++i) graph.addEdge(i % length, Math.floor(Math.random() * length));
    window.d3svg = new _2d3.D3SVG(svg, graph);
    const force = d3svg.force;
    setTimeout(() => {
        force.friction(0.2);
    }, 200);
    setTimeout(() => {
        force.friction(0.95);
    }, 700);
    setTimeout(() => {
        force.charge(-140);
        force.gravity(0.05);
        force.resume();
    }, 2000);
    force.gravity(0.18);
    force.friction(0);
    //force.linkDistance(5);
    force.start();
}).catch(e => {
    console.error(e);
});