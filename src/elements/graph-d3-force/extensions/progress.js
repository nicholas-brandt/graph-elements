"use strict";
import console from "../../../helper/console.js";

import "https://unpkg.com/@polymer/paper-progress@next/paper-progress.js?module";

const progress_html = `<!-- inject: ./progress.html -->`;
const custom_style = document.createElement("custom-style");
const style = document.createElement("style");
style.setAttribute("is", "custom-style");
style.textContent = `<!-- inject: ./progress.css -->`;
custom_style.appendChild(style);

async function addProgressbar(host) {
    const graph_d3_force = await host.addonPromises["graph-d3-force"];
    graph_d3_force.appendChild(custom_style.cloneNode(true));
    
    graph_d3_force.insertAdjacentHTML("beforeend", progress_html);
    const progressbar = graph_d3_force.querySelector("#progress");
    progressbar.value = graph_d3_force.configuration.alpha;
    graph_d3_force.worker.addEventListener("message", ({data}) => {
        if (data.alpha) {
            progressbar.value = (1 - data.alpha) / (1 - graph_d3_force.configuration.alphaMin) * 100
        }
    }, {
        passive: true
    });
}

export default
(async () => {
    try {
        await customElements.whenDefined("graph-d3-force");
        // upgrade all graph-displays directly in the document (no shadow DOM)
        // @IMPORTANT: upgrading "hidden" graph-displays is impossible because no handle on them is available
        const graph_displays = new Set(document.querySelectorAll("graph-display"));
        const promises = [];
        for (const graph_display of graph_displays) {
            console.log("upgrade existing host");
            const promise = graph_display.__callWhenAddonHosted("graph-contextmenu", addProgressbar);
            promises.push(promise);
        }
        // upgrade new instances
        // @REMARK: elements in other documents are irrelevant
        document.documentElement.addEventListener("addon-registry", async event => {
            console.log("upgrade new host");
            const graph_display = event.target;
            // check if event.detail is already upgraded
            if (!graph_displays.has(graph_display)) {
                await graph_display.__callWhenAddonHosted("graph-contextmenu", addProgressbar);
            }
        });
        
        await Promise.all(promises);
    } catch (error) {
        console.error(error);
    }
})();