Polymer({
    is: "graphjs-graph",
    properties: {
        nodes: {
            type: Array,
            notify: true,
            value: () => []
        },
        edges: {
            type: Array,
            notify: true,
            value: () => []
        }
    },
    observers: ["_nodesChange(nodes.*)", "_edgesChange(edges.*)"],
    _nodesChange(record) {
        //console.log("n:record", record);
        let level = (record.path.match(/\./g) || []).length;
        if (level == 2) {
            let node = this.get(record.path.substring(0, record.path.indexOf(".", record.path.indexOf(".") + 1)));
            let post_fix = record.path.substr(record.path.lastIndexOf(".") + 1);
            if (node.dependent_edges) for (let dependent_edge of node.dependent_edges) this.notifyPath("edges." + this.edges.indexOf(dependent_edge) + ".target." + post_fix, dependent_edge.target[post_fix]);
            if (node.dependency_edges) for (let dependency_edge of node.dependency_edges) this.notifyPath("edges." + this.edges.indexOf(dependency_edge) + ".source." + post_fix, dependency_edge.source[post_fix]);
        }
    },
    _edgesChange(record) {
        //console.log("e:record", record);
    },
    addNode(node) {
        if (!this.hasNode(node)) {
            this.push("nodes", node);
            return true;
        }
        return false;
    },
    removeNode(node) {
        if (this.hasNode(node)) {
            if (node.dependent_edges) for (let dependent_edge of node.dependent_edges) this.arrayDelete("edges", dependent_edge);
            if (node.dependency_edges) for (let dependency_edge of node.dependency_edges) this.arrayDelete("edges", dependency_edge);
            this.arrayDelete("nodes", node);
            return true;
        }
        return false;
    },
    hasNode(node) {
        return this.nodes.indexOf(node) != -1;
    },
    addEdge(source, target) {
        if (this.hasNode(source) && this.hasNode(target)) {
            if (!target.dependent_edges) target.dependent_edges = [];
            if (!source.dependency_edges) source.dependency_edges = [];
            if (source.dependency_edges.indexOf(target) == -1 && target.dependent_edges.indexOf(source) == -1) {
                let edge = {
                    source,
                    target,
                    loop: source === target
                };
                source.dependency_edges.push(edge);
                target.dependent_edges.push(edge);
                this.push("edges", edge);
                return true;
            }
        }
        return false;
    },
    removeEdge(source, target) {
        for (let edge of this.edges)
            if (edge.source == source && edge.target == target) this.arrayDelete("edges", edge);
    },
    clear() {
        this.set("edges", []);
        this.set("nodes", []);
    },
    hasCycle() {
        const directed = true;
        const finished = new Set;
        const visited = new Set;
        for (let node of this.nodes) {
            const depth = DFS.call(this, node, undefined, 0);
            if (depth) return true;
        }
        return false;

        function DFS(node, dependency, length) {
            if (!finished.has(node)) {
                if (visited.has(node)) return length;
                visited.add(node);
                if (node.dependent_edges) for (let {source} of node.dependent_edges) {
                    if (directed || source !== dependency) {
                        const depth = DFS.call(this, source, node, length + 1);
                        if (depth) return depth;
                    }
                }
                finished.add(node);
            }
        }
    },
    importObject(object) {
        if (typeof object != "object") throw Error("Argument is not an object!");
        serialize(object, this);
    }
});

function serialize(object, graph) {
    const node = {
        value: object,
        x: Math.random() * 100,
        y: Math.random() * 100,
        radius: 20
    };
    graph.addNode(node);
    if (typeof object == "object")
        for (let property in object)
            try {
                const value = object[property];
                let match_node;
                for (let current_node of graph.nodes)
                    if (current_node.value === value) {
                        match_node = current_node;
                        break;
                    }
                if (!match_node) match_node = serialize(value, graph);
                graph.addEdge(node, match_node);
            } catch (e) {}
    return node;
}