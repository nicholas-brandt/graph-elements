import ConditionedGraph from "./conditioned-graph.js";

/**
 * @class AcyclicGraph
 * A class implementing cycleless graphs.
 * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
 * */
export default class AcyclicGraph extends ConditionedGraph {
    postCondition() {
        return !this.hasCycle(true);
    }
    /**
     * @function hasCycle
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return false as acyclic graph).
     * @return {boolean} Whether the graph has a cycle.
     * */
    hasCycle(real = false) {
        return real ? super.hasCycle() : false;
    }
    /**
    * @function getAllCyclesFromNode
    * @param {any} node - The node contained by all cycles
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return empty Set as acyclic graph).
    * @return {Set} - A set of all cycles containing the node
    * */
    getAllCyclesByNode(start_node, real = false) {
        return real ? super.getAllCyclesByNode(start_node) : new Set;
    }
    /**
     * @function getMaximalCycleLengthByNode
     * @param {any} node - The node contained by all cycles
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return 0 as acyclic graph).
     * @return {Number} - An integer presenting the number of links in the cycle (number of unique nodes)
     * */
    getMaximalCycleLengthByNode(start_node, real = false) {
        return real ? super.getMaximalCycleLengthByNode(start_node) : 0;
    }
}