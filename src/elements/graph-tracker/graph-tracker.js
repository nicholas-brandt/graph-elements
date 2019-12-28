"use strict";
import console from "../../helper/console.js";

import {GraphAddon} from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";

import "//cdn.jsdelivr.net/npm/panzoom@8.7.3/dist/panzoom.min.js";

export default
class GraphTracker extends GraphAddon {
    static tagName = "graph-tracker";
    constructor(...args) {
        super(...args);
        this.__deltaX = 0;
        this.__deltaY = 0;
        this.__canvasX = 0;
        this.__canvasY = 0;
        this.__scaleFactor = 1;
        let tracking_mode;
        let is_tracking_canvas = false;
        let tracking_count;
        let tracking_initial_time;
        let is_scaling = false;
        let has_scaling_listener = false;
        this.__translateX = 0;
        this.__translateY = 0;
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
            isPanZooming: {
                get() {
                    return is_tracking_canvas;
                },
                set(_is_tracking_canvas) {
                    is_tracking_canvas = !!_is_tracking_canvas;
                    if (is_tracking_canvas) {
                        this.panHandler.resume();
                    } else {
                        this.panHandler.pause();
                    }
                }
            }
        });
        this.trackingMode = this.getAttribute("tracking-mode");
        this.isTrackingCanvas = /^(|true)$/.test(this.getAttribute("pan-zooming"));
        this.trackingCount = 30;
        this.trackingInitialTime = 10;
    }
    hosted(host) {
        this.host_svg = host.svg;
        this.isScaling = this.isScaling;
        
        console.log("");
        host.addEventListener("graph-structure-change", this.__bindNodes.bind(this, host), passive);
        host.addEventListener("resize", __try(event => {
            const {baseVal} = host.svg.viewBox;
            baseVal.x -= this.__canvasX / 2;
            baseVal.y -= this.__canvasY / 2;
        }), passive);
        
        this.panHandler = panzoom(host.mainGroup, {
            smoothScroll: true
        });
        const pan_promise = new Promise(resolve => {
            requestAnimationFrame(() => {
                this.panHandler.zoomAbs(host.svg.clientWidth / 2, host.svg.clientHeight / 2, 1);
                resolve();
            });
        });
        
        this.__bindNodes(host);
        
        return pan_promise;
    }
    __bindNodes(host) {
        console.log("");
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
                __setHammerEnabled(node.hammer, false, "pinch", "press", "tap", "rotate", "swipe");
            } else {
                __setHammerEnabled(node.hammer, true, "pan");
            }
            if (!node.trackerInstalled) {
                node.trackerInstalled = true;
                node.hammer.get("pan").set({direction: Hammer.DIRECTION_ALL});
                node.hammer.on("pan", __try(this.__trackNode.bind(this, node)));
                node.hammer.on("panstart", __try(this.__trackNodeStart.bind(this, node)));
                node.hammer.on("panend", __try(this.__trackNodeEnd.bind(this, node)));
                node.hammer.on("pancancel", __try(this.__trackNodeEnd.bind(this, node)));
                
                node.element.addEventListener("pointerdown", () => {
                    console.log("pointerdown pause");
                    this.panHandler.pause();
                });
                node.element.addEventListener("pointerup", () => {
                    console.log("pointerup resume");
                    this.panHandler.resume();
                });
            }
        }
    }
    async __trackNode(node, event) {
        event.srcEvent.stopPropagation();
        console.log(event);
        // console.time("trackNode");
        // console.timeEnd("trackNode");
        if (this.isTrackingCanvas) {
            this.__isNodeSession = true
            // event.srcEvent.stopImmediatePropagation();
        }
        const scale_factor = this.panHandler.getTransform().scale;
        const scaled_delta_x = event.deltaX / scale_factor;
        const scaled_delta_y = event.deltaY / scale_factor;
        node.x += scaled_delta_x - (node.__deltaX || 0);
        node.y += scaled_delta_y - (node.__deltaY || 0);
        node.__deltaX = event.isFinal ? 0 : scaled_delta_x;
        node.__deltaY = event.isFinal ? 0 : scaled_delta_y;
        // adaptively hide links
        // notify host of change
        this.dispatchEvent(new Event("graph-update", {
            bubbles: true,
            composed: true
        }));
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
const passive = {
    passive: true
};
__try(async () => {
    // ensure requirements
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define(GraphTracker.tagName, GraphTracker);
})();