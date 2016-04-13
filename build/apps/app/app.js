"use strict";

var _graph = require("../../lib/graph.js");

var _graph2 = _interopRequireDefault(_graph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const graph = new _graph2.default();
for (let i = 0; i < 10; ++i) {
    graph.addNode({
        x: Math.random() * 10,
        y: Math.random() * 10,
        radius: 1
    });
}
if (window.Polymer) initialize();else addEventListener("WebComponentsReady", initialize);

function initialize() {
    window.display = document.querySelector("graphjs-display");
    display.graph = graph;
}
