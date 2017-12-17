"use strict";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-detail-view/graph-detail-view.css -->";
export class GraphDetailView extends HTMLElement {
    constructor() {
        super();
        // intercept graph change
        this.dispatchEvent("extension-callback", {
            detail: {
                callback() {
                    // add tap listener to detail view
                    const hammer = new Hammer(this);
                    hammer.on("tap", this.__tapDetailView.bind(this, graph_display));
                    // add tap listener to existing elements
                    this.__attachTapListeners();
                }
            },
            bubbles: true
        });
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
            __activeElement: {
                value: undefined,
                writable: true,
                configurable: true
            }
        });
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
    __tapNode(graph_display, element) {
        // console.log("tap");
        const active_element = element.cloneNode(true);
        this.__activeElement = active_element;
        // circle specific !!!
        const keyframes = [{}, {
            r: Math.max(graph_display.svg.width.baseVal.value, graph_display.svg.height.baseVal.value)
        }];
        graph_display.svg.appendChild(active_element);
        const animation = active_element.animate(keyframes, 500);
        animation.addEventListener("finish", () => {
            this.classList.add("visible");
        });
    }
    __tapDetailView(graph_display, event) {
        // console.log(event);
        // prevent detail children from closing the detal view
        if (event.srcEvent.path[0] === this) {
            // hide detail view
            const element = this.__activeElement;
            this.__activeElement = undefined;
            // const {strokeWidth} = getComputedStyle(element);
            this.classList.remove("visible");
            // circle specific !!!
            const keyframes = [{
                r: Math.max(graph_display.svg.width.baseVal.value, graph_display.svg.height.baseVal.value)
            }, {
                r: element.r.baseVal.value // + parseFloat(strokeWidth)
            }];
            element.animate(keyframes, 500).addEventListener("finish", () => {
                graph_display.svg.removeChild(element);
            });
        }
    }
    __attachTapListeners(graph_display) {
        // add tap listener to new elements
        for (const [, node] of this.graph_display.nodes) {
            // console.log(element);
            node.hammer.on("tap", this.__tapNode.bind(this, graph_display, node.element));
        }
    }
};
(async () => {
    await customElements.whenDefined("graph-display");
    customElements.define("graph-detail-view", GraphDetailView);
})();