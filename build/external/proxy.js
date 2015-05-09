define([ "exports", "module", "../external/mixin", "../external/requestAnimationFunction" ], function(exports, module, _externalMixin, _externalRequestAnimationFunction) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = proxy;
    var mixin = _interopRequire(_externalMixin);
    var requestAnimationFunction = _interopRequire(_externalRequestAnimationFunction);
    var default_duration = 1e3;
    function proxy(storage, handler) {
        if (typeof storage != "object") throw Error("{storage} is not an object");
        if (!handler || typeof handler != "object") handler = {};
        var proxy_object = {};
        for (var property in storage) {
            (function(property) {
                var callback = handler[property];
                if (typeof storage[property] == "object") {
                    (function() {
                        var object = proxy(storage[property], callback);
                        Object.defineProperty(proxy_object, property, {
                            get:function get() {
                                return object;
                            },
                            set:function set(value) {
                                mixin(object, value, mixin.OVERRIDE);
                            },
                            enumerable:true
                        });
                    })();
                } else {
                    (function() {
                        var store = function(value) {
                            storage[property] = value;
                        };
                        Object.defineProperty(proxy_object, property, {
                            get:function get() {
                                return storage[property];
                            },
                            set:typeof callback == "function" ? function(value) {
                                store(value);
                                callback(value);
                            } :store,
                            enumerable:true
                        });
                    })();
                }
            })(property);
        }
        return proxy_object;
    }
});