"use strict";import console from "../../helper/console.js";
export default class GraphAddon extends HTMLElement {
  constructor() {
    super();
    let resolved = !1;
    const host_promise = new Promise((resolve, reject) => {
      const _reject = event => {
        console.log(event);event.stopPropagation();reject(new Error("no valid host found"))
      };
      this.addEventListener("addon-registry", _reject, {
        once: !0,
        capture: !0
      });Object.defineProperty(this, "host", {
        get() {
          return host_promise
        },
        set(host) {
          console.assert(!resolved, "host reassignment is ignored");
          resolved = !0;this.removeEventListener("addon-registry", _reject);resolve(host)
        },
        configurable: !0
      })
    });
    (async() => {
      const host = await host_promise;
      try {
        if ("function" == typeof this.hosted) {
          await this.hosted(host)
        }
      } catch (error) {
        console.error(error)
      }
    })();this.dispatchEvent(new Event("addon-registry"))
  }
}