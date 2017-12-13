"use strict";import GraphExtension from "../graph-extension/graph-extension.js";import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
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
class GraphD3Force extends GraphExtension {
  constructor() {
    super();
    const a = Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "updateGraph");
    Object.defineProperties(this.__graphDisplay, {
      updateGraph: Object.assign({}, a, {
        set: (...b) => {
          a.value.apply(this.__graphDisplay, b), this.__propagateUpdatedGraph()
        }
      }),
      d3Force: {
        value: this,
        configurable: !0
      }
    }), Object.defineProperties(this, {
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
                  if (a.configuration) {
                    const {link:b, charge:c, gravitation:d, alpha:e, alphaTarget:f, alphaMin:g, alphaDecay:h, velocityDecay:i} = a.configuration;
                    b && ("distance" in b && link_force.distance(b.distance), "strength" in b && link_force.strength(b.strength), simulation.force("link", link_force)), c && ("strength" in c && charge_force.strength(c.strength), "maxDistance" in c && charge_force.maxDistance(c.maxDistance), "minDistance" in c && charge_force.minDistance(c.minDistance), simulation.force("charge", charge_force)), e !== void 0 && simulation.alpha(e), f !== void 0 && simulation.alphaTarget(f), g !== void 0 && simulation.alphaMin(g), h !== void 0 && simulation.alpha(h), i !== void 0 && simulation.velocityDecay(i)
                  }
                  if (a.graph && a.shared_buffer) {
                    buffer_array = new Float32Array(a.shared_buffer);
                    const {nodes:b, links:c} = a.graph;
                    simulation.nodes(b), link_force.links(c)
                  }
                  if (a.updatedNode && a.updatedNode[Symbol.iterator]) {
                    let b = 0;
                    for (const c of a.updatedNode) {
                      const a = simulation.nodes()[b++];
                      a.x = c.x, a.y = c.y
                    }
                  }
                  "run" in a && (a.run ? simulation.restart() : simulation.stop())
                });`))
      }
    }), this.configuration = default_configuration, this.__worker.addEventListener("message", requestAnimationFunction(this.__receiveForceUpdate.bind(this))), this.__propagateUpdatedGraph(), this.attachShadow({
      mode: "open"
    });
    for (const a of this.children) this.shadowRoot.appendChild(a)
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
  __propagateUpdatedGraph() {
    const a = [...this.__graphDisplay.circles.values()];
    this.__circleObjects = a;
    const b = a.map(({x:a, y:b}, c) => ({
        x: a,
        y: b,
        index: c
      })),
      c = [...this.__graphDisplay.paths].map(({__source:b, __target:c}) => ({
        source: a.indexOf(b),
        target: a.indexOf(c)
      })),
      d = new SharedArrayBuffer(2 * (4 * b.length));
    this.__bufferArray = new Float32Array(d);
    for (let a = 0; a < b.length; ++a) {
      const c = b[a];
      this.__bufferArray[2 * a] = c.x, this.__bufferArray[2 * a + 1] = c.y
    }
    this.__worker.postMessage({
      graph: {
        nodes: b,
        links: c
      },
      shared_buffer: d
    })
  }
  __receiveForceUpdate() {
    for (let a = 0; a < this.__circleObjects.length; ++a) {
      const b = this.__circleObjects[a],
        c = this.__bufferArray[2 * a],
        d = this.__bufferArray[2 * a + 1];
      b.x = c, b.y = d
    }
    this.__graphDisplay.__updateGraph()
  }
}
(async() => {
  try {
    window.d3 || (await new Promise((a) => {
      Object.defineProperty(window, "d3", {
        set(b) {
          delete window.d3
          , window.d3 = b, setTimeout(a)
        },
        configurable: !0,
        writable: !0
      })
    })), await customElements.whenDefined("graph-display"), customElements.define("graph-d3-force", GraphD3Force)
  } catch (a) {
    console.error(a)
  }
})();