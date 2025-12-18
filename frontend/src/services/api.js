import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gitApi = {
  // Get repository information
  getRepository: async () => {
    const response = await api.get('/api/repository');
    return response.data;
  },

  // Get all branches
  getBranches: async () => {
    const response = await api.get('/api/branches');
    return response.data;
  },

  // Get all tags
  getTags: async () => {
    const response = await api.get('/api/tags');
    return response.data;
  },

  // Get commits with optional filters
  getCommits: async (limit = 100, branch = null, filters = {}) => {
    const params = { limit };
    if (branch) params.branch = branch;
    if (filters.author) params.author = filters.author;
    if (filters.search) params.search = filters.search;
    if (filters.since) params.since = filters.since;
    if (filters.until) params.until = filters.until;
    if (filters.file) params.file = filters.file;

    const response = await api.get('/api/commits', { params });
    return response.data;
  },

  // Get specific commit
  getCommit: async (sha) => {
    const response = await api.get(`/api/commits/${sha}`);
    return response.data;
  },

  // Get commit graph
  getGraph: async (limit = 500, branch = null) => {
    const params = { limit };
    if (branch) {
      params.branch = branch;
    }
    const response = await api.get('/api/graph', { params });
    return response.data;
  },

  // Get repository info
  getInfo: async () => {
    const response = await api.get('/api/info');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Get commit details with file changes
  getCommitDetails: async (sha) => {
    const response = await api.get(`/api/commits/${sha}/details`);
    return response.data;
  },

  // Get diff for specific file in commit
  getFileDiff: async (sha, filePath) => {
    const response = await api.get(`/api/commits/${sha}/files/${encodeURIComponent(filePath)}`);
    return response.data;
  },

  // Compare two commits
  compareCommits: async (sha1, sha2) => {
    const response = await api.get(`/api/commits/${sha1}/compare/${sha2}`);
    return response.data;
  },
};

export default api;
