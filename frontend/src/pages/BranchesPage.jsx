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
        <div className="text-white text-xl">Loading branches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <BranchList branches={branches} onBranchClick={handleBranchClick} />
      {selectedBranch && (
        <>
          <CommitList
            commits={branchCommits}
            onCommitClick={handleCommitClick}
            selectedSha={selectedCommit?.sha}
          />
          <CommitDetails commit={selectedCommit} />
        </>
      )}
      {!selectedBranch && (
        <div className="col-span-2 flex items-center justify-center">
          <div className="text-gray-400 text-lg">Select a branch to view its commits</div>
        </div>
      )}
    </div>
  );
};

export default BranchesPage;
