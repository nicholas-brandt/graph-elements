/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph, AcyclicGraph, Tree } from "../graph";
import IO from "../extensions/IO";
import mixin from "../external/mixin";
import storage from "../external/storage";
//debugging
window.Graph = Graph;
window.AcyclicGraph = AcyclicGraph;
window.Tree = Tree;
window.IO = IO;

{
    // load graph
    let graph;
    try {
        graph = IO.deserialize(localStorage.graph);
        document.querySelector("paper-toast#graph-loaded").show();
    } catch (e) {
        console.error(e);
        graph = new Graph;
    }
    // init tezcatlipoca
    const tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
    tezcatlipoca.graph = graph;
    PolymerGestures.addEventListener(document.querySelector("paper-button#save-graph"), "tap", () => {
        saveGraph();
        document.querySelector("paper-toast#graph-saved").show();
    });
    // init ui
    const node_id = document.querySelector("#node-id");
    tezcatlipoca.addEventListener("select", ({
        detail: {
            node,
            datum
        }
    }) => {
        node_id.value = datum.value;
        config.selected = datum.value;
    });
    tezcatlipoca.addEventListener("deselect", () => {
        node_id.value = "";
        config.selected = null;
    });
    // load configuration
    const force_layout_checkbox = document.querySelector("#force-layout>paper-checkbox");
    force_layout_checkbox.onchange = event => {
        console.log("force-layout change", force_layout_checkbox.checked);
        event.bubbles = false;
        config.force_layout = tezcatlipoca.options.force.enabled = force_layout_checkbox.checked;
    };
    const config = storage("config", {
        force_layout: true,
        selected: undefined
    });
    // apply configuration
    force_layout_checkbox.checked = config.force_layout;
    force_layout_checkbox.onchange({});
    tezcatlipoca.selectNode(config.selected);
    // debugging
    window.tezcatlipoca = tezcatlipoca;
    window.graph = graph;
    
    function saveGraph() {
        localStorage.graph = IO.serialize(tezcatlipoca.graph);
    }
}