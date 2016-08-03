"use strict";

var _obj;

var _get = function get(object, property, receiver) {
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc && desc.writable) {
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
        var _this = this;
        _get(Object.getPrototypeOf(_obj), "addEdge", this).call(this, source, target);
        if (this.hasCycle()) {
            this.removeEdge(source, target);
            return false;
        }
        return true;
    }
});