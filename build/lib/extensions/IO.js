define(["exports", "../graph", "../../node_modules/circular-json/build/circular-json"], function (exports, _graph, _circularJson) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _circularJson2 = _interopRequireDefault(_circularJson);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    class IO {
        /**
         * @function importObject
         * @param {Object} object - Object from which a graph is created
         * @return {Graph} - A graph which represents the given {object}.
         * */
        static importObject(object) {
            if (typeof object != "object") throw Error("Argument is not an object!");
            const graph = new _graph.Graph(true);
            serialize(object, graph);
            return graph;
        }
        /**
         * @function exportGraph
         * @param {Graph} graph - Graph to be exported.
         * @return {Object} - A Object that contains the graph's nodes and edges.
         * */
        static exportGraph(graph) {
            const object = {
                nodes: Array.from(graph.nodes),
                edges: Array.from(graph.edges)
            };
            return object;
        }
        /**
         * @function migrateGraph
         * @param {Graph} source - A source graph from which the nodes and edges shall be migrated.
         * @param {Graph} target - A target graph in which the nodes and edges shall be migrated.
         * @return {Graph} - The target graph.
         * */
        static migrateGraph(source, target = new _graph.Graph()) {
            for (let [node, property_object] of source.nodes) {
                target.addNode(node);
                mixin(target.nodes.get(node), property_object, mixin.SAFE_OVERRIDE);
            }
            for (let edge of source.edges) target.addEdge(edge.source, edge.target, edge.weight);
            return target;
        }
        /**
         * @function serialize
         * @param {Graph} graph - The graph to be serialize by CircularJSON.
         * @return {string} - The serialization of the graph.
         * */
        static serialize(graph) {
            return _circularJson2.default.stringify(IO.exportGraph(graph));
        }
        /**
         * @function deserialize
         * @param {string} string - The serialization of the graph.
         * @return {Graph} - The graph of the serialization by CircularJSON.
         * */
        static deserialize(string) {
            return IO.migrateGraph(_circularJson2.default.parse(string));
        }
    }

    exports.default = IO;
    function serialize(object, graph) {
        graph.addNode(object);
        if (typeof object == "object") for (let property in object) try {
            const value = object[property];
            if (!graph.hasNode(value)) serialize(value, graph);
            graph.addEdge(object, value);
        } catch (e) {}
    }
});
