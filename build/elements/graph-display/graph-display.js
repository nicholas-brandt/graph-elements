"use strict";import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
const style = document.createElement("style");
style.textContent = ":host{display:flex;flex:1;overflow:hidden;position:relative}:host>svg{touch-action:none;flex:1;will-change:transform;transition:transform .5s cubic-bezier(.86,0,.07,1)}:host>svg>*{touch-action:none}:host>svg>circle{fill:#4caf50;fill:var(--node-color,#4caf50);stroke:#1b5e20;stroke-width:3px;transition:opacity .5s,fill .5s}:host>svg>circle[selected]{fill:#8bc34a;stroke:#33691e;stroke-width:5px;stroke-dasharray:8,2;transition:opacity .5s,fill .5s,stroke-dasharray .5s}:host>svg>path{pointer-events:none;fill:#ffc107;fill:var(--link-color,#ffc107);stroke:#ffc107;stroke-width:1px;transition:opacity .5s}:host>svg>path[loop]{fill:none;stroke-width:2px}";
class GraphDisplay extends HTMLElement {
  constructor() {
    super(), Object.defineProperties(this, {
      svg: {
        value: document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        enumerable: !0
      },
      circles: {
        value: new Map,
        enumerable: !0
      },
      paths: {
        value: new Set,
        enumerable: !0
      },
      __updatedNodeKeys: {
        value: new Set
      },
      __graph: {
        value: void 0,
        configurable: !0,
        writable: !0
      },
      _updateGraph: {
        value: requestAnimationFunction(this.__updateGraph.bind(this)),
        configurable: !0,
        writable: !0
      },
      __delta: {
        value: [0, 0],
        writable: !0
      }
    }), this.configuration = {
      radius: 10
    }, new ResizeObserver(this.__resize.bind(this)).observe(this), this.attachShadow({
      mode: "open"
    }), this.shadowRoot.appendChild(style.cloneNode(!0)), this.shadowRoot.appendChild(this.svg);
    for (const a of this.children) this.shadowRoot.appendChild(a);
    this.__resize()
  }
  updateGraph(a) {
    if (!a) this.__updatedNodeKeys.clear();else
      for (const b of a) this.__updatedNodeKeys.add(b);
    this._updateGraph()
  }
  __updateGraph() {
    let a,
      b;
    if (this.__updatedNodeKeys.size % this.graph.vertexCount()) {
      a = new Set;
      for (const b of this.__updatedNodeKeys) a.add(this.circles.get(b));
      b = new Set;
      for (const c of this.paths) (a.has(c.__source) || a.has(c.__target)) && b.add(c)
    } else a = this.circles.values(), b = this.paths;
    for (const {x:b, y:c, radius:d, circle:e} of a) e.cx.baseVal.value = b, e.cy.baseVal.value = c, e.r.baseVal.value = d || this.configuration.radius;
    for (const a of b) a.setAttribute("d", this.__calcPath(a));
    this.__updatedNodeKeys.clear()
  }
  set graph(a) {
    this.__graph = a, this.svg.innerHTML = "", this.circles.clear(), this.paths.clear();
    for (let [b, c] of a.vertices()) c instanceof Object || (c = {
        value: c
      }, a.setVertex(b, c)), c.circle || (c.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")), Object.defineProperties(c.circle, {
        __node: {
          value: b,
          configurable: !0
        },
        __host: {
          value: this,
          configurable: !0
        }
      }), c.hammer || (c.hammer = new Hammer(c.circle), c.hammer.on("pan", this.__track.bind(this, b, c))), c.x |= 0, c.y |= 0, c.circle.setAttribute("cx", c.x), c.circle.setAttribute("cy", c.y), this.circles.set(b, c);
    for (const [b, c] of a.edges()) {
      const a = document.createElementNS("http://www.w3.org/2000/svg", "path");
      Object.defineProperties(a, {
        __source: {
          value: this.circles.get(b)
        },
        __target: {
          value: this.circles.get(c)
        },
        __host: {
          value: this
        }
      }), this.paths.add(a), this.svg.appendChild(a)
    }
    for (const [b, {circle:c}] of this.circles) this.svg.appendChild(c);
    this.updateGraph()
  }
  get graph() {
    return this.__graph
  }
  __calcPath({__source:a, __target:b}) {
    if (a === b || a.x === b.x && a.y === b.y) {
      const b = (a.radius || this.configuration.radius) / 3,
        c = 3 * (a.radius || this.configuration.radius);
      return `M ${a.x} ${a.y}c ${b} ${c} ${c} ${b} 0 0`
    } else {
      const c = b.x - a.x,
        d = b.y - a.y,
        e = Math.hypot(c, d) / (b.radius || this.configuration.radius),
        f = c / e,
        g = d / e,
        h = 2,
        i = b.x - f * h,
        j = b.y - g * h;
      return `M ${a.x} ${a.y}L ${i} ${j}L ${b.x + g} ${b.y - f}l ${-2 * g} ${2 * f}L ${i} ${j}`
    }
  }
  __track(a, b, c) {
    b.circle;b.x += c.deltaX - this.__delta[0] || 0, b.y += c.deltaY - this.__delta[1] || 0, this.__delta = c.isFinal ? [0, 0] : [c.deltaX, c.deltaY], this.updateGraph([a])
  }
  __resize() {
    const {width:a, height:b} = this.svg.getBoundingClientRect();
    Object.assign(this.svg.viewBox.baseVal, {
      x: -a / 2,
      y: -b / 2,
      width: a,
      height: b
    })
  }
}
(async() => {
  window.Hammer || (await new Promise((a) => {
    Object.defineProperty(window, "Hammer", {
      set(b) {
        delete window.Hammer
        , window.Hammer = b, setTimeout(a)
      }
    })
  })), customElements.define("graph-display", GraphDisplay)
})();