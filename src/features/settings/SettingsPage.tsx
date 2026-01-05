// src/features/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { Settings, Lock, Bell, Building2, Palette } from 'lucide-react';
import { Card, Button } from '../../components/ui';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'theme',
      icon: Palette,
      title: 'Tema',
      subtitle: 'Apariencia',
      action: () => setActiveSection('theme')
    },
    {
      id: 'language',
      icon: Settings,
      title: 'Idioma',
      subtitle: 'Español',
      action: () => setActiveSection('language')
    },
    {
      id: 'currency',
      icon: Settings,
      title: 'Moneda',
      subtitle: 'USD',
      action: () => setActiveSection('currency')
    },
    {
      id: 'alerts',
      icon: Bell,
      title: '⚠️ Alertas Inteligentes',
      subtitle: 'Alertas de Presupuesto',
      action: () => setActiveSection('alerts')
    },
    {
      id: 'notifications',
      icon: Bell,
      title: '🔔 Notificaciones',
      subtitle: 'Push, email',
      action: () => setActiveSection('notifications')
    },
    {
      id: 'bank',
      icon: Building2,
      title: '🏦 Conexión Bancaria',
      subtitle: 'Plaid sync',
      action: () => setActiveSection('bank')
    },
  ];

  if (activeSection === 'alerts') {
    return <AlertasInteligentes onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'notifications') {
    return <NotificacionesSettings onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'bank') {
    return <BankSettings onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'theme') {
    return <ThemeSettings onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'language') {
    return <LanguageSettings onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'currency') {
    return <CurrencySettings onBack={() => setActiveSection(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7" />
            Configuración Completa
          </h1>
          <p className="text-white/60 text-sm mt-1">Alertas</p>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className="p-4 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={item.action}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white/50">{item.subtitle}</p>
                  </div>
                  <div className="text-white/30">›</div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 mt-6 border-red-500/20">
          <h3 className="text-lg font-semibold text-red-400 mb-4">
            Gestión de Datos
          </h3>
          <p className="text-white/60 text-sm mb-4">Exportar Datos</p>
          <Button className="w-full bg-red-500 hover:bg-red-600">
            Cerrar sesión
          </Button>
        </Card>
      </div>
    </div>
  );
};

const AlertasInteligentes: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300 flex items-center gap-2"
        >
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">⚠️ Alertas Inteligentes</h1>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">💰 Gasto alto</h3>
                <p className="text-sm text-white/50">Alertar cuando un gasto supere $100</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Monto de alerta ($)</label>
              <input
                type="number"
                defaultValue="100"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">📊 Alerta de presupuesto</h3>
                <p className="text-sm text-white/50">Notificar al alcanzar el 80% del presupuesto</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">🎯 Meta próxima</h3>
                <p className="text-sm text-white/50">Alertar 30 días antes de fecha límite</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const NotificacionesSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    const result = await Notification.requestPermission();
    if (result === 'granted') {
      new Notification('🎉 ¡Notificaciones activadas!', {
        body: 'Ahora recibirás alertas',
        icon: '/icon-192x192.png',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300 flex items-center gap-2"
        >
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">🔔 Notificaciones</h1>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Notificaciones del navegador</h3>
                <p className="text-sm text-white/50">
                  {Notification.permission === 'granted' ? 'Activadas ✅' : 'No activadas'}
                </p>
              </div>
              {Notification.permission !== 'granted' && (
                <Button onClick={requestPermission} size="sm">
                  Activar
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">💰 Nueva transacción</h3>
                <p className="text-sm text-white/50">Notificar cada transacción nueva</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">📧 Email</h3>
                <p className="text-sm text-white/50">Resumen semanal por email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const BankSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300 flex items-center gap-2"
        >
          ← Volver
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">🏦 Conexión Bancaria</h1>

        <Card className="p-6 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Plaid sync</h3>
          <p className="text-white/60 text-sm mb-4">
            Conecta tu banco para sincronizar transacciones automáticamente
          </p>

          <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary-400" />
                <div>
                  <p className="text-white font-medium">Chase Bank</p>
                  <p className="text-xs text-white/50">Última sync: Hace 5 min</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                Conectado
              </span>
            </div>
          </div>

          <Button className="w-full">
            <Building2 className="w-5 h-5 mr-2" />
            Conectar nuevo banco
          </Button>
        </Card>

        <Card className="p-4 bg-blue-500/10 border-blue-500/20">
          <p className="text-sm text-blue-400">
            💡 <strong>Tip:</strong> Es seguro. Puedes desconectarlo cuando quieras.
          </p>
        </Card>
      </div>
    </div>
  );
};

const ThemeSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">🎨 Tema</h1>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Modo oscuro</h3>
              <p className="text-sm text-white/50">Activado por defecto</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};

const LanguageSettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">🌍 Idioma</h1>
        <Card className="p-6">
          <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
            <option value="es" className="bg-gray-900">Español</option>
            <option value="en" className="bg-gray-900">English</option>
          </select>
        </Card>
      </div>
    </div>
  );
};

const CurrencySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-primary-400 hover:text-primary-300"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold text-white mb-6">💵 Moneda</h1>
        <Card className="p-6">
          <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
            <option value="USD" className="bg-gray-900">USD - Dólar</option>
            <option value="EUR" className="bg-gray-900">EUR - Euro</option>
            <option value="MXN" className="bg-gray-900">MXN - Peso Mexicano</option>
          </select>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;