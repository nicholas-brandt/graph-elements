"use strict";

(function() {
    var templates = document.currentScript.parentElement.querySelector("template").content.querySelectorAll("svg template");
    Array.prototype.forEach.call(templates, function(template) {
        var new_template = template.ownerDocument.createElement("template");
        template.parentElement.replaceChild(new_template, template);
        Array.prototype.forEach.call(template.attributes, function(attribute) {
            new_template.setAttribute(attribute.name, attribute.value);
        });
        for (var child = template.firstChild; child; child = template.firstChild) {
            new_template.content.appendChild(child);
        }
    });
})();

Polymer({
    is:"graphjs-viewer",
    _trackCircle:function _trackCircle(event) {
        neutralizeEvent(event);
        event.model.set("item.x", event.model.item.x + (event.detail.ddx || 0));
        event.model.set("item.y", event.model.item.y + (event.detail.ddy || 0));
    },
    _trackCanvas:function _trackCanvas(event) {
        neutralizeEvent(event);
    },
    _holdCircle:function _holdCircle(event) {
        neutralizeEvent(event);
        console.log(event);
    },
    _holdCanvas:function _holdCanvas(event) {
        neutralizeEvent(event);
        console.log(event);
    },
    _tapCircle:function _tapCircle(event) {
        neutralizeEvent(event);
        event.model.set("item.selected", !event.model.get("item.selected"));
    },
    _tapCanvas:function _tapCanvas(event) {
        var _this = this;
        neutralizeEvent(event);
        this.nodes.forEach(function(node, index) {
            _this.set("nodes." + index + ".selected", false);
        });
    },
    _calcPath:function _calcPath(_ref, record) {
        var source = _ref.source;
        var target = _ref.target;
        if (source === target) {
            var short = source.radius / 2;
            var long = source.radius * 2;
            return "M " + source.x + " " + source.y + "c " + short + " " + long + " " + long + " " + short + " 0 0";
        } else {
            var x_diff = target.x - source.x;
            var y_diff = target.y - source.y;
            var r_diff = Math.hypot(x_diff, y_diff) / target.radius;
            var xr_diff = x_diff / r_diff;
            var yr_diff = y_diff / r_diff;
            var offset = 2;
            var m_x = target.x - xr_diff * offset;
            var m_y = target.y - yr_diff * offset;
            return "M " + source.x + " " + source.y + "L " + m_x + " " + m_y + "L " + (target.x + yr_diff) + " " + (target.y - xr_diff) + "l " + -2 * yr_diff + " " + 2 * xr_diff + "L " + m_x + " " + m_y;
        }
    }
});

function neutralizeEvent(event) {
    event.preventDefault();
    event.cancelBubble = true;
}