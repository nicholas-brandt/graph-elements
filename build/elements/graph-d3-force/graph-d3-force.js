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
let worker_data;
const worker_promise = (async() => {
  const a = fetch("./build/elements/graph-d3-force/d3-force-worker.js");
  worker_data = URL.createObjectURL((await(await a).blob()))
})();
class GraphD3Force extends GraphExtension {
  constructor() {
    super();
    const a = Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "graph");
    Object.defineProperties(this.__graphDisplay, {
      graph: Object.assign({}, a, {
        set: (b) => {
          a.set.call(this.__graphDisplay, b), this.__graphChanged()
        }
      })
    }), Object.defineProperties(this, {
      __worker: {
        value: new Worker(worker_data)
      }
    }), this.configuration = default_configuration, this.__worker.addEventListener("message", requestAnimationFunction(this.__receiveForceUpdate.bind(this))), this.__graphChanged(), this.attachShadow({
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
  __graphChanged() {
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
    this.__bufferArray = new Float32Array(d), this.__worker.postMessage({
      graph: {
        nodes: b,
        links: c
      },
      shared_buffer: d
    })
  }
  __receiveForceUpdate() {
    console.log("received force update");
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
    })), await worker_promise, await customElements.whenDefined("graph-display"), customElements.define("graph-d3-force", GraphD3Force)
  } catch (a) {
    console.error(a)
  }
})();