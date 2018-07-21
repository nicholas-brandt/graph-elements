"use strict";
import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
// import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-contextmenu/graph-contextmenu.css -->";
export default
class GraphContextmenu extends GraphAddon {
    constructor() {
        super();
        this.contextmenuElement = document.createElement("div");
        this.contextmenuElement.classList.add("contextmenu");
        /*this.contextmenuElement.addEventListener("contextmenu", event => {
            event.preventDefault();
            event.stopPropagation();
        });*/
        for (const child of [...this.children]) {
            this.contextmenuElement.appendChild(child);
        }
        // add style
        this.appendChild(style.cloneNode(true));
    }
    async hosted() {
        const host = await this.host;
        this.__foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        this.__foreignObject.appendChild(this.contextmenuElement);
        host.svg.appendChild(this.__foreignObject);
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
        }
        host.svg.hammer.on("tap", event => {
            if (event.srcEvent.path[0] === host.svg) {
                this.__tapCanvas();
            }
        });
        host.svg.addEventListener("contextmenu", event => {
            try {
                this.__contextmenuCanvas(host, event);
            } catch (error) {
                console.error(error);
            }
        });
        host.shadowRoot.addEventListener("graph-structure-change", event => {
            try {
                this.__bindNodes(host);
            } catch (error) {
                console.error(error);
            }
        });
        this.__bindNodes(host);
    }
    __bindNodes(host) {
        console.log("");
        for (const [key, node] of host.nodes) {
            if (!node.contextmenuInstalled) {
                node.contextmenuInstalled = true;
                node.element.addEventListener("contextmenu", event => {
                    try {
                        this.__contextmenuNode(host, node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }
    __tapCanvas() {
        console.log("");
        this.__foreignObject.classList.remove("visible");
    }
    __contextmenuCanvas(host, event) {
        console.log(event);
        event.preventDefault();
        const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        const y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
        this.showContextmenu(host, x, y);
    }
    __contextmenuNode(host, node, event) {
        console.log(node, event);
        event.preventDefault();
        event.stopPropagation();
        const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        const y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
        this.showContextmenu(host, x, y);
    }
    showContextmenu(host, x, y) {
        this.__foreignObject.classList.add("visible");
        host.svg.appendChild(this.__foreignObject);
        this.__foreignObject.x.baseVal.value = x;
        this.__foreignObject.y.baseVal.value = y; 
    }
}
(async () => {
    try {
        // ensure requirements
        await require(["Hammer"]);
        await customElements.whenDefined("graph-display");
        customElements.define("graph-contextmenu", GraphContextmenu);
    } catch (error) {
        console.error(error);
    }
})();