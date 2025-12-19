import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import FileTree from './FileTree';
import { VscListTree } from 'react-icons/vsc';

const CommitDetails = ({ commit, onFileSelect, selectedFile }) => {
  const [commitDetails, setCommitDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Load commit details when commit changes
  useEffect(() => {
    if (!commit) {
      setCommitDetails(null);
      return;
    }

    const loadCommitDetails = async () => {
      setLoadingDetails(true);
      try {
        const details = await gitApi.getCommitDetails(commit.sha);
        setCommitDetails(details);
      } catch (error) {
        setCommitDetails(null);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadCommitDetails();
  }, [commit]);

  if (!commit) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-300 transition-colors duration-200">

      {/* Metadata */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 shrink-0 transition-colors duration-200">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</h3>
        <p className="text-gray-900 dark:text-gray-200 text-sm whitespace-pre-wrap mb-4 font-medium max-h-32 overflow-y-auto custom-scrollbar">{commit.full_message || commit.message}</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500 block mb-1">Author</span>
            <span className="text-gray-800 dark:text-gray-300">{commit.author.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Date</span>
            <span className="text-gray-800 dark:text-gray-300">{formatDate(commit.author.timestamp)}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 block mb-1">SHA</span>
            <span className="text-gray-800 dark:text-gray-300 font-mono bg-gray-100 dark:bg-[#2d2d2d] px-1 rounded">{commit.sha}</span>
          </div>
        </div>
      </div>

      {/* Files List Header */}
      <div className="p-2 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 transition-colors duration-200">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
          <VscListTree className="mr-2" /> Changed Files
        </span>
        {commitDetails && (
          <span className="text-xs text-gray-500">
            <span className="text-green-600 dark:text-green-400">+{commitDetails.stats.additions}</span>
            {' / '}
            <span className="text-red-600 dark:text-red-400">-{commitDetails.stats.deletions}</span>
          </span>
        )}
      </div>

      {/* Files List Content */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {loadingDetails ? (
          <div className="text-center p-4 text-xs text-gray-500">Loading files...</div>
        ) : commitDetails && commitDetails.files ? (
          <FileTree
            files={commitDetails.files}
            onFileClick={onFileSelect}
            selectedFile={selectedFile}
          />
        ) : null}
      </div>
    </div>
  );
};

export default CommitDetails;
