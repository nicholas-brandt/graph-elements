/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin";
export default function liteLayer(storage, modifier) {
    if (typeof storage != "object") throw Error("{storage} is not an object");
    if (!modifier || typeof modifier != "object") modifier = {};
    const layer_object = {};
    for (let property in storage) {
        const modify = modifier[property];
        if (typeof storage[property] == "object") {
            const object = layer(storage[property], modify);
            Object.defineProperty(layer_object, property, {
                get() {
                    return object;
                },
                set(value) {
                    mixin(object, value, {
                        weak: false,
                        assign: true
                    });
                },
                enumerable: true
            });
        } else {
            let { get, set } = mixin({}, modify);
            //define
            Object.defineProperty(layer_object, property, {
                get: typeof get == "function" ? () => get(storage[property]) : () => storage[property],
                set: typeof set == "function" ? value => {
                    set(value, store);
                } : store,
                enumerable: true
            });
            function store(value) {
                storage[property] = value;
            }
        }
    }
    return layer_object;
}