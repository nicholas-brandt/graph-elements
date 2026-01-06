const primary_color = "#999999";
const secondary_color = "#4285F4";
const tertiary_color = "#D2E3FC";

const stylesheet = [
    {
        selector: 'node:selected',
        style: {
            'background-color': secondary_color,
            'label': 'data(id)'
        }
    },
    {
        selector: 'node.modified',
        style: {
            'background-color': tertiary_color,
            'border-style': 'dashed',
            'border-width': "1px"
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': tertiary_color,
            'target-arrow-color': tertiary_color,
            'target-arrow-shape': 'triangle'
        }
    }
];
export default stylesheet;