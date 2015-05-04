define([ "exports", "module", "../external/mixin" ], function(exports, module, _externalMixin) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = layer;
    var mixin = _interopRequire(_externalMixin);
    function layer(storage, modifier) {
        if (typeof storage != "object") throw Error("Argument is not an object");
        if (!modifier || typeof modifier != "object") modifier = {};
        var layer_object = {};
        for (var property in storage) {
            (function(property) {
                var modify = modifier[property];
                if (typeof storage[property] == "object") {
                    (function() {
                        var object = layer(storage[property], modify);
                        Object.defineProperty(layer_object, property, {
                            get:function get() {
                                return object;
                            },
                            set:function set(value) {
                                mixin(object, value, false, true);
                            }
                        });
                    })();
                } else {
                    (function() {
                        var store = function(value) {
                            storage[property] = value;
                        };
                        var getter = undefined;
                        var setter = undefined;
                        try {
                            (function() {
                                var get = modify.get;
                                var set = modify.set;
                                if (typeof set == "function") setter = function(value) {
                                    set(value, store);
                                };
                                if (typeof get == "function") getter = function() {
                                    return get(storage[property]);
                                };
                            })();
                        } catch (e) {}
                        if (!getter) getter = function() {
                            return storage[property];
                        };
                        if (!setter) setter = store;
                        Object.defineProperty(layer_object, property, {
                            get:getter,
                            set:setter
                        });
                    })();
                }
            })(property);
        }
        return layer_object;
    }
});