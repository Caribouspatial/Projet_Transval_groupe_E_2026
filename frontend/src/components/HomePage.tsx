import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Cpu, Globe, FlaskConical, LucideIcon } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { BottomNav } from './BottomNav';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface Props {
  role: 'admin' | 'user';
  onEnter?: (quizId: number) => void;
  onLogout: () => void;
}

interface QuizApi {
  id: number;
  title: string;
  description: string;
  icon: string;
  is_active: boolean;
  question_count: number;
}

const getUsername = () => {
  try {
    const t = localStorage.getItem('token')!;
    return JSON.parse(atob(t.split('.')[1])).username as string;
  } catch { return 'vous'; }
};

const ICON_MAP: Record<string, LucideIcon> = {
  Zap, Globe, Cpu, FlaskConical,
};

const COLOR_MAP: Record<string, string> = {
  Zap:          'bg-blue-500/10 text-blue-500',
  Globe:        'bg-green-500/10 text-green-500',
  Cpu:          'bg-violet-500/10 text-violet-500',
  FlaskConical: 'bg-orange-500/10 text-orange-500',
};

const STATUS_CFG: Record<string, { label: string; dot: string; cls: string }> = {
  WAITING:  { label: 'En attente', dot: 'bg-amber-400', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  ACTIVE:   { label: 'En cours',   dot: 'bg-green-500', cls: 'text-green-600 bg-green-50 border-green-200' },
  FINISHED: { label: 'Terminé',    dot: 'bg-blue-400',  cls: 'text-blue-600 bg-blue-50 border-blue-200'   },
};

export const HomePage = ({ role, onEnter, onLogout }: Props) => {
  const username = getUsername();
  const [status, setStatus]   = useState('WAITING');
  const [quizzes, setQuizzes] = useState<QuizApi[]>([]);

  useEffect(() => {
    apiFetch('/session').then((s) => setStatus(s?.status ?? 'WAITING')).catch(() => {});
    apiFetch('/quizzes').then(setQuizzes).catch(() => {});
  }, []);

  const cfg = STATUS_CFG[status] ?? STATUS_CFG.WAITING;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-28 pt-16 gap-12">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Bonjour, <span className="font-semibold text-foreground">{username}</span> 👋
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-foreground">Choisissez un quiz</h1>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="w-full max-w-3xl"
        >
          <Carousel opts={{ align: 'start', loop: quizzes.length > 3 }} className="w-full">
            <CarouselContent className="-ml-4">
              {quizzes.map((quiz, i) => {
                const Icon = ICON_MAP[quiz.icon] ?? Zap;
                const color = COLOR_MAP[quiz.icon] ?? 'bg-primary/10 text-primary';
                return (
                  <CarouselItem key={quiz.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.06 }}
                      whileHover={quiz.is_active ? { y: -4 } : {}}
                      onClick={quiz.is_active ? () => onEnter(quiz.id) : undefined}
                      className={`rounded-2xl border border-border bg-white shadow-sm p-6 flex flex-col gap-5 h-full transition-all duration-200 ${quiz.is_active ? 'cursor-pointer hover:shadow-md' : 'opacity-55 cursor-not-allowed'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                          <Icon size={20} />
                        </div>
                        {quiz.is_active ? (
                          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                            {cfg.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground border border-border rounded-full px-2.5 py-1">
                            Bientôt
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 flex-1">
                        <h2 className="font-bold text-base">{quiz.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{quiz.description}</p>
                      </div>

                      <div className={`flex items-center justify-between pt-2 border-t border-border/50 ${!quiz.is_active ? 'pointer-events-none' : ''}`}>
                        <span className={`text-sm font-semibold ${quiz.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                          {quiz.is_active ? 'Rejoindre' : 'Indisponible'}
                        </span>
                        {quiz.is_active && (
                          <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center">
                            <ArrowRight size={13} className="text-primary" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-4 shadow-sm" />
            <CarouselNext className="-right-4 shadow-sm" />
          </Carousel>
        </motion.div>

      </div>

      <BottomNav onLogout={onLogout} />
    </div>
  );
};
