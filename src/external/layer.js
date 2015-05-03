/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import mixin from "../external/mixin";
export default function layer(storage, modifier) {
    return recursive_layer(storage, modifier);
}
    
function recursive_layer(storage, modifier, path = []) {
    if (typeof storage != "object") throw Error("Argument is not an object");
    const layer_object = {};
    for (let property in storage) {
        const property_path = path.concat(property);
        if (typeof storage[property] == "object") Object.defineProperty(layer_object, property, {
                get: function() {
                    return recursive_layer(storage[property], modifier, property_path);
                },
                set: function(value) {
                    mixin(getPropertyByPath(layer_object, property_path), value, false, true);
                }
            });
        else {
            const modify = getPropertyByPath(modifier, property_path);
            Object.defineProperty(layer_object, property, {
                get: function() {
                    return storage[property];
                },
                set: typeof modify == "function" ? function(value) {
                    modify(value, store);
                } : store
            });
            
            function store(value) {
                storage[property] = value;
            }
        }
    }
    return layer_object;
}

function getPropertyByPath(base, path) {
    try {
        for (let property of path) base = base[property];
        return base;
    } catch (e) {}
}