// data binding to the template does not work yet
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import console from "../../helper/console.js";
import { PolymerElement } from "//unpkg.com/@polymer/polymer/polymer-element.js?module";
import { templatize } from "//unpkg.com/@polymer/polymer/lib/utils/templatize.js?module";
import { html } from "//unpkg.com/@polymer/polymer/lib/utils/html-tag.js?module";
import { createGraphAddon } from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";
export default class GraphDetailView extends createGraphAddon(PolymerElement) {
  static get template() {
    return html([this.styleString + this.templateString]);
  }

  constructor(...args) {
    super(...args); // define own properties

    Object.defineProperties(this, {
      __activeClone: {
        value: undefined,
        writable: true,
        configurable: true
      }
    });
  }

  ready() {
    super.ready(); // fix CSS part

    this.insertAdjacentHTML("beforeend", `<style></style>`);
    this.template = this.querySelector("template#view");

    if (this.template) {
      // TODO: stamp new template for the detail view
      const view_container = stampView(this.template, "view", {}, {
        forwardHostProp(property, value) {
          console.log(property, value);
        }

      });
      this.appendChild(view_container);
      this.viewElement = view_container;
    }
  }

  hosted(host) {
    console.log(""); // add tap listener to detail view

    const hammer = new Hammer(this);

    __setHammerEnabled(hammer, false, "pinch", "press", "pan", "rotate", "swipe");

    hammer.on("tap", __try(this.hideDetailView.bind(this))); // add tap listener to existing elements

    host.addEventListener("graph-structure-change", this.__bindNodes.bind(this, host), passive);

    this.__bindNodes(host);
  }

  __bindNodes(host) {
    console.log(""); // TODO: check if node already has a tap-listener
    // add tap listener to new elements

    for (const [, node] of host.nodes) {
      // console.log(element);
      if (!node.hammer) {
        node.hammer = new Hammer(node.element);

        __setHammerEnabled(node.hammer, false, "pinch", "press", "pan", "rotate", "swipe");
      } else {
        __setHammerEnabled(node.hammer, true, "tap");
      }

      if (!node.detailViewInstalled) {
        node.detailViewInstalled = true;
        node.hammer.on("tap", __try(this.showDetailView.bind(this, node)));
      }
    }
  }

  async showDetailView(node) {
    const host = await this.host;

    if (this.activeNode && this.activeNode !== node) {
      this.__hideDetailView(host);
    } else {
      this.activeNode = node;
      const element = node.element;
      const active_clone = element.cloneNode(true);
      this.__activeClone = active_clone; // circle specific !!!

      host.nodeGroup.appendChild(active_clone);
      await new Promise(resolve => {
        const keyframes = [{
          r: element.r.baseVal.value
        }, {
          r: Math.max(host.svg.width.baseVal.value / 2 + Math.abs(this.activeNode.x), host.svg.height.baseVal.value / 2 + Math.abs(this.activeNode.y)) * Math.SQRT2
        }];
        active_clone.animate(keyframes, {
          duration: 700,
          fill: "both"
        }).addEventListener("finish", () => {
          this.classList.add("visible");
          const keyframes = [{
            opacity: 0
          }, {
            opacity: 1
          }];
          this.animate(keyframes, 300).addEventListener("finish", resolve.bind(undefined, undefined), passive);
        }, passive);
      });
    }
  }

  async hideDetailView() {
    if (this.activeNode) {
      // console.log(event);
      // hide detail view
      const element = this.__activeClone; // const {strokeWidth} = getComputedStyle(element);

      this.classList.remove("visible");
      const host = await this.host; // circle specific !!!

      await new Promise(resolve => {
        const keyframes = [{
          opacity: 1
        }, {
          opacity: 0
        }];
        this.animate(keyframes, 200).addEventListener("finish", () => {
          const keyframes = [{
            r: Math.max(host.svg.width.baseVal.value / 2 + Math.abs(this.activeNode.x), host.svg.height.baseVal.value / 2 + Math.abs(this.activeNode.y)) * Math.SQRT2
          }, {
            r: element.r.baseVal.value // + parseFloat(strokeWidth)

          }];
          element.animate(keyframes, {
            duration: 600,
            fill: "both"
          }).addEventListener("finish", () => {
            element.parentElement.removeChild(element);
            this.__activeClone = undefined;
            this.activeNode = undefined;
            resolve();
          }, passive);
        }, passive);
      });
    }
  }

}

_defineProperty(GraphDetailView, "tagName", "graph-detail-view");

_defineProperty(GraphDetailView, "styleString", `<style>:host{display:none;position:absolute;width:100%;height:100%;background:#4caf50;background:var(--node-color,#4caf50);padding:10px;box-sizing:border-box}:host>*{flex:1;opacity:0}:host(.visible){display:flex}:host(.visible)>*{opacity:1}</style>`);

_defineProperty(GraphDetailView, "templateString", `<slot></slot>`);

const passive = {
  passive: true
};

__try(async () => {
  await require(["Hammer"]);
  await customElements.whenDefined("graph-display");
  customElements.define(GraphDetailView.tagName, GraphDetailView);
})();

function stampView(template, name, instance_props, options) {
  const TemplateClass = templatize(template, undefined, options);
  const instance = new TemplateClass(instance_props);
  const view_container = document.createElement("div");
  view_container.classList.add(name);
  view_container.appendChild(instance.root);
  return view_container;
}