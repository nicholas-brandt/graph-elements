define([ "exports", "module", "../external/mixin" ], function(exports, module, _externalMixin) {
    "use strict";
    var _interopRequire = function(obj) {
        return obj && obj.__esModule ? obj["default"] :obj;
    };
    module.exports = layer;
    var mixin = _interopRequire(_externalMixin);
    function layer(storage, modifier) {
        return recursive_layer(storage, modifier);
    }
    function recursive_layer(storage, modifier) {
        var path = arguments[2] === undefined ? [] :arguments[2];
        if (typeof storage != "object") throw Error("Argument is not an object");
        var layer_object = {};
        for (var property in storage) {
            (function(property) {
                var property_path = path.concat(property);
                if (typeof storage[property] == "object") Object.defineProperty(layer_object, property, {
                    get:function get() {
                        return recursive_layer(storage[property], modifier, property_path);
                    },
                    set:function set(value) {
                        mixin(getPropertyByPath(layer_object, property_path), value, false, true);
                    }
                }); else {
                    (function() {
                        var store = function(value) {
                            storage[property] = value;
                        };
                        var modify = getPropertyByPath(modifier, property_path);
                        Object.defineProperty(layer_object, property, {
                            get:function get() {
                                return storage[property];
                            },
                            set:typeof modify == "function" ? function(value) {
                                modify(value, store);
                            } :store
                        });
                    })();
                }
            })(property);
        }
        return layer_object;
    }
    function getPropertyByPath(base, path) {
        try {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
                for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var property = _step.value;
                    base = base[property];
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            return base;
        } catch (e) {}
    }
});