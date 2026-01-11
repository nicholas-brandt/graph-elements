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

    // add submenu "layout" with subitems "start euler layout" and "start klay layout"
    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.startEulerLayout', () => {
        console.log("Start Euler Layout command triggered");
        editor_provider.webview.postMessage({ command: 'startLayout', layout: 'euler' });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('graph-editor.startKlayLayout', () => {
        console.log("Start Klay Layout command triggered");
        editor_provider.webview.postMessage({ command: 'startLayout', layout: 'klay' });
    }));
}

export function deactivate() { }