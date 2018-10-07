"use strict";
import console from "../../helper/console.js";

import {PolymerElement} from "//unpkg.com/@polymer/polymer/polymer-element.js?module";
import {templatize} from "//unpkg.com/@polymer/polymer/lib/utils/templatize.js?module";
import {html} from "//unpkg.com/@polymer/polymer/lib/utils/html-tag.js?module";

import {createGraphAddon} from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";

import fixCSSPart from "./css-part-workaround/fixCSSPart.js";

export default
class GraphContextmenu extends createGraphAddon(PolymerElement) {
    static tagName = "graph-contextmenu";
    static styleString = `<style><!-- inject: ./graph-contextmenu.css --></style>`;
    static templateString = `<!-- inject: ./graph-contextmenu.html -->`;
    static get template() {
        return html([this.styleString + this.templateString]);
    }
    ready() {
        super.ready();
        fixCSSPart(this);
        this.canvasTemplate = this.querySelector("template#canvas");
        if (this.canvasTemplate) {
            // TODO: stamp new template for the canvas menu
            const menu_container = stampMenu(this.canvasTemplate, "canvas", {
            }, {
                forwardHostProp(property, value) {
                    console.log(property, value);
                }
            });
            this.appendChild(menu_container);
            this.canvasContextmenu = menu_container;
        }
        this.nodeTemplate = this.querySelector("template#node");
    }
    async hosted(host) {
        host.addEventListener("resize", event => {
            this.hideContextmenu();
        }, passive);
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
            __setHammerEnabled(host.svg.hammer, false, "pinch", "pan", "press", "rotate", "swipe");
        } else {
            __setHammerEnabled(host.svg.hammer, true, "tap");
        }
        host.svg.hammer.on("tap", this.hideContextmenu.bind(this));
        host.svg.addEventListener("contextmenu", this.__prepareContextmenu.bind(this, host, null), {passive:false});
        host.addEventListener("graph-structure-change", this.__bindNodes.bind(this, host), {
            capture: true, // ignored?
            passive: true
        });
        this.__bindNodes(host);
    }
    __bindNodes(host) {
        console.log("");
        for (const [key, node] of host.nodes) {
            if (!node.contextmenuInstalled) {
                node.contextmenuInstalled = true;
                node.element.addEventListener("contextmenu", this.__prepareContextmenu.bind(this, host, node), {passive:false});
            }
        }
    }
    __prepareContextmenu(host, node, event) {
        console.log(event);
        event.preventDefault();
        event.stopPropagation();
        const x = event.pageX - host.offsetLeft;
        const y = event.pageY - host.offsetTop;
        if (node && !node.contextmenu && this.nodeTemplate) {
            // TODO: stamp new template for the node
            const menu_container = stampMenu(this.nodeTemplate, "node", {node});
            this.appendChild(menu_container);
            node.contextmenu = menu_container;
        } 
        const contextmenu = node ? node.contextmenu : this.canvasContextmenu;
        if (contextmenu) {
            this.__showContextmenu(host, contextmenu, x, y);
        }
    }
    async showContextmenu(contextmenu, x, y) {
        const host = await this.host;
        this.__showContextmenu(host, contextmenu, x, y);
    }
    __showContextmenu(host, contextmenu, x, y) {
        if (!contextmenu) {
            throw Error("no contextmenu element specified");
        }
        console.log(contextmenu, x, y);
        if (this.activeContextmenu) {
            this.activeContextmenu.classList.remove("visible");
        }
        contextmenu.classList.add("visible");
        this.activeContextmenu = contextmenu;
        // this.__contextmenusElement.classList.add("visible");
        // this.__contextmenusElement.innerHTML = "";
        // this.__contextmenusElement.x.baseVal.value = x;
        // this.__contextmenusElement.y.baseVal.value = y;
        contextmenu.style.left = x + "px";
        contextmenu.style.top = y + "px";
        // prevent overlapping
        const max_x = innerWidth - contextmenu.clientWidth - host.offsetLeft;
        if (parseFloat(x) > max_x) {
            contextmenu.style.left = max_x + "px";
            this.boundX = max_x;
        } else {
            this.boundX = x;
        }
        this.x = x;
        const max_y = innerHeight - contextmenu.clientHeight - host.offsetTop - 1;
        if (parseFloat(y) > max_y) {
            contextmenu.style.top = max_y + "px";
            this.boundY = max_y;
        } else {
            this.boundY = y;
        }
        this.y = y;
    }
    hideContextmenu() {
        console.log(this.activeContextmenu);
        // this.__contextmenusElement.classList.remove("visible");
        if (this.activeContextmenu) {
            this.activeContextmenu.classList.remove("visible");
            this.activeContextmenu = undefined;
            this.x = undefined;
            this.y = undefined;
        }
    }
}
const passive = {
    passive: true
};
__try(async () => {
    // ensure requirements
    await require(["Hammer"]);
    await customElements.whenDefined("graph-display");
    customElements.define(GraphContextmenu.tagName, GraphContextmenu);
})();

function stampMenu(template, name, instance_props, options) {
    const TemplateClass = templatize(template, undefined, options);
    const instance = new TemplateClass(instance_props);
    const menu_container = document.createElement("div");
    menu_container.classList.add("menu", name);
    menu_container.slot = name;
    menu_container.appendChild(instance.root);
    return menu_container;
}