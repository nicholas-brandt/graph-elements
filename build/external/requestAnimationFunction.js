define(["exports"], function (exports) {
    "use strict";

    var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

    /*
     * Author: Nicholas-Philip Brandt [nicholas.brandt@gmx.de]
     * License: CC BY-SA[https://creativecommons.org/licenses/by-sa/4.0/]
     * */
    exports.requestAnimationFunction = requestAnimationFunction;
    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function requestAnimationFunction(callback) {
        var weak = arguments[1] === undefined ? true : arguments[1];

        //{updated} defines whether the frame has been animated since the last call
        var updated = true;
        //{args} is passed to the callback on frame animation
        //arguments are stored out of 'update'-closure to make them overridable (in case of {weak} != false)
        var args = undefined;
        return function update() {
            //set arguments on first call (after frame animation)
            if (args === undefined) args = arguments;
            if (updated) {
                //request callback to be executed on animation frame
                //calling with {undefined} as pointer because {requestAnimationFrame} is already bound to the context
                requestAnimationFrame(function () {
                    //{updated} must be set to true before the callback is called
                    //otherwise a call of the own 'update'-function would not request the callback
                    //to be called again on the next frame animation
                    updated = true;
                    //call the callback
                    callback.apply(undefined, _toConsumableArray(args));
                });
                //determine that the frame has not been animated since the last (current) call of the 'update'-function
                updated = false;
            }
            //override arguments if {weak} != false;
            else if (!!weak) args = arguments;
        };
    }

    ;
});