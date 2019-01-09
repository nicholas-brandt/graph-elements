"use strict";
// import console from "../../helper/console.js";

import {PolymerElement} from "//unpkg.com/@polymer/polymer/polymer-element.js?module";
import {templatize} from "//unpkg.com/@polymer/polymer/lib/utils/templatize.js?module";
import {html} from "//unpkg.com/@polymer/polymer/lib/utils/html-tag.js?module";

import {createGraphAddon} from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";
import __try from "../../helper/__try.js";
import __setHammerEnabled from "../../helper/__setHammerEnabled.js";

export default
class GraphContextmenu extends createGraphAddon(PolymerElement) {
    static tagName = "graph-contextmenu";
    static styleString = `<style><!-- inject: ./graph-contextmenu.css --></style>`;
    static templateString = `<!-- inject: ./graph-contextmenu.html -->`;
    static get template() {
        return html([this.styleString + this.templateString]);
    }
    static properties = {
        activeNode: {
            type: Object,
            value: null
        }
    };
    static observers = ["__activeNodeChanged(activeNode)"];
    ready() {
        super.ready();
        
        // fix CSS part
        this.insertAdjacentHTML("beforeend", `<style><!-- inject: ./fixCSSPart.css --></style>`);
        
        this.canvasMenu = this.shadowRoot.querySelector(".menu.canvas");
        this.canvasTemplate = this.querySelector("template#canvas");
        if (this.canvasTemplate) {
            const instance = this.__stampMenu(this.canvasTemplate, "canvas", {}, {});
            this.appendChild(instance.root);
            this.__canvasTemplateInstance = instance;
        }
        this.nodeMenu = this.shadowRoot.querySelector(".menu.node");
        this.nodeTemplate = this.querySelector("template#node");
        if (this.nodeTemplate) {
            const instance = this.__stampMenu(this.nodeTemplate, "node", {
                node: true
            }, {});
            this.appendChild(instance.root);
            this.__nodeTemplateInstance = instance;
        } 
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
        // console.log("");
        for (const [key, node] of host.nodes) {
            if (!node.contextmenuInstalled) {
                node.contextmenuInstalled = true;
                node.element.addEventListener("contextmenu", this.__prepareContextmenu.bind(this, host, node), {
                    passive: false
                });
            }
        }
    }
    __prepareContextmenu(host, node, event) {
        console.log(event);
        event.preventDefault();
        event.stopPropagation();
        const x = event.pageX - host.offsetLeft;
        const y = event.pageY - host.offsetTop;
        this.activeNode = node;
        const contextmenu = node ? this.nodeMenu : this.canvasMenu;
        if (contextmenu) {
            this.__showContextmenu(host, contextmenu, x, y);
        }
        return contextmenu;
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
    __stampMenu(template, name, instance_properties, model) {
        const options = {
            mutableData: this.mutableData,
            parentModel: true,
            instanceProps: instance_properties,
            // @REMARK: never called but neccessary (_enqueueClient missing)
            forwardHostProp(property, value) {
                console.log("forward", property, value);
            },
            notifyInstanceProp: function(inst, prop, value) {
                // @TODO: propagate to instance property to the host
                // set value on this
                // this.notifyPath
            }
        };
        const TemplateClass = templatize(template, this, options);
        const instance = new TemplateClass(model);
        for (const child of instance.root.children) {
            child.slot = name;
        }
        return instance;
    }
    __activeNodeChanged(new_node) {
        if (this.nodeMenu) {
            const {__nodeTemplateInstance} = this;
            __nodeTemplateInstance.forwardHostProp("node", new_node);
            __nodeTemplateInstance._flushProperties();
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