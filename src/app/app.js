import { Graph, AcyclicGraph, Tree } from "../graph.c";
import { D3SVG } from "../extensions/2d3.c";
{
    const svg = document.querySelector("svg");
    //window.graph = new Graph(true);
    window.graph = new AcyclicGraph();
    //window.graph = new Tree(true);
    const length = 200;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length * 2.8; ++i) graph.addEdge(i % length, Math.floor(Math.random() * length));
    window.d3svg = new D3SVG(svg, graph);
    const force = d3svg.force;
    setTimeout(() => {
        force.friction(0.7);
    }, 200);
    setTimeout(() => {
       svg.classList.add("resolved"); 
    }, 700);
    setTimeout(() => {
        force.friction(0.9);
        force.gravity(0.02);
        force.charge(-200);
        force.alpha(0.25);
    }, 2000);
    setTimeout(() => {
        force.gravity(0.04);
    }, 6500);
    force.gravity(0.8);
    force.friction(0);
    force.linkDistance(15);
    force.linkStrength(3);
    force.theta(0.9);
    force.alpha(0.5);
    force.start();
    addEventListener("resize", (event) => {
        d3svg.resize();
    });
}