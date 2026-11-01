import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Volume2, VolumeX, Key, ShieldCheck, FileQuestion } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { mysteryApi } from '../api/axiosClient';

export default function Navbar() {
  const location = useLocation();
  const [muted, setMuted] = useState(sounds.isMuted());
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [serverStatus, setServerStatus] = useState({ online: false, geminiConfigured: false });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mystery_gemini_api_key');
      if (stored) {
        setHasCustomKey(true);
        setApiKeyInput(stored);
      }
    } catch (e) {}

    // Check backend health
    mysteryApi.checkHealth()
      .then((data) => {
        setServerStatus({
          online: data.status === 'online',
          geminiConfigured: data.geminiKeyConfigured
        });
      })
      .catch(() => {
        setServerStatus({ online: false, geminiConfigured: false });
      });
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem('mystery_gemini_api_key', apiKeyInput.trim());
      setHasCustomKey(true);
    } else {
      localStorage.removeItem('mystery_gemini_api_key');
      setHasCustomKey(false);
    }
    setShowKeyModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-noir-900/80 backdrop-blur-md border-b border-noir-700/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-amber-700 p-0.5 shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-noir-950 rounded-[7px] flex items-center justify-center">
                <Search className="w-5 h-5 text-gold-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl font-bold tracking-wide text-slate-100 group-hover:text-gold-400 transition-colors">
                  AI Mystery Room
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/30">
                  Noir Detective
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Procedural Case Solving & Crime Scene Deduction
              </p>
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Server / AI Status Pill */}
            <div
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
                serverStatus.online
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                  : 'bg-noir-800 text-slate-400 border-noir-700'
              }`}
              title={
                serverStatus.geminiConfigured || hasCustomKey
                  ? 'Gemini AI API is ready for dynamic generation'
                  : 'Using intelligent mystery generator fallback'
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  serverStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>
                {serverStatus.geminiConfigured || hasCustomKey
                  ? 'Gemini 2.5 Active'
                  : 'Smart AI Engine'}
              </span>
            </div>

            {/* Custom API Key Button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                hasCustomKey
                  ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 hover:bg-gold-500/20'
                  : 'bg-noir-800 text-slate-300 border-noir-700 hover:text-slate-100 hover:border-slate-600'
              }`}
              title="Configure Custom Gemini API Key"
            >
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">
                {hasCustomKey ? 'Custom Key Set' : 'Gemini Key'}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-lg bg-noir-800 text-slate-300 hover:text-gold-400 border border-noir-700 hover:border-slate-600 transition-colors"
              title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-gold-400" />}
            </button>

            {/* Home / New Case link */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-noir-950 font-semibold text-xs tracking-wide shadow-md shadow-gold-500/20 transition-all flex items-center space-x-1.5"
              >
                <FileQuestion className="w-4 h-4" />
                <span className="hidden sm:inline">New Case</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-noir-900 border border-gold-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5 text-gold-400" />
              <span>Gemini API Key Settings</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Optional: Enter your own Google Gemini API key if you'd like the backend to use your specific quota. If left empty, the server's configured environment key or our smart procedural mystery generator will be used.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-noir-950 border border-noir-700 focus:border-gold-500 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 rounded-lg bg-noir-800 text-slate-300 hover:bg-noir-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Key</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
