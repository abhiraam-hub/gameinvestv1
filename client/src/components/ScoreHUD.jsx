import React from 'react';
import { Award, Compass, HelpCircle, Shield, TrendingUp } from 'lucide-react';

export default function ScoreHUD({
  score = 0,
  discoveredCluesCount = 0,
  totalCluesCount = 0,
  hintsUsedCount = 0,
  totalHintsCount = 0,
  difficulty = 'Easy',
  onOpenAccusation
}) {
  const getRank = (score) => {
    if (score >= 200) return { title: 'Master Detective', color: 'text-gold-400 bg-gold-500/10 border-gold-500/30' };
    if (score >= 120) return { title: 'Senior Inspector', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    if (score >= 60) return { title: 'Deduction Officer', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    if (score > 0) return { title: 'Junior Investigator', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    return { title: 'Rookie Sleuth', color: 'text-slate-400 bg-slate-800 border-slate-700' };
  };

  const rank = getRank(score);
  const clueProgress = totalCluesCount > 0 ? (discoveredCluesCount / totalCluesCount) * 100 : 0;

  return (
    <div className="bg-noir-900/90 border border-noir-700/80 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        {/* Score Card */}
        <div className="flex items-center space-x-3 border-r border-noir-800 pr-2">
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <span>Investigation Score</span>
              <TrendingUp className="w-3 h-3 text-gold-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-black text-gold-400 transition-all">
              {score} <span className="text-xs font-mono font-normal text-slate-400">pts</span>
            </div>
          </div>
        </div>

        {/* Clues Discovered */}
        <div className="flex items-center space-x-3 border-r border-noir-800 pr-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="w-full">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Clues Uncovered</span>
              <span className="text-emerald-400 font-semibold">{discoveredCluesCount}/{totalCluesCount}</span>
            </div>
            <div className="w-full bg-noir-800 h-2 rounded-full mt-1.5 overflow-hidden border border-noir-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                style={{ width: `${clueProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hints Penalties */}
        <div className="flex items-center space-x-3 border-r border-noir-800 pr-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Hints Utilized
            </div>
            <div className="text-lg font-mono font-bold text-slate-200">
              {hintsUsedCount} <span className="text-slate-500 text-xs">/ {totalHintsCount}</span>
              <span className="text-[10px] text-amber-400/80 ml-1.5 font-normal">(-10 pts each)</span>
            </div>
          </div>
        </div>

        {/* Detective Rank & Accuse Button */}
        <div className="col-span-2 md:col-span-1 flex flex-col sm:flex-row md:flex-col items-stretch justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Rank:</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${rank.color}`}>
              {rank.title}
            </span>
          </div>
          {onOpenAccusation && (
            <button
              onClick={onOpenAccusation}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-crime-600 to-rose-700 hover:from-crime-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-crime-700/30 hover:shadow-crime-600/40 transition-all flex items-center justify-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Issue Accusation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
