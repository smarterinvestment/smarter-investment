// ============================================
// 🚀 APP.TSX - MAIN APPLICATION ENTRY
// ============================================
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore, applyTheme } from './stores/useStore';
import { MainLayout } from './components/layout/MainLayout';
import { AuthPage } from './features/auth/AuthPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { BudgetsPage } from './features/budgets/BudgetsPage';
import { GoalsPage } from './features/goals/GoalsPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AssistantPage } from './features/assistant/AssistantPage';
import { LoadingSpinner } from './components/ui';
import { Toaster } from 'react-hot-toast';

// Page Components Map
const PAGE_COMPONENTS: Record<string, React.FC> = {
  dashboard: DashboardPage,
  transactions: TransactionsPage,
  budgets: BudgetsPage,
  goals: GoalsPage,
  reports: ReportsPage,
  settings: SettingsPage,
  assistant: AssistantPage,
};

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
      } else {
        setUser(null);
      }
      setAuthLoading(false);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  // Show loading screen while initializing
  if (initializing || isAuthLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center animate-pulse">
            <span className="text-4xl">💰</span>
          </div>
          <LoadingSpinner size="lg" />
          <p className="text-white/60 mt-4">Cargando Smarter Investment...</p>
        </div>
      </div>
    );
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
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <PageComponent />
        )}
      </MainLayout>
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

export default App;
