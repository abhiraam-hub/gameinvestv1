import React, { useState, useEffect } from 'react';
import { Search, Compass, Shield, Sparkles } from 'lucide-react';

const DETECTIVE_QUOTES = [
  "\"When you have eliminated the impossible, whatever remains, however improbable, must be the truth.\" — Arthur Conan Doyle",
  "\"The world is full of obvious things which nobody by any chance ever observes.\" — Sherlock Holmes",
  "\"There is nothing more deceptive than an obvious fact.\" — The Boscombe Valley Mystery",
  "\"Every contact leaves a trace.\" — Edmond Locard (Forensic Principle)",
  "\"An alibi without evidence is merely an echo in an empty room.\""
];

const GENERATION_STEPS = [
  "Structuring crime scene environment & time of event...",
  "Drafting suspect profiles, motives, and conflicting alibis...",
  "Forensically positioning physical clues & fingerprints...",
  "Calibrating detective dispatch hints according to difficulty...",
  "Encrypting true culprit identity and solution..."
];

export default function LoadingDossier({ difficulty = 'Medium', premise = '' }) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % DETECTIVE_QUOTES.length);
    }, 4500);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-noir-900 border border-gold-500/30 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden case-dossier-border">
        {/* Glowing backdrop circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Magnifying Glass */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-500/40 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-700 p-0.5 shadow-xl shadow-gold-500/20 animate-pulse">
            <div className="w-full h-full bg-noir-950 rounded-[14px] flex items-center justify-center">
              <Search className="w-8 h-8 text-gold-400" />
            </div>
          </div>
        </div>

        <span className="text-xs font-mono uppercase tracking-widest text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/30 inline-block mb-3">
          Gemini 2.5 Flash Case Synthesis
        </span>

        <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-100 mb-2">
          Assembling Mystery Dossier
        </h2>

        <p className="text-xs font-mono text-slate-400 mb-6 truncate max-w-md mx-auto">
          Premise: "{premise}" ({difficulty} Difficulty)
        </p>

        {/* Generation Steps */}
        <div className="bg-noir-950/70 p-4 rounded-2xl border border-noir-800 text-left mb-6 space-y-2.5">
          {GENERATION_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center space-x-2.5 text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  idx < stepIndex
                    ? 'bg-emerald-400'
                    : idx === stepIndex
                    ? 'bg-gold-400 animate-ping'
                    : 'bg-slate-700'
                }`}
              />
              <span
                className={`${
                  idx <= stepIndex ? 'text-slate-200' : 'text-slate-600'
                } transition-colors duration-300`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Noir Detective Quote */}
        <div className="min-h-[50px] flex items-center justify-center">
          <p className="text-xs italic font-serif text-slate-400 leading-relaxed transition-opacity duration-500">
            {DETECTIVE_QUOTES[quoteIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
