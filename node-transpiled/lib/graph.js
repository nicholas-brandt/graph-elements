"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// private properties
var $directed = Symbol();
/**
 * @class Graph
 * Fundamental class that implements the basic graph structures.
 * #Following https://en.wikipedia.org/wiki/Graph_theory
 * */
class Graph extends Map {
    /**
     * @getter directed
     * @returns {boolean} - Whether the graph is unidirectional.
     * */
    get directed() {
        return !!this[$directed];
    }
    /**
     * @setter directed
     * @param {boolean} directed - Whether the graph shall be unidirectional.
     * */
    set directed(directed) {
        this[$directed] = !!directed;
        var links = this.links;
        this.clearLinks();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = links[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _ref = _step.value;
                var source = _ref.source;
                var target = _ref.target;
                var metaData = _ref.metaData;
                this.addLink(source, target, metaData);
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
    /**
     * @function set
     * @override
     * @param {any} node - The node to be set
     * @param {any} meta_data - Meta data belonging to the {node}
     * @return {this} - The current Map
     * */
    set(node, meta_data) {
        var relations = this.get(node);
        if (relations) {
            // just set the meta data
            relations.metaData = meta_data;
            return this;
        }
        // create new {Relations} with the meta data
        return super.set(node, new Relations(meta_data));
    }
    /**
     * @function removeNode
     * @override
     * @param {any} node - The node to be removed.
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    delete(node) {
        return this.removeNode(node);
    }
    /**
     * @function addNode
     * @param {any} node - An object to be set as a node.
     * @returns {Graph} - {this} for chaining
     * */
    addNode(node) {
        // {relations} to be stored in the {nodes} map
        // stored as a double-linked list
        return super.set(node, new Relations());
    }
    /**
     * @function addNodes
     * @param {Iterable} nodes - An Iterable of nodes to be added
     * @returns {Graph} - {this} for chaining
     * */
    addNodes() {
        for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
            nodes[_key] = arguments[_key];
        }

        if (arguments.length <= 1) nodes = nodes[0];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var node = _step2.value;
                this.addNode(node);
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

        return this;
    }
    /**
     * @function removeNode
     * @param {any} node - The node to be removed
     * @return {boolean} - Whether the object has been removed
     * */
    removeNode(node) {
        var relations = this.get(node);
        if (!relations) return false;
        // remove {object} from nodes
        var deleted = super.delete(node);
        // remove all links containing {object}
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = relations.dependencies[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _ref2 = _step3.value;

                var _ref3 = _slicedToArray(_ref2, 2);

                var dependents = _ref3[1];
                dependents.delete(node);
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

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = relations.dependents[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _ref4 = _step4.value;

                var _ref5 = _slicedToArray(_ref4, 2);

                var dependencies = _ref5[1];
                dependencies.delete(node);
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

        return deleted;
    }
    /**
     * @function removesNode
     * @param {Iterable} nodes - An Iterable of nodes to be removed
     * @return {boolean} - Whether all nodes have been removed
     * */
    removeNodes() {
        for (var _len2 = arguments.length, nodes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            nodes[_key2] = arguments[_key2];
        }

        if (arguments.length <= 1) nodes = nodes[0];
        var success = true;
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
            for (var _iterator5 = nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var node = _step5.value;

                if (!this.removeNode(node)) success = false;
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

        return success;
    }
    /**
     * @getter links
     * @returns {Set} - A set of all links.
     * */
    get links() {
        var links = new Set();
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
            for (var _iterator6 = this[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var _ref6 = _step6.value;

                var _ref7 = _slicedToArray(_ref6, 2);

                var relations = _ref7[1];
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = relations.dependents[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var _ref8 = _step7.value;

                        var _ref9 = _slicedToArray(_ref8, 2);

                        var link = _ref9[1];
                        links.add(link);
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

        return links;
    }
    /**
     * @function addLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} meta_data - The meta data of the link
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    addLink(source, target, meta_data) {
        var source_relations = this.get(source);
        var target_relations = this.get(target);
        if (source_relations && target_relations) {
            var link = new Link(source, target, meta_data);
            source_relations.dependents.set(target, link);
            target_relations.dependencies.set(source, link);
            if (!this.directed) {
                var reverse_link = new Link(target, source, meta_data);
                target_relations.dependents.set(source, reverse_link);
                source_relations.dependencies.set(target, reverse_link);
            }
            return true;
        }
        return false;
    }
    /**
     * @function addLinks
     * @param {Iterable} links - An Iterable of links to be added
     * @returns {Graph} - {this} for chaining
     * */
    addLinks() {
        for (var _len3 = arguments.length, links = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            links[_key3] = arguments[_key3];
        }

        if (arguments.length <= 1) links = links[0];
        var success = true;
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
            for (var _iterator8 = links[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var _ref10 = _step8.value;
                var source = _ref10.source;
                var target = _ref10.target;
                var metaData = _ref10.metaData;

                if (!this.addLink(source, target, metaData)) success = false;
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

        return success;
    }
    /**
     * @function removeLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @return {boolean} - Whether the link has been removed from the graph.
     * */
    removeLink(source, target) {
        var source_relations = this.get(source);
        var target_relations = this.get(target);
        if (source_relations && target_relations) {
            source_relations.dependents.delete(target);
            target_relations.dependencies.delete(source);
            if (!this.directed) {
                target_relations.dependents.delete(source);
                source_relations.dependencies.delete(target);
            }
            return true;
        }
        return false;
    }
    /**
     * @function removeLinks
     * @param {Iterable} links - An Iterable of links to be removed
     * @return {boolean} - Whether all links has been removed from the graph.
     * */
    removeLinks() {
        for (var _len4 = arguments.length, links = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            links[_key4] = arguments[_key4];
        }

        if (arguments.length <= 1) links = links[0];
        var success = true;
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
            for (var _iterator9 = links[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var _ref11 = _step9.value;
                var source = _ref11.source;
                var target = _ref11.target;
                var metaData = _ref11.metaData;

                if (!this.removeLink(source, target, metaData)) success = false;
            }
        } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion9 && _iterator9.return) {
                    _iterator9.return();
                }
            } finally {
                if (_didIteratorError9) {
                    throw _iteratorError9;
                }
            }
        }

        return success;
    }
    /**
     * @function clearLinks
     * Removes all links
     * */
    clearLinks() {
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
            for (var _iterator10 = this[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var _ref12 = _step10.value;

                var _ref13 = _slicedToArray(_ref12, 2);

                var relations = _ref13[1];

                relations.dependents.clear();
                relations.dependencies.clear();
            }
        } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                    _iterator10.return();
                }
            } finally {
                if (_didIteratorError10) {
                    throw _iteratorError10;
                }
            }
        }
    }
    /**
     * @function hasLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @return {boolean} - Whether there is an link between the {source} and {target} node in this graph.
     * */
    hasLink(source, target) {
        return this.has(source) && this.has(target) && this.get(source).dependents.has(target);
    }
    /**
     * @function hasCycle
     * @return {boolean} - Whether the graph has a cycle.
     * Deep field search.
     * */
    hasCycle() {
        var finished = new Set();
        var visited = new Set();
        var search = (start_relations, referrer_relations) => {
            visited.add(start_relations);
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
                for (var _iterator11 = start_relations.dependents[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                    var _ref14 = _step11.value;

                    var _ref15 = _slicedToArray(_ref14, 1);

                    var dependent = _ref15[0];

                    var dependent_relations = this.get(dependent);
                    if (!this.directed && dependent_relations === referrer_relations) continue;
                    if (visited.has(dependent_relations)) return true;
                    if (search(dependent_relations, start_relations)) return true;
                }
            } catch (err) {
                _didIteratorError11 = true;
                _iteratorError11 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion11 && _iterator11.return) {
                        _iterator11.return();
                    }
                } finally {
                    if (_didIteratorError11) {
                        throw _iteratorError11;
                    }
                }
            }
        };
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
            for (var _iterator12 = this[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var _ref16 = _step12.value;

                var _ref17 = _slicedToArray(_ref16, 2);

                var relations = _ref17[1];

                if (finished.has(relations)) continue;
                if (search(relations)) return true;
                finished.add(...visited);
                visited.clear();
            }
        } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                    _iterator12.return();
                }
            } finally {
                if (_didIteratorError12) {
                    throw _iteratorError12;
                }
            }
        }

        return false;
    }
    /**
    * @function getAllCyclesFromNode
    * @param {any} start_node - The node contained by all cycles
    * @return {Set} - A set of all cycles containing the node
    * */
    getAllCyclesByNode(start_node) {
        if (!this.has(start_node)) throw Error("{start_node} not in graph");
        var cycles = new Set();
        var search = (node, path) => {
            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = this.get(node).dependents[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var _ref18 = _step13.value;

                    var _ref19 = _slicedToArray(_ref18, 1);

                    var neighbor_node = _ref19[0];

                    if (neighbor_node === start_node) {
                        if (this.directed || path.length != 2) cycles.add(path);
                    } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13.return) {
                        _iterator13.return();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }
        };
        search(start_node, [start_node]);
        return cycles;
    }
    /**
     * @function getMaximalCycleLengthByNode
     * @param {any} start_node - The node contained by all cycles
     * @return {Number} - An integer presenting the number of links in the cycle (number of unique nodes)
     * */
    getMaximalCycleLengthByNode(start_node) {
        if (!this.has(start_node)) throw Error("{start_node} not in graph");
        var max_length = 0;
        var search = (node, path) => {
            var _iteratorNormalCompletion14 = true;
            var _didIteratorError14 = false;
            var _iteratorError14 = undefined;

            try {
                for (var _iterator14 = this.get(node).dependents[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var _ref20 = _step14.value;

                    var _ref21 = _slicedToArray(_ref20, 1);

                    var neighbor_node = _ref21[0];

                    if (neighbor_node === start_node) {
                        if ((this.directed || path.length != 2) && path.length > max_length) max_length = path.length;
                    } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
                }
            } catch (err) {
                _didIteratorError14 = true;
                _iteratorError14 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return) {
                        _iterator14.return();
                    }
                } finally {
                    if (_didIteratorError14) {
                        throw _iteratorError14;
                    }
                }
            }
        };
        search(start_node, [start_node]);
        return max_length;
    }
    /**
     * @function getMaximalCycleLength
     * @return {Number} - An integer presenting the number of links in the longest possible cycle (number of unique nodes)
     * */
    getMaximalCycleLength() {
        var max_length = 0;
        var visited = new Set();
        var search = (node, path) => {
            visited.add(node);
            var _iteratorNormalCompletion15 = true;
            var _didIteratorError15 = false;
            var _iteratorError15 = undefined;

            try {
                for (var _iterator15 = this.get(node).dependents[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                    var _ref22 = _step15.value;

                    var _ref23 = _slicedToArray(_ref22, 1);

                    var neighbor_node = _ref23[0];

                    if (path.length > max_length) {
                        var index = path.length - path.indexOf(neighbor_node);
                        if ((this.directed || index != 2) && index <= path.length && index > max_length) max_length = index;else if (index > path.length) search(neighbor_node, path.concat(neighbor_node));
                    } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
                }
            } catch (err) {
                _didIteratorError15 = true;
                _iteratorError15 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                        _iterator15.return();
                    }
                } finally {
                    if (_didIteratorError15) {
                        throw _iteratorError15;
                    }
                }
            }
        };
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
            for (var _iterator16 = this[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                var _ref24 = _step16.value;

                var _ref25 = _slicedToArray(_ref24, 1);

                var current_node = _ref25[0];

                if (!visited.has(current_node)) search(current_node, [current_node]);
            }
        } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion16 && _iterator16.return) {
                    _iterator16.return();
                }
            } finally {
                if (_didIteratorError16) {
                    throw _iteratorError16;
                }
            }
        }

        return max_length;
    }
}
exports.default = Graph; /**
                          * A helper class.
                          * Handles relations between nodes.
                          * */

class Relations {
    constructor() {
        var meta_data = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

        Object.defineProperties(this, {
            "dependents": {
                value: new Map(),
                enumerable: true
            },
            "dependencies": {
                value: new Map(),
                enumerable: true
            },
            "in": {
                get: function get() {
                    return this.dependencies.size;
                },

                enumerable: true
            },
            "out": {
                get: function get() {
                    return this.dependents.size;
                },

                enumerable: true
            },
            "metaData": {
                value: meta_data,
                enumerable: true,
                writable: true,
                configurable: true
            }
        });
    }
}
/**
 * @class Link
 * A helper class.
 * Represents a link between two nodes.
 * */
class Link {
    constructor(source, target) {
        var meta_data = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        Object.defineProperties(this, {
            "source": {
                value: source,
                enumerable: true
            },
            "target": {
                value: target,
                enumerable: true
            },
            "metaData": {
                value: meta_data,
                enumerable: true,
                writeable: true
            }
        });
    }
}
