import * as vscode from 'vscode';
import {
    getGitInfo,
    gitCommit,
    gitPush,
    isGitRepository,
    hasChanges,
} from './gitService';
import { detectCommitType, inferScope, generateCommitMessage } from './ruleEngine';
import {
    showCommitMessageDialog,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    withProgress,
} from './ui';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Smart Commit & Push extension is now active');

    // Register the main command
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
export function deactivate() {
    console.log('Smart Commit & Push extension is now deactivated');
}

/**
 * Main workflow: Generate commit message, commit, and push
 */
async function executeSmartCommitAndPush(): Promise<void> {
    try {
        // Get workspace root
        const workspaceRoot = getWorkspaceRoot();
        if (!workspaceRoot) {
            showErrorNotification('No workspace folder is open');
            return;
        }

        // Check if it's a git repository
        const isGit = await isGitRepository(workspaceRoot);
        if (!isGit) {
            showErrorNotification('Current workspace is not a git repository');
            return;
        }

        // Check if there are changes to commit
        const hasChangesToCommit = await hasChanges(workspaceRoot);
        if (!hasChangesToCommit) {
            showWarningNotification('No changes to commit');
            return;
        }

        // Get git information
        const gitInfo = await withProgress('Analyzing git changes...', async () => {
            return await getGitInfo(workspaceRoot);
        });

        if (gitInfo.changedFiles.length === 0) {
            showWarningNotification('No files to commit');
            return;
        }

        // Generate commit message using rule engine
        const commitType = detectCommitType(gitInfo.changedFiles, gitInfo.diff);
        const scope = inferScope(gitInfo.changedFiles);
        const generatedMessage = generateCommitMessage(
            commitType,
            scope,
            gitInfo.changedFiles
        );

        // Show dialog for user to review/edit the message
        const finalMessage = await showCommitMessageDialog(generatedMessage);
        if (!finalMessage) {
            showWarningNotification('Commit cancelled');
            return;
        }

        // Execute commit and push
        await withProgress('Committing and pushing changes...', async () => {
            await gitCommit(workspaceRoot, finalMessage);
            await gitPush(workspaceRoot);
        });

        showSuccessNotification(
            `Successfully committed and pushed: "${finalMessage}"`
        );
    } catch (error: any) {
        showErrorNotification(`Failed: ${error.message}`);
        console.error('Smart Commit & Push error:', error);
    }
}

/**
 * Get the workspace root directory
 */
function getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return undefined;
    }

    // Use the first workspace folder
    return workspaceFolders[0].uri.fsPath;
}
