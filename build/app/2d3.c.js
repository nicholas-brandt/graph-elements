define([ "exports", "../../node_modules/d3/d3", "ext/requestAnimationFunction.c" ], function(exports, _node_modulesD3D3, _extRequestAnimationFunctionC) {
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
    var requestAnimationFunction = _extRequestAnimationFunctionC.requestAnimationFunction;
    var $force = Symbol();
    var $svg = Symbol();
    var $dom_svg = Symbol();
    var $circle_data = Symbol();
    var $path_data = Symbol();
    var $graph = Symbol();
    var $resize = Symbol();
    var Wrap = function Wrap(node) {
        _classCallCheck(this, Wrap);
        this.value = node;
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
            this[$graph] = graph;
            this[$dom_svg] = svg;
            this[$force] = force;
            this[$svg] = window.svg = d3.select(svg);
            this[$force].on("tick", function() {
                _this[$circle_data].attr("transform", function(node) {
                    return "translate(" + node.x + "," + node.y + ")";
                });
                _this[$path_data].attr("d", function(_ref) {
                    var _ref2 = _slicedToArray(_ref, 2);
                    var source = _ref2[0];
                    var target = _ref2[1];
                    return "M" + source.x + "," + source.y + "L " + target.x + "," + target.y;
                });
            });
            this.update();
            window.begin = performance.now();
            window.sum = 0;
            setInterval(function() {
                console.log((performance.now() - begin) / window.sum);
                force.resume();
            }, 3e3);
        }
        _createClass(D3SVG, {
            update:{
                value:function update() {
                    this.resize();
                    var nodes = [];
                    var edges = [];
                    var links = [];
                    var node_map = new Map();
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;
                    try {
                        for (var _iterator = this[$graph].nodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var node = _step.value;
                            var wrap = new Wrap(node);
                            node_map.set(node, wrap);
                            nodes.push(wrap);
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
                        for (var _iterator2 = this[$graph].edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _step2$value = _step2.value;
                            var source = _step2$value.source;
                            var target = _step2$value.target;
                            var source_wrap = node_map.get(source);
                            var target_wrap = node_map.get(target);
                            links.push({
                                source:source_wrap,
                                target:target_wrap
                            });
                            edges.push([ source_wrap, target_wrap ]);
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
                    this[$force].nodes(nodes).links(links);
                    this[$circle_data] = this[$svg].selectAll("circle").data(nodes);
                    this[$path_data] = this[$svg].selectAll("path").data(edges);
                    this[$circle_data].enter().append("circle").attr("r", 5).call(this[$force].drag);
                    this[$path_data].enter().append("path");
                    this[$circle_data].exit().remove();
                    this[$path_data].exit().remove();
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
            }
        });
        return D3SVG;
    }();
});