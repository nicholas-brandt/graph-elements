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
        require(["../../lib/d3-force/d3-force.js", "../../lib/jamtis/requestAnimationFunction.js", "../../lib/early-element/early-element.js"], (...args) => resolve(args));
    });
    const style_ready = (async () => {
        const style = document.createElement("style");
        style.textContent = await (await fetch(document.currentScript.src + "/../d3-force-graphjs-display.css")).text();
        return style;
    })();
    const [{
        default: D3Force
    }, {
        default: requestAnimationFunction
    }, {
        default: EarlyElement
    }] = await dependencies_ready;
    // asserts fulfilled
    const __private = {};
    class D3ForceGraphjsDisplay extends EarlyElement {
        createdCallback() {
            Object.defineProperties(this, {
                private: {
                    value: new WeakMap
                },
                root: {
                    value: this.attachShadow({
                        mode: "open"
                    }),
                    enumerable: true
                }
            });
            const _private = {
                force: new D3Force,
                graphjsDisplay: document.createElement("graphjs-display")
            };
            this.private.set(__private, _private);
            (async () => {
                const style = await style_ready;
                this.root.appendChild(style.cloneNode(true)); 
            })();
            this.root.appendChild(_private.graphjsDisplay);
            // check for assignments before registration
            this.adoptProperties();
            // link tick to drawing
            (async() => {
                while (true) {
                    await this.force.tick;
                    this.graphjsDisplay.updateGraph();
                }
            })();
            this.graphjsDisplay.addEventListener("track", requestAnimationFunction(event => {
                // use instance force
                // update graph on force
                this.force.graph = _private.graph;
            }));
            // fire update-event
            this.dispatchEvent(new CustomEvent("update"));
        }
        get force() {
            return this.private.get(__private).force;
        }
        set force(force) {
            Object.assign(this.private.get(__private).force, force);
        }
        get graphjsDisplay() {
            return this.private.get(__private).graphjsDisplay;
        }
        set graphjsDisplay(graphjsDisplay) {
            Object.assign(this.private.get(__private).graphjsDisplay, graphjsDisplay);
        }
        set graph(graph) {
            this.private.get(__private).graph = graph;
            this.force.graph = graph;
            this.graphjsDisplay.graph = graph;
        }
    }
    // Complete Functionality Registration
    document.registerElement("d3-force-graphjs-display", D3ForceGraphjsDisplay);
})();