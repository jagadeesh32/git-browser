"""Data models for Git objects."""

from typing import List, Optional, Dict
from datetime import datetime
from pydantic import BaseModel


class GitAuthor(BaseModel):
    """Git author/committer information."""

    name: str
    email: str
    timestamp: int
    timezone: str


class GitCommit(BaseModel):
    """Git commit object."""

    sha: str
    tree: str
    parents: List[str]
    author: GitAuthor
    committer: GitAuthor
    message: str
    full_message: str


class GitBranch(BaseModel):
    """Git branch reference."""

    name: str
    commit_sha: str
    is_current: bool = False


class GitTag(BaseModel):
    """Git tag reference."""

    name: str
    commit_sha: str
    tag_type: str  # "annotated" or "lightweight"
    message: Optional[str] = None


class GitFileChange(BaseModel):
    """File change in a commit."""

    path: str
    change_type: str  # "added", "modified", "deleted", "renamed"
    old_path: Optional[str] = None
    additions: int = 0
    deletions: int = 0


class GitCommitDetails(BaseModel):
    """Detailed commit information including file changes."""

    commit: GitCommit
    files: List[GitFileChange]
    stats: Dict[str, int]  # {"files_changed": N, "additions": N, "deletions": N}


class GitGraphNode(BaseModel):
    """Node in the commit graph."""

    sha: str
    message: str
    author: str
    timestamp: int
    parents: List[str]
    branches: List[str]
    tags: List[str]


class GitRepository(BaseModel):
    """Complete Git repository information."""

    path: str
    branches: List[GitBranch]
    tags: List[GitTag]
    commits: List[GitCommit]
    current_branch: Optional[str] = None
