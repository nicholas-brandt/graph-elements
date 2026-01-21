import cytoscape from './cytoscape.js';
import cyto_euler from './cytoscape-euler.js';
import cyto_klay from './cytoscape-klay.js';
// import cyto_euler from '../cytoscape.js-euler/cytoscape-euler.js';
// import cyto_euler from 'https://cdn.jsdelivr.net/gh/nicholas-brandt/cytoscape.js-euler/cytoscape-euler.js';
import { getAllKeysInPrototypeChain, vscodePostMessage } from './utils.js';
import cytoscape_styles from "./cytoscape-styles.js";

// add layouts to cytoscape
cytoscape.use(cyto_euler);
cytoscape.use(cyto_klay);

// define the display element
export default class GraphDisplay extends HTMLElement {
    #cytoscape;
    #container;
    #context_event;
    static klayLayoutOptions = {
        name: 'klay',
        nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
        fit: true, // Whether to fit
        padding: 20, // Padding on fit
        animate: false, // Whether to transition the node positions
        animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
        animationDuration: 500, // Duration of animation in ms if enabled
        animationEasing: undefined, // Easing of animation if enabled
        transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
        ready: undefined, // Callback on layoutready
        stop: undefined, // Callback on layoutstop
        klay: {
            // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
            addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
            aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
            borderSpacing: 20, // Minimal amount of space to be left to the border
            compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
            crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
            /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
            INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
            cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
            /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
            INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
            direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
            /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
            edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
            edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
            feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
            fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
            /* NONE Chooses the smallest layout from the four possible candidates.
            LEFTUP Chooses the left-up candidate from the four possible candidates.
            RIGHTUP Chooses the right-up candidate from the four possible candidates.
            LEFTDOWN Chooses the left-down candidate from the four possible candidates.
            RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
            BALANCED Creates a balanced layout from the four possible candidates. */
            inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
            layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
            linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
            mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
            mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
            nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
            /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
            LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
            INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
            nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
            /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
            LINEAR_SEGMENTS Computes a balanced placement.
            INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
            SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
            randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
            routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
            separateConnectedComponents: true, // Whether each connected component should be processed separately
            spacing: 200, // Overall setting for the minimal amount of space to be left between objects
            thoroughness: 7 // How much effort should be spent to produce a nice layout..
        },
        priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
    };
    static eulerLayoutOptions = {
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
    static cytoscapeConfig = {
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
        headless: false,
        style: cytoscape_styles,
        styleEnabled: true,
        hideEdgesOnViewport: false,
        textureOnViewport: false,
        motionBlur: false,
        motionBlurOpacity: 0.2,
        wheelSensitivity: 1,
        pixelRatio: 'auto'
    }
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
        console.debug('initialize cytoscape');
        this.#cytoscape = cytoscape({
            container: this.#container,
            ...GraphDisplay.cytoscapeConfig
        });

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
        this.#cytoscape.on('add remove data position lock unlock', this._ongraphchanged.bind(this));

        // add listener for node selection
        this.#cytoscape.on('select', this._onselectnode.bind(this));
        this.#cytoscape.on('tap', this._ontap.bind(this));
        // this.#cytoscape.on('taphold', 'node', this._ontaphold.bind(this));
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
        this.selectedNodes.remove();
        // trigger selection change event
        this._onselectnode();
    }
    setNode(id, data) {
        console.debug("set-node", id, data);
        const node = this.#cytoscape.getElementById(id);
        // parse data as json if possible
        try {
            data = JSON.parse(data);
        } catch (error) { }
        node.data(data);
    }
    toggleEdge(source, target) {
        console.debug("toggle-edge", source, target);
        const existing_edge = this.#cytoscape.edges().filter(edge => {
            return edge.data('source') === source && edge.data('target') === target;
        });
        if (existing_edge.length > 0) {
            this.#cytoscape.remove(existing_edge);
        } else {
            this.#cytoscape.add({
                group: 'edges',
                data: {
                    source,
                    target
                }
            });
        }
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
        vscodePostMessage({
            command: 'selected-node-changed',
            state: 'node-selected',
            value: [...this.selectedNodes].map(node => node.data())
        });
    }
    _ontap(event) {
        try {
            console.debug('tap', event);
            this.cytoscape.autounselectify(false);

            if (event.target === this.#cytoscape) {
                console.debug('Tapped on the background', event);
                // unselect all selected nodes
                this.#cytoscape.nodes().unselect();
            } else {
                const event_node = event.target;
                const event_node_id = event_node.data().id;
                console.debug('Tapped on a node or edge', event_node);
                // if ctrl key is down then toggle edge between tapped node and all selected nodes
                if (event.originalEvent.ctrlKey) {
                    for (const node of this.#cytoscape.nodes(':selected')) {
                        // toggle selection of tapped node
                        this.toggleEdge(node.data().id, event_node_id);
                    }
                } else if (event.originalEvent.shiftKey) {
                    // toggle selection of tapped node
                    if (event_node.selected()) {
                        event_node.unselect();
                    } else {
                        event_node.select();
                    }
                } else {
                    // unselect all selected nodes except tapped node
                    for (const node of this.#cytoscape.nodes()) {
                        if (node.data().id !== event_node_id) {
                            node.unselect();
                        }
                    }
                    event_node.select();
                }
            }
        } finally {
            this.cytoscape.autounselectify(true);
        }
    }
    _ongraphchanged(event) {
        console.debug('graph-changed', event);
        vscodePostMessage({
            command: 'graph-changed',
            value: this.getSerializedGraph()
        });
    }
    /*_ontaphold(event) {
        console.debug('taphold', event);
        const node = event.target;
        node.addClass('modified');
        this.#modifier_mode_active = true;
    }*/
    get cytoscape() {
        return this.#cytoscape;
    }
    get container() {
        return this.#container;
    }
    getSerializedGraph() {
        return JSON.stringify({
            elements: this.#cytoscape.json().elements
        });
    }
    setSerializedGraph(serialized_graph) {
        const { elements } = JSON.parse(serialized_graph);
        this.#cytoscape.json({
            elements,
            ...GraphDisplay.cytoscapeConfig
        });
    }
    get selectedNodes() {
        return this.#cytoscape.nodes(':selected');
    }
};

customElements.define('graph-display', GraphDisplay);