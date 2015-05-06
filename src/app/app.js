/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph, AcyclicGraph, Tree } from "../graph";
import IO from "../extensions/IO";
import mixin from "../external/mixin";
//debugging
window.Graph = Graph;
window.AcyclicGraph = AcyclicGraph;
window.Tree = Tree;
window.IO = IO;

{
    // load graph
    let graph;
    try {
        graph = IO.deserialize(localStorage.getItem("graph"));
        document.querySelector("paper-toast#graph-loaded").show();
    } catch (e) {
        console.error(e);
        graph = new Graph;
    }
    // init tezcatlipoca
    const tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
    tezcatlipoca.graph = graph;
    PolymerGestures.addEventListener(document.querySelector("paper-button#save-graph"), "tap", function saveGraph() {
        localStorage.setItem("graph", IO.serialize(tezcatlipoca.graph));
        document.querySelector("paper-toast#graph-saved").show();
    });
    // load configuration
    const force_layout_checkbox = document.querySelector("#force-layout>paper-checkbox");
    force_layout_checkbox.onchange = event => {
        console.log("force-layout change", force_layout_checkbox.checked);
        event.bubbles = false;
        config.force_layout = tezcatlipoca.options.force.enabled = force_layout_checkbox.checked;
        safeConfig();
    };
    const config = {
        force_layout: true
    };
    try {
        mixin(config, JSON.parse(localStorage.getItem("config")), mixin.OVERRIDE);
    } catch (e) {
        console.error(e);
    }
    // apply configuration
    force_layout_checkbox.checked = config.force_layout;
    force_layout_checkbox.onchange({});
    // debugging
    window.tezcatlipoca = tezcatlipoca;
    window.graph = graph;
    function safeConfig() {
        localStorage.setItem("config", JSON.stringify(config));
    }
}