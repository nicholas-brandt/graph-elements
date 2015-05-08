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
const $config = Symbol();
const $data = Symbol();
const $d3svg = Symbol();
const $graph = Symbol();
const $resize = Symbol();
const $draw = Symbol();
const force_size = 1000;
const min_ratio = 0.35;
export default {
    is: "graphjs-tezcatlipoca",
    // lifecycle
    created() {
        implementConfig(this);
    },
    ready() {
        implementUIBehavior(this);
        implementD3(this);
        mixin(this.config, this.config, mixin.OVERRIDE);
    },
    attached() {
        addEventListener("resize", this[$resize]);
    },
    detached() {
        removeEventListener("resize", this[$resize]);
    },
    // get/set
    get svg() {
        return this.$.svg;
    },
    get force() {
        return this[$force];
    },
    get config() {
        return this[$config];
    },
    set config(config) {
        mixin(this[$config], config, mixin.OVERRIDE);
    },
    get graph() {
        return this[$graph];
    },
    set graph(graph) {
        this[$graph] = graph;
        this.updateGraph();
    },
    // delegators
    draw() {
        this[$draw]();
    },
    resize() {
        this[$resize]();
    },
    // helpers
    updateGraph() {
        console.log("update graph");
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
            const entering_circles = circles.enter().append("circle").attr("r", this.config.UI.circle.radius).attr("class", "node");
            implementNodeUIBehavior(this, entering_circles);
            paths.exit().remove();
            circles.exit().remove();
            d3svg.selectAll("circle.node,path.edge").sort((a,b) => ("value" in a) - 0.5);
            force.start();
            // @dirty
            for (let i = 0; i < 10; ++i) force.tick();
            force.alpha(0);
            this.config.d3.force.start();
        } else this.graph = new Graph;
    },
    toNodeCoordinates(x, y) {
        const { width, height } = getComputedStyle(this.svg);
        const ratio = this.config.UI.size.ratio;
        const baseVal = this.svg.viewBox.baseVal;
        return {
            x: x / parseFloat(width) / ratio * force_size,
            y: y / parseFloat(height) / ratio * force_size
        };
    }
};
// configuration
function implementConfig(element) {
    const config = {
        UI: {
            circle: {
                radius: 6
            },
            arrow: {
                width: 5.5,
                ratio: 2
            },
            size: {
                ratio: 2,
                offset: {
                    x: 0,
                    y: 0
                }
            }
        },
        d3: {
            force: {
                charge: -200,
                linkDistance: 30,
                linkStrength: 1,
                gravity: 0.15,
                enabled: true,
                start() {
                    //console.log("start", element.config.d3.force.enabled);
                    if (element.config.d3.force.enabled) {
                        const force = element.force;
                        force.start();
                        force.alpha(0.1);
                    }
                }
            }
        },
        state: {
            mode: "default",
            selected: undefined
        }
    };
    const modifier = {
        UI: {
            circle: {
                radius: {
                    set(radius, set) {
                        radius = parseFloat(radius);
                        if (radius < Infinity && -Infinity < radius) {
                            set(radius);
                            element.force.stop();
                            element.config.d3.force.start();
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
                            element.config.d3.force.start();
                        }
                    }
                },
                ratio: {
                    set(ratio, set) {
                        ratio = Math.abs(parseFloat(ratio));
                        if (ratio < Infinity) {
                            set(ratio);
                            element.force.stop();
                            element.config.d3.force.start();
                        }
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
        },
        d3: {
            force: {
                charge: {
                    set(charge, set) {
                        charge = parseFloat(charge);
                        if (charge < Infinity && -Infinity < charge) {
                            set(charge);
                            element.force.charge(charge).stop();
                            element.config.d3.force.start();
                        }
                    }
                },
                linkDistance: {
                    set(linkDistance, set) {
                        linkDistance = Math.max(0, parseFloat(linkDistance));
                        if (linkDistance < Infinity) {
                            const {
                                width, height
                            } = getComputedStyle(element.svg);
                            set(linkDistance);
                            element.force.linkDistance(linkDistance * 2000 / Math.hypot(parseFloat(width), parseFloat(height))).stop()
                            element.config.d3.force.start();
                        }
                    }
                },
                linkStrength: {
                    set(linkStrength, set) {
                        linkStrength = Math.max(0, parseFloat(linkStrength));
                        if (linkStrength < Infinity) {
                            set(linkStrength);
                            element.force.linkStrength(linkStrength).stop();
                            element.config.d3.force.start();
                        }
                    }
                },
                gravity: {
                    set(gravity, set) {
                        gravity = Math.max(0, parseFloat(gravity));
                        if (gravity < Infinity) {
                            set(gravity);
                            element.force.gravity(gravity).stop();
                            element.config.d3.force.start();
                        }
                    }
                },
                enabled: {
                    set(enabled, set) {
                        set( !! enabled);
                        if (enabled) element.force.start();
                        else element.force.stop();
                    }
                }
            }
        },
        state: {
            mode: {
                set(mode, set) {
                    mode = ["default", "edit"].indexOf(mode) != -1 ? mode : "default";
                    element.setAttribute("mode", mode);
                    element.dispatchEvent(new CustomEvent("modechange", {
                        detail: mode
                    }));
                    set(mode);
                }
            },
            selected: {
                set(selected, set) {
                    console.log("select", selected);
                    const circles = element[$d3svg].selectAll("circle.node");
                    const circle = circles.filter(datum => selected === datum.index).node();
                    circles.each(function() {
                        if (this !== circle) this.classList.remove("selected");
                    });
                    if (circle) {
                        circle.classList.add("selected");
                        set(selected);
                        element.dispatchEvent(new CustomEvent("select", {
                            detail: {
                                circle,
                                datum: circle.__data__
                            }
                        }));
                    } else {
                        element.config.state.mode = "default";
                        set(undefined);
                        element.dispatchEvent(new CustomEvent("deselect"));
                    }
                }
            }
        }
    };
    element[$config] = layer(config, modifier);
}
// d3
function implementD3(element) {
    element[$data] = {};
    element[$d3svg] = d3.select(element.svg);
    const force = d3.layout.force();
    element[$force] = force;
    // drawing
    force.on("tick", element[$draw]);
    // resizing
    force.size([force_size, force_size]);
    element.resize();
    addEventListener("polymer-ready", element[$resize]);
}
// UI behavior
function implementUIBehavior(element) {
    // helpers
    element[$resize] = requestAnimationFunction(() => {
        const svg = element.svg;
        let { width, height } = getComputedStyle(svg);
        const ratio = element.config.UI.size.ratio;
        width = parseFloat(width) / ratio;
        height = parseFloat(height) / ratio;
        mixin(svg.viewBox.baseVal, {
            x: -width / 2,
            y: -height / 2,
            width,
            height
        }, mixin.OVERRIDE);
        element.config.d3.force.linkDistance += 0;
        element.config.d3.force.start();
        element.draw();
    });
    element[$draw] = () => {
        let { x, y, width, height } = element.svg.viewBox.baseVal;
        const offset = element.config.UI.size.offset;
        const ratio = element.config.UI.size.ratio;
        x = x * ratio + offset.x;
        y = y * ratio + offset.y;
        width *= ratio / force_size;
        height *= ratio / force_size;
        const arrow = element.config.UI.arrow;
        const { circles, paths } = element[$data];
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
            //return "M" + tx + "," + ty + "L " + sx + "," + sy;
            // triangle
            return "M" + tx + "," + ty + "L " + px + "," + py + "L " + (sx + wy) + "," + (sy - wx) + "L " + (sx - wy) + "," + (sy + wx) + "L " + px + "," + py;
        });
    };
    const size_transition = layer(element.config.UI.size, {
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
    element.svg.addEventListener("wheel", ({ layerX, layerY, wheelDelta }) => {
        // add offset
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
            element.config.state.selected = undefined;
        }
    });
    // element.svg.addEventListener("click", ({ layerX, layerY }) => console.log(layerX, layerY));
    // pinching
    // @note: pinchstart/pinchend are not yet implemented
    {
        let timeout;
        let last_scale;
        PolymerGestures.addEventListener(element.svg, "pinch", ({ scale, preventTap }) => {
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
            const ratio = element.config.UI.size.ratio;
            element.config.UI.size.offset.x += event.ddx / ratio;
            element.config.UI.size.offset.y += event.ddy / ratio;
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
                element.graph.addNode({});
                element.updateGraph();
            }
        });
    }
}
// Node UI Behavior
function implementNodeUIBehavior(element, selection) {
    console.log("entering circles", selection);
    selection.each(function(datum, index) {
        PolymerGestures.addEventListener(this, "tap", event => {
            console.log("tap on node");
            event.bubbles = false;
            if (element.config.state.mode == "edit") {
                // add edge
                // element.updateGraph();
            } else element.config.state.selected = index;
        });
        PolymerGestures.addEventListener(this, "trackstart", event => {
            event.preventTap();
            event.bubbles = false;
            datum.fixed = true;
        });
        PolymerGestures.addEventListener(this, "track", event => {
            event.bubbles = false;
            const { x, y } = element.toNodeCoordinates(event.ddx, event.ddy);
            datum.px = datum.x += x;
            datum.py = datum.y += y;
            element.draw();
        });
        PolymerGestures.addEventListener(this, "trackend", event => {
            event.bubbles = false;
            datum.fixed = false;
        });
        PolymerGestures.addEventListener(this, "hold", event => {
            console.log("hold on node");
            event.bubbles = false;
            event.preventTap();
            element.config.state.selected = index;
            element.config.state.mode = "edit";
        });
    });
}