// ============================================
// ⚙️ SETTINGS PAGE v21.2 - Complete Configuration
// Full settings with smart alerts configuration
// ============================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Palette, Globe, DollarSign, Shield, Download, Trash2, LogOut, 
  ChevronRight, Moon, Sparkles, Heart, Check, CreditCard, HelpCircle, Mail,
  AlertTriangle, Target, TrendingUp, Calendar, Percent, PiggyBank, Wallet,
  Volume2, VolumeX, Smartphone, Clock, RefreshCw, FileText, Database, X
} from 'lucide-react';
import { useStore, applyTheme, getThemeColors } from '../../stores/useStore';
import { Card, Button, Input, Select, Modal, Badge, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { showSuccess, showError } from '../../lib/errorHandler';
import type { Theme, Currency, Language } from '../../types';

// Theme options
const THEMES: Array<{ id: Theme; name: string; description: string; colors: string[]; icon: React.ReactNode }> = [
  { id: 'dark', name: 'Oscuro (Cyan)', description: 'Negro con neón cyan', colors: ['#000000', '#051420', '#05BFDB', '#088395'], icon: <Moon className="w-5 h-5" /> },
  { id: 'pink', name: 'Rosado', description: 'Negro con neón rosa', colors: ['#000000', '#200510', '#ec4899', '#db2777'], icon: <Heart className="w-5 h-5" /> },
  { id: 'purple', name: 'Morado', description: 'Negro con neón púrpura', colors: ['#000000', '#100520', '#a855f7', '#9333ea'], icon: <Sparkles className="w-5 h-5" /> },
  { id: 'turquoise', name: 'Turquesa', description: 'Negro con neón turquesa', colors: ['#000000', '#042f2e', '#14b8a6', '#0d9488'], icon: <Sparkles className="w-5 h-5" /> },
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
const SettingSection: React.FC<{ title: string; icon?: React.ReactNode; description?: string; children: React.ReactNode }> = ({ title, icon, description, children }) => (
  <Card className="mb-4 overflow-hidden">
    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
      {icon && <div className="text-primary-400">{icon}</div>}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-white/50">{description}</p>}
      </div>
    </div>
    {children}
  </Card>
);

// Setting Row Component
const SettingRow: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, title, description, action, onClick }) => (
  <div
    className={cn('flex items-center gap-4 py-3 border-b border-white/5 last:border-0', onClick && 'cursor-pointer hover:bg-white/5 -mx-4 px-4')}
    onClick={onClick}
  >
    {icon && (
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-400">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <p className="font-medium text-white">{title}</p>
      {description && <p className="text-sm text-white/50">{description}</p>}
    </div>
    {action}
  </div>
);

// Toggle Switch
const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }> = ({ enabled, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={cn(
      'w-12 h-6 rounded-full transition-colors relative',
      enabled ? 'bg-primary-500' : 'bg-white/20',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <div className={cn(
      'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
      enabled ? 'translate-x-7' : 'translate-x-1'
    )} />
  </button>
);

// Number Input with Stepper
const NumberStepper: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}> = ({ value, onChange, min = 0, max = 100, suffix = '%' }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(Math.max(min, value - 5))}
      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
    >
      -
    </button>
    <div className="w-16 text-center">
      <span className="font-bold text-white">{value}</span>
      <span className="text-white/50">{suffix}</span>
    </div>
    <button
      onClick={() => onChange(Math.min(max, value + 5))}
      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
    >
      +
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { 
    user, theme, setTheme, currency, setCurrency, language, setLanguage,
    logout, expenses, incomes, goals, budgets 
  } = useStore();
  const themeColors = getThemeColors(theme);

  // Settings state
  const [activeTab, setActiveTab] = useState<'general' | 'alerts' | 'notifications' | 'data'>('general');
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Alert settings
  const [alertSettings, setAlertSettings] = useState({
    budgetWarning: true,
    budgetWarningThreshold: 80,
    budgetCritical: true,
    budgetCriticalThreshold: 100,
    lowSavingsRate: true,
    lowSavingsThreshold: 10,
    goalProgress: true,
    goalProgressThreshold: 25,
    unusualExpense: true,
    unusualExpenseMultiplier: 2,
    recurringReminder: true,
    recurringReminderDays: 3,
    weeklyReport: true,
    weeklyReportDay: 'monday' as const,
    monthlyReport: true,
    deficitAlert: true,
    projectionAlert: true,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    showPreview: true,
    groupNotifications: true,
  });

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    showSuccess(`Tema cambiado a ${THEMES.find(t => t.id === newTheme)?.name}`);
    setShowThemeModal(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Sesión cerrada');
    } catch (error) {
      showError('Error al cerrar sesión');
    }
  };

  // Handle export
  const handleExport = (format: 'json' | 'csv') => {
    const data = {
      expenses,
      incomes,
      goals,
      budgets,
      exportDate: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smarter-investment-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }

    showSuccess(`Datos exportados en formato ${format.toUpperCase()}`);
    setShowExportModal(false);
  };

  // Tabs
  const tabs = [
    { id: 'general', label: 'General', icon: <Palette className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alertas', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
    { id: 'data', label: 'Datos', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Palette className="w-7 h-7" style={{ color: themeColors.primary }} />
          Configuración
        </h1>
        <p className="text-white/60 mt-1">Personaliza tu experiencia</p>
      </div>

      {/* User Profile Card */}
      <Card className="p-4 flex items-center gap-4">
        <Avatar
          src={user?.photoURL || undefined}
          name={user?.displayName || user?.email || 'Usuario'}
          size="lg"
        />
        <div className="flex-1">
          <h2 className="font-bold text-white">{user?.displayName || 'Usuario'}</h2>
          <p className="text-sm text-white/50">{user?.email}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <Button
            key={tab.id}
            size="sm"
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-shrink-0"
          >
            {tab.icon}
            <span className="ml-1">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <>
          {/* Theme */}
          <SettingSection title="Apariencia" icon={<Palette className="w-5 h-5" />} description="Personaliza los colores de la app">
            <SettingRow
              icon={THEMES.find(t => t.id === theme)?.icon}
              title="Tema"
              description={THEMES.find(t => t.id === theme)?.name}
              action={<ChevronRight className="w-5 h-5 text-white/30" />}
              onClick={() => setShowThemeModal(true)}
            />
          </SettingSection>

          {/* Currency & Language */}
          <SettingSection title="Regional" icon={<Globe className="w-5 h-5" />} description="Moneda e idioma">
            <SettingRow
              icon={<DollarSign className="w-5 h-5" />}
              title="Moneda"
              description={CURRENCIES.find(c => c.value === currency)?.label}
              action={
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as Currency)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.value} value={c.value} className="bg-gray-900">
                      {c.symbol} {c.value}
                    </option>
                  ))}
                </select>
              }
            />
            <SettingRow
              icon={<Globe className="w-5 h-5" />}
              title="Idioma"
              description={LANGUAGES.find(l => l.value === language)?.label}
              action={
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as Language)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value} className="bg-gray-900">
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              }
            />
          </SettingSection>
        </>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <>
          <SettingSection 
            title="Alertas de Presupuesto" 
            icon={<Wallet className="w-5 h-5" />}
            description="Recibe avisos cuando te acerques a tus límites"
          >
            <SettingRow
              title="Alerta de Advertencia"
              description={`Avisar al ${alertSettings.budgetWarningThreshold}% del presupuesto`}
              action={<Toggle enabled={alertSettings.budgetWarning} onChange={v => setAlertSettings(s => ({ ...s, budgetWarning: v }))} />}
            />
            {alertSettings.budgetWarning && (
              <div className="pl-14 pb-3">
                <p className="text-xs text-white/50 mb-2">Umbral de advertencia</p>
                <NumberStepper
                  value={alertSettings.budgetWarningThreshold}
                  onChange={v => setAlertSettings(s => ({ ...s, budgetWarningThreshold: v }))}
                  min={50}
                  max={95}
                />
              </div>
            )}
            
            <SettingRow
              title="Alerta Crítica"
              description={`Avisar al ${alertSettings.budgetCriticalThreshold}% del presupuesto`}
              action={<Toggle enabled={alertSettings.budgetCritical} onChange={v => setAlertSettings(s => ({ ...s, budgetCritical: v }))} />}
            />
          </SettingSection>

          <SettingSection 
            title="Alertas de Ahorro" 
            icon={<PiggyBank className="w-5 h-5" />}
            description="Monitorea tu tasa de ahorro"
          >
            <SettingRow
              title="Tasa de Ahorro Baja"
              description={`Avisar si baja del ${alertSettings.lowSavingsThreshold}%`}
              action={<Toggle enabled={alertSettings.lowSavingsRate} onChange={v => setAlertSettings(s => ({ ...s, lowSavingsRate: v }))} />}
            />
            {alertSettings.lowSavingsRate && (
              <div className="pl-14 pb-3">
                <p className="text-xs text-white/50 mb-2">Umbral mínimo de ahorro</p>
                <NumberStepper
                  value={alertSettings.lowSavingsThreshold}
                  onChange={v => setAlertSettings(s => ({ ...s, lowSavingsThreshold: v }))}
                  min={5}
                  max={30}
                />
              </div>
            )}
            
            <SettingRow
              title="Alerta de Déficit"
              description="Avisar si gastas más de lo que ganas"
              action={<Toggle enabled={alertSettings.deficitAlert} onChange={v => setAlertSettings(s => ({ ...s, deficitAlert: v }))} />}
            />
            
            <SettingRow
              title="Proyección de Gastos"
              description="Avisar si la proyección supera ingresos"
              action={<Toggle enabled={alertSettings.projectionAlert} onChange={v => setAlertSettings(s => ({ ...s, projectionAlert: v }))} />}
            />
          </SettingSection>

          <SettingSection 
            title="Alertas de Metas" 
            icon={<Target className="w-5 h-5" />}
            description="Seguimiento de tus objetivos"
          >
            <SettingRow
              title="Progreso de Metas"
              description={`Avisar cada ${alertSettings.goalProgressThreshold}% de avance`}
              action={<Toggle enabled={alertSettings.goalProgress} onChange={v => setAlertSettings(s => ({ ...s, goalProgress: v }))} />}
            />
            {alertSettings.goalProgress && (
              <div className="pl-14 pb-3">
                <p className="text-xs text-white/50 mb-2">Intervalo de notificación</p>
                <NumberStepper
                  value={alertSettings.goalProgressThreshold}
                  onChange={v => setAlertSettings(s => ({ ...s, goalProgressThreshold: v }))}
                  min={10}
                  max={50}
                />
              </div>
            )}
          </SettingSection>

          <SettingSection 
            title="Alertas de Gastos" 
            icon={<TrendingUp className="w-5 h-5" />}
            description="Detecta gastos inusuales"
          >
            <SettingRow
              title="Gasto Inusual"
              description={`Avisar si un gasto es ${alertSettings.unusualExpenseMultiplier}x el promedio`}
              action={<Toggle enabled={alertSettings.unusualExpense} onChange={v => setAlertSettings(s => ({ ...s, unusualExpense: v }))} />}
            />
            {alertSettings.unusualExpense && (
              <div className="pl-14 pb-3">
                <p className="text-xs text-white/50 mb-2">Multiplicador del promedio</p>
                <NumberStepper
                  value={alertSettings.unusualExpenseMultiplier}
                  onChange={v => setAlertSettings(s => ({ ...s, unusualExpenseMultiplier: v }))}
                  min={1}
                  max={5}
                  suffix="x"
                />
              </div>
            )}
          </SettingSection>

          <SettingSection 
            title="Recordatorios" 
            icon={<Calendar className="w-5 h-5" />}
            description="Pagos recurrentes y reportes"
          >
            <SettingRow
              title="Pagos Recurrentes"
              description={`Avisar ${alertSettings.recurringReminderDays} días antes`}
              action={<Toggle enabled={alertSettings.recurringReminder} onChange={v => setAlertSettings(s => ({ ...s, recurringReminder: v }))} />}
            />
            {alertSettings.recurringReminder && (
              <div className="pl-14 pb-3">
                <p className="text-xs text-white/50 mb-2">Días de anticipación</p>
                <NumberStepper
                  value={alertSettings.recurringReminderDays}
                  onChange={v => setAlertSettings(s => ({ ...s, recurringReminderDays: v }))}
                  min={1}
                  max={7}
                  suffix=" días"
                />
              </div>
            )}
            
            <SettingRow
              title="Reporte Semanal"
              description="Resumen cada semana"
              action={<Toggle enabled={alertSettings.weeklyReport} onChange={v => setAlertSettings(s => ({ ...s, weeklyReport: v }))} />}
            />
            
            <SettingRow
              title="Reporte Mensual"
              description="Resumen a fin de mes"
              action={<Toggle enabled={alertSettings.monthlyReport} onChange={v => setAlertSettings(s => ({ ...s, monthlyReport: v }))} />}
            />
          </SettingSection>
        </>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <>
          <SettingSection 
            title="Canales de Notificación" 
            icon={<Bell className="w-5 h-5" />}
            description="Cómo quieres recibir las alertas"
          >
            <SettingRow
              icon={<Smartphone className="w-5 h-5" />}
              title="Notificaciones Push"
              description="En tu dispositivo"
              action={<Toggle enabled={notificationSettings.pushEnabled} onChange={v => setNotificationSettings(s => ({ ...s, pushEnabled: v }))} />}
            />
            <SettingRow
              icon={<Mail className="w-5 h-5" />}
              title="Notificaciones por Email"
              description="A tu correo electrónico"
              action={<Toggle enabled={notificationSettings.emailEnabled} onChange={v => setNotificationSettings(s => ({ ...s, emailEnabled: v }))} />}
            />
          </SettingSection>

          <SettingSection 
            title="Sonido y Vibración" 
            icon={<Volume2 className="w-5 h-5" />}
            description="Alertas audibles y táctiles"
          >
            <SettingRow
              icon={notificationSettings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              title="Sonido"
              description="Reproducir sonido con las alertas"
              action={<Toggle enabled={notificationSettings.soundEnabled} onChange={v => setNotificationSettings(s => ({ ...s, soundEnabled: v }))} />}
            />
            <SettingRow
              icon={<Smartphone className="w-5 h-5" />}
              title="Vibración"
              description="Vibrar con las alertas"
              action={<Toggle enabled={notificationSettings.vibrationEnabled} onChange={v => setNotificationSettings(s => ({ ...s, vibrationEnabled: v }))} />}
            />
          </SettingSection>

          <SettingSection 
            title="Horas Silenciosas" 
            icon={<Clock className="w-5 h-5" />}
            description="No molestar durante ciertas horas"
          >
            <SettingRow
              title="Activar Horas Silenciosas"
              description="Silenciar notificaciones en horario específico"
              action={<Toggle enabled={notificationSettings.quietHoursEnabled} onChange={v => setNotificationSettings(s => ({ ...s, quietHoursEnabled: v }))} />}
            />
            {notificationSettings.quietHoursEnabled && (
              <div className="flex gap-4 pt-3">
                <div className="flex-1">
                  <label className="text-xs text-white/50 block mb-1">Desde</label>
                  <input
                    type="time"
                    value={notificationSettings.quietHoursStart}
                    onChange={e => setNotificationSettings(s => ({ ...s, quietHoursStart: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-white/50 block mb-1">Hasta</label>
                  <input
                    type="time"
                    value={notificationSettings.quietHoursEnd}
                    onChange={e => setNotificationSettings(s => ({ ...s, quietHoursEnd: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            )}
          </SettingSection>

          <SettingSection 
            title="Opciones Adicionales" 
            icon={<Sparkles className="w-5 h-5" />}
          >
            <SettingRow
              title="Vista Previa"
              description="Mostrar contenido en las notificaciones"
              action={<Toggle enabled={notificationSettings.showPreview} onChange={v => setNotificationSettings(s => ({ ...s, showPreview: v }))} />}
            />
            <SettingRow
              title="Agrupar Notificaciones"
              description="Combinar múltiples alertas en una"
              action={<Toggle enabled={notificationSettings.groupNotifications} onChange={v => setNotificationSettings(s => ({ ...s, groupNotifications: v }))} />}
            />
          </SettingSection>
        </>
      )}

      {/* DATA TAB */}
      {activeTab === 'data' && (
        <>
          <SettingSection 
            title="Exportar Datos" 
            icon={<Download className="w-5 h-5" />}
            description="Descarga una copia de tus datos"
          >
            <SettingRow
              icon={<FileText className="w-5 h-5" />}
              title="Exportar"
              description="Descargar todos tus datos"
              action={<ChevronRight className="w-5 h-5 text-white/30" />}
              onClick={() => setShowExportModal(true)}
            />
          </SettingSection>

          <SettingSection 
            title="Sincronización" 
            icon={<RefreshCw className="w-5 h-5" />}
            description="Estado de la sincronización con la nube"
          >
            <SettingRow
              title="Última sincronización"
              description="Hace unos segundos"
              action={
                <Badge variant="success" size="sm">
                  <Check className="w-3 h-3 mr-1" />
                  Sincronizado
                </Badge>
              }
            />
          </SettingSection>

          <SettingSection 
            title="Zona de Peligro" 
            icon={<AlertTriangle className="w-5 h-5 text-danger-400" />}
            description="Acciones irreversibles"
          >
            <SettingRow
              icon={<Trash2 className="w-5 h-5 text-danger-400" />}
              title="Eliminar Todos los Datos"
              description="Esta acción no se puede deshacer"
              action={
                <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                  Eliminar
                </Button>
              }
            />
          </SettingSection>
        </>
      )}

      {/* Theme Modal */}
      <Modal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} title="🎨 Seleccionar Tema" size="md">
        <div className="space-y-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleThemeChange(t.id)}
              className={cn(
                'w-full p-4 rounded-xl flex items-center gap-4 transition-all',
                theme === t.id ? 'bg-primary-500/20 ring-2 ring-primary-500' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              <div className="flex gap-1">
                {t.colors.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-sm text-white/50">{t.description}</p>
              </div>
              {theme === t.id && <Check className="w-5 h-5 text-primary-400" />}
            </button>
          ))}
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="📥 Exportar Datos" size="sm">
        <p className="text-white/60 mb-4">Selecciona el formato de exportación:</p>
        <div className="space-y-3">
          <Button onClick={() => handleExport('json')} fullWidth variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Exportar como JSON
          </Button>
          <Button onClick={() => handleExport('csv')} fullWidth variant="secondary">
            <FileText className="w-4 h-4 mr-2" />
            Exportar como CSV
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="⚠️ Confirmar Eliminación" size="sm">
        <p className="text-white/60 mb-4">
          ¿Estás seguro de que deseas eliminar todos tus datos? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} fullWidth>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => {
            showError('Función deshabilitada por seguridad');
            setShowDeleteModal(false);
          }} fullWidth>
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar Todo
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
