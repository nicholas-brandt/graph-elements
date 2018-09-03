"use strict";

import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

const worker_string = `importScripts("https://unpkg.com/d3@5.5.0/dist/d3.min.js");
// importScripts("https://d3js.org/d3.v4.min.js");
// importScripts("../../helper/associate.js");

const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const gravitation_force = d3.forceRadial(0);
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
let running = false;
simulation.force("position", gravitation_force);
simulation.force("link", link_force);
simulation.force("center", center_force);
simulation.force("charge", charge_force);
simulation.stop();

const attributes = ["alpha", "alphaMin", "alphaTarget", "alphaDecay", "velocityDecay"];
const link_attributes = ["distance", "strength"];
const charge_attributes = ["strength", "distanceMax", "distanceMin"];
const gravitation_attributes = ["strength"];

const configuration = {};
const link_configuration = {};
const charge_configuration = {};
const gravitation_configuration = {};
Object.defineProperties(configuration, {
    link: {
        get() {
            return link_configuration;
        },
        set(value) {
            Object.assign(link_configuration, value);
        },
        enumerable: true,
        configurable: true
    },
    charge: {
        get() {
            return charge_configuration;
        },
        set(value) {
            Object.assign(charge_configuration, value);
        },
        enumerable: true,
        configurable: true
    },
    gravitation: {
        get() {
            return gravitation_configuration;
        },
        set(value) {
            Object.assign(gravitation_configuration, value);
        },
        enumerable: true,
        configurable: true
    }
});
associate(configuration, simulation, attributes);
associate(configuration.link, link_force, link_attributes);
associate(configuration.charge, charge_force, charge_attributes);
associate(configuration.gravitation, gravitation_force, gravitation_attributes);

let buffer_array;

simulation.on("tick", () => {
    const nodes = simulation.nodes();
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        buffer_array[i * 2] = node.x;
        buffer_array[i * 2 + 1] = node.y;
    }
    // console.log(nodes.map(JSON.stringify), buffer_array);
    // dispatch draw message to main window
    // write graph data into buffer
    const buffer_length = buffer_array.buffer.byteLength;
    // console.log("WORKER: buffer length", buffer_length);
    // transfer buffer for faster propagation to display
    postMessage({
        buffer: buffer_array.buffer,
        alpha: simulation.alpha()
    }, [buffer_array.buffer]);
    buffer_array = new Float32Array(new ArrayBuffer(buffer_length));
});
simulation.on("end", () => {
    // end yields no new simulation step
    postMessage({
        end: true
    });
});

addEventListener("message", ({ data }) => {
    console.log("WORKER: get message", data);
    if (data.configuration) {
        Object.assign(configuration, data.configuration);
        if (data.configuration.link) {
            simulation.force("link", link_force);
        }
        if (data.configuration.charge) {
            simulation.force("charge", charge_force);
        }
        for (const attribute of attributes) {
            if (attribute in data.configuration) {
                simulation[attribute](data.configuration[attribute]);
            }
        }
    }
    if (data.graph && data.buffer) {
        buffer_array = new Float32Array(data.buffer);
        const { nodes, links } = data.graph;
        simulation.nodes(nodes);
        link_force.links(links);
        if (running) {
            simulation.restart();
        }
    }
    if (data.updatedNode && data.updatedNode[Symbol.iterator]) {
        let i = 0;
        const nodes = simulation.nodes();
        for (const updated_node of data.updatedNode) {
            const node = nodes[i++];
            node.x = updated_node.x;
            node.y = updated_node.y;
        }
    }
    if ("run" in data && data.run !== undefined) {
        if (data.run) {
            simulation.restart();
            running = true;
        } else {
            simulation.stop();
            running = false;
        }
    }
    if (false && data.getConfiguration) {
        const data = {
            configuration: Object.assign({}, configuration, {
                link: Object.assign({}, configuration.link),
                charge: Object.assign({}, configuration.charge)
            })
        };
        postMessage(data);
    }
});

function associate(proxy, target, attributes) {
    const descriptors = {};
    for (const attribute of attributes) {
        descriptors[attribute] = {
            get() {
                console.assert(typeof target[attribute] == "function", "invalid attribute", attribute);
                return target[attribute]();
            },
            set(value) {
                console.assert(typeof target[attribute] == "function", "invalid attribute", attribute);
                target[attribute](value);
            },
            enumerable: true,
            configurable: true
        };
    }
    Object.defineProperties(proxy, descriptors);
}`;
// web worker same origin policy requires host to support OPTIONS CORS

export class GraphD3Force extends GraphAddon {
    constructor() {
        super();
        let _configuration = this.configuration;
        delete this.configuration;
        let _adaptive_links;
        // define own properties
        Object.defineProperties(this, {
            worker: {
                // value: new Worker(worker_data)
                value: new Worker("data:application/javascript," + encodeURIComponent(worker_string)),
                enumerable: true
            },
            configuration: {
                set(configuration) {
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
            }
        });
        this.__state = "idle";
        const on_worker_message = ({ data }) => {
            if (data.configuration) {
                console.log("assign configuration from worker");
                Object.assign(this.configuration, data.configuration);
                Object.assign(this.configuration.link, data.configuration.link);
                Object.assign(this.configuration.charge, data.configuration.charge);
                Object.assign(this.configuration.gravitation, data.configuration.gravitation);
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
        });
        this.adaptiveLinks = this.getAttribute("adaptive-links") != "false";
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
        const d3_nodes = nodes.map(({ x, y }, index) => ({ x, y, index }));
        const links = [...host.links].map(({ source, target }) => ({
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
            run,
            configuration: this.configuration
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
        if (this.adaptiveLinks && !this.__linksHidden) {
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
}GraphD3Force.tagName = "graph-d3-force";
GraphD3Force.defaultConfiguration = {
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
;
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