/**
 * Rule-based engine for generating conventional commit messages
 */

export type CommitType = 'feat' | 'fix' | 'docs' | 'test' | 'refactor' | 'chore';

/**
 * Detect the commit type based on changed files and diff content
 */
export function detectCommitType(files: string[], diff: string): CommitType {
    // Rule 1: Only documentation files changed
    if (files.every((f) => isDocFile(f))) {
        return 'docs';
    }

    // Rule 2: Only test files changed
    if (files.every((f) => isTestFile(f))) {
        return 'test';
    }

    // Rule 3: Only config files changed
    if (files.every((f) => isConfigFile(f))) {
        return 'chore';
    }

    // Rule 4: New files or new functions added (feat)
    if (hasNewFiles(files) || hasNewFunctions(diff)) {
        return 'feat';
    }

    // Rule 5: Bug-related changes or conditional logic updates (fix)
    if (hasBugRelatedChanges(diff) || hasConditionalLogicChanges(diff)) {
        return 'fix';
    }

    // Rule 6: Code restructuring without functional change (refactor)
    if (hasRefactoringPatterns(diff)) {
        return 'refactor';
    }

    // Default: treat as feature
    return 'feat';
}

/**
 * Infer scope from file paths
 */
export function inferScope(files: string[]): string {
    const scopeMap: Record<string, string> = {
        auth: 'auth',
        api: 'api',
        ui: 'ui',
        core: 'core',
        utils: 'utils',
        test: 'test',
        tests: 'test',
        config: 'config',
        docs: 'docs',
        components: 'ui',
        services: 'api',
        models: 'core',
        controllers: 'api',
        views: 'ui',
    };

    // Extract top-level folders
    const folders = files
        .map((file) => {
            const parts = file.split(/[/\\]/);
            return parts[0]?.toLowerCase() || '';
        })
        .filter((f) => f);

    // Find most common folder
    const folderCounts = folders.reduce((acc, folder) => {
        acc[folder] = (acc[folder] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostCommonFolder = Object.entries(folderCounts).sort(
        (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Map to scope
    if (mostCommonFolder && scopeMap[mostCommonFolder]) {
        return scopeMap[mostCommonFolder];
    }

    // Check for scope in file names
    for (const file of files) {
        const lowerFile = file.toLowerCase();
        for (const [key, value] of Object.entries(scopeMap)) {
            if (lowerFile.includes(key)) {
                return value;
            }
        }
    }

    return 'core';
}

/**
 * Generate a conventional commit message
 */
export function generateCommitMessage(
    type: CommitType,
    scope: string,
    files: string[]
): string {
    const description = generateDescription(type, files);
    return `${type}(${scope}): ${description}`;
}

/**
 * Generate a short imperative description
 */
function generateDescription(type: CommitType, files: string[]): string {
    const fileCount = files.length;

    if (fileCount === 1) {
        const fileName = files[0].split(/[/\\]/).pop() || 'file';
        const baseName = fileName.replace(/\.[^.]+$/, '');

        switch (type) {
            case 'feat':
                return `add ${baseName}`;
            case 'fix':
                return `fix issue in ${baseName}`;
            case 'docs':
                return `update ${baseName}`;
            case 'test':
                return `add tests for ${baseName}`;
            case 'refactor':
                return `refactor ${baseName}`;
            case 'chore':
                return `update ${baseName}`;
        }
    }

    // Multiple files
    switch (type) {
        case 'feat':
            return `add new features (${fileCount} files)`;
        case 'fix':
            return `fix issues (${fileCount} files)`;
        case 'docs':
            return `update documentation (${fileCount} files)`;
        case 'test':
            return `add tests (${fileCount} files)`;
        case 'refactor':
            return `refactor code (${fileCount} files)`;
        case 'chore':
            return `update configuration (${fileCount} files)`;
    }
}

// Helper functions

function isDocFile(file: string): boolean {
    const docExtensions = ['.md', '.txt', '.rst', '.adoc'];
    const lowerFile = file.toLowerCase();
    return (
        docExtensions.some((ext) => lowerFile.endsWith(ext)) ||
        lowerFile.includes('readme') ||
        lowerFile.includes('changelog') ||
        lowerFile.includes('license') ||
        lowerFile.includes('/docs/')
    );
}

function isTestFile(file: string): boolean {
    const lowerFile = file.toLowerCase();
    return (
        lowerFile.includes('.test.') ||
        lowerFile.includes('.spec.') ||
        lowerFile.includes('__tests__') ||
        lowerFile.includes('/tests/') ||
        lowerFile.includes('/test/')
    );
}

function isConfigFile(file: string): boolean {
    const configExtensions = ['.json', '.yml', '.yaml', '.toml', '.ini', '.xml'];
    const configFiles = [
        'package.json',
        'tsconfig.json',
        'webpack.config',
        'vite.config',
        '.eslintrc',
        '.prettierrc',
        '.gitignore',
        '.env',
    ];

    const lowerFile = file.toLowerCase();
    return (
        configExtensions.some((ext) => lowerFile.endsWith(ext)) ||
        configFiles.some((cfg) => lowerFile.includes(cfg))
    );
}

function hasNewFiles(files: string[]): boolean {
    // This is a heuristic - in git status, new files appear with "A" status
    // Since we're getting file names, we can't determine this perfectly
    // This would need to be enhanced with git status parsing
    return files.some((f) => !f.includes('.'));
}

function hasNewFunctions(diff: string): boolean {
    // Look for function/method declarations in diff additions
    const functionPatterns = [
        /^\+.*function\s+\w+/m,
        /^\+.*const\s+\w+\s*=\s*\(/m,
        /^\+.*\w+\s*\([^)]*\)\s*{/m,
        /^\+.*def\s+\w+/m, // Python
        /^\+.*public\s+\w+\s+\w+\(/m, // Java/C#
    ];

    return functionPatterns.some((pattern) => pattern.test(diff));
}

function hasBugRelatedChanges(diff: string): boolean {
    const bugKeywords = [
        'fix',
        'bug',
        'issue',
        'error',
        'crash',
        'patch',
        'resolve',
        'correct',
    ];

    const lowerDiff = diff.toLowerCase();
    return bugKeywords.some((keyword) => lowerDiff.includes(keyword));
}

function hasConditionalLogicChanges(diff: string): boolean {
    // Look for changes in if/else, try/catch, switch statements
    const conditionalPatterns = [
        /^\+.*if\s*\(/m,
        /^\+.*else/m,
        /^\+.*catch/m,
        /^\+.*switch/m,
        /^\+.*case\s+/m,
    ];

    return conditionalPatterns.some((pattern) => pattern.test(diff));
}

function hasRefactoringPatterns(diff: string): boolean {
    // Look for patterns that suggest refactoring
    const refactorKeywords = [
        'refactor',
        'rename',
        'extract',
        'move',
        'reorganize',
        'restructure',
    ];

    const lowerDiff = diff.toLowerCase();
    return refactorKeywords.some((keyword) => lowerDiff.includes(keyword));
}
