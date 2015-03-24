"use strict";

function applyModel(a, b, c, d) {
    console.log("\n" + c + " | " + a.directed + " | " + d), console.time("init");
    var e = !0, f = !1, g = void 0;
    try {
        for (var h, i = nodes[Symbol.iterator](); !(e = (h = i.next()).done); e = !0) {
            var j = h.value;
            a.addNode(j);
        }
    } catch (k) {
        f = !0, g = k;
    } finally {
        try {
            !e && i["return"] && i["return"]();
        } finally {
            if (f) throw g;
        }
    }
    var l = !0, m = !1, n = void 0;
    try {
        for (var o, p = b[Symbol.iterator](); !(l = (o = p.next()).done); l = !0) {
            var q = o.value;
            a.addEdge(q[0], q[1]);
        }
    } catch (k) {
        m = !0, n = k;
    } finally {
        try {
            !l && p["return"] && p["return"]();
        } finally {
            if (m) throw n;
        }
    }
    console.timeEnd("init"), console.time("Cycle check"), console.log("Cycle: " + a.hasCycle()), 
    console.timeEnd("Cycle check"), console.time("Edges check"), console.log("Edges: " + a.edges.length), 
    console.timeEnd("Edges check");
}

System["import"]("build/graph.m.c").then(function(a) {
    window.graphjs = a, console.log("graphjs loaded"), console.log("length: " + length);
    var b = !0, c = !1, d = void 0;
    try {
        for (var e, f = [ "Graph", "AcyclicGraph", "Tree" ][Symbol.iterator](); !(b = (e = f.next()).done); b = !0) {
            var g = e.value, h = !0, i = !1, j = void 0;
            try {
                for (var k, l = edge_array[Symbol.iterator](); !(h = (k = l.next()).done); h = !0) {
                    var m = k.value, n = new a[g](), o = new a[g](!0);
                    applyModel(n, m, g, m.density), applyModel(o, m, g, m.density);
                }
            } catch (p) {
                i = !0, j = p;
            } finally {
                try {
                    !h && l["return"] && l["return"]();
                } finally {
                    if (i) throw j;
                }
            }
        }
    } catch (p) {
        c = !0, d = p;
    } finally {
        try {
            !b && f["return"] && f["return"]();
        } finally {
            if (c) throw d;
        }
    }
})["catch"](function(a) {
    console.error(a);
}), console.time("preparation");

for (var length = 20, nodes = [], edge_array = [], densities = [ 0, .01, .5, 1, 10 ], i = 0; length > i; ++i) nodes.push(i);

var _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;

try {
    for (var _iterator = densities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
        for (var density = _step.value, edges = [], i = 0; i < Math.pow(length, 2) * density; ++i) edges.push([ Math.floor(Math.random() * length), Math.floor(Math.random() * length) ]);
        edges.density = density, edge_array.push(edges);
    }
} catch (err) {
    _didIteratorError = !0, _iteratorError = err;
} finally {
    try {
        !_iteratorNormalCompletion && _iterator["return"] && _iterator["return"]();
    } finally {
        if (_didIteratorError) throw _iteratorError;
    }
}

var static_edges = function() {
    var a = [], b = !0, c = !1, d = void 0;
    try {
        for (var e, f = nodes[Symbol.iterator](); !(b = (e = f.next()).done); b = !0) {
            var g = e.value;
            a.push([ Math.floor(Math.abs(Math.sin(g)) * (length - 1)), Math.floor(Math.abs(Math.cos(g)) * (length - 1)) ]);
        }
    } catch (h) {
        c = !0, d = h;
    } finally {
        try {
            !b && f["return"] && f["return"]();
        } finally {
            if (c) throw d;
        }
    }
    return a;
}();

static_edges.density = 1, edge_array.push(static_edges), console.timeEnd("preparation");