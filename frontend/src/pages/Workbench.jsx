import React, { useState } from 'react';
import RepoSidebar from '../components/RepoSidebar';
import WorkingCopy from '../views/WorkingCopy';
import History from '../views/History';
import { useTheme } from '../contexts/ThemeContext';
import { gitApi } from '../services/api';
import { VscSourceControl, VscHistory, VscSync, VscCloudDownload, VscCloudUpload, VscBell, VscAccount, VscMenu } from 'react-icons/vsc';

const Workbench = () => {
    const [activeView, setActiveView] = useState('working-copy'); // 'working-copy' or 'history'
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const { theme, changeTheme } = useTheme();
    const isDark = theme === 'dark';

    const handleBranchSelect = async (branch) => {
        // If it's a remote branch, maybe prompt to track? For now, just try checkout if local.
        if (branch.name.includes('origin/')) {
            alert("Checkout of remote branches not fully implemented yet.");
            return;
        }
        try {
            await gitApi.checkout(branch.name);
            window.location.reload(); // Simple reload to refresh all state for now
        } catch (err) {
            console.error("Failed to checkout", err);
            alert("Failed to checkout: " + err.response?.data?.error || err.message);
        }
    };

    const toggleTheme = () => changeTheme(isDark ? 'light' : 'dark');

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-[#121212] font-sans text-gray-900 dark:text-gray-300 transition-colors duration-200 overflow-hidden">

            {/* TOP TOOLBAR */}
            <header className="h-12 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 shrink-0 select-none transition-colors duration-200">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setSidebarVisible(!sidebarVisible)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                        <VscMenu />
                    </button>
                    <span className="font-bold text-lg tracking-tight text-gray-800 dark:text-gray-100">GitBrowser</span>

                    {/* View Switcher Tabs */}
                    <div className="flex bg-gray-100 dark:bg-[#252526] rounded p-0.5 ml-4">
                        <button
                            onClick={() => setActiveView('working-copy')}
                            className={`
                            px-3 py-1 text-xs font-medium rounded flex items-center transition-all
                            ${activeView === 'working-copy'
                                    ? 'bg-white dark:bg-[#37373d] text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}
                          `}
                        >
                            <VscSourceControl className="mr-2" /> Working Copy
                        </button>
                        <button
                            onClick={() => setActiveView('history')}
                            className={`
                            px-3 py-1 text-xs font-medium rounded flex items-center transition-all
                            ${activeView === 'history'
                                    ? 'bg-white dark:bg-[#37373d] text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}
                          `}
                        >
                            <VscHistory className="mr-2" /> History
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded shadow-sm transition-colors">
                        <VscSync className="mr-1.5" /> Fetch
                    </button>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={toggleTheme}>
                        {isDark ? '🌙' : '☀️'}
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 ml-2">
                        <VscAccount className="text-gray-500 dark:text-gray-400" />
                    </div>
                </div>
            </header>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">

                {/* REPO SIDEBAR */}
                {sidebarVisible && (
                    <div className="flex-shrink-0">
                        <RepoSidebar onBranchSelect={handleBranchSelect} />
                    </div>
                )}

                {/* CONTENT AREA */}
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212] transition-colors duration-200 relative">
                    {/* View Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {/* We use display:none to keep state when switching tabs if desired, 
                            or conditional rendering for fresher state. 
                            Let's use conditional for now to save memory, 
                            but keeping state is more "SPA-like". 
                            Actually, users prefer state persistence (scroll position etc). 
                            Let's try absolute positioning for instant switch.
                        */}
                        <div className={`absolute inset-0 ${activeView === 'working-copy' ? 'z-10' : 'z-0 invisible'}`}>
                            <WorkingCopy />
                        </div>
                        <div className={`absolute inset-0 ${activeView === 'history' ? 'z-10' : 'z-0 invisible'}`}>
                            <History />
                        </div>
                    </div>
                </main>
            </div>

            {/* STATUS FOOTER */}
            <footer className="h-6 bg-gray-100 dark:bg-[#007acc] border-t border-gray-200 dark:border-transparent text-gray-600 dark:text-white text-xs flex items-center px-3 justify-between shrink-0 select-none transition-colors duration-200">
                <div className="flex items-center space-x-4">
                    <span>Ready</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>Git Browser v1.0</span>
                </div>
            </footer>
        </div>
    );
};

export default Workbench;
