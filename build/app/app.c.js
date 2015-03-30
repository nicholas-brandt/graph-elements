define([ "exports", "../graph.c", "../extensions/2d3.c" ], function(exports, _graphC, _extensions2d3C) {
    "use strict";
    var Graph = _graphC.Graph;
    var AcyclicGraph = _graphC.AcyclicGraph;
    var Tree = _graphC.Tree;
    var D3SVG = _extensions2d3C.D3SVG;
    {
        (function() {
            var svg = document.querySelector("svg");
            window.graph = new AcyclicGraph();
            var length = 200;
            for (var i = 0; i < length; ++i) {
                graph.addNode(i);
            }
            for (var i = 0; i < length * 2.8; ++i) {
                graph.addEdge(i % length, Math.floor(Math.random() * length));
            }
            window.d3svg = new D3SVG(svg, graph);
            var force = d3svg.force;
            setTimeout(function() {
                force.friction(.7);
            }, 200);
            setTimeout(function() {
                svg.classList.add("resolved");
            }, 700);
            setTimeout(function() {
                force.friction(.9);
                force.gravity(.02);
                force.charge(-200);
                force.alpha(.25);
            }, 2e3);
            setTimeout(function() {
                force.gravity(.04);
            }, 6500);
            force.gravity(.8);
            force.friction(0);
            force.linkDistance(15);
            force.linkStrength(3);
            force.theta(.9);
            force.alpha(.5);
            force.start();
            addEventListener("resize", function(event) {
                d3svg.resize();
            });
        })();
    }
});