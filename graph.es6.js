export const[Graph, AcyclicGraph, Tree] = (function(global) {
    const $nodes = Symbol();
    const $dependencies = Symbol();
    const $dependents = Symbol();
    const $directed = Symbol();
    class Graph {
        constructor(directed = false) {
            this[$nodes] = new Map;
            this.directed = directed;
        }
        get directed() {
            return this[$directed];
        }
        set directed(directed) {
            this[$directed] = !! directed;
        }
        addNode(object) {
            var relations = {
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
        }
        addEdge(source, target, weight = 1) {
            if (this[$nodes].has(source) && this[$nodes].has(target)) {
                this[$nodes].get(source)[$dependents].set(target, weight);
                this[$nodes].get(target)[$dependencies].add(source, weight);
                if (this.directed) {
                    this[$nodes].get(target)[$dependents].set(source, weight);
                    this[$nodes].get(source)[$dependencies].add(target, weight);
                }
                return true;
            }
            return false;
        }
        removeEdge(source, target) {
            if (this[$nodes].has(source) && this[$nodes].has(target)) {
                this[$nodes].get(source)[$dependents].delete(target);
                this[$nodes].get(target)[$dependencies].delete(source);
                if (this.directed) {
                    this[$nodes].get(source)[$dependents].delete(source);
                    this[$nodes].get(target)[$dependencies].delete(target);
                }
                return true;
            }
            return false;
        }
        hasCycle() {
            var finished = new Set;
            var visited = new Set;
            for (let node of this[$nodes])
                if (DFS(node)) return true;
            return false;

            function DFS(node) {
                if (finished.has(node)) {
                    if (visited.has(node)) {
                        return true;
                    }
                    visited.add(node);
                    for (let dependent of node[$dependents])
                        if (DFS(dependent)) return true;
                    finished.add(node);
                }
            }
        }
    }
    class AcyclicGraph extends Graph {
        addEdge(source, target, weight) {
            var added = super.addEdge(source, target, weight);
            if (added && this.hasCycle())
                if (!this.removeEdge(source, target)) throw Error("Cyclic node could not be removed");
            return added;
        }
    }
    class Tree extends AcyclicGraph {
        addEdge(source, target, weight) {
            if (this[$nodes].get(target)[$dependencies].size > 0) return false;
            return super.addEdge(source, target, weight);
        }
    }
    return [DirectedGraph, AcyclicGraph, Tree];
})();