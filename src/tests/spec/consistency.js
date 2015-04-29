global.Symbol = require("symbol");
require("es6-shim");
import { Graph, AcyclicGraph, Tree } from "../../graph.common";
describe("graph", function() {
    it("Direction", function() {
        console.log(new Graph().directed);
        expect(new Graph().directed).toBe(false);
        expect(new Graph(true).directed).toBe(true);
    });
});