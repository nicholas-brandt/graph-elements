"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $directed = Symbol();
/**
 * @class Graph
 * Fundamental class that implements the basic graph structures.
 * #Following https://en.wikipedia.org/wiki/Graph_theory
 * */

var Graph = exports.Graph = function (_Map) {
    _inherits(Graph, _Map);

    function Graph() {
        _classCallCheck(this, Graph);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Graph).apply(this, arguments));
    }

    _createClass(Graph, [{
        key: "addNode",

        /**
         * @function addNode
         * @param {any} node - An object to be set as a node.
         * @returns {boolean} - {true} if the object has been set as a node
         *                      {false} if the object was already a node in this graph.
         * */
        value: function addNode(node) {
            if (this.has(node)) return false;
            // {relations} to be stored in the {nodes} map
            // stored as a double-linked list
            this.set(node, new Relations());
            return true;
        }
        /**
         * @function removeNode
         * @param {any} node - The node to be removed.
         * @return {boolean} - Whether the object has been removed from the graph.
         * */

    }, {
        key: "removeNode",
        value: function removeNode(node) {
            if (!this.has(node)) return false;
            var relations = this.nodes.get(object);
            // remove {object} from nodes
            this.nodes.delete(object);
            // remove all links containing {object}
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = relations.dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _ref = _step.value;

                    var _ref2 = _slicedToArray(_ref, 2);

                    var dependents = _ref2[1];
                    dependents.delete(object);
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
                for (var _iterator2 = relations.dependents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _ref3 = _step2.value;

                    var _ref4 = _slicedToArray(_ref3, 2);

                    var dependencies = _ref4[1];
                    dependencies.delete(object);
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

            return true;
        }
        /**
         * @function addLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @param {any} weight - The weight of the link
         * @return {boolean} - Whether the object has been removed from the graph.
         * */

    }, {
        key: "addLink",
        value: function addLink(source, target) {
            var weight = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

            var source_relations = this.get(source);
            var target_relations = this.get(target);
            if (source_relations && target_relations) {
                var link = new Link(source, target, weight);
                source_relations.dependents.set(target, link);
                target_relations.dependencies.set(source, link);
                if (!this.directed) {
                    var reverse_link = new Link(target, source, weight);
                    target_relations.dependents.set(source, reverse_link);
                    source_relations.dependencies.set(target, reverse_link);
                }
                return true;
            }
            return false;
        }
        /**
         * @function removeLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @return {boolean} - Whether the link has been removed from the graph.
         * */

    }, {
        key: "removeLink",
        value: function removeLink(source, target) {
            var source_relations = this.get(source);
            var target_relations = this.get(target);
            if (source_relations && target_relations) {
                source_relations.dependents.delete(target);
                target_relations.dependencies.delete(source);
                if (!this.directed) {
                    target_relations.dependents.delete(source);
                    source_relations.dependencies.delete(target);
                }
                return true;
            }
            return false;
        }
        /**
         * @function clearLinks
         * Removes all links
         * */

    }, {
        key: "clearLinks",
        value: function clearLinks() {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _ref5 = _step3.value;

                    var _ref6 = _slicedToArray(_ref5, 2);

                    var relations = _ref6[1];

                    relations.dependents.clear();
                    relations.dependencies.clear();
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
        /**
         * @function hasLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @return {boolean} - Whether there is an link between the {source} and {target} node in this graph.
         * */

    }, {
        key: "hasLink",
        value: function hasLink(source, target) {
            return this.has(source) && this.has(target) && this.get(source).dependents.has(target);
        }
        /**
         * @function hasCycle
         * @return {boolean} - Whether the graph has a cycle.
         * Deep field search.
         * */

    }, {
        key: "hasCycle",
        value: function hasCycle() {
            var _this2 = this;

            var finished = new Set();
            var visited = new Set();
            var search = function search(start_relations, referrer_relations) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = start_relations.dependents[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var _ref7 = _step4.value;

                        var _ref8 = _slicedToArray(_ref7, 1);

                        var dependent = _ref8[0];

                        var dependent_relations = _this2.get(dependent);
                        if (!_this2.directed && dependent_relations === referrer_relations) continue;
                        if (visited.has(dependent_relations)) return true;else {
                            visited.add(dependent_relations);
                            if (search(dependent_relations, start_relations)) return true;
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }
            };
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = this[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var _ref9 = _step5.value;

                    var _ref10 = _slicedToArray(_ref9, 2);

                    var relations = _ref10[1];

                    if (finished.has(relations)) continue;
                    if (search(relations)) return true;
                    finished.add.apply(finished, _toConsumableArray(visited));
                    visited.clear();
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return false;
        }
        /**
        * @function getAllCyclesFromNode
        * @param {any} node - The node contained by all cycles
        * @return {Set} - A set of all cycles containing the node
        * */

    }, {
        key: "getAllCyclesFromNode",
        value: function getAllCyclesFromNode(start_node) {
            var _this3 = this;

            var cycles = new Set();
            var search = function search(node, path) {
                var _iteratorNormalCompletion6 = true;
                var _didIteratorError6 = false;
                var _iteratorError6 = undefined;

                try {
                    for (var _iterator6 = _this3.get(node).dependents[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                        var _ref11 = _step6.value;

                        var _ref12 = _slicedToArray(_ref11, 1);

                        var neighbor_node = _ref12[0];

                        if (neighbor_node === start_node) cycles.add(path);else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
                    }
                } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }
                    } finally {
                        if (_didIteratorError6) {
                            throw _iteratorError6;
                        }
                    }
                }
            };
            var relations = this.get(start_node);
            if (relations) search(start_node, [start_node]);
            return cycles;
        }
    }, {
        key: "directed",

        /**
         * @getter directed
         * @returns {boolean} - Whether the graph is unidirectional.
         * */
        get: function get() {
            return this[$directed];
        }
        /**
         * @setter directed
         * @param {boolean} directed - Whether the graph shall be unidirectional.
         * */
        ,
        set: function set(directed) {
            this[$directed] = !!directed;
            var links = this.links;
            this.clearLinks();
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
                for (var _iterator7 = links[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                    var _ref13 = _step7.value;
                    var source = _ref13.source;
                    var target = _ref13.target;
                    var weight = _ref13.weight;
                    this.addLink(source, target, weight);
                }
            } catch (err) {
                _didIteratorError7 = true;
                _iteratorError7 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion7 && _iterator7.return) {
                        _iterator7.return();
                    }
                } finally {
                    if (_didIteratorError7) {
                        throw _iteratorError7;
                    }
                }
            }
        }
        /**
         * @getter links
         * @returns {Set} - A set of all links.
         * */

    }, {
        key: "links",
        get: function get() {
            var links = new Set();
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
                for (var _iterator8 = this[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var _ref14 = _step8.value;

                    var _ref15 = _slicedToArray(_ref14, 2);

                    var relations = _ref15[1];
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        for (var _iterator9 = relations.dependents[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            var _ref16 = _step9.value;

                            var _ref17 = _slicedToArray(_ref16, 2);

                            var link = _ref17[1];
                            links.add(link);
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                _iterator9.return();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }

            return links;
        }
    }]);

    return Graph;
}(Map);
/**
 * @class AcyclicGraph
 * A class implementing cycleless graphs.
 * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
 * */


var AcyclicGraph = exports.AcyclicGraph = function (_Graph) {
    _inherits(AcyclicGraph, _Graph);

    function AcyclicGraph() {
        _classCallCheck(this, AcyclicGraph);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AcyclicGraph).apply(this, arguments));
    }

    _createClass(AcyclicGraph, [{
        key: "addLink",

        /**
         * @function addLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @param {any} weight - The weight of the link
         * @return {boolean} - Whether the object has been removed from the graph.
         * The link is only added if it does not create a cycle.
         * */
        value: function addLink(source, target, weight) {
            var added = _get(Object.getPrototypeOf(AcyclicGraph.prototype), "addLink", this).call(this, source, target, weight);
            if (added && this.hasCycle(true)) if (this.removeLink(source, target)) return false;else throw Error("Cyclic node could not be removed; Graph is no longer acyclic");
            return added;
        }
        /**
         * @function hasCycle
         * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns false as acyclic graph).
         * @return {boolean} Whether the graph has a cycle.
         * */

    }, {
        key: "hasCycle",
        value: function hasCycle() {
            var real = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            return real ? _get(Object.getPrototypeOf(AcyclicGraph.prototype), "hasCycle", this).call(this) : false;
        }
    }]);

    return AcyclicGraph;
}(Graph);
/**
 * @class Tree
 * A class implementing trees.
 * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
 * Must not be connected!
 * */


var Tree = exports.Tree = function (_AcyclicGraph) {
    _inherits(Tree, _AcyclicGraph);

    function Tree() {
        _classCallCheck(this, Tree);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Tree).apply(this, arguments));
    }

    _createClass(Tree, [{
        key: "addLink",

        /**
         * @function addLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @param {any} weight - The weight of the link
         * @return {boolean} - Whether the object has been removed from the graph.
         * The link is only added if the result would be a tree.
         * */
        value: function addLink(source, target, weight) {
            if (this.get(target).in > 0) return false;
            return _get(Object.getPrototypeOf(Tree.prototype), "addLink", this).call(this, source, target, weight);
        }
    }]);

    return Tree;
}(AcyclicGraph);
/**
 * A helper class.
 * Handles relations between nodes.
 * */


var Relations = function Relations() {
    _classCallCheck(this, Relations);

    Object.defineProperties(this, {
        "dependents": {
            value: new Map(),
            enumerable: true
        },
        "dependencies": {
            value: new Map(),
            enumerable: true
        },
        "in": {
            get: function get() {
                return this.dependencies.size;
            },

            enumerable: true
        },
        "out": {
            get: function get() {
                return this.dependents.size;
            },

            enumerable: true
        }
    });
};
/**
 * @class Link
 * A helper class.
 * Represents a link between two nodes.
 * */


var Link = function Link(source, target, weight) {
    _classCallCheck(this, Link);

    Object.defineProperties(this, {
        "source": {
            value: source,
            enumerable: true
        },
        "target": {
            value: target,
            enumerable: true
        },
        "weight": {
            value: weight,
            enumerable: true,
            writeable: true
        }
    });
};
