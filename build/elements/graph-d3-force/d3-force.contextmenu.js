"use strict";

import console from "../../helper/console.js";

import require from "../../helper/require.js";

async function addContextmenuEntries(host) {
    console.log(this, host);
    // contextmenu addon present
    const graph_d3_force = await host.addonPromises["graph-d3-force"];
    const graph_contextmenu = await host.addonPromises["graph-contextmenu"];
    const promises = [];
    for (const node of host.nodes) {
        const promise = addNodeContextmenuEntries.call(graph_d3_force, node.contextmenu);
        promises.push(promise);
    }
    await addCanvasContextmenuEntries.call(graph_d3_force, graph_contextmenu.canvasContextmenu);
    await Promise.all(promises);
};

async function addCanvasContextmenuEntries(contextmenu) {
    const toggle_force_entry = document.createElement("div");
    toggle_force_entry.textContent = "Start force layout";
    toggle_force_entry.hammer = new Hammer(toggle_force_entry);
    toggle_force_entry.hammer.on("tap", async event => {
        console.log("tap");
        switch (this.state) {
            case "running":
                await this.stop();
                break;
            case "idle":
                await this.start();
        }
        await this.hideContextmenu();
    });
    this.addEventListener("simulationstart", event => {
        console.log("");
        toggle_force_entry.textContent = "Stop force layout";
    });
    this.addEventListener("simulationstop", event => {
        console.log("");
        toggle_force_entry.textContent = "Start force layout";
    });
    this.addEventListener("simulationend", event => {
        console.log("");
        toggle_force_entry.textContent = "Start force layout";
    });
    contextmenu.appendChild(toggle_force_entry);

    const force_parameter_entry = document.createElement("div");
    force_parameter_entry.hammer = new Hammer(force_parameter_entry);
    contextmenu.appendChild(force_parameter_entry);

    const distance_entry = document.createElement("input");
    distance_entry.type = "number";
    distance_entry.value = this.configuration.link.distance;
    distance_entry.addEventListener("change", async event => {
        console.log("change", event);
        this.configuration.link.distance = distance_entry.value;
        this.configuration = this.configuration;
    });
    force_parameter_entry.appendChild(distance_entry);
    // @TODO: add other configuration patameters (polymer?)
}

function addNodeContextmenuEntries(contextmenu) {}

export default (async () => {
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