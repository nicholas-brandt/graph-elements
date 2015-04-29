require("es6-symbol/implement");
require("es6-shim");
import { Graph, AcyclicGraph, Tree } from "../../graph.common";
xdescribe("Graph", function() {
    it("Direction", function() {
        const graph = new Graph;
        const dgraph = new Graph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});
xdescribe("AcyclicGraph", function() {
    it("Direction", function() {
        const graph = new AcyclicGraph;
        const dgraph = new AcyclicGraph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});