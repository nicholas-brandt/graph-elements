// import module to get path to module for worker loading
import module from "module";
const __private = {};
export default class D3Force {
    constructor() {
        Object.defineProperties(this, {
            private: {
                value: new WeakMap
            }
        });
        const _private = {
            worker: new Worker(module.uri + "/../d3-force-worker.js"),
            updated: false
        };
        this.private.set(__private, _private);
        _private.promise = new Promise(resolve => {
            _private.resolve = resolve;
        });
        _private.worker.addEventListener("message", ({data}) => {
            // skip old calculation results if updated
            if (!_private.updated) {
                let i = 0;
                const nodes = _private.nodes;
                // console.log("received nodes", data.nodes);
                for (const {x, y} of data.nodes) {
                    nodes[i].x = x;
                    nodes[i].y = y;
                    ++i;
                }
                // replace old promise
                const resolve = _private.resolve;
                _private.promise = new Promise(resolve => {
                    _private.resolve = resolve;
                });
                // resolve old promise
                resolve();
            }
            _private.updated = false;
        });
    }
    set configuration(config) {
        this.private.get(__private).worker.postMessage({
            configuration: config
        });
    }
    set graph(graph) {
        const _private = this.private.get(__private);
        if (_private.nodes) {
            _private.updated = true;
        }
        const nodes = [...graph.keys()];
        _private.nodes = nodes;
        const links_array = [];
        for (let {source, target, nodes: _nodes} of graph.links) {
            if (_nodes) {
                [source, target] = [..._nodes];
                if (target === undefined) {
                    target = source;
                }
            }
            links_array.push([nodes.indexOf(source), nodes.indexOf(target)]);
        }
        const links_string = JSON.stringify(links_array);
        const sanitized_nodes = _private.nodes.map(({x, y}) => ({x, y}));
        const nodes_string = JSON.stringify(sanitized_nodes);
        _private.worker.postMessage({
            graph: {
                nodes: nodes_string,
                links: links_string
            }
        });
    }
    start() {
        this.private.get(__private).worker.postMessage({
            run: true
        });
    }
    stop() {
        this.private.get(__private).worker.postMessage({
            run: false
        });
    }
    get tick() {
        return this.private.get(__private).promise;
    }
};