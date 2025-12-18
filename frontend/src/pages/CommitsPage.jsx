import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import CommitList from '../components/CommitList';
import CommitDetailsModal from '../components/CommitDetailsModal';

const CommitsPage = () => {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCommits();
  }, []);

  const loadCommits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getCommits(100);
      setCommits(data);
    } catch (err) {
      setError('Failed to load commits: ' + err.message);
      console.error('Error loading commits:', err);
    } finally {
      setLoading(false);
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
        <div className="text-gray-900 dark:text-white text-xl">Loading commits...</div>
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
      {/* Full-width commit list */}
      <CommitList
        commits={commits}
        onCommitClick={handleCommitClick}
        selectedSha={selectedCommit?.sha}
      />

      {/* Modal for commit details */}
      <CommitDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        commit={selectedCommit}
      />
    </div>
  );
};

export default CommitsPage;
