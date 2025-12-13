// ============================================
// 📱 MAIN LAYOUT - MOBILE FIRST
// ============================================
import React, { useState } from 'react';
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
  User,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Avatar, Badge } from '../ui';
import { cn } from '../../utils/cn';
import type { Page, Theme } from '../../types';

// ========================================
// NAVIGATION CONFIG
// ========================================
const NAV_ITEMS: Array<{
  id: Page;
  label: string;
  icon: React.ReactNode;
  showInNav: boolean;
}> = [
  { id: 'dashboard', label: 'Inicio', icon: <Home className="w-5 h-5" />, showInNav: true },
  { id: 'transactions', label: 'Movimientos', icon: <ArrowLeftRight className="w-5 h-5" />, showInNav: true },
  { id: 'budgets', label: 'Presupuestos', icon: <PiggyBank className="w-5 h-5" />, showInNav: true },
  { id: 'goals', label: 'Metas', icon: <Target className="w-5 h-5" />, showInNav: true },
  { id: 'reports', label: 'Reportes', icon: <BarChart3 className="w-5 h-5" />, showInNav: true },
];

const THEME_OPTIONS: Array<{ id: Theme; label: string; icon: React.ReactNode; color: string }> = [
  { id: 'dark', label: 'Oscuro (Cyan)', icon: <Moon className="w-4 h-4" />, color: '#05BFDB' },
  { id: 'pink', label: 'Rosado', icon: <Palette className="w-4 h-4" />, color: '#ec4899' },
  { id: 'purple', label: 'Morado', icon: <Palette className="w-4 h-4" />, color: '#a855f7' },
  { id: 'light', label: 'Claro', icon: <Sun className="w-4 h-4" />, color: '#f8fafc' },
];

// ========================================
// MAIN LAYOUT
// ========================================
interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, activePage, setActivePage, notifications, theme, setTheme, logout } = useStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const themeColors = getThemeColors(theme);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg"
      >
        Saltar al contenido
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-700/80 backdrop-blur-lg border-b border-white/10 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5 text-white/80" />
            </button>
            <h1 className="text-lg font-bold gradient-text">
              Smarter Investment
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Cambiar tema"
                style={{ color: themeColors.primary }}
              >
                <Palette className="w-5 h-5" />
              </button>
              
              {/* Theme Dropdown */}
              <AnimatePresence>
                {showThemeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-12 w-48 bg-dark-500 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
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
                          theme === option.id ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        <span className="text-sm text-white/80">{option.label}</span>
                        {theme === option.id && (
                          <span className="ml-auto text-xs" style={{ color: option.color }}>✓</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell className="w-5 h-5 text-white/80" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-danger-500 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* AI Assistant */}
            <button
              onClick={() => setActivePage('assistant')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                activePage === 'assistant' ? 'bg-primary-500/20 text-primary-400' : 'hover:bg-white/10 text-white/80'
              )}
              aria-label="Asistente AI"
            >
              <Bot className="w-5 h-5" />
            </button>

            {/* Avatar */}
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dark-700/95 backdrop-blur-lg border-t border-white/10 safe-bottom lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.filter(item => item.showInNav).map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]',
                activePage === item.id
                  ? `bg-[${themeColors.primary}]/20 text-[${themeColors.primary}]`
                  : 'text-white/50 hover:text-white/80'
              )}
              style={activePage === item.id ? { color: themeColors.primary } : undefined}
              aria-label={item.label}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-dark-700 border-r border-white/10 z-50 flex flex-col"
            >
              {/* User Info */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={user?.photoURL}
                    name={user?.displayName || user?.email || 'U'}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {user?.displayName || 'Usuario'}
                    </p>
                    <p className="text-sm text-white/50 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id);
                        setShowSidebar(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                        activePage === item.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                  
                  {/* Settings */}
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setShowSidebar(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left',
                      activePage === 'settings'
                        ? 'bg-primary-500/20 text-primary-400'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Configuración</span>
                  </button>
                </div>
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger-400 hover:bg-danger-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Cerrar Sesión</span>
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-dark-700 border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Notificaciones</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 mx-auto text-white/20 mb-4" />
                    <p className="text-white/50">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 rounded-xl border-l-4',
                          notification.isRead ? 'bg-white/5 border-white/20' : 'bg-primary-500/10 border-primary-500'
                        )}
                      >
                        <p className="font-medium text-white text-sm">{notification.title}</p>
                        <p className="text-white/60 text-xs mt-1">{notification.message}</p>
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
