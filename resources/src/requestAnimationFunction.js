/*
 * Author: Nicholas-Philip Brandt [github@nicholasbrandt.de]
 * License: ISC
 * */
export default function requestAnimationFunction(callback, weak = true) {
    if (typeof callback != "function") {
        throw new Error("{callback} is not a function");
    }
    // {updated} defines whether the frame has been animated since the last call
    let updated = true;
    // {args} is passed to the callback on frame animation
    // arguments are stored out of 'update'-closure to make them overridable (in case of {weak} != false)
    let args;
    let _this;
    let promise;
    let resolve;
    function frame(time_stamp) {
        // {updated} must be set to true before the callback is called
        // otherwise a call of the own 'update'-function would not request the callback
        // to be called again on the next frame animation
        updated = true;
        // call the callback
        const _return = args.length ? callback.apply(_this, args) : callback.call(_this, time_stamp);
        // resolve
        resolve(_return);
    }
    return function update(..._arguments) {
        if (weak || args === undefined) {
            // takeover arguments
            args = _arguments;
            _this = this;
        }
        if (updated) {
            // create new promise
            promise = new Promise(_resolve => {
                resolve = _resolve;
            });
            // request callback to be executed on animation frame
            // calling with {undefined} as pointer because {requestAnimationFrame} is already bound to the context
            (requestAnimationFrame || setTimeout)(frame);
            // determine that the frame has not been animated since the last (current) call of the 'update'-function
            updated = false;
        }
        return promise;
    };
}