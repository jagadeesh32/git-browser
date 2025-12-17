const CommitDetails = ({ commit }) => {
  if (!commit) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center text-gray-400">
        Select a commit to view details
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
        <h2 className="text-lg font-semibold text-white">Commit Details</h2>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Message</h3>
          <p className="text-white whitespace-pre-wrap">{commit.full_message || commit.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">SHA</h3>
            <p className="text-white font-mono text-sm">{commit.sha}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">Tree</h3>
            <p className="text-white font-mono text-sm">{commit.tree.substring(0, 16)}...</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Author</h3>
          <p className="text-white">{commit.author.name} &lt;{commit.author.email}&gt;</p>
          <p className="text-gray-400 text-sm">{formatDate(commit.author.timestamp)}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-1">Committer</h3>
          <p className="text-white">{commit.committer.name} &lt;{commit.committer.email}&gt;</p>
          <p className="text-gray-400 text-sm">{formatDate(commit.committer.timestamp)}</p>
        </div>

        {commit.parents && commit.parents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-1">
              Parent{commit.parents.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-1">
              {commit.parents.map((parent) => (
                <p key={parent} className="text-white font-mono text-sm">
                  {parent}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitDetails;
