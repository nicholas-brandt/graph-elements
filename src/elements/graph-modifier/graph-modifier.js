"use strict";
import createConsole from "../../helper/console.js";
const console = createConsole("graph-modifier");

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-modifier/graph-modifier.css -->";
export default
class GraphModifier extends GraphAddon {
    constructor() {
        super();
        let _tracking_mode;
        Object.defineProperties(this, {
            trackingMode: {
                get() {
                    return _tracking_mode;
                },
                set(tracking_mode) {
                    switch (tracking_mode) {
                        case "hiding":
                            _tracking_mode = "hiding";
                            break;
                        case "normal":
                            _tracking_mode = "normal";
                            break;
                        default:
                            _tracking_mode = "adaptive";
                    }
                },
                configurable: true,
                enumerable: true
            }
        })
        this.trackingMode = this.getAttribute("tracking-mode");
        // add style
        this.appendChild(style.cloneNode(true));
    }
    async hosted() {
        console.log("attach link in to host");
        const host = await this.host;
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
        }
        host.svg.hammer.on("tap", event => {
            if (event.srcEvent.path[0] === host.svg) {
                this.__tapCanvas(host, event);
            }
        });
        host.svg.hammer.on("press", event => {
            try {
                if (event.srcEvent.path[0] === host.svg) {
                    this.__pressCanvas(host, event);
                }
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
    selectNode(node) {
        this.unselectNode();
        this.activeNode = node;
        node.element.classList.add("modifying");
    }
    unselectNode() {
        if (this.activeNode) {
            this.activeNode.element.classList.remove("modifying");
            this.activeNode = undefined;
        }
    }
    __bindNodes(host) {
        console.log("bind tracker to nodes");
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
            }
            if (!node.modifierInstalled) {
                node.modifierInstalled = true;
                // node.hammer.options.domEvents = true;
                node.hammer.get("press").set({time: 300});
                node.hammer.on("press", this.__pressNode.bind(this, host, node));
                // TODO: no stopImmediatePropagation available in hammer.js
                // e.g. detail-view tap is still triggered
                node.__tapHandlers = node.hammer.handlers.tap || [];
                node.hammer.off("tap");
                node.hammer.on("tap", event => {
                    try {
                        this.__tapNode(host, node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }
    __pressCanvas(host, event) {
        console.log("press canvas", event);
        // @IMPORTANT: ensure new vertex key
        let i = 0;
        while (host.graph.hasVertex(i)) {
            ++i;
        }
        host.graph.addNewVertex(i);
        host.__broadcast("graph-structure-change");
        // get freshly created node
        const node = host.graph.vertexValue(i);
        node.x = (event.srcEvent.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        node.y = (event.srcEvent.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    }
    __pressNode(host, node) {
        this.selectNode(node);
    }
    __tapCanvas(host, event) {
        console.log("canvas", event);
        this.unselectNode();
    }
    __tapNode(host, node, event) {
        console.log("tap", event);
        // @WORKAROUND: invoke usual listeners when not in modifying mode
        // @TODO: event.stopImmediatePropagation();
        event.srcEvent.stopPropagation();
        while (node.hammer.handlers.tap.length > 1) {
            console.log("pop");
            node.__tapHandlers.push(node.hammer.handlers.tap.pop());
        }
        if (this.activeNode) {
            // link active node with tapped node
            console.log("modifying tap", node);
            if (host.graph.hasEdge(this.activeNode.key, node.key)) {
                host.graph.removeEdge(this.activeNode.key, node.key);
            } else {
                host.graph.ensureEdge(this.activeNode.key, node.key);
            }
            host.__broadcast("graph-structure-change");
        } else {
            for (const tap_handler of node.__tapHandlers) {
                tap_handler(event);
            }
        }
    }
}
(async () => {
    try {
        // ensure requirements
        await require(["Hammer"]);
        await customElements.whenDefined("graph-display");
        customElements.define("graph-modifier", GraphModifier);
    } catch (error) {
        console.error(error);
    }
})();