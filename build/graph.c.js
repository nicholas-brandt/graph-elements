define([ "exports" ], function(exports) {
    "use strict";
    var _slicedToArray = function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            var _arr = [];
            for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done; ) {
                _arr.push(_step.value);
                if (i && _arr.length === i) break;
            }
            return _arr;
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
    var _toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        } else {
            return Array.from(arr);
        }
    };
    var _get = function get(object, property, receiver) {
        var desc = Object.getOwnPropertyDescriptor(object, property);
        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);
            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc && desc.writable) {
            return desc.value;
        } else {
            var getter = desc.get;
            if (getter === undefined) {
                return undefined;
            }
            return getter.call(receiver);
        }
    };
    var _inherits = function(subClass, superClass) {
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
        if (superClass) subClass.__proto__ = superClass;
    };
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var key in props) {
                var prop = props[key];
                prop.configurable = true;
                if (prop.value) prop.writable = true;
            }
            Object.defineProperties(target, props);
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    var _classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };
    Object.defineProperty(exports, "__esModule", {
        value:true
    });
    var _ref = function() {
        var $nodes = Symbol();
        var $dependencies = Symbol();
        var $dependents = Symbol();
        var $directed = Symbol();
        var Graph = function() {
            function Graph() {
                var directed = arguments[0] === undefined ? false :arguments[0];
                _classCallCheck(this, Graph);
                this[$nodes] = new Map();
                this.directed = !!directed;
            }
            _createClass(Graph, {
                directed:{
                    get:function() {
                        return this[$directed];
                    },
                    set:function(directed) {
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
                nodes:{
                    get:function() {
                        return new Map(this[$nodes]);
                    }
                },
                edges:{
                    get:function() {
                        var edges = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = this[$nodes][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                                        edges.push([ node, dependent, weight ]);
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
                        return edges;
                    }
                },
                addNode:{
                    value:function addNode(object) {
                        var relations = Object.defineProperties({}, {
                            dependencies:{
                                get:function() {
                                    return new Map(this[$dependencies]);
                                },
                                configurable:true,
                                enumerable:true
                            },
                            dependents:{
                                get:function() {
                                    return new Map(this[$dependents]);
                                },
                                configurable:true,
                                enumerable:true
                            }
                        });
                        relations[$dependencies] = new Map();
                        relations[$dependents] = new Map();
                        this[$nodes].set(object, relations);
                        return true;
                    }
                },
                removeNode:{
                    value:function removeNode(object) {
                        this[$nodes]["delete"](object);
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = this[$nodes][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 2);
                                var relations = _step$value[1];
                                relations[$dependents]["delete"](object);
                                relations[$dependencies]["delete"](object);
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
                },
                addEdge:{
                    value:function addEdge(source, target) {
                        var weight = arguments[2] === undefined ? 1 :arguments[2];
                        var nodes = this[$nodes];
                        if ([ source, target ].every(nodes.has.bind(nodes))) {
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
                removeEdge:{
                    value:function removeEdge(source, target) {
                        var nodes = this[$nodes];
                        if ([ source, target ].every(nodes.has.bind(nodes))) {
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
                hasCycle:{
                    value:function hasCycle() {
                        return !!this.getCycle();
                    }
                },
                getCycle:{
                    value:function getCycle() {
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
                        return false;
                        function DFS(node, dependency, length) {
                            if (!finished.has(node)) {
                                if (visited.has(node)) {
                                    return length;
                                }
                                visited.add(node);
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
                }
            });
            return Graph;
        }();
        var AcyclicGraph = function(_Graph) {
            function AcyclicGraph() {
                _classCallCheck(this, AcyclicGraph);
                if (_Graph != null) {
                    _Graph.apply(this, arguments);
                }
            }
            _inherits(AcyclicGraph, _Graph);
            _createClass(AcyclicGraph, {
                addEdge:{
                    value:function addEdge(source, target, weight) {
                        var added = _get(Object.getPrototypeOf(AcyclicGraph.prototype), "addEdge", this).call(this, source, target, weight);
                        if (added && _get(Object.getPrototypeOf(AcyclicGraph.prototype), "hasCycle", this).call(this)) if (this.removeEdge(source, target)) {
                            return false;
                        } else throw Error("Cyclic node could not be removed");
                        return added;
                    }
                },
                hasCycle:{
                    value:function hasCycle() {
                        var real = arguments[0] === undefined ? false :arguments[0];
                        return !!real && _get(Object.getPrototypeOf(AcyclicGraph.prototype), "hasCycle", this).call(this);
                    }
                }
            });
            return AcyclicGraph;
        }(Graph);
        var Tree = function(_AcyclicGraph) {
            function Tree() {
                _classCallCheck(this, Tree);
                if (_AcyclicGraph != null) {
                    _AcyclicGraph.apply(this, arguments);
                }
            }
            _inherits(Tree, _AcyclicGraph);
            _createClass(Tree, {
                addEdge:{
                    value:function addEdge(source, target, weight) {
                        if (this[$nodes].get(target)[$dependencies].size > 0) {
                            return false;
                        }
                        return _get(Object.getPrototypeOf(Tree.prototype), "addEdge", this).call(this, source, target, weight);
                    }
                }
            });
            return Tree;
        }(AcyclicGraph);
        return [ Graph, AcyclicGraph, Tree ];
    }();
    var _ref2 = _slicedToArray(_ref, 3);
    var Graph = _ref2[0];
    var AcyclicGraph = _ref2[1];
    var Tree = _ref2[2];
    exports.Graph = Graph;
    exports.AcyclicGraph = AcyclicGraph;
    exports.Tree = Tree;
});