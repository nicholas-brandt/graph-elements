define([ "exports", "../../node_modules/d3/d3", "../external/requestAnimationFunction.c" ], function(exports, _node_modulesD3D3, _externalRequestAnimationFunctionC) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
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
    var d3 = _interopRequire(_node_modulesD3D3);
    var requestAnimationFunction = _externalRequestAnimationFunctionC.requestAnimationFunction;
    var $force = Symbol();
    var $svg = Symbol();
    var $dom_svg = Symbol();
    var $circle_data = Symbol();
    var $path_data = Symbol();
    var $graph = Symbol();
    var $resize = Symbol();
    var $drawing = Symbol();
    var arrow = {
        width:5,
        length:2.2
    };
    var D3SVG = exports.D3SVG = function() {
        function D3SVG(svg, graph) {
            var _this = this;
            _classCallCheck(this, D3SVG);
            if (!svg) throw Error("No svg element specified");
            if (!graph) throw Error("No graph specified");
            var force = d3.layout.force();
            this[$resize] = requestAnimationFunction(function() {
                var _getComputedStyle = getComputedStyle(svg);
                var width = _getComputedStyle.width;
                var height = _getComputedStyle.height;
                force.size([ parseInt(width), parseInt(height) ]);
                force.alpha(.1);
            });
            this[$drawing] = true;
            this[$graph] = graph;
            this[$dom_svg] = svg;
            this[$force] = force;
            this[$svg] = window.svg = d3.select(svg);
            this[$force].on("tick", function() {
                if (_this.drawing) {
                    _this[$circle_data].attr("transform", function(node) {
                        return "translate(" + node.x + "," + node.y + ")";
                    });
                    _this[$path_data].attr("d", function(_ref) {
                        var source = _ref.source;
                        var target = _ref.target;
                        var dx = source.x - target.x;
                        var dy = source.y - target.y;
                        var hyp = Math.hypot(dx, dy);
                        var nx = dx / hyp * arrow.width;
                        var ny = dy / hyp * arrow.width;
                        return "M" + target.x + "," + target.y + "l " + dx + "," + dy + "l " + -ny + "," + nx + "L " + (source.x - nx * arrow.length) + "," + (source.y - ny * arrow.length) + "L " + (source.x + ny) + "," + (source.y - nx) + "L " + source.x + "," + source.y;
                    });
                }
            });
            this.resize();
            this.update();
        }
        _createClass(D3SVG, {
            update:{
                value:function update() {
                    var _this = this;
                    var node_map = new Map(function() {
                        var _ref = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = _this[$graph].nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 1);
                                var i = _step$value[0];
                                _ref.push([ i, {
                                    value:i,
                                    x:Math.random(),
                                    y:Math.random()
                                } ]);
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
                    }());
                    var nodes = function() {
                        var _nodes = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = node_map[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 2);
                                var node = _step$value[1];
                                _nodes.push(node);
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
                    }();
                    var edges = function() {
                        var _edges = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = _this[$graph].edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _step.value;
                                var source = _step$value.source;
                                var target = _step$value.target;
                                _edges.push({
                                    source:node_map.get(source),
                                    target:node_map.get(target)
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
                        return _edges;
                    }();
                    this[$force].nodes(nodes).links(edges);
                    this[$path_data] = this[$svg].selectAll("path").data(edges);
                    this[$circle_data] = this[$svg].selectAll("circle").data(nodes);
                    this[$path_data].enter().append("path");
                    this[$circle_data].enter().append("circle").attr("r", 5).call(this[$force].drag);
                    this[$path_data].exit().remove();
                    this[$circle_data].exit().remove();
                }
            },
            resize:{
                value:function resize() {
                    this[$resize]();
                }
            },
            graph:{
                get:function() {
                    return this[$graph];
                }
            },
            force:{
                get:function() {
                    return this[$force];
                }
            },
            drawing:{
                get:function() {
                    return this[$drawing];
                },
                set:function() {
                    var drawing = arguments[0] === undefined ? true :arguments[0];
                    return this[$drawing] = !!drawing;
                }
            }
        });
        return D3SVG;
    }();
});