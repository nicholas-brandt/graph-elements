"use strict";import console from "../../helper/console.js";import GraphAddon from "../graph-addon/graph-addon.js";import require from "../../helper/require.js";
const style = document.createElement("style");
style.textContent = ":host>svg>foreignObject{display:block}:host>svg>foreignObject .contextmenu{font:13px Roboto;display:none;flex-direction:column;overflow-x:hidden;overflow-y:auto;width:fit-content;border-radius:1px;box-shadow:0 1px 5px #999;background:#fff;padding:5px 0}:host>svg>foreignObject .contextmenu.visible{display:flex}:host>svg>foreignObject .contextmenu>*{flex:0 0 auto;padding:5px 20px;border:0 none;margin:0}:host>svg>foreignObject .contextmenu>:hover{background:hsl(0,0%,60%,30%)}:host>svg>foreignObject .contextmenu>:focus{outline:0}";
const listener_options = {
  capture: !0
};
export default class GraphContextmenu extends GraphAddon {
  constructor() {
    super();
    this.__foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    this.canvasTemplate = this.querySelector("#canvas");
    this.contextmenu = document.createElement("div");this.contextmenu.classList.add("contextmenu");
    const canvas_contextmenu = document.importNode(this.canvasTemplate.content, !0);
    this.contextmenu.appendChild(canvas_contextmenu);
    this.nodeTemplate = this.querySelector("#node");this.appendChild(style.cloneNode(!0))
  }
  hosted(host) {
    host.svg.appendChild(this.__foreignObject);
    if (!host.svg.hammer) {
      host.svg.hammer = new Hammer(host.svg)
    }
    host.svg.hammer.on("tap", event => {
      if (event.srcEvent.path[0] === host.svg) {
        this.__tapCanvas()
      }
    });host.svg.addEventListener("contextmenu", event => {
      try {
        this.__contextmenuCanvas(host, event)
      } catch (error) {
        console.error(error)
      }
    }, listener_options);host.shadowRoot.addEventListener("graph-structure-change", () => {
      try {
        this.__bindNodes(host)
      } catch (error) {
        console.error(error)
      }
    }, listener_options);this.__bindNodes(host)
  }
  __bindNodes(host) {
    console.log("");
    for (const [key, node] of host.nodes) {
      if (!node.contextmenuInstalled) {
        node.contextmenuInstalled = !0;node.element.addEventListener("contextmenu", event => {
          try {
            this.__contextmenuNode(host, node, event)
          } catch (error) {
            console.error(error)
          }
        }, listener_options)
      }
    }
  }
  __tapCanvas() {
    console.log("");this.hideContextmenu()
  }
  __contextmenuCanvas(host, event) {
    console.log(event);event.preventDefault();
    const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width,
      y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    this.showContextmenu(this.contextmenu, x, y)
  }
  __contextmenuNode(host, node, event) {
    console.log(node, event);event.preventDefault();event.stopPropagation();
    if (!node.contextmenu) {
      node.contextmenu = document.createElement("div");node.contextmenu.classList.add("contextmenu");
      const node_contextmenu = document.importNode(this.nodeTemplate.content, !0);
      node.contextmenu.appendChild(node_contextmenu)
    }
    const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width,
      y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    this.showContextmenu(node.contextmenu, x, y)
  }
  showContextmenu(contextmenu, x, y) {
    console.log(contextmenu, x, y);
    if (this.activeContextmenu) {
      this.activeContextmenu.classList.remove("visible")
    }
    contextmenu.classList.add("visible");
    this.activeContextmenu = contextmenu;this.__foreignObject.appendChild(contextmenu);
    this.__foreignObject.x.baseVal.value = x;
    this.__foreignObject.y.baseVal.value = y
  }
  hideContextmenu() {
    console.log(this.activeContextmenu);
    if (this.activeContextmenu) {
      this.activeContextmenu.classList.remove("visible");
      this.activeContextmenu = void 0
    }
  }
}
(async() => {
  try {
    await require(["Hammer"]);await customElements.whenDefined("graph-display");customElements.define("graph-contextmenu", GraphContextmenu)
  } catch (error) {
    console.error(error)
  }
})();