import StaticAnalysis from "./StaticAnalysis.js";
Object.defineProperties(StaticAnalysis, {
    toGraph: {
        value(scope) {
            return scope.toGraph();
        },
        writable: true,
        enumerable: true
    }
});
const scope = StaticAnalysis.analyze("");
Object.defineProperties(Object.getPrototypeOf(scope), {
    toGraph: {
        value() {
            const graph = new DirectedGraph;
            graph.addNode(this);
            const scopes = this.scopes;
            for (const scope of scopes) {
                scopes.delete(scope);
                if (scope.scopes.size) {
                    scopes.add(...scope.scopes);
                }
                graph.addNode(scope);
                graph.addLink(scope.parent, scope);
            }
            return graph;
        },
        writable: true,
        enumerable: true
    }
});
import DirectedGraph from "../../lib/graph/DirectedGraph.js";
export default StaticAnalysis;