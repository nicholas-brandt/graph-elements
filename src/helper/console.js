export default prefix => {
    return Object.assign({}, console, {
        log(..._arguments) {
            console.log(prefix + ":", ..._arguments);
        }
    });
};