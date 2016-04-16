importScripts("../../../node_modules/d3/d3.js");
console.log("worker started");
const force = d3.layout.force();
let nodes = [];
force.on("tick", () => {
    postMessage({nodes});
});
const properties = ["linkDistance", "linkStrength", "charge", "chargeDistance", "alpha", "theta", "gravity", "size", "nodes", "links"];
addEventListener("message", event => {
    console.log(event);
    for (let property of properties) {
        const value = event.data[property];
        if (value) force[property](value);
    }
    if (event.data.nodes) nodes = event.data.nodes;
    if (event.data.start) force.start();
});