define(["exports", "./acyclic-graph.js"], function (exports, _acyclicGraph) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _acyclicGraph2 = _interopRequireDefault(_acyclicGraph);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * @class Tree
     * A class implementing trees.
     * #Following https://en.wikipedia.org/wiki/Tree_%28graph_theory%29
     * Must not be connected!
     * */
    class InTree extends _acyclicGraph2.default {
        set directed(directed) {}
        get directed() {
            return true;
        }
        preCondition(source) {
            return this.get(source).out === 0;
        }
    }
    exports.default = InTree;
});
