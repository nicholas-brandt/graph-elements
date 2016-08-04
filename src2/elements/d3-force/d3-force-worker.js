importScripts("../../../node_modules/d3/d3.js");
console.log("worker started");
const force = d3.layout.force();
force.on("tick", () => {
    postMessage({
        nodes: force.nodes()
    });
});
const properties = ["linkDistance", "linkStrength", "charge", "chargeDistance", "alpha", "theta", "gravity", "size", "nodes", "links"];
addEventListener("message", ({data}) => {
    console.log("worker got message:", event.data);
    for (let property of properties) {
        const value = event.data[property];
        if (value) force[property](value);
    }
    if (event.data.data) {
        const data = CircularJSON.parse(event.data.data);
        force.nodes(data.nodes);
        force.links(data.links);
    }
    if (event.data.run) force.start();
});