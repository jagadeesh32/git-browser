# Local Testing Guide

This document explains how to test the `git-browser` CLI tool locally before publishing to PyPI.

## Prerequisites

- Python 3.8 or higher
- Node.js 18+ (for frontend build)
- npm

## Step 1: Build the Frontend

```bash
# Navigate to frontend directory
cd /home/vrinda/projects/git-browser/frontend

# Install dependencies
npm install

# Build the frontend
npm run build
```

## Step 2: Install Python Package in Development Mode

```bash
# Navigate to project root
cd /home/vrinda/projects/git-browser

# Create a virtual environment (if not already created)
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install the package in editable/development mode
pip install -e .
```

## Step 3: Test the CLI

```bash
# Check if the CLI is installed correctly
git-browser --help

# Run git-browser in the current directory (if it's a git repo)
git-browser .

# Run git-browser with a specific repository path
git-browser /path/to/your/git/repo

# Run git-browser (defaults to current directory)
git-browser
```

## Step 4: Run Tests (Optional)

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run pytest
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_cli.py
```

## Step 5: Build the Package (Optional)

If you want to test the full package build:

```bash
# Install build tools
pip install build twine

# Build the package
python -m build

# Check the package
twine check dist/*

# Test installation from the built wheel
pip install dist/git_browser-*.whl
```

## Troubleshooting

### Frontend build fails
- Make sure you have Node.js 18+ installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### CLI not found after installation
- Make sure you've activated the virtual environment: `source venv/bin/activate`
- Reinstall the package: `pip install -e .`

### Import errors
- Check that all dependencies are installed: `pip install -e ".[dev]"`

## Quick One-Liner Setup

```bash
# Full setup in one command (run from project root)
cd frontend && npm install && npm run build && cd .. && python3 -m venv venv && source venv/bin/activate && pip install -e . && git-browser --help
```
