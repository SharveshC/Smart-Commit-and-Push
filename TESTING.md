# Testing Guide for Smart Commit & Push

## Prerequisites
- VS Code installed
- Git installed and in PATH
- A test git repository with a remote configured

## Local Testing Steps

### 1. Launch Extension Development Host

1. Open the project in VS Code:
   ```bash
   cd d:\coding\coding\projects\PROJECTS\autocommit
   code .
   ```

2. Press **F5** to launch Extension Development Host
   - This opens a new VS Code window with your extension loaded
   - Check the Debug Console for "Smart Commit & Push extension is now active"

### 2. Test Scenarios

#### Scenario 1: Documentation Changes
**Setup:**
```bash
# In a test git repository
echo "# Test" >> README.md
```

**Execute:**
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Smart Commit & Push"
3. Run the command

**Expected Result:**
- Dialog shows: `docs(core): update README`
- Can edit the message
- Commits and pushes successfully

#### Scenario 2: Multiple File Changes
**Setup:**
```bash
# Create multiple files
echo "test" > src/auth/login.ts
echo "test" > src/auth/logout.ts
```

**Expected Result:**
- Dialog shows: `feat(auth): add new features (2 files)`

#### Scenario 3: Test Files
**Setup:**
```bash
echo "test" > src/component.test.ts
```

**Expected Result:**
- Dialog shows: `test(core): add tests for component`

#### Scenario 4: Config Files
**Setup:**
```bash
echo "{}" > .eslintrc.json
```

**Expected Result:**
- Dialog shows: `chore(config): update .eslintrc`

#### Scenario 5: Bug Fix
**Setup:**
```bash
# Edit a file and add "fix bug" in the changes
echo "// fix bug in authentication" >> src/auth/login.ts
```

**Expected Result:**
- Dialog shows: `fix(auth): fix issue in login`

### 3. Error Handling Tests

#### Test: No Git Repository
1. Open a folder that's not a git repository
2. Run "Smart Commit & Push"
3. **Expected**: Error notification "Current workspace is not a git repository"

#### Test: No Changes
1. Open a git repository with no changes
2. Run "Smart Commit & Push"
3. **Expected**: Warning notification "No changes to commit"

#### Test: No Workspace
1. Close all folders in VS Code
2. Run "Smart Commit & Push"
3. **Expected**: Error notification "No workspace folder is open"

#### Test: Cancel Commit
1. Make changes
2. Run "Smart Commit & Push"
3. Press Escape in the dialog
4. **Expected**: Warning notification "Commit cancelled"

### 4. Manual Verification Checklist

- [ ] Extension activates without errors
- [ ] Command appears in Command Palette
- [ ] Generates correct commit type for docs
- [ ] Generates correct commit type for tests
- [ ] Generates correct commit type for config
- [ ] Generates correct commit type for features
- [ ] Generates correct commit type for fixes
- [ ] Infers correct scope from file paths
- [ ] Dialog shows generated message
- [ ] Can edit message in dialog
- [ ] Validates empty messages
- [ ] Commits successfully
- [ ] Pushes successfully
- [ ] Shows success notification
- [ ] Handles non-git workspace error
- [ ] Handles no changes error
- [ ] Handles no workspace error
- [ ] Handles cancel action

## Debugging Tips

### View Extension Logs
1. In Extension Development Host, open Output panel
2. Select "Extension Host" from dropdown
3. Look for console.log messages

### Check Git Commands
The extension executes these git commands:
```bash
git rev-parse --git-dir          # Check if git repo
git status --porcelain           # Get changed files
git diff                         # Get unstaged changes
git diff --cached                # Get staged changes
git diff --stat HEAD             # Get statistics
git add -A                       # Stage all changes
git commit -m "message"          # Commit
git rev-parse --abbrev-ref HEAD  # Get current branch
git push origin <branch>         # Push
```

### Common Issues

**Issue**: Extension doesn't activate
- **Solution**: Check Debug Console for errors

**Issue**: Command not found
- **Solution**: Verify package.json command registration matches extension.ts

**Issue**: Git commands fail
- **Solution**: Ensure git is in PATH and repository has remote configured

**Issue**: Push fails
- **Solution**: Check if remote is configured: `git remote -v`

## Production Testing

Before publishing, test in a real-world scenario:

1. Use the extension on this project itself
2. Make actual changes to the codebase
3. Run Smart Commit & Push
4. Verify the commit message is appropriate
5. Check that changes are pushed to remote

## Performance Testing

The extension should be fast:
- Git info collection: < 1 second
- Message generation: < 100ms
- Commit and push: Depends on network, but should show progress

## Success Criteria

✅ All test scenarios pass
✅ All error handling works correctly
✅ Extension is responsive and fast
✅ Commit messages are meaningful
✅ No console errors or warnings
✅ Code compiles without errors
✅ Extension works in real git repositories
