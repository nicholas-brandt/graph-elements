define([ "exports", "../graph" ], function(exports, _graph) {
    "use strict";
    exports.importJSON = importJSON;
    exports.importObject = importObject;
    Object.defineProperty(exports, "__esModule", {
        value:true
    });
    var Graph = _graph.Graph;
    var Tree = _graph.Tree;
    function importJSON(object) {
        if (typeof object == "string") object = JSON.parse(object);
        var tree = new Tree(true);
        addToTree({
            value:object
        }, tree);
        return tree;
    }
    function addToTree(host_node, tree) {
        tree.addNode(host_node);
        if (typeof host_node.value == "object") for (var key in host_node.value) {
            var child_node = {
                value:host_node.value[key]
            };
            addToTree(child_node, tree);
            tree.addEdge(host_node, child_node);
        }
    }
    function importObject(object) {
        if (typeof object != "object") throw Error("Not an object!");
        var graph = new Graph(true);
        serialize(object, graph);
        return graph;
    }
    function serialize(object, graph) {
        graph.addNode(object);
        for (var property in object) {
            if (!graph.hasNode(property)) serialize(property, graph);
            graph.addEdge(object, property);
        }
    }
});