export class Node {
  constructor({value, key}, _request_paint) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");this.element.classList.add("node");
    this.element.node = this;
    let x = value && value.x || 0,
      y = value && value.y || 0,
      radius = value && value.radius || 10;
    const request_paint = async node => {
      try {
        await _request_paint(node)
      } catch (error) {
        console.error(error)
      }
    };
    Object.defineProperties(this, {
      x: {
        set(value) {
          x = value;request_paint(this)
        },
        get() {
          return x
        },
        configurable: !0,
        enumerable: !0
      },
      y: {
        set(value) {
          y = value;request_paint(this)
        },
        get() {
          return y
        },
        configurable: !0,
        enumerable: !0
      },
      radius: {
        set(value) {
          radius = value;request_paint(this)
        },
        get() {
          return radius
        },
        configurable: !0,
        enumerable: !0
      }
    });Object.assign(this, {
      value,
      key
    });
    this.x |= 0;
    this.y |= 0
  }
  paint() {
    const {x, y, radius} = this;
    if (x | 0 === x) {
      this.element.cx.baseVal.value = x
    }
    if (y | 0 === y) {
      this.element.cy.baseVal.value = y
    }
    if (radius | 0 === radius) {
      this.element.r.baseVal.value = radius
    }
  }
}
export class Link {
  constructor({value, source, target}) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");this.element.classList.add("link");
    this.element.link = this;Object.assign(this, {
      value,
      source,
      target
    })
  }
  paint() {
    const {source, target} = this;
    let path_d;
    if (source === target || source.x === target.x && source.y === target.y) {
      const short = source.radius / 3,
        long = 3 * source.radius;
      path_d = `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`
    } else {
      const x_diff = target.x - source.x,
        y_diff = target.y - source.y,
        r_diff = Math.hypot(x_diff, y_diff) / target.radius,
        xr_diff = x_diff / r_diff,
        yr_diff = y_diff / r_diff,
        offset = 2,
        m_x = target.x - xr_diff * offset,
        m_y = target.y - yr_diff * offset;
      path_d = `M ${source.x} ${source.y}L ${m_x} ${m_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m_x} ${m_y}`
    }
    this.element.setAttribute("d", path_d)
  }
}