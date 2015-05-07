define([ "exports", "../graph", "../extensions/IO", "../external/mixin", "../external/storage" ], function(exports, _graph, _extensionsIO, _externalMixin, _externalStorage) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    var Graph = _graph.Graph;
    var AcyclicGraph = _graph.AcyclicGraph;
    var Tree = _graph.Tree;
    var IO = _interopRequire(_extensionsIO);
    var mixin = _interopRequire(_externalMixin);
    var storage = _interopRequire(_externalStorage);
    window.Graph = Graph;
    window.AcyclicGraph = AcyclicGraph;
    window.Tree = Tree;
    window.IO = IO;
    {
        (function() {
            var saveGraph = function() {
                localStorage.graph = IO.serialize(tezcatlipoca.graph);
            };
            var graph = undefined;
            try {
                graph = IO.deserialize(localStorage.graph);
                document.querySelector("paper-toast#graph-loaded").show();
            } catch (e) {
                console.error(e);
                graph = new Graph();
            }
            var tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
            tezcatlipoca.graph = graph;
            PolymerGestures.addEventListener(document.querySelector("paper-button#save-graph"), "tap", function() {
                saveGraph();
                document.querySelector("paper-toast#graph-saved").show();
            });
            var node_id = document.querySelector("#node-id");
            tezcatlipoca.addEventListener("select", function(_ref) {
                var _ref$detail = _ref.detail;
                var node = _ref$detail.node;
                var datum = _ref$detail.datum;
                node_id.value = datum.value;
                config.selected = datum.value;
            });
            tezcatlipoca.addEventListener("deselect", function() {
                node_id.value = "";
                config.selected = null;
            });
            var force_layout_checkbox = document.querySelector("#force-layout>paper-checkbox");
            force_layout_checkbox.onchange = function(event) {
                console.log("force-layout change", force_layout_checkbox.checked);
                event.bubbles = false;
                config.force_layout = tezcatlipoca.options.force.enabled = force_layout_checkbox.checked;
            };
            var config = storage("config", {
                force_layout:true,
                selected:undefined
            });
            force_layout_checkbox.checked = config.force_layout;
            force_layout_checkbox.onchange({});
            tezcatlipoca.selectNode(config.selected);
            window.tezcatlipoca = tezcatlipoca;
            window.graph = graph;
        })();
    }
});