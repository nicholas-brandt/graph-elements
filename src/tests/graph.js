"use strict";

const chai = require("chai");
const Graph = require("../../node-transpiled/lib/graph.js").default;
const ConditionedGraph = require("../../node-transpiled/lib/conditioned-graph.js").default;
const AcyclicGraph = require("../../node-transpiled/lib/acyclic-graph.js").default;
const Tree = require("../../node-transpiled/lib/tree.js").default;
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
describe("ConditionedGraph consistency", () => {
    test("ConditionedGraph is instanceof Graph", () => {
        return new ConditionedGraph instanceof Graph;
    });
    test("ConditionedGraph#preCondition is true by default", () => {
        return new ConditionedGraph().preCondition() === true;
    });
    test("ConditionedGraph#postCondition is true by default", () => {
        return new ConditionedGraph().postCondition() === true;
    });
    test("ConditionedGraph#addLink is pre-conditioned", () => {
        class TestGraph extends ConditionedGraph {
            preCondition() {
                return false;
            }
        }
        const graph = new TestGraph;
        const node1 = {};
        const node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return !graph.addLink(node1, node2);
    });
    test("ConditionedGraph#addLink is post-conditioned", () => {
        class TestGraph extends ConditionedGraph {
            postCondition() {
                return false;
            }
        }
        const graph = new TestGraph;
        const node1 = {};
        const node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return !graph.addLink(node1, node2);
    });
});
describe("AcyclicGraph consistency", () => {
    test("AcyclicGraph is instanceof Graph", () => {
        return new AcyclicGraph instanceof Graph;
    });
    test("AcyclicGraph#addLink", () => {
        const graph = new AcyclicGraph;
        const node1 = {};
        const node2 = {};
        const node3 = {};
        graph.addNodes(node1, node2, node3);
        graph.addLink(node1, node2);
        graph.addLink(node2, node3);
        return !graph.addLink(node1, node3);
    });
    test("AcyclicGraph#hasCycle", () => {
        const graph = new AcyclicGraph;
        const node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return !graph.hasCycle(true);
    });
});
function test(name, _function) {
    it(name, () => {
        chai.expect(_function()).to.be.true;
    });
}