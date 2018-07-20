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
        console.log("graph-modifier: attach link in to host");
        const host = await this.host;
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
        }
        host.svg.hammer.on("tap", event => {
            if (event.srcEvent.path[0] === host.svg) {
                this.__tapCanvas(host, event);
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
        console.log("graph-modifier: bind tracker to nodes");
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
            }
            if (!node.modifierInstalled) {
                node.modifierInstalled = true;
                // node.hammer.options.domEvents = true;
                node.hammer.get("press").set({time: 500});
                node.hammer.on("press", this.__pressNode.bind(this, host, node));
                // TODO: no stopImmediatePropagation available in hammer.js
                // e.g. detail-view tap is still triggered
                this.__tapHandlers = node.hammer.handlers.tap || [];
                node.hammer.off("tap");
                node.hammer.on("tap", this.__tapNode.bind(this, host, node));
            }
        }
    }
    __pressNode(host, node, event) {
        this.selectNode(node);
    }
    __tapCanvas(host, event) {
        console.log("canvas", event);
        this.unselectNode();
    }
    async __tapNode(host, node, event) {
        try {
            console.log("tap", event);
            // @WORKAROUND: invoke usual listeners when not in modifying mode
            // @TODO: event.stopImmediatePropagation();
            event.srcEvent.stopPropagation();
            while (node.hammer.handlers.tap.length > 1) {
                console.log("pop");
                this.__tapHandlers.push(node.hammer.handlers.tap.pop());
            }
            if (this.activeNode) {
                console.log("modifying tap", node);
                if (host.graph.hasEdge(this.activeNode.key, node.key)) {
                    host.graph.removeEdge(this.activeNode.key, node.key);
                } else {
                    host.graph.ensureEdge(this.activeNode.key, node.key);
                }
                await host.__requestBroadcast("graph-structure-change");
            } else {
                for (const tap_handler of this.__tapHandlers) {
                    tap_handler(event);
                }
            }
        } catch (error) {
            console.error(error);
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