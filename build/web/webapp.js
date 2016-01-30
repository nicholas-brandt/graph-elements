"use strict";

var graph = document.querySelector("graphjs-graph");

if (!graph) addEventListener("WebComponentsReady", function() {
    graph = document.querySelector("graphjs-graph");
});

var template = document.querySelector("template#loading");

template._onIssueResponse = function() {
    event.preventDefault();
    event.cancelBubble = true;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;
    try {
        for (var _iterator = event.srcElement.lastResponse[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var issue = _step.value;
            graph.addNode({
                value:issue,
                x:Math.random() * 1e3,
                y:Math.random() * 1e3,
                radius:15
            });
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
};

template._onCommentsResponse = function(item) {
    event.preventDefault();
    event.cancelBubble = true;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;
    try {
        for (var _iterator2 = event.srcElement.lastResponse[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var comment = _step2.value;
            var node = {
                value:comment,
                x:Math.random() * 1e3,
                y:Math.random() * 1e3,
                radius:15
            };
            graph.addNode(node);
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
};