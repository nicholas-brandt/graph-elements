import ConditionedGraph from "./conditioned-graph.js";

const $maxCycleLength = Symbol();

/**
 * @class MaxCyclicGraph
 * A class implementing graphs with a maximal cycle length.
 * */
export default class MaxCyclicGraph extends ConditionedGraph {
    set maxCycleLength(maxCycleLength) {
        this[$maxCycleLength] = Math.max(0, parseInt(maxCycleLength));
    }
    get maxCycleLength() {
        return this[$maxCycleLength] || 0;
    }
    postCondition() {
        return this.getMaximalCycleLength() <= this.maxCycleLength;
    }
}