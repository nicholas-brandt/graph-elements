/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
import { Graph } from "../../graph";
import d3 from "../../../node_modules/d3/d3";
import mixin from "../../external/mixin";
import layer from "../../external/layer";
const $force = Symbol();
const $options = Symbol();
const $options_layer = Symbol();
const $data = Symbol();
const $d3svg = Symbol();
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
        mixin(this[$options_layer], options, false, true);
    },
    ready() {
        initializeD3(this);
        this.options = this[$options];
    },
    created() {
        const element = this;
        configureOptions(element);
        this.real_options = this[$options];
        element.resize = () => {
            requestAnimationFrame(() => {
                const svg = element.svg;
                let { width, height } = getComputedStyle(svg);
                const ratio = element[$options].size.ratio;
                width = parseFloat(width) / ratio;
                height = parseFloat(height) / ratio;
                svg.viewBox.baseVal.width = width;
                svg.viewBox.baseVal.height = height;
                const force = element[$force];
                force.size([width, height]);
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
    force.on("tick", draw.bind(element));
    element.resize();
    addEventListener("polymer-ready", element.resize);
}
function draw() {
    const { width, ratio } = this[$options].arrow;
    const { circles, paths } = this[$data];
    if (circles) circles.attr("transform", node => "translate(" + node.x + "," + node.y + ")");
    if (paths) paths.attr("d", ({source, target}) => {
        const dx = source.x - target.x;
        const dy = source.y - target.y;
        const hyp = Math.hypot(dx, dy);
        let wx = dx / hyp * width;
        let wy = dy / hyp * width;
        if (isNaN(wx)) wx = 0;
        if (isNaN(wy)) wy = 0;
        const px = source.x - wx * ratio;
        const py = source.y - wy * ratio;
        // line
        //return "M" + source.x + "," + source.y + "L " + target.x + "," + target.y;
        // triangle
        return "M" + target.x + "," + target.y + "L " + px + "," + py + "L " + (source.x + wy) + "," + (source.y - wx) + "L " + (source.x - wy) + "," + (source.y + wx) + "L " + px + "," + py;
    });
}
function configureOptions(element) {
    const options = {
        circle: {
            radius: 6
        },
        arrow: {
            width: 6,
            ratio: 2
        },
        force: {
            charge: -200,
            linkDistance: 36,
            linkStrength: 1,
            gravity: 0.15
        },
        size: {
            ratio: 1
        }
    };
    element[$options] = options;
    element[$options_layer] = layer(options, {
        circle: {
            radius: function(radius, set) {
                radius = parseFloat(radius);
                if (radius < Infinity && -Infinity < radius) {
                    set(radius);
                    element[$force].tick();
                }
            }
        },
        arrow: {
            width: function(width, set) {
                width = parseFloat(width);
                if (charge < Infinity && -Infinity < width) {
                    set(width);
                    element[$force].tick();
                }
            },
            ratio: function(ratio, set) {
                ratio = Math.abs(parseFloat(ratio));
                if (ratio < Infinity) {
                    set(ratio);
                    element[$force].tick();
                }
            }
        },
        force: {
            charge: function(charge, set) {
                charge = parseFloat(charge);
                if (charge < Infinity && -Infinity < charge) {
                    set(charge);
                    element[$force].charge(charge).stop().start();
                }
            },
            linkDistance: function(linkDistance, set) {
                linkDistance = Math.abs(parseFloat(linkDistance));
                if (linkDistance < Infinity) {
                    set(linkDistance);
                    element[$force].linkDistance(linkDistance).stop().start();
                }
            },
            linkStrength: function(linkStrength, set) {
                linkStrength = Math.abs(parseFloat(linkStrength));
                if (linkStrength < Infinity) {
                    set(linkStrength);
                    element[$force].linkStrength(linkStrength).stop().start();
                }
            },
            gravity: function(gravity, set) {
                gravity = Math.abs(parseFloat(gravity));
                if (gravity < Infinity) {
                    set(gravity);
                    element[$force].gravity(gravity).stop().start();
                }
            }
        },
        size: {
            ratio: function(ratio, set) {
                ratio = Math.abs(parseFloat(ratio));
                if (ratio < Infinity) {
                    set(ratio);
                    element.resize();
                }
            }
        }
    });
}