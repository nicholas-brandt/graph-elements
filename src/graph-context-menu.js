class GraphContextMenu extends HTMLUListElement {
    constructor() {
        super();
        this.insertAdjacentHTML('beforeend', `
            <li id="action-node">Action for Node</li>
            <li id="action-background">Action for Background</li>
            <li id="action-delete-node">Delete Node</li>
        `);
    }
    showContextmenu(x, y) {
        console.log("show", x, y);
        const { classList, style } = this;
        if (classList.contains("visible")) {
            classList.remove("visible");
        } else {
            classList.add("visible");
        }
        style.left = x + "px";
        style.top = y + "px";
        // prevent overlapping
        const max_x = innerWidth - contextmenu.clientWidth - host.offsetLeft;
        if (parseFloat(x) > max_x) {
            contextmenu.style.left = max_x + "px";
            this.boundX = max_x;
        } else {
            this.boundX = x;
        }
        this.x = x;
        const max_y = innerHeight - contextmenu.clientHeight - host.offsetTop - 1;
        if (parseFloat(y) > max_y) {
            contextmenu.style.top = max_y + "px";
            this.boundY = max_y;
        } else {
            this.boundY = y;
        }
        this.y = y;
    }
}
customElements.define('graph-context-menu', GraphContextMenu, { extends: "ul" });