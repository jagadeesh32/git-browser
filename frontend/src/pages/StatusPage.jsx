import React, { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import DiffViewer from '../components/DiffViewer';
import { VscAdd, VscDiscard, VscCheck, VscRefresh, VscCloudUpload, VscCloudDownload, VscSync, VscSourceControl } from 'react-icons/vsc';

const ActionButton = ({ onClick, icon: Icon, title, disabled, loading, variant = "secondary" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      p-2 rounded-md transition-all duration-200 flex items-center justify-center
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600'}
      ${variant === 'primary' ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
      ${loading ? 'animate-pulse' : ''}
    `}
  >
    <Icon className="text-lg" />
  </button>
);

const FileItem = ({ path, status, actionIcon: ActionIcon, onAction, actionTitle, isSelected, onSelect }) => {
  const getStatusColor = (s) => {
    if (s === 'modified') return 'text-yellow-400';
    if (s === 'added' || s === 'untracked') return 'text-green-400';
    if (s === 'deleted') return 'text-red-400';
    return 'text-gray-400';
  };

  const getStatusLetter = (s) => {
    if (s === 'modified') return 'M';
    if (s === 'added') return 'A';
    if (s === 'deleted') return 'D';
    if (s === 'untracked') return 'U';
    return '?';
  };

  return (
    <div
      onClick={() => onSelect(path)}
      className={`
        group flex items-center justify-between py-1 px-3 cursor-pointer text-sm border-l-2 transition-colors
        ${isSelected
          ? 'bg-blue-50 dark:bg-[#37373d] border-blue-500'
          : 'border-transparent hover:bg-gray-200 dark:hover:bg-[#2a2d2e] hover:border-blue-500'}
      `}
    >
      <div className="flex items-center flex-1 min-w-0">
        <span className={`font-mono font-bold mr-3 w-4 text-center ${getStatusColor(status)}`}>
          {getStatusLetter(status)}
        </span>
        <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{path}</span>
        <span className="ml-2 text-xs text-gray-500 truncate">{status}</span>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center">
        <button
          onClick={(e) => { e.stopPropagation(); onAction(path); }}
          className="p-1 hover:bg-gray-600 rounded text-gray-300 transition-opacity"
          title={actionTitle}
        >
          <ActionIcon />
        </button>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, count, children }) => (
  <div className="uppercase text-xs font-bold text-gray-500 tracking-wider mb-2 px-2 flex justify-between items-center mt-6">
    <span>{title} <span className="ml-1 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">{count}</span></span>
    <div className="flex space-x-1">
      {children}
    </div>
  </div>
);

const StatusPage = () => {
  const [status, setStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [diffData, setDiffData] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchStatus = async () => {
    try {
      const data = await gitApi.getStatus();
      setStatus(data);
    } catch (err) {
      setError('Failed to fetch status');
    }
  };

  const handleFileSelect = async (path, isStaged) => {
    setSelectedFile({ path, isStaged });
    setDiffLoading(true);
    setDiffData(null);
    try {
      const data = await gitApi.getWorkingDiff(path, isStaged);
      setDiffData(data);
    } catch (err) {
      console.error(err);
      setDiffData({ error: "Failed to load diff" });
    } finally {
      setDiffLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleStage = async (path) => {
    try { await gitApi.stageFile(path); fetchStatus(); }
    catch (err) { setError(`Failed to stage ${path}`); }
  };

  const handleUnstage = async (path) => {
    try { await gitApi.unstageFile(path); fetchStatus(); }
    catch (err) { setError(`Failed to unstage ${path}`); }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setLoading(true);
    try {
      await gitApi.commit(commitMessage);
      setCommitMessage('');
      setSuccess('Commit successful!');
      fetchStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError('Failed to commit'); }
    finally { setLoading(false); }
  };

  if (!status) return <div className="p-8 text-gray-500 flex items-center justify-center h-full">Loading workspace...</div>;

  return (
    <div className="flex h-full bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
      {/* LEFT PANE: Source Control Panel */}
      <div className="w-80 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1e1e1e] transition-colors duration-200">

        {/* Panel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-100 dark:bg-[#252526] transition-colors duration-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Source Control</h2>
          <div className="flex space-x-1">
            <ActionButton
              icon={VscRefresh}
              onClick={fetchStatus}
              title="Refresh Status"
            />
            <ActionButton
              icon={VscSync}
              onClick={async () => {
                setLoading(true);
                try { await gitApi.fetch(); fetchStatus(); setSuccess("Fetched"); }
                catch (e) { setError("Fetch failed"); }
                finally { setLoading(false); setTimeout(() => setSuccess(null), 2000); }
              }}
              title="Fetch"
              loading={loading}
            />
            <ActionButton
              icon={VscCloudDownload}
              onClick={async () => {
                setLoading(true);
                try { await gitApi.pull(); fetchStatus(); setSuccess("Pulled"); }
                catch (e) { setError("Pull failed"); }
                finally { setLoading(false); setTimeout(() => setSuccess(null), 2000); }
              }}
              title="Pull"
              loading={loading}
            />
            <ActionButton
              icon={VscCloudUpload}
              onClick={async () => {
                setLoading(true);
                try { await gitApi.push(); fetchStatus(); setSuccess("Pushed"); }
                catch (e) { setError("Push failed"); }
                finally { setLoading(false); setTimeout(() => setSuccess(null), 2000); }
              }}
              title="Push"
              loading={loading}
            />
          </div>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">

          {/* Commit Input Section */}
          <div className="mb-6 px-1">
            <div className="bg-white dark:bg-[#2a2d2e] p-2 rounded border border-gray-300 dark:border-gray-700 focus-within:border-blue-500 transition-colors">
              <textarea
                className="w-full bg-transparent text-gray-800 dark:text-gray-300 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none font-sans"
                placeholder="Message (Ctrl+Enter to commit)"
                rows="3"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') handleCommit(); }}
              />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-500">{status.staged.length} staged</span>
                <button
                  onClick={handleCommit}
                  disabled={loading || status.staged.length === 0 || !commitMessage.trim()}
                  className={`
                      px-3 py-1 text-xs font-medium rounded flex items-center
                      ${loading || status.staged.length === 0 || !commitMessage.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-500'}
                    `}
                >
                  <VscCheck className="mr-1" /> Commit
                </button>
              </div>
            </div>
            {(error || success) && (
              <div className={`mt-2 text-xs p-2 rounded ${error ? 'bg-red-900/30 text-red-400 border border-red-900' : 'bg-green-900/30 text-green-400 border border-green-900'}`}>
                {error || success}
              </div>
            )}
          </div>

          <SectionHeader title="Staged Changes" count={status.staged.length} />
          <div className="space-y-0.5">
            {status.staged.map(file => (
              <FileItem
                key={file.path}
                path={file.path}
                status={file.status}
                actionIcon={VscDiscard}
                onAction={handleUnstage}
                actionTitle="Unstage Changes"
                isSelected={selectedFile?.path === file.path && selectedFile?.isStaged}
                onSelect={(p) => handleFileSelect(p, true)}
              />
            ))}
          </div>

          <SectionHeader title="Changes" count={status.unstaged.length + status.untracked.length} />
          <div className="space-y-0.5">
            {status.unstaged.map(file => (
              <FileItem
                key={file.path}
                path={file.path}
                status={file.status}
                actionIcon={VscAdd}
                onAction={handleStage}
                actionTitle="Stage Changes"
                isSelected={selectedFile?.path === file.path && !selectedFile?.isStaged}
                onSelect={(p) => handleFileSelect(p, false)}
              />
            ))}
            {status.untracked.map(path => (
              <FileItem
                key={path}
                path={path}
                status="untracked"
                actionIcon={VscAdd}
                onAction={handleStage}
                actionTitle="Stage Changes"
                isSelected={selectedFile?.path === path && !selectedFile?.isStaged}
                onSelect={(p) => handleFileSelect(p, false)}
              />
            ))}
          </div>

        </div>
      </div>

      {/* RIGHT PANE: Details / Diff Viewer */}
      <div className="flex-1 bg-white dark:bg-[#121212] flex flex-col overflow-hidden transition-colors duration-200">
        {selectedFile ? (
          <>
            <div className="h-10 bg-gray-100 dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 transition-colors duration-200">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${selectedFile.isStaged ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {selectedFile.path}
                <span className="ml-2 text-xs text-gray-500">({selectedFile.isStaged ? 'Index' : 'Working Tree'})</span>
              </span>
            </div>
            <div className="flex-1 overflow-auto bg-white dark:bg-[#1e1e1e] p-4 transition-colors duration-200">
              {diffLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">Loading diff...</div>
              ) : (
                <DiffViewer diffData={diffData} viewMode="unified" />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
            <VscSourceControl className="text-6xl mb-4 opacity-20" />
            <p className="text-sm">Select a file to view changes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPage;
