import React, { useState } from 'react';
import { User, MessageSquare, AlertTriangle, Eye, ShieldAlert, Check } from 'lucide-react';

export default function SuspectCard({ suspect, onAccuse, isSelected = false }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isMarkedSuspicious, setIsMarkedSuspicious] = useState(false);

  // Generate a distinct silhouette/avatar color based on name
  const avatarColors = [
    'from-indigo-600 to-slate-800',
    'from-amber-600 to-slate-800',
    'from-rose-600 to-slate-800',
    'from-emerald-600 to-slate-800',
    'from-cyan-600 to-slate-800'
  ];
  const colorIndex = (suspect.name.charCodeAt(0) || 0) % avatarColors.length;

  return (
    <>
      <div
        className={`evidence-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all border ${
          isSelected
            ? 'border-crime-500 ring-2 ring-crime-500/30'
            : isMarkedSuspicious
            ? 'border-amber-500/50 bg-amber-950/10'
            : 'border-noir-700 hover:border-gold-500/40'
        }`}
      >
        {/* Suspicious Pin Stamp Badge */}
        {isMarkedSuspicious && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>High Suspicion</span>
          </div>
        )}

        <div>
          {/* Top Header with Avatar */}
          <div className="flex items-start space-x-3.5 mb-3">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColors[colorIndex]} p-0.5 shadow-md flex items-center justify-center shrink-0 border border-slate-700/60`}
            >
              <div className="w-full h-full bg-noir-900/60 rounded-[14px] flex items-center justify-center">
                <User className="w-7 h-7 text-slate-300" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-noir-800 text-slate-400 border border-noir-700 inline-block mb-1">
                ID: {suspect.id}
              </span>
              <h3 className="font-serif text-lg font-bold text-slate-100 truncate group-hover:text-gold-400">
                {suspect.name}
              </h3>
              <p className="text-xs text-gold-400/90 font-medium truncate">
                {suspect.role}
              </p>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-3 mb-4 font-sans bg-noir-950/40 p-2.5 rounded-xl border border-noir-800">
            "{suspect.description}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-noir-800/80 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowDetailsModal(true)}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-noir-800 hover:bg-noir-700 text-slate-300 hover:text-white text-xs font-medium border border-noir-700 transition-colors flex items-center justify-center space-x-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-gold-400" />
            <span>Interrogate</span>
          </button>

          <button
            onClick={() => setIsMarkedSuspicious(!isMarkedSuspicious)}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center space-x-1 ${
              isMarkedSuspicious
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-noir-800 hover:bg-noir-700 text-slate-400 border-noir-700 hover:text-amber-400'
            }`}
            title="Toggle suspicious marker in notebook"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>

          {onAccuse && (
            <button
              onClick={() => onAccuse(suspect)}
              className="py-1.5 px-3 rounded-lg bg-crime-600/90 hover:bg-crime-600 text-white text-xs font-bold border border-crime-500/50 hover:shadow-md hover:shadow-crime-600/30 transition-all flex items-center space-x-1"
              title="Formally Accuse this Suspect"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Accuse</span>
            </button>
          )}
        </div>
      </div>

      {/* Suspect Interrogation / Dossier Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-noir-900 border border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative case-dossier-border">
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-noir-700">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[colorIndex]} flex items-center justify-center text-white`}
                >
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400">
                    Confidential Police Interrogation Dossier
                  </span>
                  <h3 className="font-serif text-xl font-bold text-slate-100">
                    {suspect.name}
                  </h3>
                  <p className="text-xs text-slate-400">{suspect.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-300">
              <div className="bg-noir-950/60 p-3.5 rounded-xl border border-noir-800">
                <h4 className="font-mono text-gold-400 uppercase tracking-wider text-[11px] mb-1 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Testimony & Alibi Statement</span>
                </h4>
                <p className="text-slate-200 italic font-serif text-sm">
                  "{suspect.description}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-noir-950/40 p-3 rounded-lg border border-noir-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    Assigned Suspect ID
                  </span>
                  <span className="font-mono text-slate-200 font-bold">{suspect.id}</span>
                </div>
                <div className="bg-noir-950/40 p-3 rounded-lg border border-noir-800">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">
                    Detective Assessment
                  </span>
                  <span className={`font-mono font-bold ${isMarkedSuspicious ? 'text-amber-400' : 'text-slate-300'}`}>
                    {isMarkedSuspicious ? 'Marked Suspicious' : 'Standard Inquiry'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                Tip: Cross-reference this testimony against unlocked physical clues from the crime scene before making your final accusation.
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-noir-800 flex items-center justify-between">
              <button
                onClick={() => setIsMarkedSuspicious(!isMarkedSuspicious)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center space-x-1.5 ${
                  isMarkedSuspicious
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-noir-800 text-slate-400 border-noir-700 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isMarkedSuspicious ? 'Suspicious Flag Set' : 'Mark as Suspicious'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-noir-800 text-slate-300 hover:bg-noir-700 text-xs font-medium"
                >
                  Close Dossier
                </button>
                {onAccuse && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      onAccuse(suspect);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-crime-600 hover:bg-crime-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-crime-600/30 flex items-center space-x-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Accuse Suspect</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
