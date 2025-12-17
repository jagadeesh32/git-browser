import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import FileList from './FileList';
import DiffViewer from './DiffViewer';
import ViewToggle from './ViewToggle';

const CommitDetails = ({ commit }) => {
  const [commitDetails, setCommitDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [viewMode, setViewMode] = useState('unified');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingDiff, setLoadingDiff] = useState(false);

  // Load commit details when commit changes
  useEffect(() => {
    if (!commit) {
      setCommitDetails(null);
      setSelectedFile(null);
      setDiffData(null);
      return;
    }

    const loadCommitDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await gitApi.getCommitDetails(commit.sha);
        setCommitDetails(details);
      } catch (error) {
        console.error('Error loading commit details:', error);
        setCommitDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadCommitDetails();
    setSelectedFile(null);
    setDiffData(null);
  }, [commit]);

  // Load file diff when file is selected
  useEffect(() => {
    if (!selectedFile || !commit) {
      setDiffData(null);
      return;
    }

    const loadFileDiff = async () => {
      setLoadingDiff(true);
      try {
        const diff = await gitApi.getFileDiff(commit.sha, selectedFile);
        setDiffData(diff);
      } catch (error) {
        console.error('Error loading file diff:', error);
        setDiffData(null);
      } finally {
        setLoadingDiff(false);
      }
    };

    loadFileDiff();
  }, [selectedFile, commit]);

  if (!commit) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-600 dark:text-gray-400">
        Select a commit to view details
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commit Details</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Metadata Section */}
        <div className="p-6 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Message</h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{commit.full_message || commit.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">SHA</h3>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{commit.sha}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Tree</h3>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{commit.tree.substring(0, 16)}...</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Author</h3>
            <p className="text-gray-900 dark:text-white">{commit.author.name} &lt;{commit.author.email}&gt;</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(commit.author.timestamp)}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Committer</h3>
            <p className="text-gray-900 dark:text-white">{commit.committer.name} &lt;{commit.committer.email}&gt;</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(commit.committer.timestamp)}</p>
          </div>

          {commit.parents && commit.parents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Parent{commit.parents.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-1">
                {commit.parents.map((parent) => (
                  <p key={parent} className="text-gray-900 dark:text-white font-mono text-sm">
                    {parent}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Files Changed Section */}
        {loadingDetails ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            Loading file changes...
          </div>
        ) : commitDetails && commitDetails.files && commitDetails.files.length > 0 ? (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Files Changed ({commitDetails.stats.files_changed})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span className="text-green-600 dark:text-green-400">+{commitDetails.stats.additions}</span>
              {' '}
              <span className="text-red-600 dark:text-red-400">-{commitDetails.stats.deletions}</span>
            </div>
            <FileList
              files={commitDetails.files}
              onFileClick={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>
        ) : null}

        {/* Diff Viewer Section */}
        {selectedFile && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {selectedFile}
              </h3>
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
            {loadingDiff ? (
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-center text-gray-600 dark:text-gray-400">
                Loading diff...
              </div>
            ) : (
              <DiffViewer diffData={diffData} viewMode={viewMode} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitDetails;
