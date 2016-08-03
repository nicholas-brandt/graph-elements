"use strict";

Polymer({
    is:"graphjs-app",
    properties:{
        nodes:{
            type:Array,
            notify:true,
            value:function() {
                return [];
            }
        },
        edges:{
            type:Array,
            notify:true,
            value:function() {
                return [];
            }
        }
    },
    _initLocalstorage:function _initLocalstorage(event) {
        event.preventDefault();
        event.cancelBubble = true;
        console.log("load", event, this.nodes);
        var graph = this.querySelector("graphjs-graph");
        var value = event.srcElement.value;
        if (value) {
            this.nodes = value.nodes || [];
            this.edges = value.edges || [];
        }
    },
    _initEmptyLocalstorage:function _initEmptyLocalstorage(event) {
        event.preventDefault();
        event.cancelBubble = true;
        console.log("empty", event);
        event.srcElement.value = this._storage(this.nodes, this.edges);
    },
    _storage:function _storage(nodes, edges) {
        return {
            nodes:nodes,
            edges:edges
        };
    }
});