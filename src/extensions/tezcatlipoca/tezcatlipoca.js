/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph } from "../../graph";
import d3 from "../../../node_modules/d3/d3";
import mixin from "../../external/mixin";
import layer from "../../external/layer";
import proxy from "../../external/proxy";
import requestAnimationFunction from "../../external/requestAnimationFunction";
const $force = Symbol();
const $config = Symbol();
const $config_layer = Symbol();
const $config_modifier = Symbol();
const $config_change_callback = Symbol();
const $proxy_handler = Symbol();
const $data = Symbol();
const $d3svg = Symbol();
const $graph = Symbol();
const $graph_change_callback = Symbol();
const $resize = Symbol();
const $draw = Symbol();
const force_size = 1000;
const min_zoom = 0.35;
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
        // @dirty
        this.resize();
        addEventListener("polymer-ready", this[$resize]);
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
        return this[$config_layer];
    },
    set config(config) {
        mixin(this[$config_layer], config, mixin.OVERRIDE);
    },
    get graph() {
        return this[$graph];
    },
    set graph(graph) {
        this[$graph] = graph;
        this.updateGraph();
    },
    get proxyHandler() {
        return this[$proxy_handler];
    },
    set proxyHandler(handler) {
        this[$proxy_handler] = handler;
        this[$config_layer] = layer(proxy(this[$config], handler), this[$config_modifier], this[$config_change_callback]);
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
            let index = 0;
            const node_map = this.graph.nodes;
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
            d3svg.selectAll("circle.node,path.edge").sort((a,b) => ("index" in a) - 0.5);
            const state = this.config.state;
            state.selected = state.selected;
            this.startForce();
        } else this.graph = new Graph(true);
        this[$graph_change_callback]();
    },
    toNodeCoordinates(x, y) {
        const { width, height } = getComputedStyle(this.svg);
        const zoom = this.config.UI.size.zoom;
        const baseVal = this.svg.viewBox.baseVal;
        return {
            x: x / parseFloat(width) / zoom * force_size,
            y: y / parseFloat(height) / zoom * force_size
        };
    },
    startForce() {
        console.log("start force", this.force.alpha());
        if (this.config.d3.force.enabled) {
            if (!this.force.alpha()) this.force.start();
        } else this.draw();
    }
};
// configuration
function implementConfig(element) {
    element[$config] = {
        UI: {
            circle: {
                radius: 6
            },
            arrow: {
                width: 5.5,
                ratio: 2
            },
            size: {
                zoom: 2,
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
                enabled: false
            }
        },
        state: {
            mode: "default",
            selected: undefined
        }
    };
    element[$config_modifier] = {
        UI: {
            circle: {
                radius: {
                    set(radius, set) {
                        radius = parseFloat(radius);
                        if (radius < Infinity && -Infinity < radius) {
                            set(radius);
                            element.updateGraph();
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
                            element.updateGraph();
                        }
                    }
                },
                ratio: {
                    set(ratio, set) {
                        ratio = Math.abs(parseFloat(ratio));
                        if (ratio < Infinity) {
                            set(ratio);
                            element.updateGraph();
                        }
                    }
                }
            },
            size: {
                zoom: {
                    set(zoom, set) {
                        zoom = Math.max(min_zoom, parseFloat(zoom));
                        if (zoom < Infinity) {
                            set(zoom);
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
                            element.force.charge(charge);
                            element.startForce();
                        }
                    }
                },
                linkDistance: {
                    set(linkDistance, set) {
                        linkDistance = Math.max(0, parseFloat(linkDistance));
                        if (linkDistance < Infinity) {
                            const { width, height } = getComputedStyle(element.svg);
                            set(linkDistance);
                            element.force.linkDistance(linkDistance * 2000 / Math.hypot(parseFloat(width), parseFloat(height)));
                            element.startForce();
                        }
                    }
                },
                linkStrength: {
                    set(linkStrength, set) {
                        linkStrength = Math.max(0, parseFloat(linkStrength));
                        if (linkStrength < Infinity) {
                            set(linkStrength);
                            element.force.linkStrength(linkStrength);
                            element.startForce();
                        }
                    }
                },
                gravity: {
                    set(gravity, set) {
                        gravity = Math.max(0, parseFloat(gravity));
                        if (gravity < Infinity) {
                            set(gravity);
                            element.force.gravity(gravity);
                            element.startForce();
                        }
                    }
                },
                enabled: {
                    set(enabled, set) {
                        set(!!enabled);
                        if (enabled) element.startForce();
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
                    if (isNaN(selected)) selected = undefined;
                    const circles = element[$d3svg].selectAll("circle.node");
                    const circle = circles.filter(function() {
                        return selected === this.__data__.index;
                    }).node();
                    circles.each(function() {
                        if (this !== circle) this.classList.remove("selected");
                    });
                    if (circle && selected !== undefined) {
                        circle.classList.add("selected");
                        set(selected);
                    } else {
                        element.config.state.mode = "default";
                        set(undefined);
                    }
                }
            }
        }
    };
    element[$config_change_callback] = requestAnimationFunction(() => {
        console.log("dispatch config change");
        element.dispatchEvent(new CustomEvent("configchange"));
    });
    element.proxyHandler = {};
    // helpers
    element[$graph_change_callback] = requestAnimationFunction(() => {
        console.log("dispatch graph change");
        element.dispatchEvent(new CustomEvent("graphchange"));
    });
    element[$resize] = requestAnimationFunction(() => {
        const svg = element.svg;
        let { width, height } = getComputedStyle(svg);
        const zoom = element.config.UI.size.zoom;
        width = parseFloat(width) / zoom;
        height = parseFloat(height) / zoom;
        mixin(svg.viewBox.baseVal, {
            x: -width / 2,
            y: -height / 2,
            width,
            height
        }, mixin.OVERRIDE);
        element.config.d3.force.linkDistance += 0;
    });
    element[$draw] = requestAnimationFunction(() => {
        console.log("draw");
        let { x, y, width, height } = element.svg.viewBox.baseVal;
        const offset = element.config.UI.size.offset;
        const zoom = element.config.UI.size.zoom;
        x = x * zoom + offset.x;
        y = y * zoom + offset.y;
        width *= zoom / force_size;
        height *= zoom / force_size;
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
    });
}
// d3
function implementD3(element) {
    element[$data] = {};
    element[$d3svg] = d3.select(element.svg);
    const force = d3.layout.force();
    element[$force] = force;
    // drawing
    force.on("tick", element[$draw]);
    // saving
    force.on("end", element[$graph_change_callback]);
    // resizing
    force.size([force_size, force_size]);
}
// UI behavior
function implementUIBehavior(element) {
    const size_transition = layer(element.config.UI.size, {
        zoom: {
            translate(zoom) {
                console.log("zoom", zoom);
            },
            duration: 280
        },
        offset: {
            x: {
                translate(x) {
                    console.log("x", x);
                }
            },
            y: {
                translate(y) {
                    console.log("y", y);
                }
            }
        },
    });
    // scrolling
    element.svg.addEventListener("wheel", ({ layerX, layerY, wheelDelta }) => {
        // add offset
        size_transition.zoom = Math.max(0, size_transition.zoom + wheelDelta / 20);
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
                size_transition.zoom = Math.max(0, size_transition.zoom + (scale - last_scale) * 2);
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
            const zoom = element.config.UI.size.zoom;
            element.config.UI.size.offset.x += event.ddx / zoom;
            element.config.UI.size.offset.y += event.ddy / zoom;
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
        PolymerGestures.addEventListener(element.svg, "holdpulse", function({ x, y, srcElement, holdTime }) {
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
    const graph = element.graph;
    const state = element.config.state;
    selection.each(function() {
        console.log("each");
        PolymerGestures.addEventListener(this, "tap", event => {
            console.log("tap on node", this.__data__.index);
            event.bubbles = false;
            if (state.mode == "edit") {
                const node_map = new Map([for ([key, { index }] of graph.nodes) [index, key]]);
                // add edge
                const edge = [node_map.get(state.selected), node_map.get(this.__data__.index)];
                if (graph.hasEdge(...edge)) graph.removeEdge(...edge);
                else graph.addEdge(...edge);
                element.updateGraph();
            } else state.selected = this.__data__.index;
        });
        PolymerGestures.addEventListener(this, "trackstart", event => {
            event.preventTap();
            event.bubbles = false;
            this.__data__.fixed = true;
        });
        PolymerGestures.addEventListener(this, "track", event => {
            event.bubbles = false;
            const { x, y } = element.toNodeCoordinates(event.ddx, event.ddy);
            const datum = this.__data__;
            datum.px = datum.x += x;
            datum.py = datum.y += y;
            element.draw();
        });
        PolymerGestures.addEventListener(this, "trackend", event => {
            event.bubbles = false;
            this.__data__.fixed = false;
        });
        PolymerGestures.addEventListener(this, "hold", event => {
            console.log("hold on node");
            event.bubbles = false;
            event.preventTap();
            state.selected = this.__data__.index;
            state.mode = "edit";
        });
    });
}