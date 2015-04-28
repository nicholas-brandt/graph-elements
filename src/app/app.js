/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph, AcyclicGraph, Tree } from "../graph";
import { D3SVG } from "../extensions/2d3";
const svg = document.querySelector("svg");
const load = svg.querySelector("#load");
//window.graph = new Graph(true);
window.graph = new AcyclicGraph(false);
//window.graph = new Tree(true);
const size = 200;
for (let i = 0; i < size; ++i) graph.addNode(i);
for (let i = 0; i < size * 1.05; ++i) graph.addEdge(i % size, Math.floor(Math.random() * size));
window.d3svg = new D3SVG(svg, graph, {
    drawing: false,
    size: {
        resizing: false
    }
});
// setting up the layout
const force = d3svg.force;
setTimeout(() => {
    svg.classList.add("resolved");
}, 500);
setTimeout(() => {
    svg.removeChild(load);
    d3svg.drawing = true;
    d3svg.resizing = true;
    d3svg.resize();
    force.linkStrength = 1;
    force.resume();
}, 1300);
addEventListener("resize", event => {
    d3svg.resize();
});

function log(event) {
    console.log(event.type);
}
//for (let v of ["pinch", "up", "down", "track", "trackstart", "trackend", "tap", "hold", "holdpulse", "release"]) PolymerGestures.addEventListener(svg, v, log);