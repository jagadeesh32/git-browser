import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { gitApi } from './services/api';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import GraphPage from './pages/GraphPage';
import CommitsPage from './pages/CommitsPage';
import BranchesPage from './pages/BranchesPage';

function App() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepoInfo();
  }, []);

  const loadRepoInfo = async () => {
    try {
      const info = await gitApi.getInfo();
      setRepoInfo(info);
    } catch (error) {
      console.error('Error loading repository info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-2xl">Loading Git Browser...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
          <Header repoInfo={repoInfo} />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<GraphPage />} />
              <Route path="/commits" element={<CommitsPage />} />
              <Route path="/branches" element={<BranchesPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
