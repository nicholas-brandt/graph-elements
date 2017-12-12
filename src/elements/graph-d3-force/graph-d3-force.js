"use strict";
import GraphExtension from "../graph-extension/graph-extension.js";
import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/7fb050585c4cb20e5e64a5ebf4639dc698aa6f02/requestAnimationFunction.js";
const default_configuration = {
    link: {
        distance: 300,
        strength: 0.02
    },
    charge: {
        strength: -40
    },
    gravitation: {
        strength: 100
    }
};
// web worker same origin policy requires host to support OPTIONS CORS
class GraphD3Force extends GraphExtension {
    constructor() {
        super();
        // intercept graph change
        const graph_descriptor = Object.getOwnPropertyDescriptor(this.__graphDisplay.constructor.prototype, "graph");
        // console.log("graph descriptor", graph_descriptor);
        Object.defineProperties(this.__graphDisplay, {
            graph: Object.assign({}, graph_descriptor, {
                set: graph => {
                    graph_descriptor.set.call(this.__graphDisplay, graph);
                    this.__graphChanged();
                }
            }),
            d3Force: {
                value: this,
                configurable: true
            }
        });
        // define own properties
        Object.defineProperties(this, {
            __worker: {
                // value: new Worker(worker_data)
                value: new Worker("data:application/javascript," + encodeURIComponent(`<!-- inject: ../../../build/elements/graph-d3-force/d3-force-worker.js -->`))
            }
        });
        this.configuration = default_configuration;
        this.__worker.addEventListener("message", requestAnimationFunction(this.__receiveForceUpdate.bind(this)));
        this.__graphChanged();
        this.attachShadow({
            mode: "open"
        });
        // migrate all children
        for (const child of this.children) {
            this.shadowRoot.appendChild(child);
        }
    }
    set configuration(configuration) {
        this.__worker.postMessage({
            configuration
        });
    }
    start() {
        this.__worker.postMessage({
            run: true
        });
    }
    stop() {
        this.__worker.postMessage({
            run: false
        });
    }
    __graphChanged() {
        const circle_objects = [...this.__graphDisplay.circles.values()];
        this.__circleObjects = circle_objects;
        const nodes = circle_objects.map(({x, y}, index) => ({x, y, index}));
        const links = [...this.__graphDisplay.paths].map(({__source, __target}) => ({
            source: circle_objects.indexOf(__source),
            target: circle_objects.indexOf(__target)
        }));
        // 32 bit * 2 * N
        const shared_buffer = new SharedArrayBuffer(nodes.length * 4 * 2);
        this.__bufferArray = new Float32Array(shared_buffer);
        this.__worker.postMessage({
            graph: {
                nodes,
                links
            },
            shared_buffer
        });
    }
    __receiveForceUpdate() {
        // console.log("received force update");
        for (let i = 0; i < this.__circleObjects.length; ++i) {
            const circle_object = this.__circleObjects[i];
            const x = this.__bufferArray[i * 2];
            const y = this.__bufferArray[i * 2 + 1];
            circle_object.x = x;
            circle_object.y = y;
            // circle_object.circle.cx.baseVal.value = x;
            // circle_object.circle.cy.baseVal.value = y;
        }
        this.__graphDisplay.__updateGraph();
    }
}
(async () => {
    try {
        // ensure d3
        if (!window.d3) {
            await new Promise(resolve => {
                Object.defineProperty(window, "d3", {
                    set(value) {
                        delete window.d3;
                        window.d3 = value;
                        setTimeout(resolve);
                    },
                    configurable: true,
                    writable: true
                    })
            });
        }
        await customElements.whenDefined("graph-display");
        customElements.define("graph-d3-force", GraphD3Force);
    } catch (error) {
        console.error(error);
    }
})();