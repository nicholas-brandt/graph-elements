"use strict";

import console from "../../helper/console.js";

import workerize from "https://cdn.jsdelivr.net/gh/Jamtis/workerize@patch-1/src/index.js";
import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import requestTimeDifference from "../../helper/requestTimeDifference.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";

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
                value: workerize(`importScripts("https://unpkg.com/d3@5.5.0/dist/d3.min.js");
                // importScripts("https://d3js.org/d3.v4.min.js");
                // importScripts("../../helper/associate.js");
                
                let buffer_array;
                
                export function start() {
                    simulation.restart();
                }
                
                export function stop() {
                    simulation.stop();
                }
                
                export function setGraph(d3_graph) {
                    const { nodes, links } = d3_graph;
                    buffer_array = new Float32Array(nodes.length * 2);
                    for (let i = 0; i < nodes.length; ++i) {
                        const node = nodes[i];
                        buffer_array[i * 2] = node.x;
                        buffer_array[i * 2 + 1] = node.y;
                    }
                    simulation.nodes(nodes);
                    link_force.links(links);
                    reject_tick("graph replaced");
                }
                
                export function setConfiguration(_configuration) {
                    Object.assign(configuration, _configuration);
                    if (_configuration.link) {
                        simulation.force("link", link_force);
                    }
                    if (_configuration.charge) {
                        simulation.force("charge", charge_force);
                    }
                    for (const attribute of attributes) {
                        if (attribute in _configuration) {
                            simulation[attribute](_configuration[attribute]);
                        }
                    }
                }
                
                export function getTickPromise() {
                    return tick_promise;
                }
                
                export function getEndPromise() {
                    return end_promise;
                }
                
                const simulation = d3.forceSimulation();
                const link_force = d3.forceLink();
                const gravitation_force = d3.forceRadial(0);
                // const center_force = d3.forceCenter(0, 0);
                const charge_force = d3.forceManyBody();
                simulation.force("position", gravitation_force);
                simulation.force("link", link_force);
                // simulation.force("center", center_force);
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
                
                let resolve_tick, reject_tick;
                let tick_promise = new Promise((resolve, reject) => {
                    resolve_tick = resolve;
                    reject_tick = reject;
                });
                simulation.on("tick", () => {
                    const nodes = simulation.nodes();
                    for (let i = 0; i < nodes.length; ++i) {
                        const node = nodes[i];
                        buffer_array[i * 2] = node.x;
                        buffer_array[i * 2 + 1] = node.y;
                    }
                    if (resolve_tick) {
                        // console.log("buffer", buffer_array.buffer);
                        resolve_tick(buffer_array.buffer);
                    }
                    tick_promise = new Promise(resolve => {
                        resolve_tick = resolve;
                    });
                });
                let resolve_end;
                let end_promise = new Promise(resolve => {
                    resolve_end = resolve;
                });
                simulation.on("end", () => {
                    // end yields no new simulation step
                    if (resolve_end) {
                        resolve_end();
                    }
                    end_promise = new Promise(resolve => {
                        resolve_end = resolve;
                    });
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
                }`, {
                    type: "classic"
                }),
                enumerable: true
            },
            configuration: {
                set(configuration) {
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
        this.__loopEnds();
        this.adaptiveLinks = this.getAttribute("adaptive-links") != "false";
        this.configuration = _configuration || this.constructor.defaultConfiguration;
    }
    hosted(host) {
        host.addEventListener("graph-structure-change", async () => {
            this.__graphChanged = true;
            await this.__sendGraphToWorker();
            this.__graphChanged = false;
        }, {
            passive: true
        });
    }
    async __sendGraphToWorker() {
        console.log("");
        const host = await this.host;
        const nodes = [...host.nodes.values()];
        const d3_nodes = nodes.map(({ x, y }, index) => ({ x, y, index }));
        const links = [...host.links].map(({ source, target }) => ({
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
                    console.error(error);
                    if (error.message != "graph replaced") {
                        throw new Error("potenial looping error");
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
                await this.worker.setConfiguration(this.configuration);
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
    async __applyGraphUpdate(buffer) {
        if (!this.__graphChanged) {
            const host = await this.host;
            const vertices = [...host.graph.vertices()];
            const buffer_array = new Float32Array(buffer);
            for (let i = 0; i < vertices.length; ++i) {
                const [, node] = vertices[i];
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