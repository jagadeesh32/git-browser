import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header = ({ repoInfo }) => {
  return (
    <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
              Git Browser
            </Link>
            {repoInfo && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{repoInfo.path}</span>
                {repoInfo.current_branch && (
                  <span className="ml-2 px-2 py-1 bg-green-600 dark:bg-green-600 text-white rounded text-xs">
                    {repoInfo.current_branch}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
          <nav className="flex space-x-4">
            <NavLink to="/graph" label="Graph" active={location.pathname === '/graph'} />
            <NavLink to="/commits" label="Commits" active={location.pathname === '/commits'} />
            <NavLink to="/branches" label="Branches" active={location.pathname === '/branches'} />
            <NavLink to="/status" label="Status" active={location.pathname === '/status'} />
          </nav>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
