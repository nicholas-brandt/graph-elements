"use strict";

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};

var _slicedToArray = function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

Object.defineProperty(exports, "__esModule", {
    value:true
});

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call :self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor:{
            value:subClass,
            enumerable:false,
            writable:true,
            configurable:true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) :subClass.__proto__ = superClass;
}

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var $directed = Symbol();

var Graph = exports.Graph = function() {
    function Graph() {
        var directed = arguments.length <= 0 || arguments[0] === undefined ? false :arguments[0];
        _classCallCheck(this, Graph);
        Object.defineProperty(this, "nodes", {
            value:new Map()
        });
        this.directed = !!directed;
    }
    _createClass(Graph, [ {
        key:"addNode",
        value:function addNode(object) {
            if (this.hasNode(object)) return false;
            var relations = {};
            Object.defineProperties(relations, {
                dependents:{
                    value:new Map()
                },
                dependencies:{
                    value:new Map()
                }
            });
            this.nodes.set(object, relations);
            return true;
        }
    }, {
        key:"hasNode",
        value:function hasNode(object) {
            return this.nodes.has(object);
        }
    }, {
        key:"removeNode",
        value:function removeNode(object) {
            if (!this.hasNode(object)) return false;
            var relations = this.nodes.get(object);
            this.nodes.delete(object);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
                for (var _iterator = relations.dependencies[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);
                    var dependents = _step$value[1];
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
                    var _step2$value = _slicedToArray(_step2.value, 2);
                    var dependencies = _step2$value[1];
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
    }, {
        key:"addEdge",
        value:function addEdge(source, target) {
            var weight = arguments.length <= 2 || arguments[2] === undefined ? 1 :arguments[2];
            var nodes = this.nodes;
            if (nodes.has(source) && nodes.has(target)) {
                nodes.get(source).dependents.set(target, weight);
                nodes.get(target).dependencies.set(source, weight);
                if (!this.directed) {
                    nodes.get(target).dependents.set(source, weight);
                    nodes.get(source).dependencies.set(target, weight);
                }
                return true;
            }
            return false;
        }
    }, {
        key:"removeEdge",
        value:function removeEdge(source, target) {
            var nodes = this.nodes;
            if (nodes.has(source) && nodes.has(target)) {
                nodes.get(source).dependents.delete(target);
                nodes.get(target).dependencies.delete(source);
                if (!this.directed) {
                    nodes.get(target).dependents.delete(source);
                    nodes.get(source).dependencies.delete(target);
                }
                return true;
            }
            return false;
        }
    }, {
        key:"hasEdge",
        value:function hasEdge(source, target) {
            return this.hasNode(source) && this.hasNode(target) && this.nodes.get(source).dependents.has(target);
        }
    }, {
        key:"clear",
        value:function clear() {
            return this.nodes.clear();
        }
    }, {
        key:"hasCycle",
        value:function hasCycle() {
            return !!this.getCycle.apply(this, arguments);
        }
    }, {
        key:"getCycle",
        value:function getCycle() {
            var directed = this.directed;
            var finished = new Set();
            var visited = new Set();
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;
            try {
                for (var _iterator3 = this.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = _slicedToArray(_step3.value, 2);
                    var relations = _step3$value[1];
                    var depth = DFS.call(this, relations, undefined, 0);
                    if (depth) return depth;
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
            return 0;
            function DFS(node, dependency, length) {
                if (!finished.has(node)) {
                    if (visited.has(node)) return length;
                    visited.add(node);
                    var nodes = this.nodes;
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;
                    try {
                        for (var _iterator4 = node.dependents[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _step4$value = _slicedToArray(_step4.value, 1);
                            var dependent = _step4$value[0];
                            var dependent_node = nodes.get(dependent);
                            if (directed || dependent_node !== dependency) {
                                var depth = DFS.call(this, dependent_node, node, length + 1);
                                if (depth) return depth;
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
                    finished.add(node);
                }
            }
        }
    }, {
        key:"getDegree",
        value:function getDegree(node) {
            var relations = this.nodes.get(node);
            if (!relations) return this.nodes.map(function(_ref) {
                var _ref2 = _slicedToArray(_ref, 2);
                var node = _ref2[0];
                var relations = _ref2[1];
                return {
                    node:node,
                    "in":relations.dependencies.size,
                    out:relations.dependents.size
                };
            });
            return {
                node:node,
                "in":relations.dependencies.size,
                out:relations.dependents.size
            };
        }
    }, {
        key:"directed",
        get:function get() {
            return this[$directed];
        },
        set:function set(directed) {
            this[$directed] = !!directed;
            if (this.directed) {
                var _iteratorNormalCompletion5 = true;
                var _didIteratorError5 = false;
                var _iteratorError5 = undefined;
                try {
                    for (var _iterator5 = this.edges[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                        var edge = _step5.value;
                        this.addEdge.apply(this, _toConsumableArray(edge));
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
            }
        }
    }, {
        key:"edges",
        get:function get() {
            return this.nodes.map(function(_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2);
                var node = _ref4[0];
                var relations = _ref4[1];
                return relations.dependents.map(function(_ref5) {
                    var _ref6 = _slicedToArray(_ref5, 2);
                    var dependent = _ref6[0];
                    var weight = _ref6[1];
                    return {
                        source:node,
                        target:dependent,
                        weight:weight
                    };
                });
            });
        }
    } ]);
    return Graph;
}();

var AcyclicGraph = exports.AcyclicGraph = function(_Graph) {
    _inherits(AcyclicGraph, _Graph);
    function AcyclicGraph() {
        _classCallCheck(this, AcyclicGraph);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(AcyclicGraph).apply(this, arguments));
    }
    _createClass(AcyclicGraph, [ {
        key:"addEdge",
        value:function addEdge(source, target, weight) {
            var added = _get(Object.getPrototypeOf(AcyclicGraph.prototype), "addEdge", this).call(this, source, target, weight);
            if (added && this.hasCycle(true)) if (this.removeEdge(source, target)) return false; else throw Error("Cyclic node could not be removed");
            return added;
        }
    }, {
        key:"getCycle",
        value:function getCycle() {
            var real = arguments.length <= 0 || arguments[0] === undefined ? false :arguments[0];
            return !!real ? _get(Object.getPrototypeOf(AcyclicGraph.prototype), "getCycle", this).call(this) :0;
        }
    }, {
        key:"hasCycle",
        value:function hasCycle() {
            var real = arguments.length <= 0 || arguments[0] === undefined ? false :arguments[0];
            return !!_get(Object.getPrototypeOf(AcyclicGraph.prototype), "hasCycle", this).call(this, real);
        }
    } ]);
    return AcyclicGraph;
}(Graph);

var Tree = exports.Tree = function(_AcyclicGraph) {
    _inherits(Tree, _AcyclicGraph);
    function Tree() {
        _classCallCheck(this, Tree);
        return _possibleConstructorReturn(this, Object.getPrototypeOf(Tree).apply(this, arguments));
    }
    _createClass(Tree, [ {
        key:"addEdge",
        value:function addEdge(source, target, weight) {
            if (this.nodes.get(target).dependencies.size > 0) return false;
            return _get(Object.getPrototypeOf(Tree.prototype), "addEdge", this).call(this, source, target, weight);
        }
    } ]);
    return Tree;
}(AcyclicGraph);