/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin"
import requestAnimationFunction from "../external/requestAnimationFunction";
const default_duration = 1000;
export default function transition(storage, modifier) {
    if (typeof storage != "object") throw Error("Argument is not an object");
    if (!modifier || typeof modifier != "object") modifier = {};
    const layer_object = {};
    for (let property in storage) {
        const modify = modifier[property];
        if (typeof storage[property] == "object") {
            const object = transition(storage[property], modify);
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
            let update;
            let duration;
            try {
                const { get, set, translate } = modify;
                const _duration = Math.max(0, modify.duration);
                if (!isNaN(_duration) && _duration !== Infinity) duration = _duration;
                if (typeof translate == "function")
                    update = requestAnimationFunction((begin, target_value, value_diff) => {
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
                if (typeof set == "function")
                    setter = function(value) {
                        set(value, setTargetValue);
                    };
                if (typeof get == "function")
                    getter = function() {
                        return get(storage[property]);
                    };
            } catch (e) {}
            if (!getter)
                getter = function() {
                    return storage[property];
                };
            if (duration === undefined) duration = default_duration;
            if (!update)
                update = requestAnimationFunction((begin, target_value, value_diff) => {
                    const relativ_time_diff = (performance.now() - begin) / duration - 1;
                    if (relativ_time_diff >= 0) store(target_value);
                    else {
                        store(target_value + value_diff * relativ_time_diff);
                        update();
                    }
                });
            if (!setter) setter = setTargetValue;
            Object.defineProperty(layer_object, property, {
                get: getter,
                set: setter,
                enumerable: true
            });
            
            function store(value) {
                storage[property] = value;
            }
            function setTargetValue(target_value) {
                let begin = performance.now();
                let value_diff = target_value - getter();
                update(begin, target_value, value_diff);
            }
        }
    }
    return layer_object;
}