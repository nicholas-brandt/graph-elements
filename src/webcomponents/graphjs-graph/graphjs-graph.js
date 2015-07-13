Polymer({
    is: "graphjs-graph",
    properties: {
        nodes: {
            type: Array,
            notify: true,
            value: () => []
        },
        edges: {
            type: Array,
            notify: true,
            value: () => []
        }
    }
    /*observers: ["_nodesChange(nodes.*)"],
    _nodesChange(record) {
        console.log("record", record);
    }*/
});