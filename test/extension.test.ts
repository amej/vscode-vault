'use strict';

import * as assert from 'assert';
import * as vscode from 'vscode';

import { before, describe, it } from 'mocha';

describe('Extension Test Suite', () => {
    before(function() {
        if (process.env.VAULT_ADDR === undefined) {
            console.log('No Vault address is defined. Skipping tests');
            this.skip();
        }
    });

    it('loaded the vscode-vault extension', async() => {
        await vscode.extensions.getExtension('owenfarrell.vscode-vault').activate();
        // @ts-ignore
        assert(vscode.window.vault);
    });
});
