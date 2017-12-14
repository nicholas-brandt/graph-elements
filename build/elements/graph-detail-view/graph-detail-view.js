"use strict";import GraphExtension from "../graph-extension/graph-extension.js";
const style = document.createElement("style");
style.textContent = ":host{display:none;position:absolute;width:100%;height:100%;background:#4caf50;background:var(--node-color,#4caf50)}:host>*{flex:1;transition:opacity .3s;opacity:0}:host(.visible){display:flex}:host(.visible)>*{opacity:1}";
export class GraphDetailView extends GraphExtension {
  constructor() {
    super();
    const a = Object.getOwnPropertyDescriptor(this, "graph") || Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "graph");
    Object.defineProperties(this.__graphDisplay, {
      graph: Object.assign({
        set(b) {
          a.set.call(this.__graphDisplay, b), this.__attachTapListeners()
        }
      }, a)
    }), Object.defineProperties(this, {
      __activeCircle: {
        value: void 0,
        writable: !0,
        configurable: !0
      }
    });
    const b = new Hammer(this);
    b.on("tap", this.__tapDetailView.bind(this)), this.__attachTapListeners(), this.attachShadow({
      mode: "open"
    }), this.shadowRoot.appendChild(style.cloneNode(!0));
    for (const a of this.children) this.shadowRoot.appendChild(a)
  }
  __tapCircle(a) {
    const b = a.cloneNode(!1);
    this.__activeCircle = b;
    const c = [{}, {
      r: Math.max(this.__graphDisplay.svg.width.baseVal.value, this.__graphDisplay.svg.height.baseVal.value)
    }];
    this.__graphDisplay.svg.appendChild(b);
    const d = b.animate(c, 500);
    d.addEventListener("finish", () => {
      this.classList.add("visible")
    })
  }
  __tapDetailView(a) {
    if (a.srcEvent.path[0] === this) {
      const a = this.__activeCircle;
      this.__activeCircle = void 0, this.classList.remove("visible");
      const b = [{
        r: Math.max(this.__graphDisplay.svg.width.baseVal.value, this.__graphDisplay.svg.height.baseVal.value)
      }, {
        r: a.r.baseVal.value
      }];
      a.animate(b, 500).addEventListener("finish", () => {
        this.__graphDisplay.svg.removeChild(a)
      })
    }
  }
  __attachTapListeners() {
    for (const [, a] of this.__graphDisplay.circles) a.hammer.on("tap", this.__tapCircle.bind(this, a.circle))
  }
}
(async() => {
  await customElements.whenDefined("graph-display"), customElements.define("graph-detail-view", GraphDetailView)
})();