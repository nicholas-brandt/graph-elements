export default {
  node: {
    x: 0,
    y: 0,
    radius: 10,
    paint() {
      this.circle.setAttribute("cx", this.x), this.circle.cx.baseVal.value = this.x, this.circle.setAttribute("cy", this.y), this.circle.cy.baseVal.value = this.y, this.circle.setAttribute("r", this.radius), this.circle.r.baseVal.value = this.radius
    }
  }
};