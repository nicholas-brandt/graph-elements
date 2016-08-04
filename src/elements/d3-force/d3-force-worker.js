importScripts("../../../node_modules/d3/build/d3.js");

console.log("worker started");
const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
simulation.force("link", link_force);
simulation.force("center", center_force);
simulation.force("charge", charge_force);
simulation.stop();
console.log("link force", link_force);
simulation.on("tick", () => {
    postMessage({
        nodes: simulation.nodes()
    });
});
addEventListener("message", ({data}) => {
    console.log("worker got message:", data);
    if (data.configuration) {
        const {
            link,
            charge,
            alpha,
            alphaTarget,
            alphaMin,
            alphaDecay
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
            charge_force.strength(charge);
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
    }
    if (data.graph) {
        const nodes = JSON.parse(data.graph.nodes);
        const indexed_links = JSON.parse(data.graph.links);
        const links = indexed_links.map(([source, target]) => ({source, target}));
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