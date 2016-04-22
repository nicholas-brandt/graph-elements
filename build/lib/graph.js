define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    // private properties
    const $directed = Symbol();
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
            const links = this.links;
            this.clearLinks();
            for (let { source, target, metaData } of links) this.addLink(source, target, metaData);
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
        addNodes(...nodes) {
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
            for (let [, dependents] of relations.dependencies) dependents.delete(node);
            for (let [, dependencies] of relations.dependents) dependencies.delete(node);
            return deleted;
        }
        /**
         * @function removesNode
         * @param {Iterable} nodes - An Iterable of nodes to be removed
         * @return {boolean} - Whether all nodes have been removed
         * */
        removeNodes(...nodes) {
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
            for (let [, relations] of this) for (let [, link] of relations.dependents) links.add(link);
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
        addLinks(...links) {
            if (arguments.length <= 1) links = links[0];
            let success = true;
            for (let { source, target, metaData } of links) if (!this.addLink(source, target, metaData)) success = false;
            return success;
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
        removeLinks(...links) {
            if (arguments.length <= 1) links = links[0];
            let success = true;
            for (let { source, target, metaData } of links) if (!this.removeLink(source, target, metaData)) success = false;
            return success;
        }
        /**
         * @function clearLinks
         * Removes all links
         * */
        clearLinks() {
            for (let [, relations] of this) {
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
                for (let [dependent] of start_relations.dependents) {
                    const dependent_relations = this.get(dependent);
                    if (!this.directed && dependent_relations === referrer_relations) continue;
                    if (visited.has(dependent_relations)) return true;
                    if (search(dependent_relations, start_relations)) return true;
                }
            };
            for (let [, relations] of this) {
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
                for (let [neighbor_node] of this.get(node).dependents) if (neighbor_node === start_node) {
                    if (this.directed || path.length != 2) cycles.add(path);
                } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
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
                for (let [neighbor_node] of this.get(node).dependents) if (neighbor_node === start_node) {
                    if ((this.directed || path.length != 2) && path.length > max_length) max_length = path.length;
                } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
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
                for (let [neighbor_node] of this.get(node).dependents) if (path.length > max_length) {
                    const index = path.length - path.indexOf(neighbor_node);
                    if ((this.directed || index != 2) && index <= path.length && index > max_length) max_length = index;else if (index > path.length) search(neighbor_node, path.concat(neighbor_node));
                } else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
            };
            for (let [current_node] of this) if (!visited.has(current_node)) search(current_node, [current_node]);
            return max_length;
        }
    }
    exports.default = Graph;
    /**
     * A helper class.
     * Handles relations between nodes.
     * */
    class Relations {
        constructor(meta_data = null) {
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
                    get() {
                        return this.dependencies.size;
                    },
                    enumerable: true
                },
                "out": {
                    get() {
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
        constructor(source, target, meta_data = null) {
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
});
