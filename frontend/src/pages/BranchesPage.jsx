import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import BranchList from '../components/BranchList';
import CommitList from '../components/CommitList';
import CommitDetailsModal from '../components/CommitDetailsModal';

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchCommits, setBranchCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(true); // Open modal instead of inline display
    } catch (err) {
      console.error('Error loading commit:', err);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {/* Branch list */}
        <BranchList branches={branches} onBranchClick={handleBranchClick} />

        {/* Commit list (only show when branch selected) */}
        {selectedBranch ? (
          <CommitList
            commits={branchCommits}
            onCommitClick={handleCommitClick}
            selectedSha={selectedCommit?.sha}
          />
        ) : (
          <div className="flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Select a branch to view its commits
            </p>
          </div>
        )}
      </div>

      {/* Modal for commit details */}
      <CommitDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        commit={selectedCommit}
      />
    </div>
  );
};

export default BranchesPage;
