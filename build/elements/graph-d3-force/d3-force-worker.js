importScripts("https://cdn.jsdelivr.net/npm/d3/dist/d3.min.js"); // importScripts("https://cdn.jsdelivr.net/npm/d3@5.5.0/dist/d3.min.js");

let buffer_array;

function _start() {
  simulation.restart();
}

function _stop() {
  simulation.stop();
}

function _setGraph(d3_graph) {
  const {
    nodes,
    links
  } = d3_graph;
  buffer_array = new Float32Array(nodes.length * 2);

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    buffer_array[i * 2] = node.x;
    buffer_array[i * 2 + 1] = node.y;
  }

  simulation.nodes(nodes);
  link_force.links(links);

  if (tick_promise.has_catch) {
    reject_tick("graph replaced");
  }

  createNewTickPromise();
}

function _setConfiguration(_configuration) {
  Object.assign(configuration, _configuration);

  if (_configuration.link) {
    simulation.force("link", link_force);
  }

  if (_configuration.charge) {
    simulation.force("charge", charge_force);
  }

  for (const attribute of attributes) {
    if (attribute in _configuration) {
      simulation[attribute](_configuration[attribute]);
    }
  }
}

let tick_promise_caught = false;

function _getTickPromise() {
  tick_promise.has_catch = true;
  return tick_promise;
}

function _getEndPromise() {
  return end_promise;
}

const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const gravitation_force = d3.forceRadial(0);
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
simulation.force("position", gravitation_force);
simulation.force("link", link_force); // simulation.force("center", center_force);

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
let resolve_tick, reject_tick;
let tick_promise;
createNewTickPromise();

function createNewTickPromise() {
  tick_promise = new Promise((resolve, reject) => {
    resolve_tick = resolve;
    reject_tick = reject;
  });
} // let k = 0;


simulation.on("tick", () => {
  // if (k++>1e2) {k=0; simulation.stop();return;}
  const nodes = simulation.nodes();

  for (let i = 0; i < nodes.length; ++i) {
    const node = nodes[i];
    buffer_array[i * 2] = node.x;
    buffer_array[i * 2 + 1] = node.y;
  }

  if (resolve_tick) {
    // console.log("buffer", buffer_array.buffer);
    resolve_tick(buffer_array.buffer);
  }

  createNewTickPromise();
});
let resolve_end;
let end_promise = new Promise(resolve => {
  resolve_end = resolve;
});
simulation.on("end", () => {
  // end yields no new simulation step
  if (resolve_end) {
    resolve_end();
  }

  end_promise = new Promise(resolve => {
    resolve_end = resolve;
  });
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