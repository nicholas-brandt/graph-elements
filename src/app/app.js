/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph, AcyclicGraph, Tree } from "../graph";
import IO from "../extensions/IO";
addEventListener("polymer-ready", function() {
    const graph = loadGraph();
    const tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
    tezcatlipoca.graph = graph;
    PolymerGestures.addEventListener(document.querySelector("paper-button#save-graph"), "tap", function saveGraph() {
        localStorage.setItem("graph", IO.serialize(tezcatlipoca.graph));
        document.querySelector("paper-toast#graph-saved").show();
    });
    //debugging
    window.tezcatlipoca = tezcatlipoca;
    window.graph = graph;
    window.Graph = Graph;
    window.AcyclicGraph = AcyclicGraph;
    window.Tree = Tree;
    window.IO = IO;
});

function loadGraph() {
    try {
        const graph = IO.deserialize(localStorage.getItem("graph"));
        document.querySelector("paper-toast#graph-loaded").show();
        return graph;
    } catch (e) {
        console.error(e);
    }
    return new Graph;
}