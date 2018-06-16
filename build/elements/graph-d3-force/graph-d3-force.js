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
    super();
    let a = this.configuration;
    delete this.configuration
    , Object.defineProperties(this, {
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
                });`))
      },
      configuration: {
        set(b) {
          this.__worker.postMessage({
            configuration: b
          }), a = b
        },
        get() {
          return a
        },
        enumerable: !0
      }
    });
    const b = this;
    this.dispatchEvent(new CustomEvent("extension-callback", {
      detail: {
        callback(a) {
          b.graph_display = a, a.shadowRoot.addEventListener("graph-structure-change", () => {
            b.__propagateGraph()
          }), a.shadowRoot.addEventListener("graph-update", (a) => {
            a.target == b && a.detail.original || b.__propagateGraph()
          })
        }
      },
      bubbles: !0
    })), this.__worker.addEventListener("message", requestAnimationFunction(({data: {buffer:a}}) => {
      console.log("receive force update"), this.__bufferArray = new Float32Array(a), this.__applyForceUpdate()
    })), this.configuration = a, this.__propagateGraph()
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
  __propagateGraph() {
    console.log("D3FORCE propagate graph");
    const a = [...this.graph_display.nodes.values()],
      b = a.map(({x:a, y:b}, c) => ({
        x: a,
        y: b,
        index: c
      })),
      c = [...this.graph_display.links].map(({source:b, target:c}) => ({
        source: a.indexOf(b),
        target: a.indexOf(c)
      })),
      d = new ArrayBuffer(2 * (4 * b.length));
    this.__bufferArray = new Float32Array(d);
    for (let a = 0; a < b.length; ++a) {
      const c = b[a];
      this.__bufferArray[2 * a] = c.x, this.__bufferArray[2 * a + 1] = c.y
    }
    console.log("post worker"), this.__worker.postMessage({
      graph: {
        nodes: b,
        links: c
      },
      buffer: d
    })
  }
  __applyForceUpdate() {
    console.log("D3FORCE apply force update to graph");
    const a = [...this.graph_display.graph.vertices()];
    for (let b = 0; b < a.length; ++b) {
      const c = a[b][1],
        d = this.__bufferArray[2 * b],
        e = this.__bufferArray[2 * b + 1];
      c.x = d, c.y = e
    }
    this.dispatchEvent(new CustomEvent("graph-update", {
      detail: {
        original: !0
      },
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