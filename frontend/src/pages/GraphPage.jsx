import { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import GitGraph from '../components/GitGraph';
import CommitDetails from '../components/CommitDetails';
import DiffViewer from '../components/DiffViewer';
import ViewToggle from '../components/ViewToggle';
import { GoGitBranch, GoGitCommit } from 'react-icons/go';
import { VscFileCode } from 'react-icons/vsc';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

const GraphPage = () => {
  const [graphData, setGraphData] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Lifted state
  const [diffData, setDiffData] = useState(null);
  const [viewMode, setViewMode] = useState('unified');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBranches();
    loadGraph();
  }, []);

  useEffect(() => {
    loadGraph();
  }, [selectedBranch]);

  // Load diff when file/commit changes
  useEffect(() => {
    if (!selectedFile || !selectedCommit) {
      setDiffData(null);
      return;
    }

    const loadFileDiff = async () => {
      setLoadingDiff(true);
      try {
        const diff = await gitApi.getFileDiff(selectedCommit.sha, selectedFile);
        setDiffData(diff);
      } catch (error) {
        console.error("Error loading diff", error);
        setDiffData(null);
      } finally {
        setLoadingDiff(false);
      }
    };
    loadFileDiff();
  }, [selectedFile, selectedCommit]);


  const loadBranches = async () => {
    try {
      const data = await gitApi.getBranches();
      setBranches(data);
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gitApi.getGraph(500, selectedBranch);
      setGraphData(data);
    } catch (err) {
      setError('Failed to load commit graph: ' + err.message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (sha) => {
    try {
      const commit = await gitApi.getCommit(sha);
      setSelectedCommit(commit);
      setSelectedFile(null); // Reset file selection on new commit
    } catch (err) {
      console.error('Error loading commit:', err);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading graph...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
      {/* Toolbar */}
      <div className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-gray-50 dark:bg-[#252526] shrink-0 transition-colors duration-200">
        <div className="flex items-center space-x-2 text-sm">
          <GoGitBranch className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium mr-2">Branch:</span>
          <select
            value={selectedBranch || ''}
            onChange={(e) => setSelectedBranch(e.target.value || null)}
            className="bg-white dark:bg-[#3c3c3c] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-500 transition-colors duration-200"
          >
            <option value="">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content: Split Vertical */}
      <div className="flex-1 min-h-0">
        <PanelGroup direction="vertical">

          {/* Top Panel: Graph */}
          <Panel defaultSize={50} minSize={20} className="flex flex-col">
            <div className="flex-1 bg-white dark:bg-[#1e1e1e] relative overflow-hidden transition-colors duration-200">
              <GitGraph graphData={graphData} onNodeClick={handleNodeClick} />
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-gray-200 dark:bg-[#2d2d2d] hover:bg-blue-500 transition-colors" />

          {/* Bottom Panel */}
          <Panel minSize={20} className="flex flex-col">
            {selectedCommit ? (
              <PanelGroup direction="horizontal">

                {/* Bottom Left: Commit Details */}
                <Panel defaultSize={40} minSize={20} className="flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
                  <div className="h-8 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between shrink-0 transition-colors duration-200">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                      <GoGitCommit className="mr-2" /> Commit Details
                    </span>
                    <button onClick={() => setSelectedCommit(null)} className="text-gray-500 hover:text-white">×</button>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <CommitDetails
                      commit={selectedCommit}
                      onFileSelect={setSelectedFile}
                      selectedFile={selectedFile}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-[#2d2d2d] hover:bg-blue-500 transition-colors" />

                {/* Bottom Right: Diff Viewer */}
                <Panel minSize={30} className="flex flex-col bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
                  {selectedFile ? (
                    <>
                      <div className="h-8 bg-gray-50 dark:bg-[#252526] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 transition-colors duration-200">
                        <span className="text-xs font-medium flex items-center text-gray-700 dark:text-gray-300">
                          <VscFileCode className="mr-2 text-blue-500 dark:text-blue-400" /> {selectedFile}
                        </span>
                        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
                      </div>
                      <div className="flex-1 overflow-auto p-0">
                        {loadingDiff ? (
                          <div className="flex h-full items-center justify-center text-gray-500 text-sm">Loading diff...</div>
                        ) : (
                          <DiffViewer diffData={diffData} viewMode={viewMode} />
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <p className="text-sm">Select a file to view changes</p>
                      </div>
                    </div>
                  )}
                </Panel>

              </PanelGroup>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a commit to view details
              </div>
            )}
          </Panel>

        </PanelGroup>
      </div>
    </div >
  );
};

export default GraphPage;
