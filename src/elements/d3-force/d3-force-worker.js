importScripts("../../../node_modules/d3/build/d3.js");

console.log("worker started");
const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
simulation.force(link_force);
simulation.force(center_force);
simulation.force(charge_force);
simulation.stop();
simulation.on("tick", () => {
    postMessage({
        nodes: simulation.nodes()
    });
});
addEventListener("message", ({data}) => {
    console.log("worker got message:", data);
    if (data.configuration) {
        const {
            linkDistance,
            linkStrength,
            charge,
            alpha,
            theta
        } = data.configuration;
        if (linkDistance) {
            link_force.distance(linkDistance);
        }
        if (linkStrength) {
            link_force.strength(linkStrength);
        }
        if (charge) {
            charge_force.distance(charge);
        }
    }
    if (data.graph) {
        const links = JSON.parse(data.graph.links).map(([source, target]) => ({source, target}));
        simulation.nodes(JSON.parse(data.graph.nodes));
        link_force.links(links);
    }
    if (data.run) {
        simulation.restart();
    } else {
        simulation.stop();
    }
});