"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _conditionedGraph = require("./conditioned-graph.js");

var _conditionedGraph2 = _interopRequireDefault(_conditionedGraph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class AcyclicGraph
 * A class implementing cycleless graphs.
 * #Following https://en.wikipedia.org/wiki/Cycle_%28graph_theory%29
 * */
class AcyclicGraph extends _conditionedGraph2.default {
    postCondition() {
        return !this.hasCycle(true);
    }
    /**
     * @function hasCycle
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return false as acyclic graph).
     * @return {boolean} Whether the graph has a cycle.
     * */
    hasCycle() {
        var real = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        return real ? super.hasCycle() : false;
    }
    /**
    * @function getAllCyclesFromNode
    * @param {any} node - The node contained by all cycles
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return empty Set as acyclic graph).
    * @return {Set} - A set of all cycles containing the node
    * */
    getAllCyclesByNode(start_node) {
        var real = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return real ? super.getAllCyclesByNode(start_node) : new Set();
    }
    /**
     * @function getMaximalCycleLengthByNode
     * @param {any} node - The node contained by all cycles
     * @param {boolean} real - Whether a real test shall be performed (for debugging | must return 0 as acyclic graph).
     * @return {Number} - An integer presenting the number of links in the cycle (number of unique nodes)
     * */
    getMaximalCycleLengthByNode(start_node) {
        var real = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return real ? super.getMaximalCycleLengthByNode(start_node) : 0;
    }
}
exports.default = AcyclicGraph;
