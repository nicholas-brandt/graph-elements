"use strict";

global.Symbol = require("symbol");

require("es6-shim");

var _graphCommon = require("../../graph.common");

var Graph = _graphCommon.Graph;

var AcyclicGraph = _graphCommon.AcyclicGraph;

var Tree = _graphCommon.Tree;

describe("graph", function() {
    it("Direction", function() {
        console.log(new Graph().directed);
        expect(new Graph().directed).toBe(false);
        expect(new Graph(true).directed).toBe(true);
    });
});