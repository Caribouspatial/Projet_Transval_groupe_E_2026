import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  const isLoggedIn = !!localStorage.getItem('token');
  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Animated blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob                      absolute top-[-10%]  left-[-8%]   w-[650px] h-[650px] rounded-full bg-violet-400/30  blur-[60px]" />
        <div className="animate-blob animation-delay-2000 absolute top-[20%]   right-[-12%] w-[550px] h-[550px] rounded-full bg-blue-400/25    blur-[55px]" />
        <div className="animate-blob animation-delay-4000 absolute bottom-[-8%] left-[20%]  w-[600px] h-[600px] rounded-full bg-pink-400/20    blur-[65px]" />
        <div className="animate-blob animation-delay-6000 absolute top-[40%]   left-[55%]  w-[400px] h-[400px] rounded-full bg-indigo-400/25  blur-[50px]" />
      </div>

      {/* Nav */}
      <nav className="relative bg-transparent px-8 py-4 flex items-center justify-between">
        <div />
        {!isLoggedIn && (
          <Button variant="outline" size="sm" onClick={onLogin}>
            Se connecter
          </Button>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-medium text-primary bg-primary/8 border border-primary/20 rounded-full px-3 py-1 mb-6">
            Projet transversal
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
            Quiz interactif<br />
            <span className="text-primary">avec buzzers physiques</span>
          </h1>
          <Button size="lg" className="gap-2 px-8" onClick={onLogin}>
            Jouer
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </section>
    </div>
  );
};
