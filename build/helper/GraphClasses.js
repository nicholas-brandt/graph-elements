export class Node {
  constructor({value:a, key:b}, c) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle"), this.element.classList.add("node");
    let d = a && a.x || 0,
      e = a && a.y || 0,
      f = a && a.radius || 10;
    Object.defineProperties(this, {
      x: {
        set(a) {
          d = a, c(this)
        },
        get() {
          return d
        },
        configurable: !0,
        enumerable: !0
      },
      y: {
        set(a) {
          e = a, c(this)
        },
        get() {
          return e
        },
        configurable: !0,
        enumerable: !0
      },
      radius: {
        set(a) {
          f = a, c(this)
        },
        get() {
          return f
        },
        configurable: !0,
        enumerable: !0
      }
    }), Object.assign(this, {
      value: a,
      key: b
    }), this.x |= 0, this.y |= 0
  }
  paint() {
    const {x:a, y:b, radius:c} = this;
    a | 0 === a && (this.element.cx.baseVal.value = a), b | 0 === b && (this.element.cy.baseVal.value = b), c | 0 === c && (this.element.r.baseVal.value = c)
  }
}
export class Link {
  constructor({value:a, source:b, target:c}) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this.element.classList.add("link"), Object.assign(this, {
      value: a,
      source: b,
      target: c
    })
  }
  paint() {
    const {source:a, target:b} = this;
    let c;
    if (a === b || a.x === b.x && a.y === b.y) {
      const b = a.radius / 3,
        d = 3 * a.radius;
      c = `M ${a.x} ${a.y}c ${b} ${d} ${d} ${b} 0 0`
    } else {
      const d = b.x - a.x,
        e = b.y - a.y,
        f = Math.hypot(d, e) / b.radius,
        g = d / f,
        h = e / f,
        i = 2,
        j = b.x - g * i,
        k = b.y - h * i;
      c = `M ${a.x} ${a.y}L ${j} ${k}L ${b.x + h} ${b.y - g}l ${-2 * h} ${2 * g}L ${j} ${k}`
    }
    this.element.setAttribute("d", c)
  }
}