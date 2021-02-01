function intervene() {
  let script_name;
  let method_name;

  try {
    throw new Error();
  } catch (error) {
    try {
      script_name = error.stack.split("\n")[3].match(/(?:at\s(?:.+?)\s\(|@).*\/(.+?):.*\)?/)[1];
    } catch (error) {
      script_name = "";
    }

    try {
      method_name = error.stack.split("\n")[3].match(/at\s(?:.+?\.)?(.+?)\s\(/)[1];
    } catch (error) {
      method_name = "";
    } // console.log(error.stack);

  }

  if (method_name.startsWith("__")) {
    method_name = method_name.substr(2);
  }

  let script_style = "color: #757575;";
  let method_style = "color: #558b2f;";

  if (method_name.startsWith("__")) {
    method_name = method_name.substr(2);
    method_style = "color: #f57f17;";
  }

  return ["%c" + script_name + ":\t%c" + method_name, script_style, method_style];
}

export default Object.assign({}, console, {
  log(..._arguments) {
    if (window.__graphElementsLogging) {
      console.groupCollapsed(...intervene());
      console.trace(..._arguments);
      console.groupEnd();
    }
  },

  warn(..._arguments) {
    console.groupCollapsed(...intervene());
    console.warn(..._arguments);
    console.groupEnd();
  },

  rawlog(..._arguments) {
    console.log(..._arguments);
  }

});