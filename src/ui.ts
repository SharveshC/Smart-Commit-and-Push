import * as vscode from 'vscode';

/**
 * Show a dialog to confirm and optionally edit the commit message
 * @returns The final commit message or undefined if cancelled
 */
export async function showCommitMessageDialog(
    generatedMessage: string
): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        prompt: 'Review and edit the commit message',
        value: generatedMessage,
        placeHolder: 'type(scope): description',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Commit message cannot be empty';
            }
            return null;
        },
    });

    return result;
}

/**
 * Show a success notification
 */
export function showSuccessNotification(message: string): void {
    vscode.window.showInformationMessage(`✓ ${message}`);
}

/**
 * Show an error notification
 */
export function showErrorNotification(error: string): void {
    vscode.window.showErrorMessage(`✗ ${error}`);
}

/**
 * Show a warning notification
 */
export function showWarningNotification(warning: string): void {
    vscode.window.showWarningMessage(`⚠ ${warning}`);
}

/**
 * Show progress while executing an async operation
 */
export async function withProgress<T>(
    title: string,
    task: () => Promise<T>
): Promise<T> {
    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title,
            cancellable: false,
        },
        async () => {
            return await task();
        }
    );
}
