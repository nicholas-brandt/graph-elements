"use strict";
export default class GraphExtension extends HTMLElement {
  constructor() {
    super();
    const a = this.parentNode.host || this.parentElement;
    Object.defineProperties(this, {
      __graphDisplay: {
        value: a
      }
    })
  }
}