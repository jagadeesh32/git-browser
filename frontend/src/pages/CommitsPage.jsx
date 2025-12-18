import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import CommitList from '../components/CommitList';
import CommitDetails from '../components/CommitDetails';
import SearchFilter from '../components/SearchFilter';
import ComparisonView from '../components/ComparisonView';

const CommitsPage = () => {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compare mode states
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadCommits();
  }, [filters]);

  const loadCommits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getCommits(100, null, filters);
      setCommits(data);
    } catch (err) {
      setError('Failed to load commits: ' + err.message);
      console.error('Error loading commits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCommitClick = async (sha) => {
    if (compareMode) {
      // Multi-select logic for comparison
      if (selectedCommits.includes(sha)) {
        // Deselect
        setSelectedCommits(selectedCommits.filter((s) => s !== sha));
      } else if (selectedCommits.length < 2) {
        // Add to selection
        setSelectedCommits([...selectedCommits, sha]);
      } else {
        // Replace oldest selection (keep most recent)
        setSelectedCommits([selectedCommits[1], sha]);
      }
    } else {
      // Normal single-select mode
      try {
        const commit = await gitApi.getCommit(sha);
        setSelectedCommit(commit);
      } catch (err) {
        console.error('Error loading commit:', err);
      }
    }
  };

  const handleCompareModeToggle = (enabled) => {
    setCompareMode(enabled);
    setSelectedCommits([]);
    setShowComparison(false);
    if (!enabled) {
      setSelectedCommit(null);
    }
  };

  const handleCompare = () => {
    if (selectedCommits.length === 2) {
      setShowComparison(true);
    }
  };

  const handleCloseComparison = () => {
    setShowComparison(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600 dark:text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Search and filter controls */}
      <SearchFilter filters={filters} onFilterChange={setFilters} />

      {/* Compare mode controls */}
      <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => handleCompareModeToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Compare Mode
          </span>
        </label>

        {compareMode && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCommits.length} of 2 selected
            </span>
            {selectedCommits.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Compare Selected Commits
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-900 dark:text-white text-xl">Loading commits...</div>
        </div>
      ) : showComparison && selectedCommits.length === 2 ? (
        /* Show comparison view */
        <div className="flex-1 overflow-hidden">
          <ComparisonView
            sha1={selectedCommits[0]}
            sha2={selectedCommits[1]}
            onClose={handleCloseComparison}
          />
        </div>
      ) : (
        /* Normal view: commit list + details */
        <>
          <div className="h-1/3 overflow-auto">
            <CommitList
              commits={commits}
              onCommitClick={handleCommitClick}
              selectedSha={compareMode ? null : selectedCommit?.sha}
            />
          </div>

          {!compareMode && selectedCommit ? (
            <div className="flex-1 overflow-auto">
              <CommitDetails commit={selectedCommit} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {compareMode
                  ? 'Select 2 commits to compare'
                  : 'Select a commit to view details'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommitsPage;
