"use strict";

var _interopRequire = function(obj) {
    return obj && obj.__esModule ? obj["default"] :obj;
};

var layer = _interopRequire(require("../../external/layer"));

var mixin = _interopRequire(require("../../external/mixin"));

describe("layer", function() {
    var storage = undefined;
    beforeEach(function() {
        storage = {
            value:0,
            sub_object:{
                sub_value:1,
                sub_value2:2
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
        var layer_object = layer(storage);
        mixin(layer_object, config, {
            weak:false,
            assign:true
        });
        expect(layer_object.value).toBe(config.value);
        expect(layer_object.sub_object.sub_value).toBe(config.sub_object.sub_value);
        expect(layer_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
        done();
    });
    it("Modifier", function(done) {
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
                })
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
                    })
                }
            }
        };
        var layer_object = layer(storage, modifier);
        mixin(layer_object, config, {
            weak:false,
            assign:true
        });
        expect(layer_object.value).toBe(config.value + 1);
        expect(layer_object.sub_object.sub_value).toBe(config.sub_object.sub_value + 2);
        expect(layer_object.sub_object.sub_value2).toBe(config.sub_object.sub_value2);
        done();
    });
});