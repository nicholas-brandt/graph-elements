define([ "exports", "module", "../external/mixin" ], function(exports, module, _externalMixin) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = liteLayer;
    var mixin = _interopRequire(_externalMixin);
    function liteLayer(storage, modifier) {
        if (typeof storage != "object") throw Error("{storage} is not an object");
        if (!modifier || typeof modifier != "object") modifier = {};
        var layer_object = {};
        for (var property in storage) {
            var _mixin;
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
                                mixin(object, value, {
                                    weak:false,
                                    assign:true
                                });
                            },
                            enumerable:true
                        });
                    })();
                } else {
                    (function() {
                        var store = function(value) {
                            storage[property] = value;
                        };
                        _mixin = mixin({}, modify);
                        var get = _mixin.get;
                        var set = _mixin.set;
                        Object.defineProperty(layer_object, property, {
                            get:typeof get == "function" ? function() {
                                return get(storage[property]);
                            } :function() {
                                return storage[property];
                            },
                            set:typeof set == "function" ? function(value) {
                                set(value, store);
                            } :store,
                            enumerable:true
                        });
                    })();
                }
            })(property);
        }
        return layer_object;
    }
});