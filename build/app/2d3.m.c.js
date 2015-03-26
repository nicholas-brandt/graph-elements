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
                                this.resize();
                                var c = [], d = [], f = [], j = [], k = new Map(), l = !0, m = !1, n = void 0;
                                try {
                                    for (var o, p = this[i].nodes.keys()[Symbol.iterator](); !(l = (o = p.next()).done); l = !0) {
                                        var q = o.value, r = {
                                            value: q
                                        };
                                        k.set(q, r), c.push(r);
                                    }
                                } catch (s) {
                                    m = !0, n = s;
                                } finally {
                                    try {
                                        !l && p["return"] && p["return"]();
                                    } finally {
                                        if (m) throw n;
                                    }
                                }
                                var t = !0, u = !1, v = void 0;
                                try {
                                    for (var w, x = this[i].edges[Symbol.iterator](); !(t = (w = x.next()).done); t = !0) {
                                        var y = b(w.value, 2), z = y[0], A = y[1], B = k.get(z), C = k.get(A), D = {};
                                        f.push(D), j.push({
                                            source: B,
                                            target: D
                                        }, {
                                            source: D,
                                            target: C
                                        }), d.push([ B, D, C ]);
                                    }
                                } catch (s) {
                                    u = !0, v = s;
                                } finally {
                                    try {
                                        !t && x["return"] && x["return"]();
                                    } finally {
                                        if (u) throw v;
                                    }
                                }
                                this[a].nodes(c.concat(f)).links(j), this[g] = this[e].selectAll("circle").data(c), 
                                this[h] = this[e].selectAll("path").data(d), this[g].enter().append("circle").attr("r", 5).call(this[a].drag), 
                                this[h].enter().append("path"), this[g].exit().remove(), this[h].exit().remove();
                            }
                        },
                        resize: {
                            value: function() {
                                var b = this;
                                requestAnimationFrame(function() {
                                    var c = getComputedStyle(b[f]), d = c.width, e = c.height;
                                    b[a].size([ parseInt(d), parseInt(e) ]);
                                });
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