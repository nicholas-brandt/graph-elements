importScripts("https://unpkg.com/d3@5.5.0/dist/d3.min.js");
// importScripts("https://d3js.org/d3.v4.min.js");
// importScripts("../../helper/associate.js");

const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const gravitation_force = d3.forceRadial(0);
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
let running = false;
simulation.force("position", gravitation_force);
simulation.force("link", link_force);
simulation.force("center", center_force);
simulation.force("charge", charge_force);
simulation.stop();

const attributes = ["alpha", "alphaMin", "alphaTarget", "alphaDecay", "velocityDecay"];
const link_attributes = ["distance", "strength"];
const charge_attributes = ["strength", "distanceMax", "distanceMin"];
const gravitation_attributes = ["strength"];

const configuration = {};
const link_configuration = {};
const charge_configuration = {};
const gravitation_configuration = {};
Object.defineProperties(configuration, {
    link: {
        get() {
            return link_configuration;
        },
        set(value) {
            Object.assign(link_configuration, value);
        },
        enumerable: true,
        configurable: true
    },
    charge: {
        get() {
            return charge_configuration;
        },
        set(value) {
            Object.assign(charge_configuration, value);
        },
        enumerable: true,
        configurable: true
    },
    gravitation: {
        get() {
            return gravitation_configuration;
        },
        set(value) {
            Object.assign(gravitation_configuration, value);
        },
        enumerable: true,
        configurable: true
    }
});
associate(configuration, simulation, attributes);
associate(configuration.link, link_force, link_attributes);
associate(configuration.charge, charge_force, charge_attributes);
associate(configuration.gravitation, gravitation_force, gravitation_attributes);

let buffer_array;

simulation.on("tick", () => {
    const nodes = simulation.nodes();
    for (let i = 0; i < nodes.length; ++i) {
        const node = nodes[i];
        buffer_array[i * 2] = node.x;
        buffer_array[i * 2 + 1] = node.y;
    }
    // console.log(nodes.map(JSON.stringify), buffer_array);
    // dispatch draw message to main window
    // write graph data into buffer
    const buffer_length = buffer_array.buffer.byteLength;
    // console.log("WORKER: buffer length", buffer_length);
    // transfer buffer for faster propagation to display
    postMessage({
        buffer: buffer_array.buffer,
        alpha: simulation.alpha()
    }, [buffer_array.buffer]);
    buffer_array = new Float32Array(new ArrayBuffer(buffer_length));
});
simulation.on("end", () => {
    // end yields no new simulation step
    postMessage({
        end: true
    });
});

addEventListener("message", ({ data }) => {
    console.log("WORKER: get message", data);
    if (data.configuration) {
        Object.assign(configuration, data.configuration);
        if (data.configuration.link) {
            simulation.force("link", link_force);
        }
        if (data.configuration.charge) {
            simulation.force("charge", charge_force);
        }
        for (const attribute of attributes) {
            if (attribute in data.configuration) {
                simulation[attribute](data.configuration[attribute]);
            }
        }
    }
    if (data.graph && data.buffer) {
        buffer_array = new Float32Array(data.buffer);
        const { nodes, links } = data.graph;
        simulation.nodes(nodes);
        link_force.links(links);
        if (running) {
            simulation.restart();
        }
    }
    if (data.updatedNode && data.updatedNode[Symbol.iterator]) {
        let i = 0;
        const nodes = simulation.nodes();
        for (const updated_node of data.updatedNode) {
            const node = nodes[i++];
            node.x = updated_node.x;
            node.y = updated_node.y;
        }
    }
    if ("run" in data && data.run !== undefined) {
        if (data.run) {
            simulation.restart();
            running = true;
        } else {
            simulation.stop();
            running = false;
        }
    }
    if (false && data.getConfiguration) {
        const data = {
            configuration: Object.assign({}, configuration, {
                link: Object.assign({}, configuration.link),
                charge: Object.assign({}, configuration.charge)
            })
        };
        postMessage(data);
    }
});

function associate(proxy, target, attributes) {
    const descriptors = {};
    for (const attribute of attributes) {
        descriptors[attribute] = {
            get() {
                console.assert(typeof target[attribute] == "function", "invalid attribute", attribute);
                return target[attribute]();
            },
            set(value) {
                console.assert(typeof target[attribute] == "function", "invalid attribute", attribute);
                target[attribute](value);
            },
            enumerable: true,
            configurable: true
        };
    }
    Object.defineProperties(proxy, descriptors);
}