"""Git object parsers for reading .git directory."""

import os
import zlib
import re
from typing import Optional, Tuple, Dict, Any
from pathlib import Path


class GitObjectParser:
    """Parser for Git objects stored in .git/objects directory."""

    def __init__(self, git_dir: Path):
        self.git_dir = git_dir
        self.objects_dir = git_dir / "objects"

    def read_object(self, sha: str) -> Optional[Tuple[str, bytes]]:
        """Read a Git object by its SHA-1 hash.

        Returns:
            Tuple of (object_type, content) or None if object not found
        """
        # Git stores objects as objects/XX/YYYYYY... where XX are first 2 chars of SHA
        obj_dir = self.objects_dir / sha[:2]
        obj_file = obj_dir / sha[2:]

        if not obj_file.exists():
            return None

        try:
            # Read and decompress the object
            with open(obj_file, "rb") as f:
                compressed_data = f.read()

            decompressed_data = zlib.decompress(compressed_data)

            # Git objects format: "type size\0content"
            null_idx = decompressed_data.index(b"\x00")
            header = decompressed_data[:null_idx].decode("ascii")
            content = decompressed_data[null_idx + 1 :]

            obj_type, size = header.split(" ")
            return obj_type, content

        except Exception as e:
            print(f"Error reading object {sha}: {e}")
            return None

    def parse_commit(self, content: bytes) -> Dict[str, Any]:
        """Parse a commit object.

        Returns:
            Dictionary with commit information
        """
        lines = content.decode("utf-8", errors="replace").split("\n")

        commit_data = {
            "tree": "",
            "parents": [],
            "author": None,
            "committer": None,
            "message": "",
            "full_message": "",
        }

        message_lines = []
        in_message = False

        for line in lines:
            if in_message:
                message_lines.append(line)
            elif line.startswith("tree "):
                commit_data["tree"] = line.split(" ", 1)[1]
            elif line.startswith("parent "):
                commit_data["parents"].append(line.split(" ", 1)[1])
            elif line.startswith("author "):
                commit_data["author"] = self._parse_author_line(line)
            elif line.startswith("committer "):
                commit_data["committer"] = self._parse_author_line(line)
            elif line == "":
                in_message = True

        commit_data["full_message"] = "\n".join(message_lines).strip()
        commit_data["message"] = message_lines[0] if message_lines else ""

        return commit_data

    def _parse_author_line(self, line: str) -> Dict[str, Any]:
        """Parse author/committer line.

        Format: "author Name <email> timestamp timezone"
        """
        # Remove the prefix (author/committer)
        line = line.split(" ", 1)[1]

        # Extract name and email
        match = re.match(r"^(.+) <(.+)> (\d+) ([+-]\d{4})$", line)
        if not match:
            return {
                "name": "Unknown",
                "email": "unknown@example.com",
                "timestamp": 0,
                "timezone": "+0000",
            }

        name, email, timestamp, timezone = match.groups()

        return {"name": name, "email": email, "timestamp": int(timestamp), "timezone": timezone}

    def parse_tree(self, content: bytes) -> list:
        """Parse a tree object.

        Returns:
            List of tree entries (mode, type, sha, name)
        """
        entries = []
        idx = 0

        while idx < len(content):
            # Find the space (after mode)
            space_idx = content.index(b" ", idx)
            mode = content[idx:space_idx].decode("ascii")

            # Find the null byte (after filename)
            null_idx = content.index(b"\x00", space_idx)
            name = content[space_idx + 1 : null_idx].decode("utf-8", errors="replace")

            # Next 20 bytes are the SHA-1 hash
            sha_bytes = content[null_idx + 1 : null_idx + 21]
            sha = sha_bytes.hex()

            # Determine type from mode
            if mode.startswith("100"):
                obj_type = "blob"
            elif mode == "40000" or mode == "040000":
                obj_type = "tree"
            elif mode == "160000":
                obj_type = "commit"  # submodule
            else:
                obj_type = "unknown"

            entries.append({"mode": mode, "type": obj_type, "sha": sha, "name": name})

            idx = null_idx + 21

        return entries
