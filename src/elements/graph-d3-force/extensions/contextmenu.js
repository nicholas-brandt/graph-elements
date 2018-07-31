"use strict";
import console from "../../../helper/console.js";

import require from "../../../helper/require.js";

// import "https://unpkg.com/@polymer/paper-input@next/paper-input.js?module";
import "https://unpkg.com/@polymer/iron-input@next/iron-input.js?module";
// import "https://unpkg.com/@polymer/paper-slider@next/paper-slider.js?module";

const canvas_contextmenu_html = `<!-- inject: ./canvas.contextmenu.html -->`;
const style = document.createElement("style");
style.textContent = `<!-- inject: ./contextmenu.css -->`;

async function addContextmenuEntries(host) {
    console.log(this, host);
    // contextmenu addon present
    const graph_contextmenu = await host.addonPromises["graph-contextmenu"];
    graph_contextmenu.styleElement.textContent += style.textContent;
    
    const graph_d3_force = await host.addonPromises["graph-d3-force"];
    const promises = [];
    for (const node of host.nodes) {
        const promise = addNodeContextmenuEntries(graph_d3_force, graph_contextmenu, node.contextmenu);
        promises.push(promise);
    }
    await addCanvasContextmenuEntries(graph_d3_force, graph_contextmenu, graph_contextmenu.canvasContextmenu);
    await Promise.all(promises);
};

async function addCanvasContextmenuEntries(graph_d3_force, graph_contextmenu, contextmenu) {
    contextmenu.insertAdjacentHTML("beforeend", canvas_contextmenu_html);
    const force_container = contextmenu.querySelector("#force.menu-group");
    const start_force = force_container.querySelector("#start-force");
    start_force.hammer = new Hammer(start_force);
    start_force.hammer.on("tap", async event => {
        if (graph_d3_force.state != "running") {
            await graph_contextmenu.hideContextmenu();
        }
        await graph_d3_force.start();
    });
    const stop_force = force_container.querySelector("#stop-force");
    stop_force.hammer = new Hammer(stop_force);
    stop_force.hammer.on("tap", async event => {
        if (graph_d3_force.state == "running") {
            await graph_contextmenu.hideContextmenu();
        }
        await graph_d3_force.stop();
    });
    const alpha_input = force_container.querySelector("#alpha");
    alpha_input.value = graph_d3_force.configuration.alpha;
    alpha_input.addEventListener("change", () => {
        console.log("alpha value", alpha_input.value);
        const configuration = graph_d3_force.configuration;
        configuration.alpha = alpha_input.value;
        graph_d3_force.configuration = configuration;
    });
    graph_d3_force.addEventListener("simulationstart", onsimulationrunning);
    graph_d3_force.addEventListener("simulationstop", onsimulationhalt);
    graph_d3_force.addEventListener("simulationend", onsimulationhalt);
    
    if (graph_d3_force.state == "running") {
        onsimulationrunning();
    } else {
        onsimulationhalt();
    }
    
    function onsimulationrunning() {
        console.log("");
        contextmenu.parentElement.setAttribute("simulation", "running");
    }
    function onsimulationhalt() {
        console.log("");
        contextmenu.parentElement.setAttribute("simulation", "idle");
    }
    
    // @TODO: add other configuration patameters (https://github.com/unpkg/unpkg.com/issues/122)
}

function addNodeContextmenuEntries(contextmenu) {}

export default
(async () => {
    try {
        await require(["Hammer"]);
        await customElements.whenDefined("graph-d3-force");
        // upgrade all graph-displays directly in the document (no shadow DOM)
        // @IMPORTANT: upgrading "hidden" graph-displays is impossible because no handle on them is available
        const graph_displays = new Set(document.querySelectorAll("graph-display"));
        const promises = [];
        for (const graph_display of graph_displays) {
            console.log("upgrade existing host");
            const promise = graph_display.__callWhenAddonHosted("graph-contextmenu", addContextmenuEntries);
            promises.push(promise);
        }
        // upgrade new instances
        // @REMARK: elements in other documents are irrelevant
        document.documentElement.addEventListener("addon-registry", async event => {
            console.log("upgrade new host");
            const graph_display = event.target;
            // check if event.detail is already upgraded
            if (!graph_displays.has(graph_display)) {
                await graph_display.__callWhenAddonHosted("graph-contextmenu", addContextmenuEntries);
            }
        });
        
        await Promise.all(promises);
    } catch (error) {
        console.error(error);
    }
})();