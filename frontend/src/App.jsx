import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Workbench from './pages/Workbench';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<Workbench />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
