import console from "../helper/console.js";

export function initContextmenu(node) {
    // console.log(node);
    node.contextmenu.querySelector("#key").textContent = "Key: " + node.key;
    const description = node.contextmenu.querySelector("#description");
    description.addEventListener("change", event => {
        node.description = description.value;
    }, {
        passive: true
    });
};

export function showContextmenu(node) {
    const description = node.contextmenu.querySelector("#description");
    description.value = node.description || "";
};