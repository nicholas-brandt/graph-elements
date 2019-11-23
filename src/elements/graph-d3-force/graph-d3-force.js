"use strict";
import console from "../../helper/console.js";

import workerize from "https://rawgit.com/Jamtis/workerize/patch-1/src/index.js";
import {GraphAddon} from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";

// web worker same origin policy requires host to support OPTIONS CORS

const module_url = new URL(import.meta.url);
const worker_url = module_url.origin + module_url.pathname + "/../d3-force-worker.js";

export default
class GraphD3Force extends GraphAddon {
    static tagName = "graph-d3-force";
    static defaultConfiguration = {
        link: {
            distance: 20,
            strength: .4
        },
        charge: {
            strength: -1e3,
            distanceMax: 2e2
        },
        gravitation: {
            strength: .1,
            radius: 0
        },
        alphaMin: 1e-3,
        alpha: .5,
        alphaDecay: 1 - 1e-3 ** (1 / 600),
        alphaTarget: 0,
        velocityDecay: 0.1
    };
    constructor(...args) {
        super(...args);
        let _configuration = this.configuration;
        delete this.configuration;
        let _adaptive_links;
        // define own properties
        Object.defineProperties(this, {
            worker: {
                value: workerize(`const worker_url="${worker_url}";<!-- inject: ./dummy.js -->`, {
                    type: "classic"
                }),
                enumerable: true
            },
            configuration: {
                set (configuration) {
                    _configuration = configuration;
                    this.dispatchEvent(new Event("configuration-change", {
                        composed: true,
                        bubbles: true
                    }));
                },
                get() {
                    return _configuration;
                },
                enumerable: true	
            },
            state: {
                get() {
                    return this.__state;
                },
                enumerable: true,
                configurable: true
            },
            adaptiveLinks: {
                get() {
                    return _adaptive_links;
                },
                set(adaptive_links) {
                    _adaptive_links = !!adaptive_links;
                },
                configurable: true,
                enumerable: true
            },
        });
        this.__state = "idle";
        this.__loopEnds();
        this.adaptiveLinks = this.getAttribute("adaptive-links") != "false";
        this.configuration = Object.assign({}, this.constructor.defaultConfiguration, _configuration);
    }
    hosted(host) {
        host.addEventListener("graph-structure-change", async () => {
            this.__graphChanged = true;
            try {
                await this.__sendGraphToWorker();
            } catch (error) {
                console.warn(error);
            }
            this.__graphChanged = false;
        }, {
            passive: true
        });
    }
    async __sendGraphToWorker() {
        console.log("");
        const host = await this.host;
        const nodes = [...host.nodes.values()];
        const d3_nodes = nodes.map(({x, y}, index) => ({x, y, index}));
        const links = [...host.links].map(({source, target}) => ({
            source: nodes.indexOf(source), // index for d3
            target: nodes.indexOf(target) // index for d3
        }));
        // 32 bit * 2 * N
        const buffer_array = new Float32Array(nodes.length * 2);
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            buffer_array[i * 2] = node.x;
            buffer_array[i * 2 + 1] = node.y;
        }
        await this.worker.setGraph({
            nodes: d3_nodes,
            links
        });
    }
    async __loopTicks() {
        try {
            while (this.state == "running") {
                try {
                    const buffer = await this.worker.getTickPromise();
                    await this.__applyGraphUpdate(buffer);
                } catch (error) {
                    if (error.message != "graph replaced") {
                        throw new Error("looping error: " + error.message);
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
    async __loopEnds() {
        try {
            while (true) {
                await this.worker.getEndPromise();
                this.__state = "idle";
                await this.__showLinks();
                this.dispatchEvent(new Event("simulationend", {
                    bubbles: true,
                    composed: true
                }));
            }
        } catch (error) {
            console.error(error);
        }
    }
    async start() {
        switch (this.state) {
            case "idle":
                await this.applyConfiguration();
                await this.__sendGraphToWorker();
                this.__state = "running";
                this.__loopTicks();
                await this.worker.start();
                this.dispatchEvent(new Event("simulationstart", {
                    bubbles: true,
                    composed: true
                }));
                break;
            case "running":
        }
    }
    async stop() {
        await this.host;
        if (this.state == "running") {
            this.__state = "idle";
            await this.worker.stop();
            this.dispatchEvent(new Event("simulationstop", {
                bubbles: true,
                composed: true
            }));
            await this.__showLinks();
        }
    }
    applyConfiguration() {
        return this.worker.setConfiguration(this.configuration);
    }
    async __applyGraphUpdate(buffer) {
        if (!this.__graphChanged) {
            const host = await this.host;
            const vertices = [...host.graph.vertices()];
            const buffer_array = new Float32Array(buffer);
            for (let i = 0; i < vertices.length; ++i) {
                const [,node] = vertices[i];
                const x = buffer_array[i * 2];
                const y = buffer_array[i * 2 + 1];
                node.x = x;
                node.y = y;
            }
            this.dispatchEvent(new Event("graph-update", {
                composed: true
            }));
            if (this.adaptiveLinks && !this.__linksHidden) {
                // console.time("paint time");
                const time_difference = await requestTimeDifference();
                // console.timeEnd("paint time");
                console.log("time difference", time_difference);
                if (time_difference > 17) {
                    await this.__hideLinks();
                }
            }
        } else {
            console.log("illegal graph change");
        }
    }
    async __hideLinks() {
        if (!this.__linksHidden) {
            console.log("");
            this.__linksHidden = true;
            const host = await this.host;
            await new Promise(resolve => {
                host.linkGroup.animate([{
                    opacity: getComputedStyle(host.linkGroup).opacity
                }, {
                    opacity: 0
                }], 250).addEventListener("finish", () => {
                    host.linkGroup.style.visibility = "hidden";
                    resolve();
                }, {
                    passive: true
                });
            });
        }
    }
    async __showLinks() {
        if (this.__linksHidden) {
            console.log("");
            this.__linksHidden = false;
            const host = await this.host;
            await new Promise(resolve => {
                host.linkGroup.style.visibility = "";
                host.linkGroup.animate([{
                    opacity: 0
                }, {
                    opacity: getComputedStyle(host.linkGroup).opacity
                }], 500).addEventListener("finish", resolve, {
                    passive: true
                });
            });
        }
    }
};
__try(async () => {
    // ensure requirements
    await require(["d3"]);
    await customElements.whenDefined("graph-display");
    customElements.define(GraphD3Force.tagName, GraphD3Force);
})();