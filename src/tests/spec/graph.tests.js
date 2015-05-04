require("babel/polyfill");
require("amdefine/intercept");
import { Graph, AcyclicGraph, Tree } from "../../graph";
describe("Graph", () => {
    const graph = new Graph;
    const dgraph = new Graph(true);
    it("Direction", done => {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
        done();
    });
    it("Consistency", done => {
    });
});
describe("AcyclicGraph", () => {
    const graph = new AcyclicGraph;
    const dgraph = new AcyclicGraph(true);
    it("Direction", done => {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", done => {
        
    });
});
describe("Tree", () => {
    const graph = new Tree;
    const dgraph = new Tree(true);
    it("Direction", done => {
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
    it("Consistency", done => {
        
    });
});