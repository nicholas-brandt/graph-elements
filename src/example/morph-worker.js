import Graph from "https://cdn.jsdelivr.net/gh/mhelvens/graph.js/dist/graph.es6.js";

self.Graph = Graph;
const graph = new Graph;
self.graph = graph;

export function getGraphString() {
    return graph.toJSON();
}

// -----------------------------------------------------------------------------------------

const costs = {
    node: 1e-2,
    edge: 3e-1,
    sustainNode: 1e-3,
    sustainEdge: 1e-1,
    gain: 50
};
self.costs = costs;
const thresholds = {
    node: 1e-6,
    edge: 1e-20
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

import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";
const iterate = requestAnimationFunction(_iterate);
(async () => {
    try {
        await iterate(0);
    } catch (error) {
        console.error(error);
    }
})();

async function _iterate(i) {
    // console.log("iteration", i);
    for (let i = 0; i < 1e1; ++i) {
        source_node.energy += costs.gain;

        flowEnergy();
        morphNetwork();
    }
       
    // measure
    {
        let sum = 0;
        const edges = [...graph.edges()];
        for (const [,,link] of edges) {
            sum += (link.flow_coefficient - link.target.energy / link.source.energy) ** 2;
        }
        if (sum) {
            // console.log("energy misfit", (sum ** .5) / edges.length);
        }
    }
    {
        const vertices = [...graph.vertices()];
        let sum = 0;
        for (const [key, node] of vertices) {
            sum += node.energy;
        }
        const average = sum / vertices.length;
        // console.log("energy mean", average);
    }
    // send();
    if (i < 50) {
        setTimeout(async () => {
            await await iterate(i + 1);
        }, 200);
    }
}

function flowEnergy() {
    // ensure links
    
    const links = new Set;
    for (const [,, link] of graph.edges()) {
        link.flow_coefficient = link.target.output / link.source.output;
        links.add(link);
    }
    let progressing = true;
    for (var i = 0; i < 1e3 && progressing; ++i) {
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
        console.log("progress incomplete", i);
    }
}

function morphNetwork() {
    stripNetwork();
    {
        let added;
        const vertices = [...graph.vertices()];
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
                            added = true;
                        }
                    }
                }
            }
            node.energy -= graph.degree(key) * costs.sustainEdge + costs.sustainNode;
        }
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
        if (added) {
            // console.log("added");
        }
    }
    stripNetwork();
}

function stripNetwork() {
    let stripped;
    for (const [key, node] of graph.vertices()) {
        // console.log("morph", key);
        if (key != 0) {
            if (node.energy <= 0) {
                graph.destroyExistingVertex(key);
                // console.log("cell death", key);
                stripped = true;
            }
        }
    }
    if (stripped) {
        // console.log("stripped");
    }
}