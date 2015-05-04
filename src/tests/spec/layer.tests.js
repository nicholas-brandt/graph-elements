import layer from "../../external/layer";
import mixin from "../../external/mixin";
describe("layer", function() {
    let storage;
    beforeEach(() => {
        storage = {
            value: 0,
            sub_object: {
                sub_value: 0,
                sub_value2: 0
            }
        };
    });
    const value = {
        value: 1,
        sub_object: {
            sub_value: 1,
            sub_value2: 1
        },
        other_object: {
            other_value: 1
        }
    };
    it("Basic", () => {
        const layer_object = layer(storage);
        mixin(layer_object, value, false, true);
        expect(layer_object.value).toBe(storage.value);
        expect(layer_object.sub_object.sub_value).toBe(storage.sub_object.sub_value);
        expect(layer_object.sub_object.sub_value2).toBe(storage.sub_object.sub_value2);
    });
    it("Modifier", () => {
        const modifier = {
            value: {
                set(value, set) {
                    set(value * 2);
                }
            },
            sub_object: {
                sub_value: {
                    set(value, set) {
                        set(value * 2);
                    }
                }
            }
        }
        const layer_object = layer(storage, modifier);
        mixin(layer_object, value, false, true);
        expect(layer_object.value).toBe(value.value * 2);
        expect(layer_object.sub_object.sub_value).toBe(value.sub_object.sub_value * 2);
        expect(layer_object.sub_object.sub_value2).toBe(value.sub_object.sub_value2);
    });
});