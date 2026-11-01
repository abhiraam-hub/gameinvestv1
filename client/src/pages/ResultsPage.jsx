import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Share2,
  Copy,
  Check,
  User,
  Search,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { mysteryApi } from '../api/axiosClient';
import { sounds } from '../utils/soundEffects';

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mysteryApi.getCaseResult(id);
      setResultData(data);

      const isCorrect = data.accusation?.isCorrect;
      if (isCorrect) {
        sounds.playVictory();
        triggerConfetti();
      } else {
        sounds.playDefeat();
      }
    } catch (err) {
      console.error('Failed to load case results:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not load case verdict. Make sure an accusation was submitted.'
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch (e) {
      // ignore
    }
  };

  const handleCopySummary = () => {
    if (!resultData) return;
    const isCorrect = resultData.accusation?.isCorrect;
    const summaryText = `🕵️ AI Mystery Room Case Report
Case: "${resultData.title}" (${resultData.difficulty})
Verdict: ${isCorrect ? '✅ CASE SOLVED!' : '❌ CASE UNSOLVED!'}
Final Score: ${resultData.playerProgress?.score || 0} pts
True Culprit: ${resultData.solution?.culpritName} (${resultData.solution?.culpritRole})
Clues Discovered: ${resultData.playerProgress?.discoveredCluesCount}
Can you solve the case? Try AI Mystery Room!`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="font-mono text-sm text-slate-400 uppercase tracking-widest">
            Unsealing Classified Solution Dossier...
          </p>
        </div>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-noir-900 border border-crime-500/40 rounded-3xl text-center space-y-4">
        <XCircle className="w-12 h-12 text-crime-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-slate-100">Case Results Locked</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <button
          onClick={() => navigate(`/investigate/${id}`)}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-2"
        >
          <span>Return to Investigation Room</span>
        </button>
      </div>
    );
  }

  const isCorrect = resultData.accusation?.isCorrect;
  const score = resultData.playerProgress?.score || 0;
  const cluesDiscovered = resultData.playerProgress?.discoveredCluesCount || 0;
  const hintsUsed = resultData.playerProgress?.hintsUsedCount || 0;
  const culprit = resultData.solution || {};
  const accusedSuspect = resultData.suspects?.find((s) => s.id === resultData.accusation?.suspectId);

  const getBasePoints = () => {
    if (!isCorrect) return 0;
    if (resultData.difficulty === 'Hard') return 200;
    if (resultData.difficulty === 'Medium') return 150;
    return 100;
  };

  const getRankBadge = (pts) => {
    if (pts >= 200) return { title: 'Master Detective', badge: 'bg-gold-500/15 text-gold-400 border-gold-500/40' };
    if (pts >= 120) return { title: 'Senior Inspector', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/40' };
    if (pts >= 60) return { title: 'Deduction Officer', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/40' };
    if (pts > 0) return { title: 'Junior Investigator', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' };
    return { title: 'Bystander Sleuth', badge: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  const rank = getRankBadge(score);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Verdict Hero Banner */}
      <div
        className={`rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border shadow-2xl ${
          isCorrect
            ? 'bg-gradient-to-b from-emerald-950/60 via-noir-900 to-noir-950 border-emerald-500/40 shadow-emerald-950/30'
            : 'bg-gradient-to-b from-crime-950/60 via-noir-900 to-noir-950 border-crime-600/40 shadow-crime-950/30'
        }`}
      >
        {/* Stamp Badge */}
        <div className="inline-block mb-4">
          <span
            className={`text-xs font-mono uppercase px-4 py-1.5 rounded-full font-black tracking-widest border inline-flex items-center space-x-1.5 ${
              isCorrect ? 'stamp-solved' : 'stamp-classified'
            }`}
          >
            {isCorrect ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{isCorrect ? 'CASE CLOSED - PERPETRATOR APPREHENDED' : 'CASE CLOSED - CULPRIT ESCAPED'}</span>
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-black text-slate-100 mb-3 tracking-tight">
          {isCorrect ? 'Brilliant Deduction, Detective!' : 'An Innocent Person Was Accused!'}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          {isCorrect
            ? `You correctly singled out ${culprit.culpritName} from the suspects. Your forensic analysis matched the timeline and pierced their deception.`
            : `You accused ${accusedSuspect?.name || 'an innocent bystander'}, but the true mastermind was ${culprit.culpritName}.`}
        </p>

        {/* Action Buttons in Hero */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => navigate('/')}
            className="py-3 px-6 rounded-2xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-gold-500/25 transition-all flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Investigate New Case</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="py-3 px-5 rounded-2xl bg-noir-800 hover:bg-noir-700 text-slate-200 border border-noir-700 text-xs font-mono uppercase tracking-wider transition-colors flex items-center space-x-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Report Copied!' : 'Share Case Report'}</span>
          </button>
        </div>
      </div>

      {/* Score Breakdown Card */}
      <div className="bg-noir-900 border border-noir-700/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-noir-800">
          <div className="flex items-center space-x-2.5">
            <Award className="w-6 h-6 text-gold-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              Final Investigation Ledger
            </h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-mono border ${rank.badge}`}>
            Rank: <strong>{rank.title}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-noir-950/60 border border-noir-800 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Accusation Base
            </span>
            <span
              className={`text-2xl font-serif font-black ${
                isCorrect ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              +{getBasePoints()}{' '}
              <span className="text-xs font-mono font-normal">pts</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              ({resultData.difficulty} Difficulty)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-noir-950/60 border border-noir-800 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Discovered Clues
            </span>
            <span className="text-2xl font-serif font-black text-emerald-400">
              +{cluesDiscovered * 5}{' '}
              <span className="text-xs font-mono font-normal">pts</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              ({cluesDiscovered} clues × 5)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-noir-950/60 border border-noir-800 text-center">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Hints Consulted
            </span>
            <span className="text-2xl font-serif font-black text-amber-400">
              -{hintsUsed * 10}{' '}
              <span className="text-xs font-mono font-normal">pts</span>
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">
              ({hintsUsed} hints × -10)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 text-center flex flex-col justify-center">
            <span className="text-[11px] font-mono uppercase text-gold-400 font-bold block mb-1">
              Total Score
            </span>
            <span className="text-3xl font-serif font-black text-gold-400">
              {score}{' '}
              <span className="text-xs font-mono font-normal text-slate-300">points</span>
            </span>
          </div>
        </div>
      </div>

      {/* Culprit Reveal & Explanation Dossier */}
      <div className="bg-noir-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden case-dossier-border space-y-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-noir-800">
          <BookOpen className="w-5 h-5 text-gold-400" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
            Official Case File Solution & Deduction
          </h2>
        </div>

        {/* Culprit Spotlight Card */}
        <div className="p-5 rounded-2xl bg-noir-950/80 border border-crime-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-crime-600 to-slate-900 flex items-center justify-center text-white border border-crime-500 shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-crime-400 font-bold block">
                The True Perpetrator
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-100">
                {culprit.culpritName}
              </h3>
              <p className="text-xs text-gold-400 font-medium">
                Role: {culprit.culpritRole} (ID: {culprit.culpritId})
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">
              Your Accusation
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isCorrect ? 'text-emerald-400' : 'text-crime-400'
              }`}
            >
              {accusedSuspect?.name} ({isCorrect ? 'Accused Correctly' : 'Falsely Accused'})
            </span>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div className="bg-noir-950/70 p-6 rounded-2xl border border-noir-800 space-y-3">
          <h4 className="font-mono text-xs text-gold-400 uppercase tracking-widest font-semibold flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5" />
            <span>Deductive Chain of Evidence</span>
          </h4>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
            {culprit.explanation}
          </p>
        </div>
      </div>

      {/* Review Suspects & Clues */}
      <div className="bg-noir-900/60 border border-noir-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-serif text-lg font-bold text-slate-100">
          All Suspect Alibis & Forensic Evidence Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-gold-400">Suspect Lineup:</h4>
            {resultData.suspects?.map((s) => {
              const isTrueCulprit = s.id === culprit.culpritId;
              const wasAccused = s.id === resultData.accusation?.suspectId;
              return (
                <div
                  key={s.id}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isTrueCulprit
                      ? 'bg-crime-950/20 border-crime-500/40 text-slate-200'
                      : 'bg-noir-950/40 border-noir-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 font-serif">
                      {s.name} ({s.role})
                    </span>
                    <div className="flex items-center space-x-1">
                      {isTrueCulprit && (
                        <span className="px-2 py-0.5 rounded bg-crime-600 text-white text-[10px] font-mono">
                          Guilty
                        </span>
                      )}
                      {wasAccused && (
                        <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30 text-[10px] font-mono">
                          Accused
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-emerald-400">Forensic Clues:</h4>
            {resultData.clues?.map((c, i) => (
              <div
                key={c.id || i}
                className="p-3.5 rounded-xl bg-noir-950/40 border border-noir-800 text-xs text-slate-300 leading-relaxed"
              >
                <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-slate-500">
                  <span>Clue #{i + 1}</span>
                  <span className={c.discovered ? 'text-emerald-400' : 'text-slate-500'}>
                    {c.discovered ? '✓ Discovered' : 'Unopened'}
                  </span>
                </div>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
