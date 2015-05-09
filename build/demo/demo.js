define([ "exports", "../graph", "2d3" ], function(exports, _graph, _d3) {
    "use strict";
    var Graph = _graph.Graph;
    var AcyclicGraph = _graph.AcyclicGraph;
    var Tree = _graph.Tree;
    var D3SVG = _d3.D3SVG;
    var svg = document.querySelector("svg");
    svg.addEventListener("wheel", function(_ref) {
        var wheelDelta = _ref.wheelDelta;
        console.log(wheelDelta);
        d3svg.ratio += Math.pow(wheelDelta / 200, 1);
        d3svg.resize();
    });
    var load = svg.querySelector("#load");
    window.graph = new AcyclicGraph(false);
    var size = 200;
    for (var i = 0; i < size; ++i) {
        graph.addNode(i);
    }
    for (var i = 0; i < size * 1.05; ++i) {
        graph.addEdge(i % size, Math.floor(Math.random() * size));
    }
    window.d3svg = new D3SVG(svg, graph, {
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
        svg.removeChild(load);
        d3svg.drawing = true;
        d3svg.resizing = true;
        d3svg.resize();
        force.linkStrength = 1;
        force.resume();
    }, 1300);
    addEventListener("resize", function(event) {
        d3svg.resize();
    });
    function log(event) {
        console.log(event.type);
    }
});