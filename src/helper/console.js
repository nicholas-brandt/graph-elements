export default
Object.assign({}, console, {
    log(..._arguments) {
        let script_name;
        let method_name;
        try {
            throw new Error();
        } catch (error) {
            try {
                script_name = error.stack.split("\n")[2].match(/.*\s.+\/(.+?)\..+$/)[1];
            } catch (error) {
                script_name = "";
            }
            try {
                method_name = error.stack.split("\n")[2].match(/\s.+\.(.+?)\s/)[1];
            } catch (error) {
                method_name = "";
            }
        }
        console.log(script_name + ":", method_name + ":", ..._arguments);
    }
});