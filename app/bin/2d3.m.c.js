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
                var $nodes = Symbol();
                var $intermediates = Symbol();
                var $edges = Symbol();
                var $links = Symbol();
                var $dom_svg = Symbol();
                var $graph = Symbol();
                /**
                 * @class User interface
                 * Displays the data of the given graph.
                 * */
                return (function () {
                    function D3SVG(dom_svg, graph) {
                        var options = arguments[2] === undefined ? {} : arguments[2];

                        _classCallCheck(this, D3SVG);

                        if (!graph) throw Error("No graph specified");
                        this[$graph] = graph;
                        var _options$linkDistance = options.linkDistance;
                        var linkDistance = _options$linkDistance === undefined ? 10 : _options$linkDistance;
                        var _options$linkStrength = options.linkStrength;
                        var linkStrength = _options$linkStrength === undefined ? 3 : _options$linkStrength;

                        this[$nodes] = [];
                        this[$edges] = [];
                        this[$intermediates] = [];
                        this[$links] = [];
                        this[$dom_svg] = dom_svg;
                        this[$force] = d3.layout.force().linkDistance(linkDistance).linkStrength(linkStrength);
                        var svg = d3.select(dom_svg);
                        var nodes = svg.selectAll("circle").data(this[$nodes]).enter().append("circle").attr("r", 5).call(this[$force].drag);
                        var edges = svg.selectAll("path").data(this[$edges]).enter().append("path");
                        this[$force].on("tick", function () {
                            edges.attr("d", function (_ref) {
                                var _ref2 = _slicedToArray(_ref, 3);

                                var source = _ref2[0];
                                var intermediate = _ref2[1];
                                var target = _ref2[2];
                                return "M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y;
                            });
                            nodes.attr("transform", function (node) {
                                return "translate(" + node.x + "," + node.y + ")";
                            });
                        });
                        this.update();
                    }

                    _prototypeProperties(D3SVG, null, {
                        update: {
                            value: function update() {
                                var nodes = this[$nodes];
                                nodes.length = 0;
                                var edges = this[$edges];
                                edges.length = 0;
                                var intermediates = this[$intermediates];
                                intermediates.length = 0;
                                var links = this[$links];
                                links.length = 0;
                                var _iteratorNormalCompletion = true;
                                var _didIteratorError = false;
                                var _iteratorError = undefined;

                                try {
                                    for (var _iterator = this[$graph].nodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                        var node = _step.value;
                                        nodes.push({
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

                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = this[$graph].edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var _step2$value = _slicedToArray(_step2.value, 2);

                                        var source_node = _step2$value[0];
                                        var target_node = _step2$value[1];

                                        var source = {
                                            value: source_node
                                        };
                                        var target = {
                                            value: target_node
                                        };
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

                                var _getComputedStyle = getComputedStyle(this[$dom_svg]);

                                var width = _getComputedStyle.width;
                                var height = _getComputedStyle.height;

                                this[$force].size([parseInt(width), parseInt(height)]);
                                this[$force].nodes(nodes.concat(intermediates)).links(links).start();
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
