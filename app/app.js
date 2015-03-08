"use strict";
System.import("bin/graph.c").then(function(graphjs) {
    const width = 1000;
    const height = 500;
    const force = d3.layout.force().linkDistance(10).linkStrength(2).size([width, height]);
    const svg = d3.select("svg").attr("width", width).attr("height", height);
    console.log(svg);
    const length = 100;
    const nodes = [];
    for (let i = 0; i < length; ++i) nodes.push({
        id: i
    });
    const edges = [];
    const bilinks = [];
    const intermediates = [];
    for (let i = 0; i < length * 1.1; ++i) {
        const source = nodes[i % length];
        const target = nodes[Math.floor(Math.random() * length)];
        const intermediate = {};
        intermediates.push(intermediate);
        edges.push({
            source: source,
            target: intermediate
        }, {
            source: intermediate,
            target: target
        });
        bilinks.push([source, intermediate, target]);
    }
    force.nodes(nodes.concat(intermediates)).links(edges).start();
    var edge = svg.selectAll("path").data(bilinks).enter().append("path");
    var node = svg.selectAll("circle").data(nodes).enter().append("circle").attr("r", 5).call(force.drag);
    force.on("tick", function() {
        edge.attr("d", function(d) {
            return "M" + d[0].x + "," + d[0].y + "S" + d[1].x + "," + d[1].y + " " + d[2].x + "," + d[2].y;
        });
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
})["catch"](function(e) {
    console.error(e);
});