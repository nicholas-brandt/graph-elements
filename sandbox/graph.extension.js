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
                this.spanEdge(party, disruptor);
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
