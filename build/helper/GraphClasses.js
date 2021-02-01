import requestAnimationFunction from "//cdn.jsdelivr.net/npm/requestanimationfunction/requestAnimationFunction.js";
export class Node {
  constructor({
    value,
    key
  }, _request_paint) {
    this.element = this.createElement();
    this.element.classList.add("node"); // this.element.part.add("node-circle");

    this.element.node = this;
    let x = value && value.x || 0;
    let y = value && value.y || 0;
    let radius = value && !isNaN(value.radius) ? value.radius : 10;

    const request_paint = async node => {
      try {
        await _request_paint(node);
      } catch (error) {
        console.error(error);
      }
    };

    Object.defineProperties(this, {
      x: {
        set(value) {
          x = value;
          request_paint(this);
        },

        get() {
          return x;
        },

        configurable: true,
        enumerable: true
      },
      y: {
        set(value) {
          y = value;
          request_paint(this);
        },

        get() {
          return y;
        },

        configurable: true,
        enumerable: true
      },
      radius: {
        set(value) {
          if (!isNaN(value)) {
            radius = Math.max(0, value);
            request_paint(this);
          }
        },

        get() {
          return radius;
        },

        configurable: true,
        enumerable: true
      }
    });
    Object.assign(this, {
      value,
      key
    });

    if (isNaN(this.x)) {
      this.x = 0;
    }

    if (isNaN(this.y)) {
      this.y = 0;
    }
  }

  paint() {
    const {
      x,
      y,
      radius
    } = this; // this.element.setAttribute("cx", x);

    if (x + 0 === x) {
      this.element.cx.baseVal.value = x;
    } // this.element.setAttribute("cy", y);


    if (y + 0 === y) {
      this.element.cy.baseVal.value = y;
    } // this.element.setAttribute("r", radius);


    if (radius + 0 === radius) {
      this.element.r.baseVal.value = radius;
    }
  }

  createElement() {
    return document.createElementNS("http://www.w3.org/2000/svg", "circle");
  }

}
;
export class Link {
  constructor({
    value,
    source,
    target
  }) {
    this.element = this.createElement();
    this.element.classList.add("link"); // this.element.part.add("link-path");

    this.element.link = this;
    Object.assign(this, {
      value,
      source,
      target
    });
    this.requestPaint = requestAnimationFunction(this.paint.bind(this));
  }

  paint() {
    const {
      source,
      target
    } = this;
    let path_d;

    if (source.x === target.x && source.y === target.y) {
      const short = source.radius / 3;
      const long = source.radius * 3;
      path_d = `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`;
    } else {
      if (this.isArrowShown) {
        const x_diff = target.x - source.x;
        const y_diff = target.y - source.y;
        const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
        const xr_diff = x_diff / r_diff;
        const yr_diff = y_diff / r_diff;
        const offset = 2;
        const m_x = target.x - xr_diff * offset;
        const m_y = target.y - yr_diff * offset;
        path_d = `M ${source.x} ${source.y}L ${m_x} ${m_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m_x} ${m_y}`;
      } else {
        path_d = `M ${source.x} ${source.y}L ${target.x} ${target.y}`;
      }
    }

    this.element.setAttribute("d", path_d);
  }

  get isArrowShown() {
    return this.value && this.value.isArrowShown;
  }

  set isArrowShown(value) {
    this.element.classList.toggle("show-arrow", value);

    if (!this.value) {
      this.value = {};
    }

    this.value.isArrowShown = value;
  }

  createElement() {
    return document.createElementNS("http://www.w3.org/2000/svg", "path");
  }

}