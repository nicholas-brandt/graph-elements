import DirectedGraph from "./DirectedGraph.js";
export default class UndirectedGraoh extends DirectedGraph {
    /**
     * @function addLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @param {any} meta_data - The meta data of the link
     * @return {boolean} - Whether the object has been removed from the graph.
     * */
    addLink(source, target, meta_data) {
        const source_relations = this.get(source);
        const target_relations = this.get(target);
        if (source_relations && target_relations) {
            const link = new UndirectedLink(source, target, meta_data);
            source_relations.targets.set(target, link);
            target_relations.sources.set(source, link);
            source_relations.sources.set(target, link);
            target_relations.targets.set(source, link);
            return true;
        }
        return false;
    }
    /**
     * @function addLinks
     * @param {Iterable} links - An Iterable of links to be added
     * @returns {Boolean} - Whether all links have been added.
     * */
    addLinks(...links) {
        if (links.length <= 1) {
            links = links[0];
        }
        let success = true;
        for (let {source, target, metaData} of links) {
            if (!this.addLink(source, target, metaData)) {
                success = false;
            }
        }
        return success;
    }
    /**
     * @function removeLink
     * @param {any} source - The source node
     * @param {any} target - The target node
     * @return {boolean} - Whether the link has been removed from the graph.
     * */
    removeLink(source, target) {
        return super.removeLink(source, target) && super.removeLink(target, source);
    }
    /**
     * @function removeLinks
     * @param {Iterable} links - An Iterable of links to be removed
     * @return {boolean} - Whether all links has been removed from the graph.
     * */
    removeLinks(...links) {
        if (arguments.length <= 1) links = links[0];
        let success = true;
        for (let {source, target, metaData} of links) {
            if (!this.removeLink(source, target)) {
                success = false;
            }
        }
        return success;
    }
    /**
     * @function hasCycle
     * @return {boolean} - Whether the graph has a cycle.
     * Deep first search.
     * */
    hasCycle() {
        const finished = new Set;
        const visited = new Set;
        const search = (start_relations, referrer_relations) => {
            visited.add(start_relations);
            for (let [target] of start_relations.targets) {
                const target_relations = this.get(target);
                if (target_relations === referrer_relations) {
                    continue;
                }
                if (visited.has(target_relations)) {
                    return true;
                }
                if (search(target_relations, start_relations)) {
                    return true;
                }
            }
        };
        for (let [, relations] of this) {
            if (finished.has(relations)) continue;
            if (search(relations)) return true;
            finished.add(...visited);
            visited.clear();
        }
        return false;
    }
}
/**
 * @class UndirectedLink
 * A helper class.
 * Represents a undirected link between two nodes.
 * */
class UndirectedLink {
    constructor(node1, node2, meta_data = null) {
        Object.defineProperties(this, {
            nodes: {
                value: new Set([node1, node2]),
                enumerable: true
            },
            metaData: {
                value: meta_data,
                enumerable: true,
                writeable: true
            }
        });
    }
}