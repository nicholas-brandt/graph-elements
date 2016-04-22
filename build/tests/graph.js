"use strict";

var chai = require("chai");
var Graph = require("../../node-transpiled/lib/graph.js").default;
var ConditionedGraph = require("../../node-transpiled/lib/conditioned-graph.js").default;
var AcyclicGraph = require("../../node-transpiled/lib/acyclic-graph.js").default;
var Tree = require("../../node-transpiled/lib/tree.js").default;
describe("Graph consistency", () => {
    test("Graph is constructor", () => {
        return new Graph() instanceof Graph;
    });
    test("Graph is instanceof Map", () => {
        return new Graph() instanceof Map;
    });
    test("Graph#directed", () => {
        return new Graph().directed === false;
    });
    test("Graph#set", () => {
        var graph = new Graph();
        var node = {};
        var meta = {};
        return graph.set(node, meta) && graph.get(node).metaData === meta;
    });
    test("Graph#delete", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        return graph.delete(node);
    });
    test("Graph#addNode", () => {
        var graph = new Graph();
        var node = {};
        return graph.addNode(node) && graph.get(node).metaData === null;
    });
    test("Graph#addNodes", () => {
        var graph = new Graph();
        var node1 = {};
        var node2 = {};
        return graph.addNodes(node1, node2) === graph && graph.has(node1) && graph.has(node2);
    });
    test("Graph#removeNode", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        return graph.removeNode(node);
    });
    test("Graph#removeNodes", () => {
        var graph = new Graph();
        var node1 = {};
        var node2 = {};
        graph.addNodes(node1, node2);
        return graph.removeNodes(node1, node2);
    });
    test("Graph#links", () => {
        return new Graph().links instanceof Set;
    });
    test("Graph#addLink", () => {
        var graph = new Graph();
        var node1 = {};
        var node2 = {};
        graph.addNodes(node1, node2);
        return graph.addLink(node1, node2);
    });
    test("Graph#addLinks", () => {
        var graph = new Graph();
        var node1 = {};
        var node2 = {};
        var node3 = {};
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
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        var no_remove = graph.removeLink(node, node);
        graph.addLink(node, node);
        return no_remove && graph.removeLink(node, node) && graph.links.size === 0;
    });
    test("Graph#clearLinks", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        graph.clearLinks();
        return graph.links.size === 0;
    });
    test("Graph#hasCycle", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        var no_cycle = !graph.hasCycle();
        graph.addLink(node, node);
        return no_cycle && graph.hasCycle();
    });
    test("Graph#getAllCyclesByNode", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        var cycle_set = graph.getAllCyclesByNode(node);
        return cycle_set.size == 1 && cycle_set.keys().next().value[0] === node;
    });
    test("Graph#getMaximalCycleLengthByNode", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getMaximalCycleLengthByNode(node) === 1;
    });
    test("Graph#getMaximalCycleLength", () => {
        var graph = new Graph();
        var node = {};
        graph.addNode(node);
        graph.addLink(node, node);
        return graph.getMaximalCycleLength() === 1;
    });
});
describe("ConditionedGraph consistency", () => {
    test("ConditionedGraph is instanceof Graph", () => {
        return new ConditionedGraph() instanceof Graph;
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
        var graph = new TestGraph();
        var node1 = {};
        var node2 = {};
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
        var graph = new TestGraph();
        var node1 = {};
        var node2 = {};
        graph.addNode(node1);
        graph.addNode(node2);
        return !graph.addLink(node1, node2);
    });
});
describe("AcyclicGraph consistency", () => {
    test("AcyclicGraph is instanceof Graph", () => {
        return new AcyclicGraph() instanceof Graph;
    });
    test("AcyclicGraph#addLink", () => {
        var graph = new AcyclicGraph();
        var node1 = {};
        var node2 = {};
        var node3 = {};
        graph.addNodes(node1, node2, node3);
        graph.addLink(node1, node2);
        graph.addLink(node2, node3);
        return !graph.addLink(node1, node3);
    });
    test("AcyclicGraph#hasCycle", () => {
        var graph = new AcyclicGraph();
        var node = {};
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
