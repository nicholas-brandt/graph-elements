"use strict";

require("babel/polyfill");

require("amdefine/intercept");

var _graph = require("../../graph");

var Graph = _graph.Graph;

var AcyclicGraph = _graph.AcyclicGraph;

var Tree = _graph.Tree;

describe("Graph", function() {
    var graph = new Graph();
    var dgraph = new Graph(true);
    it("Direction", function() {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", function() {});
});

describe("AcyclicGraph", function() {
    var graph = new AcyclicGraph();
    var dgraph = new AcyclicGraph(true);
    it("Direction", function() {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", function() {});
});

describe("Tree", function() {
    var graph = new Tree();
    var dgraph = new Tree(true);
    it("Direction", function() {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", function() {});
});