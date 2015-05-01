define([ "exports", "module", "../../graph", "../../../node_modules/d3/d3", "../../external/mixin", "../../external/layer" ], function(exports, module, _graph, _node_modulesD3D3, _externalMixin, _externalLayer) {
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
    var Graph = _graph.Graph;
    var d3 = _interopRequire(_node_modulesD3D3);
    var mixin = _interopRequire(_externalMixin);
    var layer = _interopRequire(_externalLayer);
    var $force = Symbol();
    var $options = Symbol();
    var $options_layer = Symbol();
    var $data = Symbol();
    var $d3svg = Symbol();
    module.exports = Object.defineProperties({
        is:"graphjs-tezcatlipoca",
        ready:function ready() {
            initializeD3(this);
            this.options = this[$options];
        },
        created:function created() {
            var element = this;
            configureOptions(element);
            this.real_options = this[$options];
            element.resize = function() {
                requestAnimationFrame(function() {
                    var svg = element.svg;
                    var _getComputedStyle = getComputedStyle(svg);
                    var width = _getComputedStyle.width;
                    var height = _getComputedStyle.height;
                    var ratio = element[$options].size.ratio;
                    width = parseFloat(width) / ratio;
                    height = parseFloat(height) / ratio;
                    svg.viewBox.baseVal.width = width;
                    svg.viewBox.baseVal.height = height;
                    var force = element[$force];
                    force.size([ width, height ]);
                    force.alpha(.1);
                });
            };
        },
        attached:function attached() {
            addEventListener("resize", this.resize);
        },
        detached:function detached() {
            removeEventListener("resize", this.resize);
        },
        observe:{
            graph:"updateGraph"
        },
        updateGraph:function updateGraph() {
            var _this = this;
            if (this.graph) {
                (function() {
                    var node_map = new Map(function() {
                        var _ref = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = _this.graph.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 1);
                                var i = _step$value[0];
                                _ref.push([ i, {
                                    value:i
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
                            for (var _iterator = _this.graph.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                    var force = _this[$force];
                    force.nodes(nodes).links(edges);
                    var d3svg = _this[$d3svg];
                    var circles = d3svg.selectAll("circle.node").data(nodes);
                    var paths = d3svg.selectAll("path.edge").data(edges);
                    _this[$data] = {
                        circles:circles,
                        paths:paths
                    };
                    paths.enter().append("path").attr("class", "edge");
                    circles.enter().append("circle").attr("r", _this[$options].circle.radius).attr("class", "node").call(force.drag);
                    paths.exit().remove();
                    circles.exit().remove();
                    d3svg.selectAll("circle.node,path.edge").sort(function(a, b) {
                        return ("value" in a) - .5;
                    });
                    force.start();
                })();
            } else this.graph = new Graph();
        }
    }, {
        svg:{
            get:function() {
                return this.$.svg;
            },
            configurable:true,
            enumerable:true
        },
        force:{
            get:function() {
                return this[$force];
            },
            configurable:true,
            enumerable:true
        },
        options:{
            get:function() {
                return this[$options_layer];
            },
            set:function(options) {
                mixin(this[$options_layer], options, false, true);
            },
            configurable:true,
            enumerable:true
        }
    });
    function initializeD3(element) {
        element[$data] = {};
        element[$d3svg] = d3.select(element.svg);
        var force = d3.layout.force();
        element[$force] = force;
        force.on("tick", draw.bind(element));
        element.resize();
        addEventListener("polymer-ready", element.resize);
    }
    function draw() {
        var _$options$arrow = this[$options].arrow;
        var width = _$options$arrow.width;
        var ratio = _$options$arrow.ratio;
        var _$data = this[$data];
        var circles = _$data.circles;
        var paths = _$data.paths;
        if (circles) circles.attr("transform", function(node) {
            return "translate(" + node.x + "," + node.y + ")";
        });
        if (paths) paths.attr("d", function(_ref) {
            var source = _ref.source;
            var target = _ref.target;
            var dx = source.x - target.x;
            var dy = source.y - target.y;
            var hyp = Math.hypot(dx, dy);
            var wx = dx / hyp * width;
            var wy = dy / hyp * width;
            if (isNaN(wx)) wx = 0;
            if (isNaN(wy)) wy = 0;
            var px = source.x - wx * ratio;
            var py = source.y - wy * ratio;
            return "M" + target.x + "," + target.y + "L " + px + "," + py + "L " + (source.x + wy) + "," + (source.y - wx) + "L " + (source.x - wy) + "," + (source.y + wx) + "L " + px + "," + py;
        });
    }
    function configureOptions(element) {
        var options = {
            circle:{
                radius:6
            },
            arrow:{
                width:6,
                ratio:2
            },
            force:{
                charge:-200,
                linkDistance:36,
                linkStrength:1,
                gravity:.15
            },
            size:{
                ratio:1
            }
        };
        element[$options] = options;
        element[$options_layer] = layer(options, {
            circle:{
                radius:function(_radius) {
                    var _radiusWrapper = function radius(_x, _x2) {
                        return _radius.apply(this, arguments);
                    };
                    _radiusWrapper.toString = function() {
                        return _radius.toString();
                    };
                    return _radiusWrapper;
                }(function(radius, set) {
                    radius = parseFloat(radius);
                    if (radius < Infinity && -Infinity < radius) {
                        set(radius);
                        element[$force].tick();
                    }
                })
            },
            arrow:{
                width:function(_width) {
                    var _widthWrapper = function width(_x, _x2) {
                        return _width.apply(this, arguments);
                    };
                    _widthWrapper.toString = function() {
                        return _width.toString();
                    };
                    return _widthWrapper;
                }(function(width, set) {
                    width = parseFloat(width);
                    if (charge < Infinity && -Infinity < width) {
                        set(width);
                        element[$force].tick();
                    }
                }),
                ratio:function(_ratio) {
                    var _ratioWrapper = function ratio(_x, _x2) {
                        return _ratio.apply(this, arguments);
                    };
                    _ratioWrapper.toString = function() {
                        return _ratio.toString();
                    };
                    return _ratioWrapper;
                }(function(ratio, set) {
                    ratio = Math.abs(parseFloat(ratio));
                    if (ratio < Infinity) {
                        set(ratio);
                        element[$force].tick();
                    }
                })
            },
            force:{
                charge:function(_charge) {
                    var _chargeWrapper = function charge(_x, _x2) {
                        return _charge.apply(this, arguments);
                    };
                    _chargeWrapper.toString = function() {
                        return _charge.toString();
                    };
                    return _chargeWrapper;
                }(function(charge, set) {
                    charge = parseFloat(charge);
                    if (charge < Infinity && -Infinity < charge) {
                        set(charge);
                        element[$force].charge(charge).stop().start();
                    }
                }),
                linkDistance:function(_linkDistance) {
                    var _linkDistanceWrapper = function linkDistance(_x, _x2) {
                        return _linkDistance.apply(this, arguments);
                    };
                    _linkDistanceWrapper.toString = function() {
                        return _linkDistance.toString();
                    };
                    return _linkDistanceWrapper;
                }(function(linkDistance, set) {
                    linkDistance = Math.abs(parseFloat(linkDistance));
                    if (linkDistance < Infinity) {
                        set(linkDistance);
                        element[$force].linkDistance(linkDistance).stop().start();
                    }
                }),
                linkStrength:function(_linkStrength) {
                    var _linkStrengthWrapper = function linkStrength(_x, _x2) {
                        return _linkStrength.apply(this, arguments);
                    };
                    _linkStrengthWrapper.toString = function() {
                        return _linkStrength.toString();
                    };
                    return _linkStrengthWrapper;
                }(function(linkStrength, set) {
                    linkStrength = Math.abs(parseFloat(linkStrength));
                    if (linkStrength < Infinity) {
                        set(linkStrength);
                        element[$force].linkStrength(linkStrength).stop().start();
                    }
                }),
                gravity:function(_gravity) {
                    var _gravityWrapper = function gravity(_x, _x2) {
                        return _gravity.apply(this, arguments);
                    };
                    _gravityWrapper.toString = function() {
                        return _gravity.toString();
                    };
                    return _gravityWrapper;
                }(function(gravity, set) {
                    gravity = Math.abs(parseFloat(gravity));
                    if (gravity < Infinity) {
                        set(gravity);
                        element[$force].gravity(gravity).stop().start();
                    }
                })
            },
            size:{
                ratio:function(_ratio) {
                    var _ratioWrapper = function ratio(_x, _x2) {
                        return _ratio.apply(this, arguments);
                    };
                    _ratioWrapper.toString = function() {
                        return _ratio.toString();
                    };
                    return _ratioWrapper;
                }(function(ratio, set) {
                    ratio = Math.abs(parseFloat(ratio));
                    if (ratio < Infinity) {
                        set(ratio);
                        element.resize();
                    }
                })
            }
        });
    }
});