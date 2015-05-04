global.requestAnimationFrame = require("raf");
global.performance = {
    now: require("performance-now")
};
import transition from "../../external/transition";
import mixin from "../../external/mixin";
describe("transition", function() {
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
        const transition_object = transition(storage);
        mixin(transition_object, config, {
            weak: false,
            assign: true
        });
        setTimeout(() => {
            expect(transition_object.value).toBe(config.value);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 1100);
    });
    xit("Modifier", done => {
        const modifier = {
            value: {
                set(value, set) {
                    set(value + 1);
                },
                duration: 10
            },
            sub_object: {
                sub_value: {
                    set(value, set) {
                        set(value + 2);
                    },
                    duration: 10
                }
            }
        };
        const transition_object = transition(storage, modifier);
        mixin(transition_object, config, {
            weak: false,
            assign: true
        });
        setTimeout(() => {
            expect(transition_object.value).toBe(config.value * 2);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value * 2);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 100);
    });
    xit("Translation", done => {
        const modifier = {
            value: {
                translate() {},
                duration: 10
            },
            sub_object: {
                sub_value: {
                    translate() {},
                    duration: 10
                }
            }
        };
        const transition_object = transition(storage, modifier);
        mixin(transition_object, config, {
            weak: false,
            assign: true
        });
        setTimeout(() => {
            expect(transition_object.value).toBe(config.value);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 100);
    });
});