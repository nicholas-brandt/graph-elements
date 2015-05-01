define([ "exports", "../graph", "../extensions/IO", "../extensions/2d3" ], function(exports, _graph, _extensionsIO, _extensions2d3) {
    "use strict";
    var Graph = _graph.Graph;
    var AcyclicGraph = _graph.AcyclicGraph;
    var Tree = _graph.Tree;
    var IO = _extensionsIO.IO;
    var D3SVG = _extensions2d3.D3SVG;
    var svg = document.querySelector("svg");
    var graph = loadGraph();
    var d3svg = new D3SVG(svg, graph, {
        drawing:false,
        size:{
            resizing:false
        }
    });
    var force = d3svg.force;
    setTimeout(function() {
        svg.classList.add("resolved");
    }, 500);
    setTimeout(function() {
        svg.removeChild(svg.querySelector("#load"));
        d3svg.drawing = true;
        d3svg.resizing = true;
        d3svg.resize();
        force.linkStrength = 1;
        force.resume();
    }, 1300);
    addEventListener("resize", function(event) {
        d3svg.resize();
    });
    function loadGraph() {
        try {
            return IO.deserialize(localStorage.getItem("graph"));
        } catch (e) {
            return new Graph();
        }
    }
    window.graph = graph;
    window.d3svg = d3svg;
    window.Graph = Graph;
    window.AcyclicGraph = AcyclicGraph;
    window.Tree = Tree;
    window.IO = IO;
});