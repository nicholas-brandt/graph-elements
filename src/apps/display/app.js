{
    // require bootstrap
    if (window.require) {
        init();
    } else {
        const descriptor = Object.getOwnPropertyDescriptor(window, "require");
        const setter = descriptor && descriptor.set;
        Object.defineProperty(window, "require", {
            set(_require) {
                if (setter) {
                    setter(_require);
                } else {
                    delete window.require;
                    window.require = _require;
                }
                setTimeout(init, 0);
            },
            configurable: true
        });
    }
    // init function when require is provided
    async function init() {
        let _resolve;
        const dependencies_promise = new Promise(resolve => {
            _resolve = resolve;
        });
        require(["../../lib/undirected/AcyclicUndirectedGraph.js", "../../lib/d3-force/d3-force.js"], _resolve);
        const [{
            default: AcyclicUndirectedGraph
        }, {
            default: D3Force
        }] = await dependencies_promise;
        const graph = new AcyclicUndirectedGraph;
        window.graph = graph;
        for (let i = 0; i < 100; ++i) {
            graph.addNode({
                x: Math.random() * 500,
                y: Math.random() * 500,
                radius: 10,
                index: i
            });
        }
        const nodes = [...graph.keys()];
        for (let i = 0; i < 300; ++i) {
            graph.addLink(nodes[Math.floor(Math.random() * nodes.length)], nodes[Math.floor(Math.random() * nodes.length)]);
        }
        const display = document.querySelector("graphjs-display");
        window.display = display;
        display.graph = graph;
        const d3_force = new D3Force;
        d3_force.configuration = {
            link: {
                distance: 80
            },
            charge: -70,
            alpha: 2,
            alphaTarget: 0
        };
        d3_force.graph = graph;
        d3_force.start();
        window.d3_force = d3_force;
        while (true) {
            await d3_force.tick;
            console.log("ticked");
            display.updateGraph();
        }
    }
}