require("babel/polyfill");
/*const node_require = require;
const require = require("requirejs");
require.config({
    nodeRequire: node_require
});*/
require("amdefine/intercept");
import { Graph, AcyclicGraph, Tree } from "../../graph";
console.log(typeof Graph);
describe("Graph", function() {
    it("Direction", function() {
        const graph = new Graph;
        const dgraph = new Graph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});
describe("AcyclicGraph", function() {
    it("Direction", function() {
        const graph = new AcyclicGraph;
        const dgraph = new AcyclicGraph(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});
describe("Tree", function() {
    it("Direction", function() {
        const graph = new Tree;
        const dgraph = new Tree(true);
        expect(graph.directed).toBe(false);
        expect(dgraph.directed).toBe(true);
    });
});