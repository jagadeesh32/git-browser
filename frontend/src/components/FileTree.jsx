import { useState, useMemo } from 'react';
import {
  FiFolder,
  FiFile,
  FiCode,
  FiFileText,
  FiChevronRight,
  FiChevronDown,
} from 'react-icons/fi';

// Build hierarchical tree structure from flat file list
const buildFileTree = (files) => {
  const tree = {};

  files.forEach((file) => {
    const parts = file.path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;

      if (!current[part]) {
        current[part] = isFile
          ? { type: 'file', data: file }
          : { type: 'folder', children: {} };
      }

      if (!isFile) {
        current = current[part].children;
      }
    });
  });

  return tree;
};

// Get file icon based on file extension
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  const iconMap = {
    js: FiCode,
    jsx: FiCode,
    ts: FiCode,
    tsx: FiCode,
    py: FiCode,
    java: FiCode,
    cpp: FiCode,
    c: FiCode,
    h: FiCode,
    go: FiCode,
    rs: FiCode,
    md: FiFileText,
    txt: FiFileText,
    json: FiFileText,
    xml: FiFileText,
    yml: FiFileText,
    yaml: FiFileText,
  };

  const Icon = iconMap[ext] || FiFile;
  return <Icon className="w-4 h-4" />;
};

// Sort entries based on mode
const sortEntries = (entries, mode) => {
  return [...entries].sort(([aName, aNode], [bName, bNode]) => {
    // Folders always first
    if (aNode.type !== bNode.type) {
      return aNode.type === 'folder' ? -1 : 1;
    }

    switch (mode) {
      case 'changes':
        if (aNode.type === 'file' && bNode.type === 'file') {
          const aChanges = aNode.data.additions + aNode.data.deletions;
          const bChanges = bNode.data.additions + bNode.data.deletions;
          return bChanges - aChanges; // Descending
        }
        return aName.localeCompare(bName);

      case 'type':
        if (aNode.type === 'file' && bNode.type === 'file') {
          const aExt = aName.split('.').pop()?.toLowerCase() || '';
          const bExt = bName.split('.').pop()?.toLowerCase() || '';
          const extCompare = aExt.localeCompare(bExt);
          if (extCompare !== 0) return extCompare;
        }
        return aName.localeCompare(bName);

      case 'changeType':
        if (aNode.type === 'file' && bNode.type === 'file') {
          const typeOrder = { added: 0, modified: 1, deleted: 2 };
          const aOrder = typeOrder[aNode.data.change_type] || 999;
          const bOrder = typeOrder[bNode.data.change_type] || 999;
          if (aOrder !== bOrder) return aOrder - bOrder;
        }
        return aName.localeCompare(bName);

      case 'alphabetical':
      default:
        return aName.localeCompare(bName);
    }
  });
};

// Recursive tree node component
const TreeNode = ({ name, node, depth, path, selectedFile, onFileClick, expandedFolders, toggleFolder, sortMode }) => {
  const isExpanded = expandedFolders.has(path);

  if (node.type === 'folder') {
    const children = node.children;
    const hasChildren = Object.keys(children).length > 0;

    return (
      <div>
        {/* Folder row */}
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
          `}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => toggleFolder(path)}
        >
          {hasChildren && (
            isExpanded ? (
              <FiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            ) : (
              <FiChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            )
          )}
          {!hasChildren && <div className="w-4" />}
          <FiFolder className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
            {name}
          </span>
        </div>

        {/* Children (when expanded) */}
        {isExpanded && hasChildren && (
          <div>
            {sortEntries(Object.entries(children), sortMode).map(([childName, childNode]) => (
              <TreeNode
                key={`${path}/${childName}`}
                name={childName}
                node={childNode}
                depth={depth + 1}
                path={`${path}/${childName}`}
                selectedFile={selectedFile}
                onFileClick={onFileClick}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                sortMode={sortMode}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  const file = node.data;
  const isSelected = selectedFile === file.path;

  return (
    <div
      className={`
        flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer rounded
        transition-colors
        ${isSelected
          ? 'bg-blue-600 text-white'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        }
      `}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
      onClick={() => onFileClick(file.path)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={isSelected ? 'text-white' : 'text-gray-500 dark:text-gray-400'}>
          {getFileIcon(name)}
        </div>
        <span className="text-sm truncate" title={file.path}>
          {name}
        </span>
      </div>

      {/* File stats */}
      <div className="flex-shrink-0 flex items-center gap-1 text-xs font-mono">
        {file.additions > 0 && (
          <span className={isSelected ? 'text-green-200' : 'text-green-600 dark:text-green-400'}>
            +{file.additions}
          </span>
        )}
        {file.additions > 0 && file.deletions > 0 && (
          <span className={isSelected ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'}>
            /
          </span>
        )}
        {file.deletions > 0 && (
          <span className={isSelected ? 'text-red-200' : 'text-red-600 dark:text-red-400'}>
            -{file.deletions}
          </span>
        )}
      </div>
    </div>
  );
};

const FileTree = ({ files, onFileClick, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [sortMode, setSortMode] = useState('alphabetical');

  // Build tree structure
  const tree = useMemo(() => buildFileTree(files || []), [files]);

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
        No files changed in this commit
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Sort mode selector */}
      <div className="px-2 mb-3">
        <label htmlFor="file-sort" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sort by:
        </label>
        <select
          id="file-sort"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alphabetical">Alphabetical</option>
          <option value="changes">Most Changes</option>
          <option value="type">File Type</option>
          <option value="changeType">Change Type</option>
        </select>
      </div>

      {/* File tree */}
      {sortEntries(Object.entries(tree), sortMode).map(([name, node]) => (
        <TreeNode
          key={name}
          name={name}
          node={node}
          depth={0}
          path={name}
          selectedFile={selectedFile}
          onFileClick={onFileClick}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          sortMode={sortMode}
        />
      ))}
    </div>
  );
};

export default FileTree;
