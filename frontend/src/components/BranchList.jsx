const BranchList = ({ branches, onBranchClick }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
        <h2 className="text-lg font-semibold text-white">Branches</h2>
      </div>
      <div className="divide-y divide-gray-700">
        {branches.map((branch) => (
          <div
            key={branch.name}
            onClick={() => onBranchClick && onBranchClick(branch)}
            className="p-4 hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-white font-medium">{branch.name}</span>
                {branch.is_current && (
                  <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                    Current
                  </span>
                )}
              </div>
              <span className="text-gray-400 font-mono text-sm">
                {branch.commit_sha.substring(0, 7)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchList;
