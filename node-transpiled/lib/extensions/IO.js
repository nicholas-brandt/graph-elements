"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _graph = require("../graph");

var _circularJson = require("../../node_modules/circular-json/build/circular-json");

var _circularJson2 = _interopRequireDefault(_circularJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IO {
    /**
     * @function importObject
     * @param {Object} object - Object from which a graph is created
     * @return {Graph} - A graph which represents the given {object}.
     * */
    static importObject(object) {
        if ((typeof object === "undefined" ? "undefined" : _typeof(object)) != "object") throw Error("Argument is not an object!");
        var graph = new _graph.Graph(true);
        serialize(object, graph);
        return graph;
    }
    /**
     * @function exportGraph
     * @param {Graph} graph - Graph to be exported.
     * @return {Object} - A Object that contains the graph's nodes and edges.
     * */
    static exportGraph(graph) {
        var object = {
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
    static migrateGraph(source) {
        var target = arguments.length <= 1 || arguments[1] === undefined ? new _graph.Graph() : arguments[1];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = source.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ref = _step.value;

                var _ref2 = _slicedToArray(_ref, 2);

                var node = _ref2[0];
                var property_object = _ref2[1];

                target.addNode(node);
                mixin(target.nodes.get(node), property_object, mixin.SAFE_OVERRIDE);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = source.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var edge = _step2.value;
                target.addEdge(edge.source, edge.target, edge.weight);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

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
    if ((typeof object === "undefined" ? "undefined" : _typeof(object)) == "object") for (var property in object) {
        try {
            var value = object[property];
            if (!graph.hasNode(value)) serialize(value, graph);
            graph.addEdge(object, value);
        } catch (e) {}
    }
}
