import { LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLogout: () => void;
}

export const BottomNav = ({ onLogout }: Props) => {
  const navigate = useNavigate();
  return (
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-border/80 shadow-xl shadow-black/8 px-4 py-3.5 rounded-full text-sm whitespace-nowrap">
    <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted text-xs font-medium">
      <Home size={12} />
      Accueil
    </button>
    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted text-xs font-medium"
    >
      <LogOut size={12} />
      Déconnexion
    </button>
  </nav>
  );
};
