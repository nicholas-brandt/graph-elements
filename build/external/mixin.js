define(["exports"], function (exports) {
    /*
     * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
     * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
     * */
    "use strict";

    exports.mixin = mixin;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function mixin(base, provider) {
        var weak = arguments[2] === undefined ? true : arguments[2];

        if (typeof base == "object") for (var property in provider) {
            var override = !(weak && property in base);
            if (typeof provider[property] == "object") {
                if (override && typeof base[property] != "object") base[property] = {};
                mixin(base[property], provider[property], weak);
            } else if (override) try {
                Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
            } catch (e) {}
        }
        return base;
    }

    ;
});