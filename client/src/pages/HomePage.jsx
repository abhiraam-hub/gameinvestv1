import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Compass, ShieldAlert, History, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { mysteryApi } from '../api/axiosClient';
import LoadingDossier from '../components/LoadingDossier';

const PRESET_PREMISES = [
  {
    title: 'The Midnight Express Poisoning',
    premise: 'A wealthy railway baron is found poisoned inside a private vintage sleeper car locked from the inside as the train rushed through an alpine tunnel.',
    difficulty: 'Medium'
  },
  {
    title: 'The Gallery Heist at 2 AM',
    premise: 'A priceless Renaissance sapphire disappeared from a climate-controlled vault while the infrared laser alarm was silently disabled for 7 minutes.',
    difficulty: 'Easy'
  },
  {
    title: 'The Penthouse Quantum Sabotage',
    premise: 'A cutting-edge tech founder was incapacitated during an exclusive rooftop launch party when their encrypted neural implant was maliciously breached.',
    difficulty: 'Hard'
  },
  {
    title: 'The Grandmaster\'s Final Gambit',
    premise: 'A world chess champion collapsed in the sealed green room right before the tiebreaker game, leaving an overturned queen and a cryptic handwritten note.',
    difficulty: 'Medium'
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    fetchRecentCases();
  }, []);

  const fetchRecentCases = async () => {
    try {
      setLoadingCases(true);
      const cases = await mysteryApi.listRecentCases();
      setRecentCases(cases || []);
    } catch (err) {
      console.warn('Could not load recent cases:', err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleCreateMystery = async (e) => {
    if (e) e.preventDefault();
    if (!premise.trim()) {
      setError('Please provide a crime premise or select one of the presets.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await mysteryApi.createCase({
        premise: premise.trim(),
        difficulty
      });

      const newCase = response.case;
      navigate(`/investigate/${newCase._id}`);
    } catch (err) {
      console.error('Failed to create case:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to generate mystery room. Please verify backend connection or check API key.'
      );
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setPremise(preset.premise);
    setDifficulty(preset.difficulty);
    setError(null);
  };

  if (isLoading) {
    return <LoadingDossier difficulty={difficulty} premise={premise} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Generative Mystery Game</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-tight mb-4">
          Step Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-amber-600">AI Mystery Room</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
          Powered by Gemini 2.5 Flash and Google GenAI. Every crime scene, suspect motive, forensic clue, and alibi is dynamically constructed for fair deductive sleuthing.
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="bg-noir-900 border border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-12 case-dossier-border">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 bg-gold-500/10 border-b border-l border-gold-500/20 px-4 py-1.5 rounded-bl-2xl">
          <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest font-semibold">
            Dossier Generator 2.0
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-crime-950/40 border border-crime-500/40 text-crime-300 text-xs sm:text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-crime-400 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-semibold mb-0.5">Generation Interrupted:</strong>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleCreateMystery} className="space-y-6">
          {/* Premise Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span>Crime Scene Premise & Storyline</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Custom or pick a prompt below
              </span>
            </div>
            <textarea
              rows={3}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="E.g., A renowned cryptographer is found poisoned inside a locked bank archive at midnight, with a shattered pocket watch..."
              className="w-full bg-noir-950/80 border border-noir-700 focus:border-gold-500 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors shadow-inner resize-none font-sans"
            />
          </div>

          {/* Quick Preset Cards */}
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
              Quick Premise Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_PREMISES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    premise === preset.premise
                      ? 'bg-gold-500/10 border-gold-500 text-slate-100'
                      : 'bg-noir-950/50 border-noir-800 hover:border-slate-700 text-slate-300 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-bold text-xs text-gold-400">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-noir-800 text-slate-400 border border-noir-700">
                      {preset.difficulty}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.premise}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold block mb-2.5">
              Investigation Difficulty:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Easy',
                  label: 'Easy (Local Precinct)',
                  suspects: 3,
                  clues: 5,
                  hints: 2,
                  base: 100,
                  desc: 'Ideal for quick warmups and casual deduction.'
                },
                {
                  id: 'Medium',
                  label: 'Medium (Scotland Yard)',
                  suspects: 4,
                  clues: 7,
                  hints: 3,
                  base: 150,
                  desc: 'Balanced mystery with intertwined alibis.'
                },
                {
                  id: 'Hard',
                  label: 'Hard (Interpol Mastermind)',
                  suspects: 5,
                  clues: 9,
                  hints: 3,
                  base: 200,
                  desc: 'Complex deceit, red herrings, and strict evidence.'
                }
              ].map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <div
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gold-500/15 border-gold-400 shadow-md shadow-gold-500/10'
                        : 'bg-noir-950/40 border-noir-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-slate-100">
                        {diff.label}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-gold-400 bg-gold-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-noir-950" />}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gold-400 mb-2">
                      {diff.suspects} Suspects • {diff.clues} Clues • {diff.hints} Hints
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {diff.desc}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-400">
                      +{diff.base} pts for correct accusation
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gold-500 via-amber-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-noir-950 font-black text-sm uppercase tracking-widest shadow-xl shadow-gold-500/25 hover:shadow-gold-500/35 transition-all flex items-center justify-center space-x-2 group"
          >
            <Search className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Open Investigation Room & Synthesize Case</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      {/* Recent Investigations Board */}
      {recentCases.length > 0 && (
        <div className="bg-noir-900/60 border border-noir-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-noir-800">
            <History className="w-5 h-5 text-gold-400" />
            <h3 className="font-serif text-xl font-bold text-slate-100">
              Recent Case Archives
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentCases.map((c) => {
              const isCompleted = c.status === 'completed';
              return (
                <div
                  key={c._id}
                  onClick={() =>
                    navigate(isCompleted ? `/results/${c._id}` : `/investigate/${c._id}`)
                  }
                  className="p-4 rounded-2xl bg-noir-950/60 border border-noir-800 hover:border-gold-500/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-serif font-bold text-sm text-slate-100 group-hover:text-gold-400 transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : 'bg-gold-950/40 text-gold-400 border-gold-800/40'
                      }`}
                    >
                      {isCompleted ? 'Solved / Closed' : 'Active Inquiry'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-noir-850">
                    <span>
                      {c.difficulty} • Score: <strong className="text-gold-400">{c.playerProgress?.score || 0} pts</strong>
                    </span>
                    <span className="text-gold-400 flex items-center space-x-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                      <span>{isCompleted ? 'View Verdict' : 'Resume'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
