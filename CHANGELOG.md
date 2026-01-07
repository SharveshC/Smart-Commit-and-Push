# Changelog

All notable changes to the "Smart Commit & Push" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-08

### Added
- Initial release of Smart Commit & Push extension
- Automatic commit message generation using rule-based logic
- Support for Conventional Commits format (feat, fix, docs, test, refactor, chore)
- Automatic scope detection from file paths
- Interactive commit message dialog with edit capability
- One-command commit and push workflow
- Git status, diff, and diff --stat analysis
- Success and error notifications
- Offline operation (no external services required)
- Zero runtime dependencies

### Features
- **Command**: `Smart Commit & Push` - Analyzes changes, generates commit message, commits, and pushes
- **Commit Types**: Automatically detects commit type based on file changes
- **Scope Inference**: Infers scope from folder structure (auth, api, ui, core, utils, test)
- **Editable Messages**: Users can review and edit generated messages before committing
- **Error Handling**: Graceful error handling for non-git workspaces and failed operations

### Technical
- Built with TypeScript
- Uses VS Code Extension API
- Git operations via `child_process.exec`
- Clean separation of concerns (extension, gitService, ruleEngine, ui)
- Strict TypeScript configuration
- Comprehensive documentation

## [Unreleased]

### Planned
- Configuration options for custom commit types
- Support for multi-root workspaces
- Commit message templates
- Git hooks integration
- Commit history analysis
