import Graph from "//cdn.jsdelivr.net/gh/mhelvens/graph.js/dist/graph.es6.js";

window.Graph = Graph;


// window.__graphElementsLogging = true;
// import "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-display/graph-display.js";
import "//dev.jspm.io/@polymer/paper-spinner/paper-spinner.js";
import "//dev.jspm.io/@polymer/paper-dialog/paper-dialog.js";
import "//dev.jspm.io/@polymer/paper-button/paper-button.js";
import "//dev.jspm.io/@polymer/paper-listbox/paper-listbox.js";
import "//dev.jspm.io/@polymer/polymer/lib/elements/dom-repeat.js";

import GraphDetailView from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-detail-view/graph-detail-view.js";
import GraphModifier from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-modifier/graph-modifier.js";
import GraphTracker from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-tracker/graph-tracker.js";
import GraphD3Force from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-d3-force/graph-d3-force.js";
import "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-d3-force/extensions/contextmenu.js";
import GraphContextmenu from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-contextmenu/graph-contextmenu.js";
import GraphDisplay from "//cdn.jsdelivr.net/gh/jamtis/graph-elements@master/build/elements/graph-display/graph-display.js";

import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";

const display = document.querySelector("#display");
window.display = display;
import {DOINode} from "../project/DOI_node.js";
display.Node = DOINode;
display.graph = new Graph;
display.graph.on("vertex-added", event => {
    display.dispatchEvent(new CustomEvent("graph-structure-change"));
});
display.graph.on("vertex-removed", event => {
    display.dispatchEvent(new CustomEvent("graph-structure-change"));
});

function __updateRadii() {
    const vertices = display.graph.vertices();
    for (const [key, vertex] of vertices) {
        vertex.radius = (Math.floor(Math.log2(display.graph.degree(key))) | 0) + 2;
        // console.log("d", display.graph.degree(key), vertex.radius);
    }
}
const request__updateRadii = requestAnimationFunction(__updateRadii);

const configuration = {
    alpha: 1,
    alphaDecay: 1 - .01 ** (1 / 2000),
    alphaMin: .01,
    link: {
        distance: 5,
        strength: 0.3
    },
    charge: {
        strength: -60,
        distanceMax: 1e5,
        theta: 1
    },
    gravitation: {
        strength: .02
    }
};

async function setup() {    
    display.addEventListener("graph-structure-change", request__updateRadii);

    await customElements.whenDefined("graph-display");
    
    const force = await display.addonPromises["graph-d3-force"];
    window.force = force;

    force.addEventListener("simulationstart", event => {
        console.log("sim start");
        force_indicator.active = true;
    });
    force.addEventListener("simulationend", event => {
        console.log("sim end");
        force_indicator.active = false;
    });
    // debugging
    {
        const log_updateGraph = requestAnimationFunction(time_diff => {
            console.log("graph update", time_diff);
        });
        force.addEventListener("graph-update", event => {
            log_updateGraph();
        });
        console.log("display", display);
    }

    force.configuration = configuration;

    const tracker = await display.addonPromises["graph-tracker"];
    tracker.panHandler.zoomAbs(0, 0, .05);
    tracker.panHandler.moveTo(0, 0);
}

(async () => {
    try {
        await setup();
    } catch (error) {
        console.error(error);
    }
})();
