/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../../node_modules/various/build/LayerJS/mixin";
import requestAnimationFunction from "../../node_modules/various/build/requestAnimationFunction";
const default_duration = 1000;
export default function layer(storage, modifier, global_change_callback) {
    if (typeof storage != "object") throw Error("{storage} is not an object");
    if (!modifier || typeof modifier != "object") modifier = {};
    if (typeof global_change_callback != "function") global_change_callback = undefined;
    const layer_object = {};
    for (let property in storage) {
        const modify = modifier[property];
        if (typeof storage[property] == "object") {
            const object = layer(storage[property], modify, global_change_callback);
            Object.defineProperty(layer_object, property, {
                get() {
                    return object;
                },
                set(value) {
                    mixin(object, value, mixin.OVERRIDE);
                },
                enumerable: true
            });
        } else {
            const store = global_change_callback ? value => {
                storage[property] = value;
                global_change_callback();
            } : value => {
                storage[property] = value;
            };
            let set_callback;
            let { get, set, translate, duration } = mixin({}, modify);
            if (duration === undefined) duration = default_duration;
            else if (duration <= 0 || duration == Infinity) duration = undefined;
            const hasTransition = duration && typeof translate == "function";
            //setup
            const getter = typeof get == "function" ? () => get(storage[property]) : () => storage[property];
            let setter;
            let hasSet = typeof set == "function";
            if (hasTransition) {
                const set_callback = target_value => {
                    update(performance.now(), target_value, target_value - getter());
                };
                setter = hasSet ? value => {
                    set(value, set_callback)
                } : set_callback;
                const update = requestAnimationFunction((begin, target_value, value_diff) => {
                    const relativ_time_diff = (performance.now() - begin) / duration - 1;
                    if (relativ_time_diff >= 0) {
                        store(target_value);
                        translate(target_value);
                    } else {
                        const new_value = target_value + value_diff * relativ_time_diff;
                        store(new_value);
                        translate(new_value);
                        update();
                    }
                });
            } else
                setter = hasSet ? value => {
                    set(value, store);
                } : store;
            //define
            Object.defineProperty(layer_object, property, {
                get: getter,
                set: setter,
                enumerable: true
            });
        }
    }
    return layer_object;
}