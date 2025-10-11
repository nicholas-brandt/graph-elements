class GraphContextMenu extends HTMLUListElement {
    #display;
    #ignore_next_tap = false;
    constructor() {
        super();
        this.insertAdjacentHTML('beforeend', `
            <li id="add-node" class="background">Add node</li>
            <li id="delete-node" class="node">Delete Node</li>
        `);
        this.querySelector('#add-node').addEventListener('click', event => this.addNode(event));
        this.querySelector('#delete-node').addEventListener('click', event => this.deleteNode(event));
    }
    set display(display) {
        this.#display = display;

        // add cytoscape gestures
        this.#display.cytoscape.on('cxttap', this._oncontextmenu.bind(this));
        this.#display.cytoscape.on('onetap', this._ontap.bind(this));
        this.#display.cytoscape.on('taphold', this._onhold.bind(this));
    }
    show(x, y) {
        console.log("show", x, y);
        const { classList, style, parentElement } = this;
        classList.add("visible");
        style.left = x + "px";
        style.top = y + "px";
        // prevent overlapping
        const max_x = Math.max(0, parentElement.clientWidth - this.offsetWidth);
        this.x = Math.min(x, max_x);
        style.left = this.x + "px";
        const max_y = Math.max(0, parentElement.clientHeight - this.offsetHeight);
        this.y = Math.min(y, max_y);
        style.top = this.y + "px";
    }
    hide() {
        this.classList.remove("visible");
    }
    addNode(event) {
        console.log("add-node", event);
        this.#display.cytoscape.add({
            group: 'nodes',
            position: this.event.position
        });
        this.hide();
    }
    deleteNode(event) {
        console.log("delete-node", event);
        this.#display.cytoscape.remove(event.target);
        this.hide();
    }
    _ontap(event) {
        if (this.#ignore_next_tap) {
            this.#ignore_next_tap = false;
            return;
        }
        if (event.target === this.#display.cytoscape) {
            console.log('Tapped on the background', event);
            this.selectedNode = null;
            this.hide();
        } else {
            const target_node = event.target;
            console.log('Tapped on a node or edge', target_node.data());
            if (this.selectedNode) {
                // add edge from selectedNode to tapped node or move edge that already exists
                const edges = this.#display.cytoscape.remove(`edge[source="${this.selectedNode.id()}"][target="${target_node.id()}"]`);
                if (edges.length == 0) {
                    this.#display.cytoscape.add({
                        group: 'edges',
                        data: {
                            source: this.selectedNode.id(),
                            target: event.target.id()
                        }
                    });
                }
            }
        }
    }
    _oncontextmenu(event) {
        console.log('cxttap', event);
        this.event = event;
        if (event.target === this.#display.cytoscape) {
            console.log('Right-clicked on the background', event);
            // You can add a background context menu or something similar
            this.dataset.target = "background";
        } else {
            console.log('Right-clicked on a node or edge', event.target.data());
            this.dataset.target = "node";
        }
        const { x, y } = event.renderedPosition;
        this.show(x, y);
    }
    _onhold(event) {
        console.log('taphold', event);
        if (event.target === this.#display.cytoscape) {
            console.log('Long-pressed on the background', event);
        } else {
            console.log('Long-pressed on a node or edge', event.target.data());
            this.selectedNode = event.target;
            this.#ignore_next_tap = true;
        }
    }
}
// await customElements.whenDefined('graph-display');
customElements.define('graph-context-menu', GraphContextMenu, { extends: "ul" });