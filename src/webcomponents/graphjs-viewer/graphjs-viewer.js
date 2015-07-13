(function() {
    var templates = document.currentScript.parentElement.querySelector("template").content.querySelectorAll("svg template");
    Array.prototype.forEach.call(templates, function(template) {
        var new_template = template.ownerDocument.createElement("template");
        template.parentElement.replaceChild(new_template, template);
        Array.prototype.forEach.call(template.attributes, function(attribute) {
            new_template.setAttribute(attribute.name, attribute.value);
        });
        for (var child = template.firstChild; child; child = template.firstChild) new_template.content.appendChild(child);
    });
})();
/*
(function() {
    for (let template of document.currentScript.parentElement.querySelector("template").content.querySelectorAll("svg template")) {
        var new_template = template.ownerDocument.createElement("template");
        template.parentElement.replaceChild(new_template, template);
        for (let attribute of template.attributes) {
            new_template.setAttribute(attribute.name, attribute.value);
        }
        for (var child = template.firstChild; child; child = template.firstChild) new_template.content.appendChild(child);
    }
})();
*/
Polymer({
    is: "graphjs-viewer",
    _trackCircle(event) {
        neutralizeEvent(event);
        event.model.set("item.x", event.model.item.x + (event.detail.ddx || 0));
        event.model.set("item.y", event.model.item.y + (event.detail.ddy || 0));
    },
    _trackCanvas(event) {
        neutralizeEvent(event);
    },
    _holdCircle(event) {
        neutralizeEvent(event);
        console.log(event);
    },
    _holdCanvas(event) {
        neutralizeEvent(event);
        console.log(event);
    },
    _tapCircle(event) {
        neutralizeEvent(event);
        event.model.set("item.selected", true);
    },
    _tapCanvas(event) {
        neutralizeEvent(event);
        this.nodes.forEach(node => {
            node.selected = false;
        });
        this.set("node", this.nodes);
    }
});

function neutralizeEvent(event) {
    event.preventDefault();
    event.cancelBubble = true;
}