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
        throw new Error(`Failed to commit: ${error.message}`);
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
        throw new Error(`Failed to push: ${error.message}`);
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
