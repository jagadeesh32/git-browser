"""Command-line interface for git-browser."""
import os
import sys
import argparse
import webbrowser
from pathlib import Path
import uvicorn

from .api.server import create_app


def find_git_repo(start_path: str = ".") -> Path:
    """Find the Git repository root starting from the given path.

    Args:
        start_path: Path to start searching from

    Returns:
        Path to the Git repository root

    Raises:
        ValueError: If no Git repository is found
    """
    current = Path(start_path).resolve()

    # Check if current directory has .git
    while current != current.parent:
        git_dir = current / ".git"
        if git_dir.exists():
            return current
        current = current.parent

    raise ValueError("Not a git repository (or any parent up to mount point)")


def main():
    """Main entry point for the CLI."""
    parser = argparse.ArgumentParser(
        description="Git Browser - Visual Git history explorer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  git-browser                  # Start browser in current directory
  git-browser /path/to/repo    # Start browser for specific repository
  git-browser --port 8080      # Use custom port
  git-browser --no-browser     # Don't open browser automatically
        """
    )

    parser.add_argument(
        "path",
        nargs="?",
        default=".",
        help="Path to Git repository (default: current directory)"
    )

    parser.add_argument(
        "-p", "--port",
        type=int,
        default=8000,
        help="Port to run the server on (default: 8000)"
    )

    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host to bind the server to (default: 127.0.0.1)"
    )

    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Don't open the browser automatically"
    )

    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload for development"
    )

    args = parser.parse_args()

    # Find the Git repository
    try:
        repo_path = find_git_repo(args.path)
        print(f"Git repository found: {repo_path}")
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        print("Please run this command from within a Git repository.", file=sys.stderr)
        sys.exit(1)

    # Create the FastAPI app
    try:
        app = create_app(str(repo_path))
    except Exception as e:
        print(f"Error: Failed to initialize Git browser: {e}", file=sys.stderr)
        sys.exit(1)

    # Print startup information
    url = f"http://{args.host}:{args.port}"
    print()
    print("=" * 60)
    print("🚀 Git Browser is starting...")
    print("=" * 60)
    print(f"  Repository:  {repo_path}")
    print(f"  Server URL:  {url}")
    print(f"  API Docs:    {url}/docs")
    print("=" * 60)
    print()
    print("Press CTRL+C to stop the server")
    print()

    # Open browser unless --no-browser is specified
    if not args.no_browser:
        try:
            webbrowser.open(url)
            print(f"✓ Opening browser at {url}")
        except Exception as e:
            print(f"⚠ Could not open browser automatically: {e}")
            print(f"  Please open {url} manually in your browser")

    # Start the server
    try:
        uvicorn.run(
            app,
            host=args.host,
            port=args.port,
            log_level="info",
            reload=args.reload
        )
    except KeyboardInterrupt:
        print("\n\nShutting down Git Browser...")
        sys.exit(0)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
