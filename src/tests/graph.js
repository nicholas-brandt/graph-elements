const chai = require("chai");
const {Graph, AcyclicGraph, Tree} = require("../../transpiled/lib/graph.js");
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
        return graph.addNode(node) && graph.get(node).metaData === undefined;
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
});
function test(name, _function) {
    it(name, () => {
        chai.expect(_function()).to.be.true;
    });
}