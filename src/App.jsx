// src/App.jsx
import React from 'react';

// --- PERHATIKAN BARIS DI BAWAH INI ---
// Ganti 'BrowserRouter' menjadi 'HashRouter'
// Kita pakai 'as Router' supaya tag <Router> di bawah tidak perlu diganti
import { HashRouter as Router, Routes, Route } from 'react-router-dom'; 
// -------------------------------------

import LandingPage from './pages/LandingPage';
import ProjectPicker from './pages/ProjectPicker';
import Studio from './pages/Studio';

function App() {
  return (
    // Karena kita sudah pakai alias di atas, tag ini sekarang otomatis menjadi HashRouter
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