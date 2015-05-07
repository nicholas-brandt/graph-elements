define([ "exports", "module", "../external/mixin", "../../external/circular-json.amd" ], function(exports, module, _externalMixin, _externalCircularJsonAmd) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = storage;
    var mixin = _interopRequire(_externalMixin);
    var CircularJSON = _interopRequire(_externalCircularJsonAmd);
    function storage(key, storage_object) {
        var repository = arguments[2] === undefined ? localStorage :arguments[2];
        if (typeof storage_object != "object") throw Error("{storage} is not an object");
        var root_object = {};
        var store = _storage(key, storage_object, repository, root_object, root_object);
        try {
            mixin(store, CircularJSON.parse(repository[key]), mixin.OVERRIDE);
        } catch (e) {
            console.error(e);
        }
        return store;
    }
    function _storage(key, storage_object, repository, layer_object, root_object) {
        if (typeof storage_object != "object") throw Error("{storage} is not an object");
        for (var property in storage_object) {
            (function(property) {
                if (typeof storage_object[property] == "object") {
                    (function() {
                        var object = _storage(key, storage_object[property], repository, {}, root_object);
                        Object.defineProperty(layer_object, property, {
                            get:function get() {
                                return object;
                            },
                            set:function set(value) {
                                mixin(object, value, {
                                    weak:false,
                                    assign:true
                                });
                            },
                            enumerable:true
                        });
                    })();
                } else {
                    Object.defineProperty(layer_object, property, {
                        get:function get() {
                            return storage_object[property];
                        },
                        set:function set(value) {
                            if (property in storage_object) {
                                storage_object[property] = value;
                                repository[key] = CircularJSON.stringify(root_object);
                            }
                        },
                        enumerable:true
                    });
                }
            })(property);
        }
        return layer_object;
    }
});