// src/features/settings/SettingsPage.tsx
import React, { useState } from 'react';
import { Card } from '../../components/ui';
import {
  Settings,
  Shield,
  Bell,
  Building2,
  Receipt,
  User,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { BankConnection } from '../../components/BankConnection';
import PlaidTransactions from '../transactions/PlaidTransactions';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'bank', label: 'Banco', icon: Building2 },
  { id: 'transactions', label: 'Transacciones', icon: Receipt },
];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Configuración
          </h1>
          <p className="text-white/60">
            Administra tu cuenta y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationSettings />}
              {activeTab === 'bank' && <BankConnection />}
              {activeTab === 'transactions' && <PlaidTransactions />}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// General Settings Component
const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-400" />
          Configuración General
        </h2>
        <p className="text-white/60 text-sm">
          Administra la información básica de tu cuenta
        </p>
      </div>

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
            Moneda preferida
          </label>
          <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400">
            <option>USD - Dólar estadounidense</option>
            <option>EUR - Euro</option>
            <option>MXN - Peso mexicano</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary-400" />
          Seguridad
        </h2>
        <p className="text-white/60 text-sm">
          Protege tu cuenta y tus datos
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Contraseña actual
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Nueva contraseña
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Confirmar contraseña
          </label>
          <input
            type="password"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400"
            placeholder="••••••••"
          />
        </div>

        <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-400" />
          Notificaciones
        </h2>
        <p className="text-white/60 text-sm">
          Configura cómo quieres recibir notificaciones
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium text-white">Transacciones bancarias</h3>
            <p className="text-sm text-white/60">
              Notificaciones de nuevas transacciones
            </p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium text-white">Alertas de presupuesto</h3>
            <p className="text-sm text-white/60">
              Cuando te acerques al límite de tu presupuesto
            </p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h3 className="font-medium text-white">Metas alcanzadas</h3>
            <p className="text-sm text-white/60">
              Cuando completes una meta de ahorro
            </p>
          </div>
          <label className="relative inline-block w-12 h-6">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-12 h-6 bg-white/10 rounded-full peer-checked:bg-primary-500 transition-colors cursor-pointer">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;