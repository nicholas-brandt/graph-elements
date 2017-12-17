export
class Node {
    constructor({value, key}, request_paint) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.element.classList.add("node");
        let x = value && value.x || 0;
        let y = value && value.y || 0;
        let radius = value && value.radius || 10;
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
                    radius = value;
                    request_paint(this);
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
            key,
        });
        this.x |= 0;
        this.y |= 0;
    }
    paint() {
        const {x, y, radius} = this;
        // this.element.setAttribute("cx", x);
        this.element.cx.baseVal.value = x;
        // this.element.setAttribute("cy", y);
        this.element.cy.baseVal.value = y;
        // this.element.setAttribute("r", radius);
        this.element.r.baseVal.value = radius;
    }
};
export
class Link {
    constructor({value, source, target}) {
        this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.element.classList.add("link");
        Object.assign(this, {
            value,
            source,
            target
        });
    }
    paint() {
        const {source, target} = this;
        let path_d;
        if (source === target || source.x === target.x && source.y === target.y) {
            const short = source.radius / 3;
            const long = source.radius * 3;
            path_d = `M ${source.x} ${source.y}c ${short} ${long} ${long} ${short} 0 0`;
        } else {
            const x_diff = target.x - source.x;
            const y_diff = target.y - source.y;
            const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
            const xr_diff = x_diff / r_diff;
            const yr_diff = y_diff / r_diff;
            const offset = 2;
            const m_x = target.x - xr_diff * offset;
            const m_y = target.y - yr_diff * offset;
            path_d = `M ${source.x} ${source.y}L ${m_x} ${m_y}L ${target.x + yr_diff} ${target.y - xr_diff}l ${-2 * yr_diff} ${2 * xr_diff}L ${m_x} ${m_y}`;
        }
        this.element.setAttribute("d", path_d);
    }
}