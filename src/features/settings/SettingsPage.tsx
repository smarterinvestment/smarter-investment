// src/features/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { Settings, Lock, Bell, Building2, Receipt, User } from 'lucide-react';
import { Card } from '../../components/ui';
import { BankConnection } from '../../components/BankConnection';
import { NotificationSettings } from '../../components/NotificationSettings';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Definición de tabs (SIN DUPLICADOS)
  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'bank', label: 'Banco', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Configuración
          </h1>
          <p className="text-white/60 mt-1">Administra tu cuenta y preferencias</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
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

        {/* Tab Content */}
        <div>
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'bank' && <BankConnection />}
        </div>
      </div>
    </div>
  );
};

// General Settings Component
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
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Moneda
            </label>
            <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400">
              <option value="USD" className="bg-gray-900">USD - Dólar</option>
              <option value="EUR" className="bg-gray-900">EUR - Euro</option>
              <option value="MXN" className="bg-gray-900">MXN - Peso Mexicano</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferencias</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Tema oscuro</p>
              <p className="text-xs text-white/50">Usar modo oscuro</p>
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

// Security Settings Component
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
          <button className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
            Actualizar contraseña
          </button>
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
    </div>
  );
};

export default SettingsPage;