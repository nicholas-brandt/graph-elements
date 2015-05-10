define([ "exports", "module", "../../graph", "../../../node_modules/d3/d3", "../../external/mixin", "../../external/layer", "../../external/proxy", "../../external/requestAnimationFunction" ], function(exports, module, _graph, _node_modulesD3D3, _externalMixin, _externalLayer, _externalProxy, _externalRequestAnimationFunction) {
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
    var proxy = _interopRequire(_externalProxy);
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var $force = Symbol();
    var $config = Symbol();
    var $config_layer = Symbol();
    var $config_modifier = Symbol();
    var $config_change_callback = Symbol();
    var $proxy_handler = Symbol();
    var $data = Symbol();
    var $d3svg = Symbol();
    var $graph = Symbol();
    var $graph_change_callback = Symbol();
    var $resize = Symbol();
    var $draw = Symbol();
    var force_size = 1e3;
    var min_zoom = .35;
    module.exports = Object.defineProperties({
        is:"graphjs-tezcatlipoca",
        created:function created() {
            implementConfig(this);
        },
        ready:function ready() {
            implementUIBehavior(this);
            implementD3(this);
            mixin(this.config, this.config, mixin.OVERRIDE);
            this.resize();
            addEventListener("polymer-ready", this[$resize]);
        },
        attached:function attached() {
            addEventListener("resize", this[$resize]);
        },
        detached:function detached() {
            removeEventListener("resize", this[$resize]);
        },
        draw:function draw() {
            this[$draw]();
        },
        resize:function resize() {
            this[$resize]();
        },
        updateGraph:function updateGraph() {
            var _this = this;
            console.log("update graph");
            if (this.graph) {
                (function() {
                    var index = 0;
                    var node_map = _this.graph.nodes;
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
                    var entering_circles = circles.enter().append("circle").attr("r", _this.config.UI.circle.radius).attr("class", "node");
                    implementNodeUIBehavior(_this, entering_circles);
                    paths.exit().remove();
                    circles.exit().remove();
                    d3svg.selectAll("circle.node,path.edge").sort(function(a, b) {
                        return ("index" in a) - .5;
                    });
                    var state = _this.config.state;
                    state.selected = state.selected;
                    _this.startForce();
                })();
            } else this.graph = new Graph(true);
            this[$graph_change_callback]();
        },
        toNodeCoordinates:function toNodeCoordinates(x, y) {
            var _getComputedStyle = getComputedStyle(this.svg);
            var width = _getComputedStyle.width;
            var height = _getComputedStyle.height;
            var zoom = this.config.UI.size.zoom;
            var baseVal = this.svg.viewBox.baseVal;
            return {
                x:x / parseFloat(width) / zoom * force_size,
                y:y / parseFloat(height) / zoom * force_size
            };
        },
        startForce:function startForce() {
            console.log("start force", this.force.alpha());
            if (this.config.d3.force.enabled) {
                if (!this.force.alpha()) this.force.start();
            } else this.draw();
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
        config:{
            get:function() {
                return this[$config_layer];
            },
            set:function(config) {
                mixin(this[$config_layer], config, mixin.OVERRIDE);
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
        },
        proxyHandler:{
            get:function() {
                return this[$proxy_handler];
            },
            set:function(handler) {
                this[$proxy_handler] = handler;
                this[$config_layer] = layer(proxy(this[$config], handler), this[$config_modifier], this[$config_change_callback]);
            },
            configurable:true,
            enumerable:true
        }
    });
    function implementConfig(element) {
        element[$config] = {
            UI:{
                circle:{
                    radius:6
                },
                arrow:{
                    width:5.5,
                    ratio:2
                },
                size:{
                    zoom:2,
                    offset:{
                        x:0,
                        y:0
                    }
                }
            },
            d3:{
                force:{
                    charge:-200,
                    linkDistance:30,
                    linkStrength:1,
                    gravity:.15,
                    enabled:false
                }
            },
            state:{
                mode:"default",
                selected:undefined
            }
        };
        element[$config_modifier] = {
            UI:{
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
                                element.updateGraph();
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
                                element.updateGraph();
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
                                element.updateGraph();
                            }
                        })
                    }
                },
                size:{
                    zoom:{
                        set:function(_set) {
                            var _setWrapper = function set(_x, _x2) {
                                return _set.apply(this, arguments);
                            };
                            _setWrapper.toString = function() {
                                return _set.toString();
                            };
                            return _setWrapper;
                        }(function(zoom, set) {
                            zoom = Math.max(min_zoom, parseFloat(zoom));
                            if (zoom < Infinity) {
                                set(zoom);
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
            },
            d3:{
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
                                element.force.charge(charge);
                                element.startForce();
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
                                element.force.linkDistance(linkDistance * 2e3 / Math.hypot(parseFloat(width), parseFloat(height)));
                                element.startForce();
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
                                element.force.linkStrength(linkStrength);
                                element.startForce();
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
                                element.force.gravity(gravity);
                                element.startForce();
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
                            if (enabled) element.startForce(); else element.force.stop();
                        })
                    }
                }
            },
            state:{
                mode:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(mode, set) {
                        mode = [ "default", "edit" ].indexOf(mode) != -1 ? mode :"default";
                        element.setAttribute("mode", mode);
                        element.dispatchEvent(new CustomEvent("modechange", {
                            detail:mode
                        }));
                        set(mode);
                    })
                },
                selected:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(selected, set) {
                        console.log("select", selected);
                        if (isNaN(selected)) selected = undefined;
                        var circles = element[$d3svg].selectAll("circle.node");
                        var circle = circles.filter(function() {
                            return selected === this.__data__.index;
                        }).node();
                        circles.each(function() {
                            if (this !== circle) this.classList.remove("selected");
                        });
                        if (circle && selected !== undefined) {
                            circle.classList.add("selected");
                            set(selected);
                        } else {
                            element.config.state.mode = "default";
                            set(undefined);
                        }
                    })
                }
            }
        };
        element[$config_change_callback] = requestAnimationFunction(function() {
            console.log("dispatch config change");
            element.dispatchEvent(new CustomEvent("configchange"));
        });
        element.proxyHandler = {};
        element[$graph_change_callback] = requestAnimationFunction(function() {
            console.log("dispatch graph change");
            element.dispatchEvent(new CustomEvent("graphchange"));
        });
        element[$resize] = requestAnimationFunction(function() {
            var svg = element.svg;
            var _getComputedStyle = getComputedStyle(svg);
            var width = _getComputedStyle.width;
            var height = _getComputedStyle.height;
            var zoom = element.config.UI.size.zoom;
            width = parseFloat(width) / zoom;
            height = parseFloat(height) / zoom;
            mixin(svg.viewBox.baseVal, {
                x:-width / 2,
                y:-height / 2,
                width:width,
                height:height
            }, mixin.OVERRIDE);
            element.config.d3.force.linkDistance += 0;
        });
        element[$draw] = requestAnimationFunction(function() {
            console.log("draw");
            var _element$svg$viewBox$baseVal = element.svg.viewBox.baseVal;
            var x = _element$svg$viewBox$baseVal.x;
            var y = _element$svg$viewBox$baseVal.y;
            var width = _element$svg$viewBox$baseVal.width;
            var height = _element$svg$viewBox$baseVal.height;
            var offset = element.config.UI.size.offset;
            var zoom = element.config.UI.size.zoom;
            x = x * zoom + offset.x;
            y = y * zoom + offset.y;
            width *= zoom / force_size;
            height *= zoom / force_size;
            var arrow = element.config.UI.arrow;
            var _element$$data = element[$data];
            var circles = _element$$data.circles;
            var paths = _element$$data.paths;
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
        });
    }
    function implementD3(element) {
        element[$data] = {};
        element[$d3svg] = d3.select(element.svg);
        var force = d3.layout.force();
        element[$force] = force;
        force.on("tick", element[$draw]);
        force.on("end", element[$graph_change_callback]);
        force.size([ force_size, force_size ]);
    }
    function implementUIBehavior(element) {
        var size_transition = layer(element.config.UI.size, {
            zoom:{
                translate:function translate(zoom) {
                    console.log("zoom", zoom);
                },
                duration:280
            },
            offset:{
                x:{
                    translate:function translate(x) {
                        console.log("x", x);
                    }
                },
                y:{
                    translate:function translate(y) {
                        console.log("y", y);
                    }
                }
            }
        });
        element.svg.addEventListener("wheel", function(_ref) {
            var layerX = _ref.layerX;
            var layerY = _ref.layerY;
            var wheelDelta = _ref.wheelDelta;
            size_transition.zoom = Math.max(0, size_transition.zoom + wheelDelta / 20);
        });
        PolymerGestures.addEventListener(element.svg, "tap", function(event) {
            console.log("tap");
            event.bubbles = false;
            if (event.srcElement === element.svg) {
                element[$d3svg].selectAll("circle.node").each(function() {
                    this.classList.remove("selected");
                });
                element.config.state.selected = undefined;
            }
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
                        size_transition.zoom = Math.max(0, size_transition.zoom + (scale - last_scale) * 2);
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
                var zoom = element.config.UI.size.zoom;
                element.config.UI.size.offset.x += event.ddx / zoom;
                element.config.UI.size.offset.y += event.ddy / zoom;
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
                        added = true;
                        console.log("add node");
                        element.graph.addNode({});
                        element.updateGraph();
                    }
                });
            })();
        }
    }
    function implementNodeUIBehavior(element, selection) {
        console.log("entering circles", selection);
        var graph = element.graph;
        var state = element.config.state;
        selection.each(function() {
            var _this = this;
            console.log("each");
            PolymerGestures.addEventListener(this, "tap", function(event) {
                console.log("tap on node", _this.__data__.index);
                event.bubbles = false;
                if (state.mode == "edit") {
                    var node_map = new Map(function() {
                        var _ref = [];
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;
                        try {
                            for (var _iterator = graph.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var _step$value = _slicedToArray(_step.value, 2);
                                var key = _step$value[0];
                                var index = _step$value[1].index;
                                _ref.push([ index, key ]);
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
                    var edge = [ node_map.get(state.selected), node_map.get(_this.__data__.index) ];
                    if (graph.hasEdge.apply(graph, edge)) graph.removeEdge.apply(graph, edge); else graph.addEdge.apply(graph, edge);
                    element.updateGraph();
                } else state.selected = _this.__data__.index;
            });
            PolymerGestures.addEventListener(this, "trackstart", function(event) {
                event.preventTap();
                event.bubbles = false;
                _this.__data__.fixed = true;
            });
            PolymerGestures.addEventListener(this, "track", function(event) {
                event.bubbles = false;
                var _element$toNodeCoordinates = element.toNodeCoordinates(event.ddx, event.ddy);
                var x = _element$toNodeCoordinates.x;
                var y = _element$toNodeCoordinates.y;
                var datum = _this.__data__;
                datum.px = datum.x += x;
                datum.py = datum.y += y;
                element.draw();
            });
            PolymerGestures.addEventListener(this, "trackend", function(event) {
                event.bubbles = false;
                _this.__data__.fixed = false;
            });
            PolymerGestures.addEventListener(this, "hold", function(event) {
                console.log("hold on node");
                event.bubbles = false;
                event.preventTap();
                state.selected = _this.__data__.index;
                state.mode = "edit";
            });
        });
    }
});