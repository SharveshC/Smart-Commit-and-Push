# Smart Commit & Push

> Automate your git workflow with intelligent commit messages

A Visual Studio Code extension that automatically generates meaningful commit messages using rule-based logic and executes commit and push operations with a single command.

## ✨ Features

- **🚀 One-Command Workflow** - Commit and push your changes with a single command
- **🤖 Smart Commit Messages** - Automatically generates conventional commit messages based on your changes
- **📝 Editable Messages** - Review and edit the generated message before committing
- **⚡ Fast & Predictable** - Rule-based logic with instant message generation
- **🔒 Offline Operation** - Works entirely offline using local git commands
- **📦 Zero Dependencies** - No external services or runtime dependencies

## 🎯 Quick Start

1. Install the extension from the VS Code Marketplace (Smart Commit & Push)
2. Open any git repository in VS Code
3. Make changes to your files
4. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
5. Run **"Smart Commit & Push"**
6. Review the generated commit message
7. Press Enter to commit and push!

## 📋 How It Works

The extension analyzes your changes and generates commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>
```

### Commit Types

| Type | When Used |
|------|-----------|
| `feat` | New features or functionality |
| `fix` | Bug fixes or issue resolutions |
| `docs` | Documentation changes |
| `test` | Test file changes |
| `refactor` | Code restructuring |
| `chore` | Configuration or tooling changes |

### Scope Detection

The extension automatically infers the scope from your file paths:

- `auth/` → `auth`
- `api/` → `api`
- `ui/`, `components/` → `ui`
- `core/`, `models/` → `core`
- `utils/` → `utils`
- `test/`, `tests/` → `test`

### Example Outputs

| Your Changes | Generated Message |
|--------------|-------------------|
| Edit `README.md` | `docs(core): improve README documentation` |
| Add `src/auth/login.ts` | `feat(auth): add login` |
| Fix bug in `api/users.ts` | `fix(api): resolve issue in users` |
| Update `package.json` | `chore(config): configure package` |
| Multiple auth files | `feat(auth): implement auth features` |
| Multiple TypeScript files | `feat(core): implement TypeScript features` |

## 🛠️ Requirements

- Visual Studio Code 1.75.0 or higher
- Git installed and available in PATH
- A git repository initialized in your workspace

## 📥 Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions view (`Ctrl+Shift+X`)
3. Search for "Smart Commit & Push"
4. Click Install

### From VSIX File

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click the `...` menu → "Install from VSIX..."
5. Select the downloaded file

## 🎨 Extension Settings

This extension works out of the box with no configuration required.

## 🔧 Development

### Setup

```bash
git clone https://github.com/oxel18/Autocommit.git
cd Autocommit
npm install
npm run compile
```

### Testing Locally

1. Press `F5` to launch Extension Development Host
2. Open a git repository in the new window
3. Make changes and run "Smart Commit & Push"

### Building

```bash
npm run compile
vsce package
```

## 🏗️ Architecture

The extension is built with clean separation of concerns:

- **`extension.ts`** - Command registration and orchestration
- **`gitService.ts`** - Git operations (status, diff, commit, push)
- **`ruleEngine.ts`** - Rule-based commit message generation
- **`ui.ts`** - VS Code UI interactions

## 🚨 Error Handling

The extension provides human-readable error messages for common scenarios:

- **No git repository**: "Current workspace is not a git repository. Run 'git init' to initialize."
- **No changes**: "No changes to commit. Make some changes first."
- **No upstream branch**: "Git push failed: No upstream branch configured. Run 'git push --set-upstream origin \<branch\>' first."
- **Authentication required**: "Git push failed: Authentication required. Please configure your git credentials."
- **Network error**: "Git push failed: Network error. Check your internet connection."

## 📝 Commit Message Quality

The extension generates professional, specific commit messages:

✅ **Good Examples**:
- `feat(auth): implement password validation`
- `fix(api): resolve empty request handling`
- `docs(core): improve README documentation`
- `chore(config): configure tsconfig paths`

❌ **Avoids Generic Messages**:
- ~~`feat(core): update changes`~~
- ~~`chore(core): modify files`~~


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SharveshC.smart-commit-push)
- [Report Issues](https://github.com/SharveshC/Autocommit/issues)




