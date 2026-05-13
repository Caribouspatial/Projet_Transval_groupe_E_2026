import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const API = 'http://localhost:3000/api';

interface Props {
  onSuccess: (token: string) => void;
  onBack: () => void;
}

export const LoginPage = ({ onSuccess, onBack }: Props) => {
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setPassword('');
    setConfirm('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Une erreur est survenue'); return; }
      localStorage.setItem('token', data.token);
      onSuccess(data.token);
    } catch {
      setError('Impossible de joindre le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <nav className="px-8 py-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          Retour
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-[380px]"
        >
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-primary" />
                <span className="text-xs text-muted-foreground font-medium">IoT Quiz</span>
              </div>
              <CardTitle className="text-xl">
                {mode === 'login' ? 'Connexion' : 'Créer un compte'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Accédez au panneau d\'administration'
                  : 'Créez votre compte administrateur'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Toggle */}
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      mode === m
                        ? 'bg-white text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m === 'login' ? 'Se connecter' : 'S\'inscrire'}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    placeholder="Nom d'utilisateur"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>

                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-destructive text-xs"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full gap-2 mt-1" disabled={loading}>
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading
                    ? (mode === 'login' ? 'Connexion…' : 'Création…')
                    : (mode === 'login' ? 'Se connecter' : 'Créer le compte')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
