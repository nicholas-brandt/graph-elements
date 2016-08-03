define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _slicedToArray = function () {
        function sliceIterator(arr, i) {
            var _arr = [];
            var _n = true;
            var _d = false;
            var _e = undefined;

            try {
                for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                    _arr.push(_s.value);

                    if (i && _arr.length === i) break;
                }
            } catch (err) {
                _d = true;
                _e = err;
            } finally {
                try {
                    if (!_n && _i["return"]) _i["return"]();
                } finally {
                    if (_d) throw _e;
                }
            }

            return _arr;
        }

        return function (arr, i) {
            if (Array.isArray(arr)) {
                return arr;
            } else if (Symbol.iterator in Object(arr)) {
                return sliceIterator(arr, i);
            } else {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
        };
    }();

    // private properties
    const $directed = Symbol();
    /**
     * @class Graph
     * Fundamental class that implements the basic graph structures.
     * #Following https://en.wikipedia.org/wiki/Graph_theory
     * */
    class Graph extends Map {
        constructor() {
            super(...arguments);
        }
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
            const links = this.links;
            this.clearLinks();
            for (let _ref of links) {
                let source = _ref.source;
                let target = _ref.target;
                let metaData = _ref.metaData;
                this.addLink(source, target, metaData);
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
            const relations = this.get(node);
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
            for (let node of nodes) this.addNode(node);
            return this;
        }
        /**
         * @function removeNode
         * @param {any} node - The node to be removed
         * @return {boolean} - Whether the object has been removed
         * */
        removeNode(node) {
            const relations = this.get(node);
            if (!relations) return false;
            // remove {object} from nodes
            const deleted = super.delete(node);
            // remove all links containing {object}
            for (let _ref2 of relations.dependencies) {
                var _ref3 = _slicedToArray(_ref2, 2);

                let dependents = _ref3[1];
                dependents.delete(node);
            }for (let _ref4 of relations.dependents) {
                var _ref5 = _slicedToArray(_ref4, 2);

                let dependencies = _ref5[1];
                dependencies.delete(node);
            }return deleted;
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
            let success = true;
            for (let node of nodes) if (!this.removeNode(node)) success = false;
            return success;
        }
        /**
         * @getter links
         * @returns {Set} - A set of all links.
         * */
        get links() {
            const links = new Set();
            for (let _ref6 of this) {
                var _ref7 = _slicedToArray(_ref6, 2);

                let relations = _ref7[1];

                for (let _ref8 of relations.dependents) {
                    var _ref9 = _slicedToArray(_ref8, 2);

                    let link = _ref9[1];
                    links.add(link);
                }
            }return links;
        }
        /**
         * @function addLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @param {any} meta_data - The meta data of the link
         * @return {boolean} - Whether the object has been removed from the graph.
         * */
        addLink(source, target, meta_data) {
            const source_relations = this.get(source);
            const target_relations = this.get(target);
            if (source_relations && target_relations) {
                const link = new Link(source, target, meta_data);
                source_relations.dependents.set(target, link);
                target_relations.dependencies.set(source, link);
                if (!this.directed) {
                    const reverse_link = new Link(target, source, meta_data);
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
            let success = true;
            for (let _ref10 of links) {
                let source = _ref10.source;
                let target = _ref10.target;
                let metaData = _ref10.metaData;

                if (!this.addLink(source, target, metaData)) success = false;
            }return success;
        }
        /**
         * @function removeLink
         * @param {any} source - The source node
         * @param {any} target - The target node
         * @return {boolean} - Whether the link has been removed from the graph.
         * */
        removeLink(source, target) {
            const source_relations = this.get(source);
            const target_relations = this.get(target);
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
            let success = true;
            for (let _ref11 of links) {
                let source = _ref11.source;
                let target = _ref11.target;
                let metaData = _ref11.metaData;

                if (!this.removeLink(source, target, metaData)) success = false;
            }return success;
        }
        /**
         * @function clearLinks
         * Removes all links
         * */
        clearLinks() {
            for (let _ref12 of this) {
                var _ref13 = _slicedToArray(_ref12, 2);

                let relations = _ref13[1];

                relations.dependents.clear();
                relations.dependencies.clear();
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
            const finished = new Set();
            const visited = new Set();
            const search = (start_relations, referrer_relations) => {
                visited.add(start_relations);
                for (let _ref14 of start_relations.dependents) {
                    var _ref15 = _slicedToArray(_ref14, 1);

                    let dependent = _ref15[0];

                    const dependent_relations = this.get(dependent);
                    if (!this.directed && dependent_relations === referrer_relations) continue;
                    if (visited.has(dependent_relations)) return true;
                    if (search(dependent_relations, start_relations)) return true;
                }
            };
            for (let _ref16 of this) {
                var _ref17 = _slicedToArray(_ref16, 2);

                let relations = _ref17[1];

                if (finished.has(relations)) continue;
                if (search(relations)) return true;
                finished.add(...visited);
                visited.clear();
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
            const cycles = new Set();
            const search = (node, path) => {
                for (let _ref18 of this.get(node).dependents) {
                    var _ref19 = _slicedToArray(_ref18, 1);

                    let neighbor_node = _ref19[0];

                    if (neighbor_node === start_node) {
                        if (this.directed || path.length != 2) cycles.add(path);
                    } else if (!(path.indexOf(neighbor_node) !== -1)) search(neighbor_node, path.concat(neighbor_node));
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
            let max_length = 0;
            const search = (node, path) => {
                for (let _ref20 of this.get(node).dependents) {
                    var _ref21 = _slicedToArray(_ref20, 1);

                    let neighbor_node = _ref21[0];

                    if (neighbor_node === start_node) {
                        if ((this.directed || path.length != 2) && path.length > max_length) max_length = path.length;
                    } else if (!(path.indexOf(neighbor_node) !== -1)) search(neighbor_node, path.concat(neighbor_node));
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
            let max_length = 0;
            const visited = new Set();
            const search = (node, path) => {
                visited.add(node);
                for (let _ref22 of this.get(node).dependents) {
                    var _ref23 = _slicedToArray(_ref22, 1);

                    let neighbor_node = _ref23[0];

                    if (path.length > max_length) {
                        const index = path.length - path.indexOf(neighbor_node);
                        if ((this.directed || index != 2) && index <= path.length && index > max_length) max_length = index;else if (index > path.length) search(neighbor_node, path.concat(neighbor_node));
                    } else if (!(path.indexOf(neighbor_node) !== -1)) search(neighbor_node, path.concat(neighbor_node));
                }
            };
            for (let _ref24 of this) {
                var _ref25 = _slicedToArray(_ref24, 1);

                let current_node = _ref25[0];

                if (!visited.has(current_node)) search(current_node, [current_node]);
            }return max_length;
        }
    }
    exports.default = Graph;
    /**
     * A helper class.
     * Handles relations between nodes.
     * */
    class Relations {
        constructor() {
            let meta_data = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            Object.defineProperties(this, {
                dependents: {
                    value: new Map(),
                    enumerable: true
                },
                dependencies: {
                    value: new Map(),
                    enumerable: true
                },
                in: {
                    get() {
                        return this.dependencies.size;
                    },
                    enumerable: true
                },
                out: {
                    get() {
                        return this.dependents.size;
                    },
                    enumerable: true
                },
                metaData: {
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
            let meta_data = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            Object.defineProperties(this, {
                source: {
                    value: source,
                    enumerable: true
                },
                target: {
                    value: target,
                    enumerable: true
                },
                metaData: {
                    value: meta_data,
                    enumerable: true,
                    writeable: true
                }
            });
        }
    }
});