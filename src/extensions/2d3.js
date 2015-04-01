import d3 from "../../node_modules/d3/d3";
import { requestAnimationFunction } from "../external/requestAnimationFunction.c";
const $force = Symbol();
const $svg = Symbol();
const $dom_svg = Symbol();
const $circle_data = Symbol();
const $path_data = Symbol();
const $graph = Symbol();
const $resize = Symbol();
const $drawing = Symbol();
const $options = Symbol();
/**
 * @class User interface
 * Displays the data of the given graph.
 * */
export class D3SVG {
    constructor(svg, graph, {
        circle: {
            radius = 6
        } = {},
        arrow: {
            width = 6,
            ratio = 2
        } = {},
        force: {
            charge = -200,
            linkDistance = 36,
            linkStrength = 2.5,
            gravity = 0.15
        } = {}
    } = {}) {
        if (!svg) throw Error("No svg element specified");
        if (!graph) throw Error("No graph specified");
        this[$options] = {
            circle: {
                radius: radius
            },
            arrow: {
                width: width,
                ratio: ratio
            },
            force: {
                charge: charge,
                linkDistance: linkDistance,
                linkStrength: linkStrength,
                gravity: gravity
            }
        };
        const force = d3.layout.force();
        force.charge(charge);
        force.linkDistance(linkDistance);
        force.linkStrength(linkStrength);
        force.gravity(gravity);
        this[$resize] = requestAnimationFunction(() => {
            const {width, height} = getComputedStyle(svg);
            force.size([parseInt(width), parseInt(height)]);
            force.alpha(0.1);
        });
        this[$drawing] = true;
        this[$graph] = graph;
        this[$dom_svg] = svg;
        this[$force] = force;
        this[$svg] = window.svg = d3.select(svg);
        this[$force].on("tick", () => {
            if (this.drawing) {
                this[$circle_data].attr("transform", node => ("translate(" + node.x + "," + node.y + ")"));
                this[$path_data].attr("d", ({source, target}) => {
                    const dx = source.x - target.x;
                    const dy = source.y - target.y;
                    const hyp = Math.hypot(dx, dy);
                    const wx = dx / hyp * width;
                    const wy = dy / hyp * width;
                    const px = source.x - wx * ratio;
                    const py = source.y - wy * ratio;
                    // line
                    //return "M" + source.x + "," + source.y + "L " + target.x + "," + target.y;
                    // triangle
                    return "M" + target.x + "," + target.y + "L " + px + "," + py + "L " + (source.x + wy) + "," + (source.y - wx) + "L " + (source.x - wy) + "," + (source.y + wx) + "L " + px + "," + py;
                });
            }
        });
        this.resize();
        this.update();
    }
    update() {
        const node_map = new Map([for ([i] of this[$graph].nodes) [i, {
            value: i,
            x: Math.random(),
            y: Math.random()
        }]]);
        const nodes = [for ([, node] of node_map) node];
        const edges = [for ({source, target} of this[$graph].edges) {
            source: node_map.get(source),
            target: node_map.get(target)
        }];
        // forced nodes must be a closed set!
        this[$force].nodes(nodes).links(edges);
        this[$path_data] = this[$svg].selectAll("path").data(edges);
        this[$circle_data] = this[$svg].selectAll("circle").data(nodes);
        this[$path_data].enter().append("path");
        this[$circle_data].enter().append("circle").attr("r", this[$options].circle.radius).call(this[$force].drag);
        this[$path_data].exit().remove();
        this[$circle_data].exit().remove();
    }
    resize() {
        this[$resize]();
    }
    get graph() {
        return this[$graph];
    }
    get force() {
        return this[$force];
    }
    get drawing() {
        return this[$drawing];
    }
    set drawing(drawing = true) {
        return this[$drawing] = !!drawing;
    }
};