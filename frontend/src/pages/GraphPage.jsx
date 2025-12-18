import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import GitGraph from '../components/GitGraph';
import CommitDetails from '../components/CommitDetails';

const GraphPage = () => {
  const [graphData, setGraphData] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null); // null = all branches
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBranches();
    loadGraph();
  }, []);

  useEffect(() => {
    loadGraph();
  }, [selectedBranch]);

  const loadBranches = async () => {
    try {
      const data = await gitApi.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getGraph(500, selectedBranch);
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
        <div className="text-gray-900 dark:text-white text-xl">Loading commit graph...</div>
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
    <div className="h-full flex flex-col gap-4">
      {/* Branch filter dropdown */}
      <div className="flex items-center gap-3">
        <label htmlFor="branch-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by branch:
        </label>
        <select
          id="branch-filter"
          value={selectedBranch || ''}
          onChange={(e) => setSelectedBranch(e.target.value || null)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Branches</option>
          {branches.map((branch) => (
            <option key={branch.name} value={branch.name}>
              {branch.name} {branch.is_current ? '(current)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Full-width graph at top */}
      <div className="h-1/2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <GitGraph graphData={graphData} onNodeClick={handleNodeClick} />
      </div>

      {/* Commit details below (conditional) */}
      {selectedCommit ? (
        <div className="flex-1 overflow-auto">
          <CommitDetails commit={selectedCommit} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Click a commit in the graph above to view details
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphPage;
