// Graph extension
Graph.prototype.addBiEdge = function(a, b, v_0, v_1) {
    this.ensureEdge(a, b, v_0);
    this.ensureEdge(b, a, v_1);
}

Graph.prototype.removeBiEdge = function(a, b) {
    this.removeEdge(a, b);
    this.removeEdge(b, a);
}

Graph.prototype.complement = function() {
    const g = new Graph;
    const vc = this.vertexCount();
    for (let i = 0; i < vc; ++i) {
        g.addVertex(i);
        for (let j = i + 1; j < vc; ++j) {
            if (!this.hasEdge(i, j)) {
                g.addBiEdge(i, j);
            }
        }
    }
    return g;
}

Graph.prototype.biseparated = function() {
    if (this.vertexCount() == 0) {
        return false;
    }
    const first_key = [...this.vertices()][0][0];
    return [...this.complement().verticesWithPathFrom(first_key)].length != this.vertexCount();
}

Graph.prototype.biseparation = function() {
    if (this.vertexCount() == 0) {
        return new Set;
    }
    const first_key = [...this.vertices()][0][0];
    return new Set([[first_key], ...this.complement().verticesWithPathFrom(first_key)].map(([key]) => key));
}

Graph.prototype.disrupt = function disrupt(set = new Set, disruptors = new Set) {
    for (const disruptor of disruptors) {
        for (const party of set) {
            if (!disruptors.has(party)) {
                this.addBiEdge(party, disruptor);
            }
        }
    }
};

Graph.prototype.canonicalize = function canonicalize() {
    const json = [];
    const n = this.vertexCount();
    for (let i = 0; i < n; ++i) {
        json.push([i]);
    }
    for (let i = 0; i < n; ++i) {
        for (let j = i + 1; j < n; ++j) {
            if (this.hasEdge(i, j)) {
                json.push([i,j]);
                json.push([j,i]);
            }
        }
    }
    return JSON.stringify(json);
};

Graph.prototype.getSettledSet = function(t) {
    const n = this.vertexCount();
    if (this.vertexCount() == 0) {
        return false;
    }

    const t_classes = [[]];
    const vertices = new Set;
    for (let i = 0; i < n; ++i) {
        vertices.add(i);
        for (const _class of t_classes) {
            if (_class.length < t && _class.indexOf(i) == -1) {
                const new_class = [..._class, i];
                t_classes.push(new_class);
            }
        }
    }
    let has_t_vc = false;
    for (const _class of t_classes) {
        if (_class.length == t && this.isVC(_class)) {
            has_t_vc = true;
            for (const i of vertices) {
                if (_class.indexOf(i) == -1) {
                    vertices.delete(i);
                }
            }
        }
    }
    if (!has_t_vc) {
        return new Set;
    }
    return vertices;
};

Graph.prototype.isVC = function(_subset) {
    const _g = this.clone();
    for (const vertex of _subset) {
        _g.destroyVertex(vertex);
    }
    return _g.edgeCount() == 0;
};

Graph.prototype.intersect = function(graph) {
    for (const [i,j] of graph.edges()) {
        this.removeEdge(i,j);
    }
};

Graph.prototype.deduceCG = function(t) {
    const n = this.vertexCount();

    let changed = true;
    while (changed) {
        changed = false;
        for (let i = 0; i < n; ++i) {
            const _g = this.clone();
            const neighbors = [...this.verticesFrom(i)];
            _g.destroyVertex(i);
            for (const [neighbor] of neighbors) {
                _g.destroyVertex(neighbor);
            }
            const X = _g.getSettledSet(t - neighbors.length);
            try {
                for (const vertex of X) {
                    this.addBiEdge(vertex, i);
                    changed = true;
                }
            } catch (error) {
            }
        }
    }
};

Graph.create = function create(n) {
    const g = new Graph;
    for (let i = 0; i < n; ++i) {
        g.addVertex(i);
    }
    return g;
};

// Array extension
Array.prototype.iterateSubsets = function*(filter = () => true) {
    const classes = new Set([new Set]);
    for (const key of this) {
        for (const _class of classes) {
            if (_class.size <= n && !_class.has(key)) {
                const new_class = new Set([key, ..._class]);
                classes.add(new_class);
            }
        }
    }
    for (const _class of classes) {
        if (filter(_class)) {
            yield _class;
        }
    }
};

// Set extension
Set.prototype.intersect = function intersect(set) {
    const intersection = new Set;
    for (const value of this) {
        if (set.has(value)) {
            intersection.add(value);
        }
    }
    return intersection;
};

// dispatch event
dispatchEvent(new CustomEvent("graph-extension"));
