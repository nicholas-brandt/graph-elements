// window.__graphElementsLogging = true;

import "//dev.jspm.io/@vaadin/vaadin-progress-bar/vaadin-progress-bar.js";

// import "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-display/graph-display.js";
import "//dev.jspm.io/@polymer/paper-spinner/paper-spinner.js";
import "//dev.jspm.io/@polymer/paper-dialog/paper-dialog.js";
import "//dev.jspm.io/@polymer/paper-button/paper-button.js";
import "//dev.jspm.io/@polymer/paper-listbox/paper-listbox.js";
import "//dev.jspm.io/@polymer/polymer/lib/elements/dom-repeat.js";

import Project from "./project.js";
import {DOINode} from "./DOI_node.js";

import GraphDetailView from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-detail-view/graph-detail-view.js";
import GraphModifier from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-modifier/graph-modifier.js";
import GraphTracker from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-tracker/graph-tracker.js";
import GraphD3Force from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-d3-force/graph-d3-force.js";
import "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-d3-force/extensions/contextmenu.js";
import GraphContextmenu from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-contextmenu/graph-contextmenu.js";
import GraphDisplay from "//cdn.jsdelivr.net/npm/graph-elements@5.8.1/build/elements/graph-display/graph-display.js";

import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";

const initial_dois = [// "10.1007/978-3-662-44381-1_21", // IOZ14
                      // "10.1007/978-3-540-85174-5_32", // Kilian88
                      // "10.1007/3-540-46885-4_17", // Crepeau90
                      // "10.1007/978-3-642-28914-9_2", // IOS12
                      // "10.1007/s00145-004-0150-y", // FGMO04
                      // "10.1145/62212.62213", // BGW88
                      // "10.1186/1756-8722-6-59", // opencitations example
                      // "10.1007/978-3-642-36594-2_27", // KMTZ13
                      // "10.1007/978-3-540-85174-5_32" // IPS08
                      ];

const project = new Project(initial_dois);
window.project = project;

const display = document.querySelector("#display");
window.display = display;
display.Node = DOINode;
project.on("vertex-added", requestAnimationFunction(event => {
    display.dispatchEvent(new CustomEvent("graph-structure-change"));
}));
project.on("vertex-removed", requestAnimationFunction(event => {
    display.dispatchEvent(new CustomEvent("graph-structure-change"));
}));

function __updateRadii() {
    const vertices = project.vertices();
    for (const [key, vertex] of vertices) {
        vertex.radius = (Math.floor(Math.log2(project.degree(key))) | 0) + 2;
        // console.log("d", project.degree(key), vertex.radius);
    }
}
const request__updateRadii = requestAnimationFunction(__updateRadii);

const progress_bar = document.querySelector("#progress-bar");

const force_indicator = document.querySelector("#force-indicator");

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

const doi_search = document.querySelector("#doi-search");
const initial_doi_input = document.querySelector("#initial-doi");
const citation_level_input = document.querySelector("#citation-level");

async function setup() {
    try {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.register("./service-worker.js");
        }
    } catch (error) {
        // non-critical error
        console.error(error);
    }
    
    project.meta.addEventListener("meta-change", event => {
        progress_bar.value = project.metaCount / project.citations.size;
    });
    
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
    display.graph = project;

    const tracker = await display.addonPromises["graph-tracker"];
    tracker.panHandler.zoomAbs(0, 0, .05);
    tracker.panHandler.moveTo(0, 0);
}

async function getInitialConfig() {
    return await new Promise(resolve => {
        doi_search.addEventListener("opened-changed", event => {
            if (!doi_search.opened && initial_doi_input.value) {
                resolve({
                    doi: initial_doi_input.value,
                    citation_level: citation_level_input.value
                });
            } else {
                doi_search.open();
            }
        });
    });
}

(async () => {
    try {
        await setup();
    } catch (error) {
        console.error(error);
    }
    try {
        const {
            doi,
            citation_level
        } = await getInitialConfig();
        project.__addRootDOI(doi);
        display.graph = project;
        const citations_promise = project.loadCitations(citation_level);
        const references_promise = project.loadReferences(0);
        
        await citations_promise;
        await references_promise;
    } catch (error) {
        console.error(error);
    }
})();
