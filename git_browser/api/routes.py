"""FastAPI routes for Git browser API."""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from pathlib import Path

from ..git_parser.parser import GitParser
from ..git_parser.models import (
    GitRepository,
    GitBranch,
    GitTag,
    GitCommit,
    GitCommitDetails,
    GitGraphNode,
)

router = APIRouter()

# Global parser instance (will be set by the server)
_git_parser: Optional[GitParser] = None


def set_git_parser(parser: GitParser):
    """Set the global Git parser instance."""
    global _git_parser
    _git_parser = parser


def get_git_parser() -> GitParser:
    """Get the global Git parser instance."""
    if _git_parser is None:
        raise HTTPException(status_code=500, detail="Git parser not initialized")
    return _git_parser


@router.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "git-browser"}


@router.get("/api/repository", response_model=GitRepository)
async def get_repository():
    """Get complete repository information."""
    parser = get_git_parser()
    try:
        repo = parser.parse_repository()
        return repo
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing repository: {str(e)}")


@router.get("/api/branches", response_model=List[GitBranch])
async def get_branches():
    """Get all branches in the repository."""
    parser = get_git_parser()
    try:
        branches = parser.get_branches()
        return branches
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting branches: {str(e)}")


@router.get("/api/tags", response_model=List[GitTag])
async def get_tags():
    """Get all tags in the repository."""
    parser = get_git_parser()
    try:
        tags = parser.get_tags()
        return tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting tags: {str(e)}")


@router.get("/api/commits", response_model=List[GitCommit])
async def get_commits(limit: int = Query(default=100, ge=1, le=1000), branch: Optional[str] = None):
    """Get commits from the repository.

    Args:
        limit: Maximum number of commits to return
        branch: Optional branch name to filter commits
    """
    parser = get_git_parser()
    try:
        branches = parser.get_branches()

        if branch:
            # Filter to specific branch
            branch_obj = next((b for b in branches if b.name == branch), None)
            if not branch_obj:
                raise HTTPException(status_code=404, detail=f"Branch not found: {branch}")
            branches = [branch_obj]

        commits = parser.get_all_commits(branches, max_commits=limit)
        return commits
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting commits: {str(e)}")


@router.get("/api/commits/{sha}", response_model=GitCommit)
async def get_commit(sha: str):
    """Get a specific commit by SHA.

    Args:
        sha: Commit SHA-1 hash
    """
    parser = get_git_parser()
    try:
        commit = parser.get_commit(sha)
        if not commit:
            raise HTTPException(status_code=404, detail=f"Commit not found: {sha}")
        return commit
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting commit: {str(e)}")


@router.get("/api/graph", response_model=List[GitGraphNode])
async def get_commit_graph(limit: int = Query(default=500, ge=1, le=2000)):
    """Get commit graph for visualization.

    Args:
        limit: Maximum number of commits to include in graph
    """
    parser = get_git_parser()
    try:
        graph = parser.get_commit_graph(max_commits=limit)
        return graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting commit graph: {str(e)}")


@router.get("/api/commits/{sha}/details", response_model=GitCommitDetails)
async def get_commit_details(sha: str):
    """Get detailed commit information including file changes.

    Args:
        sha: Commit SHA-1 hash
    """
    parser = get_git_parser()
    try:
        details = parser.get_commit_details(sha)
        if not details:
            raise HTTPException(status_code=404, detail=f"Commit not found: {sha}")
        return details
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting commit details: {str(e)}")


@router.get("/api/commits/{sha}/files/{file_path:path}")
async def get_file_diff(sha: str, file_path: str):
    """Get diff for a specific file in a commit.

    Args:
        sha: Commit SHA-1 hash
        file_path: Path to the file
    """
    parser = get_git_parser()
    try:
        commit = parser.get_commit(sha)
        if not commit:
            raise HTTPException(status_code=404, detail=f"Commit not found: {sha}")

        # Get parent tree (use first parent for merge commits)
        parent_tree = None
        if commit.parents:
            parent_commit = parser.get_commit(commit.parents[0])
            if parent_commit:
                parent_tree = parent_commit.tree

        # Get tree contents
        old_files = parser.object_parser.get_tree_contents(parent_tree) if parent_tree else {}
        new_files = parser.object_parser.get_tree_contents(commit.tree)

        old_sha = old_files.get(file_path)
        new_sha = new_files.get(file_path)

        if not old_sha and not new_sha:
            raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

        diff_data = parser.generate_diff(old_sha, new_sha, file_path)
        return diff_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting file diff: {str(e)}")


@router.get("/api/info")
async def get_info():
    """Get basic repository information."""
    parser = get_git_parser()
    try:
        branches = parser.get_branches()
        tags = parser.get_tags()
        current_branch = parser.get_current_branch()

        # Count total commits (limited sample)
        sample_commits = parser.get_all_commits(branches, max_commits=100)

        return {
            "path": str(parser.repo_path),
            "current_branch": current_branch,
            "branch_count": len(branches),
            "tag_count": len(tags),
            "recent_commits": len(sample_commits),
            "branches": [{"name": b.name, "is_current": b.is_current} for b in branches],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting info: {str(e)}")
