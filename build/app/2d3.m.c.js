System.register([], function(a) {
    var b, c, d, e;
    return {
        setters: [],
        execute: function() {
            "use strict";
            b = function(a, b) {
                if (Array.isArray(a)) return a;
                if (Symbol.iterator in Object(a)) {
                    for (var c, d = [], e = a[Symbol.iterator](); !(c = e.next()).done && (d.push(c.value), 
                    !b || d.length !== b); ) ;
                    return d;
                }
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }, c = function() {
                function a(a, b) {
                    for (var c in b) {
                        var d = b[c];
                        d.configurable = !0, d.value && (d.writable = !0);
                    }
                    Object.defineProperties(a, b);
                }
                return function(b, c, d) {
                    return c && a(b.prototype, c), d && a(b, d), b;
                };
            }(), d = function(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
            }, e = function() {
                var a = Symbol(), e = Symbol(), f = Symbol(), g = Symbol(), h = Symbol(), i = Symbol();
                return function() {
                    function j(c, k) {
                        var l = this;
                        if (d(this, j), !c) throw Error("No svg element specified");
                        if (!k) throw Error("No graph specified");
                        this[i] = k, this[f] = c, this[a] = d3.layout.force(), this[e] = window.svg = d3.select(c), 
                        this[a].on("tick", function() {
                            l[g].attr("transform", function(a) {
                                return "translate(" + a.x + "," + a.y + ")";
                            }), l[h].attr("d", function(a) {
                                var c = b(a, 3), d = c[0], e = c[1], f = c[2];
                                return "M" + d.x + "," + d.y + "S" + e.x + "," + e.y + " " + f.x + "," + f.y;
                            });
                        }), this.update();
                    }
                    return c(j, {
                        update: {
                            value: function() {
                                var c = getComputedStyle(this[f]), d = c.width, j = c.height, k = [], l = [], m = [], n = [], o = new Map(), p = !0, q = !1, r = void 0;
                                try {
                                    for (var s, t = this[i].nodes.keys()[Symbol.iterator](); !(p = (s = t.next()).done); p = !0) {
                                        var u = s.value, v = {
                                            value: u,
                                            x: Math.random() * d,
                                            y: j / 2
                                        };
                                        o.set(u, v), k.push(v);
                                    }
                                } catch (w) {
                                    q = !0, r = w;
                                } finally {
                                    try {
                                        !p && t["return"] && t["return"]();
                                    } finally {
                                        if (q) throw r;
                                    }
                                }
                                var x = !0, y = !1, z = void 0;
                                try {
                                    for (var A, B = this[i].edges[Symbol.iterator](); !(x = (A = B.next()).done); x = !0) {
                                        var C = b(A.value, 2), D = C[0], E = C[1], F = o.get(D), G = o.get(E), H = {};
                                        m.push(H), n.push({
                                            source: F,
                                            target: H
                                        }, {
                                            source: H,
                                            target: G
                                        }), l.push([ F, H, G ]);
                                    }
                                } catch (w) {
                                    y = !0, z = w;
                                } finally {
                                    try {
                                        !x && B["return"] && B["return"]();
                                    } finally {
                                        if (y) throw z;
                                    }
                                }
                                this[a].size([ parseInt(d), parseInt(j) ]), this[a].nodes(k.concat(m)).links(n), 
                                this[g] = this[e].selectAll("circle").data(k), this[h] = this[e].selectAll("path").data(l), 
                                this[g].enter().append("circle").attr("r", 5).call(this[a].drag), this[h].enter().append("path"), 
                                this[g].exit().remove(), this[h].exit().remove();
                            }
                        },
                        graph: {
                            get: function() {
                                return this[i];
                            }
                        },
                        force: {
                            get: function() {
                                return this[a];
                            }
                        }
                    }), j;
                }();
            }(), a("D3SVG", e);
        }
    };
});