import * as vscode from 'vscode';
import {
    getGitInfo,
    gitCommit,
    gitPush,
    validateGitWorkspace,
} from './gitService';
import { generateCommitMessage } from './ruleEngine';
import {
    showCommitMessageDialog,
    showSuccessNotification,
    showErrorNotification,
    withProgress,
} from './ui';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'smartCommitPush.commitAndPush',
        async () => {
            await executeSmartCommitAndPush();
        }
    );

    context.subscriptions.push(disposable);
}

/**
 * Extension deactivation
 */
export function deactivate() { }

/**
 * Main workflow: Pure orchestration - traffic police pattern
 */
async function executeSmartCommitAndPush(): Promise<void> {
    try {
        const workspaceRoot = getWorkspaceRoot();

        await validateGitWorkspace(workspaceRoot);

        const gitInfo = await withProgress('Analyzing git changes...', () =>
            getGitInfo(workspaceRoot!)
        );

        const generatedMessage = generateCommitMessage(gitInfo);
        const finalMessage = await showCommitMessageDialog(generatedMessage);

        await withProgress('Committing and pushing changes...', async () => {
            await gitCommit(workspaceRoot!, finalMessage);
            await gitPush(workspaceRoot!);
        });

        showSuccessNotification(`Committed and pushed: "${finalMessage}"`);
    } catch (error: any) {
        showErrorNotification(error.message);
    }
}

/**
 * Get the workspace root directory
 */
function getWorkspaceRoot(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
