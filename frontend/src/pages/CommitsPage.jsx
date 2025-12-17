import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import CommitList from '../components/CommitList';
import CommitDetails from '../components/CommitDetails';

const CommitsPage = () => {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
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
    } catch (err) {
      console.error('Error loading commit:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-xl">Loading commits...</div>
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
    <div className="grid grid-cols-2 gap-4 h-full">
      <CommitList
        commits={commits}
        onCommitClick={handleCommitClick}
        selectedSha={selectedCommit?.sha}
      />
      <CommitDetails commit={selectedCommit} />
    </div>
  );
};

export default CommitsPage;
