/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin";
export default function layer(storage, modifier) {
    if (typeof storage != "object") throw Error("Argument is not an object");
    if (!modifier || typeof modifier != "object") modifier = {};
    const layer_object = {};
    for (let property in storage) {
        const modify = modifier[property];
        if (typeof storage[property] == "object") {
            const object = layer(storage[property], modify);
            Object.defineProperty(layer_object, property, {
                get: function() {
                    return object;
                },
                set: function(value) {
                    mixin(object, value, {
                        weak: false,
                        assign: true
                    });
                }
            });
        } else {
            let getter;
            let setter;
            try {
                const { get, set } = modify;
                if (typeof set == "function") setter = function(value) {
                    set(value, store);
                };
                if (typeof get == "function") getter = function() {
                    return get(storage[property]);
                };
            } catch (e) {}
            if (!getter) getter = function() {
                return storage[property];
            };
            if (!setter) setter = store;
            Object.defineProperty(layer_object, property, {
                get: getter,
                set: setter
            });
            
            function store(value) {
                storage[property] = value;
            }
        }
    }
    return layer_object;
}