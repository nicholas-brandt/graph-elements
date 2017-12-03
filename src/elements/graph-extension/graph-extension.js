"use strict";
export default class GraphExtension extends HTMLElement {
    constructor() {
        super();
        const graph_display = this.parentNode.host || this.parentElement;
        // console.log("graph_display", graph_display);
        Object.defineProperties(this, {
            __graphDisplay: {
                value: graph_display
            }
        });
    }
}