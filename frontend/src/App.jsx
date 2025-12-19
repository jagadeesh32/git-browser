import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GraphPage from './pages/GraphPage';
import CommitsPage from './pages/CommitsPage';
import BranchesPage from './pages/BranchesPage';
import StatusPage from './pages/StatusPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/status" replace />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/commits" element={<CommitsPage />} />
          <Route path="/branches" element={<BranchesPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
