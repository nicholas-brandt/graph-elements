/**
 * @class DirectedGraph
 * Fundamental class that implements the basic graph structures.
 * #Following https://en.wikipedia.org/wiki/Graph_theory
 * */
export default class DirectedGraph extends Map {
    /**
     * @function set
     * @override
     * @param {any} node - The node to be set
     * @param {any} meta_data - Meta data belonging to the {node}
     * @return {this} - The current Map
     * */
    set(node) {
        if (!this.has(node)) {
            // create new {Relations}
            return super.set(node, new Relations);
        }
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
        return this.set(node);
    }
    /**
     * @function addNodes
     * @param {Iterable} nodes - An Iterable of nodes to be added
     * @returns {Graph} - {this} for chaining
     * */
    addNodes(...nodes) {
        if (arguments.length <= 1) {
            nodes = nodes[0];
        }
        for (let node of nodes) {
            this.addNode(node);
        }
        return this;
    }
    /**
     * @function removeNode
     * @param {any} node - The node to be removed
     * @return {boolean} - Whether the object has been removed
     * */
    removeNode(node) {
        const relations = this.get(node);
        if (!relations) {
            return false;
        }
        // remove {object} from nodes
        const deleted = super.delete(node);
        // remove all links containing {object}
        for (let [, targets] of relations.sources) {
            targets.delete(node);
        }
        for (let [, sources] of relations.targets) {
            sources.delete(node);
        }
        return deleted;
    }
    /**
     * @function removesNode
     * @param {Iterable} nodes - An Iterable of nodes to be removed
     * @return {boolean} - Whether all nodes have been removed
     * */
    removeNodes(...nodes) {
        if (arguments.length <= 1) {
            nodes = nodes[0];
        }
        let success = true;
        for (let node of nodes) {
            if (!this.removeNode(node)) {
                success = false;
            }
        }
        return success;
    }
    /**
     * @getter links
     * @returns {Set} - A set of all links.
     * */
    get links() {
        const links = new Set;
        for (let [, relations] of this) {
            for (let [, link] of relations.targets) {
                links.add(link);
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
        const source_relations = this.get(source);
        const target_relations = this.get(target);
        if (source_relations && target_relations) {
            const link = new DirectedLink(source, target, meta_data);
            source_relations.targets.set(target, link);
            target_relations.sources.set(source, link);
            return true;
        }
        return false;
    }
    /**
     * @function addLinks
     * @param {Iterable} links - An Iterable of links to be added
     * @returns {Boolean} - Whether all links have been added.
     * */
    addLinks(...links) {
        if (links.length <= 1) {
            links = links[0];
        }
        let success = true;
        for (let {source, target, metaData} of links) {
            if (!this.addLink(source, target, metaData)) {
                success = false;
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
        const source_relations = this.get(source);
        const target_relations = this.get(target);
        if (source_relations && target_relations) {
            source_relations.targets.delete(target);
            target_relations.sources.delete(source);
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
        if (links.length <= 1) links = links[0];
        let success = true;
        for (let {source, target} of links) {
            if (!this.removeLink(source, target)) {
                success = false;
            }
        }
        return success;
    }
    /**
     * @function clearLinks
     * Removes all links
     * */
    clearLinks() {
        for (const [, relations] of this) {
            relations.targets.clear();
            relations.sources.clear();
        }
    }
    /**
     * @function hasLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @return {boolean} - Whether there is an link between the {source} and {target} node in this graph.
     * */
    hasLink(source, target) {
        return this.has(source) && this.has(target) && this.get(source).targets.has(target);
    }
    /**
     * @function hasCycle
     * @return {boolean} - Whether the graph has a cycle.
     * Deep first search.
     * */
    hasCycle() {
        const finished = new Set;
        const visited = new Set;
        const search = start_relations => {
            visited.add(start_relations);
            for (let [target] of start_relations.targets) {
                const target_relations = this.get(target);
                if (visited.has(target_relations)) {
                    return true;
                }
                if (search(target_relations)) {
                    return true;
                }
            }
        };
        for (const [, relations] of this) {
            if (finished.has(relations)) {
                continue;
            }
            if (search(relations)) {
                return true;
            }
            finished.add(...visited);
            visited.clear();
        }
        return false;
    }
}
/**
 * A helper class.
 * Handles relations between nodes.
 * */
class Relations {
    constructor() {
        Object.defineProperties(this, {
            targets: {
                value: new Map,
                enumerable: true
            },
            sources: {
                value: new Map,
                enumerable: true
            },
            in: {
                get() {
                    return this.sources.size;
                },
                enumerable: true
            },
            out: {
                get() {
                    return this.targets.size;
                },
                enumerable: true
            }
        });
    }
}
/**
 * @class DirectedLink
 * A helper class.
 * Represents a directed link between two nodes.
 * */
class DirectedLink {
    constructor(source, target, meta_data = null) {
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