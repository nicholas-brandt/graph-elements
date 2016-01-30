let graph = document.querySelector("graphjs-graph");
if (!graph) addEventListener("WebComponentsReady", () => {
    graph = document.querySelector("graphjs-graph");
});
const template = document.querySelector("template#loading");
template._onIssueResponse = () => {
    event.preventDefault();
    event.cancelBubble = true;
    for (let issue of event.srcElement.lastResponse) graph.addNode({
        value: issue,
        x: Math.random() * 1000,
        y: Math.random() * 1000,
        radius: 15
    });
};
template._onCommentsResponse = item => {
    event.preventDefault();
    event.cancelBubble = true;
    for (let comment of event.srcElement.lastResponse) {
        const node = {
            value: comment,
            x: Math.random() * 1000,
            y: Math.random() * 1000,
            radius: 15
        };
        graph.addNode(node);
        //graph.addEdge(item, node);
    }
};