"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} :function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" :typeof obj;
};

Polymer({
    is:"graphjs-graph",
    properties:{
        nodes:{
            type:Array,
            notify:true,
            value:function value() {
                return [];
            }
        },
        edges:{
            type:Array,
            notify:true,
            value:function value() {
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
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
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
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
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
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;
                try {
                    for (var _iterator3 = node.dependent_edges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var dependent_edge = _step3.value;
                        this.arrayDelete("edges", dependent_edge);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
            if (node.dependency_edges) {
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;
                try {
                    for (var _iterator4 = node.dependency_edges[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var dependency_edge = _step4.value;
                        this.arrayDelete("edges", dependency_edge);
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
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
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;
        try {
            for (var _iterator5 = this.edges[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var edge = _step5.value;
                if (edge.source == source && edge.target == target) this.arrayDelete("edges", edge);
            }
        } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                    _iterator5.return();
                }
            } finally {
                if (_didIteratorError5) {
                    throw _iteratorError5;
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
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;
        try {
            for (var _iterator6 = this.nodes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var node = _step6.value;
                var depth = DFS.call(this, node, undefined, 0);
                if (depth) return true;
            }
        } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                }
            } finally {
                if (_didIteratorError6) {
                    throw _iteratorError6;
                }
            }
        }
        return false;
        function DFS(node, dependency, length) {
            if (!finished.has(node)) {
                if (visited.has(node)) return length;
                visited.add(node);
                if (node.dependent_edges) {
                    var _iteratorNormalCompletion7 = true;
                    var _didIteratorError7 = false;
                    var _iteratorError7 = undefined;
                    try {
                        for (var _iterator7 = node.dependent_edges[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            var source = _step7.value.source;
                            if (directed || source !== dependency) {
                                var depth = DFS.call(this, source, node, length + 1);
                                if (depth) return depth;
                            }
                        }
                    } catch (err) {
                        _didIteratorError7 = true;
                        _iteratorError7 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion7 && _iterator7.return) {
                                _iterator7.return();
                            }
                        } finally {
                            if (_didIteratorError7) {
                                throw _iteratorError7;
                            }
                        }
                    }
                }
                finished.add(node);
            }
        }
    },
    importObject:function importObject(object) {
        if ((typeof object === "undefined" ? "undefined" :_typeof(object)) != "object") throw Error("Argument is not an object!");
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
    if ((typeof object === "undefined" ? "undefined" :_typeof(object)) == "object") for (var property in object) {
        try {
            var value = object[property];
            var match_node = undefined;
            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;
            try {
                for (var _iterator8 = graph.nodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                    var current_node = _step8.value;
                    if (current_node.value === value) {
                        match_node = current_node;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError8 = true;
                _iteratorError8 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion8 && _iterator8.return) {
                        _iterator8.return();
                    }
                } finally {
                    if (_didIteratorError8) {
                        throw _iteratorError8;
                    }
                }
            }
            if (!match_node) match_node = serialize(value, graph);
            graph.addEdge(node, match_node);
        } catch (e) {}
    }
    return node;
}