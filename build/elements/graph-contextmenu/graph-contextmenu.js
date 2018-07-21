"use strict";import console from "../../helper/console.js";import GraphAddon from "../graph-addon/graph-addon.js";import require from "../../helper/require.js";
const style = document.createElement("style");
style.textContent = ":host>svg>foreignObject{display:none}:host>svg>foreignObject.visible{display:block}:host>svg>foreignObject .contextmenu{font:13px Roboto;display:flex;flex-direction:column;overflow-x:hidden;overflow-y:auto;width:fit-content;border-radius:1px;box-shadow:0 1px 5px #999;background:#fff;padding:5px 0}:host>svg>foreignObject .contextmenu>*{flex:0 0 auto;padding:5px 20px;border:0 none;margin:0}:host>svg>foreignObject .contextmenu>:hover{background:hsl(0,0%,60%,30%)}:host>svg>foreignObject .contextmenu>:focus{outline:0}";
export default class GraphContextmenu extends GraphAddon {
  constructor() {
    super();
    this.contextmenuElement = document.createElement("div");this.contextmenuElement.classList.add("contextmenu");
    for (const child of [...this.children]) {
      this.contextmenuElement.appendChild(child)
    }
    this.appendChild(style.cloneNode(!0))
  }
  async hosted() {
    const host = await this.host;
    this.__foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");this.__foreignObject.appendChild(this.contextmenuElement);host.svg.appendChild(this.__foreignObject);
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
    });host.shadowRoot.addEventListener("graph-structure-change", () => {
      try {
        this.__bindNodes(host)
      } catch (error) {
        console.error(error)
      }
    });this.__bindNodes(host)
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
        })
      }
    }
  }
  __tapCanvas() {
    console.log("");this.__foreignObject.classList.remove("visible")
  }
  __contextmenuCanvas(host, event) {
    console.log(event);event.preventDefault();
    const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width,
      y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    this.showContextmenu(host, x, y)
  }
  __contextmenuNode(host, node, event) {
    console.log(node, event);event.preventDefault();event.stopPropagation();
    const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width,
      y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    this.showContextmenu(host, x, y)
  }
  showContextmenu(host, x, y) {
    this.__foreignObject.classList.add("visible");host.svg.appendChild(this.__foreignObject);
    this.__foreignObject.x.baseVal.value = x;
    this.__foreignObject.y.baseVal.value = y
  }
}
(async() => {
  try {
    await require(["Hammer"]);await customElements.whenDefined("graph-display");customElements.define("graph-contextmenu", GraphContextmenu)
  } catch (error) {
    console.error(error)
  }
})();