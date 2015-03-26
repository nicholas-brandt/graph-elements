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
    window.graph = new c.AcyclicGraph(!0);
    for (var f = 50, g = 0; f > g; ++g) graph.addNode(g);
    for (var g = 0; .8 * f > g; ++g) graph.addEdge(g % f, Math.floor(Math.random() * f));
    window.d3svg = new d.D3SVG(e, graph);
    var h = d3svg.force;
    setTimeout(function() {
        h.friction(.7);
    }, 200), setTimeout(function() {
        e.classList.add("resolved");
    }, 700), setTimeout(function() {
        h.friction(.9), h.gravity(.08), h.charge(-200), h.alpha(.25);
    }, 2e3), h.gravity(.8), h.friction(0), h.linkDistance(5), h.theta(.6), h.alpha(.5), 
    h.start(), addEventListener("resize", function() {
        d3svg.resize();
    });
})["catch"](function(a) {
    console.error(a);
});