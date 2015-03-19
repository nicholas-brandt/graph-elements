export const D3SVG = (function() {
    const $force = Symbol();
    const $nodes = Symbol();
    const $intermediates = Symbol();
    const $edges = Symbol();
    const $links = Symbol();
    const $dom_svg = Symbol();
    const $graph = Symbol();
    /**
     * @class User interface
     * Displays the data of the given graph.
     * */
    return class D3SVG {
        constructor(dom_svg, graph, options = {}) {
            if (!graph) throw Error("No graph specified");
            this[$graph] = graph;
            const {linkDistance = 10, linkStrength = 3} = options;
            this[$nodes] = [];
            this[$edges] = [];
            this[$intermediates] = [];
            this[$links] = [];
            this[$dom_svg] = dom_svg;
            this[$force] = d3.layout.force().linkDistance(linkDistance).linkStrength(linkStrength);
            const svg = d3.select(dom_svg);
            svg.selectAll("circle").data(this[$nodes]).enter().append("circle").attr("r", 5).call(this[$force].drag);
            svg.selectAll("path").data(this[$edges]).enter().append("path");
            this[$force].on("tick", () => {
                edges.attr("d", ([source, intermediate, target]) => ("M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y));
                nodes.attr("transform", node => ("translate(" + node.x + "," + node.y + ")"));
            });
            this.update();
        }
        update() {
            const nodes = this[$nodes];
            nodes.length = 0;
            const edges = this[$edges];
            edges.length = 0;
            const intermediates = this[$intermediates];
            intermediates.length = 0;
            const links = this[$links];
            links.length = 0;
            for (let node of this[$graph].nodes.keys()) nodes.push({
                value: node
            });
            for (let [source_node, target_node] of this[$graph].edges) {
                const source = {
                    value: source_node
                };
                const target = {
                    value: target_node
                };
                const intermediate = {};
                intermediates.push(intermediate);
                edges.push({
                    source: source,
                    target: intermediate
                }, {
                    source: intermediate,
                    target: target
                });
                links.push([source, intermediate, target]);
            }
            const {width, height} = getComputedStyle(this[$dom_svg]);
            this[$force].size([parseInt(width), parseInt(height)]);
            this[$force].nodes(nodes.concat(intermediates)).links(links).start();
        }
        get graph() {
            return this[$graph];
        }
    };
})();