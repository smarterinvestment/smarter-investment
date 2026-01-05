// src/components/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Bell, BellOff, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Button } from './ui';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface NotificationPreferences {
  enabled: boolean;
  newTransaction: boolean;
  highExpense: boolean;
  highExpenseAmount: number;
  dailySummary: boolean;
  weeklyReport: boolean;
  budgetAlert: boolean;
  budgetThreshold: number;
}

export const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    newTransaction: true,
    highExpense: true,
    highExpenseAmount: 100,
    dailySummary: false,
    weeklyReport: false,
    budgetAlert: true,
    budgetThreshold: 80,
  });
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verificar permiso de notificaciones
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Cargar preferencias del usuario
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.notificationPreferences) {
          setPreferences(data.notificationPreferences);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta notificaciones');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      // Notificación de prueba
      new Notification('🎉 ¡Notificaciones activadas!', {
        body: 'Ahora recibirás alertas de tus transacciones',
        icon: '/icon-192x192.png',
      });

      // Actualizar preferencias
      const newPreferences = { ...preferences, enabled: true };
      setPreferences(newPreferences);
      await savePreferences(newPreferences);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      await setDoc(
        doc(db, 'users', userId),
        { notificationPreferences: newPreferences },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error al guardar preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  return (
    <div className="space-y-4">
      {/* Estado de permisos */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <Bell className="w-6 h-6 text-green-400" />
            ) : (
              <BellOff className="w-6 h-6 text-red-400" />
            )}
            <div>
              <h3 className="font-semibold text-white">
                Notificaciones del navegador
              </h3>
              <p className="text-sm text-white/50">
                {permission === 'granted'
                  ? 'Activadas ✅'
                  : permission === 'denied'
                  ? 'Bloqueadas ❌'
                  : 'No activadas'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && (
            <Button onClick={requestPermission} size="sm">
              Activar
            </Button>
          )}
        </div>
      </Card>

      {/* Opciones de notificación */}
      {permission === 'granted' && (
        <>
          {/* Nueva transacción */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary-400" />
                <div>
                  <h4 className="font-medium text-white">Nueva transacción</h4>
                  <p className="text-xs text-white/50">
                    Notificar cada nueva transacción
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.newTransaction}
                  onChange={(e) => handleToggle('newTransaction', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>

          {/* Gasto alto */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="font-medium text-white">Gasto alto</h4>
                  <p className="text-xs text-white/50">
                    Alertar cuando un gasto supere un monto
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.highExpense}
                  onChange={(e) => handleToggle('highExpense', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            {preferences.highExpense && (
              <div className="mt-3">
                <label className="text-xs text-white/70 mb-1 block">
                  Monto de alerta ($)
                </label>
                <input
                  type="number"
                  step="10"
                  value={preferences.highExpenseAmount}
                  onChange={(e) =>
                    handleToggle('highExpenseAmount', parseFloat(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400"
                  disabled={loading}
                />
              </div>
            )}
          </Card>

          {/* Alerta de presupuesto */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <div>
                  <h4 className="font-medium text-white">Alerta de presupuesto</h4>
                  <p className="text-xs text-white/50">
                    Notificar cuando alcances un % del presupuesto
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.budgetAlert}
                  onChange={(e) => handleToggle('budgetAlert', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            {preferences.budgetAlert && (
              <div className="mt-3">
                <label className="text-xs text-white/70 mb-1 block">
                  Umbral de alerta (%)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={preferences.budgetThreshold}
                  onChange={(e) =>
                    handleToggle('budgetThreshold', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-400"
                  disabled={loading}
                />
              </div>
            )}
          </Card>

          {/* Resumen diario */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="font-medium text-white">Resumen diario</h4>
                  <p className="text-xs text-white/50">
                    Recibir resumen al final del día
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.dailySummary}
                  onChange={(e) => handleToggle('dailySummary', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>

          {/* Reporte semanal */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="font-medium text-white">Reporte semanal</h4>
                  <p className="text-xs text-white/50">
                    Recibir resumen cada lunes
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={(e) => handleToggle('weeklyReport', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;