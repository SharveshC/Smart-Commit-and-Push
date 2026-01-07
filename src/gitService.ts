import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitInfo {
    status: string;
    diff: string;
    diffStat: string;
    changedFiles: string[];
}

/**
 * Get comprehensive git information about current changes
 */
export async function getGitInfo(workspaceRoot: string): Promise<GitInfo> {
    try {
        // Get git status
        const { stdout: status } = await execAsync('git status --porcelain', {
            cwd: workspaceRoot,
        });

        // Get full diff (both staged and unstaged changes)
        let diff = '';
        try {
            const { stdout: unstagedDiff } = await execAsync('git diff', {
                cwd: workspaceRoot,
            });
            const { stdout: stagedDiff } = await execAsync('git diff --cached', {
                cwd: workspaceRoot,
            });
            diff = unstagedDiff + '\n' + stagedDiff;
        } catch {
            // If diff fails, continue with empty diff
            diff = '';
        }

        // Get diff statistics
        const { stdout: diffStat } = await execAsync('git diff --stat HEAD', {
            cwd: workspaceRoot,
        });

        // Parse changed files from status
        const changedFiles = status
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => {
                // Format: "XY filename" where X and Y are status codes
                const match = line.match(/^..\s+(.+)$/);
                return match ? match[1] : '';
            })
            .filter((file) => file);

        return {
            status,
            diff,
            diffStat,
            changedFiles,
        };
    } catch (error: any) {
        throw new Error(`Failed to get git info: ${error.message}`);
    }
}

/**
 * Commit changes with the given message
 */
export async function gitCommit(
    workspaceRoot: string,
    message: string
): Promise<void> {
    try {
        // Stage all changes
        await execAsync('git add -A', { cwd: workspaceRoot });

        // Commit with message
        await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
            cwd: workspaceRoot,
        });
    } catch (error: any) {
        throw new Error(translateGitError(error, 'commit'));
    }
}

/**
 * Push changes to remote
 */
export async function gitPush(workspaceRoot: string): Promise<void> {
    try {
        // Get current branch
        const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', {
            cwd: workspaceRoot,
        });

        const branchName = branch.trim();

        // Push to current branch
        await execAsync(`git push origin ${branchName}`, {
            cwd: workspaceRoot,
        });
    } catch (error: any) {
        throw new Error(translateGitError(error, 'push'));
    }
}

/**
 * Check if the current directory is a git repository
 */
export async function isGitRepository(workspaceRoot: string): Promise<boolean> {
    try {
        await execAsync('git rev-parse --git-dir', { cwd: workspaceRoot });
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if there are any changes to commit
 */
export async function hasChanges(workspaceRoot: string): Promise<boolean> {
    try {
        const { stdout } = await execAsync('git status --porcelain', {
            cwd: workspaceRoot,
        });
        return stdout.trim().length > 0;
    } catch {
        return false;
    }
}

/**
 * Validate workspace and git repository
 * Throws descriptive errors if validation fails
 */
export async function validateGitWorkspace(workspaceRoot: string | undefined): Promise<void> {
    if (!workspaceRoot) {
        throw new Error('No workspace folder is open. Please open a folder first.');
    }

    const isGit = await isGitRepository(workspaceRoot);
    if (!isGit) {
        throw new Error('Current workspace is not a git repository. Run "git init" to initialize.');
    }

    const hasAnyChanges = await hasChanges(workspaceRoot);
    if (!hasAnyChanges) {
        throw new Error('No changes to commit. Make some changes first.');
    }
}

/**
 * Translate git error messages to human-readable format
 */
function translateGitError(error: any, operation: string): string {
    const errorMessage = error.message || error.toString();
    const lowerError = errorMessage.toLowerCase();

    // Push errors
    if (operation === 'push') {
        if (lowerError.includes('no upstream') || lowerError.includes('no such remote')) {
            return 'Git push failed: No upstream branch configured. Run "git push --set-upstream origin <branch>" first.';
        }
        if (lowerError.includes('authentication') || lowerError.includes('permission denied')) {
            return 'Git push failed: Authentication required. Please configure your git credentials.';
        }
        if (lowerError.includes('rejected') || lowerError.includes('non-fast-forward')) {
            return 'Git push failed: Remote has changes. Pull remote changes first with "git pull".';
        }
        if (lowerError.includes('could not resolve host') || lowerError.includes('network')) {
            return 'Git push failed: Network error. Check your internet connection.';
        }
        return `Git push failed: ${errorMessage}`;
    }

    // Commit errors
    if (operation === 'commit') {
        if (lowerError.includes('nothing to commit')) {
            return 'Git commit failed: No changes to commit.';
        }
        if (lowerError.includes('please tell me who you are')) {
            return 'Git commit failed: Git user not configured. Run "git config user.name" and "git config user.email".';
        }
        return `Git commit failed: ${errorMessage}`;
    }

    // Generic git errors
    if (lowerError.includes('not a git repository')) {
        return 'Not a git repository. Run "git init" to initialize.';
    }

    return `Git operation failed: ${errorMessage}`;
}
