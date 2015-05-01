const $nodes = Symbol();
const $dependencies = Symbol();
const $dependents = Symbol();
const $directed = Symbol();
/**
 * @class
 * Fundamental class that implements the basic graph structures.
 * #Following https://en.wikipedia.org/wiki/Graph_theory
 * */
export class Graph {
    /**
     * @constructor
     * @þaram {boolean} directed - Whether the graph is unidirectional.
     * */
    constructor(directed = false) {
        this[$nodes] = new Map;
        this.directed = !!directed;
    }
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
        this[$directed] = !!directed;
        if (this.directed)
            for (let edge of this.edges) this.addEdge(...edge);
    }
    /**
     * @getter nodes
     * @returns {Map} - A copy of the {nodes} map.
     * */
    get nodes() {
        return new Map(this[$nodes]);
    }
    /**
     * @getter edges
     * @returns {Array} - A array of all edges.
     * */
    get edges() {
        return [for ([node, relations] of this[$nodes])
                for ([dependent, weight] of relations.dependents)
                {
                    source: node,
                    target: dependent,
                    weight: weight
                }];
    }
    /**
     * @function addNode
     * @param {any} object - An object to be set as a node.
     * @returns {boolean} - {true} if the object has been set as a node
     *                      {false} if the object was already a node in this graph. 
     * */
    addNode(object) {
        if (this.hasNode(object)) return false;
        // {relations} to be stored in the {nodes} map
        // stored as a double-linked list
        const relations = {
            get dependencies() {
                return new Map(this[$dependencies]);
            },
            get dependents() {
                return new Map(this[$dependents]);
            }
        };
        relations[$dependencies] = new Map;
        relations[$dependents] = new Map;
        this[$nodes].set(object, relations);
        return true;
    }
    /**
     * @function hasNode
     * @param {any} object
     * @return {boolean} - Whether the object is a node in this graph.
     * */
    hasNode(object) {
        return this[$nodes].has(object);
    }
    /**
     * @function removeNode
     * @param {any} object - The node to be removed.
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    removeNode(object) {
        if (!this.hasNode(object)) return false;
        const relations = this[$nodes].get(object);
        // remove {object} from nodes
        this[$nodes].delete(object);
        // remove all edges containing {object}
        for (let [, dependents] of relations[$dependencies]) dependents.delete(object);
        for (let [, dependencies] of relations[$dependents]) dependencies.delete(object);
        return true;
    }
    /**
     * @function addEdge
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the edge
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    addEdge(source, target, weight = 1) {
        const nodes = this[$nodes];
        if (nodes.has(source) && nodes.has(target)) {
            nodes.get(source)[$dependents].set(target, weight);
            nodes.get(target)[$dependencies].set(source, weight);
            if (!this.directed) {
                nodes.get(target)[$dependents].set(source, weight);
                nodes.get(source)[$dependencies].set(target, weight);
            }
            return true;
        }
        return false;
    }
    /**
     * @function removeEdge
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @return {boolean} - Whether the edge has been removed from the graph.
     * */
    removeEdge(source, target) {
        const nodes = this[$nodes];
        if (nodes.has(source) && nodes.has(target)) {
            nodes.get(source)[$dependents].delete(target);
            nodes.get(target)[$dependencies].delete(source);
            if (!this.directed) {
                nodes.get(target)[$dependents].delete(source);
                nodes.get(source)[$dependencies].delete(target);
            }
            return true;
        }
        return false;
    }
    /**
     * @function hasEdge
     * @param {any} object
     * @return {boolean} - Whether there is an edge between the {source} and {target} node in this graph.
     * */
    hasEdge(source, target) {
        return this.hasNode(source) && this.hasNode(target) && this[$nodes].get(source)[$dependents].has(target);
    }
    /**
     * Removes all nodes and edges from the graph.
     * @function clear
     * @return {boolean} - Whether all nodes have been removed.
     * */
    clear() {
        return this[$nodes].clear();
    }
    /**
     * @function hasCycle
     * @return {boolean} - Whether the graph has a cycle.
     * */
    hasCycle(...args) {
        return !!this.getCycle(...args);
    }
    /**
     * @function getCycle
     * @return {number} - The length of a cycle or {0} if there is no cycle.
     * */
    getCycle() {
        const directed = this.directed;
        const finished = new Set;
        const visited = new Set;
        for (let [, relations] of this[$nodes]) {
            const depth = DFS.call(this, relations, undefined, 0);
            if (depth) return depth;
        }
        return 0;

        function DFS(node, dependency, length) {
            if (!finished.has(node)) {
                if (visited.has(node)) return length;
                visited.add(node);
                const nodes = this[$nodes];
                for (let[dependent] of node[$dependents]) {
                    const dependent_node = nodes.get(dependent);
                    if (directed || dependent_node !== dependency) {
                        const depth = DFS.call(this, dependent_node, node, length + 1);
                        if (depth) return depth;
                    }
                }
                finished.add(node);
            }
        }
    }
    /**
     * @function getDegree
     * @param {any} node
     * @return {object} - An object containing all in-/out-nodes
     * */
    getDegree(node) {
        const relations = this[$nodes].get(node);
        if (!relations) return [
            for ([node, relations] of this[$nodes]) {
                node: node,
                in : relations.dependencies.size,
                out: relations.dependents.size
            }];
        return {
            node: node,
            in : relations.dependencies.size,
            out: relations.dependents.size
        };
    }
}
/**
 * A class implementing cycleless graphs.
 * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
 * */
export class AcyclicGraph extends Graph {
    /**
     * @function addEdge
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the edge
     * @return {boolean} - Whether the object has been removed from the graph.
     * The edge is only added if it does not create a cycle.
     * */
    addEdge(source, target, weight) {
        const added = super.addEdge(source, target, weight);
        if (added && this.hasCycle(true))
            if (this.removeEdge(source, target)) return false;
            else throw Error("Cyclic node could not be removed");
        return added;
    }
    /**
     * @function getCycle
     * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns 0 as acyclic graph).
     * @return {number} - The length of a cycle or {0} if there is no cycle.
     * */
    getCycle(real = false) {
        return !!real ? super.getCycle() : 0;
    }
    /**
     * @function hasCycle
     * @param {boolean} real - Whether a real test shall be performed (for debugging | normally returns false as acyclic graph).
     * @return {boolean} Whether the graph has a cycle.
     * */
    hasCycle(real = false) {
        return !!super.hasCycle(real);
    }
}
/**
 * A class implementing trees.
 * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
 * Must not be connected!
 * */
export class Tree extends AcyclicGraph {
    /**
     * @function addEdge
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} weight - The weight of the edge
     * @return {boolean} - Whether the object has been removed from the graph.
     * The edge is only added if the result would be a tree.
     * */
    addEdge(source, target, weight) {
        if (this[$nodes].get(target)[$dependencies].size > 0) return false;
        return super.addEdge(source, target, weight);
    }
}