"use strict";
import console from "../../../helper/console.js";

import require from "../../../helper/require.js";
// import "https://unpkg.com/@polymer/paper-input@next/paper-input.js?module";

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
        const promise = addNodeContextmenuEntries.call(graph_d3_force, node.contextmenu);
        promises.push(promise);
    }
    await addCanvasContextmenuEntries.call(graph_d3_force, graph_contextmenu.canvasContextmenu);
    await Promise.all(promises);
};

async function addCanvasContextmenuEntries(contextmenu) {
    contextmenu.insertAdjacentHTML("beforeend", canvas_contextmenu_html);
    const force_container = contextmenu.querySelector("#force.menu-group");
    const start_force = force_container.querySelector("#start-force");
    start_force.hammer = new Hammer(start_force);
    start_force.hammer.on("tap", async event => {
        await this.start();
        await this.hideContextmenu();
    });
    const stop_force = force_container.querySelector("#stop-force");
    stop_force.hammer = new Hammer(stop_force);
    stop_force.hammer.on("tap", async event => {
        await this.stop();
        await this.hideContextmenu();
    });
    this.addEventListener("simulationstart", event => {
        console.log("");
        contextmenu.parentElement.setAttribute("simulation", "running");
    });
    function onsimulationhalt() {
        console.log("");
        contextmenu.parentElement.setAttribute("simulation", "idle");
    }
    this.addEventListener("simulationstop", onsimulationhalt);
    this.addEventListener("simulationend", onsimulationhalt);
    
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