define(["exports"], function (exports) {
    "use strict";

    var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

    var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

    var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

    var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

    var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var $nodes = Symbol();
    var $dependencies = Symbol();
    var $dependents = Symbol();
    var $directed = Symbol();
    /**
     * @class
     * Fundamental class that implements the basic graph structures.
     * #Following https://en.wikipedia.org/wiki/Graph_theory
     * */

    var Graph = exports.Graph = (function () {
        /**
         * @constructor
         * @þaram {boolean} directed - Whether the graph is unidirectional.
         * */

        function Graph() {
            var directed = arguments[0] === undefined ? false : arguments[0];

            _classCallCheck(this, Graph);

            this[$nodes] = new Map();
            this.directed = !!directed;
        }

        _createClass(Graph, {
            directed: {
                /**
                 * @getter directed
                 * @returns {boolean} - Whether the graph is unidirectional.
                 * */

                get: function () {
                    return this[$directed];
                },

                /**
                 * @setter directed
                 * @param {boolean} directed - Whether the graph shall be unidirectional.
                 * */
                set: function (directed) {
                    this[$directed] = !!directed;
                    if (this.directed) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = this.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var edge = _step.value;
                                this.addEdge.apply(this, _toConsumableArray(edge));
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
                    }
                }
            },
            nodes: {
                /**
                 * @getter nodes
                 * @returns {Map} - A copy of the {nodes} map.
                 * */

                get: function () {
                    return new Map(this[$nodes]);
                }
            },
            edges: {
                /**
                 * @getter edges
                 * @returns {Array} - A array of all edges.
                 * */

                get: function () {
                    var _this = this;

                    return (function () {
                        var _ref = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _this[$nodes][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 2);

                                var node = _step$value[0];
                                var relations = _step$value[1];
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = relations.dependents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var _step2$value = _slicedToArray(_step2.value, 2);

                                        var dependent = _step2$value[0];
                                        var weight = _step2$value[1];

                                        _ref.push({
                                            source: node,
                                            target: dependent,
                                            weight: weight
                                        });
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

                        return _ref;
                    })();
                }
            },
            addNode: {
                /**
                 * @function addNode
                 * @param {any} object - An object to be set as a node.
                 * @returns {boolean} - {true} if the object has been set as a node
                 *                      {false} if the object was already a node in this graph. 
                 * */

                value: function addNode(object) {
                    if (this.hasNode(object)) {
                        return false;
                    } // {relations} to be stored in the {nodes} map
                    // stored as a double-linked list
                    var relations = Object.defineProperties({}, {
                        dependencies: {
                            get: function () {
                                return new Map(this[$dependencies]);
                            },
                            configurable: true,
                            enumerable: true
                        },
                        dependents: {
                            get: function () {
                                return new Map(this[$dependents]);
                            },
                            configurable: true,
                            enumerable: true
                        }
                    });
                    relations[$dependencies] = new Map();
                    relations[$dependents] = new Map();
                    this[$nodes].set(object, relations);
                    return true;
                }
            },
            hasNode: {
                /**
                 * @function hasNode
                 * @param {any} object
                 * @return {boolean} - Whether the object is a node in this graph.
                 * */

                value: function hasNode(object) {
                    return this[$nodes].has(object);
                }
            },
            removeNode: {
                /**
                 * @function removeNode
                 * @param {any} object - The node to be removed.
                 * @return {boolean} - Whether the object has been removed from the graph.
                 * */

                value: function removeNode(object) {
                    if (!this.hasNode(object)) {
                        return false;
                    }var relations = this[$nodes].get(object);
                    // remove {object} from nodes
                    this[$nodes]["delete"](object);
                    // remove all edges containing {object}
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = relations[$dependencies][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _step$value = _slicedToArray(_step.value, 2);

                            var dependents = _step$value[1];
                            dependents["delete"](object);
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
                        for (var _iterator2 = relations[$dependents][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _step2$value = _slicedToArray(_step2.value, 2);

                            var dependencies = _step2$value[1];
                            dependencies["delete"](object);
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

                    return true;
                }
            },
            addEdge: {
                /**
                 * @function addEdge
                 * @param {any} source - The source node
                 * @param {any} target - The target node
                 * @param {any} weight - The weight of the edge
                 * @return {boolean} - Whether the object has been removed from the graph.
                 * */

                value: function addEdge(source, target) {
                    var weight = arguments[2] === undefined ? 1 : arguments[2];

                    var nodes = this[$nodes];
                    if (nodes.has(source) && nodes.has(target)) {
                        nodes.get(source)[$dependents].set(target, weight);
                        nodes.get(target)[$dependencies].set(source, weight);
                        if (!this.directed) {
                            nodes.get(target)[$dependents].set(source, weight);
                            nodes.get(source)[$dependencies].set(target, weight);
                        }
                        return true;
                    }
                    return false;
                }
            },
            removeEdge: {
                /**
                 * @function removeEdge
                 * @param {any} source - The source node
                 * @param {any} target - The target node
                 * @return {boolean} - Whether the edge has been removed from the graph.
                 * */

                value: function removeEdge(source, target) {
                    var nodes = this[$nodes];
                    if (nodes.has(source) && nodes.has(target)) {
                        nodes.get(source)[$dependents]["delete"](target);
                        nodes.get(target)[$dependencies]["delete"](source);
                        if (!this.directed) {
                            nodes.get(target)[$dependents]["delete"](source);
                            nodes.get(source)[$dependencies]["delete"](target);
                        }
                        return true;
                    }
                    return false;
                }
            },
            hasEdge: {
                /**
                 * @function hasEdge
                 * @param {any} object
                 * @return {boolean} - Whether there is an edge between the {source} and {target} node in this graph.
                 * */

                value: function hasEdge(source, target) {
                    return this.hasNode(source) && this.hasNode(target) && this[$nodes].get(source)[$dependents].has(target);
                }
            },
            clear: {
                /**
                 * Removes all nodes and edges from the graph.
                 * @function clear
                 * @return {boolean} - Whether all nodes have been removed.
                 * */

                value: function clear() {
                    return this[$nodes].clear();
                }
            },
            hasCycle: {
                /**
                 * @function hasCycle
                 * @return {boolean} - Whether the graph has a cycle.
                 * */

                value: function hasCycle() {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return !!this.getCycle.apply(this, args);
                }
            },
            getCycle: {
                /**
                 * @function getCycle
                 * @return {number} - The length of a cycle or {0} if there is no cycle.
                 * */

                value: function getCycle() {
                    var directed = this.directed;
                    var finished = new Set();
                    var visited = new Set();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this[$nodes][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var _step$value = _slicedToArray(_step.value, 2);

                            var relations = _step$value[1];

                            var depth = DFS.call(this, relations, undefined, 0);
                            if (depth) return depth;
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

                    return 0;

                    function DFS(node, dependency, length) {
                        if (!finished.has(node)) {
                            if (visited.has(node)) {
                                return length;
                            }visited.add(node);
                            var nodes = this[$nodes];
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = node[$dependents][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var _step2$value = _slicedToArray(_step2.value, 1);

                                    var dependent = _step2$value[0];

                                    var dependent_node = nodes.get(dependent);
                                    if (directed || dependent_node !== dependency) {
                                        var depth = DFS.call(this, dependent_node, node, length + 1);
                                        if (depth) return depth;
                                    }
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

                            finished.add(node);
                        }
                    }
                }
            },
            getDegree: {
                /**
                 * @function getDegree
                 * @param {any} node
                 * @return {object} - An object containing all in-/out-nodes
                 * */

                value: function getDegree(node) {
                    var _this = this;

                    var relations = this[$nodes].get(node);
                    if (!relations) {
                        return (function () {
                            var _ref = [];
                            var _iteratorNormalCompletion = true;
                            var _didIteratorError = false;
                            var _iteratorError = undefined;

                            try {
                                for (var _iterator = _this[$nodes][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    var _step$value = _slicedToArray(_step.value, 2);

                                    var _node = _step$value[0];
                                    var _relations = _step$value[1];

                                    _ref.push({
                                        node: _node,
                                        "in": _relations.dependencies.size,
                                        out: _relations.dependents.size
                                    });
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

                            return _ref;
                        })();
                    }return {
                        node: node,
                        "in": relations.dependencies.size,
                        out: relations.dependents.size
                    };
                }
            }
        });

        return Graph;
    })();

    /**
     * A class implementing cycleless graphs.
     * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
     * */

    var AcyclicGraph = exports.AcyclicGraph = (function (_Graph) {
        function AcyclicGraph() {
            _classCallCheck(this, AcyclicGraph);

            if (_Graph != null) {
                _Graph.apply(this, arguments);
            }
        }

        _inherits(AcyclicGraph, _Graph);

        _createClass(AcyclicGraph, {
            addEdge: {
                /**
                 * @function addEdge
                 * @param {any} source - The source node
                 * @param {any} target - The target node
                 * @param {any} weight - The weight of the edge
                 * @return {boolean} - Whether the object has been removed from the graph.
                 * The edge is only added if it does not create a cycle.
                 * */

                value: function addEdge(source, target, weight) {
                    var added = _get(Object.getPrototypeOf(AcyclicGraph.prototype), "addEdge", this).call(this, source, target, weight);
                    if (added && this.hasCycle(true)) if (this.removeEdge(source, target)) {
                        return false;
                    } else throw Error("Cyclic node could not be removed");
                    return added;
                }
            },
            getCycle: {
                /**
                 * @function getCycle
                 * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns 0 as acyclic graph).
                 * @return {number} - The length of a cycle or {0} if there is no cycle.
                 * */

                value: function getCycle() {
                    var real = arguments[0] === undefined ? false : arguments[0];

                    return !!real ? _get(Object.getPrototypeOf(AcyclicGraph.prototype), "getCycle", this).call(this) : 0;
                }
            },
            hasCycle: {
                /**
                 * @function hasCycle
                 * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns false as acyclic graph).
                 * @return {boolean} Whether the graph has a cycle.
                 * */

                value: function hasCycle() {
                    var real = arguments[0] === undefined ? false : arguments[0];

                    return !!_get(Object.getPrototypeOf(AcyclicGraph.prototype), "hasCycle", this).call(this, real);
                }
            }
        });

        return AcyclicGraph;
    })(Graph);

    /**
     * A class implementing trees.
     * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
     * Must not be connected!
     * */

    var Tree = exports.Tree = (function (_AcyclicGraph) {
        function Tree() {
            _classCallCheck(this, Tree);

            if (_AcyclicGraph != null) {
                _AcyclicGraph.apply(this, arguments);
            }
        }

        _inherits(Tree, _AcyclicGraph);

        _createClass(Tree, {
            addEdge: {
                /**
                 * @function addEdge
                 * @param {any} source - The source node
                 * @param {any} target - The target node
                 * @param {any} weight - The weight of the edge
                 * @return {boolean} - Whether the object has been removed from the graph.
                 * The edge is only added if the result would be a tree.
                 * */

                value: function addEdge(source, target, weight) {
                    if (this[$nodes].get(target)[$dependencies].size > 0) {
                        return false;
                    }return _get(Object.getPrototypeOf(Tree.prototype), "addEdge", this).call(this, source, target, weight);
                }
            }
        });

        return Tree;
    })(AcyclicGraph);
});