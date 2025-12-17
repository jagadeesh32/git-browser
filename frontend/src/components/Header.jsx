import { Link } from 'react-router-dom';

const Header = ({ repoInfo }) => {
  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
              Git Browser
            </Link>
            {repoInfo && (
              <div className="text-sm text-gray-400">
                <span className="font-semibold">{repoInfo.path}</span>
                {repoInfo.current_branch && (
                  <span className="ml-2 px-2 py-1 bg-green-600 rounded text-xs">
                    {repoInfo.current_branch}
                  </span>
                )}
              </div>
            )}
          </div>

          <nav className="flex space-x-6">
            <Link
              to="/"
              className="hover:text-blue-400 transition-colors"
            >
              Graph
            </Link>
            <Link
              to="/commits"
              className="hover:text-blue-400 transition-colors"
            >
              Commits
            </Link>
            <Link
              to="/branches"
              className="hover:text-blue-400 transition-colors"
            >
              Branches
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
