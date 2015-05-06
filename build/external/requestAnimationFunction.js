define([ "exports", "module" ], function(exports, module) {
    "use strict";
    var _toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
            return arr2;
        } else {
            return Array.from(arr);
        }
    };
    module.exports = requestAnimationFunction;
    function requestAnimationFunction(callback) {
        var weak = arguments[1] === undefined ? true :arguments[1];
        var updated = true;
        var params = undefined;
        return function update() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }
            if (params === undefined || weak && args.length) params = args;
            if (updated) {
                requestAnimationFrame(function() {
                    updated = true;
                    callback.apply(undefined, _toConsumableArray(params));
                });
                updated = false;
            }
        };
    }
});