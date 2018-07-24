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
const worker_string = `<!-- inject: ../../../build/elements/graph-d3-force/d3-force-worker.inject.js -->`;
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
                set (configuration) {
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
        this.__worker.addEventListener("message", requestAnimationFunction(({data: {buffer}}) => {
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
        const nodes = _nodes.map(({x, y}, index) => ({x, y, index}));
        const links = [...this.graph_display.links].map(({source, target}) => ({
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