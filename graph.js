System.register([], function (_export) {
    var _slicedToArray, _get, _inherits, _prototypeProperties, _classCallCheck, _ref, _ref2, Graph, AcyclicGraph, Tree;

    return {
        setters: [],
        execute: function () {
            "use strict";

            _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

            _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

            _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

            _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            _ref = _export("_ref", (function (global) {
                var $nodes = Symbol();
                var $dependencies = Symbol();
                var $dependents = Symbol();
                var $directed = Symbol();

                var Graph = (function () {
                    function Graph() {
                        var directed = arguments[0] === undefined ? false : arguments[0];

                        _classCallCheck(this, Graph);

                        this[$nodes] = new Map();
                        this.directed = directed;
                    }

                    _prototypeProperties(Graph, null, {
                        directed: {
                            get: function () {
                                return this[$directed];
                            },
                            set: function (directed) {
                                this[$directed] = !!directed;
                            },
                            configurable: true
                        },
                        addNode: {
                            value: function addNode(object) {
                                var relations = Object.defineProperties({}, {
                                    dependencies: {
                                        get: function () {
                                            return new Map(this[$dependencies]);
                                        },
                                        enumerable: true,
                                        configurable: true
                                    },
                                    dependents: {
                                        get: function () {
                                            return new Map(this[$dependents]);
                                        },
                                        enumerable: true,
                                        configurable: true
                                    }
                                });
                                relations[$dependencies] = new Map();
                                relations[$dependents] = new Map();
                                this[$nodes].set(object, relations);
                                return true;
                            },
                            writable: true,
                            configurable: true
                        },
                        removeNode: {
                            value: function removeNode(object) {
                                this[$nodes]["delete"](object);
                            },
                            writable: true,
                            configurable: true
                        },
                        addEdge: {
                            value: function addEdge(source, target) {
                                var weight = arguments[2] === undefined ? 1 : arguments[2];

                                if (this[$nodes].has(source) && this[$nodes].has(target)) {
                                    this[$nodes].get(source)[$dependents].set(target, weight);
                                    this[$nodes].get(target)[$dependencies].add(source, weight);
                                    if (this.directed) {
                                        this[$nodes].get(target)[$dependents].set(source, weight);
                                        this[$nodes].get(source)[$dependencies].add(target, weight);
                                    }
                                    return true;
                                }
                                return false;
                            },
                            writable: true,
                            configurable: true
                        },
                        removeEdge: {
                            value: function removeEdge(source, target) {
                                if (this[$nodes].has(source) && this[$nodes].has(target)) {
                                    this[$nodes].get(source)[$dependents]["delete"](target);
                                    this[$nodes].get(target)[$dependencies]["delete"](source);
                                    if (this.directed) {
                                        this[$nodes].get(source)[$dependents]["delete"](source);
                                        this[$nodes].get(target)[$dependencies]["delete"](target);
                                    }
                                    return true;
                                }
                                return false;
                            },
                            writable: true,
                            configurable: true
                        },
                        hasCycle: {
                            value: function hasCycle() {
                                var finished = new Set();
                                var visited = new Set();
                                for (var _iterator = this[$nodes][Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
                                    var node = _step.value;

                                    if (DFS(node)) {
                                        return true;
                                    }
                                }return false;

                                function DFS(node) {
                                    if (finished.has(node)) {
                                        if (visited.has(node)) {
                                            return true;
                                        }
                                        visited.add(node);
                                        for (var _iterator2 = node[$dependents][Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
                                            var dependent = _step2.value;

                                            if (DFS(dependent)) {
                                                return true;
                                            }
                                        }finished.add(node);
                                    }
                                }
                            },
                            writable: true,
                            configurable: true
                        }
                    });

                    return Graph;
                })();

                var AcyclicGraph = (function (Graph) {
                    function AcyclicGraph() {
                        _classCallCheck(this, AcyclicGraph);

                        if (Graph != null) {
                            Graph.apply(this, arguments);
                        }
                    }

                    _inherits(AcyclicGraph, Graph);

                    _prototypeProperties(AcyclicGraph, null, {
                        addEdge: {
                            value: function addEdge(source, target, weight) {
                                var added = _get(Object.getPrototypeOf(AcyclicGraph.prototype), "addEdge", this).call(this, source, target, weight);
                                if (added && this.hasCycle()) if (!this.removeEdge(source, target)) throw Error("Cyclic node could not be removed");
                                return added;
                            },
                            writable: true,
                            configurable: true
                        }
                    });

                    return AcyclicGraph;
                })(Graph);

                var Tree = (function (AcyclicGraph) {
                    function Tree() {
                        _classCallCheck(this, Tree);

                        if (AcyclicGraph != null) {
                            AcyclicGraph.apply(this, arguments);
                        }
                    }

                    _inherits(Tree, AcyclicGraph);

                    _prototypeProperties(Tree, null, {
                        addEdge: {
                            value: function addEdge(source, target, weight) {
                                if (this[$nodes].get(target)[$dependencies].size > 0) {
                                    return false;
                                }return _get(Object.getPrototypeOf(Tree.prototype), "addEdge", this).call(this, source, target, weight);
                            },
                            writable: true,
                            configurable: true
                        }
                    });

                    return Tree;
                })(AcyclicGraph);

                return [DirectedGraph, AcyclicGraph, Tree];
            })());
            _ref2 = _export("_ref2", _slicedToArray(_ref, 3));
            Graph = _export("Graph", _ref2[0]);
            AcyclicGraph = _export("AcyclicGraph", _ref2[1]);
            Tree = _export("Tree", _ref2[2]);
        }
    };
});
