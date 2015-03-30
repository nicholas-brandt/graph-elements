define([ "exports", "../graph.c", "../extensions/2d3.c" ], function(exports, _graphC, _extensions2d3C) {
    "use strict";
    var Graph = _graphC.Graph;
    var AcyclicGraph = _graphC.AcyclicGraph;
    var Tree = _graphC.Tree;
    var D3SVG = _extensions2d3C.D3SVG;
    {
        (function() {
            var svg = document.querySelector("svg");
            window.graph = new AcyclicGraph(true);
            var size = 200;
            for (var i = 0; i < size; ++i) {
                graph.addNode(i);
            }
            for (var i = 0; i < size * 1.05; ++i) {
                graph.addEdge(i % size, Math.floor(Math.random() * size));
            }
            window.d3svg = new D3SVG(svg, graph);
            d3svg.drawing = false;
            var force = d3svg.force;
            force.charge(-200);
            force.linkDistance(18);
            force.linkStrength(2.5);
            force.gravity(.15);
            force.start();
            setTimeout(function() {
                d3svg.drawing = true;
                svg.classList.add("resolved");
                force.resume();
            }, 2e3);
            addEventListener("resize", function(event) {
                d3svg.resize();
            });
        })();
    }
});