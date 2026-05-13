import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { Dashboard } from './components/Dashboard';

const decodeRole = (token: string): 'admin' | 'user' => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin' ? 'admin' : 'user';
  } catch {
    return 'user';
  }
};

const getToken = () => localStorage.getItem('token');
const getRole  = (): 'admin' | 'user' => {
  const t = getToken();
  return t ? decodeRole(t) : 'user';
};

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  return getToken() ? <>{children}</> : <Navigate to="/login" replace />;
};

const LandingPageRoute = () => {
  const navigate = useNavigate();
  return <LandingPage onLogin={() => navigate('/login')} />;
};

const LoginRoute = () => {
  const navigate = useNavigate();
  if (getToken()) return <Navigate to="/home" replace />;
  return (
    <LoginPage
      onSuccess={(token) => { localStorage.setItem('token', token); navigate('/home'); }}
      onBack={() => navigate('/')}
    />
  );
};

const HomeRoute = () => {
  const navigate = useNavigate();
  return (
    <RequireAuth>
      <HomePage
        role={getRole()}
        onEnter={(quizId) => navigate('/quiz', { state: { quizId } })}
        onLogout={() => { localStorage.removeItem('token'); navigate('/'); }}
      />
    </RequireAuth>
  );
};

const QuizRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quizId = (location.state as { quizId?: number } | null)?.quizId ?? null;
  return (
    <RequireAuth>
      <Dashboard
        role={getRole()}
        quizId={quizId}
        onBack={() => navigate('/home')}
        onLogout={() => { localStorage.removeItem('token'); navigate('/'); }}
      />
    </RequireAuth>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"      element={<LandingPageRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/home"  element={<HomeRoute />} />
      <Route path="/quiz"  element={<QuizRoute />} />
      <Route path="*"      element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
