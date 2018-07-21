"use strict";
import console from "../../helper/console.js";

import requestAnimationFunction from "https://rawgit.com/Jamtis/7ea0bb0d2d5c43968c4a/raw/910d7332a10b2549088dc34f386fbcfa9cdd8387/requestAnimationFunction.js";
import {Node, Link} from "../../helper/GraphClasses.js";
const style = document.createElement("style");
style.textContent = "<!-- inject: ../../../build/elements/graph-display/graph-display.css -->";
export class GraphDisplay extends HTMLElement {
    constructor() {
        super();
        // shadow stuff
        this.attachShadow({
            mode: "open"
        });
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.graphGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        this.svg.appendChild(this.graphGroup);
        this.__requestBroadcast = requestAnimationFunction(event_name => {
            this.__broadcast(event_name);
        });
        // resize handler
        const request_resize = requestAnimationFunction(() => {
            this.__resize();
        });
        new ResizeObserver(() => {
            request_resize();
        }).observe(this);
        // install request function
        this.__requestPaint = requestAnimationFunction(this.__paint.bind(this));
        // map for updated nodes
        this.nodes = new Map;
        this.links = new Set;
        this.__updatedNodes = new Set;
        // install extension callback
        this.shadowRoot.addEventListener("addon-registry", event => {
            // stop the event because
            // if it would reach its target addon it would assume no host is present
            event.stopPropagation();
            try {
                event.target.host = this;
            } catch (error) {
                console.error(error);
            }
        }, {
            capture: true
        });
        this.shadowRoot.addEventListener("graph-structure-change", async () => {
            try {
                this.__adoptGraph();
                await this.__requestPaint();
            } catch (error) {
                console.error(error);
            }
        });
        this.shadowRoot.addEventListener("graph-update", async event => {
            console.log("graph-update");
            try {
                // register which node have changed
                this.__requestPaint();
            } catch (error) {
                console.error(error);
            }
        });
        // add style
        this.shadowRoot.appendChild(style.cloneNode(true));
        this.shadowRoot.appendChild(this.svg);
        // migrate all children
        // quirk - not all children get imported
        for (const child of [...this.children]) {
            this.shadowRoot.appendChild(child);
        }
        // set configuration
        this.configuration = {};
        // trigger init resize
        request_resize();
        // trigger init graph display
        // propagate preassigned graph to setter
        const graph = this.graph;
        delete this.graph;
        this.graph = graph;
    }
    set graph(graph) {
        this.__graph = graph;
        this.__broadcast("graph-structure-change");
    }
    get graph() {
        return this.__graph;
    }
    __adoptGraph() {
        console.log("");
        const valid_node_elements = new Set;
        const valid_link_elements = new Set;
        this.nodes.clear();
        this.links.clear();
        if (this.__graph) {
            // ensure valid formatting
            for (let [key, value] of graph.vertices()) {
                if (!(value instanceof Node)) {
                    // console.log("new node", value);
                    value = new Node({
                        value,
                        key
                    }, this.__requestPaintNode.bind(this));
                    this.graph.setVertex(key, value);
                    this.__updatedNodes.add(value);
                }
                valid_node_elements.add(value.element);
                this.nodes.set(key, value);
            }
            for (let [source_key, target_key, value] of graph.edges()) {
                if (!(value instanceof Link)) {
                    // console.log("new link", value);
                    value = new Link({
                        value,
                        source: this.nodes.get(source_key),
                        target: this.nodes.get(target_key)
                    });
                    this.graph.setEdge(source_key, target_key, value);
                    this.__updatedNodes.add(value.source);
                    this.__updatedNodes.add(value.target);
                }
                valid_link_elements.add(value.element);
                this.links.add(value);
            }
        }
        // ensure only valid children are present
        for (const child of [...this.svg.children]) {
            if (child.classList.contains("node") && !valid_node_elements.has(child)
               || child.classList.contains("link") && !valid_link_elements.has(child)) {
                child.parentNode.removeChild(child);
            }
        }
        // add non-existent
        for (const link_element of valid_link_elements) {
            this.graphGroup.appendChild(link_element);
        }
        for (const node_element of valid_node_elements) {
            this.graphGroup.appendChild(node_element);
        }
    }
    __requestPaintNode(node) {
        console.assert(this instanceof GraphDisplay, "invalid this", this);
        console.assert(node instanceof Node, "invalid node", node);
        this.__updatedNodes.add(node);
        return this.__requestPaint();
    }
    __paint() {
        console.log(this.__updatedNodes.size);
        // paint affected nodes
        for (const node of this.__updatedNodes) {
            node.paint();
        }
        // find updatable links
        for (const link of this.links) {
            if (this.__updatedNodes.has(link.source) || this.__updatedNodes.has(link.target)) {
                link.paint();
            }
        }
        this.__updatedNodes.clear();
    }
    __resize() {
        const {width, height} = this.svg.getBoundingClientRect();
        Object.assign(this.svg.viewBox.baseVal, {
            x: -width / 2,
            y: -height / 2,
            width,
            height
        });
        this.shadowRoot.dispatchEvent(new CustomEvent("resize"));
    }
    __broadcast(event_name) {
        this.shadowRoot.dispatchEvent(new CustomEvent(event_name));
    }
};
customElements.define("graph-display", GraphDisplay);