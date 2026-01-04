import cytoscape from './cytoscape.js';
// import cytoscape from 'https://cdn.jsdelivr.net/npm/cytoscape/dist/cytoscape.esm.min.js';
import cyto_euler from '../cytoscape.js-euler/cytoscape-euler.js';
import { getAllKeysInPrototypeChain, vscodePostMessage } from './utils.js';
import cytoscape_styles from "./cytoscape-styles.js";

// add euler to cytoscape
cytoscape.use(cyto_euler);

// define the display element
export class GraphDisplay extends HTMLElement {
    #cytoscape;
    #container;
    #layout;
    #context_event;
    #modifier_mode_active = false;
    static layoutOptions = {
        name: 'euler',
        // The ideal length of a spring
        // - This acts as a hint for the edge length
        // - The edge length can be longer or shorter if the forces are set to extreme values
        springLength: edge => 500,
        // Hooke's law coefficient
        // - The value ranges on [0, 1]
        // - Lower values give looser springs
        // - Higher values give tighter springs
        springCoeff: edge => 0.000008,
        // The mass of the node in the physics simulation
        // - The mass affects the gravity node repulsion/attraction
        mass: node => 4,
        // Coulomb's law coefficient
        // - Makes the nodes repel each other for negative values
        // - Makes the nodes attract each other for positive values
        gravity: -500,
        // A force that pulls nodes towards the origin (0, 0)
        // Higher values keep the components less spread out
        pull: 0.001,
        // Theta coefficient from Barnes-Hut simulation
        // - Value ranges on [0, 1]
        // - Performance is better with smaller values
        // - Very small values may not create enough force to give a good result
        theta: 0.666,
        // Friction / drag coefficient to make the system stabilise over time
        dragCoeff: 0.01,
        // When the total of the squared position deltas is less than this value, the simulation ends
        movementThreshold: .5,
        // The amount of time passed per tick
        // - Larger values result in faster runtimes but might spread things out too far
        // - Smaller values produce more accurate results
        timeStep: 20,
        // The number of ticks per frame for animate:true
        // - A larger value reduces rendering cost but can be jerky
        // - A smaller value increases rendering cost but is smoother
        refresh: 20,
        // Whether to animate the layout
        // - true : Animate while the layout is running
        // - false : Just show the end result
        // - 'end' : Animate directly to the end result
        animate: true,
        // Animation duration used for animate:'end'
        animationDuration: undefined,
        // Easing for animate:'end'
        animationEasing: undefined,
        // Maximum iterations and time (in ms) before the layout will bail out
        // - A large value may allow for a better result
        // - A small value may make the layout end prematurely
        // - The layout may stop before this if it has settled
        maxIterations: 10000,
        maxSimulationTime: 40000,
        // Prevent the user grabbing nodes during the layout (usually with animate:true)
        ungrabifyWhileSimulating: false,
        // Whether to fit the viewport to the repositioned graph
        // true : Fits at end of layout for animate:false or animate:'end'; fits on each frame for animate:true
        fit: true,
        // Padding in rendered co-ordinates around the layout
        padding: 30,
        // Constrain layout bounds with one of
        // - { x1, y1, x2, y2 }
        // - { x1, y1, w, h }
        // - undefined / null : Unconstrained
        boundingBox: undefined,
        // Layout event callbacks; equivalent to `layout.one('layoutready', callback)` for example
        ready: function () { }, // on layoutready
        stop: function () { }, // on layoutstop
        // Whether to randomize the initial positions of the nodes
        // true : Use random positions within the bounding box
        // false : Use the current node positions as the initial positions
        randomize: false
    };
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.innerHTML = `<slot name="features"></slot><slot></slot>`;
        this.insertAdjacentHTML('beforeend', `
            <div id="graph-container" slot="features"></div>
            <ul is="graph-context-menu" slot="features"></ul>
            `);
        this.#container = this.querySelector('#graph-container');

        // initalize cytoscape
        this.#cytoscape = cytoscape({
            container: this.#container,
            zoom: 1,
            pan: { x: 0, y: 0 },
            // interaction options:
            minZoom: 1e-50,
            maxZoom: 1e50,
            zoomingEnabled: true,
            userZoomingEnabled: true,
            panningEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: true,
            selectionType: 'single',
            touchTapThreshold: 8,
            desktopTapThreshold: 4,
            autolock: false,
            autoungrabify: false,
            autounselectify: false,
            multiClickDebounceTime: 250,
            // rendering options:
            headless: false,
            style: cytoscape_styles,
            styleEnabled: true,
            hideEdgesOnViewport: false,
            textureOnViewport: false,
            motionBlur: false,
            motionBlurOpacity: 0.2,
            wheelSensitivity: 1,
            pixelRatio: 'auto'
        });

        // initialize layout
        this.#layout = this.#cytoscape.layout(GraphDisplay.layoutOptions);

        // initialize contextmenu
        // add cytoscape gestures
        this.#cytoscape.on('cxttap', this._oncontextmenu.bind(this));
        // redispatch contextmenu events to escape shadow DOM to be picked up by vscode
        this.shadowRoot.addEventListener('contextmenu', event => {
            if (!event.redispatched) {
                const new_event = new Event(event.type, {
                    bubbles: true,
                    composed: true
                });
                for (const key of getAllKeysInPrototypeChain(event)) {
                    try {
                        new_event[key] = event[key];
                    } catch (error) { }
                }
                new_event.redispatched = true;
                // console.debug(event, new_event);
                this.dispatchEvent(new_event);
            }
        });

        // listen for graph changes and notify vscode
        this.#cytoscape.on('add remove data position lock unlock', event => {
            console.debug('graph-changed', event);
            vscodePostMessage({
                command: 'graph-changed',
                value: this.getSerializedGraph()
            });
        });

        // add listener for node selection
        this.#cytoscape.on('select', this._onselectnode.bind(this));
        this.#cytoscape.on('tap', this._ontap.bind(this));
        this.#cytoscape.on('taphold', 'node', this._ontaphold.bind(this));
    }
    addNode() {
        console.debug("add-node");
        this.#cytoscape.add({
            group: 'nodes',
            position: this.#context_event.position
        });
    }
    deleteNode() {
        console.debug("delete-node");
        this.#cytoscape.remove(this.#context_event.target);
    }
    _oncontextmenu(event) {
        console.debug('cxttap', event);
        this.event = event;
        if (event.target === this.#cytoscape) {
            console.debug('Right-clicked on the background', event);
        } else {
            console.debug('Right-clicked on a node or edge', event.target.data());
        }
        this.#context_event = event;
    }
    _onselectnode(event) {
        console.debug('selectnode', event);
    }
    _ontap(event) {
        console.debug('tap', event);
        if (event.target === this.#cytoscape) {
            console.debug('Tapped on the background', event);
            this.#modifier_mode_active = false;
        } else {
            console.debug('Tapped on a node or edge', event.target.data());
        }
    }
    _ontaphold(event) {
        console.debug('taphold', event);
        const node = event.target;
        node.addClass('modified');
        this.#modifier_mode_active = true;
    }
    get cytoscape() {
        return this.#cytoscape;
    }
    get container() {
        return this.#container;
    }
    get layout() {
        return this.#layout;
    }
    getSerializedGraph() {
        return JSON.stringify(this.#cytoscape.json());
    }
    setSerializedGraph(serialized_graph) {
        this.#cytoscape.json(JSON.parse(serialized_graph));
    }
    get selectedNodes() {
        return this.#cytoscape.nodes(':selected');
    }
}

customElements.define('graph-display', GraphDisplay);