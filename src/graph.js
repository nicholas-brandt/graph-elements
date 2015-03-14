export const [Graph, AcyclicGraph, Tree] = (() => {
    const $nodes = Symbol();
    const $dependencies = Symbol();
    const $dependents = Symbol();
    const $directed = Symbol();
    class Graph {
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
            for (let node of this[$nodes])
                for (let dependent of node[1].dependents) edges.push([node[0], dependent[0], dependent[1]]);
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
            const _nodes = this[$nodes];
            _nodes.delete(object);
            for (let node of _nodes) {
                node[$dependents].delete(object);
                node[$dependencies].delete(object);
            }
        }
        addEdge(source, target, weight = 1) {
            const _nodes = this[$nodes];
            if ([source, target].every(_nodes.has.bind(_nodes))) {
                _nodes.get(source)[$dependents].set(target, weight);
                _nodes.get(target)[$dependencies].set(source, weight);
                if (!this.directed) {
                    _nodes.get(target)[$dependents].set(source, weight);
                    _nodes.get(source)[$dependencies].set(target, weight);
                }
                return true;
            }
            return false;
        }
        removeEdge(source, target) {
            const _nodes = this[$nodes];
            if ([source, target].every(_nodes.has.bind(_nodes))) {
                _nodes.get(source)[$dependents].delete(target);
                _nodes.get(target)[$dependencies].delete(source);
                if (!this.directed) {
                    _nodes.get(target)[$dependents].delete(source);
                    _nodes.get(source)[$dependencies].delete(target);
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
            for (let node of this[$nodes]) {
                const depth = DFS.call(this, node[1], undefined, 0);
                if (depth) return depth;
            }
            return false;

            function DFS(node, dependency, length) {
                if (!finished.has(node)) {
                    if (visited.has(node)) return length;
                    visited.add(node);
                    const _nodes = this[$nodes];
                    for (let dependent of node[$dependents]) {
                        const dependent_node = _nodes.get(dependent[0]);
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
    class AcyclicGraph extends Graph {
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
    class Tree extends AcyclicGraph {
        addEdge(source, target, weight) {
            if (this[$nodes].get(target)[$dependencies].size > 0) return false;
            return super.addEdge(source, target, weight);
        }
    }
    return [Graph, AcyclicGraph, Tree];
})();