import DirectedGraph from "./DirectedGraph.js";
export default class AcyclicDirectedGraph extends DirectedGraph {
    /**
     * @function addNode
     * @param {any} node - An object to be set as a node.
     * @returns {Graph} - {this} for chaining
     * */
    addLink(source, target, meta_data) {
        const success = super.addLink(source, target, meta_data);
        if (success) {
            if (super.hasCycle()) {
                if (this.removeLink(source, target)) {
                    return false;
                } else {
                    throw new Error("Invalid graph state");
                }
            }
        }
        return success;
    }
}