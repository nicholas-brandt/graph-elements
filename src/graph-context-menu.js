class GraphContextMenu extends HTMLUListElement {
    constructor() {
        super();
        this.insertAdjacentHTML('beforeend', `
            <li id="action-node">Action for Node</li>
            <li id="action-background">Action for Background</li>
            <li id="action-delete-node">Delete Node</li>
        `);
    }
    show(x, y) {
        console.log("show", x, y);
        const { classList, style, parentElement } = this;
        classList.add("visible");
        style.left = x + "px";
        style.top = y + "px";
        // prevent overlapping
        const max_x = parentElement.clientWidth - this.offsetLeft;
        if (parseFloat(x) > max_x) {
            style.left = max_x + "px";
            this.boundX = max_x;
        } else {
            this.boundX = x;
        }
        this.x = x;
        const max_y = parentElement.clientHeight - this.offsetTop;
        if (parseFloat(y) > max_y) {
            style.top = max_y + "px";
            this.boundY = max_y;
        } else {
            this.boundY = y;
        }
        this.y = y;
    }
    hide() {
        this.classList.remove("visible");
    }
}
customElements.define('graph-context-menu', GraphContextMenu, { extends: "ul" });