import Graph from "https://rawgit.com/mhelvens/graph.js/master/dist/graph.es6.js";
import workerize from "https://unpkg.com/workerize@0.1.7/dist/workerize.m.js";

const worker = workerize(`<!-- inject: ./morph-worker.js -->`, {
    type: "module"
});

(async() => {
    await customElements.whenDefined("graph-display");
    const graphDisplay = document.querySelector("graph-display");
    window.graphDisplay = graphDisplay;
    
    const d3force = await graphDisplay.addonPromises["graph-d3-force"];
    d3force.configuration.alpha = 1e-2;
    d3force.configuration.alphaMin = 1e-3;
    d3force.configuration.alphaTarget = 1e-3;
    d3force.configuration.velocityDecay = 1e-1;
    d3force.configuration.charge.strength = -1e2;
    d3force.configuration.charge.distanceMax = 1e5;
    d3force.configuration.link.distance = 1e2;
    d3force.configuration = d3force.configuration;
    
    // loop for graph changes
    while (true) {
        const graph_string = await worker.getGraphString();
        const graph = Graph.fromJSON(graph_string);
        if (graphDisplay.graph) {
            const _graph = graphDisplay.graph;
            for (const [key, vertex] of graph.vertices()) {
                if (_graph.hasVertex(key)) {
                    const existing_vertex = _graph.vertexValue(key);
                    graph.setVertex(key, existing_vertex);
                } else {
                    if ("parent" in vertex) {
                        if (_graph.hasVertex(vertex.parent)) {
                            const parent = _graph.vertexValue(vertex.parent);
                            vertex.x = parent.x;
                            vertex.y = parent.y;
                        }
                    }
                }
            }
        }
        graphDisplay.graph = graph;
    // set description
        for (const [key, node] of graph.vertices()) {
            node.description = `energy: ${node.value.energy}
output: ${node.value.output}
outdegree: ${graph.outDegree(key)}
indegree: ${graph.inDegree(key)}`;
        }
    }
})();