/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA [https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph, AcyclicGraph, Tree } from "../graph";
import IO from "../extensions/IO";
import mixin from "../external/mixin";
import storage from "../external/storage";
import requestAnimationFunction from "../external/requestAnimationFunction";
import CircularJSON from "../../external/circular-json.amd";
const tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
//debugging
window.Graph = Graph;
window.AcyclicGraph = AcyclicGraph;
window.Tree = Tree;
window.IO = IO;
window.tezcatlipoca = tezcatlipoca;
// init config
tezcatlipoca.addEventListener("configchange", () => {
    localStorage.config = CircularJSON.stringify(tezcatlipoca.config);
});
// proxy
tezcatlipoca.proxyHandler = {
    d3: {
        force: {
            enabled(enabled) {
                force.checked = enabled;
            }
        }
    },
    state: {
        selected(selected) {
            node_id.value = isNaN(selected) ? "" : selected;
        }
    }
};
{
    const saveGraph = requestAnimationFunction(() => {
        console.log("save graph");
        localStorage.graph = IO.serialize(tezcatlipoca.graph);
    });
    tezcatlipoca.addEventListener("graphchange", saveGraph);
}
const node_id = document.querySelector("#node-id");
const graph_saved = document.querySelector("paper-toast#graph-saved");
const force = document.querySelector("#force-layout>paper-checkbox");
force.addEventListener("change", () => {
    tezcatlipoca.config.d3.force.enabled = force.checked;
});
// load graph
{
    let graph;
    try {
        graph = IO.deserialize(localStorage.graph);
        document.querySelector("paper-toast#graph-loaded").show();
    } catch (e) {
        console.error(e);
    }
    console.log("apply graph");
    tezcatlipoca.graph = graph;
    // debugging
    window.graph = graph;
}
// load config
try {
    mixin(tezcatlipoca.config, CircularJSON.parse(localStorage.config), mixin.OVERRIDE);
} catch (e) {
    console.error(e);
}