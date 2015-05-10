define([ "exports", "../graph", "../extensions/IO", "../external/mixin", "../external/storage", "../external/requestAnimationFunction", "../../external/circular-json.amd" ], function(exports, _graph, _extensionsIO, _externalMixin, _externalStorage, _externalRequestAnimationFunction, _externalCircularJsonAmd) {
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
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var CircularJSON = _interopRequire(_externalCircularJsonAmd);
    var tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
    window.Graph = Graph;
    window.AcyclicGraph = AcyclicGraph;
    window.Tree = Tree;
    window.IO = IO;
    window.tezcatlipoca = tezcatlipoca;
    tezcatlipoca.addEventListener("configchange", function() {
        localStorage.config = CircularJSON.stringify(tezcatlipoca.config);
    });
    tezcatlipoca.proxyHandler = {
        d3:{
            force:{
                enabled:function(_enabled) {
                    var _enabledWrapper = function enabled(_x) {
                        return _enabled.apply(this, arguments);
                    };
                    _enabledWrapper.toString = function() {
                        return _enabled.toString();
                    };
                    return _enabledWrapper;
                }(function(enabled) {
                    force.checked = enabled;
                })
            }
        },
        state:{
            selected:function(_selected) {
                var _selectedWrapper = function selected(_x) {
                    return _selected.apply(this, arguments);
                };
                _selectedWrapper.toString = function() {
                    return _selected.toString();
                };
                return _selectedWrapper;
            }(function(selected) {
                node_id.value = isNaN(selected) ? "" :selected;
            })
        }
    };
    {
        var saveGraph = requestAnimationFunction(function() {
            console.log("save graph");
            localStorage.graph = IO.serialize(tezcatlipoca.graph);
        });
        tezcatlipoca.addEventListener("graphchange", saveGraph);
    }
    var node_id = document.querySelector("#node-id");
    var graph_saved = document.querySelector("paper-toast#graph-saved");
    var force = document.querySelector("#force-layout>paper-checkbox");
    force.addEventListener("change", function() {
        tezcatlipoca.config.d3.force.enabled = force.checked;
    });
    {
        var graph = undefined;
        try {
            graph = IO.deserialize(localStorage.graph);
            document.querySelector("paper-toast#graph-loaded").show();
        } catch (e) {
            console.error(e);
        }
        console.log("apply graph");
        tezcatlipoca.graph = graph;
        window.graph = graph;
    }
    try {
        mixin(tezcatlipoca.config, CircularJSON.parse(localStorage.config), mixin.OVERRIDE);
    } catch (e) {
        console.error(e);
    }
});