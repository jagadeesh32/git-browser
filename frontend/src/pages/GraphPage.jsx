import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import GitGraph from '../components/GitGraph';
import CommitDetails from '../components/CommitDetails';

const GraphPage = () => {
  const [graphData, setGraphData] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getGraph(500);
      setGraphData(data);
    } catch (err) {
      setError('Failed to load commit graph: ' + err.message);
      console.error('Error loading graph:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (sha) => {
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
        <div className="text-white text-xl">Loading commit graph...</div>
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
    <div className="h-full flex flex-col">
      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          <GitGraph graphData={graphData} onNodeClick={handleNodeClick} />
        </div>
        <div className="w-96">
          <CommitDetails commit={selectedCommit} />
        </div>
      </div>
    </div>
  );
};

export default GraphPage;
