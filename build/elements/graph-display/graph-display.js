import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";import { Node, Link } from "../../helper/GraphClasses.js";
const style = document.createElement("style");
style.textContent = ":host{display:flex;flex:1;overflow:hidden;position:relative}:host>svg{touch-action:none;flex:1;will-change:transform;transition:transform .5s cubic-bezier(.86,0,.07,1)}:host>svg>*{touch-action:none}:host>svg>circle{fill:#4caf50;fill:var(--node-color,#4caf50);stroke:#1b5e20;stroke-width:3px;transition:opacity .5s,fill .5s}:host>svg>circle[selected]{fill:#8bc34a;stroke:#33691e;stroke-width:5px;stroke-dasharray:8,2;transition:opacity .5s,fill .5s,stroke-dasharray .5s}:host>svg>path{pointer-events:none;fill:#ffc107;fill:var(--link-color,#ffc107);stroke:#ffc107;stroke-width:1px;transition:opacity .5s}:host>svg>path[loop]{fill:none;stroke-width:2px}";
export class GraphDisplay extends HTMLElement {
  constructor() {
    super(), this.attachShadow({
      mode: "open"
    }), this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const a = requestAnimationFunction(() => {
      this.__resize()
    });
    new ResizeObserver(() => {
      a()
    }).observe(this), this.__requestPaint = requestAnimationFunction(() => {
      this.__paint()
    }), this.nodes = new Map, this.links = new Set, this.__updatedNodes = new Set, this.shadowRoot.addEventListener("extension-callback", (a) => {
      console.log("extension callback", a.detail.callback.name);try {
        "function" == typeof a.detail.callback && a.detail.callback.call(a.target, this)
      } catch (a) {
        console.error(a)
      }
    }), this.shadowRoot.appendChild(style.cloneNode(!0)), this.shadowRoot.appendChild(this.svg);
    for (const a of [...this.children]) this.shadowRoot.appendChild(a);
    this.configuration = {}, a();
    const b = this.graph;
    delete this.graph
    , this.graph = b
  }
  set graph(a) {
    const b = new Set,
      c = new Set;
    if (this.nodes.clear(), this.links.clear(), this.__graph = a, a) {
      const d = (...a) => {
        this.__requestPaintNode(...a)
      };
      for (let [c, e] of a.vertices()) e instanceof Node || (e = new Node({
          value: e,
          key: c
        }, d), this.graph.setVertex(c, e)), b.add(e.element), this.nodes.set(c, e);
      for (let [b, d, e] of a.edges()) e instanceof Link || (e = new Link({
          value: e,
          source: this.nodes.get(b),
          target: this.nodes.get(d)
        }), this.graph.setEdge(b, d, e)), c.add(e.element), this.links.add(e)
    }
    for (const b of [...this.svg.children]) (b.classList.contains("node") || b.classList.contains("link")) && !valid_elements.has(b) && b.parentNode.removeChild(b);
    for (const b of c) this.svg.appendChild(b);
    for (const c of b) this.svg.appendChild(c);
    this.shadowRoot.dispatchEvent(new CustomEvent("graph-structure-change"))
  }
  get graph() {
    return this.__graph
  }
  __requestPaintNode(a) {
    console.assert(this instanceof GraphDisplay, "invalid this", this), console.assert(a instanceof Node, "invalid node", a), this.__updatedNodes.add(a), this.__requestPaint()
  }
  __paint() {
    for (const a of this.__updatedNodes) a.paint();
    for (const a of this.links) (this.__updatedNodes.has(a.source) || this.__updatedNodes.has(a.target)) && a.paint();
    this.__updatedNodes.clear()
  }
  __resize() {
    const {width:a, height:b} = this.svg.getBoundingClientRect();
    Object.assign(this.svg.viewBox.baseVal, {
      x: -a / 2,
      y: -b / 2,
      width: a,
      height: b
    }), this.shadowRoot.dispatchEvent(new CustomEvent("resize"))
  }
}
customElements.define("graph-display", GraphDisplay);