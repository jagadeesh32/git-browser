"""FastAPI server for Git browser."""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routes import router, set_git_parser, set_git_client
from ..git_parser.parser import GitParser
from ..git_client import GitClient


def create_app(repo_path: str) -> FastAPI:
    """Create and configure the FastAPI application.

    Args:
        repo_path: Path to the Git repository

    Returns:
        Configured FastAPI application
    """
    app = FastAPI(
        title="Git Browser API",
        description="REST API for browsing Git repository history",
        version="0.1.0",
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict this
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize Git parser and client
    try:
        parser = GitParser(repo_path)
        set_git_parser(parser)
        
        client = GitClient(repo_path)
        set_git_client(client)
        
        print(f"✓ Git repository loaded: {parser.repo_path}")
        print(f"✓ Current branch: {parser.get_current_branch()}")
    except Exception as e:
        print(f"✗ Error loading Git repository: {e}")
        raise

    # Include API routes
    app.include_router(router)

    # Serve frontend static files if they exist
    frontend_dist = Path(__file__).parent.parent.parent / "frontend" / "dist"
    if frontend_dist.exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            """Serve the React frontend."""
            # Serve index.html for all non-API routes
            if not full_path.startswith("api/"):
                index_file = frontend_dist / "index.html"
                if index_file.exists():
                    return FileResponse(index_file)
            return {"error": "Not found"}

    @app.get("/")
    async def root():
        """Root endpoint."""
        # If frontend exists, serve it
        if frontend_dist.exists():
            index_file = frontend_dist / "index.html"
            if index_file.exists():
                return FileResponse(index_file)

        # Otherwise return API info
        return {
            "service": "git-browser",
            "version": "0.1.0",
            "api_docs": "/docs",
            "repository": str(parser.repo_path),
        }

    return app
