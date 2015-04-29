"use strict";

require("es6-symbol/implement");

require("es6-shim");

var _graphCommon = require("../../graph.common");

var Graph = _graphCommon.Graph;

var AcyclicGraph = _graphCommon.AcyclicGraph;

var Tree = _graphCommon.Tree;

xdescribe("Graph", function() {
    it("Direction", function() {
        var graph = new Graph();
        var dgraph = new Graph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});

xdescribe("AcyclicGraph", function() {
    it("Direction", function() {
        var graph = new AcyclicGraph();
        var dgraph = new AcyclicGraph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});