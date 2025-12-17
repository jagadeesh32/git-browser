import React from 'react';

const ViewToggle = ({ viewMode, onChange }) => {
  return (
    <div className="flex gap-1 bg-gray-700 rounded p-1">
      <button
        onClick={() => onChange('unified')}
        className={`
          px-3 py-1 text-xs font-medium rounded transition-colors
          ${viewMode === 'unified'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }
        `}
      >
        Unified
      </button>
      <button
        onClick={() => onChange('split')}
        className={`
          px-3 py-1 text-xs font-medium rounded transition-colors
          ${viewMode === 'split'
            ? 'bg-blue-600 text-white'
            : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }
        `}
      >
        Split
      </button>
    </div>
  );
};

export default ViewToggle;
