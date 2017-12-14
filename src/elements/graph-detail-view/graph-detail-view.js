"use strict";
import GraphExtension from "../graph-extension/graph-extension.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-detail-view/graph-detail-view.css -->";
export class GraphDetailView extends GraphExtension {
    constructor() {
        super();
        // intercept graph change
        const graph_descriptor = Object.getOwnPropertyDescriptor(this, "graph") || Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "graph");
        Object.defineProperties(this.__graphDisplay, {
            graph: Object.assign({
                set(graph) {
                    graph_descriptor.set.call(this.__graphDisplay, graph);
                    this.__attachTapListeners();
                }
            }, graph_descriptor)
        });
        // define own properties
        Object.defineProperties(this, {
            __activeCircle: {
                value: undefined,
                writable: true,
                configurable: true
            }
        });
        // add tap listener to detail view
        const hammer = new Hammer(this);
        hammer.on("tap", this.__tapDetailView.bind(this));
        // add tap listener to existing circles
        this.__attachTapListeners();
        // attach shadow
        this.attachShadow({
            mode: "open"
        });
        // add style
        this.shadowRoot.appendChild(style.cloneNode(true));
        // migrate all children
        for (const child of this.children) {
            this.shadowRoot.appendChild(child);
        }
    }
    __tapCircle(circle) {
        // console.log("tap");
        const active_circle = circle.cloneNode(false);
        this.__activeCircle = active_circle;
        const keyframes = [{}, {
            r: Math.max(this.__graphDisplay.svg.width.baseVal.value, this.__graphDisplay.svg.height.baseVal.value)
        }];
        this.__graphDisplay.svg.appendChild(active_circle);
        const animation = active_circle.animate(keyframes, 500);
        animation.addEventListener("finish", () => {
            this.classList.add("visible");
        });
    }
    __tapDetailView(event) {
        // console.log(event);
        // prevent detail children from closing the detal view
        if (event.srcEvent.path[0] === this) {
            // hide detail view
            const circle = this.__activeCircle;
            this.__activeCircle = undefined;
            // const {strokeWidth} = getComputedStyle(circle);
            this.classList.remove("visible");
            const keyframes = [{
                r: Math.max(this.__graphDisplay.svg.width.baseVal.value, this.__graphDisplay.svg.height.baseVal.value)
            }, {
                r: circle.r.baseVal.value // + parseFloat(strokeWidth)
            }];
            circle.animate(keyframes, 500).addEventListener("finish", () => {
                this.__graphDisplay.svg.removeChild(circle);
            });
        }
    }
    __attachTapListeners() {
        // add tap listener to new circles
        for (const [, circle_object] of this.__graphDisplay.circles) {
            // console.log(circle);
            circle_object.hammer.on("tap", this.__tapCircle.bind(this, circle_object.circle));
        }
    }
};
(async () => {
    await customElements.whenDefined("graph-display");
    customElements.define("graph-detail-view", GraphDetailView);
})();