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
const tezcatlipoca = document.querySelector("graphjs-tezcatlipoca");
// init config
const config = storage("config", {
    d3: {
        force: {
            enabled: true
        }
    },
    state: {
        selected: undefined,
        mode: "default"
    }
});
// proxy
tezcatlipoca.proxyHandler = {
    d3: {
        force: {
            enabled(enabled) {
                force.checked = config.d3.force.enabled = enabled;
            }
        }
    },
    state: {
        selected(selected) {
            node_id.value = isNaN(selected) ? "" : selected;
            config.state.selected = selected;
        },
        mode(mode) {
            config.state.mode = mode;
        }
    },
    graph(graph) {
        config.graph = IO.serialize(graph);
    }
};
const node_id = document.querySelector("#node-id");
const graph_saved = document.querySelector("paper-toast#graph-saved");
const force = document.querySelector("#force-layout>paper-checkbox");
force.addEventListener("change", () => {
    tezcatlipoca.config.d3.force.enabled = force.checked;
});
// load graph
let graph;
try {
    graph = IO.deserialize(config.graph);
    document.querySelector("paper-toast#graph-loaded").show();
} catch (e) {
    console.error(e);
}
tezcatlipoca.graph = graph;
// apply configuration
mixin(tezcatlipoca.config, config, mixin.OVERRIDE);
// debugging
window.tezcatlipoca = tezcatlipoca;
window.graph = graph;