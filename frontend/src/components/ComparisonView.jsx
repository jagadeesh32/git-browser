import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import FileTree from './FileTree';
import DiffViewer from './DiffViewer';
import ViewToggle from './ViewToggle';

const ComparisonView = ({ sha1, sha2, onClose }) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [viewMode, setViewMode] = useState('unified');
  const [loading, setLoading] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadComparison();
  }, [sha1, sha2]);

  useEffect(() => {
    if (selectedFile && sha2) {
      loadFileDiff();
    }
  }, [selectedFile, sha2]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.compareCommits(sha1, sha2);
      setComparisonData(data);
    } catch (err) {
      setError('Failed to load comparison: ' + err.message);
      console.error('Error loading comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFileDiff = async () => {
    try {
      setLoadingDiff(true);
      const diff = await gitApi.getFileDiff(sha2, selectedFile);
      setDiffData(diff);
    } catch (err) {
      console.error('Error loading file diff:', err);
      setDiffData(null);
    } finally {
      setLoadingDiff(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-gray-900 dark:text-white text-xl">Loading comparison...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-red-600 dark:text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  if (!comparisonData) return null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comparing Commits
        </h2>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded transition-colors"
        >
          Close
        </button>
      </div>

      {/* Commit metadata side-by-side */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Commit 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Base Commit</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">SHA:</span>{' '}
                <span className="font-mono text-xs">{comparisonData.commit1.sha.substring(0, 12)}</span>
              </p>
              <p className="text-gray-900 dark:text-white">{comparisonData.commit1.message}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {comparisonData.commit1.author.name} • {formatDate(comparisonData.commit1.author.timestamp)}
              </p>
            </div>
          </div>

          {/* Commit 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">Compare Commit</h3>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold">SHA:</span>{' '}
                <span className="font-mono text-xs">{comparisonData.commit2.sha.substring(0, 12)}</span>
              </p>
              <p className="text-gray-900 dark:text-white">{comparisonData.commit2.message}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {comparisonData.commit2.author.name} • {formatDate(comparisonData.commit2.author.timestamp)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {comparisonData.stats && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-semibold">
              {comparisonData.stats.files_changed} {comparisonData.stats.files_changed === 1 ? 'file' : 'files'} changed
            </span>
            <span className="text-green-600 dark:text-green-400">
              +{comparisonData.stats.additions}
            </span>
            <span className="text-red-600 dark:text-red-400">
              -{comparisonData.stats.deletions}
            </span>
          </div>
        )}
      </div>

      {/* Content area: File tree + Diff viewer */}
      <div className="flex-1 flex min-h-0">
        {/* File tree */}
        <div className="w-80 flex-shrink-0 overflow-auto border-r border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Files Changed
            </h3>
            {comparisonData.files && comparisonData.files.length > 0 ? (
              <FileTree
                files={comparisonData.files}
                onFileClick={setSelectedFile}
                selectedFile={selectedFile}
              />
            ) : (
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                No files changed
              </div>
            )}
          </div>
        </div>

        {/* Diff viewer */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {selectedFile ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedFile}
                </h3>
                <ViewToggle viewMode={viewMode} onChange={setViewMode} />
              </div>
              {loadingDiff ? (
                <div className="bg-white dark:bg-gray-800 rounded p-8 text-center text-gray-600 dark:text-gray-400">
                  Loading diff...
                </div>
              ) : (
                <DiffViewer diffData={diffData} viewMode={viewMode} />
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Select a file to view its diff
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
