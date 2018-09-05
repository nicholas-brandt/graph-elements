"use strict";

import Graph from "https://rawgit.com/mhelvens/graph.js/master/dist/graph.es6.js";
import workerize from "https://rawgit.com/Jamtis/workerize/patch-1/src/index.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
// import workerize from "https://unpkg.com/workerize@0.1.7/dist/workerize.m.js";

const worker = workerize(`import Graph from "https://rawgit.com/mhelvens/graph.js/master/dist/graph.es6.js";

self.Graph = Graph;
const graph = new Graph();
self.graph = graph;

export function getGraphString() {
    return graph.toJSON();
}

// -----------------------------------------------------------------------------------------

const costs = {
    node: 1e-2,
    edge: 4e-2,
    sustainEdge: 4e-2,
    gain: 1
};
const thresholds = {
    node: .2,
    edge: 1e-5
};
class MorphNode {
    constructor(energy) {
        this.energy = energy;
        this.output = .5;
        this.output = Math.random() * (1 - costs.node) + costs.node;
    }
}

const source_node = new MorphNode(1);
source_node.output = 1;
graph.addNewVertex(0, source_node);

import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
const iterate = requestAnimationFunction(_iterate);
(async () => {
    try {
        await iterate(0);
    } catch (error) {
        console.error(error);
    }
})();

async function _iterate(i) {
    console.log("iteration", i);
    for (let i = 0; i < 3e3; ++i) {
        source_node.energy += costs.gain;

        flowEnergy();
        morphNetwork();
    }

    // measure
    {
        let sum = 0;
        for (const [,, link] of graph.edges()) {
            sum += (link.flow_coefficient - link.target.energy / link.source.energy) ** 2;
        }
        if (sum) {
            console.log("energy misfit", sum);
        }
    }
    {
        const vertices = [...graph.vertices()];
        let sum = 0;
        for (const [key, node] of vertices) {
            sum += node.energy;
        }
        const average = sum / vertices.length;
        console.log("energy mean", average);
    }
    // send();
    if (i < 1e4) {
        setTimeout(async () => {
            await await iterate(i + 1);
        }, 50);
    }
}

function flowEnergy() {
    // ensure links

    const links = new Set();
    for (const [,, link] of graph.edges()) {
        link.flow_coefficient = link.target.output / link.source.output;
        links.add(link);
    }
    let progressing = true;
    for (var i = 0; i < 1e2 && progressing; ++i) {
        for (const link of links) {
            const sum = link.source.energy + link.target.energy;
            link.target.energy = sum / (1 + 1 / link.flow_coefficient);
            link.source.energy = sum / (1 + link.flow_coefficient);
        }
        progressing = false;
        for (const link of links) {
            // console.log("diff", Math.abs(link.flow_coefficient - link.target.value.energy / link.source.value.energy));
            if (!progressing && Math.abs(link.flow_coefficient - link.target.energy / link.source.energy) > 1e-4) {
                progressing = true;
            }
            link.flow_coefficient = link.target.energy / link.source.energy;
        }
        // console.log(links);
    }
    // console.log("steps", i);
    if (progressing) {
        console.log("progress incomplete");
    }
}

function morphNetwork() {
    stripNetwork();
    {
        const vertices = graph.vertices();
        for (const [key, node] of vertices) {
            for (const [target_key, target_node] of vertices) {
                if (key != target_key) {
                    if (Math.random() < thresholds.edge) {
                        if (!graph.hasEdge(key, target_key)) {
                            // console.log("create bond", key, target_key);
                            graph.spanEdge(key, target_key, {
                                source: node,
                                target: target_node
                            });
                            node.energy -= costs.edge;
                        }
                    }
                }
            }
            node.energy -= graph.outDegree(key) * costs.sustainEdge;
        }
    }
    stripNetwork();
    {
        const vertices = graph.vertices();
        let added;
        for (const [key, node] of vertices) {
            const n = (node.energy - node.output) / costs.node;
            for (let i = 0; i < n; ++i) {
                if (Math.random() < thresholds.node) {
                    let new_key = 0;
                    while (graph.hasVertex(new_key)) {
                        ++new_key;
                    }
                    // console.log("create cell", new_key, key);
                    const new_node = new MorphNode(costs.node);
                    new_node.parent = key;
                    graph.addNewVertex(new_key, new_node);
                    graph.spanEdge(key, new_key, {
                        source: node,
                        target: new_node
                    });
                    node.energy -= costs.node;
                    added = true;
                }
            }
        }
    }
}

function stripNetwork() {
    for (const [key, node] of graph.vertices()) {
        // console.log("morph", key);
        if (key != 0) {
            node.energy -= 1e-3;
            if (node.energy <= 0) {
                graph.destroyExistingVertex(key);
                // console.log("cell death", key);
            }
        }
    }
}`, {
    type: "module"
});

(async () => {
    await customElements.whenDefined("graph-display");
    const graphDisplay = document.querySelector("graph-display");
    window.graphDisplay = graphDisplay;

    const d3force = await graphDisplay.addonPromises["graph-d3-force"];
    d3force.configuration.alpha = 1e-2;
    d3force.configuration.alphaMin = 1e-3;
    d3force.configuration.alphaTarget = 1e-3;
    d3force.configuration.alphaDecay = 5e-3;
    d3force.configuration.velocityDecay = 1e-2;
    d3force.configuration.charge.strength = -2e2;
    d3force.configuration.charge.distanceMax = 1e5;
    d3force.configuration.link.distance = 1e2;
    d3force.configuration = d3force.configuration;

    let last_graph_string;
    const receive_graph = requestAnimationFunction(async () => {
        const graph_string = await worker.getGraphString();
        console.log("got graph string", graph_string.length);
        if (last_graph_string == graph_string) {
            const graph = Graph.fromJSON(graph_string);
            if (graphDisplay.graph) {
                const existing_graph = graphDisplay.graph;
                for (const [key, vertex] of graph.vertices()) {
                    if (existing_graph.hasVertex(key)) {
                        const existing_vertex = existing_graph.vertexValue(key);
                        graph.setVertex(key, existing_vertex);
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
                node.description = `energy: ${node.value.energy}
    output: ${node.value.output}
    outdegree: ${graph.outDegree(key)}
    indegree: ${graph.inDegree(key)}`;
            }
        }
        last_graph_string = graph_string;
    });

    // loop for graph changes
    for (let i = 0; i < Infinity; ++i) {
        const receive_promise = await receive_graph();
        await receive_promise;
    }
})();