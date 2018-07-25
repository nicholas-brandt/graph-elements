"use strict";

import console from "../../helper/console.js";

import GraphAddon from "../graph-addon/graph-addon.js";
import require from "../../helper/require.js";

const style = document.createElement("style");
style.textContent = ":host>graph-contextmenu>#contextmenus{position:absolute;display:block}:host>graph-contextmenu>#contextmenus .contextmenu{font:13px Roboto;display:none;flex-direction:column;overflow-x:hidden;overflow-y:auto;width:fit-content;border-radius:1px;box-shadow:0 1px 5px #999;background:#fff;padding:5px 0}:host>graph-contextmenu>#contextmenus .contextmenu.visible{display:flex}:host>graph-contextmenu>#contextmenus .contextmenu>*{flex:0 0 auto;padding:5px 20px;border:0 none;margin:0}:host>graph-contextmenu>#contextmenus .contextmenu>:hover{background:hsl(0,0%,60%,30%)}:host>graph-contextmenu>#contextmenus .contextmenu>:focus{outline:0}";

export default class GraphContextmenu extends GraphAddon {
    constructor() {
        super();
        console.log("");
        this.__contextmenusElement = document.createElement("div");
        this.__contextmenusElement.id = "contextmenus";
        this.appendChild(this.__contextmenusElement);
        this.canvasContextmenu = document.createElement("div");
        this.canvasContextmenu.classList.add("contextmenu");
        // this.canvasContextmenu.hammer = new Hammer(this.canvasContextmenu);
        // this.canvasContextmenu.hammer.options.domEvents = true;
        // this.canvasContextmenu.hammer.on("tap", this.hideContextmenu.bind(this));
        this.canvasTemplate = this.querySelector("#canvas");
        if (this.canvasTemplate) {
            const canvas_content = document.importNode(this.canvasTemplate.content, true);
            this.canvasContextmenu.appendChild(canvas_content);
        }
        this.__contextmenusElement.appendChild(this.canvasContextmenu);
        this.nodeTemplate = this.querySelector("#node");
        // add style
        this.appendChild(style.cloneNode(true));
    }
    async hosted(host) {
        console.log("");
        host.addEventListener("resize", event => {
            this.hideContextmenu();
        }, {
            passive: true
        });
        if (!host.svg.hammer) {
            host.svg.hammer = new Hammer(host.svg);
        }
        host.svg.hammer.on("tap", event => {
            this.hideContextmenu();
        });
        this.canvasInitializer = await this.__getInitializer(this.canvasTemplate);
        host.svg.addEventListener("contextmenu", event => {
            try {
                this.__contextmenuCanvas(host, event);
            } catch (error) {
                console.error(error);
            }
        }, {
            passive: false
        });
        this.nodeInitializer = await this.__getInitializer(this.nodeTemplate);
        host.addEventListener("graph-structure-change", event => {
            try {
                this.__bindNodes(host);
            } catch (error) {
                console.error(error);
            }
        }, {
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
                node.element.addEventListener("contextmenu", async event => {
                    try {
                        await this.__contextmenuNode(node, event);
                    } catch (error) {
                        console.error(error);
                    }
                }, {
                    passive: false
                });
            }
        }
    }
    async __getInitializer(template) {
        let script_url = template.dataset.script;
        // console.log("script url", script_url);
        if (script_url) {
            if (!/^(?:[a-z]+:)?\/\//i.test(script_url)) {
                const path = location.pathname.match(/(.*\/).*?/i)[1];
                script_url = location.origin + path + script_url;
                // console.log(path, script_url);
            }
            const module = await import(script_url);
            return module.default;
        }
        console.warn("no initializer script specified");
        return () => {};
    }
    __contextmenuCanvas(host, event) {
        console.log(event);
        event.preventDefault();
        // const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        // const y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
        const x = event.pageX - host.offsetLeft + "px";
        const y = event.pageY - host.offsetTop + "px";
        return this.showContextmenu(this.canvasContextmenu, x, y);
    }
    async __contextmenuNode(node, event) {
        console.log(node, event);
        event.preventDefault();
        event.stopPropagation();
        const host = await this.host;
        if (!node.contextmenu) {
            if (this.nodeTemplate) {
                // create contextmenu from template
                node.contextmenu = document.createElement("div");
                node.contextmenu.classList.add("contextmenu");
                const node_content = document.importNode(this.nodeTemplate.content, true);
                node.contextmenu.appendChild(node_content);
                this.nodeInitializer(node);
            }
        }
        // const x = (event.layerX / host.svg.clientWidth - .5) * host.svg.viewBox.baseVal.width;
        // const y = (event.layerY / host.svg.clientHeight - .5) * host.svg.viewBox.baseVal.height;
        const x = event.pageX - host.offsetLeft + "px";
        const y = event.pageY - host.offsetTop + "px";
        this.showContextmenu(node.contextmenu, x, y);
    }
    async showContextmenu(contextmenu, x, y) {
        console.log(contextmenu, x, y);
        if (this.activeContextmenu) {
            this.activeContextmenu.classList.remove("visible");
        }
        contextmenu.classList.add("visible");
        this.activeContextmenu = contextmenu;
        // this.__contextmenusElement.classList.add("visible");
        // this.__contextmenusElement.innerHTML = "";
        if (contextmenu.parentElement !== this.__contextmenusElement) {
            this.__contextmenusElement.appendChild(contextmenu);
        }
        // this.__contextmenusElement.x.baseVal.value = x;
        // this.__contextmenusElement.y.baseVal.value = y;
        this.__contextmenusElement.style.left = x;
        this.__contextmenusElement.style.top = y;
        // prevent overlapping
        const host = await this.host;
        const max_x = innerWidth - contextmenu.clientWidth - host.offsetLeft;
        if (parseFloat(x) > max_x) {
            this.__contextmenusElement.style.left = max_x + "px";
        }
        const max_y = innerHeight - contextmenu.clientHeight - host.offsetTop - 1;
        if (parseFloat(y) > max_y) {
            this.__contextmenusElement.style.top = max_y + "px";
        }
    }
    hideContextmenu() {
        console.log(this.activeContextmenu);
        // this.__contextmenusElement.classList.remove("visible");
        if (this.activeContextmenu) {
            this.activeContextmenu.classList.remove("visible");
            this.activeContextmenu = undefined;
        }
    }
}
GraphContextmenu.tagName = "graph-contextmenu";
(async () => {
    try {
        // ensure requirements
        await require(["Hammer"]);
        await customElements.whenDefined("graph-display");
        customElements.define(GraphContextmenu.tagName, GraphContextmenu);
    } catch (error) {
        console.error(error);
    }
})();