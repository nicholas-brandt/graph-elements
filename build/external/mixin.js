define([ "exports", "module" ], function(exports, module) {
    "use strict";
    module.exports = mixin;
    function mixin(base, provider) {
        var weak = arguments[2] === undefined ? true :arguments[2];
        var assign = arguments[3] === undefined ? false :arguments[3];
        if (typeof base == "object") for (var property in provider) {
            var override = !(weak && property in base);
            if (typeof provider[property] == "object") {
                if (override && typeof base[property] != "object") base[property] = {};
                mixin(base[property], provider[property], weak, assign);
            } else if (override) try {
                if (assign) base[property] = provider[property]; else Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
            } catch (e) {}
        }
        return base;
    }
});