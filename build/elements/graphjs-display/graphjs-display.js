/*(function() {
    var templates = document.currentScript.parentElement.querySelector("template").content.querySelectorAll("svg template");
    Array.prototype.forEach.call(templates, template => {
        var new_template = template.ownerDocument.createElement("template");
        template.parentElement.replaceChild(new_template, template);
        Array.prototype.forEach.call(template.attributes, attribute => {
            new_template.setAttribute(attribute.name, attribute.value);
        });
        for (let child = template.firstChild; child; child = template.firstChild) new_template.content.appendChild(child);
    });
})();*/

(function () {
    for (let template of Array.from(document.currentScript.parentElement.querySelector("template").content.querySelectorAll("svg template"))) {
        var new_template = template.ownerDocument.createElement("template");
        template.parentElement.replaceChild(new_template, template);
        Array.prototype.forEach.call(template.attributes, attribute => {
            new_template.setAttribute(attribute.name, attribute.value);
        });
        for (let child = template.firstChild; child; child = template.firstChild) new_template.content.appendChild(child);
    }
})();
Polymer({
    is: "graphjs-display",
    properties: {
        graph: {
            type: Object,
            observer: "graphChanged"
        },
        nodes: {
            type: Array,
            notify: true
        },
        edges: {
            type: Array,
            notify: true
        }
    },
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
        event.model.set("item.selected", !event.model.get("item.selected"));
    },
    _tapCanvas(event) {
        neutralizeEvent(event);
        this.nodes.forEach((node, index) => {
            this.set("nodes." + index + ".selected", false);
        });
    },
    _calcPath({ source, target }, record) {
        //console.log("calcPath", record);
        if (source === target) {
            const short = source.radius / 2;
            const long = source.radius * 2;
            return "M " + source.x + " " + source.y + "c " + short + " " + long + " " + long + " " + short + " 0 0";
        } else {
            const x_diff = target.x - source.x;
            const y_diff = target.y - source.y;
            const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
            const xr_diff = x_diff / r_diff;
            const yr_diff = y_diff / r_diff;
            const offset = 2;
            const m_x = target.x - xr_diff * offset;
            const m_y = target.y - yr_diff * offset;
            return "M " + source.x + " " + source.y + "L " + m_x + " " + m_y + "L " + (target.x + yr_diff) + " " + (target.y - xr_diff) + "l " + -2 * yr_diff + " " + 2 * xr_diff + "L " + m_x + " " + m_y;
        }
    },
    _property(item, property) {
        return item[property];
    },
    graphChanged() {
        this.set("nodes", Array.from(this.graph.nodes.keys()));
        this.set("edges", Array.from(this.graph.edges));
    }
});

function neutralizeEvent(event) {
    event.preventDefault();
    event.cancelBubble = true;
}
