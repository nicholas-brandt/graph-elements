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
    toJSON: {
        value(...args) {
            const nodes = [];
            const links = [];
            for (const [node] of this) {
                nodes.push(node);
            }
            let index = 0;
            for (const [, relations] of this) {
                for (const [source, metaData] of relations.sources) {
                    links.push({
                        source: nodes.indexOf(source),
                        target: index,
                        metaData
                    });
                }
                for (const [target, metaData] of relations.targets) {
                    links.push({
                        source: index,
                        target: nodes.indexOf(target),
                        metaData
                    });
                }
                ++index;
            }
            return {
                nodes,
                links
            }
        },
        writable: true,
        configurable: true
    },
    stringify: {
        value() {
            return JSON.stringify(this.toJSON());
        },
        writable: true,
        configurable: true
    },
    parse: {
        value(...args) {
            const {
                nodes,
                links
            } = JSON.parse(...args);
            for (const node of nodes) {
                this.addNode(node);
            }
            for (const {source, target, metaData} of links) {
                this.addLink(nodes[source], nodes[target], metaData);
            }
            return this;
        },
        writable: true,
        configurable: true
    }
});
export default DirectedGraph;