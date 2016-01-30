"use strict";

var _graph = require("../../lib/graph");

require("babel/polyfill");

require("amdefine/intercept");

describe("Graph", function() {
    var graph = new _graph.Graph();
    var dgraph = new _graph.Graph(true);
    it("Direction", function(done) {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
        done();
    });
    it("Consistency", function(done) {});
});

describe("AcyclicGraph", function() {
    var graph = new _graph.AcyclicGraph();
    var dgraph = new _graph.AcyclicGraph(true);
    it("Direction", function(done) {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", function(done) {});
});

describe("Tree", function() {
    var graph = new _graph.Tree();
    var dgraph = new _graph.Tree(true);
    it("Direction", function(done) {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", function(done) {});
});