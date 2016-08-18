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
        let resolve;
        const dependencies_promise = new Promise(_resolve => {
            resolve = _resolve;
        });
        // require(["../../lib/static-analysis/toGraph.js", "../../lib/graph/Serialization.js"], _resolve);
        require(["../../lib/static-analysis/toGraph.js", "../../lib/graph/Serialization.js"], (...args) => {
            resolve(args);
        });
        const [{
            default: StaticAnalysis
        }, {
            default: DirectedGraph
        }] = await dependencies_promise;
        window.analyze = code => {
            const scope = StaticAnalysis.analyze(code);
            const graph = StaticAnalysis.toGraph(scope);
            console.log(graph.stringify());
        };
    }
}