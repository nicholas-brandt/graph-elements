import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
import require from "../../helper/require.js";
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
const worker_string = `importScripts("https://d3js.org/d3.v4.min.js");
// importScripts(this.origin + "/node_modules/d3/build/d3.js");

const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
let buffer_array;
simulation.force("link", link_force);
simulation.force("center", center_force);
simulation.force("charge", charge_force);
simulation.stop();
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
    const buffer_length = buffer_array.buffer.length;
    // transfer buffer for faster propagation to display
    postMessage({
        buffer: buffer_array.buffer
    }, [buffer_array.buffer]);
    buffer_array = new Float32Array(new ArrayBuffer(buffer_length));
});
addEventListener("message", ({ data }) => {
    console.log("WORKER message", data);
    if (data.configuration) {
        const {
            link,
            charge,
            gravitation,
            alpha,
            alphaTarget,
            alphaMin,
            alphaDecay,
            velocityDecay
        } = data.configuration;
        if (link) {
            if ("distance" in link) {
                link_force.distance(link.distance);
            }
            if ("strength" in link) {
                link_force.strength(link.strength);
            }
            simulation.force("link", link_force);
        }
        if (charge) {
            if ("strength" in charge) {
                charge_force.strength(charge.strength);
            }
            if ("maxDistance" in charge) {
                charge_force.maxDistance(charge.maxDistance);
            }
            if ("minDistance" in charge) {
                charge_force.minDistance(charge.minDistance);
            }
            simulation.force("charge", charge_force);
        }
        if (alpha !== undefined) {
            simulation.alpha(alpha);
        }
        if (alphaTarget !== undefined) {
            simulation.alphaTarget(alphaTarget);
        }
        if (alphaMin !== undefined) {
            simulation.alphaMin(alphaMin);
        }
        if (alphaDecay !== undefined) {
            simulation.alpha(alphaDecay);
        }
        if (velocityDecay !== undefined) {
            simulation.velocityDecay(velocityDecay);
        }
    }
    if (data.graph && data.buffer) {
        buffer_array = new Float32Array(data.buffer);
        const { nodes, links } = data.graph;
        simulation.nodes(nodes);
        link_force.links(links);
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
    if ("run" in data) {
        if (data.run) {
            simulation.restart();
        } else {
            simulation.stop();
        }
    }
});`;
// web worker same origin policy requires host to support OPTIONS CORS
export class GraphD3Force extends GraphAddon {
    constructor() {
        super();
        let _configuration = this.configuration;
        delete this.configuration;
        // define own properties
        Object.defineProperties(this, {
            __worker: {
                // value: new Worker(worker_data)
                value: new Worker("data:application/javascript," + encodeURIComponent(worker_string))
            },
            configuration: {
                set(configuration) {
                    this.__worker.postMessage({
                        configuration
                    });
                    _configuration = configuration;
                },
                get() {
                    return _configuration;
                },
                enumerable: true
            }
        });
        const _this = this;
        this.dispatchEvent(new CustomEvent("extension-callback", {
            detail: {
                callback(graph_display) {
                    _this.graph_display = graph_display;
                    graph_display.shadowRoot.addEventListener("graph-structure-change", () => {
                        _this.__propagateGraph();
                    });
                    graph_display.shadowRoot.addEventListener("graph-update", event => {
                        if (event.target != _this || !event.detail.original) {
                            _this.__propagateGraph();
                        }
                    });
                }
            },
            bubbles: true
        }));
        this.__worker.addEventListener("message", requestAnimationFunction(({ data: { buffer } }) => {
            console.log("receive force update");
            this.__bufferArray = new Float32Array(buffer);
            this.__applyForceUpdate();
        }));
        this.configuration = _configuration;
        // initiate worker with preassigned graph
        this.__propagateGraph();
    }
    start() {
        this.__worker.postMessage({
            run: true
        });
    }
    stop() {
        this.__worker.postMessage({
            run: false
        });
    }
    __propagateGraph() {
        console.log("D3FORCE propagate graph");
        const _nodes = [...this.graph_display.nodes.values()];
        const nodes = _nodes.map(({ x, y }, index) => ({ x, y, index }));
        const links = [...this.graph_display.links].map(({ source, target }) => ({
            source: _nodes.indexOf(source), // index for d3
            target: _nodes.indexOf(target) // index for d3
        }));
        // 32 bit * 2 * N
        const buffer = new ArrayBuffer(nodes.length * 4 * 2);
        this.__bufferArray = new Float32Array(buffer);
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            this.__bufferArray[i * 2] = node.x;
            this.__bufferArray[i * 2 + 1] = node.y;
        }
        console.log("post worker");
        this.__worker.postMessage({
            graph: {
                nodes,
                links
            },
            buffer
        });
    }
    __applyForceUpdate() {
        console.log("D3FORCE apply force update to graph");
        const nodes = [...this.graph_display.graph.vertices()];
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i][1];
            const x = this.__bufferArray[i * 2];
            const y = this.__bufferArray[i * 2 + 1];
            node.x = x;
            node.y = y;
        }
        // emit graph-change event
        this.dispatchEvent(new CustomEvent("graph-update", {
            detail: {
                original: true
            },
            bubbles: true
        }));
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