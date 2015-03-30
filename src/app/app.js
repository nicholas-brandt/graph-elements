import { Graph, AcyclicGraph, Tree } from "../graph.c";
import { D3SVG } from "../extensions/2d3.c";
{
    const svg = document.querySelector("svg");
    //window.graph = new Graph(true);
    window.graph = new AcyclicGraph(true);
    //window.graph = new Tree();
    const size = 200;
    for (let i = 0; i < size; ++i) graph.addNode(i);
    for (let i = 0; i < size * 1.05; ++i) graph.addEdge(i % size, Math.floor(Math.random() * size));
    window.d3svg = new D3SVG(svg, graph);
    d3svg.drawing = false;
    // setting up the layout
    const force = d3svg.force;
    force.charge(-200);
    force.linkDistance(18);
    force.linkStrength(2.5);
    force.gravity(0.15);
    force.start();
    setTimeout(() => {
        d3svg.drawing = true;
        svg.classList.add("resolved");
        force.resume();
    }, 2000);
    addEventListener("resize", event => {
        d3svg.resize();
    });
}