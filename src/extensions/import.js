import { Tree } from "../graph";
export function importJSON(object) {
    if (typeof object == "string") object = JSON.parse(object);
    const tree = new Tree(true);
    add({
        value: object
    }, tree);
    return tree;
}

function add(host_node, tree) {
    tree.addNode(host_node);
    if (typeof host_node.value == "object")
        for (let key in host_node.value) {
            const child_node = {
                value: host_node.value[key]
            };
            add(child_node, tree);
            tree.addEdge(host_node, child_node);
        }
}