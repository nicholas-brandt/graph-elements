"use strict";

var _slicedToArray = function() {
    function sliceIterator(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }
    return function(arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj;
} :function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" :typeof obj;
};

var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

Object.defineProperty(exports, "__esModule", {
    value:true
});

var _mixin = require("../../node_modules/various/build/LayerJS/mixin");

var _mixin2 = _interopRequireDefault(_mixin);

var _graph = require("../graph");

var _circularJson = require("../../node_modules/circular-json/build/circular-json");

var _circularJson2 = _interopRequireDefault(_circularJson);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj :{
        "default":obj
    };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var IO = function() {
    function IO() {
        _classCallCheck(this, IO);
    }
    _createClass(IO, null, [ {
        key:"importObject",
        value:function importObject(object) {
            if ((typeof object === "undefined" ? "undefined" :_typeof(object)) != "object") throw Error("Argument is not an object!");
            var graph = new _graph.Graph(true);
            serialize(object, graph);
            return graph;
        }
    }, {
        key:"exportGraph",
        value:function exportGraph(graph) {
            var object = {
                nodes:Array.from(graph.nodes),
                edges:Array.from(graph.edges)
            };
            return object;
        }
    }, {
        key:"migrateGraph",
        value:function migrateGraph(source) {
            var target = arguments.length <= 1 || arguments[1] === undefined ? new _graph.Graph() :arguments[1];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;
            try {
                for (var _iterator = source.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2);
                    var node = _step$value[0];
                    var property_object = _step$value[1];
                    target.addNode(node);
                    (0, _mixin2.default)(target.nodes.get(node), property_object, _mixin2.default.SAFE_OVERRIDE);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;
            try {
                for (var _iterator2 = source.edges[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var edge = _step2.value;
                    target.addEdge(edge.source, edge.target, edge.weight);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
            return target;
        }
    }, {
        key:"serialize",
        value:function serialize(graph) {
            return _circularJson2.default.stringify(IO.exportGraph(graph));
        }
    }, {
        key:"deserialize",
        value:function deserialize(string) {
            return IO.migrateGraph(_circularJson2.default.parse(string));
        }
    } ]);
    return IO;
}();

exports.default = IO;

function serialize(object, graph) {
    graph.addNode(object);
    if ((typeof object === "undefined" ? "undefined" :_typeof(object)) == "object") for (var property in object) {
        try {
            var value = object[property];
            if (!graph.hasNode(value)) serialize(value, graph);
            graph.addEdge(object, value);
        } catch (e) {}
    }
}