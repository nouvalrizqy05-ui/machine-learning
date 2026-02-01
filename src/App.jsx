// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProjectPicker from './pages/ProjectPicker';
import Studio from './pages/Studio';

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Depan */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Halaman Pilih Project */}
        <Route path="/get-started" element={<ProjectPicker />} />
        
        {/* Halaman Inti (Studio) */}
        <Route path="/image-project" element={<Studio />} />
      </Routes>
    </Router>
  );
}

export default App;