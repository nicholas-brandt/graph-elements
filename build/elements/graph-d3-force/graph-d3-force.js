import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";import require from "../../helper/require.js";
const default_configuration = {
  link: {
    distance: 300,
    strength: 0.02
  },
  charge: {
    strength: -40
  },
  gravitation: {
    strength: 100
  }
};
export class GraphD3Force extends HTMLElement {
  constructor() {
    super(), Object.defineProperties(this, {
      __worker: {
        value: new Worker("data:application/javascript," + encodeURIComponent(`importScripts("https://d3js.org/d3.v4.min.js");
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
                  postMessage({})
                }), addEventListener("message", ({data:a}) => {
                  if (console.log("WORKER message", a), a.configuration) {
                    const {link:b, charge:c, gravitation:d, alpha:e, alphaTarget:f, alphaMin:g, alphaDecay:h, velocityDecay:i} = a.configuration;
                    b && ("distance" in b && link_force.distance(b.distance), "strength" in b && link_force.strength(b.strength), simulation.force("link", link_force)), c && ("strength" in c && charge_force.strength(c.strength), "maxDistance" in c && charge_force.maxDistance(c.maxDistance), "minDistance" in c && charge_force.minDistance(c.minDistance), simulation.force("charge", charge_force)), void 0 !== e && simulation.alpha(e), void 0 !== f && simulation.alphaTarget(f), void 0 !== g && simulation.alphaMin(g), void 0 !== h && simulation.alpha(h), void 0 !== i && simulation.velocityDecay(i)
                  }
                  if (a.graph && a.shared_buffer) {
                    buffer_array = new Float32Array(a.shared_buffer);
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
                });`))
      }
    });
    const a = () => {
      this.__requestPropagateGraph()
    };
    this.dispatchEvent(new CustomEvent("extension-callback", {
      detail: {
        callback(b) {
          b.shadowRoot.addEventListener("graph-structure-change", a), b.shadowRoot.addEventListener("graph-update", a)
        }
      },
      bubbles: !0
    })), this.__worker.addEventListener("message", requestAnimationFunction(() => {
      console.log("receive force update"), this.dispatchEvent(new CustomEvent("extension-callback", {
        detail: {
          callback: this.__applyForceUpdate
        },
        bubbles: !0
      }))
    })), this.configuration = default_configuration, this.__requestPropagateGraph()
  }
  set configuration(a) {
    this.__worker.postMessage({
      configuration: a
    })
  }
  start() {
    this.__worker.postMessage({
      run: !0
    })
  }
  stop() {
    this.__worker.postMessage({
      run: !1
    })
  }
  __requestPropagateGraph() {
    this.dispatchEvent(new CustomEvent("extension-callback", {
      detail: {
        callback: this.__propagateGraph
      },
      bubbles: !0
    }))
  }
  __propagateGraph(a) {
    console.log("D3FORCE propagate graph");
    const b = [...a.nodes.values()],
      c = b.map(({x:a, y:b}, c) => ({
        x: a,
        y: b,
        index: c
      })),
      d = [...a.links].map(({source:a, target:c}) => ({
        source: b.indexOf(a),
        target: b.indexOf(c)
      })),
      e = new SharedArrayBuffer(2 * (4 * c.length));
    this.__bufferArray = new Float32Array(e);
    for (let b = 0; b < c.length; ++b) {
      const a = c[b];
      this.__bufferArray[2 * b] = a.x, this.__bufferArray[2 * b + 1] = a.y
    }
    this.__worker.postMessage({
      graph: {
        nodes: c,
        links: d
      },
      shared_buffer: e
    })
  }
  __applyForceUpdate(a) {
    console.log("D3FORCE apply force update");
    const b = [...a.graph.vertices()];
    for (let c = 0; c < b.length; ++c) {
      const a = b[c][1],
        d = this.__bufferArray[2 * c],
        e = this.__bufferArray[2 * c + 1];
      isNaN(d) || (a.x = d), isNaN(e) || (a.y = e)
    }
    this.dispatchEvent(new CustomEvent("graph-update", {
      bubbles: !0
    }))
  }
}
(async() => {
  try {
    await require(["d3"]), await customElements.whenDefined("graph-display"), customElements.define("graph-d3-force", GraphD3Force)
  } catch (a) {
    console.error(a)
  }
})();