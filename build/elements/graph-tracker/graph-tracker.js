import require from "../../helper/require.js";import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
export class GraphTracker extends HTMLElement {
  constructor() {
    super(), this.__requestGraphUpdateEvent = requestAnimationFunction(() => {
      this.dispatchEvent(new CustomEvent("graph-update", {
        detail: {
          original: !0
        },
        bubbles: !0
      }))
    }), this.dispatchEvent(new CustomEvent("extension-callback", {
      detail: {
        callback: this.__attachListener
      },
      bubbles: !0
    }))
  }
  __attachListener(a) {
    console.log("attach listener"), a.shadowRoot.addEventListener("graph-structure-change", () => {
      this.__bindNodes(a)
    }), this.__bindNodes(a)
  }
  __bindNodes(a) {
    console.log("bind nodes to tracker");
    for (const [b, c] of a.nodes) c.hammer || (c.hammer = new Hammer(c.element), c.hammer.on("pan", this.__trackElement.bind(this, a, b, c)))
  }
  __trackElement(a, b, c, d) {
    console.log("TRACKER node track event", d);
    const {element:e} = c;
    c.x += d.deltaX - (c.__deltaX || 0), c.y += d.deltaY - (c.__deltaY || 0), c.__deltaX = d.isFinal ? 0 : d.deltaX, c.__deltaY = d.isFinal ? 0 : d.deltaY, this.__requestGraphUpdateEvent()
  }
}
(async() => {
  try {
    await require(["Hammer"]), await customElements.whenDefined("graph-display"), customElements.define("graph-tracker", GraphTracker)
  } catch (a) {
    console.error(a)
  }
})();