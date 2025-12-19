import React, { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import GitGraph from '../components/GitGraph';
import CommitDetails from '../components/CommitDetails';
import DiffViewer from '../components/DiffViewer';
import ViewToggle from '../components/ViewToggle';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { GoGitBranch, GoGitCommit } from 'react-icons/go';
import { VscFileCode } from 'react-icons/vsc';

const History = () => {
    const [graphData, setGraphData] = useState([]);
    const [selectedCommit, setSelectedCommit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [diffData, setDiffData] = useState(null);
    const [loadingDiff, setLoadingDiff] = useState(false);
    const [viewMode, setViewMode] = useState('unified');

    useEffect(() => {
        fetchGraph();
    }, []);

    const fetchGraph = async () => {
        try {
            const data = await gitApi.getGraph();
            setGraphData(data);
        } catch (err) {
            console.error('Error fetching graph:', err);
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

    const handleFileSelect = async (path) => {
        if (!selectedCommit) return;

        setSelectedFile(path);
        setLoadingDiff(true);
        try {
            // For committed files, we get the diff of that specific file in that commit
            // The backend API might need adjustments if 'getFileDiff' expects 'sha' and 'path'
            // Assuming getFileDiff(sha, path) exists or we use getCommitDiff
            const diff = await gitApi.getFileDiff(selectedCommit.sha, path);
            setDiffData(diff);
        } catch (err) {
            console.error('Error loading diff:', err);
        } finally {
            setLoadingDiff(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] transition-colors duration-200">

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
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center">
                                            <GoGitCommit className="mr-2" /> Commit Details
                                        </span>
                                        <button onClick={() => setSelectedCommit(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">×</button>
                                    </div>
                                    <div className="flex-1 overflow-auto">
                                        <CommitDetails
                                            commit={selectedCommit}
                                            onFileSelect={handleFileSelect}
                                            selectedFile={selectedFile}
                                        />
                                    </div>
                                </Panel>

                                <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-[#2d2d2d] hover:bg-blue-500 transition-colors" />

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
                            <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800">
                                Select a commit to view details
                            </div>
                        )}
                    </Panel>

                </PanelGroup>
            </div>
        </div>
    );
};

export default History;
