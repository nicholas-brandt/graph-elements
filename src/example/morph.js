"use strict";

import Graph from "https://cdn.jsdelivr.net/gh/mhelvens/graph.js/dist/graph.es6.js";
import workerize from "https://cdn.jsdelivr.net/gh/Jamtis/workerize@patch-1/src/index.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
// import workerize from "https://unpkg.com/workerize@0.1.7/dist/workerize.m.js";

const worker = workerize(`<!-- inject: ./morph-worker.js -->`, {
    type: "module"
});

(async() => {
    await customElements.whenDefined("graph-display");
    const graphDisplay = document.querySelector("graph-display");
    window.graphDisplay = graphDisplay;
    
    const d3force = await graphDisplay.addonPromises["graph-d3-force"];
    d3force.configuration.alpha = 1e-1;
    d3force.configuration.alphaMin = 1e-2;
    d3force.configuration.alphaTarget = 1e-2;
    d3force.configuration.alphaDecay = 5e-3;
    d3force.configuration.velocityDecay = 1e-2;
    d3force.configuration.charge.strength = -1e2;
    d3force.configuration.charge.distanceMax = 1e5;
    d3force.configuration.link.distance = 1e0;
    // d3force.configuration.link.strength(20);
    d3force.configuration = d3force.configuration;
    
    let first = true;
    let last_graph_string;
    const receive_graph = requestAnimationFunction(async () => {
        const graph_string = await worker.getGraphString();
        // console.log("got graph string", graph_string.length);
        if (last_graph_string != graph_string) {
            const graph = Graph.fromJSON(graph_string);
            if (graphDisplay.graph) {
                const existing_graph = graphDisplay.graph;
                for (const [key, vertex] of graph.vertices()) {
                    if (existing_graph.hasVertex(key)) {
                        const existing_vertex = existing_graph.vertexValue(key);
                        graph.setVertex(key, existing_vertex);
                        existing_vertex.value.energy = vertex.energy;
                    } else {
                        if ("parent" in vertex) {
                            if (existing_graph.hasVertex(vertex.parent)) {
                                const parent = existing_graph.vertexValue(vertex.parent);
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
                node.radius = Math.log2(node.value.energy * 10 + 1);
                node.description = `energy: ${node.value.energy}
output: ${node.value.output}
outdegree: ${graph.outDegree(key)}
indegree: ${graph.inDegree(key)}`;
            }
        }
        last_graph_string = graph_string;
        if (first) {
            first = false;
            d3force.start();
        }
    });
    
    // loop for graph changes
    for (let i = 0; i < Infinity; ++i) {
        const receive_promise = await receive_graph();
        await receive_promise;
    }
})();