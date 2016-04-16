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
            observer: "_graphChanged"
        }
    },
    created() {
        this.nodesUpdated = requestAnimationFunction(this._nodesUpdated.bind(this));
    },
    _trackCircle(event) {
        neutralizeEvent(event);
        const node = event.target._node;
        const ddx = event.detail.ddx || 0;
        const ddy = event.detail.ddy || 0;
        node.x += ddx;
        node.y += ddy;
        requestAnimationFrame(() => {
            event.target.cx.baseVal.value += ddx;
            event.target.cy.baseVal.value += ddy;
            const relations = this.graph.get(node);
            for (let [, link] of relations.dependents) link._path.setAttribute("d", this._calcPath(link));
            for (let [, link] of relations.dependencies) link._path.setAttribute("d", this._calcPath(link));
        });
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
        console.log("hold event");
    },
    _tapCircle(event) {
        neutralizeEvent(event);
        event.target._node.selected = !event.target._node.selected;
        this.nodesUpdated();
    },
    _tapCanvas(event) {
        neutralizeEvent(event);
        for (let [node] of this.graph) node.selected = false;
    },
    _calcPath({ source, target }) {
        if (source === target) {
            const short = source.radius / 2;
            const long = source.radius * 2;
            return `M ${ source.x } ${ source.y }c ${ short } ${ long } ${ long } ${ short } 0 0`;
        } else {
            const x_diff = target.x - source.x;
            const y_diff = target.y - source.y;
            const r_diff = Math.hypot(x_diff, y_diff) / target.radius;
            const xr_diff = x_diff / r_diff;
            const yr_diff = y_diff / r_diff;
            const offset = 2;
            const m_x = target.x - xr_diff * offset;
            const m_y = target.y - yr_diff * offset;
            return `M ${ source.x } ${ source.y }L ${ m_x } ${ m_y }L ${ target.x + yr_diff } ${ target.y - xr_diff }l ${ -2 * yr_diff } ${ 2 * xr_diff }L ${ m_x } ${ m_y }`;
        }
    },
    _graphChanged(new_graph = this.graph, old_graph) {
        if (old_graph) for (let [node, relations] of old_graph) if (!new_graph.has(node)) {
            this.unlisten(relations._circle, "tap", "_tapCircle");
            this.unlisten(relations._circle, "track", "_trackCircle");
            this.unlisten(relations._circle, "hold", "_holdCircle");
        }
        this.$.svg.innerHTML = "";
        for (let link of this.graph.links) {
            if (!link._path) link._path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.$.svg.appendChild(link._path);
        }
        for (let [node, relations] of this.graph) {
            if (!relations._circle) {
                relations._circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                relations._circle._node = node;
                this.listen(relations._circle, "tap", "_tapCircle");
                this.listen(relations._circle, "track", "_trackCircle");
                this.listen(relations._circle, "hold", "_holdCircle");
            }
            this.$.svg.appendChild(relations._circle);
        }
        this.nodesUpdated();
    },
    _nodesUpdated() {
        //console.log("nodesUpdated");
        for (let [node, { _circle }] of this.graph) {
            _circle.cx.baseVal.value = node.x;
            _circle.cy.baseVal.value = node.y;
            _circle.r.baseVal.value = node.radius;
            if (node.selected) _circle.setAttribute("selected", "");else _circle.removeAttribute("selected");
        }

        for (let link of this.graph.links) link._path.setAttribute("d", this._calcPath(link));
    }
});

function neutralizeEvent(event) {
    event.preventDefault();
    event.cancelBubble = true;
}
/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@mail.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */

function requestAnimationFunction(callback, weak = true) {
    if (typeof callback != "function") throw Error("{callback} is not a function");
    //{updated} defines whether the frame has been animated since the last call
    let updated = true;
    //{args} is passed to the callback on frame animation
    //arguments are stored out of 'update'-closure to make them overridable (in case of {weak} != false)
    let args;
    return function update() {
        //set arguments on first call (after frame animation)
        if (args === undefined) args = arguments;
        if (updated) {
            //request callback to be executed on animation frame
            //calling with {undefined} as pointer because {requestAnimationFrame} is already bound to the context
            requestAnimationFrame(() => {
                //{updated} must be set to true before the callback is called
                //otherwise a call of the own 'update'-function would not request the callback
                //to be called again on the next frame animation
                updated = true;
                //call the callback
                callback(...args);
            });
            //determine that the frame has not been animated since the last (current) call of the 'update'-function
            updated = false;
        }
        //override arguments if {weak} != false;
        else if (weak) args = arguments;
    };
}
