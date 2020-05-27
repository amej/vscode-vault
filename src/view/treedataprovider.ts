'use strict';

import * as commands from '../commands';
import * as vscode from 'vscode';

import { VaultServerTreeItem } from './server';
import { VaultTreeItem } from './treeitem';

export class VaultTreeDataProvider implements vscode.TreeDataProvider<VaultTreeItem> {
    //#region Attributes
    private _serverList: VaultServerTreeItem[] = [];
    private _onDidChangeTreeData = new vscode.EventEmitter<VaultTreeItem>();
    //#endregion

    //#region TreeDataProvider Implementation
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    getChildren(element?: VaultTreeItem): vscode.ProviderResult<VaultTreeItem[]> {
        let providerResult: vscode.ProviderResult<VaultTreeItem[]>;
        // If no element is selected in the tree view
        if (element === undefined) {
            // Return the top level elements of the tree view
            providerResult = this._serverList;
        }
        // If the selected element has no children defined
        else if (element.children === undefined) {
            // If the selected element has no children defined
            vscode.window.vault.log(`Refreshing ${element.id}`);
            providerResult = this.refresh(element);
        }
        // If the selected element has children defined
        else {
            // Return the children
            providerResult = element.children;
        }
        return providerResult;
    }

    getParent(element: VaultTreeItem): VaultTreeItem {
        // Return the parent
        return element.parent;
    }

    getTreeItem(element: VaultTreeItem): vscode.TreeItem {
        // Return the element
        return element;
    }
    //#endregion

    //#region Custom Command Methods
    async connect(): Promise<void> {
        // Establish a new session by connecting to a server
        const session = await commands.connect();
        // If a session was created
        if (session) {
            // Create a new tree item from the session
            const treeItem = new VaultServerTreeItem(session);
            // Add the server to the list of top-level tree items
            this._serverList.push(treeItem);
            // Fire an event to trigger a refresh of the tree view
            this._onDidChangeTreeData.fire(undefined);
        }
    }

    async disconnect(server: VaultServerTreeItem): Promise<void> {
        // Show an error message and prompt the user for an action
        const selectedAction = await vscode.window.showWarningMessage(`Are your sure you want to disconnect from ${server.id}?`, 'Disconnect');
        // If the (1) action is selected, execute the associated command
        if (selectedAction) {
            // Find the specified server in the list
            const index = this._serverList.indexOf(server);
            // If the element was found in the list
            if (index > -1) {
                // Remove the element
                this._serverList.splice(index, 1);
                // TODO: Dispose of the server's session
                // server.session.dispose();
                // Trigger a refresh of the panel
                this._onDidChangeTreeData.fire(undefined);
                vscode.window.showWarningMessage(`Disconnected from ${server.id}?`);
            }
        }
    }

    async refresh(element: VaultTreeItem): Promise<VaultTreeItem[]> {
        // If refreshing the element changed the content
        if (await element.refresh() === true) {
            // Fire an event to trigger a refresh of the tree view
            this._onDidChangeTreeData.fire(undefined);
        }
        return undefined;
    }
    //#endregion
}
