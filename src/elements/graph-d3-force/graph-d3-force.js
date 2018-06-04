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
// web worker same origin policy requires host to support OPTIONS CORS
export class GraphD3Force extends HTMLElement {
    constructor() {
        super();
        // define own properties
        Object.defineProperties(this, {
            __worker: {
                // value: new Worker(worker_data)
                value: new Worker("data:application/javascript," + encodeURIComponent(`<!-- inject: ../../../build/elements/graph-d3-force/d3-force-worker.inject.js -->`))
            }
        });
        const adaptive_request_propagation = event => {
            this.__requestPropagateGraph();
        };
        this.dispatchEvent(new CustomEvent("extension-callback", {
            detail: {
                callback(graph_display) {
                    graph_display.shadowRoot.addEventListener("graph-structure-change", adaptive_request_propagation);
                    graph_display.shadowRoot.addEventListener("graph-update", adaptive_request_propagation);
                }
            },
            bubbles: true
        }));
        this.__worker.addEventListener("message", requestAnimationFunction(({data: {buffer}}) => {
            console.log("receive force update");
            this.__bufferArray = new Float32Array(buffer);
            this.dispatchEvent(new CustomEvent("extension-callback", {
                detail: {
                    callback: this.__applyForceUpdate
                },
                bubbles: true
            }))
        }));
        this.configuration = default_configuration;
        // initiate worker with preassigned graph
        this.__requestPropagateGraph();
    }
    set configuration(configuration) {
        this.__worker.postMessage({
            configuration
        });
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
    __requestPropagateGraph() {
        this.dispatchEvent(new CustomEvent("extension-callback", {
            detail: {
                callback: this.__propagateGraph
            },
            bubbles: true
        }));
    }
    __propagateGraph(graph_display) {
        console.log("D3FORCE propagate graph");
        const _nodes = [...graph_display.nodes.values()];
        const nodes = _nodes.map(({x, y}, index) => ({x, y, index}));
        const links = [...graph_display.links].map(({source, target}) => ({
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
        this.__worker.postMessage({
            graph: {
                nodes,
                links
            },
            buffer
        });
    }
    __applyForceUpdate(graph_display) {
        console.log("D3FORCE apply force update");
        const nodes = [...graph_display.graph.vertices()];
        for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i][1];
            const x = this.__bufferArray[i * 2];
            const y = this.__bufferArray[i * 2 + 1];
            node.x = x;
            node.y = y;
        }
        // emit graph-change event
        this.dispatchEvent(new CustomEvent("graph-update", {
            bubbles:  true
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