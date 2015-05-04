define([ "exports", "module", "../external/mixin", "../external/requestAnimationFunction" ], function(exports, module, _externalMixin, _externalRequestAnimationFunction) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = transition;
    var mixin = _interopRequire(_externalMixin);
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var default_duration = 1e3;
    function transition(storage, modifier) {
        if (typeof storage != "object") throw Error("Argument is not an object");
        if (!modifier || typeof modifier != "object") modifier = {};
        var layer_object = {};
        for (var property in storage) {
            (function(property) {
                var modify = modifier[property];
                if (typeof storage[property] == "object") {
                    (function() {
                        var object = transition(storage[property], modify);
                        Object.defineProperty(layer_object, property, {
                            get:function get() {
                                return object;
                            },
                            set:function set(value) {
                                mixin(object, value, {
                                    weak:false,
                                    assign:true
                                });
                            }
                        });
                    })();
                } else {
                    (function() {
                        var store = function(value) {
                            storage[property] = value;
                        };
                        var setTargetValue = function(target_value) {
                            var begin = performance.now();
                            var value_diff = target_value - getter();
                            update(begin, target_value, value_diff);
                        };
                        var getter = undefined;
                        var setter = undefined;
                        var update = undefined;
                        var duration = undefined;
                        try {
                            (function() {
                                var get = modify.get;
                                var set = modify.set;
                                var translate = modify.translate;
                                var _duration = Math.max(0, modify.duration);
                                if (!isNaN(_duration) && _duration !== Infinity) duration = _duration;
                                if (typeof translate == "function") update = requestAnimationFunction(function(begin, target_value, value_diff) {
                                    var relativ_time_diff = (performance.now() - begin) / duration - 1;
                                    if (relativ_time_diff >= 0) {
                                        store(target_value);
                                        translate(target_value);
                                    } else {
                                        var new_value = target_value + value_diff * relativ_time_diff;
                                        store(new_value);
                                        translate(new_value);
                                        update();
                                    }
                                });
                                if (typeof set == "function") setter = function(value) {
                                    set(value, setTargetValue);
                                };
                                if (typeof get == "function") getter = function() {
                                    return get(storage[property]);
                                };
                            })();
                        } catch (e) {}
                        if (!getter) getter = function() {
                            return storage[property];
                        };
                        if (duration === undefined) duration = default_duration;
                        if (!update) update = requestAnimationFunction(function(begin, target_value, value_diff) {
                            var relativ_time_diff = (performance.now() - begin) / duration - 1;
                            if (relativ_time_diff >= 0) store(target_value); else {
                                store(target_value + value_diff * relativ_time_diff);
                                update();
                            }
                        });
                        if (!setter) setter = setTargetValue;
                        Object.defineProperty(layer_object, property, {
                            get:getter,
                            set:setter,
                            enumerable:true
                        });
                    })();
                }
            })(property);
        }
        return layer_object;
    }
});