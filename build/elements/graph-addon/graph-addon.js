"use strict";

import console from "../../helper/console.js";

import __try from "../../helper/__try.js";

export function createGraphAddon(superClass = HTMLElement) {
    if (!(superClass.prototype instanceof HTMLElement) && superClass !== HTMLElement) {
        throw Error("superClass is not a HTMLElement");
    }
    return class GraphAddon extends superClass {
        constructor(...args) {
            super(...args);
            let resolved = false;
            const host_promise = new Promise((resolve, reject) => {
                // in case there is no valid host -> reject
                this.addEventListener("addon-registry", event => {
                    if (!resolved) {
                        console.assert(false, "no valid host found");
                        // event.stopPropagation();
                        reject(new Error("no valid host found"));
                    }
                }, {
                    once: true,
                    capture: true, // ignored?
                    passive: true
                });
                Object.defineProperty(this, "host", {
                    get() {
                        return host_promise;
                    },
                    set(host) {
                        console.assert(!resolved, "host reassignment is ignored");
                        resolved = true;
                        // this.removeEventListener("addon-registry", _reject);
                        resolve(host);
                    },
                    configurable: true
                });
            });
            __try(async () => {
                const host = await host_promise;
                if (typeof this.hosted == "function") {
                    await this.hosted(host);
                }
            })();
        }
        connectedCallback() {
            if (super.connectedCallback) {
                super.connectedCallback();
            }
            console.log("");
            this.dispatchEvent(new CustomEvent("addon-registry", {
                detail: this,
                bubbles: true
                // composed: true
            }));
        }
    };
}

export const GraphAddon = createGraphAddon();