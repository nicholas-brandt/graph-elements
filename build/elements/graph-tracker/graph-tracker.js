"use strict";

import console from "../../helper/console.js";

import { GraphAddon } from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

export default class GraphTracker extends GraphAddon {
    constructor(...args) {
        super(...args);
        this.__deltaX = 0;
        this.__deltaY = 0;
        this.__canvasX = 0;
        this.__canvasY = 0;
        let tracking_mode;
        let is_tracking_canvas = false;
        let tracking_count;
        let tracking_initial_time;
        Object.defineProperties(this, {
            trackingMode: {
                get() {
                    return tracking_mode;
                },
                set(_tracking_mode) {
                    switch (_tracking_mode) {
                        case "hiding":
                            tracking_mode = "hiding";
                            break;
                        case "normal":
                            tracking_mode = "normal";
                            break;
                        default:
                            tracking_mode = "adaptive";
                    }
                },
                configurable: true,
                enumerable: true
            },
            trackingCount: {
                get() {
                    return tracking_count;
                },
                set(_tracking_count) {
                    const parsed = parseFloat(_tracking_count);
                    if (!isNaN(parsed)) {
                        tracking_count = parsed;
                    }
                },
                configurable: true,
                enumerable: true
            },
            trackingInitialTime: {
                get() {
                    return tracking_initial_time;
                },
                set(_tracking_initial_time) {
                    const parsed = parseFloat(_tracking_initial_time);
                    if (!isNaN(parsed)) {
                        tracking_initial_time = parsed;
                    }
                },
                configurable: true,
                enumerable: true
            },
            isTrackingCanvas: {
                get() {
                    return is_tracking_canvas;
                },
                set(_is_tracking_canvas) {
                    is_tracking_canvas = !!_is_tracking_canvas;
                }
            }
        });
        this.trackingMode = this.getAttribute("tracking-mode");
        this.isTrackingCanvas = /^(|true)$/.test(this.getAttribute("track-canvas"));
        this.trackingCount = 30;
        this.trackingInitialTime = 10;
    }
    hosted(host) {
        console.log("");
        host.addEventListener("graph-structure-change", this.__bindNodes.bind(this, host), passive);
        host.addEventListener("resize", __try(event => {
            const { baseVal } = host.svg.viewBox;
            baseVal.x -= this.__canvasX / 2;
            baseVal.y -= this.__canvasY / 2;
        }), passive);
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
            __setHammerEnabled(host.svg.hammer, false, "pinch", "press", "tap", "rotate", "swipe");
        } else {
            __setHammerEnabled(host.svg.hammer, true, "pan");
        }
        host.svg.hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
        host.svg.hammer.on("pan", this.__trackCanvas.bind(this));
        this.__bindNodes(host);
    }
    __bindNodes(host) {
        console.log("");
        let has_new_node;
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
                __setHammerEnabled(node.hammer, false, "pinch", "press", "tap", "rotate", "swipe");
            } else {
                __setHammerEnabled(node.hammer, true, "pan");
            }
            if (!node.trackerInstalled) {
                node.trackerInstalled = true;
                node.hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
                node.hammer.on("pan", __try(this.__trackNode.bind(this, node)));
                node.hammer.on("panstart", __try(this.__trackNodeStart.bind(this, node)));
                node.hammer.on("panend", __try(this.__trackNodeEnd.bind(this, node)));
                node.hammer.on("pancancel", __try(this.__trackNodeEnd.bind(this, node)));
                has_new_node = true;
            }
        }
        if (has_new_node) {
            // @PROBLEM: https://stackoverflow.com/questions/37688640/hammerjs-events-order-for-nested-elements/52682659#52682659
            // reassign manager to delay recognition of the "pan"-event for the canvas (until after the node event)
            host.svg.hammer.input.destroy();
            host.svg.hammer.input.init();
        }
    }
    async __trackNode(node, event) {
        console.log(event);
        // console.time("trackNode");
        // console.timeEnd("trackNode");
        if (this.isTrackingCanvas) {
            this.__isNodeSession = true;
            // event.srcEvent.stopImmediatePropagation();
        }
        node.x += event.deltaX - (node.__deltaX || 0);
        node.y += event.deltaY - (node.__deltaY || 0);
        node.__deltaX = event.isFinal ? 0 : event.deltaX;
        node.__deltaY = event.isFinal ? 0 : event.deltaY;
        // adaptively hide links
        // notify host of change
        this.dispatchEvent(new Event("graph-update", {
            bubbles: true,
            composed: true
        }));
    }
    __trackCanvas(event) {
        if (this.isTrackingCanvas && !this.__isNodeSession) {
            console.log(event);
            const dx = event.deltaX - (this.__deltaX || 0);
            const dy = event.deltaY - (this.__deltaY || 0);
            this.__canvasX += dx;
            this.__canvasY += dy;
            this.__deltaX = event.isFinal ? 0 : event.deltaX;
            this.__deltaY = event.isFinal ? 0 : event.deltaY;
            const { baseVal } = event.target.viewBox;
            baseVal.x -= dx;
            baseVal.y -= dy;
            this.dispatchEvent(new Event("viewbox-update", {
                bubbles: true,
                composed: true
            }));
        } else {
            this.__isNodeSession = false;
        }
    }
    async __trackNodeStart(node) {
        node.tracking = true;
        node.__trackingTime = this.trackingInitialTime;
        node.element.classList.add("tracking");
        if (this.trackingMode == "hiding") {
            console.log("graph-tracker: normally hiding links");
            await this.__hideLinks(node);
        }
        node.__onNodePaint = this.__onNodePaint.bind(this, node);
        const host = await this.host;
        host.addEventListener("paint", node.__onNodePaint, passive);
    }
    async __trackNodeEnd(node) {
        node.tracking = false;
        node.element.classList.remove("tracking");
        console.assert(typeof node.__onNodePaint == "function", "invalid or missing node.__onNodePaint");
        const host = await this.host;
        host.removeEventListener("paint", node.__onNodePaint);
        await this.__showLinks(node);
    }
    async __hideLinks(node) {
        console.log("");
        if (!node.__linksHidden) {
            node.__linksHidden = true;
            const promises = [];
            const host = await this.host;
            for (const [source, target, link] of host.graph.edges()) {
                if (source == node.key || target == node.key) {
                    if (link.element) {
                        const promise = new Promise(resolve => {
                            link.element.animate([{
                                opacity: getComputedStyle(link.element).opacity
                            }, {
                                opacity: 0
                            }], 250).addEventListener("finish", () => {
                                link.element.style.visibility = "hidden";
                                resolve();
                            }, passive);
                        });
                        promises.push(promise);
                    }
                }
            }
            await Promise.all(promises);
        }
    }
    async __showLinks(node) {
        if (node.__linksHidden) {
            node.__linksHidden = false;
            console.log("");
            const promises = [];
            const host = await this.host;
            for (const [source, target, link] of host.graph.edges()) {
                if (source == node.key || target == node.key) {
                    link.element.style.visibility = "";
                    if (link.element) {
                        const promise = new Promise(resolve => {
                            link.element.animate([{
                                opacity: 0
                            }, {
                                opacity: getComputedStyle(link.element).opacity
                            }], 500).addEventListener("finish", () => resolve(), passive);
                        });
                        promises.push(promise);
                    }
                }
            }
            await Promise.all(promises);
        }
    }
    async __onNodePaint(node, event) {
        if (this.trackingMode == "adaptive" && !node.__linksHidden) {
            // console.time("timediff");
            const time_difference = await requestTimeDifference();
            node.__trackingTime = (node.__trackingTime * (this.trackingCount - 1) + time_difference) / this.trackingCount;
            // console.timeEnd("timediff");
            console.log("time difference", time_difference);
            // console.log("graph-tracker: node.__trackingTime", node.__trackingTime);
            if (node.__trackingTime > 17 && node.tracking) {
                console.log("adaptively hiding links", time_difference);
                await this.__hideLinks(node);
            }
        }
    }
}
GraphTracker.tagName = "graph-tracker";
const passive = {
    passive: true
};
__try(async () => {
    // ensure requirements
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define(GraphTracker.tagName, GraphTracker);
})();