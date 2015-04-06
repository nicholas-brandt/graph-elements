define([ "exports", "../graph.c", "../extensions/2d3.c" ], function(exports, _graphC, _extensions2d3C) {
    "use strict";
    var Graph = _graphC.Graph;
    var AcyclicGraph = _graphC.AcyclicGraph;
    var Tree = _graphC.Tree;
    var D3SVG = _extensions2d3C.D3SVG;
    {
        var _iteratorNormalCompletion;
        var _didIteratorError;
        var _iteratorError;
        var _iterator, _step;
        (function() {
            var log = function(event) {
                console.log(event.type);
            };
            var svg = document.querySelector("svg");
            var load = svg.querySelector("#load");
            window.graph = new Tree(true);
            var size = 200;
            for (var i = 0; i < size; ++i) {
                graph.addNode(i);
            }
            for (var i = 0; i < size * 2.05; ++i) {
                graph.addEdge(i % size, Math.floor(Math.random() * size));
            }
            window.d3svg = new D3SVG(svg, graph, {
                drawing:false,
                size:{
                    resizing:false
                }
            });
            var force = d3svg.force;
            force.start();
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
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            try {
                for (_iterator = [ "pinch", "up", "down", "track", "trackstart", "trackend", "tap", "hold", "holdpulse", "release" ][Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var v = _step.value;
                    PolymerGestures.addEventListener(svg, v, log);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        })();
    }
});