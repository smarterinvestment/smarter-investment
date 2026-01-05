// src/features/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { Settings, Lock, Bell, Building2, Receipt, User, Palette, Globe } from 'lucide-react';
import { Card, Button } from '../../components/ui';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'bank', label: 'Banco', icon: Building2 },
    { id: 'security', label: 'Seguridad', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-white/60 mt-1">Administra tu cuenta y preferencias</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg scale-105'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'notifications' && <NotificationsSettings />}
          {activeTab === 'bank' && <BankSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Información de la cuenta
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
              placeholder="tu@email.com"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Moneda</h3>
        <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400">
          <option value="USD" className="bg-gray-900">USD - Dólar</option>
          <option value="EUR" className="bg-gray-900">EUR - Euro</option>
          <option value="MXN" className="bg-gray-900">MXN - Peso Mexicano</option>
        </select>
      </Card>
    </div>
  );
};

const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Tema</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Modo oscuro</p>
            <p className="text-xs text-white/50">Usar modo oscuro</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Idioma</h3>
        <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400">
          <option value="es" className="bg-gray-900">Español</option>
          <option value="en" className="bg-gray-900">English</option>
        </select>
      </Card>
    </div>
  );
};

const NotificationsSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    const result = await Notification.requestPermission();
    if (result === 'granted') {
      setNotificationsEnabled(true);
      new Notification('🎉 ¡Notificaciones activadas!', {
        body: 'Ahora recibirás alertas de tus transacciones',
        icon: '/icon-192x192.png',
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🔔 Alertas Inteligentes
        </h3>
        <p className="text-white/60 text-sm mb-4">
          Recibe notificaciones sobre tus gastos, presupuestos y metas
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">Notificaciones del navegador</p>
              <p className="text-xs text-white/50">
                {Notification.permission === 'granted' ? 'Activadas ✅' : 'No activadas'}
              </p>
            </div>
            {Notification.permission !== 'granted' && (
              <Button onClick={requestPermission} size="sm">
                Activar
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">💰 Nueva transacción</p>
              <p className="text-xs text-white/50">Notificar cada nueva transacción</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">📊 Alerta de presupuesto</p>
              <p className="text-xs text-white/50">Notificar cuando alcances el 80% del presupuesto</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-white font-medium">💸 Gasto alto</p>
              <p className="text-xs text-white/50">Alertar cuando un gasto supere $100</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

const BankSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          🏦 Conexión Bancaria
        </h3>
        <p className="text-white/60 text-sm mb-4">
          Conecta tu banco para sincronizar transacciones automáticamente usando Plaid
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary-400" />
                <div>
                  <p className="text-white font-medium">Chase Bank</p>
                  <p className="text-xs text-white/50">Última sincronización: Hace 5 min</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                Conectado
              </span>
            </div>
          </div>

          <Button className="w-full">
            <Building2 className="w-5 h-5 mr-2" />
            Conectar nuevo banco
          </Button>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Tip:</strong> Conecta tu banco para que tus transacciones se sincronicen automáticamente. 
              Es seguro y puedes desconectarlo cuando quieras.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Cambiar contraseña
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Contraseña actual
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            />
          </div>
          <Button className="w-full">
            Actualizar contraseña
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Autenticación de dos factores
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">2FA</p>
            <p className="text-xs text-white/50">Protección adicional</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
          </label>
        </div>
      </Card>

      <Card className="p-6 border-red-500/20">
        <h3 className="text-lg font-semibold text-red-400 mb-4">
          Zona de peligro
        </h3>
        <Button className="w-full bg-red-500 hover:bg-red-600">
          Cerrar sesión
        </Button>
      </Card>
    </div>
  );
};

export default SettingsPage;