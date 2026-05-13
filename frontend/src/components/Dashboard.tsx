import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, RotateCcw, Zap, Trophy, LogOut, Radio, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { apiFetch } from '../lib/api';
import { useSocket } from '../hooks/useSocket';

interface Question {
  id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  points: number;
}

interface Participant { id: number; pseudo: string; score: number; }

interface SessionState {
  status: 'WAITING' | 'ACTIVE' | 'FINISHED';
  current_question_id: number | null;
  question_index: number;
}

type BuzzState = { playerName: string; correct?: boolean } | null;

const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const;
const LETTERS     = ['A', 'B', 'C', 'D'];
const OPTION_COLORS = [
  { light: 'bg-blue-50 border-blue-300',     text: 'text-blue-700',   badge: 'bg-blue-500'   },
  { light: 'bg-orange-50 border-orange-300', text: 'text-orange-700', badge: 'bg-orange-500' },
  { light: 'bg-violet-50 border-violet-300', text: 'text-violet-700', badge: 'bg-violet-500' },
  { light: 'bg-green-50 border-green-300',   text: 'text-green-700',  badge: 'bg-green-500'  },
];
const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export const Dashboard = ({ onLogout, onBack, role, quizId }: { onLogout: () => void; onBack: () => void; role: 'admin' | 'user'; quizId?: number | null }) => {
  const isAdmin = role === 'admin';
  const [session, setSession]         = useState<SessionState | null>(null);
  const [question, setQuestion]       = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [buzz, setBuzz]               = useState<BuzzState>(null);
  const [loading, setLoading]         = useState<string | null>(null);

  useSocket({
    session_started: (d: any) => { setSession(d.session); setQuestion(d.question); setBuzz(null); },
    new_question:    (d: any) => { setQuestion(d.question); setBuzz(null); },
    session_reset:   ()       => { setSession({ status: 'WAITING', current_question_id: null, question_index: 0 }); setQuestion(null); setLeaderboard([]); setBuzz(null); },
    game_finished:   ()       => { setSession((s) => s ? { ...s, status: 'FINISHED' } : s); setQuestion(null); },
    player_buzzed:   (d: any) => { setBuzz({ playerName: d.playerName }); },
    buzz_timeout:    ()       => { setBuzz(null); },
    score_updated:   (d: any) => { setLeaderboard(d.leaderboard); setBuzz({ playerName: d.playerName, correct: d.correct }); setTimeout(() => setBuzz(null), 3000); },
  });

  useEffect(() => {
    apiFetch('/session').then((s) => {
      setSession(s);
      if (s?.Question) setQuestion(s.Question);
    }).catch(() => {});
    apiFetch('/participants').then(setLeaderboard).catch(() => {});
  }, []);

  const call = async (endpoint: string, key: string) => {
    setLoading(key);
    try {
      const body = key === 'start' && quizId ? { quiz_id: quizId } : undefined;
      const d = await apiFetch(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
      if (d.session)  setSession(d.session);
      if (d.question) setQuestion(d.question);
    } catch (e: any) { alert(e.message); }
    finally { setLoading(null); }
  };

  const status     = session?.status ?? 'WAITING';
  const isActive   = status === 'ACTIVE';
  const isFinished = status === 'FINISHED';

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">

      {/* Header — always visible */}
      <header className="bg-white border-b border-border/60 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
          </button>
          <span className="font-bold text-sm tracking-tight">IoT Quiz</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isActive   ? 'bg-green-50 border-green-200 text-green-700' :
            isFinished ? 'bg-blue-50 border-blue-200 text-blue-700'   :
                         'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isActive ? 'bg-green-500 animate-pulse' : isFinished ? 'bg-blue-500' : 'bg-amber-400'
            }`} />
            {isActive ? 'En cours' : isFinished ? 'Terminée' : 'En attente'}
          </div>
          {isAdmin && (
            <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
              Admin
            </span>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onLogout}>
            <LogOut size={14} />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">

          {/* ── GAME LAYOUT ── */}
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl px-6 py-8 space-y-5"
          >
              {/* Buzz banner */}
              <AnimatePresence>
                {buzz && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    className={`rounded-xl px-5 py-4 flex items-center gap-4 border-2 ${
                      buzz.correct === undefined ? 'bg-primary/5 border-primary/40' :
                      buzz.correct              ? 'bg-green-50 border-green-400'  :
                                                 'bg-red-50 border-red-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      buzz.correct === undefined ? 'bg-primary/10' :
                      buzz.correct              ? 'bg-green-100'  : 'bg-red-100'
                    }`}>
                      {buzz.correct === undefined
                        ? <Radio size={18} className="text-primary" />
                        : buzz.correct
                          ? <CheckCircle2 size={18} className="text-green-600" />
                          : <XCircle size={18} className="text-red-500" />
                      }
                    </div>
                    <div>
                      <p className="font-bold text-sm">{buzz.playerName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {buzz.correct === undefined ? 'A buzzé — en attente de réponse' :
                         buzz.correct               ? 'Bonne réponse !' : 'Mauvaise réponse.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Question + Leaderboard */}
              <div className="grid grid-cols-5 gap-5">

                {/* Question */}
                <motion.div
                  className="col-span-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <AnimatePresence mode="wait">
                    {question ? (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white rounded-xl border border-border/60 overflow-hidden"
                      >
                        <div className="px-6 py-5 border-b border-border/40 flex items-start justify-between gap-4">
                          <h2 className="text-lg font-bold leading-snug">{question.text}</h2>
                          <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                            {question.points} pts
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-5">
                          {LETTERS.map((letter, i) => {
                            const color     = OPTION_COLORS[i];
                            const isCorrect = isAdmin && letter === question.correct_answer;
                            return (
                              <div key={letter} className={`rounded-xl border-2 px-4 py-3.5 flex items-center gap-3 ${
                                isCorrect ? color.light : 'bg-muted/40 border-transparent'
                              }`}>
                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                  isCorrect ? color.badge : 'bg-muted-foreground/30'
                                }`}>{letter}</span>
                                <span className={`text-sm font-medium ${isCorrect ? color.text : 'text-foreground'}`}>
                                  {(question as any)[OPTION_KEYS[i]]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-white rounded-xl border border-border/60 py-20 flex flex-col items-center justify-center gap-3 text-center px-6">
                        {isFinished ? (
                          <>
                            <div className="text-4xl">🏆</div>
                            <p className="font-semibold">Partie terminée !</p>
                            <p className="text-sm text-muted-foreground">Voici le classement final.</p>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl">⏳</div>
                            <p className="font-semibold">En attente du démarrage</p>
                            <p className="text-sm text-muted-foreground">La partie n'a pas encore commencé.</p>
                          </>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Leaderboard */}
                <motion.div
                  className="col-span-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-white rounded-xl border border-border/60">
                    <div className="px-5 py-4 border-b border-border/40 flex items-center gap-2">
                      <Trophy size={15} className="text-amber-500" />
                      <span className="font-bold text-sm">Classement</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {leaderboard.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">Aucun participant</p>
                      ) : leaderboard.map((p, i) => (
                        <motion.div
                          key={p.id}
                          layout
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.12 + i * 0.05 }}
                          className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${
                            i === 0 ? 'bg-amber-50 border-amber-200' :
                            i === 1 ? 'bg-slate-50 border-slate-200' :
                            i === 2 ? 'bg-orange-50 border-orange-200' :
                                      'bg-muted/40 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 text-center text-sm">
                              {i < 3 ? RANK_MEDALS[i] : <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>}
                            </span>
                            <span className="text-sm font-semibold">{p.pseudo}</span>
                          </div>
                          <span className={`text-sm font-bold ${i === 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {p.score} <span className="text-xs font-normal">pts</span>
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons — centered below */}
              <motion.div
                className="flex items-center justify-center gap-3 pt-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                {(status === 'WAITING' || status === 'FINISHED') && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      className="gap-2 px-8 h-11 font-semibold shadow-sm shadow-primary/20"
                      disabled={!!loading}
                      onClick={() => call('/session/start', 'start')}
                    >
                      <SkipForward size={16} />
                      {loading === 'start' ? 'Chargement…' : status === 'FINISHED' ? 'Rejouer' : 'Démarrer'}
                    </Button>
                  </motion.div>
                )}
                {isActive && (
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      className="gap-2 px-8 h-11 font-semibold shadow-sm shadow-primary/20"
                      disabled={!!loading}
                      onClick={() => call('/session/next', 'next')}
                    >
                      <SkipForward size={16} />
                      {loading === 'next' ? 'Chargement…' : 'Question suivante'}
                    </Button>
                  </motion.div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-11 px-5 text-muted-foreground"
                  disabled={!!loading}
                  onClick={() => call('/session/reset', 'reset')}
                >
                  <RotateCcw size={13} />
                  {isFinished ? 'Nouvelle partie' : 'Réinitialiser'}
                </Button>
              </motion.div>
            </motion.div>

        </AnimatePresence>
      </div>
    </div>
  );
};
