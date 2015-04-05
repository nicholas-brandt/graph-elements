import { Graph, AcyclicGraph, Tree } from "../graph.c";
import { D3SVG } from "../extensions/2d3.c";
{
    const svg = document.querySelector("svg");
    svg.removeChild(svg.querySelector("#load"));
    //window.graph = new Graph(true);
    //window.graph = new AcyclicGraph();
    window.graph = new Tree(true);
    const size = 10;
    for (let i = 0; i < size; ++i) graph.addNode(i);
    for (let i = 0; i < size * 2.05; ++i) graph.addEdge(i % size, Math.floor(Math.random() * size));
    window.d3svg = new D3SVG(svg, graph);
    d3svg.drawing = false;
    // setting up the layout
    const force = d3svg.force;
    force.start();
    setTimeout(() => {
        d3svg.drawing = true;
        svg.classList.add("resolved");
        force.linkStrength = 1;
        force.resume();
    }, 2000);
    addEventListener("resize", event => {
        d3svg.resize(true);
    });
    d3svg.size = "auto";
}