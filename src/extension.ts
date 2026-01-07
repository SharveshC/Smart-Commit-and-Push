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
 * Main workflow: Pure orchestration with no business logic
 */
async function executeSmartCommitAndPush(): Promise<void> {
    try {
        const workspaceRoot = getWorkspaceRoot();

        // Validate workspace and git repository (throws on error)
        await validateGitWorkspace(workspaceRoot);

        // Get git information
        const gitInfo = await withProgress('Analyzing git changes...', () =>
            getGitInfo(workspaceRoot!)
        );

        // Generate commit message
        const generatedMessage = generateCommitMessage(gitInfo);

        // Show confirmation dialog
        const finalMessage = await showCommitMessageDialog(generatedMessage);
        if (!finalMessage) {
            throw new Error('Commit cancelled by user');
        }

        // Execute commit and push
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
