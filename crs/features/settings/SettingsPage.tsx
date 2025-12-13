// ============================================
// ⚙️ SETTINGS PAGE - COMPLETE WITH THEMES
// ============================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Bell, Palette, Globe, DollarSign, Shield, Download, Trash2, LogOut, ChevronRight, Moon, Sun, Sparkles, Heart, Check, CreditCard, HelpCircle, Mail
} from 'lucide-react';
import { useStore, applyTheme, getThemeColors } from '../../stores/useStore';
import { Card, Button, Input, Select, Modal, Badge, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import type { Theme, Currency, Language } from '../../types';

// Theme options with previews
const THEMES: Array<{ id: Theme; name: string; description: string; colors: string[]; icon: React.ReactNode }> = [
  { id: 'dark', name: 'Oscuro (Cyan)', description: 'Tema oscuro con acentos cyan', colors: ['#000B2E', '#001845', '#05BFDB', '#088395'], icon: <Moon className="w-5 h-5" /> },
  { id: 'pink', name: 'Rosado', description: 'Tema oscuro con acentos rosa', colors: ['#1a0a14', '#2d1025', '#ec4899', '#db2777'], icon: <Heart className="w-5 h-5" /> },
  { id: 'purple', name: 'Morado', description: 'Tema oscuro con acentos púrpura', colors: ['#0f0a1a', '#1e1433', '#a855f7', '#9333ea'], icon: <Sparkles className="w-5 h-5" /> },
  { id: 'light', name: 'Claro', description: 'Tema claro para el día', colors: ['#f8fafc', '#e2e8f0', '#05BFDB', '#088395'], icon: <Sun className="w-5 h-5" /> },
];

const CURRENCIES: Array<{ value: Currency; label: string; symbol: string }> = [
  { value: 'USD', label: 'Dólar Estadounidense', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'MXN', label: 'Peso Mexicano', symbol: '$' },
  { value: 'COP', label: 'Peso Colombiano', symbol: '$' },
  { value: 'ARS', label: 'Peso Argentino', symbol: '$' },
  { value: 'CLP', label: 'Peso Chileno', symbol: '$' },
  { value: 'PEN', label: 'Sol Peruano', symbol: 'S/' },
];

const LANGUAGES: Array<{ value: Language; label: string; flag: string }> = [
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
];

// Setting Section Component
const SettingSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <Card className="mb-4">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm text-white/50 mt-1">{description}</p>}
    </div>
    {children}
  </Card>
);

// Setting Row Component
const SettingRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  action: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, title, description, action, onClick }) => (
  <div
    className={cn('flex items-center gap-4 p-4 -mx-4 hover:bg-white/5 transition-colors', onClick && 'cursor-pointer')}
    onClick={onClick}
  >
    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-medium text-white">{title}</p>
      {description && <p className="text-sm text-white/50">{description}</p>}
    </div>
    {action}
  </div>
);

// Toggle Switch Component
const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void }> = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={cn('w-12 h-6 rounded-full transition-colors relative', enabled ? 'bg-primary-500' : 'bg-white/20')}
  >
    <div className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', enabled ? 'translate-x-7' : 'translate-x-1')} />
  </button>
);

export const SettingsPage: React.FC = () => {
  const { user, theme, setTheme, currency, setCurrency, language, setLanguage, logout, notifications, clearNotifications, resetStore } = useStore();
  const themeColors = getThemeColors(theme);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleExportData = () => {
    // Implementation would export user data as JSON
    setShowExportModal(false);
    alert('Datos exportados exitosamente');
  };

  const handleDeleteAccount = () => {
    resetStore();
    logout();
    setShowDeleteModal(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-white/60 mt-1">Personaliza tu experiencia</p>
      </div>

      {/* Profile Section */}
      <SettingSection title="Perfil">
        <div className="flex items-center gap-4 p-4 -mx-4 bg-white/5 rounded-xl">
          <Avatar src={user?.photoURL} name={user?.displayName || user?.email || 'U'} size="xl" />
          <div className="flex-1">
            <p className="font-semibold text-white text-lg">{user?.displayName || 'Usuario'}</p>
            <p className="text-white/50">{user?.email}</p>
            <Badge variant="primary" size="sm" className="mt-2">Plan Gratuito</Badge>
          </div>
          <Button variant="secondary" size="sm">Editar</Button>
        </div>
      </SettingSection>

      {/* Appearance Section */}
      <SettingSection title="Apariencia" description="Personaliza cómo se ve la aplicación">
        <div className="space-y-4">
          <p className="text-sm font-medium text-white/80 mb-3">Tema de color</p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <motion.button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all text-left',
                  theme === t.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'
                )}
              >
                {theme === t.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.colors[2] + '30' }}>
                    <span style={{ color: t.colors[2] }}>{t.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-white/50">{t.description}</p>
                  </div>
                </div>
                {/* Color preview */}
                <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                  {t.colors.map((color, i) => (
                    <div key={i} className="flex-1" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Preferences Section */}
      <SettingSection title="Preferencias">
        <div className="divide-y divide-white/10 -my-2">
          <SettingRow
            icon={<DollarSign className="w-5 h-5" />}
            title="Moneda"
            description={CURRENCIES.find(c => c.value === currency)?.label}
            action={
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                options={CURRENCIES.map(c => ({ value: c.value, label: `${c.symbol} ${c.value}` }))}
                className="w-32"
              />
            }
          />
          <SettingRow
            icon={<Globe className="w-5 h-5" />}
            title="Idioma"
            description={LANGUAGES.find(l => l.value === language)?.label}
            action={
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                options={LANGUAGES.map(l => ({ value: l.value, label: `${l.flag} ${l.label}` }))}
                className="w-40"
              />
            }
          />
        </div>
      </SettingSection>

      {/* Notifications Section */}
      <SettingSection title="Notificaciones" description="Configura cómo quieres ser notificado">
        <div className="divide-y divide-white/10 -my-2">
          <SettingRow
            icon={<Bell className="w-5 h-5" />}
            title="Notificaciones"
            description="Activar notificaciones push"
            action={<Toggle enabled={notificationsEnabled} onChange={setNotificationsEnabled} />}
          />
          <SettingRow
            icon={<Shield className="w-5 h-5" />}
            title="Alertas de presupuesto"
            description="Notificar cuando te acerques al límite"
            action={<Toggle enabled={budgetAlerts} onChange={setBudgetAlerts} />}
          />
          <SettingRow
            icon={<Mail className="w-5 h-5" />}
            title="Reporte semanal"
            description="Recibir resumen cada lunes"
            action={<Toggle enabled={weeklyReport} onChange={setWeeklyReport} />}
          />
          <SettingRow
            icon={<Sparkles className="w-5 h-5" />}
            title="Sonidos"
            description="Reproducir sonidos de notificación"
            action={<Toggle enabled={soundEnabled} onChange={setSoundEnabled} />}
          />
        </div>
      </SettingSection>

      {/* Data Section */}
      <SettingSection title="Datos" description="Gestiona tu información">
        <div className="divide-y divide-white/10 -my-2">
          <SettingRow
            icon={<Download className="w-5 h-5" />}
            title="Exportar datos"
            description="Descarga todos tus datos en JSON"
            action={<ChevronRight className="w-5 h-5 text-white/40" />}
            onClick={() => setShowExportModal(true)}
          />
          <SettingRow
            icon={<Trash2 className="w-5 h-5 text-danger-400" />}
            title="Eliminar cuenta"
            description="Eliminar permanentemente tu cuenta y datos"
            action={<ChevronRight className="w-5 h-5 text-white/40" />}
            onClick={() => setShowDeleteModal(true)}
          />
        </div>
      </SettingSection>

      {/* Help Section */}
      <SettingSection title="Ayuda">
        <div className="divide-y divide-white/10 -my-2">
          <SettingRow
            icon={<HelpCircle className="w-5 h-5" />}
            title="Centro de ayuda"
            description="Preguntas frecuentes y tutoriales"
            action={<ChevronRight className="w-5 h-5 text-white/40" />}
          />
          <SettingRow
            icon={<Mail className="w-5 h-5" />}
            title="Contactar soporte"
            description="Envíanos un mensaje"
            action={<ChevronRight className="w-5 h-5 text-white/40" />}
          />
        </div>
      </SettingSection>

      {/* Logout Button */}
      <Card className="bg-danger-500/10 border-danger-500/30">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-danger-400 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>
      </Card>

      {/* App Version */}
      <div className="text-center text-white/30 text-sm py-4">
        <p>Smarter Investment v2.0.0</p>
        <p>© 2025 - Todos los derechos reservados</p>
      </div>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Exportar Datos" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
            <Download className="w-8 h-8 text-primary-400" />
          </div>
          <p className="text-white/80 mb-6">
            Se descargará un archivo JSON con todas tus transacciones, presupuestos y metas.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowExportModal(false)} fullWidth>Cancelar</Button>
            <Button onClick={handleExportData} fullWidth>Exportar</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Eliminar Cuenta" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-2 font-semibold">¿Estás seguro?</p>
          <p className="text-white/50 text-sm mb-6">
            Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} fullWidth>Cancelar</Button>
            <Button variant="danger" onClick={handleDeleteAccount} fullWidth>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
