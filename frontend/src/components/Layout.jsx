import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { VscMenu, VscBell, VscAccount } from 'react-icons/vsc';
import { GoGitBranch } from 'react-icons/go';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, changeTheme } = useTheme();

  const isDark = theme === 'dark';
  const toggleTheme = () => changeTheme(isDark ? 'light' : 'dark');

  return (
    <div className="flex h-screen bg-[#121212] text-gray-300 overflow-hidden font-sans">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121212] transition-colors duration-200">
        {/* Top Command Bar */}
        <header className="h-14 bg-white dark:bg-[#1e1e1e] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0 transition-colors duration-200">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 mr-4 transition-colors"
            >
              <VscMenu className="text-lg" />
            </button>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 mr-2 transition-colors">master</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-200 font-medium">git-browser</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={toggleTheme} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
              {isDark ? '🌙' : '☀️'}
            </button>
            <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 relative transition-colors">
              <VscBell className="text-lg" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 transition-colors">
              <VscAccount />
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-auto bg-white dark:bg-[#121212] relative scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent transition-colors duration-200">
          {children}
        </main>

        {/* Status Bar */}
        <footer className="h-6 bg-gray-100 dark:bg-[#007acc] text-gray-600 dark:text-white text-xs flex items-center px-3 justify-between shrink-0 select-none border-t border-gray-200 dark:border-transparent transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><GoGitBranch className="mr-1" /> master</span>
            <span className="hover:bg-gray-200 dark:hover:bg-white/20 px-1 rounded cursor-pointer transition-colors">0↓ 1↑</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Ln 12, Col 45</span>
            <span>UTF-8</span>
            <span>Python</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
