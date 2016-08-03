Polymer({
    is: "graphjs-acyclicgraph",
    extends: "graphjs-graph",
    addEdge(source, target) {
        super.addEdge(source, target);
        if (this.hasCycle()) {
            this.removeEdge(source, target);
            return false;
        }
        return true;
    }
});