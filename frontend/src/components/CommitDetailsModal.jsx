import { useState, useEffect } from 'react';
import Modal from './Modal';
import { gitApi } from '../services/api';
import FileTree from './FileTree';
import DiffViewer from './DiffViewer';
import ViewToggle from './ViewToggle';

const CommitDetailsModal = ({ isOpen, onClose, commit }) => {
  const [commitDetails, setCommitDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [viewMode, setViewMode] = useState('unified');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [activeTab, setActiveTab] = useState('files'); // For mobile: 'files' | 'diff'

  // Load commit details when commit changes
  useEffect(() => {
    if (!commit || !isOpen) {
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
  }, [commit, isOpen]);

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
        // Auto-switch to diff tab on mobile when file is selected
        setActiveTab('diff');
      } catch (error) {
        console.error('Error loading file diff:', error);
        setDiffData(null);
      } finally {
        setLoadingDiff(false);
      }
    };

    loadFileDiff();
  }, [selectedFile, commit]);

  if (!commit) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const title = `${commit.sha.substring(0, 7)} - ${commit.message.substring(0, 50)}${commit.message.length > 50 ? '...' : ''}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="full">
      <div className="flex flex-col h-full">
        {/* Commit Metadata Section */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">Author:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {commit.author.name} &lt;{commit.author.email}&gt;
              </span>
              <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                {formatDate(commit.author.timestamp)}
              </div>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400 font-semibold">SHA:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-mono text-xs">
                {commit.sha}
              </span>
            </div>
          </div>

          {commitDetails && commitDetails.stats && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">
                {commitDetails.stats.files_changed} {commitDetails.stats.files_changed === 1 ? 'file' : 'files'} changed
              </span>
              <span className="text-green-600 dark:text-green-400">
                +{commitDetails.stats.additions}
              </span>
              <span className="text-red-600 dark:text-red-400">
                -{commitDetails.stats.deletions}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Files Changed {commitDetails && `(${commitDetails.files?.length || 0})`}
            </button>
            <button
              onClick={() => setActiveTab('diff')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'diff'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              disabled={!selectedFile}
            >
              Diff {selectedFile && `(${selectedFile.split('/').pop()})`}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {loadingDetails ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-600 dark:text-gray-400">Loading file changes...</div>
          </div>
        ) : (
          <>
            {/* Desktop: Side-by-side layout */}
            <div className="hidden md:flex flex-1 min-h-0">
              {/* File Tree */}
              <div className="w-80 flex-shrink-0 overflow-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Files Changed
                  </h3>
                  {commitDetails && commitDetails.files ? (
                    <FileTree
                      files={commitDetails.files}
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

              {/* Diff Viewer */}
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

            {/* Mobile: Tabbed layout */}
            <div className="md:hidden flex-1 overflow-auto">
              {activeTab === 'files' ? (
                <div className="p-4 bg-white dark:bg-gray-800">
                  {commitDetails && commitDetails.files ? (
                    <FileTree
                      files={commitDetails.files}
                      onFileClick={setSelectedFile}
                      selectedFile={selectedFile}
                    />
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      No files changed
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                  {selectedFile ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
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
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        Select a file from the Files tab
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CommitDetailsModal;
