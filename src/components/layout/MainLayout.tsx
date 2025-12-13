// ============================================
// 📱 MAIN LAYOUT - PREMIUM NEON DESIGN
// Navigation: Bottom bar + Sidebar
// ============================================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ArrowLeftRight,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  Bot,
  Bell,
  Menu,
  X,
  LogOut,
  RefreshCw,
  Palette,
  Moon,
  Sun,
  Heart,
  Sparkles,
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { FloatingParticles } from '../effects/FloatingParticles';
import { Avatar, Badge } from '../ui';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../utils/i18n';
import type { Page, Theme } from '../../types';

// ========================================
// NAVIGATION CONFIG
// ========================================
// Bottom Navigation (5 main items)
const BOTTOM_NAV_ITEMS: Array<{
  id: Page;
  labelKey: keyof ReturnType<typeof useTranslation>['t']['nav'];
  icon: React.ReactNode;
}> = [
  { id: 'dashboard', labelKey: 'home', icon: <Home className="w-5 h-5" /> },
  { id: 'transactions', labelKey: 'transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: 'budgets', labelKey: 'budgets', icon: <PiggyBank className="w-5 h-5" /> },
  { id: 'goals', labelKey: 'goals', icon: <Target className="w-5 h-5" /> },
  { id: 'reports', labelKey: 'reports', icon: <BarChart3 className="w-5 h-5" /> },
];

// Sidebar Navigation (all items)
const SIDEBAR_NAV_ITEMS: Array<{
  id: Page;
  labelKey: keyof ReturnType<typeof useTranslation>['t']['nav'];
  icon: React.ReactNode;
}> = [
  { id: 'dashboard', labelKey: 'home', icon: <Home className="w-5 h-5" /> },
  { id: 'transactions', labelKey: 'transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
  { id: 'budgets', labelKey: 'budgets', icon: <PiggyBank className="w-5 h-5" /> },
  { id: 'goals', labelKey: 'goals', icon: <Target className="w-5 h-5" /> },
  { id: 'reports', labelKey: 'reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'recurring', labelKey: 'recurring', icon: <RefreshCw className="w-5 h-5" /> },
  { id: 'assistant', labelKey: 'assistant', icon: <Bot className="w-5 h-5" /> },
];

// Theme Options
const THEME_OPTIONS: Array<{ id: Theme; labelKey: string; icon: React.ReactNode; color: string }> = [
  { id: 'dark', labelKey: 'Oscuro (Cyan)', icon: <Moon className="w-4 h-4" />, color: '#05BFDB' },
  { id: 'pink', labelKey: 'Rosado', icon: <Heart className="w-4 h-4" />, color: '#ec4899' },
  { id: 'purple', labelKey: 'Morado', icon: <Sparkles className="w-4 h-4" />, color: '#a855f7' },
  { id: 'light', labelKey: 'Claro', icon: <Sun className="w-4 h-4" />, color: '#0891b2' },
];

// ========================================
// MAIN LAYOUT COMPONENT
// ========================================
interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, activePage, setActivePage, notifications, theme, setTheme, logout } = useStore();
  const { t } = useTranslation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  // 🔥 IMPORTANT: Load and subscribe to Firebase data
  useFirebaseData();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const themeColors = getThemeColors(theme);
  const isLight = theme === 'light';

  return (
    <div className={cn('min-h-screen flex flex-col', isLight ? 'bg-slate-50' : '')}>
      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
      >
        {t.nav.home}
      </a>

      {/* Header */}
      <header 
        className={cn(
          'sticky top-0 z-40 backdrop-blur-lg border-b safe-top',
          isLight 
            ? 'bg-white/80 border-slate-200' 
            : 'bg-dark-700/80 border-white/10'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className={cn(
                'p-2 rounded-lg transition-colors lg:hidden',
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
              )}
              aria-label="Abrir menú"
            >
              <Menu className={cn('w-5 h-5', isLight ? 'text-slate-600' : 'text-white/80')} />
            </button>
            
            {/* Logo with Neon Effect */}
            <div 
              className="relative rounded-xl overflow-hidden"
              style={{
                boxShadow: `0 0 15px ${themeColors.primary}60, 0 0 30px ${themeColors.primary}30`,
                border: `2px solid ${themeColors.primary}`,
              }}
            >
              <img 
                src="/logo-smarter.jpg" 
                alt="Smarter Investment" 
                className="w-9 h-9 object-cover"
              />
            </div>
            
            <h1 
              className={cn(
                'text-lg font-bold hidden sm:block',
                isLight ? 'text-slate-800' : 'text-white'
              )}
              style={{ 
                textShadow: isLight ? 'none' : `0 0 20px ${themeColors.primary}40` 
              }}
            >
              Smarter Investment
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                )}
                aria-label="Cambiar tema"
                style={{ color: themeColors.primary }}
              >
                <Palette className="w-5 h-5" />
              </button>
              
              {/* Theme Dropdown */}
              <AnimatePresence>
                {showThemeMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowThemeMenu(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn(
                        'absolute right-0 top-12 w-48 border rounded-xl shadow-xl overflow-hidden z-50',
                        isLight 
                          ? 'bg-white border-slate-200' 
                          : 'bg-dark-500 border-white/10'
                      )}
                    >
                      {THEME_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setTheme(option.id);
                            setShowThemeMenu(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                            theme === option.id 
                              ? (isLight ? 'bg-slate-100' : 'bg-white/10') 
                              : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5')
                          )}
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: option.color,
                              boxShadow: `0 0 10px ${option.color}60`,
                            }}
                          />
                          <span className={cn('text-sm', isLight ? 'text-slate-700' : 'text-white/80')}>
                            {option.labelKey}
                          </span>
                          {theme === option.id && (
                            <span className="ml-auto text-xs" style={{ color: option.color }}>✓</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'relative p-2 rounded-lg transition-colors',
                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
              )}
              aria-label="Notificaciones"
            >
              <Bell className={cn('w-5 h-5', isLight ? 'text-slate-600' : 'text-white/80')} />
              {unreadCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                  style={{ 
                    backgroundColor: '#ef4444',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar (Desktop) */}
            <button
              onClick={() => setShowSidebar(true)}
              className="hidden lg:block"
            >
              <Avatar
                src={user?.photoURL}
                name={user?.displayName || user?.email || 'U'}
                size="sm"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav 
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t safe-bottom lg:hidden',
          isLight 
            ? 'bg-white/95 border-slate-200' 
            : 'bg-dark-700/95 border-white/10'
        )}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                activePage === item.id
                  ? ''
                  : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-white/50 hover:text-white/80')
              )}
              style={activePage === item.id ? { 
                color: themeColors.primary,
                backgroundColor: `${themeColors.primary}20`,
              } : undefined}
              aria-label={t.nav[item.labelKey]}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{t.nav[item.labelKey]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 w-72 border-r z-50 flex flex-col',
                isLight 
                  ? 'bg-white border-slate-200' 
                  : 'bg-dark-700 border-white/10'
              )}
            >
              {/* User Info */}
              <div className={cn(
                'p-6 border-b',
                isLight ? 'border-slate-200' : 'border-white/10'
              )}>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user?.photoURL}
                    name={user?.displayName || user?.email || 'U'}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-semibold truncate', isLight ? 'text-slate-800' : 'text-white')}>
                      {user?.displayName || 'Usuario'}
                    </p>
                    <p className={cn('text-sm truncate', isLight ? 'text-slate-500' : 'text-white/50')}>
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className={cn(
                      'p-2 rounded-lg',
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                    )}
                  >
                    <X className={cn('w-5 h-5', isLight ? 'text-slate-400' : 'text-white/60')} />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  {SIDEBAR_NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setShowSidebar(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                        activePage === item.id
                          ? ''
                          : (isLight 
                              ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-800' 
                              : 'text-white/70 hover:bg-white/5 hover:text-white')
                      )}
                      style={activePage === item.id ? {
                        backgroundColor: `${themeColors.primary}20`,
                        color: themeColors.primary,
                      } : undefined}
                    >
                      {item.icon}
                      <span className="font-medium">{t.nav[item.labelKey]}</span>
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div className={cn('my-4 border-t', isLight ? 'border-slate-200' : 'border-white/10')} />

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setShowSidebar(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                      activePage === 'settings'
                        ? ''
                        : (isLight 
                            ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-800' 
                            : 'text-white/70 hover:bg-white/5 hover:text-white')
                    )}
                    style={activePage === 'settings' ? {
                      backgroundColor: `${themeColors.primary}20`,
                      color: themeColors.primary,
                    } : undefined}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">{t.nav.settings}</span>
                  </button>
                </div>
              </nav>

              {/* Logout */}
              <div className={cn('p-4 border-t', isLight ? 'border-slate-200' : 'border-white/10')}>
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-400 hover:bg-danger-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t.common.logout}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={cn(
                'fixed right-0 top-0 bottom-0 w-full max-w-sm border-l z-50 flex flex-col',
                isLight 
                  ? 'bg-white border-slate-200' 
                  : 'bg-dark-700 border-white/10'
              )}
            >
              <div className={cn(
                'flex items-center justify-between p-4 border-b',
                isLight ? 'border-slate-200' : 'border-white/10'
              )}>
                <h2 className={cn('text-lg font-bold', isLight ? 'text-slate-800' : 'text-white')}>
                  Notificaciones
                </h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={cn(
                    'p-2 rounded-lg',
                    isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'
                  )}
                >
                  <X className={cn('w-5 h-5', isLight ? 'text-slate-400' : 'text-white/60')} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className={cn('w-12 h-12 mx-auto mb-4', isLight ? 'text-slate-300' : 'text-white/20')} />
                    <p className={cn(isLight ? 'text-slate-500' : 'text-white/50')}>
                      No tienes notificaciones
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 rounded-xl border-l-4',
                          notification.isRead 
                            ? (isLight ? 'bg-slate-50 border-slate-300' : 'bg-white/5 border-white/20')
                            : ''
                        )}
                        style={!notification.isRead ? {
                          backgroundColor: `${themeColors.primary}10`,
                          borderLeftColor: themeColors.primary,
                        } : undefined}
                      >
                        <p className={cn('font-medium text-sm', isLight ? 'text-slate-800' : 'text-white')}>
                          {notification.title}
                        </p>
                        <p className={cn('text-xs mt-1', isLight ? 'text-slate-500' : 'text-white/60')}>
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
