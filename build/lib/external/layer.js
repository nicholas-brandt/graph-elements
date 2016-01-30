"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} :function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" :typeof obj;
};

Object.defineProperty(exports, "__esModule", {
    value:true
});

exports.default = layer;

var _mixin2 = require("../../node_modules/various/build/LayerJS/mixin");

var _mixin3 = _interopRequireDefault(_mixin2);

var _requestAnimationFunction = require("../../node_modules/various/build/requestAnimationFunction");

var _requestAnimationFunction2 = _interopRequireDefault(_requestAnimationFunction);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj :{
        "default":obj
    };
}

var default_duration = 1e3;

function layer(storage, modifier, global_change_callback) {
    if ((typeof storage === "undefined" ? "undefined" :_typeof(storage)) != "object") throw Error("{storage} is not an object");
    if (!modifier || (typeof modifier === "undefined" ? "undefined" :_typeof(modifier)) != "object") modifier = {};
    if (typeof global_change_callback != "function") global_change_callback = undefined;
    var layer_object = {};
    var _loop = function _loop(property) {
        var modify = modifier[property];
        if (_typeof(storage[property]) == "object") {
            (function() {
                var object = layer(storage[property], modify, global_change_callback);
                Object.defineProperty(layer_object, property, {
                    get:function get() {
                        return object;
                    },
                    set:function set(value) {
                        (0, _mixin3.default)(object, value, _mixin3.default.OVERRIDE);
                    },
                    enumerable:true
                });
            })();
        } else {
            (function() {
                var store = global_change_callback ? function(value) {
                    storage[property] = value;
                    global_change_callback();
                } :function(value) {
                    storage[property] = value;
                };
                var set_callback = undefined;
                var _mixin = (0, _mixin3.default)({}, modify);
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
                        var set_callback = function set_callback(target_value) {
                            update(performance.now(), target_value, target_value - getter());
                        };
                        setter = hasSet ? function(value) {
                            set(value, set_callback);
                        } :set_callback;
                        var update = (0, _requestAnimationFunction2.default)(function(begin, target_value, value_diff) {
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
    };
    for (var property in storage) {
        _loop(property);
    }
    return layer_object;
}