define([ "exports", "../graph" ], function(exports, _graph) {
    "use strict";
    exports.importJSON = importJSON;
    Object.defineProperty(exports, "__esModule", {
        value:true
    });
    var Tree = _graph.Tree;
    function importJSON(object) {
        if (typeof object == "string") object = JSON.parse(object);
        var tree = new Tree(true);
        add({
            value:object
        }, tree);
        return tree;
    }
    function add(host_node, tree) {
        tree.addNode(host_node);
        if (typeof host_node.value == "object") for (var key in host_node.value) {
            var child_node = {
                value:host_node.value[key]
            };
            add(child_node, tree);
            tree.addEdge(host_node, child_node);
        }
    }
});