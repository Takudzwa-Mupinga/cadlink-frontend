import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { imageSrc } from './services/api';
import Dashboard from './components/Dashboard';
import JobMarket from './components/JobMarket';
import Network from './components/Network';
import Studio from './components/Studio';
import Academy from './components/Academy';
import Finance from './components/Finance';
import Resources from './components/Resources';
import Profile from './components/Profile';
import Community from './components/Community';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Calendar from './components/Calendar';
import ProjectHub from './components/ProjectHub';
import CommandPalette from './components/CommandPalette';
import Auth from './components/Auth';
import DesignerOnboarding from './components/DesignerOnboarding';
import ClientOnboarding from './components/ClientOnboarding';
import Messages from './components/Messages';
import ToastContainer from './components/Toast';
import CloudDrive from './components/CloudDrive';
import Admin from './components/Admin';
import HelpModal from './components/HelpModal';
import ShortcutsModal from './components/ShortcutsModal';
import OnboardingTour from './components/OnboardingTour';
import { ToastNotification } from './types';
import { HelpCircle } from 'lucide-react';
import { UserProvider, useCurrentUser } from './contexts/UserContext';

const AppInner: React.FC = () => {
  const { profile, clientProfile, role: ctxRole, email: ctxEmail, firstName, lastName, refetch: refetchUser } = useCurrentUser();
  const chipName =
    (ctxRole === 'CLIENT'
      ? clientProfile?.companyName || profile?.displayName
      : [firstName, lastName].filter(Boolean).join(' ') || profile?.displayName)
    || ctxEmail || localStorage.getItem('email') || '';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<'designer' | 'client' | null>(null);

  // Default tab
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dmTarget, setDmTarget] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const [studioMode, setStudioMode] = useState<
    'chat' | 'meeting' | 'board' | 'files' | 'dream' | 'whiteboard'
  >('files');

  // Theme State — persisted to localStorage, defaults to system preference
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
    return 'system';
  });

  // Restore auth session on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setIsAuthenticated(true);

      if (role === 'ADMIN') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = (dark: boolean) => dark ? root.classList.add('dark') : root.classList.remove('dark');
      apply(mq.matches);
      const handler = (e: MediaQueryListEvent) => apply(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  // First time user onboarding
  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenTour = localStorage.getItem('cadlink_tour_seen');

      if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1000);
      }
    }
  }, [isAuthenticated]);

  const handleCloseTour = () => {
    setShowTour(false);
    localStorage.setItem('cadlink_tour_seen', 'true');
  };

  const handleRestartTour = () => {
    setIsHelpOpen(false);
    setShowTour(true);
  };


  // Toast State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (
    type: 'success' | 'error' | 'info',
    message: string
  ) => {
    const newToast = {
      id: Date.now().toString(),
      type,
      message,
    };

    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Timer State
  const [timerState, setTimerState] = useState({
    isRunning: false,
    elapsedTime: 0,
    project: 'HVAC Layout - BuildTech',
  });

  // Global Timer Logic
  useEffect(() => {
    let interval: number;

    if (timerState.isRunning) {
      interval = window.setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
    }

    return () => window.clearInterval(interval);
  }, [timerState.isRunning]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();

        if (isAuthenticated) {
          setIsPaletteOpen((prev) => !prev);
        }
      }

      if (
        e.key === '?' &&
        !e.target?.toString().includes('Input') &&
        !e.target?.toString().includes('TextArea')
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const handleStartProject = (project: string) => {
    setTimerState({
      isRunning: true,
      elapsedTime: 0,
      project,
    });

    addToast('success', `Started tracking: ${project}`);
    setActiveTab('dashboard');
  };

  const handleNavigateToMessage = (userId: string) => {
    setDmTarget(userId);
    setActiveTab('messages');
  };

  const handleStartCall = () => {
    setStudioMode('meeting');
    setActiveTab('studio');

    addToast('info', 'Starting secure video session...');
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('auth');

    setIsAuthenticated(false);
    setActiveTab('dashboard');
    refetchUser();

    addToast('success', 'Logged out successfully');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            timerState={timerState}
            onToggleTimer={() =>
              setTimerState((prev) => ({
                ...prev,
                isRunning: !prev.isRunning,
              }))
            }
            onProjectChange={(p) =>
              setTimerState((prev) => ({
                ...prev,
                project: p,
              }))
            }
            onNavigate={setActiveTab}
          />
        );

      case 'messages':
        return (
          <Messages
            initialUserId={dmTarget}
            onClearInitialUser={() => setDmTarget(null)}
            onStartCall={handleStartCall}
          />
        );

      case 'market':
        return <JobMarket onStartProject={handleStartProject} onNavigate={setActiveTab} />;

      case 'network':
        return <Network onMessage={handleNavigateToMessage} />;

      case 'community':
        return <Community />;

      case 'studio':
        return <Studio initialMode={studioMode} />;

      case 'schedule':
        return <Calendar />;

      case 'finance':
        return <Finance />;

      case 'resources':
        return <Resources />;

      case 'learn':
        return <Academy />;

      case 'profile':
        return <Profile />;

      case 'drive':
        return <CloudDrive />;

      case 'settings':
        return (
          <Settings
            theme={theme}
            onSetTheme={setTheme}
            onLogout={handleLogout}
          />
        );

      case 'notifications':
        return <Notifications />;

      case 'projects':
        return <ProjectHub onNavigate={setActiveTab} />;

      case 'admin':
        return <Admin />;

      default:
        return (
          <Dashboard
            timerState={timerState}
            onToggleTimer={() =>
              setTimerState((prev) => ({
                ...prev,
                isRunning: !prev.isRunning,
              }))
            }
            onProjectChange={(p) =>
              setTimerState((prev) => ({
                ...prev,
                project: p,
              }))
            }
            onNavigate={setActiveTab}
          />
        );
    }
  };

  const handleLogin = (role: string) => {
    setIsAuthenticated(true);
    if (role === 'ADMIN') setActiveTab('admin');
    else setActiveTab('dashboard');
    refetchUser();
    addToast('success', 'Welcome back!');
  };

  const handleRegisterDesigner = (_role: string) => {
    setIsAuthenticated(true);
    setShowOnboarding('designer');
    setActiveTab('dashboard');
    refetchUser();
  };

  const handleRegisterClient = (_role: string) => {
    setIsAuthenticated(true);
    setShowOnboarding('client');
    setActiveTab('dashboard');
    refetchUser();
  };

  // ONBOARDING SCREENS
  if (showOnboarding === 'designer') {
    return (
      <DesignerOnboarding
        onComplete={() => {
          setShowOnboarding(null);
          setActiveTab('market');
          refetchUser();
          addToast('success', 'Profile ready! Browse open contracts below.');
        }}
      />
    );
  }

  if (showOnboarding === 'client') {
    return (
      <ClientOnboarding
        onComplete={() => {
          setShowOnboarding(null);
          setActiveTab('market');
          refetchUser();
          addToast('success', 'Account ready! Post your first contract below.');
        }}
      />
    );
  }

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <Auth
        onLogin={handleLogin}
        onRegisterDesigner={handleRegisterDesigner}
        onRegisterClient={handleRegisterClient}
      />
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-cad-dark text-cad-text flex overflow-hidden selection:bg-cad-accent/30 transition-colors duration-300 relative font-sans">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse-slow"></div>

        <div
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[150px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>

        <div className="bg-noise absolute inset-0 opacity-[0.03]"></div>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() =>
          setIsSidebarCollapsed(!isSidebarCollapsed)
        }
      />

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 relative h-full overflow-hidden bg-transparent transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-10 ${
          isSidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-72'
        }`}
      >
        {renderContent()}

        {/* HELP BUTTON */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed bottom-6 right-6 z-[50] w-10 h-10 bg-cad-panel border border-cad-border rounded-full shadow-2xl flex items-center justify-center text-cad-muted hover:text-cad-text hover:border-cad-accent hover:shadow-glow-accent transition-all active:scale-95"
          title="Help & Support"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* PROFILE CHIP */}
        <button
          onClick={() => setActiveTab('profile')}
          className="fixed top-4 right-5 z-[50] flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cad-panel border border-cad-border hover:border-cad-accent transition-all shadow-sm group"
        >
          {profile?.avatarUrl ? (
            <img src={imageSrc(profile.avatarUrl)} alt="avatar" className="w-7 h-7 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cad-accent to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {(chipName || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-cad-muted group-hover:text-cad-text transition-colors max-w-[120px] truncate hidden sm:block">
            {chipName}
          </span>
        </button>
      </main>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onNavigate={setActiveTab}
      />

      <ToastContainer
        notifications={toasts}
        removeNotification={removeToast}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onRestartTour={handleRestartTour}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <OnboardingTour
        isOpen={showTour}
        onClose={handleCloseTour}
      />
    </div>
  );
};

const App: React.FC = () => (
  <UserProvider>
    <AppInner />
  </UserProvider>
);

export default App;