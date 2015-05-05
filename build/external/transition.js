define([ "exports", "module", "../external/mixin", "../external/requestAnimationFunction" ], function(exports, module, _externalMixin, _externalRequestAnimationFunction) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = layer;
    var mixin = _interopRequire(_externalMixin);
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var default_duration = 1e3;
    function layer(storage, modifier) {
        if (typeof storage != "object") throw Error("Argument is not an object");
        if (!modifier || typeof modifier != "object") modifier = {};
        var layer_object = {};
        for (var property in storage) {
            var _mixin;
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
                        var set_callback = undefined;
                        _mixin = mixin({}, modify);
                        var get = _mixin.get;
                        var set = _mixin.set;
                        var translate = _mixin.translate;
                        var duration = _mixin.duration;
                        if (duration === undefined) duration = default_duration; else if (duration <= 0 || duration == Infinity) duration = undefined;
                        var hasTransition = duration && typeof translate == "function";
                        var getter = typeof get == "function" ? function() {
                            return get(storage[property]);
                        } :function() {
                            return storage[property];
                        };
                        var setter = undefined;
                        var hasSet = typeof set == "function";
                        if (hasTransition) {
                            (function() {
                                var set_callback = function(target_value) {
                                    update(performance.now(), target_value, target_value - getter());
                                };
                                setter = hasSet ? function(value) {
                                    set(value, set_callback);
                                } :set_callback;
                                var update = requestAnimationFunction(function(begin, target_value, value_diff) {
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
                            })();
                        } else setter = hasSet ? function(value) {
                            set(value, store);
                        } :store;
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