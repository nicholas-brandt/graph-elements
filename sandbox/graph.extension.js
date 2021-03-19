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
