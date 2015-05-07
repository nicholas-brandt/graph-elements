define([ "exports", "module", "../../graph", "../../../node_modules/d3/d3", "../../external/mixin", "../../external/layer", "../../external/requestAnimationFunction" ], function(exports, module, _graph, _node_modulesD3D3, _externalMixin, _externalLayer, _externalRequestAnimationFunction) {
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
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var $force = Symbol();
    var $options = Symbol();
    var $options_layer = Symbol();
    var $data = Symbol();
    var $d3svg = Symbol();
    var $graph = Symbol();
    var force_size = 1e3;
    var min_ratio = .35;
    module.exports = Object.defineProperties({
        is:"graphjs-tezcatlipoca",
        ready:function ready() {
            initializeD3(this);
            this.options = this[$options];
        },
        created:function created() {
            var element = this;
            configureOptions(element);
            element.resize = requestAnimationFunction(function() {
                var svg = element.svg;
                var _getComputedStyle = getComputedStyle(svg);
                var width = _getComputedStyle.width;
                var height = _getComputedStyle.height;
                var ratio = element[$options].size.ratio;
                width = parseFloat(width) / ratio;
                height = parseFloat(height) / ratio;
                mixin(svg.viewBox.baseVal, {
                    x:-width / 2,
                    y:-height / 2,
                    width:width,
                    height:height
                }, mixin.OVERRIDE);
                element.options.force.linkDistance += 0;
                element.options.force.start();
                draw.call(element);
            });
        },
        attached:function attached() {
            addEventListener("resize", this.resize);
        },
        detached:function detached() {
            removeEventListener("resize", this.resize);
        },
        updateGraph:function updateGraph() {
            var _this = this;
            console.log("update graph");
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
                    var force = _this.force;
                    force.nodes(nodes).links(edges);
                    var d3svg = _this[$d3svg];
                    var circles = d3svg.selectAll("circle.node").data(nodes);
                    var paths = d3svg.selectAll("path.edge").data(edges);
                    _this[$data] = {
                        circles:circles,
                        paths:paths
                    };
                    paths.enter().append("path").attr("class", "edge");
                    var entering_circles = circles.enter().append("circle").attr("r", _this[$options].circle.radius).attr("class", "node");
                    implementDrag(_this, entering_circles);
                    paths.exit().remove();
                    circles.exit().remove();
                    d3svg.selectAll("circle.node,path.edge").sort(function(a, b) {
                        return ("value" in a) - .5;
                    });
                    force.start();
                    for (var i = 0; i < 10; ++i) {
                        force.tick();
                    }
                    force.alpha(0);
                    _this.options.force.start();
                })();
            } else this.graph = new Graph();
        },
        toNodeCoordinates:function toNodeCoordinates(x, y) {
            var _getComputedStyle = getComputedStyle(this.svg);
            var width = _getComputedStyle.width;
            var height = _getComputedStyle.height;
            var ratio = this.options.size.ratio;
            var baseVal = this.svg.viewBox.baseVal;
            return {
                x:x / parseFloat(width) / ratio * force_size,
                y:y / parseFloat(height) / ratio * force_size
            };
        },
        selectNode:function selectNode(index) {
            console.log("select", index);
            var circles = this[$d3svg].selectAll("circle.node");
            var circle = circles.filter(function(datum) {
                return index == datum.index;
            }).node();
            circles.each(function() {
                if (this !== circle) this.classList.remove("selected");
            });
            if (circle) {
                circle.classList.add("selected");
                this.dispatchEvent(new CustomEvent("select", {
                    detail:{
                        circle:circle,
                        datum:circle.__data__
                    }
                }));
            } else this.dispatchEvent(new CustomEvent("unselect"));
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
                mixin(this[$options_layer], options, mixin.OVERRIDE);
            },
            configurable:true,
            enumerable:true
        },
        graph:{
            get:function() {
                return this[$graph];
            },
            set:function(graph) {
                this[$graph] = graph;
                this.updateGraph();
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
        force.size([ force_size, force_size ]);
        element.resize();
        addEventListener("polymer-ready", element.resize);
        var size_transition = layer(element.options.size, {
            ratio:{
                translate:function translate(ratio) {
                    console.log("ratio", ratio);
                    element.resize();
                },
                duration:280
            },
            offset:{
                x:{
                    translate:function translate(x) {
                        console.log("x", x);
                        element.resize();
                    }
                },
                y:{
                    translate:function translate(y) {
                        console.log("y", y);
                        element.resize();
                    }
                }
            }
        });
        element.svg.addEventListener("wheel", function(_ref) {
            var layerX = _ref.layerX;
            var layerY = _ref.layerY;
            var wheelDelta = _ref.wheelDelta;
            var _getComputedStyle = getComputedStyle(element.svg);
            var width = _getComputedStyle.width;
            var height = _getComputedStyle.height;
            size_transition.ratio = Math.max(0, size_transition.ratio + wheelDelta / 20);
        });
        PolymerGestures.addEventListener(element.svg, "tap", function(event) {
            console.log("tap");
            event.bubbles = false;
            if (event.srcElement === element.svg) {
                element[$d3svg].selectAll("circle.node").each(function() {
                    this.classList.remove("selected");
                });
                element.dispatchEvent(new CustomEvent("deselect"));
            }
        });
        element.svg.addEventListener("click", function(_ref) {
            var layerX = _ref.layerX;
            var layerY = _ref.layerY;
            return console.log(layerX, layerY);
        });
        {
            (function() {
                var timeout = undefined;
                var last_scale = undefined;
                PolymerGestures.addEventListener(element.svg, "pinch", function(_ref) {
                    var scale = _ref.scale;
                    var preventTap = _ref.preventTap;
                    preventTap();
                    if (last_scale !== undefined) {
                        size_transition.ratio = Math.max(0, size_transition.ratio + (scale - last_scale) * 2);
                        clearTimeout(timeout);
                        timeout = setTimeout(function() {
                            last_scale = undefined;
                        }, 1e3);
                    }
                    last_scale = scale;
                });
            })();
        }
        PolymerGestures.addEventListener(element.svg, "track", function(event) {
            console.log("track");
            event.bubbles = false;
            if (event.srcElement === element.svg) {
                var ratio = element.options.size.ratio;
                element.options.size.offset.x += event.ddx / ratio;
                element.options.size.offset.y += event.ddy / ratio;
            }
        });
        {
            (function() {
                var added = undefined;
                PolymerGestures.addEventListener(element.svg, "hold", function(event) {
                    console.log("hold");
                    event.bubbles = false;
                    event.preventTap();
                    if (event.srcElement === element.svg) added = false;
                });
                PolymerGestures.addEventListener(element.svg, "holdpulse", function(_ref) {
                    var x = _ref.x;
                    var y = _ref.y;
                    var srcElement = _ref.srcElement;
                    var holdTime = _ref.holdTime;
                    console.log("holdpulse");
                    event.bubbles = false;
                    if (srcElement === element.svg && holdTime > 800 && !added) {
                        var getUniqueID = function() {
                            return element.graph.nodes.size;
                        };
                        added = true;
                        console.log("add node");
                        element.graph.addNode(getUniqueID());
                        element.updateGraph();
                    }
                });
            })();
        }
    }
    function draw() {
        var _svg$viewBox$baseVal = this.svg.viewBox.baseVal;
        var x = _svg$viewBox$baseVal.x;
        var y = _svg$viewBox$baseVal.y;
        var width = _svg$viewBox$baseVal.width;
        var height = _svg$viewBox$baseVal.height;
        var offset = this.options.size.offset;
        var ratio = this.options.size.ratio;
        x = x * ratio + offset.x;
        y = y * ratio + offset.y;
        width *= ratio / force_size;
        height *= ratio / force_size;
        var arrow = this.options.arrow;
        var _$data = this[$data];
        var circles = _$data.circles;
        var paths = _$data.paths;
        if (circles) circles.attr("transform", function(node) {
            return "translate(" + (node.x * width + x) + "," + (node.y * height + y) + ")";
        });
        if (paths) paths.attr("d", function(_ref) {
            var source = _ref.source;
            var target = _ref.target;
            var sx = source.x * width + x;
            var sy = source.y * height + y;
            var tx = target.x * width + x;
            var ty = target.y * height + y;
            var dx = sx - tx;
            var dy = sy - ty;
            var hyp = Math.hypot(dx, dy);
            var wx = dx / hyp * arrow.width;
            var wy = dy / hyp * arrow.width;
            if (isNaN(wx)) wx = 0;
            if (isNaN(wy)) wy = 0;
            var px = sx - wx * arrow.ratio;
            var py = sy - wy * arrow.ratio;
            return "M" + tx + "," + ty + "L " + px + "," + py + "L " + (sx + wy) + "," + (sy - wx) + "L " + (sx - wy) + "," + (sy + wx) + "L " + px + "," + py;
        });
    }
    function configureOptions(element) {
        var options = {
            circle:{
                radius:6
            },
            arrow:{
                width:5.5,
                ratio:2
            },
            force:{
                charge:-200,
                linkDistance:30,
                linkStrength:1,
                gravity:.15,
                enabled:true,
                start:function start() {
                    if (element.options.force.enabled) {
                        var force = element.force;
                        force.start();
                        force.alpha(.1);
                    }
                }
            },
            size:{
                ratio:2,
                offset:{
                    x:0,
                    y:0
                }
            }
        };
        element[$options] = options;
        element[$options_layer] = layer(options, {
            circle:{
                radius:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(radius, set) {
                        radius = parseFloat(radius);
                        if (radius < Infinity && -Infinity < radius) {
                            set(radius);
                            element.force.stop();
                            element.options.force.start();
                        }
                    })
                }
            },
            arrow:{
                width:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(width, set) {
                        width = parseFloat(width);
                        if (width < Infinity && -Infinity < width) {
                            set(width);
                            element.force.stop();
                            element.options.force.start();
                        }
                    })
                },
                ratio:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(ratio, set) {
                        ratio = Math.abs(parseFloat(ratio));
                        if (ratio < Infinity) {
                            set(ratio);
                            element.force.stop();
                            element.options.force.start();
                        }
                    })
                }
            },
            force:{
                charge:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(charge, set) {
                        charge = parseFloat(charge);
                        if (charge < Infinity && -Infinity < charge) {
                            set(charge);
                            element.force.charge(charge).stop();
                            element.options.force.start();
                        }
                    })
                },
                linkDistance:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(linkDistance, set) {
                        linkDistance = Math.max(0, parseFloat(linkDistance));
                        if (linkDistance < Infinity) {
                            var _getComputedStyle = getComputedStyle(element.svg);
                            var width = _getComputedStyle.width;
                            var height = _getComputedStyle.height;
                            set(linkDistance);
                            element.force.linkDistance(linkDistance * 2e3 / Math.hypot(parseFloat(width), parseFloat(height))).stop();
                            element.options.force.start();
                        }
                    })
                },
                linkStrength:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(linkStrength, set) {
                        linkStrength = Math.max(0, parseFloat(linkStrength));
                        if (linkStrength < Infinity) {
                            set(linkStrength);
                            element.force.linkStrength(linkStrength).stop();
                            element.options.force.start();
                        }
                    })
                },
                gravity:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(gravity, set) {
                        gravity = Math.max(0, parseFloat(gravity));
                        if (gravity < Infinity) {
                            set(gravity);
                            element.force.gravity(gravity).stop();
                            element.options.force.start();
                        }
                    })
                },
                enabled:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(enabled, set) {
                        set(!!enabled);
                        if (enabled) element.force.start(); else element.force.stop();
                    })
                }
            },
            size:{
                ratio:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(ratio, set) {
                        ratio = Math.max(min_ratio, parseFloat(ratio));
                        if (ratio < Infinity) {
                            set(ratio);
                            element.resize();
                        }
                    })
                },
                offset:{
                    x:{
                        set:function(_set) {
                            var _setWrapper = function set(_x, _x2) {
                                return _set.apply(this, arguments);
                            };
                            _setWrapper.toString = function() {
                                return _set.toString();
                            };
                            return _setWrapper;
                        }(function(x, set) {
                            x = parseFloat(x);
                            if (x < Infinity && -Infinity < x) {
                                set(x);
                                element.resize();
                            }
                        })
                    },
                    y:{
                        set:function(_set) {
                            var _setWrapper = function set(_x, _x2) {
                                return _set.apply(this, arguments);
                            };
                            _setWrapper.toString = function() {
                                return _set.toString();
                            };
                            return _setWrapper;
                        }(function(y, set) {
                            y = parseFloat(y);
                            if (y < Infinity && -Infinity < y) {
                                set(y);
                                element.resize();
                            }
                        })
                    }
                }
            }
        });
    }
    function implementDrag(element, selection) {
        console.log("entering circles", selection);
        selection.each(function(datum, index) {
            PolymerGestures.addEventListener(this, "tap", function(event) {
                event.preventTap();
                event.bubbles = false;
                element.selectNode(index);
            });
            PolymerGestures.addEventListener(this, "trackstart", function(event) {
                event.preventTap();
                event.bubbles = false;
                datum.fixed = true;
            });
            PolymerGestures.addEventListener(this, "track", function(event) {
                event.bubbles = false;
                var _element$toNodeCoordinates = element.toNodeCoordinates(event.ddx, event.ddy);
                var x = _element$toNodeCoordinates.x;
                var y = _element$toNodeCoordinates.y;
                datum.px = datum.x += x;
                datum.py = datum.y += y;
                draw.call(element);
            });
            PolymerGestures.addEventListener(this, "trackend", function(event) {
                event.bubbles = false;
                datum.fixed = false;
            });
            PolymerGestures.addEventListener(this, "hold", function(event) {
                event.bubbles = false;
                event.preventTap();
            });
        });
    }
});