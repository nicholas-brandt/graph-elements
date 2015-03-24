"use strict";

var _slicedToArray = function(a, b) {
    if (Array.isArray(a)) return a;
    if (Symbol.iterator in Object(a)) {
        for (var c, d = [], e = a[Symbol.iterator](); !(c = e.next()).done && (d.push(c.value), 
        !b || d.length !== b); ) ;
        return d;
    }
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
};

Promise.all([ "build/graph.m.c", "build/app/2d3.m.c" ].map(function(a) {
    return System["import"](a);
})).then(function(a) {
    var b = _slicedToArray(a, 2), c = b[0], d = b[1];
    console.log("init");
    var e = document.querySelector("svg");
    window.graph = new c.Tree(!0);
    for (var f = 200, g = 0; f > g; ++g) graph.addNode(g);
    for (var g = 0; 2 * f > g; ++g) graph.addEdge(g % f, Math.floor(Math.random() * f));
    window.d3svg = new d.D3SVG(e, graph);
    var h = d3svg.force;
    setTimeout(function() {
        h.friction(.2);
    }, 200), setTimeout(function() {
        h.friction(.95);
    }, 700), setTimeout(function() {
        h.charge(-140), h.gravity(.05), h.resume();
    }, 2e3), h.gravity(.18), h.friction(0), h.start();
})["catch"](function(a) {
    console.error(a);
});