import { Graph, AcyclicGraph, Tree } from "build/graph.m.c";
import { D3SVG } from "build/app/2d3.m.c";
import { requestAnimationFunction } from "build/app/requestAnimationFunction.m.c";
{
    console.log("init");
    const svg = document.querySelector("svg");
    window.graph = new graphjs.Graph(true);
    //window.graph = new graphjs.AcyclicGraph(true);
    //window.graph = new graphjs.Tree(true);
    const length = 200;
    for (let i = 0; i < length; ++i) graph.addNode(i);
    for (let i = 0; i < length * 0.8; ++i) graph.addEdge(i % length, Math.floor(Math.random() * length));
    window.d3svg = new _2d3.D3SVG(svg, graph);
    const force = d3svg.force;
    setTimeout(() => {
        force.friction(0.7);
    }, 200);
    setTimeout(() => {
       svg.classList.add("resolved"); 
    }, 700);
    setTimeout(() => {
        force.friction(0.9);
        force.gravity(0.08);
        force.charge(-200);
        force.alpha(0.25);
    }, 2000);
    /*setTimeout(() => {
        force.alpha(1);
    }, 6000);*/
    force.gravity(0.8);
    force.friction(0);
    force.linkDistance(5);
    force.theta(0.6);
    force.alpha(0.5);
    force.start();
    addEventListener("resize", (event) => {
        d3svg.resize();
    });
}