// ============================================
// 📋 MORE PAGE - CONFIGURACIÓN Y EXTRAS
// ============================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, RefreshCw, Bell, CreditCard, Download, Upload, 
  Shield, HelpCircle, LogOut, ChevronRight, User, Palette,
  Globe, DollarSign, Repeat, TrendingUp, TrendingDown,
  FileText, PieChart, Calendar, Sparkles, Moon, Heart
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Modal, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import type { Theme, Currency, Language } from '../../types';

// Menu Items
const MENU_SECTIONS = [
  {
    title: 'Transacciones Recurrentes',
    items: [
      { id: 'recurring-income', icon: TrendingUp, label: 'Ingresos Recurrentes', description: 'Salarios, rentas, dividendos', color: '#22C55E', page: 'recurring' },
      { id: 'recurring-expense', icon: TrendingDown, label: 'Gastos Recurrentes', description: 'Suscripciones, facturas, pagos', color: '#EF4444', page: 'recurring' },
    ]
  },
  {
    title: 'Análisis y Reportes',
    items: [
      { id: 'reports', icon: PieChart, label: 'Reportes Detallados', description: 'Gráficos y estadísticas', page: 'reports' },
      { id: 'export', icon: Download, label: 'Exportar Datos', description: 'CSV, PDF, Excel', action: 'export' },
      { id: 'import', icon: Upload, label: 'Importar Datos', description: 'Desde CSV o Excel', action: 'import' },
    ]
  },
  {
    title: 'Configuración Rápida',
    items: [
      { id: 'theme', icon: Palette, label: 'Tema Visual', description: 'Colores y apariencia', action: 'theme' },
      { id: 'language', icon: Globe, label: 'Idioma', description: 'Español, English', action: 'language' },
      { id: 'currency', icon: DollarSign, label: 'Moneda', description: 'USD, EUR, MXN...', action: 'currency' },
    ]
  },
  {
    title: 'Configuración Avanzada',
    items: [
      { id: 'settings', icon: Settings, label: '⚙️ Configuración Completa', description: 'Alertas, notificaciones, datos', color: '#05BFDB', page: 'settings', settingsTab: 'general' },
      { id: 'alerts', icon: Bell, label: '🔔 Alertas Inteligentes', description: 'Umbrales y avisos financieros', color: '#F59E0B', page: 'settings', settingsTab: 'alerts' },
      { id: 'notifications', icon: Bell, label: '📱 Notificaciones', description: 'Push, email, recordatorios', color: '#8B5CF6', page: 'settings', settingsTab: 'notifications' },
      { id: 'data', icon: Download, label: '💾 Gestión de Datos', description: 'Exportar, sincronizar, eliminar', color: '#EF4444', page: 'settings', settingsTab: 'data' },
    ]
  },
  {
    title: 'Cuenta',
    items: [
      { id: 'profile', icon: User, label: 'Mi Perfil', description: 'Nombre, foto, email', action: 'profile' },
      { id: 'security', icon: Shield, label: 'Seguridad', description: 'Contraseña, 2FA', action: 'security' },
    ]
  },
  {
    title: 'Soporte',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Ayuda', description: 'FAQ y tutoriales', action: 'help' },
    ]
  }
];

const THEMES: Array<{ id: Theme; name: string; icon: React.ReactNode; color: string }> = [
  { id: 'dark', name: 'Cyan', icon: <Moon className="w-5 h-5" />, color: '#05BFDB' },
  { id: 'pink', name: 'Rosa', icon: <Heart className="w-5 h-5" />, color: '#ec4899' },
  { id: 'purple', name: 'Morado', icon: <Sparkles className="w-5 h-5" />, color: '#a855f7' },
  { id: 'turquoise', name: 'Turquesa', icon: <Sparkles className="w-5 h-5" />, color: '#14b8a6' },
];

const CURRENCIES: Array<{ id: Currency; name: string; symbol: string }> = [
  { id: 'USD', name: 'Dólar US', symbol: '$' },
  { id: 'EUR', name: 'Euro', symbol: '€' },
  { id: 'MXN', name: 'Peso MX', symbol: '$' },
  { id: 'COP', name: 'Peso CO', symbol: '$' },
  { id: 'ARS', name: 'Peso AR', symbol: '$' },
  { id: 'CLP', name: 'Peso CL', symbol: '$' },
  { id: 'PEN', name: 'Sol PE', symbol: 'S/' },
];

const LANGUAGES: Array<{ id: Language; name: string; flag: string }> = [
  { id: 'es', name: 'Español', flag: '🇪🇸' },
  { id: 'en', name: 'English', flag: '🇺🇸' },
];

export const MorePage: React.FC = () => {
  const { 
    user, theme, currency, language, 
    setTheme, setCurrency, setLanguage, setActivePage, setSettingsTab, logout 
  } = useStore();
  const themeColors = getThemeColors(theme);
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleItemClick = (item: any) => {
    if (item.page) {
      // Handle settings navigation with specific tab
      if (item.page === 'settings' && item.settingsTab) {
        setSettingsTab(item.settingsTab);
      }
      setActivePage(item.page);
    } else if (item.action) {
      switch (item.action) {
        case 'theme': setShowThemeModal(true); break;
        case 'currency': setShowCurrencyModal(true); break;
        case 'language': setShowLanguageModal(true); break;
        case 'export': setShowExportModal(true); break;
        case 'profile': setSettingsTab('general'); setActivePage('settings'); break;
        case 'notifications': setSettingsTab('notifications'); setActivePage('settings'); break;
        case 'security': setSettingsTab('general'); setActivePage('settings'); break;
        case 'help': break; // TODO
        case 'import': break; // TODO
      }
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Más Opciones</h1>
        <p className="text-white/60 mt-1">Configuración y herramientas</p>
      </div>

      {/* User Profile Card */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user?.displayName || 'Usuario'}</h2>
            <p className="text-sm text-white/50">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="primary">Premium</Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30" />
        </div>
      </Card>

      {/* Menu Sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {MENU_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h3>
            <Card className="divide-y divide-white/5" padding="none">
              {section.items.map((item) => (
                <motion.button
                  key={item.id}
                  variants={itemVariants}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: item.color ? `${item.color}20` : `rgba(var(--primary-rgb), 0.2)`,
                    }}
                  >
                    <item.icon 
                      className="w-5 h-5" 
                      style={{ color: item.color || 'var(--primary)' }} 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-white/50">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30" />
                </motion.button>
              ))}
            </Card>
          </div>
        ))}
      </motion.div>

      {/* Logout Button */}
      <Card className="p-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-4 text-danger-400 hover:bg-danger-500/10 p-3 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </Card>

      {/* App Version */}
      <p className="text-center text-white/30 text-sm">
        Smarter Investment v2.0.0
      </p>

      {/* Theme Modal */}
      <Modal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} title="Seleccionar Tema" size="sm">
        <div className="space-y-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setShowThemeModal(false); }}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                theme === t.id 
                  ? 'border-white/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/30'
              )}
            >
              <div 
                className="w-10 h-10 rounded-full"
                style={{ backgroundColor: t.color, boxShadow: `0 0 20px ${t.color}50` }}
              />
              <span className="font-medium text-white">{t.name}</span>
              {theme === t.id && (
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">Activo</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Currency Modal */}
      <Modal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} title="Seleccionar Moneda" size="sm">
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {CURRENCIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCurrency(c.id); setShowCurrencyModal(false); }}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                currency === c.id 
                  ? 'border-white/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/30'
              )}
            >
              <span className="text-xl font-bold text-white/70">{c.symbol}</span>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{c.id}</p>
                <p className="text-sm text-white/50">{c.name}</p>
              </div>
              {currency === c.id && (
                <span className="text-xs px-2 py-1 rounded-full bg-white/20">Activo</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Language Modal */}
      <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title="Seleccionar Idioma" size="sm">
        <div className="space-y-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              onClick={() => { setLanguage(l.id); setShowLanguageModal(false); }}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                language === l.id 
                  ? 'border-white/50 bg-white/10' 
                  : 'border-white/10 hover:border-white/30'
              )}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="font-medium text-white">{l.name}</span>
              {language === l.id && (
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-white/20">Activo</span>
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Exportar Datos" size="sm">
        <div className="space-y-3">
          <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all">
            <FileText className="w-6 h-6 text-green-400" />
            <div className="text-left">
              <p className="font-medium text-white">Exportar CSV</p>
              <p className="text-sm text-white/50">Todas las transacciones</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/30 transition-all">
            <FileText className="w-6 h-6 text-red-400" />
            <div className="text-left">
              <p className="font-medium text-white">Exportar PDF</p>
              <p className="text-sm text-white/50">Reporte mensual</p>
            </div>
          </button>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Cerrar Sesión" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-6">¿Estás seguro que deseas cerrar sesión?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowLogoutModal(false)} fullWidth>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleLogout} fullWidth>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MorePage;
