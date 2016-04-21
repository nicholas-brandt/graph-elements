var chai = require("chai");

var _require = require("../../transpiled/lib/graph.js");

var Graph = _require.Graph;
var AcyclicGraph = _require.AcyclicGraph;
var Tree = _require.Tree;

describe("Graph consistency", () => {
    test("Graph is function", () => {
        return typeof Graph == "function";
    });
    test("Graph is constructor", () => {
        return new Graph() instanceof Graph;
    });
    test("Graph is instanceof Map", () => {
        return new Graph() instanceof Map;
    });
    test("Graph#directed", () => {
        return new Graph().directed === false;
    });
    test("Graph#addNode", () => {
        var graph = new Graph();
        var node = {};
        return graph.addNode(node) && graph.get(node).metaData === undefined;
    });
    test("Graph#removeNode", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        return graph.removeNode(node);
    });
    test("Graph#set", () => {
        var graph = new Graph();
        var node = {};
        var meta = {};
        return graph.set(node, meta) && graph.get(node).metaData === meta;
    });
    test("Graph#addLink", () => {
        var graph = new Graph();
        var node1 = {};
        var node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return graph.addLink(node1, node2);
    });
    test("Graph#links", () => {
        return new Graph().links instanceof Set;
    });
    test("Graph#removeLink", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        var no_remove = graph.removeLink(node, node);
        graph.addLink(node, node);
        return no_remove && graph.removeLink(node, node) && graph.links.size == 0;
    });
    test("Graph#clearLinks", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        graph.clearLinks();
        return graph.links.size == 0;
    });
    test("Graph#hasCycle", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        var no_cycle = !graph.hasCycle();
        graph.addLink(node, node);
        return no_cycle && graph.hasCycle();
    });
});
function test(name, _function) {
    it(name, () => {
        chai.expect(_function()).to.be.true;
    });
}
