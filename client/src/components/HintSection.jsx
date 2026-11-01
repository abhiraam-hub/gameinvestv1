import React, { useState } from 'react';
import { HelpCircle, AlertOctagon, Lightbulb, Lock, CheckCircle, ChevronRight } from 'lucide-react';

export default function HintSection({ hints = [], onUseHint, disabled = false }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const unusedCount = hints.filter((h) => !h.used).length;
  const usedCount = hints.filter((h) => h.used).length;

  const handleConfirmRequest = async () => {
    setIsRequesting(true);
    try {
      await onUseHint();
      setShowConfirmModal(false);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-noir-900/80 border border-noir-700/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-noir-800">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>Detective Dispatch Consultation</span>
          </h3>
          <p className="text-xs text-slate-400">
            Progressive advisory deductions from Senior Detective Archives.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">
            Available: <strong className="text-amber-400">{unusedCount}</strong> / {hints.length}
          </span>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={disabled || unusedCount === 0 || isRequesting}
            className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-noir-950 text-xs font-bold font-mono border border-amber-500/30 hover:border-amber-400 transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Request Hint (-10 pts)</span>
          </button>
        </div>
      </div>

      {/* Hints List */}
      <div className="space-y-3">
        {hints.map((hint, idx) => (
          <div
            key={hint.id || idx}
            className={`rounded-xl p-4 transition-all border ${
              hint.used
                ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                : 'bg-noir-950/40 border-noir-800 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold flex items-center space-x-1.5">
                {hint.used ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">Consultation #{idx + 1} Revealed</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">Consultation #{idx + 1} (Locked)</span>
                  </>
                )}
              </span>
              {hint.used && (
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  -10 pts applied
                </span>
              )}
            </div>

            {hint.used ? (
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                💡 {hint.text}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Advisory note is currently confidential. Request from dispatch to unlock.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Hint Request Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-noir-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-slate-100 mb-2">
              Request Senior Detective Hint?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Accessing confidential police files will reveal critical guidance toward identifying the culprit, but incurs an immediate penalty of <strong className="text-amber-400 font-mono font-bold">-10 points</strong> from your investigation score.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-noir-800 text-slate-300 hover:bg-noir-700 text-xs font-medium"
              >
                Cancel, I'll Deduce It
              </button>
              <button
                type="button"
                onClick={handleConfirmRequest}
                disabled={isRequesting}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-noir-950 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
              >
                <span>{isRequesting ? 'Unlocking...' : 'Accept -10 Pts Penalty'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
