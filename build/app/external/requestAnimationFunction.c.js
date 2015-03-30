define([ "exports" ], function(exports) {
    "use strict";
    var _toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        } else {
            return Array.from(arr);
        }
    };
    exports.requestAnimationFunction = requestAnimationFunction;
    Object.defineProperty(exports, "__esModule", {
        value:true
    });
    function requestAnimationFunction(callback) {
        var weak = arguments[1] === undefined ? true :arguments[1];
        var updated = true;
        var args = undefined;
        return function update() {
            if (args === undefined) args = arguments;
            if (updated) {
                requestAnimationFrame(function() {
                    updated = true;
                    callback.apply(undefined, _toConsumableArray(args));
                });
                updated = false;
            } else if (!!weak) args = arguments;
        };
    }
});