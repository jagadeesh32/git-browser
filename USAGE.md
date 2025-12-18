# Git Browser - Usage Guide

## What Was Built

A complete CLI-based Git visualization tool with the following components:

### Backend (Python)
- **Git Parser** (`git_browser/git_parser/`): Direct `.git` directory parser
  - `objects.py`: Low-level Git object reading (commits, trees, blobs)
  - `parser.py`: High-level repository analysis
  - `models.py`: Pydantic data models
- **FastAPI Server** (`git_browser/api/`): REST API for Git data
  - `/api/repository`: Complete repository info
  - `/api/branches`: List all branches
  - `/api/tags`: List all tags
  - `/api/commits`: Get commits (with filters)
  - `/api/commits/{sha}`: Get specific commit
  - `/api/graph`: Get commit graph for visualization
  - `/api/info`: Repository summary
- **CLI** (`git_browser/cli.py`): Command-line entry point

### Frontend (React)
- **Components** (`frontend/src/components/`):
  - `GitGraph.jsx`: Interactive commit graph using vis-network
  - `CommitList.jsx`: Scrollable commit list
  - `CommitDetails.jsx`: Detailed commit viewer
  - `BranchList.jsx`: Branch selector
  - `Header.jsx`: Navigation header
- **Pages** (`frontend/src/pages/`):
  - `GraphPage.jsx`: Visual commit graph
  - `CommitsPage.jsx`: Commit history browser
  - `BranchesPage.jsx`: Branch explorer
- **Services** (`frontend/src/services/`):
  - `api.js`: Axios-based API client

## Installation

### Development Mode
```bash
# Navigate to the project
cd /home/vrinda/projects/git-browser

# Activate virtual environment
source venv/bin/activate

# Install package
pip install -e .
```

### Production Installation (Future)
```bash
pip install git-browser
```

## Usage

### Basic Usage
Navigate to any Git repository and run:
```bash
git-browser
```

This will:
1. Analyze the `.git` directory
2. Start a FastAPI server on http://localhost:8000
3. Open your browser automatically
4. Display the interactive Git visualization

### Command Options
```bash
# Use custom port
git-browser --port 8080

# Don't open browser automatically
git-browser --no-browser

# Specify repository path
git-browser /path/to/repo

# Use custom host
git-browser --host 0.0.0.0

# Enable auto-reload for development
git-browser --reload
```

### Example Commands
```bash
# Start browser in current directory
git-browser

# Browse a specific repository
git-browser ~/projects/my-repo

# Run on custom port without opening browser
git-browser --port 9000 --no-browser

# Development mode with auto-reload
git-browser --reload
```

## Features

### ✅ Implemented
- Direct `.git` directory parsing (no git CLI required)
- FastAPI REST API with comprehensive endpoints
- CLI tool with argument parsing
- React frontend with Tailwind CSS
- Git graph visualization (vis-network)
- Branch and commit browsing
- Commit details viewer
- Read-only operation (never modifies repository)
- Offline operation

### 🚧 To Be Implemented
- Frontend build integration
- File diff viewer
- Tree browser for commits
- Search and filter functionality
- Tag visualization
- Merge commit highlighting
- Performance optimizations for large repos
- Dark/light theme toggle

## Architecture

```
git-browser/
├── git_browser/              # Python backend
│   ├── __init__.py
│   ├── cli.py               # CLI entry point
│   ├── api/                 # FastAPI server
│   │   ├── __init__.py
│   │   ├── routes.py        # API endpoints
│   │   └── server.py        # Server setup
│   └── git_parser/          # Git parsing logic
│       ├── __init__.py
│       ├── models.py        # Data models
│       ├── objects.py       # Git object reader
│       └── parser.py        # Repository parser
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── services/        # API client
│   └── dist/                # Built frontend (to be added)
├── tests/                    # Test suite (to be implemented)
├── pyproject.toml           # Package configuration
├── requirements.txt         # Dependencies
└── README.md               # Project documentation
```

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/repository` - Complete repository data
- `GET /api/branches` - List all branches
- `GET /api/tags` - List all tags
- `GET /api/commits?limit=100&branch=main` - Get commits
- `GET /api/commits/{sha}` - Get specific commit
- `GET /api/graph?limit=500` - Get commit graph
- `GET /api/info` - Repository summary

## Testing

The tool has been tested with a sample repository containing:
- 3 commits
- 2 branches (master, feature/frontend)
- Parent-child relationships
- Branch associations

Results:
✅ Git parser correctly reads `.git` directory
✅ Branches detected and current branch identified
✅ Commits parsed with full metadata
✅ Commit graph generated with proper relationships
✅ CLI command works
✅ API server starts successfully

## Development

### Running Tests
```bash
pytest
```

### Building Frontend
```bash
cd frontend
npm install
npm run build
```

### Development Mode
```bash
# Backend with auto-reload
git-browser --reload

# Frontend dev server
cd frontend
npm run dev
```

## Next Steps

To complete the project for production:
1. Build and integrate the React frontend
2. Add file diff viewer
3. Implement tree browser
4. Add comprehensive tests
5. Performance optimization for large repositories
6. Package for PyPI distribution
7. Add documentation and examples
8. Create demo repository

## Troubleshooting

### "Not a git repository" Error
Make sure you're running the command from within a Git repository or specify a valid repository path.

### Port Already in Use
Use `--port` to specify a different port:
```bash
git-browser --port 8080
```

### Module Import Errors
Make sure the package is installed:
```bash
pip install -e .
```

## License
MIT
