"use strict";

import chai from "chai";
import Graph from "../lib/graph/DirectedGraph.js";
describe("Graph consistency", () => {
    test("Graph is constructor", () => {
        return new Graph instanceof Graph;
    });
    test("Graph is instanceof Map", () => {
        return new Graph instanceof Map;
    });
    test("Graph#directed", () => {
        return new Graph().directed === false;
    });
    test("Graph#set", () => {
        const graph = new Graph;
        const node = {};
        const meta = {};
        return graph.set(node, meta) && graph.get(node).metaData === meta;
    });
    test("Graph#delete", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        return graph.delete(node);
    });
    test("Graph#addNode", () => {
        const graph = new Graph;
        const node = {};
        return graph.addNode(node) && graph.get(node).metaData === null;
    });
    test("Graph#addNodes", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        return graph.addNodes(node1, node2) === graph && graph.has(node1) && graph.has(node2);
    });
    test("Graph#removeNode", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        return graph.removeNode(node);
    });
    test("Graph#removeNodes", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        graph.addNodes(node1, node2);
        return graph.removeNodes(node1, node2);
    });
    test("Graph#links", () => {
        return new Graph().links instanceof Set;
    });
    test("Graph#addLink", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        graph.addNodes(node1, node2);
        return graph.addLink(node1, node2);
    });
    test("Graph#addLinks", () => {
        const graph = new Graph;
        const node1 = {};
        const node2 = {};
        const node3 = {};
        graph.addNodes(node1, node2, node3);
        return graph.addLinks([{
            source: node1,
            target: node2
        }, {
            source: node2,
            target: node3
        }]);
    });
    test("Graph#removeLink", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        const no_remove = graph.removeLink(node, node);
        graph.addLink(node, node);
        return no_remove && graph.removeLink(node, node) && graph.links.size === 0;
    });
    test("Graph#clearLinks", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        graph.clearLinks();
        return graph.links.size === 0;
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
        return graph.getMaximalCycleLengthByNode(node) === 1;
    });
    test("Graph#getMaximalCycleLength", () => {
        const graph = new Graph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getMaximalCycleLength() === 1;
    });
});
function test(name, _function) {
    it(name, () => {
        chai.expect(_function()).to.be.true;
    });
}