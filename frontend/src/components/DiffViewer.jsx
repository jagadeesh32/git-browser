import React from 'react';
import { parseDiff, Diff, Hunk } from 'react-diff-view';
import 'react-diff-view/style/index.css';

const DiffViewer = ({ diffData, viewMode }) => {
  if (!diffData) {
    return (
      <div className="text-gray-400 text-sm">Select a file to view its diff</div>
    );
  }

  // Handle binary files
  if (diffData.is_binary) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded p-4 text-center">
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          <svg
            className="inline-block w-6 h-6 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Binary file changed
        </div>
      </div>
    );
  }

  // Handle empty diff
  if (!diffData.diff || diffData.diff.trim() === '') {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        No changes to display
      </div>
    );
  }

  try {
    // Parse the diff
    const files = parseDiff(diffData.diff);

    if (!files || files.length === 0) {
      return (
        <div className="bg-gray-200 dark:bg-gray-700 rounded p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          Unable to parse diff
        </div>
      );
    }

    return (
      <div className="diff-viewer-container bg-white dark:bg-gray-900 rounded overflow-auto border border-gray-300 dark:border-gray-700">
        {files.map((file, index) => (
          <div key={index} className="diff-file">
            <Diff
              viewType={viewMode === 'split' ? 'split' : 'unified'}
              diffType={file.type}
              hunks={file.hunks || []}
            >
              {(hunks) =>
                hunks.map((hunk) => (
                  <Hunk key={hunk.content} hunk={hunk} />
                ))
              }
            </Diff>
          </div>
        ))}
        <style jsx>{`
          .diff-viewer-container {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
            font-size: 12px;
          }

          /* Light theme styles */
          :global(.diff-gutter) {
            background-color: var(--diff-gutter-bg, #f3f4f6);
            color: var(--diff-gutter-color, #6b7280);
            user-select: none;
          }
          :global(.diff-gutter-insert) {
            background-color: var(--diff-gutter-insert-bg, #d1fae5);
          }
          :global(.diff-gutter-delete) {
            background-color: var(--diff-gutter-delete-bg, #fee2e2);
          }
          :global(.diff-code) {
            background-color: var(--diff-code-bg, #ffffff);
            color: var(--diff-code-color, #1f2937);
          }
          :global(.diff-code-insert) {
            background-color: var(--diff-code-insert-bg, #ecfdf5);
            color: var(--diff-code-insert-color, #065f46);
          }
          :global(.diff-code-delete) {
            background-color: var(--diff-code-delete-bg, #fef2f2);
            color: var(--diff-code-delete-color, #991b1b);
          }
          :global(.diff-line) {
            line-height: 1.5;
          }
          :global(.diff-widget) {
            background-color: var(--diff-widget-bg, #f3f4f6);
          }

          /* Dark theme styles */
          :global(.dark) .diff-viewer-container :global(.diff-gutter) {
            --diff-gutter-bg: #374151;
            --diff-gutter-color: #9ca3af;
          }
          :global(.dark) .diff-viewer-container :global(.diff-gutter-insert) {
            --diff-gutter-insert-bg: #065f46;
          }
          :global(.dark) .diff-viewer-container :global(.diff-gutter-delete) {
            --diff-gutter-delete-bg: #991b1b;
          }
          :global(.dark) .diff-viewer-container :global(.diff-code) {
            --diff-code-bg: #1f2937;
            --diff-code-color: #e5e7eb;
          }
          :global(.dark) .diff-viewer-container :global(.diff-code-insert) {
            --diff-code-insert-bg: #064e3b;
            --diff-code-insert-color: #d1fae5;
          }
          :global(.dark) .diff-viewer-container :global(.diff-code-delete) {
            --diff-code-delete-bg: #7f1d1d;
            --diff-code-delete-color: #fecaca;
          }
          :global(.dark) .diff-viewer-container :global(.diff-widget) {
            --diff-widget-bg: #374151;
          }
        `}</style>
      </div>
    );
  } catch (error) {
    console.error('Error parsing diff:', error);
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded p-4">
        <div className="text-red-600 dark:text-red-400 text-sm mb-2">Error parsing diff</div>
        <pre className="text-gray-700 dark:text-gray-300 text-xs overflow-auto">
          {diffData.diff}
        </pre>
      </div>
    );
  }
};

export default DiffViewer;
