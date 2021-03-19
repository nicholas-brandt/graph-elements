"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import console from "../../helper/console.js";
import Extendable from "./extendable.js";
import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";
import { Node, Link } from "../../helper/GraphClasses.js";
const style = document.createElement("style");
style.textContent = `.graph-display{display:flex;flex:1;overflow:visible;position:relative}.graph-display>svg{touch-action:none;flex:1;will-change:transform;transition:transform .5s cubic-bezier(.86,0,.07,1);transform:translateZ(0)}.graph-display>svg #node-group{transition:transform .5s}.graph-display>svg #node-group>*{touch-action:none}.graph-display>svg #node-group>.node{fill:#4caf50;fill:var(--node-color,#4caf50);stroke:#1b5e20;stroke-dasharray:9,0;stroke-width:3px;transition:opacity .5s,fill .5s}.graph-display>svg #link-group{transition:transform .5s}.graph-display>svg #link-group>*{touch-action:none}.graph-display>svg #link-group>.link{pointer-events:none;fill:#ffc107;fill:var(--link-color,#ffc107);stroke:#ffc107;stroke-width:1px}.graph-display>svg #link-group>.link[loop]{fill:none;stroke-width:2px}`;
export default class GraphDisplay extends Extendable {
  constructor() {
    super();
    this.classList.add("graph-display"); // shadow stuff

    this.attachShadow({
      mode: "open"
    });
    this.shadowRoot.innerHTML = `<slot name="canvas"></slot><slot></slot>`;
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttributeNS(null, "viewBox", "0 0 1 1"); // this.svg.part.add("canvas");

    this.svg.slot = "canvas";
    this.mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.mainGroup.id = "main-group";
    this.svg.appendChild(this.mainGroup);
    this.linkGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.linkGroup.id = "link-group";
    this.mainGroup.appendChild(this.linkGroup);
    this.nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.nodeGroup.id = "node-group";
    this.mainGroup.appendChild(this.nodeGroup); // resize handler

    const request_resize = requestAnimationFunction(() => {
      this.__resize();

      this.dispatchEvent(new Event("resize", {
        composed: true
      }));
    });
    new ResizeObserver(() => {
      request_resize();
    }).observe(this); // install request function

    this.__requestPaint = requestAnimationFunction(this.__paint.bind(this)); // map for updated nodes

    this.nodes = new Map();
    this.links = new Set();
    this.__updatedNodes = new Set();
    let max_time_adaptive_painting;
    this.__max_updatable = 1;
    this.__last_paint = 0;
    Object.defineProperties(this, {
      maxTimeAdaptivePainting: {
        get() {
          return max_time_adaptive_painting;
        },

        set(value) {
          max_time_adaptive_painting = Math.max(0, value) || 0;
        },

        configurable: true,
        enumerable: true
      }
    });
    this.maxTimeAdaptivePainting = 0; // install extension callback
    // this.addons = new Map;

    const addon_promise_methods = new Map();
    this.addonPromises = new Proxy({}, {
      get(target, name) {
        if (!target[name]) {
          target[name] = new Promise((resolve, reject) => {
            addon_promise_methods.set(name, {
              resolve,
              reject
            });
          });
        }

        return target[name];
      }

    });
    this.addEventListener("addon-registry", event => {
      // console.log("addon registrated sr cap");
      // stop the event because
      // if it would reach its target addon it would assume no host is present
      // event.stopPropagation();
      const tag_name = event.target.tagName.toLowerCase(); // this.addons.set(tag_name, event.target);

      try {
        event.target.host = this; // addon.hosted is called

        this.addonPromises[tag_name];
        addon_promise_methods.get(tag_name).resolve(event.target);
      } catch (error) {
        console.error(error);
        this.addonPromises[tag_name];
        addon_promise_methods.get(tag_name).reject(event.target);
      }
    }, {
      capture: true,
      passive: true
    });
    this.addEventListener("graph-structure-change", async () => {
      try {
        this.__adoptGraph();

        await this.__requestPaint();
      } catch (error) {
        console.error(error);
      }
    }, {
      passive: true
    });
    this.addEventListener("graph-update", async event => {
      console.log("graph-update");

      try {
        // register which node have changed
        this.__requestPaint();
      } catch (error) {
        console.error(error);
      }
    }, {
      passive: true
    }); // add style

    const style = this.constructor.styleElement.cloneNode(true);
    this.insertAdjacentElement("afterbegin", style);
    this.appendChild(this.svg); // this.shadowRoot.appendChild(style);
    // this.shadowRoot.appendChild(this.svg);
    // const slot = document.createElement("slot");
    // this.shadowRoot.appendChild(slot);
    // set configuration

    this.configuration = {}; // trigger init resize

    request_resize(); // trigger init graph display
    // propagate preassigned graph to setter

    const graph = this.graph;
    delete this.graph;
    this.graph = graph;
  }

  set graph(graph) {
    this.__graph = graph;
    this.dispatchEvent(new Event("graph-structure-change", {
      composed: true
    }));
  }

  get graph() {
    return this.__graph;
  }

  __adoptGraph() {
    // console.log("");
    const valid_node_elements = new Set();
    const valid_link_elements = new Set();
    this.nodes.clear();
    this.links.clear();

    if (this.graph) {
      // ensure valid formatting
      for (let [key, value] of this.graph.vertices()) {
        if (!(value instanceof this.Node)) {
          // console.log("new node", value);
          value = new this.Node({
            value,
            key
          }, this.__requestPaintNode.bind(this));
          this.graph.setVertex(key, value);

          this.__updatedNodes.add(value);
        }

        valid_node_elements.add(value.element);
        this.nodes.set(key, value);
      }

      for (let [source_key, target_key, value] of this.graph.edges()) {
        if (!(value instanceof this.Link)) {
          // console.log("new link", value);
          value = new this.Link({
            value,
            source: this.nodes.get(source_key),
            target: this.nodes.get(target_key)
          });
          this.graph.setEdge(source_key, target_key, value);

          this.__updatedNodes.add(value.source);

          this.__updatedNodes.add(value.target);
        }

        valid_link_elements.add(value.element);
        this.links.add(value);
      }
    } // ensure only valid children are present


    for (const child of [...this.nodeGroup.children]) {
      if (child.classList.contains("node") && !valid_node_elements.has(child)) {
        child.parentNode.removeChild(child);
      }
    }

    for (const child of [...this.linkGroup.children]) {
      if (child.classList.contains("link") && !valid_link_elements.has(child)) {
        child.parentNode.removeChild(child);
      }
    } // add non-existent


    for (const link_element of valid_link_elements) {
      if (link_element.parentElement !== this.linkGroup) {
        this.linkGroup.appendChild(link_element);
      }
    }

    for (const node_element of valid_node_elements) {
      if (node_element.parentElement !== this.nodeGroup) {
        this.nodeGroup.appendChild(node_element);
      }
    }
  }

  __requestPaintNode(node) {
    console.assert(this instanceof GraphDisplay, "invalid this", this);
    console.assert(node instanceof this.Node, "invalid node", node);

    this.__updatedNodes.add(node);

    return this.__requestPaint();
  }

  __paint(time_stamp) {
    // console.log(this.__updatedNodes.size);
    if (this.maxTimeAdaptivePainting == 0) {
      // repaint all updated nodes
      for (const node of this.__updatedNodes) {
        node.paint();
      } // find updatable links


      for (const link of this.links) {
        if (this.__updatedNodes.has(link.source) || this.__updatedNodes.has(link.target)) {
          link.paint();
        }
      }

      this.__updatedNodes.clear();
    } else {
      // adaptive resizing of currently repaintable nodes
      const diff = time_stamp - this.__last_paint;

      if (diff < this.maxTimeAdaptivePainting) {
        this.__max_updatable += Math.ceil(this.__max_updatable ** .5);
      } else if (diff > this.maxTimeAdaptivePainting * 1.2) {
        this.__max_updatable = Math.floor(this.__max_updatable * .8);
      }

      this.__max_updatable = Math.min(this.graph.vertexCount(), Math.max(1, this.__max_updatable));
      console.rawlog("max_up " + this.__max_updatable);
      console.rawlog("diff " + (time_stamp - this.__last_paint));
      const current_nodes = new Set();

      outer: for (const node of this.__updatedNodes) {
        this.__updatedNodes.delete(node);

        current_nodes.add(node);
        const neighbors = [...this.graph.verticesFrom(node.key), ...this.graph.verticesTo(node.key)].map(([key, node]) => node);

        for (const neighbor of neighbors) {
          this.__updatedNodes.delete(neighbor);

          current_nodes.add(neighbor);

          if (current_nodes.size >= this.__max_updatable) {
            break outer;
          }
        }
      }

      for (const current_node of current_nodes) {
        // paint affected nodes
        current_node.paint();
      } // find updatable links


      for (const link of this.links) {
        if (current_nodes.has(link.source) || current_nodes.has(link.target)) {
          link.paint();
        }
      } // this.__updatedNodes.clear();


      if (this.__updatedNodes.size > 0) {// this.__requestPaint();
      }
    }

    this.__last_paint = time_stamp;
    this.dispatchEvent(new Event("paint", {
      bubbles: true,
      composed: true
    }));
  }

  __resize(event) {
    console.log(event);
    const {
      width,
      height
    } = this.svg.getBoundingClientRect();
    const {
      baseVal
    } = this.svg.viewBox;
    Object.assign(baseVal || {}, {
      x: -width / 2,
      y: -height / 2,
      width,
      height
    });
    this.dispatchEvent(new Event("resize", {
      composed: true
    }));
  }

  async __callWhenAddonHosted(addon_name, callback) {
    await this.addonPromises[addon_name];
    console.log("addon hosted", addon_name);
    return await callback(this);
  }

}

_defineProperty(GraphDisplay, "tagName", "graph-display");

_defineProperty(GraphDisplay, "styleElement", style);

;
GraphDisplay.prototype.Node = Node;
GraphDisplay.prototype.Link = Link;

try {
  customElements.define(GraphDisplay.tagName, GraphDisplay);
} catch (error) {
  console.error(error);
}