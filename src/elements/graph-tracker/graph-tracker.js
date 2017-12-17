import require from "../../helper/require.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
export
class GraphTracker extends HTMLElement {
    constructor() {
        super();
        this.__requestGraphUpdateEvent = requestAnimationFunction(() => {
            this.dispatchEvent(new CustomEvent("graph-update", {
                bubbles: true
            }));
        });
        this.dispatchEvent(new CustomEvent("extension-callback", {
            detail: {
                callback: this.__attachListener
            },
            bubbles: true
        }));
    }
    __attachListener(graph_display) {
        console.log("attach listener");
        graph_display.addEventListener("graph-structure-change", event => {
            this.__bindNodes(graph_display);
        });
        this.__bindNodes(graph_display);
    }
    __bindNodes(graph_display) {
        console.log("bind nodes to tracker");
        for (const [key, node] of graph_display.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
                node.hammer.on("pan", this.__trackElement.bind(this, graph_display, key, node));
            }
        }
    }
    __trackElement(graph_display, node_key, node, event) {
        console.log("TRACKER node track event", event);
        const {element} = node;
        node.x += event.deltaX - (node.__deltaX || 0);
        node.y += event.deltaY - (node.__deltaY || 0);
        node.__deltaX = event.isFinal ? 0 : event.deltaX;
        node.__deltaY = event.isFinal ? 0 : event.deltaY;
        // notify host of change
        this.__requestGraphUpdateEvent();
        // auto-paint
    }
};
(async () => {
    try {
        // ensure requirements
        await require(["Hammer"]);
        await customElements.whenDefined("graph-display");
        customElements.define("graph-tracker", GraphTracker);
    } catch (error) {
        console.error(error);
    }
})();