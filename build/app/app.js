define([ "exports", "../graph", "../extensions/IO" ], function(exports, _graph, _extensionsIO) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    var Graph = _graph.Graph;
    var AcyclicGraph = _graph.AcyclicGraph;
    var Tree = _graph.Tree;
    var IO = _interopRequire(_extensionsIO);
    addEventListener("polymer-ready", function() {
        var graph = loadGraph();
        var tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
        tezcatlipoca.graph = graph;
        PolymerGestures.addEventListener(document.querySelector("paper-button#save-graph"), "tap", function saveGraph() {
            localStorage.setItem("graph", IO.serialize(tezcatlipoca.graph));
            document.querySelector("paper-toast#graph-saved").show();
        });
        window.graph = graph;
        window.Graph = Graph;
        window.AcyclicGraph = AcyclicGraph;
        window.Tree = Tree;
        window.IO = IO;
    });
    function loadGraph() {
        try {
            var graph = IO.deserialize(localStorage.getItem("graph"));
            document.querySelector("paper-toast#graph-loaded").show();
            return graph;
        } catch (e) {
            console.error(e);
        }
        return new Graph();
    }
});