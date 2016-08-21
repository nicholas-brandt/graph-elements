(async() => {
    const require_ready = new Promise(resolve => {
        // require bootstrap
        if (window.require) {
            resolve();
        } else {
            const descriptor = Object.getOwnPropertyDescriptor(window, "require");
            const setter = descriptor && descriptor.set;
            Object.defineProperty(window, "require", {
                set(require) {
                    if (setter) {
                        setter(require);
                    } else {
                        delete window.require;
                        window.require = require;
                    }
                    setTimeout(resolve, 0);
                },
                configurable: true
            });
        }
    });
    const dependencies_ready = new Promise(async resolve => {
        await require_ready;
        require(["../../lib/graph/AcyclicUndirectedGraph.js"], (...args) => resolve(args));
    });
    const [{
        default: AcyclicUndirectedGraph
    }] = await dependencies_ready;
    // asserts fulfilled
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
    const display = document.querySelector("d3-force-graphjs-display");
    window.display = display;
    // top level assignment is copable
    display.graph = graph;
})();