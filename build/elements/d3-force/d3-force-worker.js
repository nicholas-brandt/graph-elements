"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

importScripts("../../../node_modules/d3/build/d3.js");

console.log("worker started");
const simulation = d3.forceSimulation();
const link_force = d3.forceLink();
const center_force = d3.forceCenter(0, 0);
const charge_force = d3.forceManyBody();
simulation.force(link_force);
simulation.force(center_force);
simulation.force(charge_force);
simulation.stop();
simulation.on("tick", () => {
    postMessage({
        nodes: simulation.nodes()
    });
});
addEventListener("message", _ref => {
    let data = _ref.data;

    console.log("worker got message:", data);
    if (data.configuration) {
        var _data$configuration = data.configuration;
        const linkDistance = _data$configuration.linkDistance;
        const linkStrength = _data$configuration.linkStrength;
        const charge = _data$configuration.charge;
        const alpha = _data$configuration.alpha;
        const theta = _data$configuration.theta;

        if (linkDistance) {
            link_force.distance(linkDistance);
        }
        if (linkStrength) {
            link_force.strength(linkStrength);
        }
        if (charge) {
            charge_force.distance(charge);
        }
    }
    if (data.graph) {
        const links = JSON.parse(data.graph.links).map(_ref2 => {
            var _ref3 = _slicedToArray(_ref2, 2);

            let source = _ref3[0];
            let target = _ref3[1];
            return { source, target };
        });
        simulation.nodes(JSON.parse(data.graph.nodes));
        link_force.links(links);
    }
    if (data.run) {
        simulation.restart();
    } else {
        simulation.stop();
    }
});