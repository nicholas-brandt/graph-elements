importScripts("https://d3js.org/d3.v4.min.js");
const simulation = d3.forceSimulation(),
  link_force = d3.forceLink(),
  center_force = d3.forceCenter(0, 0),
  charge_force = d3.forceManyBody();
let buffer_array;
simulation.force("link", link_force), simulation.force("center", center_force), simulation.force("charge", charge_force), simulation.stop(), simulation.on("tick", () => {
  const a = simulation.nodes();
  for (let b = 0; b < a.length; ++b) {
    const c = a[b];
    buffer_array[2 * b] = c.x, buffer_array[2 * b + 1] = c.y
  }
  postMessage({
    buffer: buffer_array.buffer
  })
}), addEventListener("message", ({data:a}) => {
  if (console.log("WORKER message", a), a.configuration) {
    const {link:b, charge:c, gravitation:d, alpha:e, alphaTarget:f, alphaMin:g, alphaDecay:h, velocityDecay:i} = a.configuration;
    b && ("distance" in b && link_force.distance(b.distance), "strength" in b && link_force.strength(b.strength), simulation.force("link", link_force)), c && ("strength" in c && charge_force.strength(c.strength), "maxDistance" in c && charge_force.maxDistance(c.maxDistance), "minDistance" in c && charge_force.minDistance(c.minDistance), simulation.force("charge", charge_force)), void 0 !== e && simulation.alpha(e), void 0 !== f && simulation.alphaTarget(f), void 0 !== g && simulation.alphaMin(g), void 0 !== h && simulation.alpha(h), void 0 !== i && simulation.velocityDecay(i)
  }
  if (a.graph && a.buffer) {
    buffer_array = new Float32Array(a.buffer);
    const {nodes:b, links:c} = a.graph;
    simulation.nodes(b), link_force.links(c)
  }
  if (a.updatedNode && a.updatedNode[Symbol.iterator]) {
    let b = 0;
    const c = simulation.nodes();
    for (const d of a.updatedNode) {
      const a = c[b++];
      a.x = d.x, a.y = d.y
    }
  }
  "run" in a && (a.run ? simulation.restart() : simulation.stop())
});