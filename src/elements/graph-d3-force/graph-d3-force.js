"use strict";
import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

const default_configuration = {
    link: {
        distance: 300,
        strength: 0.02
    },
    charge: {
        strength: -40
    },
    gravitation: {
        strength: 100
    }
};
const worker_string = `<!-- inject: ../../../build/elements/graph-d3-force/d3-force-worker.inject.js -->`;
// web worker same origin policy requires host to support OPTIONS CORS
export class GraphD3Force extends GraphAddon {
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
        const on_worker_message = requestAnimationFunction(async ({data}) => {
            try {
                console.log("receive worker update");
                if (data.buffer) {
                    const buffer_array = new Float32Array(data.buffer);
                    await this.__applyGraphUpdate(buffer_array);
                }
                if (data.end) {
                    console.log("worker end");
                    await this.__showLinks();
                }
            } catch (error) {
                console.error(error);
            }
        });
        this.worker.addEventListener("message", on_worker_message);
        this.configuration = _configuration || default_configuration;
        // initiate worker with preassigned graph
    }
    hosted(host) {
        host.addEventListener("graph-structure-change", async () => {
            await this.__sendGraphToWorker();
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
                break;
            case "running":
        }
    }
    async stop() {
        await this.host;
        this.state = "idle";
        this.worker.postMessage({
            run: false
        });
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
        if (!this._linksHidden) {
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
            const promises = [];
            const host = await this.host;
            for (const [source, target, link] of host.graph.edges()) {
                if (link.element) {
                    const promise = new Promise(resolve => {
                        link.element.animate([{
                            opacity: getComputedStyle(link.element).opacity
                        }, {
                            opacity: 0
                        }], 250).addEventListener("finish", () => {
                            link.element.style.visibility = "hidden";
                        });
                    });
                    promises.push(promise);
                }
            }
            await Promise.all(promises);
        }
    }
    async __showLinks() {
        if (this.__linksHidden) {
            console.log("");
            this.__linksHidden = false;
            const promises = [];
            const host = await this.host;
            for (const [source, target, link] of host.graph.edges()) {
                link.element.style.visibility = "";
                if (link.element) {
                    const promise = new Promise(resolve => {
                        link.element.animate([{
                            opacity: 0
                        }, {
                            opacity: getComputedStyle(link.element).opacity
                        }], 500);
                    });
                    promises.push(promise);
                }
            }
            await Promise.all(promises);
        }
    }
};
(async () => {
    try {
        // ensure requirements
        await require(["d3"]);
        await customElements.whenDefined("graph-display");
        customElements.define("graph-d3-force", GraphD3Force);
    } catch (error) {
        console.error(error);
    }
})();