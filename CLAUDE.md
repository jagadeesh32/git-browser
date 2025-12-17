# Project: git-browser
*A local Git visualization browser (CLI + Web UI)*

---

## Overview
**git-browser** is a **CLI-installed tool** that reads a local `.git` directory and launches a **browser-based UI** to visually explore Git history.

It allows users to:
- Visualize branches and commits as a graph (railway-track style)
- Browse commits per branch
- Inspect file changes for any commit
- Explore Git history interactively — completely offline

The tool is **read-only** and does not modify Git data.

---

## Core Idea
> “Turn a `.git` folder into an interactive visual browser.”

---

## Primary Goals
1. Provide a **visual Git history browser** without GitHub/GitLab.
2. Work **offline**, directly from the local `.git` directory.
3. Make Git commit graphs **easy to understand visually**.
4. Offer a **CLI-first developer experience**.
5. Scale from small repositories to large monorepos.

---

## Target Users
- Software developers
- Open-source contributors
- DevOps engineers
- Code reviewers
- Learners exploring Git internals

---

## High-Level Architecture

CLI Tool (`git-browser`)  
→ Reads `.git` directory  
→ Starts FastAPI server  
→ Exposes Git data via REST APIs  
→ React frontend consumes APIs  
→ Browser renders interactive Git graph  

---

## Technology Stack

### Backend (CLI Server)
- Language: Python
- Framework: FastAPI
- Server: Uvicorn
- Git data source:
  - Direct `.git` directory parsing (primary)
  - Optional fallback to `git` CLI
- Output: JSON APIs
- Execution: Localhost only

### Frontend (Web UI)
- Framework: React.js
- Styling: Tailwind CSS
- Graph visualization:
  - D3.js / Cytoscape.js / Vis.js
- Routing: React Router
- State management: Zustand / Redux Toolkit

---

## CLI Tool Scope

### Installation
```bash
pip install git-browser
