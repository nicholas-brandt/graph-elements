import { GraphEditorProvider } from "./GraphEditorProvider";
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const editor_provider = new GraphEditorProvider(context);
    context.subscriptions.push(vscode.window.registerCustomEditorProvider(
        'graph-editor',
        editor_provider,
        { webviewOptions: { retainContextWhenHidden: true } }
    ));

    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.addNode', () => {
        console.log("Add Node command triggered", ...arguments);
        // get the webview of the editor that triggered the command
        const webview = vscode.window.activeTextEditor;
        editor_provider.webview.postMessage({ command: 'addNode' });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.deleteNode', () => {
        console.log("Delete Node command triggered", ...arguments);
    }));
}

export function deactivate() { }