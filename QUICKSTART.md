# Quick Start Guide

## Testing the Extension Locally

1. **Open the project in VS Code**:
   ```bash
   cd d:\coding\coding\projects\PROJECTS\autocommit
   code .
   ```

2. **Press F5** to launch the Extension Development Host
   - A new VS Code window will open with your extension loaded

3. **In the new window**:
   - Open any git repository
   - Make some changes to files
   - Open Command Palette (`Ctrl+Shift+P`)
   - Type "Smart Commit & Push"
   - Review the generated commit message
   - Press Enter to commit and push

## Example Test Scenarios

### Test 1: Documentation Change
```bash
# Edit README.md
# Run command
# Expected: "docs(core): update README"
```

### Test 2: New Feature
```bash
# Create new file in src/auth/login.ts
# Run command
# Expected: "feat(auth): add login"
```

### Test 3: Bug Fix
```bash
# Edit file with bug fix
# Run command
# Expected: "fix(<scope>): fix issue in <file>"
```

## Publishing to Marketplace

1. **Install vsce**:
   ```bash
   npm install -g @vscode/vsce
   ```

2. **Update package.json**:
   - Change `publisher` to your publisher name

3. **Package**:
   ```bash
   vsce package
   ```

4. **Publish**:
   ```bash
   vsce login <your-publisher-name>
   vsce publish
   ```

## Project Structure

```
autocommit/
├── src/
│   ├── extension.ts       # Main entry point
│   ├── gitService.ts      # Git operations
│   ├── ruleEngine.ts      # Commit message rules
│   └── ui.ts              # VS Code UI
├── out/                   # Compiled JavaScript
├── package.json           # Extension manifest
├── README.md              # Full documentation
└── CHANGELOG.md           # Version history
```

## What Was Built

✅ **Complete VS Code extension** with:
- One-command commit and push workflow
- Rule-based commit message generation
- Conventional Commits format
- Automatic scope detection
- Interactive message editing
- Full error handling
- Zero external dependencies

✅ **Ready for**:
- Local testing (F5 debug)
- Publishing to VS Code Marketplace
- Resume showcase

## Next Steps

1. Test the extension locally with F5
2. Create a publisher account at [marketplace.visualstudio.com](https://marketplace.visualstudio.com/manage)
3. Publish to the marketplace
4. Add to your resume/portfolio!
