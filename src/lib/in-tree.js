import AcyclicGraph from "./acyclic-graph.js";

/**
 * @class Tree
 * A class implementing trees.
 * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
 * Must not be connected!
 * */
export default class InTree extends AcyclicGraph {
    set directed(directed) {}
    get directed() {
        return true;
    }
    preCondition(source) {
        return this.get(source).out === 0;
    }
}