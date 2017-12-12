importScripts(this.origin + "/node_modules/d3/build/d3.js");

const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
let buffer_array;
simulation.force("link", link_force);
simulation.force("center", center_force);
simulation.force("charge", charge_force);
simulation.stop();
simulation.on("tick", () => {
    const nodes = simulation.nodes();
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        buffer_array[i * 2] = node.x;
        buffer_array[i * 2 + 1] = node.y;
    }
    // console.log(nodes.map(JSON.stringify), buffer_array);
    // dispatch draw message to main window
    // write graph data into shared buffer
    postMessage({});
});
addEventListener("message", ({data}) => {
    // console.log("worker got message:", data);
    if (data.configuration) {
        const {
            link,
            charge,
            gravitation,
            alpha,
            alphaTarget,
            alphaMin,
            alphaDecay,
            velocityDecay
        } = data.configuration;
        if (link) {
            if ("distance" in link) {
                link_force.distance(link.distance);
            }
            if ("strength" in link) {
                link_force.strength(link.strength);
            }
            simulation.force("link", link_force);
        }
        if (charge) {
            if ("strength" in charge) {
                charge_force.strength(charge.strength);
            }
            if ("maxDistance" in charge) {
                charge_force.maxDistance(charge.maxDistance);
            }
            if ("minDistance" in charge) {
                charge_force.minDistance(charge.minDistance);
            }
            simulation.force("charge", charge_force);
        }
        if (alpha !== undefined) {
            simulation.alpha(alpha);
        }
        if (alphaTarget !== undefined) {
            simulation.alphaTarget(alphaTarget);
        }
        if (alphaMin !== undefined) {
            simulation.alphaMin(alphaMin);
        }
        if (alphaDecay !== undefined) {
            simulation.alpha(alphaDecay);
        }
        if (velocityDecay !== undefined) {
            simulation.velocityDecay(velocityDecay);
        }
    }
    if (data.graph && data.shared_buffer) {
        buffer_array = new Float32Array(data.shared_buffer);
        const {nodes, links} = data.graph;
        simulation.nodes(nodes);
        link_force.links(links);
    }
    if ("run" in data) {
        if (data.run) {
            simulation.restart();
        } else {
            simulation.stop();
        }
    }
});