define(["exports", "module", "../graph", "../../external/circular-json.amd"], function (exports, module, _graph, _externalCircularJsonAmd) {
    "use strict";

    var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    var Graph = _graph.Graph;

    var CircularJSON = _interopRequire(_externalCircularJsonAmd);

    var IO = (function () {
        function IO() {
            _classCallCheck(this, IO);
        }

        _createClass(IO, null, {
            importObject: {
                /**
                 * @function importObject
                 * @param {Object} object - Object from which a graph is created
                 * @return {Graph} - A graph which represents the given {object}.
                 * */

                value: function importObject(object) {
                    if (typeof object != "object") throw Error("Argument is not an object!");
                    var graph = new Graph(true);
                    serialize(object, graph);
                    return graph;
                }
            },
            exportGraph: {
                /**
                 * @function exportGraph
                 * @param {Graph} graph - Graph to be exported.
                 * @return {Object} - A Object that contains the graph's nodes and edges.
                 * */

                value: function exportGraph(graph) {
                    var object = {
                        nodes: (function () {
                            var _nodes = [];
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = graph.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var pair = _step.value;

                                    _nodes.push(pair);
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

                            return _nodes;
                        })(),
                        edges: (function () {
                            var _edges = [];
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = graph.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var edge = _step.value;

                                    _edges.push(edge);
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

                            return _edges;
                        })()
                    };
                    return object;
                }
            },
            migrateGraph: {
                /**
                 * @function migrateGraph
                 * @param {Graph} source - A source graph from which the nodes and edges shall be migrated.
                 * @param {Graph} target - A target graph in which the nodes and edges shall be migrated.
                 * @return {Graph} - The target graph.
                 * */

                value: function migrateGraph(source) {
                    var target = arguments[1] === undefined ? new Graph() : arguments[1];
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = source.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _step$value = _slicedToArray(_step.value, 1);

                            var node = _step$value[0];
                            target.addNode(node);
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
                            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                _iterator2["return"]();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    return target;
                }
            },
            serialize: {
                /**
                 * @function serialize
                 * @param {Graph} graph - The graph to be serialize by CircularJSON.
                 * @return {string} - The serialization of the graph.
                 * */

                value: function serialize(graph) {
                    return CircularJSON.stringify(IO.exportGraph(graph));
                }
            },
            deserialize: {
                /**
                 * @function deserialize
                 * @param {string} string - The serialization of the graph.
                 * @return {Graph} - The graph of the serialization by CircularJSON.
                 * */

                value: function deserialize(string) {
                    return IO.migrateGraph(CircularJSON.parse(string));
                }
            }
        });

        return IO;
    })();

    module.exports = IO;

    function serialize(object, graph) {
        graph.addNode(object);
        if (typeof object == "object") for (var property in object) {
            try {
                var value = object[property];
                if (!graph.hasNode(value)) serialize(value, graph);
                graph.addEdge(object, value);
            } catch (e) {}
        }
    }
});