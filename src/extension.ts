'use strict';

import * as view from './view';
import * as vscode from 'vscode';

import { VaultWindow } from './model';

declare module 'vscode' {
    export namespace window {
        export let vault: VaultWindow;
    }
}

function loadConfiguration() {
    const configuration: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('vault');
    vscode.window.vault.clipboardTimeout = <number>configuration.get('clipboardTimeout') * 1000;
}

export function activate(context: vscode.ExtensionContext) {
    const vaultWindow = vscode.window.vault = new VaultWindow();
    const vaultTreeDataProvider = new view.VaultTreeDataProvider();

    // Load the configuration to start
    loadConfiguration();
    // Subscribe to configuration event changes
    vscode.workspace.onDidChangeConfiguration(loadConfiguration);

    // Push disposables on to context
    context.subscriptions.push(
        vaultWindow,
        vscode.window.createTreeView('vaultSecrets', { treeDataProvider: vaultTreeDataProvider }),
        // Subscribe to "vault.browse" events
        vscode.commands.registerCommand('vault.browse', (treeItem: view.VaultServerTreeItem) => treeItem.browse().then(() => vaultTreeDataProvider.refresh(treeItem)).catch((err: Error) => vaultWindow.logError(`Unable to browse Vault path (${err.message})`))),
        // Subscribe to "vault.connect" events
        vscode.commands.registerCommand('vault.connect', () => vaultTreeDataProvider.connect().catch((err: Error) => vaultWindow.logError(`Unable to connect to Vault (${err.message})`))),
        // Subscribe to "vault.delete" events
        vscode.commands.registerCommand('vault.delete', (treeItem: view.VaultSecretTreeItem) => treeItem.delete().then(() => vaultTreeDataProvider.refresh(vaultTreeDataProvider.getParent(treeItem))).catch((err: Error) => vaultWindow.logError(`Unable to delete Vault path (${err.message})`))),
        // Subscribe to "vault.list" events
        vscode.commands.registerCommand('vault.list', (treeItem: view.VaultTreeItem) => vaultTreeDataProvider.refresh(treeItem).catch((err: Error) => vaultWindow.logError(`Unable to list Vault path (${err.message})`))),
        // Subscribe to "vault.read" events
        vscode.commands.registerCommand('vault.read', (treeItem: view.VaultSecretTreeItem) => treeItem.read().catch((err: Error) => vaultWindow.logError(`Unable to read Vault path (${err.message})`))),
        // Subscribe to "vault.write" events
        vscode.commands.registerCommand('vault.write', (treeItem: view.VaultPathTreeItem | view.VaultSecretTreeItem) => treeItem.write().then((requiresRefresh: boolean) => requiresRefresh === true && vaultTreeDataProvider.refresh(treeItem)).catch((err: Error) => vaultWindow.logError(`Unable to write Vault path (${err.message})`)))
    );
}

export function deactivate() {
}
