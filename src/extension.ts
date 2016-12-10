'use strict';

/// <reference types="node" />

// The MIT License (MIT)
// 
// vs-deploy (https://github.com/mkloubert/vs-deploy)
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

import * as deploy_helpers from './helpers';
import * as FS from 'fs';
import * as Moment from 'moment';
import * as Path from 'path';
import * as vscode from 'vscode';
import * as vs_deploy from './deploy';


export function activate(context: vscode.ExtensionContext) {
    let now = Moment();

    // version
    let appVersion: string;
    let appName: string;
    let displayName: string;
    try {
        let packageFile = JSON.parse(FS.readFileSync(Path.join(__dirname, '../../package.json'), 'utf8'));

        appName = packageFile.name;
        appVersion = packageFile.version;
        displayName = packageFile.displayName;
    }
    catch (e) {
        deploy_helpers.log(`[ERROR] ${deploy_helpers.toStringSafe(e)}`);
    }

    let outputChannel = vscode.window.createOutputChannel("Deploy");
    if (appName) {
        outputChannel.appendLine(`${displayName} (${appName}) - v${appVersion}`);
        outputChannel.appendLine(`Copyright (c) ${now.format('YYYY')}  Marcel Joachim Kloubert <marcel.kloubert@gmx.net>`);
        outputChannel.appendLine('');
        outputChannel.appendLine(`GitHub : https://github.com/mkloubert/vs-deploy`);
        outputChannel.appendLine(`Twitter: https://twitter.com/mjkloubert`);
        outputChannel.appendLine(`Donate : https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RB3WUETWG4QU2`);
        
        outputChannel.appendLine('');
    
        outputChannel.show();
    }

    let deployer = new vs_deploy.Deployer(context, outputChannel);

    // deploy workspace
    let deploy = vscode.commands.registerCommand('extension.deploy', () => {
        try {
            deployer.deployWorkspace();
        }
        catch (e) {
            vscode.window.showErrorMessage('[DEPLOY WORKSPACE ERROR]: ' + e);
        }
    });

    // deploy open file
    let deployFile = vscode.commands.registerCommand('extension.deploy.file', () => {
        try {
            deployer.deployFile();
        }
        catch (e) {
            vscode.window.showErrorMessage('[DEPLOY FILE ERROR]: ' + e);
        }
    });

    // notfiy setting changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(deployer.onDidChangeConfiguration, deployer));

    context.subscriptions.push(deploy, deployFile);
}

export function deactivate() {
}