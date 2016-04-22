import ConditionedGraph from "./conditioned-graph.js";

const $maxInLinks = Symbol();
const $maxOutLinks = Symbol();

/**
 * @class MaxLinkGraph
 * A class implementing graphs with maximal IO links.
 * */
export default class MaxLinkGraph extends ConditionedGraph {
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