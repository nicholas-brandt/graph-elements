"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = requestAnimationFunction;
/*
 * Author: Nicholas-Philip Brandt [nicholas.brandt@gmx.de]
 * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
 * */
function requestAnimationFunction(callback) {
    var weak = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    if (typeof callback != "function") throw Error("{callback} is not a function");
    //{updated} defines whether the frame has been animated since the last call
    var updated = true;
    //{args} is passed to the callback on frame animation
    //arguments are stored out of 'update'-closure to make them overridable (in case of {weak} != false)
    var args = void 0;
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
