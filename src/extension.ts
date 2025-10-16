import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const disposable =
        vscode.window.registerCustomEditorProvider(
            'graph-elements.graph-editor',
            new GraphEditorProvider(context),
            { webviewOptions: { retainContextWhenHidden: true } }
        );
    context.subscriptions.push(disposable);

    // Register the command to open the webview
    /*const disposable = vscode.commands.registerCommand('graph-elements.openEditorPage', () => {
        // Create and show a new webview panel
        const panel = vscode.window.createWebviewPanel(
            'customEditorPage', // Identifies the type of the webview
            'Custom Editor Page', // Title of the panel
            vscode.ViewColumn.One, // Editor column to show the new webview panel in
            {
                enableScripts: true // Allow JavaScript in the webview
            }
        );

        // Set the HTML content for the webview
        panel.webview.html = getWebviewContent();

        vscode.window.showInformationMessage("activate graph-elements");
        vscode.window.registerCustomEditorProvider
    });*/
}

class GraphEditorProvider implements vscode.CustomEditorProvider {
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
        const document: vscode.CustomDocument = {
            uri,
            dispose: () => { }
        };
        return document;
    }
    resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): Thenable<void> | void {
        // webviewPanel.webview.
    }

}

export function deactivate() { }