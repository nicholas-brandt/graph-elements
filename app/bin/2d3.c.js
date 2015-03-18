System.register([], function (_export) {
    var _slicedToArray, _prototypeProperties, _classCallCheck, D3SVG;

    return {
        setters: [],
        execute: function () {
            "use strict";

            _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

            _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            D3SVG = _export("D3SVG", (function () {
                var $force = Symbol();
                var $forced = Symbol();
                var $drawn = Symbol();
                var $dom_svg = Symbol();
                var $graph = Symbol();
                /**
                 * @class User interface
                 * Displays the data of the given graph.
                 * */
                return (function () {
                    function D3SVG(dom_svg, graph, _ref) {
                        var _ref$linkDistance = _ref.linkDistance;
                        var linkDistance = _ref$linkDistance === undefined ? 10 : _ref$linkDistance;
                        var _ref$linkStrength = _ref.linkStrength;
                        var linkStrength = _ref$linkStrength === undefined ? 3 : _ref$linkStrength;

                        _classCallCheck(this, D3SVG);

                        if (!graph) throw Error("No graph specified");
                        this[$forced] = {
                            nodes: [],
                            edges: []
                        };
                        this[$drawn] = {
                            nodes: [],
                            edges: []
                        };
                        this[$dom_svg] = dom_svg;
                        this[$force] = d3.layout.force().linkDistance(linkDistance).linkStrength(linkStrength);
                        var svg = d3.select(dom_svg);
                        var nodes = svg.selectAll("circle").data(this[$drawn].nodes).enter().append("circle").attr("r", 5).call(this[$force].drag);
                        var edges = svg.selectAll("path").data(this[$drawn].edges).enter().append("path");
                        this[$force].on("tick", function () {
                            edges.attr("d", function (_ref2) {
                                var _ref22 = _slicedToArray(_ref2, 3);

                                var source = _ref22[0];
                                var intermediate = _ref22[1];
                                var target = _ref22[2];
                                return "M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y;
                            });
                            nodes.attr("transform", function (node) {
                                return "translate(" + node.x + "," + node.y + ")";
                            });
                        });
                    }

                    _prototypeProperties(D3SVG, null, {
                        update: {
                            value: function update() {
                                var node_map = new Map();
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = graph.nodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var node = _step.value;
                                        node_map.set(node, {
                                            value: node
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

                                var nodes = (function () {
                                    var _nodes = [];
                                    var _iteratorNormalCompletion2 = true;
                                    var _didIteratorError2 = false;
                                    var _iteratorError2 = undefined;

                                    try {
                                        for (var _iterator2 = node_map[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                            var _step2$value = _slicedToArray(_step2.value, 2);

                                            var node = _step2$value[1];

                                            _nodes.push(node);
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

                                    return _nodes;
                                })();
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = graph.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var _step2$value = _slicedToArray(_step2.value, 2);

                                        var source_node = _step2$value[0];
                                        var target_node = _step2$value[1];

                                        var source = node_map.get(source_node);
                                        var target = node_map.get(target_node);
                                        var intermediate = {};
                                        nodes.push(intermediate);
                                        edges.push({
                                            source: source,
                                            target: intermediate
                                        }, {
                                            source: intermediate,
                                            target: target
                                        });
                                        links.push([source, intermediate, target]);
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

                                this[$drawn].nodes.clear();

                                var _getComputedStyle = getComputedStyle(this[$dom_svg]);

                                var width = _getComputedStyle.width;
                                var height = _getComputedStyle.height;

                                this[$force].size([parseInt(width), parseInt(height)]);
                                force.nodes(this[$forced].nodes).links(this[$forced].edges).start();
                            },
                            writable: true,
                            configurable: true
                        },
                        graph: {
                            get: function () {
                                return this[$graph];
                            },
                            configurable: true
                        }
                    });

                    return D3SVG;
                })();
            })());
        }
    };
});
