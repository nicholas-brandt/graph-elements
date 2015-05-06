define([ "exports", "module" ], function(exports, module) {
    "use strict";
    module.exports = mixin;
    function mixin(base, provider, options) {
        if (!options || typeof options != "object") options = {};
        var weak = options.weak === undefined ? true :options.weak;
        var assign = options.assign === undefined ? false :options.assign;
        var catch_error = options["catch"] === undefined ? true :options["catch"];
        for (var property in provider) {
            var override = !(weak && property in base);
            if (typeof provider[property] == "object") {
                if (override && typeof base[property] != "object") base[property] = {};
                mixin(base[property], provider[property], {
                    weak:weak,
                    assign:assign
                });
            } else if (override) if (catch_error) try {
                if (assign) base[property] = provider[property]; else Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
            } catch (e) {
                console.error(e);
            } else if (assign) base[property] = provider[property]; else Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
        }
        return base;
    }
    mixin(mixin, {
        OVERRIDE:{
            weak:false,
            assign:true,
            "catch":false
        },
        COPY:{
            weak:true,
            assign:true,
            "catch":false
        },
        SAFE_OVERRIDE:{
            weak:false,
            assign:true,
            "catch":true
        },
        SAFE_COPY:{
            weak:true,
            assign:true,
            "catch":true
        }
    });
});