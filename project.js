import { loadCitations } from './opencitation.js';

console.log('init');

// set up display
import './src/graph-display.js';
const display = document.querySelector('graph-display');
globalThis.display = display;

// set up context menu


// load citation data
const citation_generator = loadCitations({ doi: '10.1109/SCT.1995.514853' });
for await (const citation of citation_generator) {
    console.log(citation);
    display.cytoscape.add(citation.citationDOI, citation);
}

// add layout / responsible for positioning the nodes
globalThis.layout = display.cytoscape.layout(display.constructor.layoutOptions);
layout.run();