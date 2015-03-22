System.register([], function(a) {
    var b, c, d, e, f, g, h, i, j, k, l;
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
            }, c = function(a) {
                if (Array.isArray(a)) {
                    for (var b = 0, c = Array(a.length); b < a.length; b++) c[b] = a[b];
                    return c;
                }
                return Array.from(a);
            }, d = function m(a, b, c) {
                var d = Object.getOwnPropertyDescriptor(a, b);
                if (void 0 === d) {
                    var e = Object.getPrototypeOf(a);
                    return null === e ? void 0 : m(e, b, c);
                }
                if ("value" in d && d.writable) return d.value;
                var f = d.get;
                return void 0 === f ? void 0 : f.call(c);
            }, e = function(a, b) {
                if ("function" != typeof b && null !== b) throw new TypeError("Super expression must either be null or a function, not " + typeof b);
                a.prototype = Object.create(b && b.prototype, {
                    constructor: {
                        value: a,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0
                    }
                }), b && (a.__proto__ = b);
            }, f = function() {
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
            }(), g = function(a, b) {
                if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function");
            }, h = function() {
                var a = Symbol(), h = Symbol(), i = Symbol(), j = Symbol(), k = function() {
                    function d() {
                        var b = void 0 === arguments[0] ? !1 : arguments[0];
                        g(this, d), this[a] = new Map(), this.directed = !!b;
                    }
                    return f(d, {
                        directed: {
                            get: function() {
                                return this[j];
                            },
                            set: function(a) {
                                if (this[j] = !!a, this.directed) {
                                    var b = !0, d = !1, e = void 0;
                                    try {
                                        for (var f, g = this.edges[Symbol.iterator](); !(b = (f = g.next()).done); b = !0) {
                                            var h = f.value;
                                            this.addEdge.apply(this, c(h));
                                        }
                                    } catch (i) {
                                        d = !0, e = i;
                                    } finally {
                                        try {
                                            !b && g["return"] && g["return"]();
                                        } finally {
                                            if (d) throw e;
                                        }
                                    }
                                }
                            }
                        },
                        nodes: {
                            get: function() {
                                return new Map(this[a]);
                            }
                        },
                        edges: {
                            get: function() {
                                var c = [], d = !0, e = !1, f = void 0;
                                try {
                                    for (var g, h = this[a][Symbol.iterator](); !(d = (g = h.next()).done); d = !0) {
                                        var i = b(g.value, 2), j = i[0], k = i[1], l = !0, m = !1, n = void 0;
                                        try {
                                            for (var o, p = k.dependents[Symbol.iterator](); !(l = (o = p.next()).done); l = !0) {
                                                var q = b(o.value, 2), r = q[0], s = q[1];
                                                c.push([ j, r, s ]);
                                            }
                                        } catch (t) {
                                            m = !0, n = t;
                                        } finally {
                                            try {
                                                !l && p["return"] && p["return"]();
                                            } finally {
                                                if (m) throw n;
                                            }
                                        }
                                    }
                                } catch (t) {
                                    e = !0, f = t;
                                } finally {
                                    try {
                                        !d && h["return"] && h["return"]();
                                    } finally {
                                        if (e) throw f;
                                    }
                                }
                                return c;
                            }
                        },
                        addNode: {
                            value: function(b) {
                                var c = Object.defineProperties({}, {
                                    dependencies: {
                                        get: function() {
                                            return new Map(this[h]);
                                        },
                                        configurable: !0,
                                        enumerable: !0
                                    },
                                    dependents: {
                                        get: function() {
                                            return new Map(this[i]);
                                        },
                                        configurable: !0,
                                        enumerable: !0
                                    }
                                });
                                return c[h] = new Map(), c[i] = new Map(), this[a].set(b, c), !0;
                            }
                        },
                        removeNode: {
                            value: function(c) {
                                var d = this[a];
                                d["delete"](c);
                                var e = !0, f = !1, g = void 0;
                                try {
                                    for (var j, k = d[Symbol.iterator](); !(e = (j = k.next()).done); e = !0) {
                                        var l = b(j.value, 2), m = l[1];
                                        m[i]["delete"](c), m[h]["delete"](c);
                                    }
                                } catch (n) {
                                    f = !0, g = n;
                                } finally {
                                    try {
                                        !e && k["return"] && k["return"]();
                                    } finally {
                                        if (f) throw g;
                                    }
                                }
                            }
                        },
                        addEdge: {
                            value: function(b, c) {
                                var d = void 0 === arguments[2] ? 1 : arguments[2], e = this[a];
                                return [ b, c ].every(e.has.bind(e)) ? (e.get(b)[i].set(c, d), e.get(c)[h].set(b, d), 
                                this.directed || (e.get(c)[i].set(b, d), e.get(b)[h].set(c, d)), !0) : !1;
                            }
                        },
                        removeEdge: {
                            value: function(b, c) {
                                var d = this[a];
                                return [ b, c ].every(d.has.bind(d)) ? (d.get(b)[i]["delete"](c), d.get(c)[h]["delete"](b), 
                                this.directed || (d.get(c)[i]["delete"](b), d.get(b)[h]["delete"](c)), !0) : !1;
                            }
                        },
                        hasCycle: {
                            value: function() {
                                return !!this.getCycle();
                            }
                        },
                        getCycle: {
                            value: function() {
                                function b(f, g, h) {
                                    if (!d.has(f)) {
                                        if (e.has(f)) return h;
                                        e.add(f);
                                        var j = this[a], k = !0, l = !1, m = void 0;
                                        try {
                                            for (var n, o = f[i][Symbol.iterator](); !(k = (n = o.next()).done); k = !0) {
                                                var p = n.value, q = j.get(p[0]);
                                                if (c || q !== g) {
                                                    var r = b.call(this, q, f, h + 1);
                                                    if (r) return r;
                                                }
                                            }
                                        } catch (s) {
                                            l = !0, m = s;
                                        } finally {
                                            try {
                                                !k && o["return"] && o["return"]();
                                            } finally {
                                                if (l) throw m;
                                            }
                                        }
                                        d.add(f);
                                    }
                                }
                                var c = this.directed, d = new Set(), e = new Set(), f = !0, g = !1, h = void 0;
                                try {
                                    for (var j, k = this[a][Symbol.iterator](); !(f = (j = k.next()).done); f = !0) {
                                        var l = j.value, m = b.call(this, l[1], void 0, 0);
                                        if (m) return m;
                                    }
                                } catch (n) {
                                    g = !0, h = n;
                                } finally {
                                    try {
                                        !f && k["return"] && k["return"]();
                                    } finally {
                                        if (g) throw h;
                                    }
                                }
                                return !1;
                            }
                        }
                    }), d;
                }(), l = function(a) {
                    function b() {
                        g(this, b), null != a && a.apply(this, arguments);
                    }
                    return e(b, a), f(b, {
                        addEdge: {
                            value: function(a, c, e) {
                                var f = d(Object.getPrototypeOf(b.prototype), "addEdge", this).call(this, a, c, e);
                                if (f && d(Object.getPrototypeOf(b.prototype), "hasCycle", this).call(this)) {
                                    if (this.removeEdge(a, c)) return !1;
                                    throw Error("Cyclic node could not be removed");
                                }
                                return f;
                            }
                        },
                        hasCycle: {
                            value: function() {
                                var a = void 0 === arguments[0] ? !1 : arguments[0];
                                return !!a && d(Object.getPrototypeOf(b.prototype), "hasCycle", this).call(this);
                            }
                        }
                    }), b;
                }(k), m = function(b) {
                    function c() {
                        g(this, c), null != b && b.apply(this, arguments);
                    }
                    return e(c, b), f(c, {
                        addEdge: {
                            value: function(b, e, f) {
                                return this[a].get(e)[h].size > 0 ? !1 : d(Object.getPrototypeOf(c.prototype), "addEdge", this).call(this, b, e, f);
                            }
                        }
                    }), c;
                }(l);
                return [ k, l, m ];
            }(), i = b(h, 3), j = i[0], k = i[1], l = i[2], a("Graph", j), a("AcyclicGraph", k), 
            a("Tree", l);
        }
    };
});