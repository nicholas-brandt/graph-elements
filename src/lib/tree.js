import AcyclicGraph from "./acyclic-graph.js";

/**
 * @class Tree
 * A class implementing trees.
 * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
 * Must not be connected!
 * */
export default class Tree extends AcyclicGraph {
    preCondition(source, target) {
        return this.get(target).in > 0;
    }
}