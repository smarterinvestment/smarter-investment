// ============================================
// 🚀 APP.TSX - MAIN APPLICATION ENTRY
// Premium Neon Design with Theme Support
// ============================================
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore, applyTheme, getThemeColors } from './stores/useStore';
import { MainLayout } from './components/layout/MainLayout';
import { AuthPage } from './features/auth/AuthPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { GoalsPage } from './features/goals/GoalsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AssistantPage } from './features/assistant/AssistantPage';
import { RecurringPage } from './features/recurring/RecurringPage';
import { MorePage } from './features/more/MorePage';
import { AdvancedAnalyticsPage } from './features/analytics/AdvancedAnalyticsPage';
import { OnboardingTutorial } from './components/tutorial/OnboardingTutorial';
import { Toaster } from 'react-hot-toast';

// Page Components Map
const PAGE_COMPONENTS: Record<string, React.FC> = {
  dashboard: DashboardPage,
  transactions: TransactionsPage,
  budgets: BudgetsPage,
  goals: GoalsPage,
  reports: ReportsPage,
  'advanced-analytics': AdvancedAnalyticsPage,
  settings: SettingsPage,
  assistant: AssistantPage,
  recurring: RecurringPage,
  more: MorePage,
};

// ============================================
// PREMIUM NEON LOADING SCREEN
// ============================================
const PremiumLoadingScreen: React.FC<{ theme: string }> = ({ theme }) => {
  // Theme-specific styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'pink':
        return {
          bg: 'radial-gradient(ellipse at center, #2d1025 0%, #1a0a14 50%, #000000 100%)',
          neonColor: '#ec4899',
          neonGlow: '#ff69b4',
          glowIntense: 'rgba(236, 72, 153, 0.8)',
          glowMedium: 'rgba(236, 72, 153, 0.4)',
          glowSoft: 'rgba(236, 72, 153, 0.2)',
          particleColor: 'rgba(236, 72, 153, 0.6)',
        };
      case 'purple':
        return {
          bg: 'radial-gradient(ellipse at center, #2d1b4e 0%, #1a1033 50%, #000000 100%)',
          neonColor: '#a855f7',
          neonGlow: '#c084fc',
          glowIntense: 'rgba(168, 85, 247, 0.8)',
          glowMedium: 'rgba(168, 85, 247, 0.4)',
          glowSoft: 'rgba(168, 85, 247, 0.2)',
          particleColor: 'rgba(168, 85, 247, 0.6)',
        };
      case 'turquoise':
        return {
          bg: 'radial-gradient(ellipse at center, #042f2e 0%, #021a19 50%, #000000 100%)',
          neonColor: '#14b8a6',
          neonGlow: '#2dd4bf',
          glowIntense: 'rgba(20, 184, 166, 0.8)',
          glowMedium: 'rgba(20, 184, 166, 0.4)',
          glowSoft: 'rgba(20, 184, 166, 0.2)',
          particleColor: 'rgba(20, 184, 166, 0.6)',
        };
      default: // dark/cyan
        return {
          bg: 'radial-gradient(ellipse at center, #062a3a 0%, #011520 50%, #000000 100%)',
          neonColor: '#05BFDB',
          neonGlow: '#00fff7',
          glowIntense: 'rgba(5, 191, 219, 0.8)',
          glowMedium: 'rgba(5, 191, 219, 0.4)',
          glowSoft: 'rgba(5, 191, 219, 0.2)',
          particleColor: 'rgba(5, 191, 219, 0.6)',
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div 
      className="min-h-screen flex items-center justify-center overflow-hidden relative"
      style={{ background: styles.bg }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: styles.particleColor,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${styles.particleColor}`,
            }}
          />
        ))}
      </div>

      {/* Radial Glow Behind Logo */}
      <div 
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ backgroundColor: styles.neonColor }}
      />

      {/* Main Logo Container */}
      <div className="relative z-10 text-center">
        {/* Outer Glow Ring */}
        <div 
          className="absolute inset-0 -m-4 rounded-3xl animate-pulse"
          style={{
            boxShadow: `
              0 0 30px ${styles.glowMedium},
              0 0 60px ${styles.glowSoft},
              0 0 90px ${styles.glowSoft}
            `,
          }}
        />
        
        {/* Logo Container with Neon Border */}
        <div 
          className="relative p-2 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${styles.neonColor}40, transparent, ${styles.neonColor}40)`,
          }}
        >
          {/* Inner Neon Frame */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{
              boxShadow: `
                0 0 20px ${styles.glowIntense},
                inset 0 0 20px ${styles.glowMedium},
                0 0 40px ${styles.glowMedium},
                0 0 80px ${styles.glowSoft}
              `,
              border: `2px solid ${styles.neonColor}`,
            }}
          >
            {/* Logo Image */}
            <img 
              src="/logo-smarter.jpg" 
              alt="Smarter Investment" 
              className="w-28 h-28 md:w-36 md:h-36 object-cover"
              style={{
                filter: `drop-shadow(0 0 10px ${styles.glowMedium})`,
              }}
            />
            
            {/* Shimmer Effect */}
            <div 
              className="absolute inset-0 animate-shimmer"
              style={{
                background: `linear-gradient(
                  90deg, 
                  transparent, 
                  ${styles.neonColor}30, 
                  transparent
                )`,
                backgroundSize: '200% 100%',
              }}
            />
          </div>
        </div>

        {/* App Name with Glow */}
        <h1 
          className="mt-8 text-2xl md:text-3xl font-bold tracking-wide"
          style={{
            color: '#ffffff',
            textShadow: `0 0 20px ${styles.neonColor}, 0 0 40px ${styles.glowMedium}`,
          }}
        >
          Smarter Investment
        </h1>

        {/* Tagline */}
        <p 
          className="mt-2 text-sm tracking-widest uppercase"
          style={{ color: styles.neonColor }}
        >
          Tu gestor financiero personal
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* Animated Dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{
                backgroundColor: styles.neonColor,
                boxShadow: `0 0 10px ${styles.neonColor}, 0 0 20px ${styles.glowMedium}`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <p 
          className="mt-4 text-sm animate-pulse"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Cargando...
        </p>
      </div>

      {/* Bottom Decorative Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${styles.neonColor}, transparent)`,
          boxShadow: `0 0 20px ${styles.neonColor}`,
        }}
      />

      {/* CSS for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-10px) translateX(-10px); 
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-30px) translateX(5px); 
            opacity: 0.6;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const { 
    user, 
    isAuthLoading, 
    setUser, 
    setAuthLoading, 
    theme, 
    activePage,
    isLoading 
  } = useStore();

  const [initializing, setInitializing] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen tutorial
  const checkTutorialStatus = (userId: string) => {
    const tutorialKey = `smarter-tutorial-completed-${userId}`;
    return localStorage.getItem(tutorialKey) === 'true';
  };

  // Mark tutorial as completed
  const completeTutorial = () => {
    if (user?.uid) {
      const tutorialKey = `smarter-tutorial-completed-${user.uid}`;
      localStorage.setItem(tutorialKey, 'true');
    }
    setShowTutorial(false);
  };

  // Function to show tutorial again (called from settings/more)
  const openTutorial = () => {
    setShowTutorial(true);
  };

  // Expose openTutorial globally for other components
  useEffect(() => {
    (window as any).openTutorial = openTutorial;
    return () => {
      delete (window as any).openTutorial;
    };
  }, []);

  // Apply theme on mount and changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
        
        // Check if new user needs tutorial
        const hasSeenTutorial = checkTutorialStatus(firebaseUser.uid);
        if (!hasSeenTutorial) {
          // Show tutorial after a brief delay
          setTimeout(() => setShowTutorial(true), 2000);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
      // Add small delay for premium effect
      setTimeout(() => setInitializing(false), 1500);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  // Show premium loading screen while initializing
  if (initializing || isAuthLoading) {
    return <PremiumLoadingScreen theme={theme} />;
  }

  // Show auth page if not logged in
  if (!user) {
    return (
      <>
        <AuthPage />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </>
    );
  }

  // Get current page component
  const PageComponent = PAGE_COMPONENTS[activePage] || DashboardPage;

  return (
    <>
      <MainLayout>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-xl animate-pulse"
                style={{
                  boxShadow: `0 0 30px ${getThemeColors(theme).primary}`,
                  border: `2px solid ${getThemeColors(theme).primary}`,
                }}
              >
                <img src="/logo-smarter.jpg" alt="" className="w-full h-full rounded-xl object-cover" />
              </div>
              <p className="text-white/60">Cargando...</p>
            </div>
          </div>
        ) : (
          <PageComponent />
        )}
      </MainLayout>
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={completeTutorial}
      />
      
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;// Force rebuild
