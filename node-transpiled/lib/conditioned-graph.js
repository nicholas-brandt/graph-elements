"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _graph = require("./graph.js");

var _graph2 = _interopRequireDefault(_graph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class ConditionedGraph
 * A class implementing conditioned graphs.
 * */
class ConditionedGraph extends _graph2.default {
    /**
     * @function preCondition
     * @return {Boolean} - Whether the graph fulfills the condition before adding the link
     * */
    preCondition() {
        return true;
    }
    /**
     * @function postCondition
     * @return {Boolean} - Whether the graph fulfills the condition after adding the link
     *                      If not the link will be removed
     * */
    postCondition() {
        return true;
    }
    /**
     * @function addLink
     * @override
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} meta_data - The meta data of the link
     * @return {boolean} - Whether the object has been added to the graph.
     * The link is only added if the condition is satisfied.
     * */
    addLink(source, target, meta_data) {
        if (!this.preCondition(source, target)) return false;
        var added = super.addLink(source, target, meta_data);
        if (added && !this.postCondition(source, target)) if (this.removeLink(source, target)) return false;else throw Error("Added node could not be removed; condition is no longer guaranteed");
        return added;
    }
}
exports.default = ConditionedGraph;
