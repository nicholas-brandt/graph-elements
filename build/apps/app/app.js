define(["../../lib/graph.js"], function (_graph) {
    "use strict";

    const graph = new _graph.Graph();
    for (let i = 0; i < 100; ++i) {
        graph.addNode({
            x: Math.random() * 500,
            y: Math.random() * 500,
            radius: 10
        });
    }
    const nodes = Array.from(graph.nodes.keys());
    for (let i = 0; i < 100; ++i) {
        graph.addEdge(nodes[Math.floor(Math.random() * nodes.length)], nodes[Math.floor(Math.random() * nodes.length)]);
    }
    if (window.Polymer) initialize();else addEventListener("WebComponentsReady", initialize);

    function initialize() {
        window.display = document.querySelector("graphjs-display");
        display.graph = graph;
        window.force = d3.layout.force().nodes(display.nodes).links(display.edges).size([1000, 1000]);
        inflate();
        window.inflate = inflate;
        window.deflate = deflate;

        function inflate() {
            force.linkStrength(0.1);
            force.linkDistance(0);
            force.charge(-6000);
            force.gravity(0.1);
            force.friction(0.5);
            const alpha = force.alpha();
            force.stop();
            if (alpha > 0) force.alpha(alpha);else force.start();
            update();

            function update() {
                requestAnimationFrame(() => {
                    display.notifyPath("nodes.0.x", display.nodes[0].x);
                    const alpha = force.alpha();
                    if (alpha < 0.03) {
                        force.stop();
                        deflate(alpha);
                    } else if (force.alpha() > 0) update();
                });
            }
        }

        function deflate(alpha = 0.03) {
            force.linkStrength(10);
            force.linkDistance(60);
            force.charge(-6000);
            force.gravity(2);
            force.friction(0.9);
            force.start();
            force.alpha(alpha);
            update();

            function update() {
                requestAnimationFrame(() => {
                    display.notifyPath("nodes.0.x", display.nodes[0].x);
                    if (force.alpha() > 0) update();
                });
            }
        }
    }
});
