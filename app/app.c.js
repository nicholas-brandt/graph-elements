"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

Promise.all(["bin/graph.c", "app/2d3.c"].map(function (name) {
    return System["import"](name);
})).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var graphjs = _ref2[0];
    var _2d3 = _ref2[1];

    var svg = document.querySelector("svg");
    var graph = new graphjs.Graph(true);
    var length = 300;
    for (var i = 0; i < length; ++i) {
        graph.addNode(i);
    }for (var i = 0; i < length; ++i) {
        graph.addEdge(i % length, (i + 1) % length);
    }var d3svg = new _2d3.D3SVG(svg, graph);
})["catch"](function (e) {
    console.error(e);
});
