"use strict";

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

Promise.all(["bin/graph.m.c", "app/bin/2d3.m.c"].map(function (name) {
    return System["import"](name);
})).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var graphjs = _ref2[0];
    var _2d3 = _ref2[1];

    console.log("init");
    var svg = document.querySelector("svg");
    window.graph = new graphjs.Tree(true);
    var length = 100;
    for (var i = 0; i < length; ++i) {
        graph.addNode(i);
    }for (var i = 0; i < length * 2; ++i) {
        graph.addEdge(i % length, Math.floor(Math.random() * length));
    }window.d3svg = new _2d3.D3SVG(svg, graph);
})["catch"](function (e) {
    console.error(e);
});
