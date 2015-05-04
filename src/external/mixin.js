/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
export default function mixin(base, provider, options) {
    if (typeof base == "object") {
        if (!options || typeof options != "object") options = {};
        const weak = options.weak === undefined ? true : options.weak;
        const assign = options.assign === undefined ? false : options.assign;
        const catch_error = options.catch === undefined ? true : options.catch;
        for (let property in provider) {
            const override = !(weak && property in base);
            if (typeof provider[property] == "object") {
                if (override && typeof base[property] != "object") base[property] = {};
                mixin(base[property], provider[property], {
                    weak,
                    assign
                });
            } else if (override) 
                if (catch_error)
                    try {
                        if (assign) base[property] = provider[property];
                        else Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
                    } catch (e) {
                        console.error(e);
                    }
                else
                    if (assign) base[property] = provider[property];
                    else Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
        }
    }
    return base;
}