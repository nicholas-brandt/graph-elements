define(["exports", "./conditioned-graph.js"], function (exports, _conditionedGraph) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _conditionedGraph2 = _interopRequireDefault(_conditionedGraph);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    const $maxInLinks = Symbol();
    const $maxOutLinks = Symbol();

    /**
     * @class MaxLinkGraph
     * A class implementing graphs with maximal IO links.
     * */
    class MaxLinkGraph extends _conditionedGraph2.default {
        set maxInLinks(max_in_links) {
            this[$maxInLinks] = Math.max(0, parseInt(max_in_links));
        }
        get maxInLinks() {
            return this[$maxInLinks] || 1;
        }
        set maxOutLinks(max_out_links) {
            this[$maxOutLinks] = Math.max(0, parseInt(max_out_links));
        }
        get maxOutLinks() {
            return this[$maxOutLinks] || 1;
        }
        preCondition(source, target) {
            return this.get(target).in < this.maxInLinks && this.get(source).out < this.maxOutLinks;
        }
    }
    exports.default = MaxLinkGraph;
});
