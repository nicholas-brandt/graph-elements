Polymer({
    is: "d3-force",
    properties: {
        worker: {
            value: () => new Worker("../../elements/d3-force/d3-force-worker.js"),
            readOnly: true
        },
        nodes: {
            type: Array
        },
        links: {
            type: Array
        },
        size: {
            type: Array
        },
        linkDistance: {
            type: Number
        },
        linkStrength: {
            type: Number
        },
        gravity: {
            type: Number
        },
        friction: {
            type: Number
        },
        charge: {
            type: Number
        },
        chargeDistance: {
            type: Number
        },
        alpha: {
            type: Number
        },
        theta: {
            type: Number
        },
        start: {
            type: Boolean,
            value: false
        }
    },
    attached() {
        const display = this.parentElement;
        this.worker.addEventListener("message", event => {
            //console.log("nodes received");
            if (event.data.nodes) {
                const nodes = event.data.nodes;
                let i = 0;
                for (let [node] of display.graph) {
                    if (i >= nodes.length) break;
                    node.x = nodes[i].x;
                    node.y = nodes[i].y;
                    ++i;
                }
                display.nodesUpdated();
            }
        });
    },
    send() {
        this.worker.postMessage({
            size: this.size || [this.parentElement.clientWidth, this.parentElement.clientHeight],
            linkDistance: this.linkDistance,
            linkStrength: this.linkStrength,
            gravity: this.gravity,
            friction: this.friction,
            charge: this.charge,
            chargeDistance: this.chargeDistance,
            alpha: this.alpha,
            theta: this.theta,
            start: !!this.nodes || this.start,
            data: CircularJSON.stringify({
                nodes: this.nodes,
                links: this.links
            })
        });
    }
});
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
        else if (!!weak) args = arguments;
    };
}
