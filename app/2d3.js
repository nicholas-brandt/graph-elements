export class D3SVG {
    constructor(svg, graph) {
        const computed = getComputedStyle(svg);
        const force = d3.layout.force().linkDistance(10).linkStrength(3).size([parseInt(computed.width), parseInt(computed.height)]);
        const svg = d3.select(svg);
        const node_map = new Map;
        for (let node of graph.nodes.keys()) node_map.set(node, {
            value: node
        });
        const nodes = [for ([, node] of node_map) node];
        const edges = [];
        const links = [];
        const intermediates = [];
        for (let [source_node, target_node] of graph.edges) {
            const source = node_map.get(source_node);
            const target = node_map.get(target_node);
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
        force.nodes(nodes.concat(intermediates)).links(edges).start();
        var edge = svg.selectAll("path").data(links).enter().append("path");
        var node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("r", 5).call(force.drag);
        force.on("tick", () => {
            edge.attr("d", ([source, intermediate, target]) => ("M" + source.x + "," + source.y + "S" + intermediate.x + "," + intermediate.y + " " + target.x + "," + target.y));
            node.attr("transform", node => ("translate(" + node.x + "," + node.y + ")"));
        });
    }
}