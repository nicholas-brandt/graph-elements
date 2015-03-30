    const $nodes = Symbol();
    const $dependencies = Symbol();
    const $dependents = Symbol();
    const $directed = Symbol();
    export class Graph {
        constructor(directed = false) {
            this[$nodes] = new Map;
            this.directed = !!directed;
        }
        get directed() {
            return this[$directed];
        }
        set directed(directed) {
            this[$directed] = !!directed;
            if (this.directed)
                for (let edge of this.edges) this.addEdge(...edge);
        }
        get nodes() {
            return new Map(this[$nodes]);
        }
        get edges() {
            const edges = [];
            for (let [node, relations] of this[$nodes])
                for (let [dependent, weight] of relations.dependents) edges.push({
                    source: node,
                    target: dependent,
                    weight: weight
                });
            return edges;
        }
        addNode(object) {
            const relations = {
                get dependencies() {
                    return new Map(this[$dependencies]);
                },
                get dependents() {
                    return new Map(this[$dependents]);
                }
            };
            relations[$dependencies] = new Map;
            relations[$dependents] = new Map;
            this[$nodes].set(object, relations);
            return true;
        }
        removeNode(object) {
            this[$nodes].delete(object);
            for (let [, relations] of this[$nodes]) {
                relations[$dependents].delete(object);
                relations[$dependencies].delete(object);
            }
        }
        addEdge(source, target, weight = 1) {
            const nodes = this[$nodes];
            if ([source, target].every(nodes.has.bind(nodes))) {
                nodes.get(source)[$dependents].set(target, weight);
                nodes.get(target)[$dependencies].set(source, weight);
                if (!this.directed) {
                    nodes.get(target)[$dependents].set(source, weight);
                    nodes.get(source)[$dependencies].set(target, weight);
                }
                return true;
            }
            return false;
        }
        removeEdge(source, target) {
            const nodes = this[$nodes];
            if ([source, target].every(nodes.has.bind(nodes))) {
                nodes.get(source)[$dependents].delete(target);
                nodes.get(target)[$dependencies].delete(source);
                if (!this.directed) {
                    nodes.get(target)[$dependents].delete(source);
                    nodes.get(source)[$dependencies].delete(target);
                }
                return true;
            }
            return false;
        }
        hasCycle() {
            return !!this.getCycle();
        }
        getCycle() {
            const directed = this.directed;
            const finished = new Set;
            const visited = new Set;
            for (let [, relations] of this[$nodes]) {
                const depth = DFS.call(this, relations, undefined, 0);
                if (depth) return depth;
            }
            return false;

            function DFS(node, dependency, length) {
                if (!finished.has(node)) {
                    if (visited.has(node)) return length;
                    visited.add(node);
                    const nodes = this[$nodes];
                    for (let [dependent] of node[$dependents]) {
                        const dependent_node = nodes.get(dependent);
                        if (directed || dependent_node !== dependency) {
                            const depth = DFS.call(this, dependent_node, node, length + 1);
                            if (depth) return depth;
                        }
                    }
                    finished.add(node);
                }
            }
        }
    }
    export class AcyclicGraph extends Graph {
        addEdge(source, target, weight) {
            const added = super.addEdge(source, target, weight);
            if (added && super.hasCycle())
                if (this.removeEdge(source, target)) return false;
                else throw Error("Cyclic node could not be removed");
            return added;
        }
        hasCycle(real = false) {
            return !!real && super.hasCycle();
        }
    }
    export class Tree extends AcyclicGraph {
        addEdge(source, target, weight) {
            if (this[$nodes].get(target)[$dependencies].size > 0) return false;
            return super.addEdge(source, target, weight);
        }
    }