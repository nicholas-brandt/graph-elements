"use strict";

Polymer({
    is:"graphjs-graph",
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
    }
});