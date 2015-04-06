/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
export function mixin(base, provider, weak = true) {
    if (typeof base == "object")
        for (let property in provider) {
            const override = !(weak && property in base);
            if (typeof provider[property] == "object") {
                if (override && typeof base[property] != "object") base[property] = {};
                mixin(base[property], provider[property], weak);
            } else if (override) try {
                Object.defineProperty(base, property, Object.getOwnPropertyDescriptor(provider, property));
            } catch (e) {}
        }
  return base;
};