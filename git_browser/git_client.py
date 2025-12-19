import subprocess
import os
from typing import List, Optional, Tuple
from .git_parser.models import RepoStatus, FileStatus

class GitClient:
    """Wrapper around git subprocess calls."""

    def __init__(self, repo_path: str):
        self.repo_path = repo_path

    def _run_git(self, args: List[str]) -> Tuple[str, str, int]:
        """Run a git command."""
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                env={**os.environ, "LC_ALL": "C"} # Ensure consistent output
            )
            return result.stdout, result.stderr, result.returncode
        except Exception as e:
            return "", str(e), -1

    def get_status(self) -> RepoStatus:
        """Get repository status using git status --porcelain."""
        stdout, stderr, code = self._run_git(["status", "--porcelain", "-b"])
        if code != 0:
            raise Exception(f"Failed to get status: {stderr}")

        lines = stdout.splitlines()
        branch_line = lines[0] if lines else "## No commits yet on HEAD"
        
        # Parse branch info "## master...origin/master [ahead 1]"
        branch_info = branch_line[3:].split("...")
        current_branch = branch_info[0]
        ahead = 0
        behind = 0
        
        if len(branch_info) > 1:
            tracking = branch_info[1]
            if "[" in tracking:
                # Parse ahead/behind
                stats = tracking.split("[")[1].split("]")[0]
                parts = stats.split(", ")
                for part in parts:
                    if "ahead" in part:
                        ahead = int(part.split(" ")[1])
                    elif "behind" in part:
                        behind = int(part.split(" ")[1])

        staged = []
        unstaged = []
        untracked = []

        for line in lines[1:]:
            if not line: continue
            code = line[:2]
            path = line[3:]

            # Status codes:
            # ' ' = unmodified
            # 'M' = modified
            # 'A' = added
            # 'D' = deleted
            # 'R' = renamed
            # 'C' = copied
            # 'U' = updated but unmerged
            # '?' = untracked
            
            x = code[0] # Index
            y = code[1] # Worktree

            if x == '?' and y == '?':
                untracked.append(path)
                continue

            # Staged changes (Index has status)
            if x in 'MADRC':
                status_map = {'M': 'modified', 'A': 'added', 'D': 'deleted', 'R': 'renamed', 'C': 'copied'}
                staged.append(FileStatus(path=path, status=status_map.get(x, 'unknown'), staged=True))

            # Unstaged changes (Worktree has status)
            if y in 'MADRC':
                status_map = {'M': 'modified', 'A': 'added', 'D': 'deleted', 'R': 'renamed', 'C': 'copied'}
                unstaged.append(FileStatus(path=path, status=status_map.get(y, 'unknown'), staged=False))

        return RepoStatus(
            branch=current_branch,
            staged=staged,
            unstaged=unstaged,
            untracked=untracked,
            ahead=ahead,
            behind=behind
        )

    def stage_file(self, path: str):
        stdout, stderr, code = self._run_git(["add", path])
        if code != 0:
            raise Exception(f"Failed to stage {path}: {stderr}")

    def unstage_file(self, path: str):
        stdout, stderr, code = self._run_git(["restore", "--staged", path])
        if code != 0:
            raise Exception(f"Failed to unstage {path}: {stderr}")

    def commit(self, message: str):
        stdout, stderr, code = self._run_git(["commit", "-m", message])
        if code != 0:
            raise Exception(f"Failed to commit: {stderr}")
            
    def push(self):
        stdout, stderr, code = self._run_git(["push"])
        if code != 0:
            raise Exception(f"Failed to push: {stderr}")

    def pull(self):
        stdout, stderr, code = self._run_git(["pull"])
        if code != 0:
            raise Exception(f"Failed to pull: {stderr}")

    def fetch(self):
        stdout, stderr, code = self._run_git(["fetch"])
        if code != 0:
            raise Exception(f"Failed to fetch: {stderr}")

    def checkout_branch(self, branch_name: str):
        stdout, stderr, code = self._run_git(["checkout", branch_name])
        if code != 0:
            raise Exception(f"Failed to checkout {branch_name}: {stderr}")

    def create_branch(self, branch_name: str):
        stdout, stderr, code = self._run_git(["branch", branch_name])
        if code != 0:
            raise Exception(f"Failed to create branch {branch_name}: {stderr}")

    def delete_branch(self, branch_name: str):
        stdout, stderr, code = self._run_git(["branch", "-D", branch_name])
        if code != 0:
            raise Exception(f"Failed to delete branch {branch_name}: {stderr}")

    def get_diff(self, path: str, staged: bool = False) -> dict:
        """Get diff for a file."""
        args = ["diff", "--no-color"]
        if staged:
            args.append("--staged")
        
        args.append("--")
        args.append(path)

        stdout, stderr, code = self._run_git(args)
        if code != 0:
            raise Exception(f"Failed to get diff for {path}: {stderr}")
            
        # Handle untracked files (no diff from git, need to read file content)
        if not stdout and not staged:
             # Check if file exists and is untracked (simplified check)
             if os.path.exists(os.path.join(self.repo_path, path)):
                 # Create a fake diff for new file
                 try:
                     with open(os.path.join(self.repo_path, path), 'r') as f:
                         content = f.read()
                         lines = content.splitlines()
                         diff_lines = [f"diff --git a/{path} b/{path}",
                                       f"new file mode 100644",
                                       f"--- /dev/null",
                                       f"+++ b/{path}",
                                       f"@@ -0,0 +1,{len(lines)} @@"]
                         diff_lines.extend([f"+{line}" for line in lines])
                         stdout = "\n".join(diff_lines)
                 except:
                     pass # Binary or error

        return {
            "diff": stdout,
            "is_binary": "Binary files" in stdout
        }

    def get_config(self, key: str) -> str:
        """Get a git config value."""
        stdout, stderr, code = self._run_git(["config", "--get", key])
        return stdout.strip()

    def set_config(self, key: str, value: str):
        """Set a git config value."""
        stdout, stderr, code = self._run_git(["config", key, value])
        if code != 0:
            raise Exception(f"Failed to set config {key}: {stderr}")
