Polymer({
    is: "graphjs-app",
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
    },
    _initLocalstorage(event) {
        event.preventDefault();
        event.cancelBubble = true;
        console.log("load", event, this.nodes);
        const graph = this.querySelector("graphjs-graph");
        const value = event.srcElement.value;
        if (value) {
            this.nodes = value.nodes || [];
            this.edges = value.edges || [];
        }
    },
    _initEmptyLocalstorage(event) {
        event.preventDefault();
        event.cancelBubble = true;
        console.log("empty", event);
        event.srcElement.value = this._storage(this.nodes, this.edges);
    },
    _storage(nodes, edges) {
        return {
            nodes,
            edges
        };
    }
});