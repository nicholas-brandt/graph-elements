define([ "exports", "../graph" ], function(exports, _graph) {
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
    var Graph = _graph.Graph;
    var Importer = exports.Importer = function() {
        function Importer() {
            _classCallCheck(this, Importer);
        }
        _createClass(Importer, null, {
            importObject:{
                value:function importObject(object) {
                    if (typeof object != "object") throw Error("Argument is not an object!");
                    var graph = new Graph(true);
                    serialize(object, graph);
                    return graph;
                }
            }
        });
        return Importer;
    }();
    var Migrator = exports.Migrator = function() {
        function Migrator() {
            _classCallCheck(this, Migrator);
        }
        _createClass(Migrator, null, {
            migrateGraph:{
                value:function migrateGraph(source, target) {
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
                }
            }
        });
        return Migrator;
    }();
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