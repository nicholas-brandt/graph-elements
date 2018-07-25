"use strict";
import console from "../../helper/console.js";

import require from "../../helper/require.js";

async function addContextmenuEntries(host) {
    console.log(this, host);
    // contextmenu addon present
    const graph_d3_force = await host.addonPromises["graph-d3-force"];
    const graph_contextmenu = await host.addonPromises["graph-contextmenu"];
    addCanvasContextmenuEntries.call(graph_d3_force, graph_contextmenu.canvasContextmenu);
    for (const node of host.nodes) {
        addNodeContextmenuEntries.call(graph_d3_force, node.contextmenu);
    }
};

function addCanvasContextmenuEntries(contextmenu) {
    const new_node_entry = document.createElement("div");
    new_node_entry.textContent = "Start force layout";
    new_node_entry.hammer = new Hammer(new_node_entry);
    new_node_entry.hammer.on("tap", async event => {
        console.log("tap");
        await this.start();
    });
    contextmenu.appendChild(new_node_entry);
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