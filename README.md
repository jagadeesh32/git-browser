# git-browser

A local Git visualization browser (CLI + Web UI)

## Overview

**git-browser** is a CLI-installed tool that reads a local `.git` directory and launches a browser-based UI to visually explore Git history.

It allows users to:
- Visualize branches and commits as a graph (railway-track style)
- Browse commits per branch
- Inspect file changes for any commit
- Explore Git history interactively — completely offline

The tool is **read-only** and does not modify Git data.

## Installation

```bash
pip install git-browser
```

Or for development:

```bash
# Clone the repository
cd git-browser

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e .
```

## Usage

Navigate to any Git repository and run:

```bash
git-browser
```

This will:
1. Analyze the local `.git` directory
2. Start a local web server
3. Open your browser to the visualization interface

## Features

- **Offline**: Works completely offline, no internet required
- **Read-only**: Never modifies your Git repository
- **Visual**: Interactive graph-based visualization
- **Fast**: Direct `.git` directory parsing for performance
- **Comprehensive**: View commits, branches, tags, and file changes

## Architecture

- **Backend**: Python + FastAPI
- **Frontend**: React.js + Tailwind CSS
- **Visualization**: D3.js/Cytoscape.js
- **Server**: Uvicorn (localhost only)

## Development

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Format code
black .

# Type checking
mypy git_browser
```

## License

MIT
