"use strict";

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

Polymer({
    is:"graphjs-viewer",
    ready:function ready() {
        this.nodes = [ {
            x:3,
            y:5
        }, {
            x:4,
            y:2
        } ];
    },
    properties:{
        nodes:Array
    }
});