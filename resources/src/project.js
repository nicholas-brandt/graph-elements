import { loadCitations } from './opencitation.js';

console.debug('init');

// set up display
import './graph-display.js';
const display = document.querySelector('graph-display');
globalThis.display = display;

// load citation data
async function loadCitationData() {
    const origin_doi = '10.1109/SCT.1995.514853'
    display.cytoscape.add({ data: { id: origin_doi } });
    const citation_generator = loadCitations({ doi: origin_doi, levels: 1 });
    for await (const citation of citation_generator) {
        // console.debug(citation);
        if (!display.cytoscape.hasElementWithId(citation.citationDOI)) {
            display.cytoscape.add({
                group: 'nodes',
                data: {
                    id: citation.citationDOI
                }
            });
        }
        for (const parentDOI of citation.parentDOIs) {
            display.cytoscape.add({
                group: 'edges',
                data: {
                    source: parentDOI,
                    target: citation.citationDOI
                }
            });
        }
    }
}

// add layout / responsible for positioning the nodes
globalThis.layout = display.cytoscape.layout(display.constructor.layoutOptions);
layout.run();

// handle messages from extension
addEventListener('message', event => {
    const { command, serialized_graph } = event.data;
    switch (command) {
        case 'addNode':
            display.addNode();
            break;
        case 'deleteNode':
            display.deleteNode();
            break;
        case 'loadGraph':
            console.debug('loadGraph');
            display.setSerializedGraph(serialized_graph);
    }
});