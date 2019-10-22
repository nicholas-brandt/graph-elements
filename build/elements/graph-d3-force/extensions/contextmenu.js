"use strict"; // import console from "../../../helper/console.js";

import GraphDisplay from "../../graph-display/graph-display.js";
import GraphD3Force from "../../graph-d3-force/graph-d3-force.js";
import GraphContextmenu from "../../graph-contextmenu/graph-contextmenu.js";
import require from "../../../helper/require.js";
import __try from "../../../helper/__try.js";
const style_html = `<style>:host .menu[simulation=running] ::slotted(#start-force),:host .menu[simulation]:not([simulation=running]) ::slotted(#stop-force){color:hsla(0,0%,20%,.5)}</style>`;
const contextmenu_html = `<div id="force" class="menu-group" slot="canvas">
    <div id="start-force">Start force layout</div>
    <div id="stop-force">Stop force layout</div>
    <div>
        <label>Alpha</label>
        <input id="alpha" label="Alpha" type="number">
    </div>
    <paper-input label="Distance"></paper-input>
    <script src="//unpkg.com/@polymer/paper-input/paper-input.js?module" type="module" async></script>
</div>`;
export default __try(async () => {
  await require(["Hammer"]);
  await GraphDisplay.extend(extend_contextmenu);
})();

async function extend_contextmenu(graph_display) {
  const graph_contextmenu = await graph_display.addonPromises[GraphContextmenu.tagName];
  const graph_d3_force = await graph_display.addonPromises[GraphD3Force.tagName];
  graph_contextmenu.insertAdjacentHTML("beforeend", contextmenu_html);
  const contextmenu = graph_contextmenu.canvasMenu;
  contextmenu.insertAdjacentHTML("beforeend", style_html);
  const force_container = graph_contextmenu.querySelector("#force.menu-group");
  const start_force = force_container.querySelector("#start-force");
  start_force.hammer = new Hammer(start_force);
  start_force.hammer.on("tap", __try(async event => {
    if (graph_d3_force.state != "running") {
      await graph_contextmenu.hideContextmenu();
    }

    await graph_d3_force.start();
  }));
  const stop_force = force_container.querySelector("#stop-force");
  stop_force.hammer = new Hammer(stop_force);
  stop_force.hammer.on("tap", __try(async event => {
    if (graph_d3_force.state == "running") {
      await graph_contextmenu.hideContextmenu();
    }

    await graph_d3_force.stop();
  }));
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
    contextmenu.setAttribute("simulation", "running");
  }

  function onsimulationhalt() {
    console.log("");
    contextmenu.setAttribute("simulation", "idle");
  }
}