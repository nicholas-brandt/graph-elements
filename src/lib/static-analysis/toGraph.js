import StaticAnalysis from "./StaticAnalysis.js";
Object.defineProperties(StaticAnalysis, {
    toGraph: {
        value(global_scope) {
            const graph = new DirectedGraph;
            graph.addNode(global_scope);
            let scopes = global_scope.scopes;
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