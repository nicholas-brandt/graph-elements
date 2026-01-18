import * as fs from 'node:fs/promises';
import { validateHeaderValue } from 'node:http';
import path, { resolve } from 'path';
import * as vscode from 'vscode';

export class GraphEditorProvider implements vscode.CustomEditorProvider {
    webview!: vscode.Webview;
    constructor(private readonly context: vscode.ExtensionContext) { }
    private readonly _onDidChange = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<vscode.CustomDocument> | vscode.CustomDocumentContentChangeEvent<vscode.CustomDocument>>();
    public readonly onDidChangeCustomDocument: vscode.Event<vscode.CustomDocumentEditEvent<vscode.CustomDocument> | vscode.CustomDocumentContentChangeEvent<vscode.CustomDocument>> = this._onDidChange.event;

    async saveCustomDocument(document: vscode.CustomDocument, cancellation: vscode.CancellationToken): Promise<void> {
        throw new Error('saveCustomDocument not implemented.');
    }
    saveCustomDocumentAs(document: vscode.CustomDocument, destination: vscode.Uri, cancellation: vscode.CancellationToken): Thenable<void> {
        throw new Error('saveCustomDocumentAs not implemented.');
    }
    revertCustomDocument(document: vscode.CustomDocument, cancellation: vscode.CancellationToken): Thenable<void> {
        throw new Error('revertCustomDocument not implemented.');
    }
    backupCustomDocument(document: vscode.CustomDocument, context: vscode.CustomDocumentBackupContext, cancellation: vscode.CancellationToken): Thenable<vscode.CustomDocumentBackup> {
        throw new Error('backupCustomDocument not implemented.');
    }
    openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
        // read the file content into variable "content"
        console.log("openCustomDocument called for", uri.toString());
        const document: vscode.CustomDocument = {
            uri,
            dispose: () => { }
        };
        return document;
    }
    resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Promise<void> | void {
        console.log("resolveCustomEditor called");

        // store webview reference for commands
        this.webview = webviewPanel.webview;

        // set webview options
        this.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'resources'))]
        };

        // prepare HTML content for the webview
        const scriptUri = this.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'resources/dist/project.js'));
        const cssUri = this.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'resources/src/project.css'));
        const html = `<!DOCTYPE html>
<html data-vscode-context='{"preventDefaultContextMenuItems": true}'>

<head>
    <!-- need to call acquireVsCodeApi() to protect it from getting lost in js packaging -->
    <script>globalThis.vscode = acquireVsCodeApi();</script>
    <link rel="stylesheet" href="${cssUri}" />
</head>

<body>
    <graph-display><!-- firefox bug ?!--></graph-display>
    <script src='${scriptUri}'></script>
</body>

</html>`;
        this.webview.html = html;

        // set up a promise that resolves when the webview signals its readiness
        const webview_promise = new Promise<void>(resolve => {
            // handle messages from the webview
            this.webview.onDidReceiveMessage(async ({ command, state, value }) => {
                console.log({ command, state, value });
                switch (command) {
                    case 'ready':
                        resolve();
                        break;
                    case 'selected-node-changed':
                        // set context variable for selected node
                        vscode.commands.executeCommand('setContext', `graph-editor.${state}`, value.length > 0);
                        // if a single node is selected, open a text editor to edit selected node properties
                        if (value.length === 1) {
                            const selected_node = value[0];
                            const selected_node_document = await vscode.workspace.openTextDocument();
                            const editor = await vscode.window.showTextDocument(selected_node_document, { preview: true, viewColumn: vscode.ViewColumn.Beside });
                            editor.edit(editBuilder => {
                                editBuilder.insert(new vscode.Position(0, 0), JSON.stringify(selected_node, null, 4));
                            });
                        }
                        break;
                    case 'graph-changed':
                        // write value to the document file
                        await fs.writeFile(document.uri.fsPath, value, 'utf-8');
                        // await vscode.commands.executeCommand('editor.action.formatDocument');
                        break;
                }
            });
        });

        (async () => {
            console.debug("loading graph data from document");
            // load the graph data from the document and send it to the webview
            const serialized_graph = await fs.readFile(document.uri.fsPath, 'utf-8');
            await webview_promise;
            console.debug("sending graph data to webview");
            this.webview.postMessage({ command: 'loadGraph', serialized_graph });
        })();
    }
}