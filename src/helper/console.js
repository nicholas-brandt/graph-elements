let previous_script_name;
let previous_method_name;
function intervene(..._arguments) {
    let script_name;
    let method_name;
    try {
        throw new Error();
    } catch (error) {
        try {
            script_name = error.stack.split("\n")[3].match(/\((?:.*\/)?(.+):.+:.+\)/)[1];
        } catch (error) {
            script_name = "";
        }
        try {
            method_name = error.stack.split("\n")[3].match(/at\s(?:.+\.)?(.+?)\s/)[1];
        } catch (error) {
            method_name = "";
        }
        // console.log(error.stack);
    }
    if (previous_script_name == script_name) {
        script_name = " ".repeat(script_name.length);
        if (previous_method_name == method_name) {
            method_name = " ".repeat(method_name.length);
            if (previous_method_name.startsWith("__")) {
                method_name = method_name.substr(2);
            }
        }
    }
    previous_method_name = method_name;
    previous_script_name = script_name;
    let script_style = "color:#757575;";
    let method_style = "color:#558b2f;";
    if (method_name.startsWith("__")) {
        method_name = method_name.substr(2);
        method_style = "color:#f57f17;";
    }
    return ["%c" + script_name + ":\t%c" + method_name + ":\t", script_style, method_style, ..._arguments];
}
export default
Object.assign({}, console, {
    log(..._arguments) {
        return;
        return console.log(...intervene(..._arguments));
    },
    warn(..._arguments) {
        return console.warn(...intervene(..._arguments));
    }
});