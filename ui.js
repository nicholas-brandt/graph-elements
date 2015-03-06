import * as graphjs from "graph";
export const GraphCanvas = (function() {
    let $worker = Symbol();
    let $context = Symbol();
    let $graph = Symbol();
    let $busy = Symbol();
    class GraphCanvas {
        constructor(canvas = document.createElement("canvas"), graph = new graphjs.Graph) {
            this[$context] = canvas.getContext("2d");
            this[$graph] = graph;
        }
        update() {
            requestAnimationFrame(() => {
                reference[$busy] = false;
                for (let node of event.data.nodes) node.draw(reference[$context]);
            });
        }
    }
    class Element {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }
    class Circle extends Element {
        constructor(x, y, r = 1) {
            super(x, y);
            this.r = r;
        }
        draw(context) {}
    }
    class Rectangle extends Element {
        constructor(x, y, w = 1, h = 1) {
            super(x, y);
            this.w = w;
            this.h = h;
        }
    }
    class Square extends Rectangle {
        constructor(x, y, w) {
            super(x, y, w, w);
        }
    }
    return GraphCanvas;
})();