require("babel/polyfill");
require("amdefine/intercept");
import { Graph, AcyclicGraph, Tree } from "../../graph";
describe("Graph", function() {
    const graph = new Graph;
    const dgraph = new Graph(true);
    it("Direction", () => {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", () => {
    });
});
describe("AcyclicGraph", function() {
    const graph = new AcyclicGraph;
    const dgraph = new AcyclicGraph(true);
    it("Direction", function() {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", () => {
        
    });
});
describe("Tree", function() {
    const graph = new Tree;
    const dgraph = new Tree(true);
    it("Direction", function() {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", () => {
        
    });
});