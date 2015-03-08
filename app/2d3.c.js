System.register([], function (_export) {
    var _slicedToArray, _classCallCheck, D3SVG;

    return {
        setters: [],
        execute: function () {
            "use strict";

            _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

            _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            D3SVG = _export("D3SVG", function D3SVG(svg, graph) {
                _classCallCheck(this, D3SVG);

                var computed = getComputedStyle(svg);
                var force = d3.layout.force().linkDistance(10).linkStrength(3).size([parseInt(computed.width), parseInt(computed.height)]);
                var svg = d3.select(svg);
                var node_map = new Map();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = graph.nodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _node = _step.value;
                        node_map.set(_node, {
                            value: _node
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

                            var _node2 = _step2$value[1];

                            _nodes.push(_node2);
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
                var edges = [];
                var links = [];
                var intermediates = [];
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
                        intermediates.push(intermediate);
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

                force.nodes(nodes.concat(intermediates)).links(edges).start();
                var edge = svg.selectAll("path").data(links).enter().append("path");
                var node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("r", 5).call(force.drag);
                force.on("tick", function () {
                    edge.attr("d", function (_ref) {
                        var _ref2 = _slicedToArray(_ref, 3);

                        var source = _ref2[0];
                        var intermediate = _ref2[1];
                        var target = _ref2[2];
                        return "M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y;
                    });
                    node.attr("transform", function (node) {
                        return "translate(" + node.x + "," + node.y + ")";
                    });
                });
            });
        }
    };
});
