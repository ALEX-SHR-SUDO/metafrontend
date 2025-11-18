# Dev to Main Branch Workflow Guide

This guide explains how to use the GitHub Actions workflow for managing changes between `dev` and `main` branches.

## Overview

The "Dev to Main Sync" workflow automates the process of syncing changes from the development branch to the main branch, supporting both PR-based and direct merge approaches.

## Features

- ✅ **Auto-create dev branch** - Creates `dev` branch automatically if it doesn't exist
- ✅ **Smart detection** - Only acts when there are actual differences between branches
- ✅ **Flexible merging** - Choose between creating a PR or direct merge
- ✅ **Automatic triggers** - Can run automatically on push to dev branch
- ✅ **Safe operations** - Skips workflow if branches are already in sync

## Usage

### Method 1: Manual Trigger (Recommended)

1. Navigate to the **Actions** tab in your GitHub repository
2. Select "Dev to Main Sync" workflow from the left sidebar
3. Click the "Run workflow" dropdown button
4. Choose your options:
   - **Create pull request**: Select `true` to create a PR for review, or `false` for direct merge
5. Click the green "Run workflow" button

### Method 2: Automatic Trigger

The workflow automatically runs when changes are pushed to the `dev` branch:

```bash
git checkout dev
git add .
git commit -m "Your changes"
git push origin dev
```

This will automatically create a pull request for review.

## Workflow Options

### Create Pull Request (default: true)

- **`true`**: Creates a pull request from dev to main
  - Best for: Team collaboration, code review process
  - The PR will be labeled with `sync` and `automated`
  - Review and merge the PR manually when ready

- **`false`**: Directly merges dev into main (manual trigger only)
  - Best for: Quick deployments, solo development
  - Changes are immediately merged to main
  - Use with caution in production environments

## Workflow Behavior

### When Dev Branch Doesn't Exist

The workflow will:
1. Create a new `dev` branch from `main`
2. Push it to the remote repository
3. Complete successfully

### When Branches Are In Sync

The workflow will:
1. Check for differences between branches
2. Report "Dev and main branches are in sync"
3. Skip merge operations
4. Complete successfully

### When Changes Exist

The workflow will:
1. Detect differences between dev and main
2. Either create a PR or perform direct merge (based on settings)
3. Log the operation details
4. Complete successfully

## Best Practices

### For Teams

1. **Use PR mode** (`create_pr: true`)
   - Enables code review before merging to main
   - Maintains audit trail
   - Prevents accidental merges

2. **Regular syncing**
   - Run workflow weekly or after completing features
   - Keeps main branch up to date
   - Reduces merge conflicts

### For Solo Developers

1. **Choose based on workflow**
   - Use PR mode for important changes
   - Use direct merge for minor updates
   
2. **Keep dev branch active**
   - Work on features in dev branch
   - Sync to main when stable
   - Tag releases from main branch

## Troubleshooting

### Workflow Fails with Permission Error

**Solution:** Ensure repository settings allow GitHub Actions to create PRs:
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

### Merge Conflicts

**Solution:** Resolve conflicts manually:
1. Checkout main locally: `git checkout main && git pull`
2. Merge dev: `git merge dev`
3. Resolve conflicts in your editor
4. Commit and push: `git commit && git push`

### Dev Branch Out of Date

**Solution:** Sync dev with main first:
```bash
git checkout dev
git pull origin main
git push origin dev
```

## Examples

### Create a PR for Review

```bash
# Navigate to Actions → Dev to Main Sync → Run workflow
# Select: create_pr = true
# Click: Run workflow
```

### Direct Merge (Quick Deploy)

```bash
# Navigate to Actions → Dev to Main Sync → Run workflow
# Select: create_pr = false
# Click: Run workflow
```

### Automatic Sync on Push

```bash
git checkout dev
# Make your changes
git add .
git commit -m "Add new feature"
git push origin dev
# Workflow runs automatically and creates a PR
```

## Workflow File Location

The workflow is defined in:
```
.github/workflows/dev-to-main.yml
```

## Security Notes

- The workflow uses `GITHUB_TOKEN` which is automatically provided by GitHub
- Permissions are scoped to: `contents: write` and `pull-requests: write`
- No additional secrets or tokens are required

## Support

If you encounter issues with the workflow:
1. Check the Actions tab for detailed logs
2. Verify repository permissions are set correctly
3. Ensure dev and main branches exist
4. Review this guide for common solutions

---

**Related Documentation:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [About Pull Requests](https://docs.github.com/en/pull-requests)
