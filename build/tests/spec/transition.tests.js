"use strict";

var _interopRequire = function(obj) {
    return obj && obj.__esModule ? obj["default"] :obj;
};

global.requestAnimationFrame = require("raf");

global.performance = {
    now:require("performance-now")
};

var transition = _interopRequire(require("../../external/transition"));

var mixin = _interopRequire(require("../../external/mixin"));

describe("transition", function() {
    var storage = undefined;
    beforeEach(function() {
        storage = {
            value:0,
            sub_object:{
                sub_value:0,
                sub_value2:0
            }
        };
    });
    var config = {
        value:1,
        sub_object:{
            sub_value:1,
            sub_value2:1
        },
        other_object:{
            other_value:1
        }
    };
    it("Basic", function(done) {
        var transition_object = transition(storage);
        mixin(transition_object, config, {
            weak:false,
            assign:true
        });
        setTimeout(function() {
            expect(transition_object.value).toBe(config.value);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 1100);
    });
    xit("Modifier", function(done) {
        var modifier = {
            value:{
                set:function(_set) {
                    var _setWrapper = function set(_x, _x2) {
                        return _set.apply(this, arguments);
                    };
                    _setWrapper.toString = function() {
                        return _set.toString();
                    };
                    return _setWrapper;
                }(function(value, set) {
                    set(value + 1);
                }),
                duration:10
            },
            sub_object:{
                sub_value:{
                    set:function(_set) {
                        var _setWrapper = function set(_x, _x2) {
                            return _set.apply(this, arguments);
                        };
                        _setWrapper.toString = function() {
                            return _set.toString();
                        };
                        return _setWrapper;
                    }(function(value, set) {
                        set(value + 2);
                    }),
                    duration:10
                }
            }
        };
        var transition_object = transition(storage, modifier);
        mixin(transition_object, config, {
            weak:false,
            assign:true
        });
        setTimeout(function() {
            expect(transition_object.value).toBe(config.value * 2);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value * 2);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 100);
    });
    xit("Translation", function(done) {
        var modifier = {
            value:{
                translate:function translate() {},
                duration:10
            },
            sub_object:{
                sub_value:{
                    translate:function translate() {},
                    duration:10
                }
            }
        };
        var transition_object = transition(storage, modifier);
        mixin(transition_object, config, {
            weak:false,
            assign:true
        });
        setTimeout(function() {
            expect(transition_object.value).toBe(config.value);
            expect(transition_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
            expect(transition_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
            done();
        }, 100);
    });
});