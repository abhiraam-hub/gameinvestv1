import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Search,
  Lightbulb,
  ShieldAlert,
  ArrowLeft,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { mysteryApi } from '../api/axiosClient';
import { sounds } from '../utils/soundEffects';
import ScoreHUD from '../components/ScoreHUD';
import SuspectCard from '../components/SuspectCard';
import ClueItem from '../components/ClueItem';
import HintSection from '../components/HintSection';
import AccusationModal from '../components/AccusationModal';

export default function InvestigationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mysteryCase, setMysteryCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'narrative', 'suspects', 'evidence', 'hints'
  const [isAccusationModalOpen, setIsAccusationModalOpen] = useState(false);
  const [targetSuspect, setTargetSuspect] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  };

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mysteryApi.getCaseById(id);
      
      // If case was already completed, route to results
      if (data.status === 'completed') {
        navigate(`/results/${id}`);
        return;
      }

      setMysteryCase(data);
    } catch (err) {
      console.error('Failed to load case:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not locate confidential case file. It may have expired or been moved.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverClue = async (clueId) => {
    try {
      const response = await mysteryApi.discoverClue(id, clueId);
      sounds.playClueFound();
      setMysteryCase(response.case);
      showToast(response.message || 'Clue discovered! +5 points added to score.', 'success');
    } catch (err) {
      console.error('Error discovering clue:', err);
      showToast(err.response?.data?.error || 'Failed to examine clue forensics.', 'error');
    }
  };

  const handleUseHint = async () => {
    try {
      const response = await mysteryApi.useHint(id);
      sounds.playHintUsed();
      setMysteryCase(response.case);
      showToast(response.message || 'Police Dispatch Hint revealed! -10 points deducted.', 'warning');
    } catch (err) {
      console.error('Error using hint:', err);
      showToast(err.response?.data?.error || 'No additional hints available.', 'error');
    }
  };

  const handleOpenAccusation = (suspect = null) => {
    setTargetSuspect(suspect);
    setIsAccusationModalOpen(true);
  };

  const handleConfirmAccusation = async (suspectId) => {
    try {
      const response = await mysteryApi.accuse(id, suspectId);
      setIsAccusationModalOpen(false);
      navigate(`/results/${id}`, { state: { verdictData: response.verdict } });
    } catch (err) {
      console.error('Accusation submission failed:', err);
      showToast(err.response?.data?.error || 'Failed to submit accusation warrant.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="font-mono text-sm text-slate-400 uppercase tracking-widest">
            Retrieving Sealed Evidence Dossier...
          </p>
        </div>
      </div>
    );
  }

  if (error || !mysteryCase) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-noir-900 border border-crime-500/40 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-crime-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-slate-100">Case Dossier Unavailable</h2>
        <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Detective Precinct</span>
        </button>
      </div>
    );
  }

  const { title, story, difficulty, suspects = [], clues = [], hints = [], playerProgress = {} } = mysteryCase;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fade-in relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-scale-up max-w-sm flex items-start space-x-3 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : notification.type === 'warning'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
              : 'bg-crime-950/90 border-crime-500/50 text-crime-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : notification.type === 'warning' ? (
            <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-crime-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs font-sans leading-relaxed">{notification.message}</div>
        </div>
      )}

      {/* Case Header Banner */}
      <div className="bg-noir-900 border border-gold-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden case-dossier-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="stamp-classified text-[11px] font-mono uppercase px-2 py-0.5 rounded font-black tracking-widest">
                Active Investigation
              </span>
              <span className="text-[11px] font-mono text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/30">
                {difficulty} Difficulty
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                File: #{mysteryCase._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              {title}
            </h1>
          </div>

          {/* Quick Accuse Action CTA */}
          <div className="shrink-0 flex items-center space-x-3">
            <button
              onClick={() => handleOpenAccusation()}
              className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-crime-600 via-rose-600 to-crime-700 hover:from-crime-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-crime-700/30 hover:shadow-crime-600/40 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Make Final Accusation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Score & Progress HUD */}
      <ScoreHUD
        score={playerProgress.score || 0}
        discoveredCluesCount={playerProgress.discoveredCluesCount || 0}
        totalCluesCount={clues.length}
        hintsUsedCount={playerProgress.hintsUsedCount || 0}
        totalHintsCount={hints.length}
        difficulty={difficulty}
        onOpenAccusation={() => handleOpenAccusation()}
      />

      {/* Tab Navigation Controls */}
      <div className="flex items-center space-x-2 border-b border-noir-800 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Dossiers', icon: Sparkles },
          { id: 'narrative', label: 'Crime Scene Story', icon: FileText },
          { id: 'suspects', label: `Suspects (${suspects.length})`, icon: Users },
          { id: 'evidence', label: `Evidence Board (${clues.length})`, icon: Search },
          { id: 'hints', label: `Dispatch Hints (${hints.length})`, icon: Lightbulb }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center space-x-2 whitespace-nowrap ${
                isActive
                  ? 'bg-gold-500 text-noir-950 font-bold shadow-md shadow-gold-500/20'
                  : 'bg-noir-900 text-slate-400 hover:text-slate-200 border border-noir-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Story / Crime Narrative */}
      {(activeTab === 'all' || activeTab === 'narrative') && (
        <section className="bg-noir-900/80 border border-noir-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-noir-800">
            <FileText className="w-5 h-5 text-gold-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
              The Incident Report & Crime Narrative
            </h2>
          </div>

          <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 font-sans bg-noir-950/60 p-6 rounded-2xl border border-noir-800">
            {story.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Suspects Lineup */}
      {(activeTab === 'all' || activeTab === 'suspects') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Users className="w-5 h-5 text-gold-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                Suspects Under Investigation
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {suspects.length} Persons of Interest
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                onAccuse={(s) => handleOpenAccusation(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Clues / Pinboard Evidence */}
      {(activeTab === 'all' || activeTab === 'evidence') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Search className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-100">
                Crime Scene Evidence Pinboard
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              +{clues.filter((c) => c.discovered).length * 5} Clue Points Earned
            </span>
          </div>

          <div className="cork-texture p-6 sm:p-8 rounded-3xl border border-noir-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clues.map((clue, idx) => (
                <ClueItem
                  key={clue.id || idx}
                  clue={clue}
                  index={idx}
                  onDiscover={handleDiscoverClue}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Hints Consultation */}
      {(activeTab === 'all' || activeTab === 'hints') && (
        <section>
          <HintSection hints={hints} onUseHint={handleUseHint} />
        </section>
      )}

      {/* Accusation Modal */}
      <AccusationModal
        isOpen={isAccusationModalOpen}
        onClose={() => setIsAccusationModalOpen(false)}
        suspects={suspects}
        difficulty={difficulty}
        onConfirmAccusation={handleConfirmAccusation}
        preselectedSuspect={targetSuspect}
      />
    </div>
  );
}
