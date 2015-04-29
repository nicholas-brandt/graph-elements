import { Graph } from "../graph.amd";
export class Importer {
    static importObject(object) {
        if (typeof object != "object") throw Error("Argument is not an object!");
        const graph = new Graph(true);
        serialize(object, graph);
        return graph;
    }
}
export class Migrator {
    static migrateGraph(source, target) {
        for (let [node] of source.nodes) target.addNode(node);
        for (let edge of source.edges) target.addEdge(edge.source, edge.target, edge.weight);
    }
}

function serialize(object, graph) {
    graph.addNode(object);
    if (typeof object == "object")
        for (let property in object)
            try {
                const value = object[property];
                if (!graph.hasNode(value)) serialize(value, graph);
                graph.addEdge(object, value);
            } catch (e) {}
}