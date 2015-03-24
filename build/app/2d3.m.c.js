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
                                var c = [], d = [], j = [], k = [], l = new Map(), m = !0, n = !1, o = void 0;
                                try {
                                    for (var p, q = this[i].nodes.keys()[Symbol.iterator](); !(m = (p = q.next()).done); m = !0) {
                                        var r = p.value, s = {
                                            value: r
                                        };
                                        l.set(r, s), c.push(s);
                                    }
                                } catch (t) {
                                    n = !0, o = t;
                                } finally {
                                    try {
                                        !m && q["return"] && q["return"]();
                                    } finally {
                                        if (n) throw o;
                                    }
                                }
                                var u = !0, v = !1, w = void 0;
                                try {
                                    for (var x, y = this[i].edges[Symbol.iterator](); !(u = (x = y.next()).done); u = !0) {
                                        var z = b(x.value, 2), A = z[0], B = z[1], C = l.get(A), D = l.get(B), E = {};
                                        j.push(E), k.push({
                                            source: C,
                                            target: E
                                        }, {
                                            source: E,
                                            target: D
                                        }), d.push([ C, E, D ]);
                                    }
                                } catch (t) {
                                    v = !0, w = t;
                                } finally {
                                    try {
                                        !u && y["return"] && y["return"]();
                                    } finally {
                                        if (v) throw w;
                                    }
                                }
                                var F = getComputedStyle(this[f]), G = F.width, H = F.height;
                                this[a].size([ parseInt(G), parseInt(H) ]), this[a].nodes(c.concat(j)).links(k), 
                                this[g] = this[e].selectAll("circle").data(c), this[h] = this[e].selectAll("path").data(d), 
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