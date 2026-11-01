import React, { useState } from 'react';
import { Search, CheckCircle2, Lock, Sparkles, Pin } from 'lucide-react';

export default function ClueItem({ clue, index, onDiscover, disabled = false }) {
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleDiscover = async () => {
    if (clue.discovered || disabled || isDiscovering) return;
    setIsDiscovering(true);
    try {
      await onDiscover(clue.id);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-5 transition-all border ${
        clue.discovered
          ? 'bg-noir-900/90 border-emerald-500/30 shadow-lg shadow-emerald-950/20'
          : 'bg-noir-900/60 border-noir-700/80 hover:border-gold-500/40 hover:bg-noir-800/80 shadow-md'
      }`}
    >
      {/* Evidence Pin on Top Center */}
      <div className="absolute -top-2.5 left-6 flex items-center justify-center">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
            clue.discovered ? 'bg-emerald-500 text-noir-950' : 'bg-gold-500 text-noir-950'
          }`}
          title="Evidence Pin"
        >
          <Pin className="w-3 h-3 fill-current rotate-45" />
        </div>
      </div>

      <div className="flex items-start justify-between mt-1 mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            Evidence Item #{index + 1}
          </span>
          <span className="font-mono text-[10px] text-slate-500">[{clue.id}]</span>
        </div>

        {clue.discovered ? (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Analyzed (+5 pts)</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-noir-800 text-gold-400/90 border border-gold-500/20 text-[11px] font-mono">
            <Lock className="w-3 h-3 text-gold-400" />
            <span>Unexamined</span>
          </span>
        )}
      </div>

      {/* Clue Content */}
      {clue.discovered ? (
        <div className="animate-fade-in">
          <p className="text-slate-100 text-sm leading-relaxed font-sans bg-noir-950/60 p-3.5 rounded-xl border border-noir-800">
            {clue.text}
          </p>
          <div className="flex items-center justify-between mt-3 text-[11px] text-emerald-400/80 font-mono">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Cataloged in detective notebook</span>
            </span>
            <span className="text-slate-500">Forensics Confirmed</span>
          </div>
        </div>
      ) : (
        <div className="py-2">
          <p className="text-xs text-slate-400 italic mb-4">
            Physical forensic trace at crime scene awaits your examination...
          </p>
          <button
            onClick={handleDiscover}
            disabled={disabled || isDiscovering}
            className="w-full py-2.5 px-4 rounded-xl bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-noir-950 font-bold text-xs uppercase tracking-wider border border-gold-500/40 hover:border-gold-400 shadow-md transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
          >
            <Search className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <span>
              {isDiscovering ? 'Analyzing Forensics...' : 'Examine & Uncover Evidence (+5 pts)'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
