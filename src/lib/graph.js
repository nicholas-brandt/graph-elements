const $directed = Symbol();
/**
 * @class Graph
 * Fundamental class that implements the basic graph structures.
 * #Following https://en.wikipedia.org/wiki/Graph_theory
 * */
export class Graph extends Map {
    /**
     * @getter directed
     * @returns {boolean} - Whether the graph is unidirectional.
     * */
    get directed() {
        return this[$directed];
    }
    /**
     * @setter directed
     * @param {boolean} directed - Whether the graph shall be unidirectional.
     * */
    set directed(directed) {
        this[$directed] = !! directed;
        const links = this.links;
        this.clearLinks();
        for (let {source, target, weight} of links) this.addLink(source, target, weight);
    }
    /**
     * @getter links
     * @returns {Set} - A set of all links.
     * */
    get links() {
        const links = new Set;
        for (let [, relations] of this)
            for (let [, link] of relations.dependents) links.add(link);
        return links;
    }
    /**
     * @function addNode
     * @param {any} node - An object to be set as a node.
     * @returns {boolean} - {true} if the object has been set as a node
     *                      {false} if the object was already a node in this graph.
     * */
    addNode(node) {
        if (this.has(node)) return false;
        // {relations} to be stored in the {nodes} map
        // stored as a double-linked list
        this.set(node, new Relations);
        return true;
    }
    /**
     * @function removeNode
     * @param {any} node - The node to be removed.
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    removeNode(node) {
        if (!this.has(node)) return false;
        const relations = this.nodes.get(object);
        // remove {object} from nodes
        this.nodes.delete(object);
        // remove all links containing {object}
        for (let [, dependents] of relations.dependencies) dependents.delete(object);
        for (let [, dependencies] of relations.dependents) dependencies.delete(object);
        return true;
    }
    /**
     * @function addLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the link
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    addLink(source, target, weight = 1) {
        const source_relations = this.get(source);
        const target_relations = this.get(target);
        if (source_relations && target_relations) {
            const link = new Link(source, target, weight);
            source_relations.dependents.set(target, link);
            target_relations.dependencies.set(source, link);
            if (!this.directed) {
                const reverse_link = new Link(target, source, weight);
                target_relations.dependents.set(source, reverse_link);
                source_relations.dependencies.set(target, reverse_link);
            }
            return true;
        }
        return false;
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
        const finished = new Set;
        const visited = new Set;
        const search = (start_relations, referrer_relations) => {
            for (let [dependent] of start_relations.dependents) {
                const dependent_relations = this.get(dependent);
                if (!this.directed && dependent_relations === referrer_relations) continue;
                if (visited.has(dependent_relations)) return true;
                else {
                    visited.add(dependent_relations);
                    if (search(dependent_relations, start_relations)) return true;
                }
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
    * @param {any} node - The node contained by all cycles
    * @return {Set} - A set of all cycles containing the node
    * */
    getAllCyclesFromNode(start_node) {
        const cycles = new Set;
        const search = (node, path) => {
            for (let [neighbor_node] of this.get(node).dependents)
                if (neighbor_node === start_node) cycles.add(path);
                else if (!path.includes(neighbor_node)) search(neighbor_node, path.concat(neighbor_node));
        };
        const relations = this.get(start_node);
        if (relations) search(start_node, [start_node]);
        return cycles;
    }
}
/**
 * @class AcyclicGraph
 * A class implementing cycleless graphs.
 * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
 * */
export class AcyclicGraph extends Graph {
    /**
     * @function addLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the link
     * @return {boolean} - Whether the object has been removed from the graph.
     * The link is only added if it does not create a cycle.
     * */
    addLink(source, target, weight) {
        const added = super.addLink(source, target, weight);
        if (added && this.hasCycle(true))
            if (this.removeLink(source, target)) return false;
            else throw Error("Cyclic node could not be removed; Graph is no longer acyclic");
        return added;
    }
    /**
     * @function hasCycle
     * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns false as acyclic graph).
     * @return {boolean} Whether the graph has a cycle.
     * */
    hasCycle(real = false) {
        return real ? super.hasCycle() : false;
    }
}
/**
 * @class Tree
 * A class implementing trees.
 * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
 * Must not be connected!
 * */
export class Tree extends AcyclicGraph {
    /**
     * @function addLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the link
     * @return {boolean} - Whether the object has been removed from the graph.
     * The link is only added if the result would be a tree.
     * */
    addLink(source, target, weight) {
        if (this.get(target).in > 0) return false;
        return super.addLink(source, target, weight);
    }
}
/**
 * A helper class.
 * Handles relations between nodes.
 * */
class Relations {
    constructor() {
        Object.defineProperties(this, {
            "dependents": {
                value: new Map,
                enumerable: true
            },
            "dependencies": {
                value: new Map,
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
    constructor(source, target, weight) {
        Object.defineProperties(this, {
            "source": {
                value: source,
                enumerable: true
            },
            "target": {
                value: target,
                enumerable: true
            },
            "weight": {
                value: weight,
                enumerable: true,
                writeable: true
            }
        });
    }
}