"use strict";

import console from "../../helper/console.js";

import { GraphAddon } from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import { Node } from "../../helper/GraphClasses.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

const style = document.createElement("style");
style.textContent = `:host>svg>#node-group>.node{transition:opacity .5s,fill .5s,stroke-dasharray .5s}:host>svg>#node-group>.node.modifying{fill:#8bc34a;stroke:#33691e;stroke-dasharray:8,2}`;

export default class GraphModifier extends GraphAddon {
    constructor() {
        super();
        // add style
        this.styleElement = this.constructor.styleElement.cloneNode(true);
    }
    hosted(host) {
        host.shadowRoot.appendChild(this.styleElement);
        console.log("");
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
            __setHammerEnabled(host.svg.hammer, false, "pinch", "pan", "rotate", "swipe");
        } else {
            __setHammerEnabled(host.svg.hammer, true, "tap", "press");
        }
        host.svg.hammer.on("tap", event => {
            if (event.target === host.svg) {
                this.__tapCanvas(host, event);
            }
        });
        host.svg.hammer.on("press", event => {
            try {
                if (event.target === host.svg) {
                    this.__pressCanvas(host, event);
                }
            } catch (error) {
                console.error(error);
            }
        });
        host.addEventListener("graph-structure-change", this.__bindNodes.bind(this, host), passive);
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
        // console.log("");
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
                __setHammerEnabled(host.svg.hammer, false, "pinch", "pan", "rotate", "swipe");
            } else {
                __setHammerEnabled(host.svg.hammer, true, "tap", "press");
            }
            if (!node.modifierInstalled) {
                node.modifierInstalled = true;
                // node.hammer.options.domEvents = true;
                node.hammer.get("press").set({ time: 600 });
                node.hammer.on("press", this.__pressNode.bind(this, host, node));
                // TODO: no stopImmediatePropagation available in hammer.js
                // e.g. detail-view tap is still triggered
                node.__tapHandlers = node.hammer.handlers.tap || [];
                // console.log("tap handlers", node.__tapHandlers);
                node.hammer.off("tap");
                node.hammer.on("tap", this.__tapNode.bind(this, host, node), passive);
                const _on = node.hammer.on.bind(node.hammer);
                node.hammer.on = function (recognizer_name, callback) {
                    if (recognizer_name == "tap") {
                        node.__tapHandlers.push(callback);
                    } else {
                        _on(recognizer_name, callback);
                    }
                };
            }
        }
    }
    __pressCanvas(host, event) {
        console.log(event);
        // @IMPORTANT: ensure new vertex key
        let i = 0;
        while (host.graph.hasVertex(i)) {
            ++i;
        }
        host.graph.addNewVertex(i, new host.Node({
            value: {},
            key: i
        }, host.__requestPaintNode.bind(host)));
        // this.dispatchEvent(new Event("graph-structure-change", {}));
        host.graph = host.graph;
        // get freshly created node
        const node = host.graph.vertexValue(i);
        node.x = (event.srcEvent.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        node.y = (event.srcEvent.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
    }
    __pressNode(host, node) {
        console.log("");
        this.selectNode(node);
    }
    __tapCanvas(host, event) {
        console.log(event);
        this.unselectNode();
    }
    __tapNode(host, node, event) {
        console.log(event);
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
            host.graph = host.graph;
            /*this.dispatchEvent(new Event("graph-structure-change", {
                composed: true
            }));*/
        } else {
            for (const tap_handler of node.__tapHandlers) {
                tap_handler(event);
            }
        }
    }
}
GraphModifier.tagName = "graph-modifier";
GraphModifier.styleElement = style;
const passive = {
    passive: true
};
__try(async () => {
    // ensure requirements
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define(GraphModifier.tagName, GraphModifier);
})();