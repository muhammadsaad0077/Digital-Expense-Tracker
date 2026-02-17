import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Dashboard from './Components/Dashboard';
import Analytics from './Components/Analytics';
import Transactions from './Components/Transactions';
import Settings from './Components/Settings';

export default function App() {
  const [isLight, setIsLight] = useState(false);

  return (
    <Router>
      <div className={`min-h-screen p-6 lg:p-10 transition-all duration-300 ${isLight ? 'bg-[#f4f7f6] text-[#1a1a1a]' : 'bg-[#080808] text-white'}`}>
        <div className="max-w-7xl mx-auto">
          {/* We no longer need to pass setView to Navbar */}
          <Navbar isLight={isLight} />
          
          <main className="mt-10">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings toggleTheme={() => setIsLight(!isLight)} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}