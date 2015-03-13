export const D3SVG = (function() {
    const $force = Symbol();
    const $forced = Symbol();
    const $drawn = Symbol();
    const $dom_svg = Symbol();
    const $graph = Symbol();
    return class D3SVG {
        constructor(dom_svg, graph, {linkDistance = 10, linkStrength = 3}) {
            if (!graph) throw Error("No graph specified");
            this[$forced] = {
                nodes: [],
                edges: []
            };
            this[$drawn] = {
                nodes: [],
                edges: []
            };
            this[$dom_svg] = dom_svg;
            this[$force] = d3.layout.force().linkDistance(linkDistance).linkStrength(linkStrength);
            const svg = d3.select(dom_svg);
            const nodes = svg.selectAll("circle").data(this[$drawn].nodes).enter().append("circle").attr("r", 5).call(this[$force].drag);
            const edges = svg.selectAll("path").data(this[$drawn].edges).enter().append("path");
            this[$force].on("tick", () => {
                edges.attr("d", ([source, intermediate, target]) => ("M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y));
                nodes.attr("transform", node => ("translate(" + node.x + "," + node.y + ")"));
            });
        }
        update() {
            const node_map = new Map;
            for (let node of graph.nodes.keys()) node_map.set(node, {
                value: node
            });
            const nodes = [for ([, node] of node_map) node];
            for (let [source_node, target_node] of graph.edges) {
                const source = node_map.get(source_node);
                const target = node_map.get(target_node);
                const intermediate = {};
                nodes.push(intermediate);
                edges.push({
                    source: source,
                    target: intermediate
                }, {
                    source: intermediate,
                    target: target
                });
                links.push([source, intermediate, target]);
            }
            this[$drawn].nodes .clear();
            const {width, height} = getComputedStyle(this[$dom_svg]);
            this[$force].size([parseInt(width), parseInt(height)]);
            force.nodes(this[$forced].nodes).links(this[$forced].edges).start();
        }
        get graph() {
            return this[$graph];
        }
    };
})();