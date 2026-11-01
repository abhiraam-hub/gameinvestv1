import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import InvestigationPage from './pages/InvestigationPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-noir-950 text-slate-100">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/investigate/:id" element={<InvestigationPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="border-t border-noir-800 bg-noir-950/80 py-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>🕵️ AI Mystery Room • Procedural Case Deduction Engine</span>
            <span>Powered by Gemini 2.5 Flash, Express, Mongoose & React</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
