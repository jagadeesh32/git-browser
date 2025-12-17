import React from 'react';

const FileList = ({ files, onFileClick, selectedFile }) => {
  if (!files || files.length === 0) {
    return (
      <div className="text-gray-600 dark:text-gray-400 text-sm">No files changed in this commit</div>
    );
  }

  const getChangeTypeIcon = (changeType) => {
    switch (changeType) {
      case 'added':
        return <span className="text-green-600 dark:text-green-400 font-bold">+</span>;
      case 'deleted':
        return <span className="text-red-600 dark:text-red-400 font-bold">-</span>;
      case 'modified':
        return <span className="text-yellow-600 dark:text-yellow-400 font-bold">M</span>;
      default:
        return <span className="text-gray-600 dark:text-gray-400">?</span>;
    }
  };

  return (
    <div className="space-y-1">
      {files.map((file, index) => (
        <div
          key={index}
          onClick={() => onFileClick(file.path)}
          className={`
            px-3 py-2 rounded cursor-pointer transition-colors
            ${selectedFile === file.path
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="flex-shrink-0 w-5">
                {getChangeTypeIcon(file.change_type)}
              </span>
              <span className="text-sm font-mono truncate" title={file.path}>
                {file.path}
              </span>
            </div>
            <div className="flex-shrink-0 ml-3 text-xs font-mono">
              {file.additions > 0 && (
                <span className={selectedFile === file.path ? "text-green-200" : "text-green-600 dark:text-green-400"}>+{file.additions}</span>
              )}
              {file.additions > 0 && file.deletions > 0 && (
                <span className={selectedFile === file.path ? "text-gray-200" : "text-gray-600 dark:text-gray-400 mx-1"}>/</span>
              )}
              {file.deletions > 0 && (
                <span className={selectedFile === file.path ? "text-red-200" : "text-red-600 dark:text-red-400"}>-{file.deletions}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
