/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph } from "../../graph";
import d3 from "../../../node_modules/d3/d3";
import mixin from "../../external/mixin";
import layer from "../../external/layer";
import requestAnimationFunction from "../../external/requestAnimationFunction";
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
        mixin(this[$options_layer], options, mixin.OVERRIDE);
    },
    ready() {
        initializeD3(this);
        this.options = this[$options];
    },
    created() {
        const element = this;
        configureOptions(element);
        element.resize = requestAnimationFunction(() => {
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
            }, mixin.OVERRIDE);
            element.options.force.linkDistance += 0;
            element.options.force.start();
            draw.call(element);
        });
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
            }]]);
            const nodes = [for ([, node] of node_map) node];
            const edges = [for ({source, target} of this.graph.edges) {
                source: node_map.get(source),
                target: node_map.get(target)
            }];
            // forced nodes must be a closed set!
            const force = this.force;
            force.nodes(nodes).links(edges);
            const d3svg = this[$d3svg];
            const circles = d3svg.selectAll("circle.node").data(nodes);
            const paths = d3svg.selectAll("path.edge").data(edges);
            this[$data] = {
                circles,
                paths
            };
            paths.enter().append("path").attr("class", "edge");
            const entering_circles = circles.enter().append("circle").attr("r", this[$options].circle.radius).attr("class", "node");
            implementDrag(this, entering_circles);
            paths.exit().remove();
            circles.exit().remove();
            d3svg.selectAll("circle.node,path.edge").sort((a,b) => ("value" in a) - 0.5);
            force.start();
            for (let i = 0; i < 10; ++i) force.tick();
            force.alpha(0);
            this.options.force.start();
        } else this.graph = new Graph;
    },
    toNodeCoordinates(x, y) {
        const { width, height } = getComputedStyle(this.svg);
        const ratio = this.options.size.ratio;
        const baseVal = this.svg.viewBox.baseVal;
        return {
            x: x / parseFloat(width) / ratio * force_size,
            y: y / parseFloat(height) / ratio * force_size
        };
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
    const size_transition = layer(element.options.size, {
        ratio: {
            translate(ratio) {
                console.log("ratio", ratio);
                element.resize();
            },
            duration: 280
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
    element.svg.addEventListener("wheel", ({layerX, layerY, wheelDelta}) => {
        const { width, height } = getComputedStyle(element.svg);
        //const ratio = element.options.size.ratio;
        //const { x, y } = element.options.size.offset;
        size_transition.ratio = Math.max(0, size_transition.ratio + wheelDelta / 20);
    });
    // selecting
    PolymerGestures.addEventListener(element.svg, "tap", event => {
        console.log("tap");
        event.bubbles = false;
        if (event.srcElement === element.svg) {
            element[$d3svg].selectAll("circle.node").each(function() {
                this.classList.remove("selected");
            });
            element.dispatchEvent(new CustomEvent("deselect"));
        }
    });
    element.svg.addEventListener("click", ({layerX, layerY}) => console.log(layerX, layerY));
    // pinching
    // @note: pinchstart/pinchend are not yet implemented
    {
        let timeout;
        let last_scale;
        PolymerGestures.addEventListener(element.svg, "pinch", ({scale, preventTap}) => {
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
    PolymerGestures.addEventListener(element.svg, "track", event => {
        console.log("track");
        event.bubbles = false;
        if (event.srcElement === element.svg) {
            const ratio = element.options.size.ratio;
            element.options.size.offset.x += event.ddx / ratio;
            element.options.size.offset.y += event.ddy / ratio;
        }
    });
    // adding
    // @note: cannot cancel holdpulse
    {
        let added;
        PolymerGestures.addEventListener(element.svg, "hold", event => {
            console.log("hold");
            event.bubbles = false;
            event.preventTap();
            if (event.srcElement === element.svg) added = false;
        });
        PolymerGestures.addEventListener(element.svg, "holdpulse", function({x, y, srcElement, holdTime}) {
            console.log("holdpulse");
            event.bubbles = false;
            if (srcElement === element.svg && holdTime > 800 && !added) {
                added = true;
                // add node at x,y
                console.log("add node");
                // dirty design
                function getUniqueID() {
                    return element.graph.nodes.size;
                }
                element.graph.addNode(getUniqueID());
                element.updateGraph();
            }
        });
    }
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
            linkDistance: 30,
            linkStrength: 1,
            gravity: 0.15,
            enabled: true,
            start() {
                //console.log("start", element.options.force.enabled);
                if (element.options.force.enabled) {
                    const force = element.force;
                    force.start();
                    force.alpha(0.1);
                }
            }
        },
        size: {
            ratio: 2,
            offset: {
                x: 0,
                y: 0
            }
        }
    };
    element[$options] = options;
    element[$options_layer] = layer(options, {
        circle: {
            radius: {
                set(radius, set) {
                    radius = parseFloat(radius);
                    if (radius < Infinity && -Infinity < radius) {
                        set(radius);
                        element.force.stop();
                        element.options.force.start();
                    }
                }
            }
        },
        arrow: {
            width: {
                set(width, set) {
                    width = parseFloat(width);
                    if (width < Infinity && -Infinity < width) {
                        set(width);
                        element.force.stop();
                        element.options.force.start();
                    }
                }
            },
            ratio: {
                set(ratio, set) {
                    ratio = Math.abs(parseFloat(ratio));
                    if (ratio < Infinity) {
                        set(ratio);
                        element.force.stop();
                        element.options.force.start();
                    }
                }
            }
        },
        force: {
            charge: {
                set(charge, set) {
                    charge = parseFloat(charge);
                    if (charge < Infinity && -Infinity < charge) {
                        set(charge);
                        element.force.charge(charge).stop();
                        element.options.force.start();
                    }
                }
            },
            linkDistance: {
                set(linkDistance, set) {
                    linkDistance = Math.max(0, parseFloat(linkDistance));
                    if (linkDistance < Infinity) {
                        const { width, height } = getComputedStyle(element.svg);
                        set(linkDistance);
                        element.force.linkDistance(linkDistance * 2000 / Math.hypot(parseFloat(width), parseFloat(height))).stop()
                        element.options.force.start();
                    }
                }
            },
            linkStrength: {
                set(linkStrength, set) {
                    linkStrength = Math.max(0, parseFloat(linkStrength));
                    if (linkStrength < Infinity) {
                        set(linkStrength);
                        element.force.linkStrength(linkStrength).stop();
                        element.options.force.start();
                    }
                }
            },
            gravity: {
                set(gravity, set) {
                    gravity = Math.max(0, parseFloat(gravity));
                    if (gravity < Infinity) {
                        set(gravity);
                        element.force.gravity(gravity).stop();
                        element.options.force.start();
                    }
                }
            },
            enabled : {
                set(enabled, set) {
                    set(!!enabled);
                    if (enabled) element.force.start();
                    else element.force.stop();
                }
            }
        },
        size: {
            ratio: {
                set(ratio, set) {
                    ratio = Math.max(min_ratio, parseFloat(ratio));
                    if (ratio < Infinity) {
                        set(ratio);
                        element.resize();
                    }
                }
            },
            offset: {
                x: {
                    set(x, set) {
                        x = parseFloat(x);
                        if (x < Infinity && -Infinity < x) {
                            set(x);
                            element.resize();
                        }
                    }
                },
                y: {
                    set(y, set) {
                        y = parseFloat(y);
                        if (y < Infinity && -Infinity < y) {
                            set(y);
                            element.resize();
                        }
                    }
                }
            }
        }
    });
}
function implementDrag(element, selection) {
    console.log("entering circles", selection);
    selection.each(function(datum) {
        PolymerGestures.addEventListener(this, "tap", event => {
            event.preventTap();
            event.bubbles = false;
            const circle = this;
            element[$d3svg].selectAll("circle.node").each(function() {
                if (this !== circle) this.classList.remove("selected");
            });
            circle.classList.add("selected");
            element.dispatchEvent(new CustomEvent("select", {
                detail: {
                    circle,
                    datum
                }
            }));
        });
        PolymerGestures.addEventListener(this, "trackstart", event => {
            event.preventTap();
            event.bubbles = false;
            element.force.stop();
        });
        PolymerGestures.addEventListener(this, "track", event => {
            event.bubbles = false;
            const { x, y } = element.toNodeCoordinates(event.ddx, event.ddy);
            datum.x += x;
            datum.y += y;
            draw.call(element);
        });
        PolymerGestures.addEventListener(this, "trackend", event => {
            event.bubbles = false;
            element.options.force.start();
        });
    });
}