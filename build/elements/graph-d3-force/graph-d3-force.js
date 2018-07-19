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
    let _configuration = this.configuration;
    delete this.configuration;
    Object.defineProperties(this, {
      __worker: {
        value: new Worker("data:application/javascript," + encodeURIComponent(`importScripts("https://d3js.org/d3.v4.min.js");
                const simulation = d3.forceSimulation(),
                  link_force = d3.forceLink(),
                  center_force = d3.forceCenter(0, 0),
                  charge_force = d3.forceManyBody();
                let buffer_array;
                simulation.force("link", link_force);simulation.force("center", center_force);simulation.force("charge", charge_force);simulation.stop();simulation.on("tick", () => {
                  const nodes = simulation.nodes();
                  for (let i = 0; i < nodes.length; ++i) {
                    const node = nodes[i];
                    buffer_array[2 * i] = node.x;
                    buffer_array[2 * i + 1] = node.y
                  }
                  postMessage({
                    buffer: buffer_array.buffer
                  })
                });addEventListener("message", ({data}) => {
                  console.log("WORKER message", data);
                  if (data.configuration) {
                    const {link, charge, gravitation, alpha, alphaTarget, alphaMin, alphaDecay, velocityDecay} = data.configuration;
                    if (link) {
                      if ("distance" in link) {
                        link_force.distance(link.distance)
                      }
                      if ("strength" in link) {
                        link_force.strength(link.strength)
                      }
                      simulation.force("link", link_force)
                    }
                    if (charge) {
                      if ("strength" in charge) {
                        charge_force.strength(charge.strength)
                      }
                      if ("maxDistance" in charge) {
                        charge_force.maxDistance(charge.maxDistance)
                      }
                      if ("minDistance" in charge) {
                        charge_force.minDistance(charge.minDistance)
                      }
                      simulation.force("charge", charge_force)
                    }
                    if (alpha !== void 0) {
                      simulation.alpha(alpha)
                    }
                    if (alphaTarget !== void 0) {
                      simulation.alphaTarget(alphaTarget)
                    }
                    if (alphaMin !== void 0) {
                      simulation.alphaMin(alphaMin)
                    }
                    if (alphaDecay !== void 0) {
                      simulation.alpha(alphaDecay)
                    }
                    if (velocityDecay !== void 0) {
                      simulation.velocityDecay(velocityDecay)
                    }
                  }
                  if (data.graph && data.buffer) {
                    buffer_array = new Float32Array(data.buffer);
                    const {nodes, links} = data.graph;
                    simulation.nodes(nodes);link_force.links(links)
                  }
                  if (data.updatedNode && data.updatedNode[Symbol.iterator]) {
                    let i = 0;
                    const nodes = simulation.nodes();
                    for (const updated_node of data.updatedNode) {
                      const node = nodes[i++];
                      node.x = updated_node.x;
                      node.y = updated_node.y
                    }
                  }
                  if ("run" in data) {
                    if (data.run) {
                      simulation.restart()
                    } else {
                      simulation.stop()
                    }
                  }
                });`))
      },
      configuration: {
        set(configuration) {
          this.__worker.postMessage({
            configuration
          });
          _configuration = configuration
        },
        get() {
          return _configuration
        },
        enumerable: !0
      }
    });
    const _this = this;
    this.dispatchEvent(new CustomEvent("extension-callback", {
      detail: {
        callback(graph_display) {
          _this.graph_display = graph_display;graph_display.shadowRoot.addEventListener("graph-structure-change", () => {
            _this.__propagateGraph()
          });graph_display.shadowRoot.addEventListener("graph-update", event => {
            if (event.target != _this || !event.detail.original) {
              _this.__propagateGraph()
            }
          })
        }
      },
      bubbles: !0
    }));this.__worker.addEventListener("message", requestAnimationFunction(({data: {buffer}}) => {
      console.log("receive force update");
      this.__bufferArray = new Float32Array(buffer);this.__applyForceUpdate()
    }));
    this.configuration = _configuration;this.__propagateGraph()
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
    const _nodes = [...this.graph_display.nodes.values()],
      nodes = _nodes.map(({x, y}, index) => ({
        x,
        y,
        index
      })),
      links = [...this.graph_display.links].map(({source, target}) => ({
        source: _nodes.indexOf(source),
        target: _nodes.indexOf(target)
      })),
      buffer = new ArrayBuffer(2 * (4 * nodes.length));
    this.__bufferArray = new Float32Array(buffer);
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i];
      this.__bufferArray[2 * i] = node.x;
      this.__bufferArray[2 * i + 1] = node.y
    }
    console.log("post worker");this.__worker.postMessage({
      graph: {
        nodes,
        links
      },
      buffer
    })
  }
  __applyForceUpdate() {
    console.log("D3FORCE apply force update to graph");
    const nodes = [...this.graph_display.graph.vertices()];
    for (let i = 0; i < nodes.length; ++i) {
      const node = nodes[i][1],
        x = this.__bufferArray[2 * i],
        y = this.__bufferArray[2 * i + 1];
      node.x = x;
      node.y = y
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
    await require(["d3"]);await customElements.whenDefined("graph-display");customElements.define("graph-d3-force", GraphD3Force)
  } catch (error) {
    console.error(error)
  }
})();