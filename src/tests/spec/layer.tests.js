import layer from "../../external/layer";
import mixin from "../../external/mixin";
describe("layer", () => {
    let storage;
    beforeEach(() => {
        storage = {
            value: 0,
            sub_object: {
                sub_value: 1,
                sub_value2: 2
            }
        };
    });
    const config = {
        value: 1,
        sub_object: {
            sub_value: 1,
            sub_value2: 1
        },
        other_object: {
            other_value: 1
        }
    };
    it("Basic", done => {
        const layer_object = layer(storage);
        mixin(layer_object, config, {
            weak: false,
            assign: true
        });
        expect(layer_object.value).toBe(config.value);
        expect(layer_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
        expect(layer_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
        done();
    });
    it("Modifier", done => {
        const modifier = {
            value: {
                set(value, set) {
                    set(value + 1);
                }
            },
            sub_object: {
                sub_value: {
                    set(value, set) {
                        set(value + 2);
                    }
                }
            }
        }
        const layer_object = layer(storage, modifier);
        mixin(layer_object, config, {
            weak: false,
            assign: true
        });
        expect(layer_object.value).toBe(config.value + 1);
        expect(layer_object.sub_object.sub_value).toBe(config.sub_object.sub_value + 2);
        expect(layer_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
        done();
    });
});