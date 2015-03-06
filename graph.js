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
        get nodes() {
            return new Map(this[$nodes]);
        }
        get edges() {
            throw "Not implemented yet";
            return new Map;
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
            for (let node of this[$nodes]) {
                node[$dependents].delete(object);
                node[$dependencies].delete(object);
            }
        }
        addEdge(source, target, weight = 1) {
            if (this[$nodes].has(source) && this[$nodes].has(target)) {
                this[$nodes].get(source)[$dependents].set(target, weight);
                this[$nodes].get(target)[$dependencies].set(source, weight);
                if (!this.directed) {
                    this[$nodes].get(target)[$dependents].set(source, weight);
                    this[$nodes].get(source)[$dependencies].set(target, weight);
                }
                return true;
            }
            return false;
        }
        removeEdge(source, target) {
            if (this[$nodes].has(source) && this[$nodes].has(target)) {
                this[$nodes].get(source)[$dependents].delete(target);
                this[$nodes].get(target)[$dependencies].delete(source);
                if (!this.directed) {
                    this[$nodes].get(target)[$dependents].delete(source);
                    this[$nodes].get(source)[$dependencies].delete(target);
                }
                return true;
            }
            return false;
        }
        hasCycle() {
            const directed = this.directed;
            const finished = new Set;
            const visited = new Set;
            for (let node of this[$nodes]) {
                const depth = DFS.call(this, node[1], undefined, 0);
                if (depth) return depth;
            }
            return false;

            function DFS(node, dependency, length) {
                if (!finished.has(node)) {
                    if (visited.has(node)) return length;
                    visited.add(node);
                    for (let dependent of node[$dependents]) {
                        const dependent_node = this[$nodes].get(dependent[0]);
                        if ((directed || dependent_node !== dependency)) {
                            const depth = DFS.call(this, dependent_node, node, length + 1);
                            if (depth) return depth;
                        }
                    }
                    finished.add(node);
                }
            }
        }
    }
    class AcyclicGraph extends Graph {
        addEdge(source, target, weight) {
            const c = this.hasCycle();
            var added = super.addEdge(source, target, weight);
            if (added && this.hasCycle())
                if (this.removeEdge(source, target)) return false;
                else throw Error("Cyclic node could not be removed");
            return added;
        }
    }
    class Tree extends AcyclicGraph {
        addEdge(source, target, weight) {
            if (this[$nodes].get(target)[$dependencies].size > 0) return false;
            return super.addEdge(source, target, weight);
        }
    }
    return [Graph, AcyclicGraph, Tree];
})();