/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin";
import CircularJSON from "../../external/circular-json.amd";
export default function storage(key, storage_object, repository = localStorage) {
    if (typeof storage_object != "object") throw Error("{storage} is not an object");
    const root_object = {};
    const store = _storage(key, storage_object, repository, root_object, root_object);
    try {
        mixin(store, CircularJSON.parse(repository[key]), mixin.OVERRIDE);
    } catch (e) {
        console.error(e);
    }
    return store;
}
function _storage(key, storage_object, repository, layer_object, root_object) {
    if (typeof storage_object != "object") throw Error("{storage} is not an object");
    for (let property in storage_object) {
        if (typeof storage_object[property] == "object") {
            const object = _storage(key, storage_object[property], repository, {}, root_object);
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
            //define
            Object.defineProperty(layer_object, property, {
                get() {
                    return storage_object[property];
                },
                set(value) {
                    if (property in storage_object) {
                        storage_object[property] = value;
                        repository[key] = CircularJSON.stringify(root_object);
                    }
                },
                enumerable: true
            });
        }
    }
    return layer_object;
}