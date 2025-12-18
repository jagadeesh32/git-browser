import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import BranchList from '../components/BranchList';
import CommitList from '../components/CommitList';
import CommitDetails from '../components/CommitDetails';

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchCommits, setBranchCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getBranches();
      setBranches(data);
    } catch (err) {
      setError('Failed to load branches: ' + err.message);
      console.error('Error loading branches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchClick = async (branch) => {
    try {
      setSelectedBranch(branch);
      const commits = await gitApi.getCommits(50, branch.name);
      setBranchCommits(commits);
      setSelectedCommit(null);
    } catch (err) {
      console.error('Error loading branch commits:', err);
    }
  };

  const handleCommitClick = async (sha) => {
    try {
      const commit = await gitApi.getCommit(sha);
      setSelectedCommit(commit);
    } catch (err) {
      console.error('Error loading commit:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-900 dark:text-white text-xl">Loading branches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 dark:text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Column 1: Branch list (25%) */}
        <div className="overflow-auto">
          <BranchList branches={branches} onBranchClick={handleBranchClick} />
        </div>

        {/* Column 2: Commit list (25%) - only show when branch selected */}
        {selectedBranch ? (
          <div className="overflow-auto">
            <CommitList
              commits={branchCommits}
              onCommitClick={handleCommitClick}
              selectedSha={selectedCommit?.sha}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Select a branch to view commits
            </p>
          </div>
        )}

        {/* Column 3: Commit details (50%) - only show when commit selected */}
        {selectedCommit ? (
          <div className="overflow-auto">
            <CommitDetails commit={selectedCommit} />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Select a commit to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesPage;
