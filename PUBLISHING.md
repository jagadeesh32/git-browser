# Publishing to PyPI

This document explains how to publish `git-browser` to PyPI using GitHub Actions with multi-platform support.

## Overview

The package is automatically built and published to PyPI when you create a new version tag. The workflow:

1. **Builds the frontend** (React app) into static files
2. **Tests on multiple platforms**: Windows (x86/ARM), Linux (x86/ARM), macOS (Intel/Apple Silicon)
3. **Builds the Python package** with the frontend included
4. **Publishes to PyPI** using trusted publishing or API token

## Supported Platforms

The package is tested on:
- **Linux**: x86_64 and ARM64 (aarch64)
- **Windows**: x86_64 and ARM64
- **macOS**: Intel (x86_64) and Apple Silicon (ARM64)

Since this is a pure Python package (no C extensions), a single universal wheel works on all platforms.

## Setup Instructions

### Option 1: Trusted Publishing (Recommended)

Trusted publishing is the most secure method and doesn't require managing API tokens.

1. **Create a PyPI account** at https://pypi.org/account/register/

2. **Configure Trusted Publishing on PyPI**:
   - Go to https://pypi.org/manage/account/publishing/
   - Click "Add a new pending publisher"
   - Fill in the form:
     - **PyPI Project Name**: `git-browser`
     - **Owner**: `<your-github-username>` or `<your-org-name>`
     - **Repository name**: `git-browser`
     - **Workflow name**: `publish-pypi.yml`
     - **Environment name**: `pypi`
   - Click "Add"

3. **Create the PyPI environment in GitHub**:
   - Go to your GitHub repository → Settings → Environments
   - Click "New environment"
   - Name it `pypi`
   - (Optional) Add protection rules like requiring reviewers

4. **Done!** The workflow will use OpenID Connect (OIDC) to authenticate with PyPI automatically.

### Option 2: API Token

If you prefer using an API token:

1. **Create a PyPI API token**:
   - Go to https://pypi.org/manage/account/token/
   - Click "Add API token"
   - Give it a descriptive name (e.g., "GitHub Actions - git-browser")
   - Set the scope to "Entire account" or specific to "git-browser" project (after first release)
   - Copy the token (starts with `pypi-`)

2. **Add token to GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `PYPI_API_TOKEN`
   - Value: Paste your PyPI token
   - Click "Add secret"

3. **Update the workflow**:
   - Edit `.github/workflows/publish-pypi.yml`
   - In the `publish-pypi` job, uncomment the password line:
     ```yaml
     - name: Publish to PyPI
       uses: pypa/gh-action-pypi-publish@release/v1
       with:
         password: ${{ secrets.PYPI_API_TOKEN }}
         skip-existing: true
     ```

### Optional: TestPyPI for Testing

Before publishing to the real PyPI, test with TestPyPI:

1. **Create a TestPyPI account** at https://test.pypi.org/account/register/

2. **Configure Trusted Publishing for TestPyPI**:
   - Go to https://test.pypi.org/manage/account/publishing/
   - Add a new pending publisher with the same details as PyPI
   - Use environment name: `test-pypi`

3. **Create the test-pypi environment in GitHub**:
   - Go to your GitHub repository → Settings → Environments
   - Click "New environment"
   - Name it `test-pypi`

4. **Manually trigger the workflow** to publish to TestPyPI:
   - Go to Actions → "Build and Publish to PyPI"
   - Click "Run workflow"
   - This will publish to TestPyPI instead of PyPI

## Publishing a New Version

### Step 1: Update Version Number

Update the version in `pyproject.toml`:

```toml
[project]
name = "git-browser"
version = "0.2.0"  # Update this
```

### Step 2: Commit and Create Tag

```bash
# Commit the version change
git add pyproject.toml
git commit -m "Bump version to 0.2.0"
git push

# Create and push a version tag
git tag v0.2.0
git push origin v0.2.0
```

### Step 3: Monitor the Workflow

1. Go to your GitHub repository → Actions
2. Watch the "Build and Publish to PyPI" workflow run
3. The workflow will:
   - ✅ Build the frontend
   - ✅ Test on all platforms (Linux x86/ARM, Windows x86/ARM, macOS Intel/Apple Silicon)
   - ✅ Build the package
   - ✅ Publish to PyPI

### Step 4: Verify Publication

After a few minutes, check:
- https://pypi.org/project/git-browser/
- Install and test: `pip install git-browser`

## Troubleshooting

### Build Fails on ARM Platforms

ARM testing uses QEMU emulation which can be slow. If it times out, you can:
- Remove ARM testing from the workflow (keep only x86 platforms)
- Or increase the timeout in the workflow

### Frontend Build Fails

Ensure:
- `frontend/package.json` has the correct build script
- All frontend dependencies are in `package.json`
- Node version is compatible (workflow uses Node 20)

### PyPI Publishing Fails

**Error: "403 Forbidden"**
- Check that trusted publishing is configured correctly on PyPI
- Verify the environment name matches (`pypi`)
- If using API token, check that it's valid and has correct permissions

**Error: "File already exists"**
- The version already exists on PyPI
- Update the version number in `pyproject.toml`
- Create a new tag

**Error: "Invalid distribution file"**
- Run `twine check dist/*` locally to check for issues
- Ensure `MANIFEST.in` includes all necessary files

### Package Missing Frontend Files

If installed package doesn't include frontend:
- Check that frontend was built before packaging
- Verify `MANIFEST.in` includes `frontend/dist`
- Check `pyproject.toml` has correct `package-data` configuration

## Local Testing

Test the package build locally before publishing:

```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Build package
pip install build twine
python -m build

# Check package
twine check dist/*

# Test installation locally
pip install dist/git_browser-*.whl

# Test the CLI
git-browser --help
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backwards compatible
- **Patch** (0.0.1): Bug fixes, backwards compatible

## Workflow Files

- `.github/workflows/publish-pypi.yml`: Main publishing workflow
- `.github/workflows/test.yml`: Continuous testing on pull requests

## Package Configuration Files

- `pyproject.toml`: Package metadata and dependencies
- `MANIFEST.in`: Files to include in source distribution
- `LICENSE`: MIT license
- `README.md`: Package description (shown on PyPI)

## Support

For issues with:
- **PyPI publishing**: Check PyPI Help documentation
- **GitHub Actions**: Check workflow logs in the Actions tab
- **Package issues**: Open an issue on GitHub
