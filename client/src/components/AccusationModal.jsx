import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Check, User, X } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AccusationModal({
  isOpen,
  onClose,
  suspects = [],
  difficulty = 'Easy',
  onConfirmAccusation,
  preselectedSuspect = null
}) {
  const [selectedSuspectId, setSelectedSuspectId] = useState(
    preselectedSuspect?.id || (suspects[0]?.id || '')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getBaseScore = () => {
    if (difficulty === 'Hard') return 200;
    if (difficulty === 'Medium') return 150;
    return 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId || isSubmitting) return;

    sounds.playAccuseGavel();
    setIsSubmitting(true);
    try {
      await onConfirmAccusation(selectedSuspectId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSuspect = suspects.find((s) => s.id === selectedSuspectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-noir-900 border border-crime-600/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-noir-800 border border-noir-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-crime-600/20 border border-crime-500/40 flex items-center justify-center text-crime-500 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-crime-400 font-bold block">
              Final Warrant of Arrest
            </span>
            <h2 className="font-serif text-2xl font-black text-slate-100">
              Deliver Formal Accusation
            </h2>
          </div>
        </div>

        <div className="bg-noir-950/60 p-4 rounded-xl border border-noir-800 mb-6 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center space-x-2 text-gold-400 font-mono text-[11px] mb-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High Stakes Deduction:</span>
          </div>
          Identify the true culprit behind the crime. If your deduction is correct, you will earn <strong className="text-emerald-400 font-mono font-bold">+{getBaseScore()} base points</strong>. If incorrect, you will receive 0 base points and the culprit will escape justice!
        </div>

        {/* Suspect Radio Selector */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
            {suspects.map((suspect) => {
              const isSelected = selectedSuspectId === suspect.id;
              return (
                <div
                  key={suspect.id}
                  onClick={() => setSelectedSuspectId(suspect.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-crime-950/30 border-crime-500 shadow-md ring-1 ring-crime-500/40'
                      : 'bg-noir-950/40 border-noir-800 hover:border-slate-700 hover:bg-noir-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-crime-600 text-white border-crime-400'
                          : 'bg-noir-800 text-slate-400 border-noir-700'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-slate-100 text-sm truncate">
                          {suspect.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">[{suspect.id}]</span>
                      </div>
                      <p className="text-xs text-gold-400/90 truncate">{suspect.role}</p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-crime-500 border-crime-400 text-white'
                        : 'border-noir-700 bg-noir-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirmation Notice */}
          {selectedSuspect && (
            <div className="p-3 rounded-xl bg-crime-950/20 border border-crime-500/30 text-slate-300 text-xs mb-6 text-center">
              You are formally accusing <strong className="text-crime-400 font-bold">{selectedSuspect.name}</strong> ({selectedSuspect.role}). This action is final and will seal the case file.
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-noir-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-noir-800 text-slate-300 hover:bg-noir-700 text-xs font-medium"
            >
              Continue Investigating
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSuspectId}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-crime-600 to-rose-700 hover:from-crime-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-crime-700/40 flex items-center space-x-2 disabled:opacity-50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isSubmitting ? 'Sealing Case File...' : 'Submit Final Accusation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
