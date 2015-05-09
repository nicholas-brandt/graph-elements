/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin";
import requestAnimationFunction from "../external/requestAnimationFunction";
const default_duration = 1000;
export default function proxy(storage, handler) {
    if (typeof storage != "object") throw Error("{storage} is not an object");
    if (!handler || typeof handler != "object") handler = {};
    const proxy_object = {};
    for (let property in storage) {
        const callback = handler[property];
        if (typeof storage[property] == "object") {
            const object = proxy(storage[property], callback);
            Object.defineProperty(proxy_object, property, {
                get() {
                    return object;
                },
                set(value) {
                    mixin(object, value, mixin.OVERRIDE);
                },
                enumerable: true
            });
        } else {
            //define
            Object.defineProperty(proxy_object, property, {
                get() {
                    return storage[property];
                },
                set: typeof callback == "function" ? value => {
                    store(value);
                    callback(value);
                } : store,
                enumerable: true
            });
            function store(value) {
                storage[property] = value;
            }
        }
    }
    return proxy_object;
}