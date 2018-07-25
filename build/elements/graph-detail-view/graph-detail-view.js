"use strict";

import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";

const style = document.createElement("style");
style.textContent = ":host{display:none;position:absolute;width:100%;height:100%;background:#4caf50;background:var(--node-color,#4caf50);padding:10px;box-sizing:border-box}:host>*{flex:1;opacity:0}:host(.visible){display:flex}:host(.visible)>*{opacity:1}";
export default class GraphDetailView extends GraphAddon {
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
    hosted(host) {
        console.log("");
        // add tap listener to detail view
        const hammer = new Hammer(this);
        hammer.on("tap", async event => {
            try {
                // only accept event if it originates from the graph-detail-view not from its children
                if (event.srcEvent.path[0] === this) {
                    await this.__tapDetailView(host);
                }
            } catch (error) {
                console.error(error);
            }
        });
        // add tap listener to existing elements
        host.addEventListener("graph-structure-change", event => {
            try {
                this.__bindNodes(host);
            } catch (error) {
                console.error(error);
            }
        }, {
            passive: true
        });
        this.__bindNodes(host);
    }
    __bindNodes(host) {
        console.log("");
        // TODO: check if node already has a tap-listener
        // add tap listener to new elements
        for (const [, node] of host.nodes) {
            // console.log(element);
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
            }
            if (!node.detailViewInstalled) {
                node.detailViewInstalled = true;
                node.hammer.on("tap", async () => {
                    try {
                        this.__tapNode(node);
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }
    __tapNode(node) {
        // console.log("tap");
        return this.showDetailView(node);
    }
    __tapDetailView(host) {
        return this.hideDetailView();
    }
    async showDetailView(node) {
        const host = await this.host;
        if (this.activeNode && this.activeNode !== node) {
            await this.hideDetailView(host);
        } else {
            this.activeNode = node;
            const element = node.element;
            const active_clone = element.cloneNode(true);
            this.__activeClone = active_clone;
            // circle specific !!!
            host.nodeGroup.appendChild(active_clone);
            await new Promise(resolve => {
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
                    }, {
                        passive: true
                    });
                }, {
                    passive: true
                });
            });
        }
    }
    async hideDetailView() {
        const host = await this.host;
        if (this.activeNode) {
            // console.log(event);
            // hide detail view
            const element = this.__activeClone;
            // const {strokeWidth} = getComputedStyle(element);
            this.classList.remove("visible");
            // circle specific !!!
            await new Promise(resolve => {
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
                        element.parentElement.removeChild(element);
                        this.__activeClone = undefined;
                        this.activeNode = undefined;
                        resolve();
                    }, {
                        passive: true
                    });
                }, {
                    passive: true
                });
            });
        }
    }
}
(async () => {
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define("graph-detail-view", GraphDetailView);
})();