const $nodes = Symbol("nodes");
const $updated = Symbol("updated");
const $worker = Symbol("worker");
const $tick_promise = Symbol("tick_promise");
export default class D3Force {
    constructor() {
        {
            let resolve;
            const promise = new Promise(_resolve => {
                resolve = _resolve;
            });
            this[$tick_promise] = {
                promise,
                resolve
            };
        }
        // uri relative to app.html
        const worker = new Worker("../elements/d3-force/d3-force-worker.js");
        this[$worker] = worker;
        worker.addEventListener("message", ({data}) => {
            // skip old calculation results if updated
            if (!this[$updated]) {
                let i = 0;
                const nodes = this[$nodes];
                for (const {x, y} of data.nodes) {
                    nodes[i].x = x;
                    nodes[i].y = y;
                }
                // replace old promise
                const {resolve} = this[$tick_promise];
                let _resolve;
                const promise = new Promise(__resolve => {
                    _resolve = __resolve;
                });
                this[$tick_promise] = {
                    promise,
                    resolve: _resolve
                };
                // resolve old promise
                resolve();
            }
            this[$updated] = false;
        });
    }
    set configuration(config) {
        this[$worker].postMessage({
            configuration: config
        });
    }
    set graph(graph) {
        if (this[$nodes]) {
            this[$updated] = true;
        }
        const nodes = Array.from(graph.keys());
        this[$nodes] = nodes;
        const links_string = JSON.stringify(Array.from(graph.links).map(({source, target}) => [nodes.indexOf(source), nodes.indexOf(target)]));
        const sanitized_nodes = this[$nodes].map(({x, y}) => ({x, y}));
        const nodes_string = JSON.stringify(sanitized_nodes);
        this[$worker].postMessage({
            graph: {
                nodes: nodes_string,
                links: links_string
            }
        });
    }
    start() {
        this[$worker].postMessage({
            run: true
        });
    }
    stop() {
        this[$worker].postMessage({
            run: false
        });
    }
    async tick() {
        await this[$tick_promise].promise;
    }
};