const CommitList = ({ commits, onCommitClick, selectedSha }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commits</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto bg-white dark:bg-gray-800">
        {commits.map((commit) => (
          <div
            key={commit.sha}
            onClick={() => onCommitClick && onCommitClick(commit.sha)}
            className={`p-4 cursor-pointer transition-colors ${selectedSha === commit.sha
                ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium mb-1">{commit.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-mono bg-gray-100 dark:bg-gray-900 px-1 rounded text-xs">{commit.sha.substring(0, 7)}</span>
                  <span>{commit.author.name}</span>
                  <span>{formatDate(commit.author.timestamp)}</span>
                </div>
              </div>
            </div>
            {commit.parents && commit.parents.length > 0 && (
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Parents: {commit.parents.map(p => p.substring(0, 7)).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommitList;
