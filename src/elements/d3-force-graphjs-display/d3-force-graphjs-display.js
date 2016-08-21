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
        require(["../../lib/d3-force/d3-force.js"], (...args) => resolve(args));
    });
    const fetchCSS = (async() => {
        return (await fetch(document.currentScript.src + "/../d3-force-graphjs-display.css")).text();
    })();
    const STYLE_ELEMENT = document.createElement("style");
    STYLE_ELEMENT.textContent = await fetchCSS;
    const [{
        default: D3Force
    }] = await dependencies_ready;
    // asserts fulfilled
    const __private = {};
    class D3ForceGraphjsDisplay extends HTMLElement {
        createdCallback() {
            Object.defineProperties(this, {
                private: {
                    value: new WeakMap
                },
                root: {
                    value: this.createShadowRoot(),
                    enumerable: true
                }
            });
            const _private = {
                force: new D3Force,
                graphjsDisplay: document.createElement("graphjs-display")
            };
            this.private.set(__private, _private);
            this.root.appendChild(STYLE_ELEMENT.cloneNode(true));
            this.root.appendChild(_private.graphjsDisplay);
            if (this.graphjsDisplay !== _private.graphjsDisplay) {
                // cope premature assignment
                const _graphjsDisplay = this.graphjsDisplay;
                // delete own property to use prototype property
                delete this.graphjsDisplay;
                this.graphjsDisplay = _graphjsDisplay;
            }
            if (this.force !== _private.force) {
                // cope premature assignment
                const _force = this.force;
                // delete own property to use prototype property
                delete this.force;
                this.force = _force;
            }
            if (this.graph) {
                // cope premature assignment
                const _graph = this.graph;
                // delete own property to use prototype property
                delete this.graph;
                this.graph = _graph;
            }
            // link tick to drawing
            (async() => {
                while (true) {
                    await this.force.tick;
                    this.graphjsDisplay.updateGraph();
                }
            })();
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
            this.force.graph = graph;
            this.graphjsDisplay.graph = graph;
        }
    }
    // Complete Functionality Registration
    document.registerElement("d3-force-graphjs-display", D3ForceGraphjsDisplay);
})();