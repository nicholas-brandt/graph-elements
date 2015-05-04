/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph } from "../../graph";
import d3 from "../../../node_modules/d3/d3";
import mixin from "../../external/mixin";
import layer from "../../external/layer";
import transition from "../../external/transition";
const $force = Symbol();
const $options = Symbol();
const $options_layer = Symbol();
const $data = Symbol();
const $d3svg = Symbol();
const force_size = 1000;
const min_ratio = 0.35;
export default {
    is: "graphjs-tezcatlipoca",
    get svg() {
        return this.$.svg;
    },
    get force() {
        return this[$force];
    },
    get options() {
        return this[$options_layer];
    },
    set options(options) {
        mixin(this[$options_layer], options, {
            weak: false,
            assign: true
        });
    },
    ready() {
        initializeD3(this);
        this.options = this[$options];
    },
    created() {
        const element = this;
        configureOptions(element);
        element.resize = () => {
            requestAnimationFrame(() => {
                const svg = element.svg;
                let { width, height } = getComputedStyle(svg);
                const ratio = element[$options].size.ratio;
                width = parseFloat(width) / ratio;
                height = parseFloat(height) / ratio;
                mixin(svg.viewBox.baseVal, {
                    x: -width / 2,
                    y: -height / 2,
                    width,
                    height
                }, {
                    weak: false,
                    assign: true
                });
                const force = element[$force];
                force.alpha(0.1);
            });
        };
    },
    attached() {
        addEventListener("resize", this.resize);
    },
    detached() {
        removeEventListener("resize", this.resize);
    },
    observe: {
        graph: "updateGraph"
    },
    updateGraph() {
        if (this.graph) {
            const node_map = new Map([for ([i] of this.graph.nodes) [i, {
                value: i
                //x: Math.random(),
                //y: Math.random()
            }]]);
            const nodes = [for ([, node] of node_map) node];
            const edges = [for ({source, target} of this.graph.edges) {
                source: node_map.get(source),
                target: node_map.get(target)
            }];
            // forced nodes must be a closed set!
            const force = this[$force];
            force.nodes(nodes).links(edges);
            const d3svg = this[$d3svg];
            const circles = d3svg.selectAll("circle.node").data(nodes);
            const paths = d3svg.selectAll("path.edge").data(edges);
            this[$data] = {
                circles,
                paths
            };
            paths.enter().append("path").attr("class", "edge");
            circles.enter().append("circle").attr("r", this[$options].circle.radius).attr("class", "node").call(force.drag);
            paths.exit().remove();
            circles.exit().remove();
            d3svg.selectAll("circle.node,path.edge").sort((a,b) => ("value" in a) - 0.5);
            force.start();
        } else this.graph = new Graph;
    }
};
function initializeD3(element) {
    element[$data] = {};
    element[$d3svg] = d3.select(element.svg);
    const force = d3.layout.force();
    element[$force] = force;
    // drawing
    force.on("tick", draw.bind(element));
    // resizing
    force.size([force_size, force_size]);
    element.resize();
    addEventListener("polymer-ready", element.resize);
    const size_transition = transition(element.options.size, {
        ratio: {
            translate(ratio) {
                console.log("ratio", ratio);
                element.resize();
            },
            duration: 250
        },
        offset: {
            x: {
                translate(x) {
                    console.log("x", x);
                    element.resize();
                }
            },
            y: {
                translate(y) {
                    console.log("y", y);
                    element.resize();
                }
            }
        },
    });
    // scrolling
    element.svg.addEventListener("wheel", function({layerX, layerY, wheelDelta}) {
        const { width, height } = getComputedStyle(element.svg);
        //const ratio = element.options.size.ratio;
        //const { x, y } = element.options.size.offset;
        size_transition.ratio = Math.max(0, size_transition.ratio + wheelDelta / 20);
    });
    element.svg.addEventListener("click", ({layerX, layerY}) => console.log(layerX, layerY));
    // pinching
    // @note: pinchstart/pinchend are not yet implemented
    {
        let timeout;
        let last_scale;
        PolymerGestures.addEventListener(element.svg, "pinch", function({scale, preventTap}) {
            preventTap();
            if (last_scale !== undefined) {
                size_transition.ratio = Math.max(0, size_transition.ratio + (scale - last_scale) * 2);
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    last_scale = undefined;
                }, 1000);
            }
            last_scale = scale;
        });
    }
    // moving
    PolymerGestures.addEventListener(element.svg, "track", function({ddx, ddy, srcElement, preventTap}) {
        console.log("track");
        preventTap();
        if (srcElement === element.svg) {
            const ratio = element.options.size.ratio;
            element.options.size.offset.x += ddx / ratio;
            element.options.size.offset.y += ddy / ratio;
        }
    });
}
function draw() {
    let { x, y, width, height } = this.svg.viewBox.baseVal;
    const offset = this.options.size.offset;
    const ratio = this.options.size.ratio;
    x = x * ratio + offset.x;
    y = y * ratio + offset.y;
    width *= ratio / force_size;
    height *= ratio / force_size;
    const arrow = this.options.arrow;
    const { circles, paths } = this[$data];
    if (circles) circles.attr("transform", node => "translate(" + (node.x * width + x) + "," + (node.y * height + y) + ")");
    if (paths) paths.attr("d", ({source, target}) => {
        const sx = source.x * width + x;
        const sy = source.y * height + y;
        const tx = target.x * width + x;
        const ty = target.y * height + y;
        const dx = sx - tx;
        const dy = sy - ty;
        const hyp = Math.hypot(dx, dy);
        let wx = dx / hyp * arrow.width;
        let wy = dy / hyp * arrow.width;
        if (isNaN(wx)) wx = 0;
        if (isNaN(wy)) wy = 0;
        const px = sx - wx * arrow.ratio;
        const py = sy - wy * arrow.ratio;
        // line
        //return "M" + source.x + "," + source.y + "L " + target.x + "," + target.y;
        // triangle
        return "M" + tx + "," + ty + "L " + px + "," + py + "L " + (sx + wy) + "," + (sy - wx) + "L " + (sx - wy) + "," + (sy + wx) + "L " + px + "," + py;
    });
}
function configureOptions(element) {
    const options = {
        circle: {
            radius: 6
        },
        arrow: {
            width: 5.5,
            ratio: 2
        },
        force: {
            charge: -200,
            linkDistance: 36,
            linkStrength: 1,
            gravity: 0.15
        },
        size: {
            ratio: 1,
            offset: {
                x: 0,
                y: 0
            }
        }
    };
    element[$options] = options;
    element[$options_layer] = layer(options, {
        circle: {
            radius(radius, set) {
                radius = parseFloat(radius);
                if (radius < Infinity && -Infinity < radius) {
                    set(radius);
                    element[$force].stop().start();
                }
            }
        },
        arrow: {
            width(width, set) {
                width = parseFloat(width);
                if (width < Infinity && -Infinity < width) {
                    set(width);
                    element[$force].stop().start();
                }
            },
            ratio(ratio, set) {
                ratio = Math.abs(parseFloat(ratio));
                if (ratio < Infinity) {
                    set(ratio);
                    element[$force].stop().start();
                }
            }
        },
        force: {
            charge(charge, set) {
                charge = parseFloat(charge);
                if (charge < Infinity && -Infinity < charge) {
                    set(charge);
                    element[$force].charge(charge).stop().start();
                }
            },
            linkDistance(linkDistance, set) {
                linkDistance = Math.max(0, parseFloat(linkDistance));
                if (linkDistance < Infinity) {
                    set(linkDistance);
                    element[$force].linkDistance(linkDistance).stop().start();
                }
            },
            linkStrength(linkStrength, set) {
                linkStrength = Math.max(0, parseFloat(linkStrength));
                if (linkStrength < Infinity) {
                    set(linkStrength);
                    element[$force].linkStrength(linkStrength).stop().start();
                }
            },
            gravity(gravity, set) {
                gravity = Math.max(0, parseFloat(gravity));
                if (gravity < Infinity) {
                    set(gravity);
                    element[$force].gravity(gravity).stop().start();
                }
            }
        },
        size: {
            ratio(ratio, set) {
                ratio = Math.max(min_ratio, parseFloat(ratio));
                if (ratio < Infinity) {
                    set(ratio);
                    element.resize();
                }
            },
            offset: {
                x(x, set) {
                    x = parseFloat(x);
                    if (x < Infinity && -Infinity < x) {
                        set(x);
                        element.resize();
                    }
                },
                y(y, set) {
                    y = parseFloat(y);
                    if (y < Infinity && -Infinity < y) {
                        set(y);
                        element.resize();
                    }
                }
            }
        }
    });
}