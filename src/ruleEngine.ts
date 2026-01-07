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
 * Generate a conventional commit message from git information
 */
export function generateCommitMessage(gitInfo: { changedFiles: string[]; diff: string }): string {
    const { changedFiles, diff } = gitInfo;

    const commitType = detectCommitType(changedFiles, diff);
    const scope = inferScope(changedFiles);
    const description = generateDescription(commitType, changedFiles, diff);

    return `${commitType}(${scope}): ${description}`;
}

/**
 * Generate a short imperative description with specific details
 * Avoids generic words like "update", "modify", "change" alone
 */
function generateDescription(type: CommitType, files: string[], diff: string): string {
    const fileCount = files.length;

    // Single file - be very specific
    if (fileCount === 1) {
        const fileName = files[0].split(/[/\\]/).pop() || 'file';
        const baseName = fileName.replace(/\.[^.]+$/, '');
        const cleanName = baseName.replace(/[-_]/g, ' ');

        switch (type) {
            case 'feat':
                return `add ${cleanName}`;
            case 'fix':
                return `resolve issue in ${cleanName}`;
            case 'docs':
                return `improve ${cleanName} documentation`;
            case 'test':
                return `add tests for ${cleanName}`;
            case 'refactor':
                return `refactor ${cleanName}`;
            case 'chore':
                return `configure ${cleanName}`;
        }
    }

    // Multiple files - try to find common pattern
    const commonFolder = findCommonFolder(files);
    const fileExtensions = getUniqueExtensions(files);

    // If all files share a common folder, mention it
    if (commonFolder && commonFolder !== '.') {
        const folderName = commonFolder.replace(/[-_]/g, ' ');

        switch (type) {
            case 'feat':
                return `implement ${folderName} features`;
            case 'fix':
                return `resolve ${folderName} issues`;
            case 'docs':
                return `improve ${folderName} documentation`;
            case 'test':
                return `add ${folderName} test coverage`;
            case 'refactor':
                return `refactor ${folderName} module`;
            case 'chore':
                return `configure ${folderName} settings`;
        }
    }

    // If all files have same extension, mention it
    if (fileExtensions.length === 1) {
        const ext = fileExtensions[0];
        const fileType = getFileTypeName(ext);

        switch (type) {
            case 'feat':
                return `implement ${fileType} features`;
            case 'fix':
                return `resolve ${fileType} issues`;
            case 'docs':
                return `improve ${fileType} documentation`;
            case 'test':
                return `add ${fileType} test coverage`;
            case 'refactor':
                return `refactor ${fileType} code`;
            case 'chore':
                return `configure ${fileType} settings`;
        }
    }

    // Fallback - use file count with specific verbs
    switch (type) {
        case 'feat':
            return `implement features across ${fileCount} files`;
        case 'fix':
            return `resolve issues across ${fileCount} files`;
        case 'docs':
            return `improve documentation across ${fileCount} files`;
        case 'test':
            return `add test coverage for ${fileCount} files`;
        case 'refactor':
            return `refactor ${fileCount} modules`;
        case 'chore':
            return `configure ${fileCount} project files`;
    }
}

/**
 * Get human-readable file type name
 */
function getFileTypeName(ext: string): string {
    const typeMap: Record<string, string> = {
        'ts': 'TypeScript',
        'js': 'JavaScript',
        'tsx': 'React',
        'jsx': 'React',
        'py': 'Python',
        'java': 'Java',
        'go': 'Go',
        'rs': 'Rust',
        'cpp': 'C++',
        'c': 'C',
        'cs': 'C#',
        'rb': 'Ruby',
        'php': 'PHP',
        'swift': 'Swift',
        'kt': 'Kotlin',
        'md': 'Markdown',
        'json': 'JSON',
        'yml': 'YAML',
        'yaml': 'YAML',
        'xml': 'XML',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
    };

    return typeMap[ext] || ext;
}

/**
 * Find common folder among files
 */
function findCommonFolder(files: string[]): string | null {
    if (files.length === 0) return null;

    const folders = files.map(f => {
        const parts = f.split(/[/\\]/);
        return parts.length > 1 ? parts[0] : null;
    }).filter(f => f !== null);

    if (folders.length === 0) return null;

    // Check if all files share the same folder
    const firstFolder = folders[0];
    if (folders.every(f => f === firstFolder)) {
        return firstFolder;
    }

    return null;
}

/**
 * Get unique file extensions
 */
function getUniqueExtensions(files: string[]): string[] {
    const extensions = files.map(f => {
        const match = f.match(/\.([^.]+)$/);
        return match ? match[1] : null;
    }).filter(ext => ext !== null) as string[];

    return [...new Set(extensions)];
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
    // Check if any file looks like it might be new
    // This is a simple heuristic - new files often don't have extensions
    // or are in new directories. This is not perfect but works for most cases.
    // A better approach would be to parse git status codes, but we only have filenames here.
    return false; // Conservative approach - rely on other rules
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
