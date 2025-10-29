import requestAnimationFunction from './requestAnimationFunction.js';

export default requestAnimationFunction(data => {
    globalThis.vscode.postMessage(data);
});