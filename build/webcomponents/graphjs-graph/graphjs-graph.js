"use strict";

Polymer({
    is:"graphjs-graph",
    properties:{
        nodes:{
            type:Array,
            notify:true,
            value:function() {
                return [];
            }
        },
        edges:{
            type:Array,
            notify:true,
            value:function() {
                return [];
            }
        }
    },
    observers:[ "_nodesChange(nodes.*)", "_edgesChange(edges.*)" ],
    _nodesChange:function _nodesChange(record) {
        var level = (record.path.match(/\./g) || []).length;
        if (level == 2) {
            var node = this.get(record.path.substring(0, record.path.indexOf(".", record.path.indexOf(".") + 1)));
            var post_fix = record.path.substr(record.path.lastIndexOf(".") + 1);
            if (node.dependent_edges) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;
                try {
                    for (var _iterator = node.dependent_edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var dependent_edge = _step.value;
                        this.notifyPath("edges." + this.edges.indexOf(dependent_edge) + ".target." + post_fix, dependent_edge.target[post_fix]);
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
            }
            if (node.dependency_edges) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;
                try {
                    for (var _iterator2 = node.dependency_edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependency_edge = _step2.value;
                        this.notifyPath("edges." + this.edges.indexOf(dependency_edge) + ".source." + post_fix, dependency_edge.source[post_fix]);
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
    },
    _edgesChange:function _edgesChange(record) {},
    addNode:function addNode(node) {
        if (!this.hasNode(node)) {
            this.push("nodes", node);
            return true;
        }
        return false;
    },
    removeNode:function removeNode(node) {
        if (this.hasNode(node)) {
            if (node.dependent_edges) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;
                try {
                    for (var _iterator = node.dependent_edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var dependent_edge = _step.value;
                        this.arrayDelete("edges", dependent_edge);
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
            }
            if (node.dependency_edges) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;
                try {
                    for (var _iterator2 = node.dependency_edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependency_edge = _step2.value;
                        this.arrayDelete("edges", dependency_edge);
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
            this.arrayDelete("nodes", node);
            return true;
        }
        return false;
    },
    hasNode:function hasNode(node) {
        return this.nodes.indexOf(node) != -1;
    },
    addEdge:function addEdge(source, target) {
        if (this.hasNode(source) && this.hasNode(target)) {
            if (!target.dependent_edges) target.dependent_edges = [];
            if (!source.dependency_edges) source.dependency_edges = [];
            if (source.dependency_edges.indexOf(target) == -1 && target.dependent_edges.indexOf(source) == -1) {
                var edge = {
                    source:source,
                    target:target,
                    loop:source === target
                };
                source.dependency_edges.push(edge);
                target.dependent_edges.push(edge);
                this.push("edges", edge);
                return true;
            }
        }
        return false;
    },
    removeEdge:function removeEdge(source, target) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
        try {
            for (var _iterator = this.edges[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var edge = _step.value;
                if (edge.source == source && edge.target == target) this.arrayDelete("edges", edge);
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
    },
    clear:function clear() {
        this.set("edges", []);
        this.set("nodes", []);
    },
    hasCycle:function hasCycle() {
        var directed = true;
        var finished = new Set();
        var visited = new Set();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
        try {
            for (var _iterator = this.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var node = _step.value;
                var depth = DFS.call(this, node, undefined, 0);
                if (depth) return true;
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
        return false;
        function DFS(node, dependency, length) {
            if (!finished.has(node)) {
                if (visited.has(node)) {
                    return length;
                }
                visited.add(node);
                if (node.dependent_edges) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;
                    try {
                        for (var _iterator2 = node.dependent_edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var source = _step2.value.source;
                            if (directed || source !== dependency) {
                                var depth = DFS.call(this, source, node, length + 1);
                                if (depth) return depth;
                            }
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
                finished.add(node);
            }
        }
    },
    importObject:function importObject(object) {
        if (typeof object != "object") throw Error("Argument is not an object!");
        serialize(object, this);
    }
});

function serialize(object, graph) {
    var node = {
        value:object,
        x:Math.random() * 100,
        y:Math.random() * 100,
        radius:20
    };
    graph.addNode(node);
    if (typeof object == "object") for (var property in object) {
        try {
            var value = object[property];
            var match_node = undefined;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
                for (var _iterator = graph.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var current_node = _step.value;
                    if (current_node.value === value) {
                        match_node = current_node;
                        break;
                    }
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
            if (!match_node) match_node = serialize(value, graph);
            graph.addEdge(node, match_node);
        } catch (e) {}
    }
    return node;
}