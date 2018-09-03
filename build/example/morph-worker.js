import Graph from "https://rawgit.com/mhelvens/graph.js/master/dist/graph.es6.js";

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
    edge: 1e-5
};
class MorphNode {
    constructor(energy) {
        this.energy = energy;
        // this.output = Math.random() * (1 - costs.node) + costs.node;
        this.output = .5;
    }
}

const source_node = new MorphNode(1);
source_node.output = 1;
graph.addNewVertex(0, source_node);

import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
const iterate = requestAnimationFunction(_iterate);
iterate(0);

function _iterate(i) {
    for (let i = 0; i < 1e4; ++i) {
        source_node.energy += costs.gain;

        flowEnergy();
        morphNetwork();
    }
    // send();
    if (i < 1e3) {
        iterate(i + 1);
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
                            console.log("create bond", key, target_key);
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
            while (node.energy > node.output) {
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
}