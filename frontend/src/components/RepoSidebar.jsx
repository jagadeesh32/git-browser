import React, { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import { VscCloud, VscRefresh } from 'react-icons/vsc';
import { GoGitBranch } from 'react-icons/go';

const RepoSidebar = ({ onBranchSelect }) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const data = await gitApi.getBranches();
            setBranches(data);
        } catch (err) {
            console.error("Failed to fetch branches", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const localBranches = branches.filter(b => !b.name.includes('origin/'));
    const remoteBranches = branches.filter(b => b.name.includes('origin/'));

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#1e1e1e] border-r border-gray-200 dark:border-gray-800 w-64 transition-colors duration-200">

            {/* Title / Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400 pl-2">Branches</span>
                <button onClick={fetchBranches} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                    <VscRefresh className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">

                {/* Local Branches */}
                <div className="mb-4">
                    <div className="flex items-center px-2 py-1 text-xs font-bold text-gray-400 mb-1">
                        <GoGitBranch className="mr-1" /> LOCAL
                    </div>
                    {localBranches.map(branch => (
                        <div
                            key={branch.name}
                            className={`
                 flex items-center px-2 py-1 rounded cursor-pointer text-sm mb-0.5 truncate group
                 ${branch.is_current
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2d2e]'}
               `}
                            title={branch.name}
                            onClick={() => onBranchSelect && onBranchSelect(branch)}
                        >
                            <GoGitBranch className={`mr-2 flex-shrink-0 ${branch.is_current ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="truncate">{branch.name}</span>
                        </div>
                    ))}
                </div>

                {/* Remote Branches */}
                <div>
                    <div className="flex items-center px-2 py-1 text-xs font-bold text-gray-400 mb-1">
                        <VscCloud className="mr-1" /> REMOTES
                    </div>
                    {remoteBranches.map(branch => (
                        <div
                            key={branch.name}
                            className="flex items-center px-2 py-1 rounded cursor-pointer text-sm mb-0.5 truncate text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2d2e]"
                            title={branch.name}
                        >
                            <VscCloud className="mr-2 flex-shrink-0 text-gray-500" />
                            <span className="truncate">{branch.name.replace('origin/', '')}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default RepoSidebar;
