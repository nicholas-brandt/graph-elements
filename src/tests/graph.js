const chai = require("chai");
const Graph = require("../../node-transpiled/lib/graph.js").default;
const AcyclicGraph = require("../../node-transpiled/lib/acyclic-graph.js").default;
const Tree = require("../../node-transpiled/lib/tree.js").default;
describe("Graph consistency", () => {
    test("Graph is function", () => {
        return typeof Graph == "function";
    });
    test("Graph is constructor", () => {
        return new Graph instanceof Graph;
    });
    test("Graph is instanceof Map", () => {
        return new Graph instanceof Map;
    });
    test("Graph#directed", () => {
        return new Graph().directed === false;
    });
    test("Graph#addNode", () => {
        const graph = new Graph;
        const node = {};
        return graph.addNode(node) && graph.get(node).metaData === null;
    });
    test("Graph#removeNode", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        return graph.removeNode(node);
    });
    test("Graph#set", () => {
        const graph = new Graph;
        const node = {};
        const meta = {};
        return graph.set(node, meta) && graph.get(node).metaData === meta;
    });
    test("Graph#addLink", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return graph.addLink(node1, node2);
    });
    test("Graph#links", () => {
        return new Graph().links instanceof Set;
    });
    test("Graph#removeLink", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        const no_remove = graph.removeLink(node, node);
        graph.addLink(node, node);
        return no_remove && graph.removeLink(node, node) && graph.links.size == 0;
    });
    test("Graph#clearLinks", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        graph.clearLinks();
        return graph.links.size == 0;
    });
    test("Graph#hasCycle", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        const no_cycle = !graph.hasCycle();
        graph.addLink(node, node);
        return no_cycle && graph.hasCycle();
    });
    test("Graph#getAllCyclesByNode", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        const cycle_set = graph.getAllCyclesByNode(node);
        return cycle_set.size == 1 && cycle_set.keys().next().value[0] === node;
    });
    test("Graph#getMaximalCycleLengthByNode", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getMaximalCycleLengthByNode(node) == 1;
    });
});
describe("AcyclicGraph consistency", () => {
    test("AcyclicGraph is function", () => {
        return typeof AcyclicGraph == "function";
    });
    test("AcyclicGraph is constructor", () => {
        return new AcyclicGraph instanceof Graph;
    });
    test("AcyclicGraph is instanceof Graph", () => {
        return new AcyclicGraph instanceof Graph;
    });
    test("AcyclicGraph#addLink", () => {
        const graph = new AcyclicGraph;
        const node1 = {};
        const node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return graph.addLink(node1, node2);
    });
    test("AcyclicGraph#hasCycle", () => {
        const graph = new AcyclicGraph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return !graph.hasCycle(true);
    });
    test("AcyclicGraph#getAllCyclesByNode", () => {
        const graph = new AcyclicGraph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getAllCyclesByNode(node, true).size == 0;
    });
    test("AcyclicGraph#getMaximalCycleLengthByNode", () => {
        const graph = new AcyclicGraph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getMaximalCycleLengthByNode(node, true) == 0;
    });
});
describe("Tree consistency", () => {
    test("Tree is function", () => {
        return typeof Tree == "function";
    });
    test("Tree is constructor", () => {
        return new Tree instanceof Tree;
    });
    test("Tree is instanceof Map", () => {
        return new Tree instanceof AcyclicGraph;
    });
    test("Tree#addLink", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return graph.addLink(node1, node2);
    });
});
function test(name, _function) {
    it(name, () => {
        chai.expect(_function()).to.be.true;
    });
}