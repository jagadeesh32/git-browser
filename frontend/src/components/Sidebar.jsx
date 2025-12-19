import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  VscSourceControl,
  VscHistory,
  VscSettingsGear,
  VscHome
} from 'react-icons/vsc';
import { GoGitBranch, GoRepoForked } from 'react-icons/go';
import { useTheme } from '../contexts/ThemeContext';

const SidebarItem = ({ to, icon: Icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`
        flex items-center py-3 px-3 my-1 mx-2 rounded-md transition-all duration-200 group
        ${isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }
      `}
      title={collapsed ? label : ''}
    >
      <Icon className={`text-xl ${collapsed ? 'mx-auto' : 'mr-3'}`} />
      {!collapsed && (
        <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border border-gray-700">
          {label}
        </div>
      )}
    </NavLink>
  );
};

const Sidebar = ({ collapsed }) => {
  return (
    <aside className={`
      flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] transition-all duration-300 h-screen
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      <div className="h-14 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 mb-2">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'px-4 w-full'}`}>
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
            <VscSourceControl className="text-white text-lg" />
          </div>
          {!collapsed && <span className="ml-3 font-bold text-gray-800 dark:text-gray-100 tracking-tight">GitConsole</span>}
        </div>
      </div>

      <nav className="flex-1 py-4">
        <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:block">
          {!collapsed && "Workspace"}
        </div>
        <SidebarItem to="/status" icon={VscSourceControl} label="Changes" collapsed={collapsed} />
        <SidebarItem to="/graph" icon={GoRepoForked} label="Graph" collapsed={collapsed} />
        <SidebarItem to="/commits" icon={VscHistory} label="History" collapsed={collapsed} />
        <SidebarItem to="/branches" icon={GoGitBranch} label="Branches" collapsed={collapsed} />
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        <SidebarItem to="/settings" icon={VscSettingsGear} label="Settings" collapsed={collapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
