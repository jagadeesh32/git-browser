"""Main Git repository parser."""
import os
from pathlib import Path
from typing import List, Optional, Dict
from .models import (
    GitRepository, GitBranch, GitTag, GitCommit,
    GitAuthor, GitCommitDetails, GitFileChange, GitGraphNode
)
from .objects import GitObjectParser


class GitParser:
    """Parser for reading Git repository information."""

    def __init__(self, repo_path: str):
        """Initialize parser with repository path.

        Args:
            repo_path: Path to the repository (can be root or .git directory)
        """
        self.repo_path = Path(repo_path).resolve()

        # Find .git directory
        if self.repo_path.name == '.git':
            self.git_dir = self.repo_path
            self.repo_path = self.repo_path.parent
        else:
            self.git_dir = self.repo_path / '.git'

        if not self.git_dir.exists():
            raise ValueError(f"Not a git repository: {repo_path}")

        self.object_parser = GitObjectParser(self.git_dir)

    def parse_repository(self) -> GitRepository:
        """Parse the complete repository structure.

        Returns:
            GitRepository object with all repository information
        """
        branches = self.get_branches()
        tags = self.get_tags()
        current_branch = self.get_current_branch()

        # Get all commits from all branches
        all_commits = self.get_all_commits(branches)

        return GitRepository(
            path=str(self.repo_path),
            branches=branches,
            tags=tags,
            commits=all_commits,
            current_branch=current_branch
        )

    def get_current_branch(self) -> Optional[str]:
        """Get the current branch name."""
        head_file = self.git_dir / "HEAD"

        if not head_file.exists():
            return None

        try:
            with open(head_file, 'r') as f:
                content = f.read().strip()

            if content.startswith('ref: refs/heads/'):
                return content.replace('ref: refs/heads/', '')

            return None  # Detached HEAD
        except Exception:
            return None

    def get_branches(self) -> List[GitBranch]:
        """Get all branches in the repository."""
        branches = []
        heads_dir = self.git_dir / "refs" / "heads"

        if not heads_dir.exists():
            return branches

        current_branch = self.get_current_branch()

        # Recursively find all branch files
        for branch_file in heads_dir.rglob('*'):
            if branch_file.is_file():
                try:
                    with open(branch_file, 'r') as f:
                        commit_sha = f.read().strip()

                    # Get branch name relative to refs/heads
                    branch_name = str(branch_file.relative_to(heads_dir))

                    branches.append(GitBranch(
                        name=branch_name,
                        commit_sha=commit_sha,
                        is_current=(branch_name == current_branch)
                    ))
                except Exception as e:
                    print(f"Error reading branch {branch_file}: {e}")

        return branches

    def get_tags(self) -> List[GitTag]:
        """Get all tags in the repository."""
        tags = []
        tags_dir = self.git_dir / "refs" / "tags"

        if not tags_dir.exists():
            return tags

        for tag_file in tags_dir.rglob('*'):
            if tag_file.is_file():
                try:
                    with open(tag_file, 'r') as f:
                        ref = f.read().strip()

                    tag_name = str(tag_file.relative_to(tags_dir))

                    # Check if it's an annotated tag
                    obj_data = self.object_parser.read_object(ref)
                    if obj_data and obj_data[0] == 'tag':
                        # Annotated tag - parse to get commit SHA
                        tag_content = obj_data[1].decode('utf-8', errors='replace')
                        commit_sha = None
                        message = []
                        in_message = False

                        for line in tag_content.split('\n'):
                            if in_message:
                                message.append(line)
                            elif line.startswith('object '):
                                commit_sha = line.split(' ', 1)[1]
                            elif line == '':
                                in_message = True

                        tags.append(GitTag(
                            name=tag_name,
                            commit_sha=commit_sha or ref,
                            tag_type='annotated',
                            message='\n'.join(message).strip()
                        ))
                    else:
                        # Lightweight tag - points directly to commit
                        tags.append(GitTag(
                            name=tag_name,
                            commit_sha=ref,
                            tag_type='lightweight'
                        ))

                except Exception as e:
                    print(f"Error reading tag {tag_file}: {e}")

        return tags

    def get_commit(self, sha: str) -> Optional[GitCommit]:
        """Get a specific commit by SHA.

        Args:
            sha: Commit SHA-1 hash

        Returns:
            GitCommit object or None if not found
        """
        obj_data = self.object_parser.read_object(sha)

        if not obj_data or obj_data[0] != 'commit':
            return None

        commit_data = self.object_parser.parse_commit(obj_data[1])

        return GitCommit(
            sha=sha,
            tree=commit_data['tree'],
            parents=commit_data['parents'],
            author=GitAuthor(**commit_data['author']),
            committer=GitAuthor(**commit_data['committer']),
            message=commit_data['message'],
            full_message=commit_data['full_message']
        )

    def get_all_commits(self, branches: List[GitBranch], max_commits: int = 1000) -> List[GitCommit]:
        """Get all commits from all branches.

        Args:
            branches: List of branches to traverse
            max_commits: Maximum number of commits to retrieve

        Returns:
            List of GitCommit objects
        """
        commits = []
        seen_shas = set()
        to_visit = [branch.commit_sha for branch in branches]

        while to_visit and len(commits) < max_commits:
            sha = to_visit.pop(0)

            if sha in seen_shas:
                continue

            seen_shas.add(sha)

            commit = self.get_commit(sha)
            if commit:
                commits.append(commit)
                # Add parents to visit queue
                to_visit.extend(commit.parents)

        return commits

    def get_commit_graph(self, max_commits: int = 1000) -> List[GitGraphNode]:
        """Get commit graph for visualization.

        Returns:
            List of GitGraphNode objects
        """
        branches = self.get_branches()
        tags = self.get_tags()
        commits = self.get_all_commits(branches, max_commits)

        # Build SHA to branches/tags mapping
        sha_to_branches: Dict[str, List[str]] = {}
        sha_to_tags: Dict[str, List[str]] = {}

        for branch in branches:
            if branch.commit_sha not in sha_to_branches:
                sha_to_branches[branch.commit_sha] = []
            sha_to_branches[branch.commit_sha].append(branch.name)

        for tag in tags:
            if tag.commit_sha not in sha_to_tags:
                sha_to_tags[tag.commit_sha] = []
            sha_to_tags[tag.commit_sha].append(tag.name)

        # Create graph nodes
        graph_nodes = []
        for commit in commits:
            node = GitGraphNode(
                sha=commit.sha,
                message=commit.message,
                author=commit.author.name,
                timestamp=commit.author.timestamp,
                parents=commit.parents,
                branches=sha_to_branches.get(commit.sha, []),
                tags=sha_to_tags.get(commit.sha, [])
            )
            graph_nodes.append(node)

        return graph_nodes
