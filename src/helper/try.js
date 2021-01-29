export default
function __try(method) {
    return async function container(...args) {
        try {
            return await method.call(this, ...args);
        } catch (error) {
            console.error(error);
        }
    }
}