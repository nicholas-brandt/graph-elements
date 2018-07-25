import console from "../helper/console.js";

export default function initNodeContextmenu(node) {
    // console.log(node);
    node.contextmenu.querySelector("#key").textContent = "key: " + node.key;
    const description = node.contextmenu.querySelector("#description");
    description.value = node.description || "";
    description.addEventListener("change", event => {
        node.description = description.value;
    }, {
        passive: true
    });
};