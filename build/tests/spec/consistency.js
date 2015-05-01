"use strict";

require("babel/polyfill");

require("amdefine/intercept");

var _graph = require("../../graph");

var Graph = _graph.Graph;

var AcyclicGraph = _graph.AcyclicGraph;

var Tree = _graph.Tree;

describe("Graph", function() {
    it("Direction", function() {
        var graph = new Graph();
        var dgraph = new Graph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});

describe("AcyclicGraph", function() {
    it("Direction", function() {
        var graph = new AcyclicGraph();
        var dgraph = new AcyclicGraph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});

describe("Tree", function() {
    it("Direction", function() {
        var graph = new Tree();
        var dgraph = new Tree(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});