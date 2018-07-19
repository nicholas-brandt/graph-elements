"use strict";
import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-detail-view/graph-detail-view.css -->";
export default
class GraphDetailView extends GraphAddon {
    constructor() {
        super();
        // define own properties
        Object.defineProperties(this, {
            __activeClone: {
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
    async hosted() {
        const host = await this.host;
        // add tap listener to detail view
        const hammer = new Hammer(this);
        hammer.on("tap", event => {
            // only accept event if it originates from the graph-detail-view not from its children
            if (event.srcEvent.path[0] === this) {
                this.__tapDetailView(host);
            }
        });
        // add tap listener to existing elements
        host.shadowRoot.addEventListener("graph-structure-change", event => {
            this.__attachTapListeners(host);
        });
        this.__attachTapListeners(host);
    }
    __tapNode(host, element) {
        // console.log("tap");
        this.activeNode = element.node;
        const active_clone = element.cloneNode(true);
        this.__activeClone = active_clone;
        // circle specific !!!
        host.svg.appendChild(active_clone);
        return new Promise(resolve => {
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
                this.animate(keyframes, 300).addEventListener("finish", () => {
                    resolve();
                });
            });
        });
    }
    __tapDetailView(host) {
        console.log(event);
        // hide detail view
        const element = this.__activeClone;
        // const {strokeWidth} = getComputedStyle(element);
        this.classList.remove("visible");
        // circle specific !!!
        return new Promise(resolve => {
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
                    host.svg.removeChild(element);
                    this.__activeClone = undefined;
                    this.activeNode = undefined;
                    resolve();
                });
            });
        });
    }
    __attachTapListeners(host) {
        // TODO: check if node already has a tap-listener
        // add tap listener to new elements
        for (const [, node] of host.nodes) {
            // console.log(element);
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
            }
            node.hammer.on("tap", this.__tapNode.bind(this, host, node.element));
        }
    }
}
(async () => {
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define("graph-detail-view", GraphDetailView);
})();