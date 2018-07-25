"use strict";
import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

export default
class GraphTracker extends GraphAddon {
    static tagName = "graph-tracker";
    constructor() {
        super();
        let _tracking_mode;
        let _tracking_count;
        let _tracking_initial_time;
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
            },
            trackingCount: {
                get() {
                    return _tracking_count;
                },
                set(tracking_count) {
                    const parsed = parseFloat(tracking_count);
                    if (!isNaN(parsed)) {
                        _tracking_count = parsed;
                    }
                },
                configurable: true,
                enumerable: true
            },
            trackingInitialTime: {
                get() {
                    return _tracking_initial_time;
                },
                set(tracking_initial_time) {
                    const parsed = parseFloat(tracking_initial_time);
                    if (!isNaN(parsed)) {
                        _tracking_initial_time = parsed;
                    }
                },
                configurable: true,
                enumerable: true
            }
        })
        this.trackingMode = this.getAttribute("tracking-mode");
        this.trackingCount = 30;
        this.trackingInitialTime = 10;
    }
    hosted(host) {
        console.log("");
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
        for (const [key, node] of host.nodes) {
            if (!node.hammer) {
                node.hammer = new Hammer(node.element);
            }
            if (!node.trackerInstalled) {
                node.trackerInstalled = true;
                node.hammer.get("pan").set({direction: Hammer.DIRECTION_ALL});
                node.hammer.on("pan", async event => {
                    try {
                        await this.__trackNode(node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
                node.hammer.on("panstart", async event => {
                    try {
                        await this.__trackStart(node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
                node.hammer.on("panend", async event => {
                    try {
                        await this.__trackEnd(node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
                node.hammer.on("pancancel", async event => {
                    try {
                        await this.__trackEnd(node, event);
                    } catch (error) {
                        console.error(error);
                    }
                });
            }
        }
    }
    async __trackNode(node, event) {
        try {
            console.log(event);
            // event.srcEvent.stopPropagation();
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
        } catch (error) {
            console.error(error);
        }
    }
    async __trackStart(node) {
        node.tracking = true;
        node.__trackingTime = this.trackingInitialTime;
        node.element.classList.add("tracking");
        if (this.trackingMode == "hiding") {
            console.log("graph-tracker: normally hiding links");
            await this.__hideLinks(node);
        }
        node.__onNodePaint = this.__onNodePaint.bind(this, node);
        const host = await this.host;
        host.addEventListener("paint", node.__onNodePaint, {
            passive: true
        });
    }
    async __trackEnd(node) {
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
                            }, {
                                passive: true
                            });
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
                            }], 500).addEventListener("finish", () => resolve(), {
                                passive: true
                            });
                        });
                        promises.push(promise);
                    }
                }
            }
            await Promise.all(promises);
        }
    }
    async __onNodePaint(node, event) {
        try {
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
        customElements.define(GraphTracker.tagName, GraphTracker);
    } catch (error) {
        console.error(error);
    }
})();