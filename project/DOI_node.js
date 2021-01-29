import {Node} from "../build/helper/GraphClasses.js";

export class DOINode extends Node {
    radius = 3;
    constructor(node, _request_paint) {
        super(node, _request_paint);
        this.element.part.remove("node-circle");
        
        const {text, title} = node.value || {};
        Object.defineProperties(this, {
            text: {
                set(value) {
                    this.textElement.textContent = value;
                },
                get() {
                    return this.textElement.textContent;
                },
                configurable: true,
                enumerable: true
            },
            title: {
                set(value) {
                    this.titleElement.textContent = value;
                },
                get() {
                    return this.titleElement.textContent;
                },
                configurable: true,
                enumerable: true
            }
        });
        this.text = text;
        // this.title = title;
    }
    paint() {
        const {x, y, radius} = this;
        // this.element.setAttribute("cx", x);
        if (x + 0 === x) {
            this.circleElement.cx.baseVal.value = x;
            this.textContainerElement.setAttribute("x", x);
        }
        // this.element.setAttribute("cy", y);
        if (y + 0 === y) {
            this.circleElement.cy.baseVal.value = y;
            this.textContainerElement.setAttribute("y", y);
        }
        // this.element.setAttribute("r", radius);
        if (radius + 0 === radius) {
            this.circleElement.r.baseVal.value = radius;
        }
    }
    createElement() {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const circle = super.createElement();
        circle.part.add("node-circle");
        group.appendChild(circle);
        circle.addEventListener("pointerover", () => {
            group.parentElement.appendChild(group);
        });
        this.circleElement = circle;
        
        /*const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.part.add("node-title");
        circle.appendChild(title);
        this.titleElement = title;*/
        
        const text_container = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        text_container.part.add("node-text-container");
        group.appendChild(text_container);
        this.textContainerElement = text_container;
        
        const text = document.createElement("div");
        text.part.add("node-text");
        text.setAttribute("text-anchor", "middle");
        text_container.appendChild(text);
        this.textElement = text;
        return group;
    }
}
