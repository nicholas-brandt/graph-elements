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
        console.log("Add Node command triggered");
        // get the webview of the editor that triggered the command
        editor_provider.webview.postMessage({ command: 'addNode' });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.deleteNode', () => {
        console.log("Delete Node command triggered");
    }));

    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.startLayout', () => {
        console.log("Start Layout command triggered");
        editor_provider.webview.postMessage({ command: 'startLayout' });
    }));
}

export function deactivate() { }