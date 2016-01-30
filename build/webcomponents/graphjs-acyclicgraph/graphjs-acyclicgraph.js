"use strict";

var _obj;

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};

Polymer(_obj = {
    is:"graphjs-acyclicgraph",
    "extends":"graphjs-graph",
    addEdge:function addEdge(source, target) {
        _get(Object.getPrototypeOf(_obj), "addEdge", this).call(this, source, target);
        if (this.hasCycle()) {
            this.removeEdge(source, target);
            return false;
        }
        return true;
    }
});