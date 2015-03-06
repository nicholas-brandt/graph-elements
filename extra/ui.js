(function(global) {
    let $worker = new Symbol;
    let $context = new Symbol;
    let $graph = new Symbol;
    let $busy = new Symbol;
    class GraphCanvas {
        constructor(canvas = document.createElement("canvas"), graph = new Graph) {
            let reference = this;
            this[$busy] = true;
            this[$context] = canvas.getContext("2d");
            this[$graph] = graph;
            this[$worker] = new Worker("worker.js");
            this[$worker].addEventListener("message", event => {
                requestAnimationFrame(() => {
                    reference[$busy] = false;
                    for (let node of event.data.nodes) node.draw(reference[$context]);
                });
            });
        }
        update() {
            if (!this[$busy]) {
                this[$busy] = true;
                this[$worker].postMessage(this[$graph]);
            }
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
})(this);