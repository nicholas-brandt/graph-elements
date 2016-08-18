import DirectedGraph from "./DirectedGraph.js";
import CircularJSON from "../circular-json/CircularJSON.js";
Object.defineProperties(DirectedGraph, {
    stringify: {
        value(graph, ...args) {
            return graph.stringify(...args);
        },
        writable: true,
        configurable: true
    },
    parse: {
        value(...args) {
            // use this as correct constructor
            const graph = new this;
            return graph.parse(...args);
        },
        writable: true,
        configurable: true
    }
});
Object.defineProperties(DirectedGraph.prototype, {
    stringify: {
        value(...args) {
            return CircularJSON.stringify(this, ...args);
        },
        writable: true,
        configurable: true
    },
    parse: {
        value(...args) {
            const nodes = CircularJSON.parse(...args);
            for (const [node, {metaData}] of nodes) {
                this.set(node, metaData);
            }
            for (const [node, relations] of nodes) {
                for (const [source] of relations.sources) {
                    this.addLink(source, node, relations.metaData)
                }
                for (const [target] of relations.targets) {
                    this.addLink(node, target, relations.metaData)
                }
            }
            return this;
        },
        writable: true,
        configurable: true
    },
    toJSON: {
        value() {
            return JSON.stringify([...this]);
        },
        writable: true,
        configurable: true
    }
});
export default DirectedGraph;