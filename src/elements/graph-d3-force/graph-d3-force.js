"use strict";
import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

const worker_string = `<!-- inject: ./d3-force-worker.js -->`;
// web worker same origin policy requires host to support OPTIONS CORS

export class GraphD3Force extends GraphAddon {
    static tagName = "graph-d3-force";
    static defaultConfiguration = {
        link: {
            distance: 20,
            strength: .4
        },
        charge: {
            strength: -300,
            distanceMax: 2e2
        },
        gravitation: {
            strength: 100
        },
        alphaMin: 1e-3,
        alpha: .5,
        alphaDecay: 1 - 1e-3 ** (1 / 600),
        alphaTarget: 0,
        velocityDecay: 0.1
    };
    constructor() {
        super();
        let _configuration = this.configuration;
        delete this.configuration;
        // define own properties
        Object.defineProperties(this, {
            worker: {
                // value: new Worker(worker_data)
                value: new Worker("data:application/javascript," + encodeURIComponent(worker_string)),
                enumerable: true
            },
            configuration: {
                set (configuration) {
                    this.worker.postMessage({
                        configuration
                    });
                    _configuration = configuration;
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
            }
        });
        this.__state = "idle";
        const on_worker_message = ({data}) => {
            if (data.configuration) {
                console.log("assign configuration from worker");
                Object.assign(this.configuration, data.configuration);
                Object.assign(this.configuration.link, data.configuration.link);
                Object.assign(this.configuration.charge, data.configuration.charge);
            }
            this.__requestApplication(data);
        };
        this.__requestApplication = requestAnimationFunction(async data => {
            try {
                if (this.state == "running" && data.buffer) {
                    console.log("receive worker buffer");
                    const buffer_array = new Float32Array(data.buffer);
                    await this.__applyGraphUpdate(buffer_array);
                }
                if (data.end) {
                    console.log("worker end");
                    await this.__showLinks();
                    this.dispatchEvent(new Event("simulationend", {
                        bubbles: true,
                        composed: true
                    }));
                }
            } catch (error) {
                console.error(error);
            }
        });
        this.worker.addEventListener("message", on_worker_message, {
            passive: true
        });
        this.configuration = _configuration || this.constructor.defaultConfiguration;
        this.worker.postMessage({
            getConfiguration: true
        });
    }
    hosted(host) {
        host.addEventListener("graph-structure-change", async () => {
            await this.__sendGraphToWorker();
        }, {
            passive: true
        });
    }
    async __sendGraphToWorker(run) {
        console.log("");
        const host = await this.host;
        const nodes = [...host.nodes.values()];
        const d3_nodes = nodes.map(({x, y}, index) => ({x, y, index}));
        const links = [...host.links].map(({source, target}) => ({
            source: nodes.indexOf(source), // index for d3
            target: nodes.indexOf(target) // index for d3
        }));
        // 32 bit * 2 * N
        const buffer = new ArrayBuffer(nodes.length * 4 * 2);
        const buffer_array = new Float32Array(buffer);
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            buffer_array[i * 2] = node.x;
            buffer_array[i * 2 + 1] = node.y;
        }
        const message = {
            graph: {
                nodes: d3_nodes,
                links
            },
            buffer,
            run
        };
        if (run !== undefined) {
            message.run = !!run;
        }
        this.worker.postMessage(message);
    }
    async start() {
        switch (this.state) {
            case "idle":
                await this.__sendGraphToWorker(true);
                this.__state = "running";
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
            this.worker.postMessage({
                run: false
            });
            this.dispatchEvent(new Event("simulationstop", {
                bubbles: true,
                composed: true
            }));
            await this.__showLinks();
        }
    }
    async __applyGraphUpdate(buffer_array) {
        console.log(buffer_array.length);
        const host = await this.host;
        const vertices = [...host.graph.vertices()];
        for (let i = 0; i < vertices.length; ++i) {
            const node = vertices[i][1];
            const x = buffer_array[i * 2];
            const y = buffer_array[i * 2 + 1];
            node.x = x;
            node.y = y;
        }
        this.dispatchEvent(new Event("graph-update", {
            composed: true
        }));
        if (!this.__linksHidden) {
            // console.time("paint time");
            const time_difference = await requestTimeDifference();
            // console.timeEnd("paint time");
            console.log("time difference", time_difference);
            if (time_difference > 17) {
                await this.__hideLinks();
            }
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
(async () => {
    try {
        // ensure requirements
        await require(["d3"]);
        await customElements.whenDefined("graph-display");
        customElements.define(GraphD3Force.tagName, GraphD3Force);
    } catch (error) {
        console.error(error);
    }
})();