"use strict";
const style = document.createElement("style");
style.textContent = ":host{display:none;position:absolute;width:100%;height:100%;background:#4caf50;background:var(--node-color,#4caf50)}:host>*{flex:1;transition:opacity .3s;opacity:0}:host(.visible){display:flex}:host(.visible)>*{opacity:1}";
export class GraphDetailView extends HTMLElement {
  constructor() {
    super(), this.dispatchEvent("extension-callback", {
      detail: {
        callback() {
          const a = new Hammer(this);
          a.on("tap", this.__tapDetailView.bind(this, graph_display)), this.__attachTapListeners()
        }
      },
      bubbles: !0
    });
    const a = Object.getOwnPropertyDescriptor(this, "graph") || Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "graph");
    Object.defineProperties(this.__graphDisplay, {
      graph: Object.assign({
        set(b) {
          a.set.call(this.__graphDisplay, b), this.__attachTapListeners()
        }
      }, a)
    }), Object.defineProperties(this, {
      __activeElement: {
        value: void 0,
        writable: !0,
        configurable: !0
      }
    }), this.attachShadow({
      mode: "open"
    }), this.shadowRoot.appendChild(style.cloneNode(!0));
    for (const a of this.children) this.shadowRoot.appendChild(a)
  }
  __tapNode(a, b) {
    const c = b.cloneNode(!0);
    this.__activeElement = c;
    const d = [{}, {
      r: Math.max(a.svg.width.baseVal.value, a.svg.height.baseVal.value)
    }];
    a.svg.appendChild(c);
    const e = c.animate(d, 500);
    e.addEventListener("finish", () => {
      this.classList.add("visible")
    })
  }
  __tapDetailView(a, b) {
    if (b.srcEvent.path[0] === this) {
      const b = this.__activeElement;
      this.__activeElement = void 0, this.classList.remove("visible");
      const c = [{
        r: Math.max(a.svg.width.baseVal.value, a.svg.height.baseVal.value)
      }, {
        r: b.r.baseVal.value
      }];
      b.animate(c, 500).addEventListener("finish", () => {
        a.svg.removeChild(b)
      })
    }
  }
  __attachTapListeners(a) {
    for (const [, b] of this.graph_display.nodes) b.hammer.on("tap", this.__tapNode.bind(this, a, b.element))
  }
}
(async() => {
  await customElements.whenDefined("graph-display"), customElements.define("graph-detail-view", GraphDetailView)
})();