// src/components/BankConnection.tsx
import React, { useState, useEffect } from 'react';
import {
  Building2, CheckCircle2, XCircle, RefreshCw, AlertCircle,
  CreditCard, DollarSign, Clock, Shield, Zap
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { showSuccess, showError } from '../lib/errorHandler';
import { usePlaidLink } from 'react-plaid-link';

interface BankAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  balance: number;
  lastSync: Date;
  status: 'active' | 'error' | 'pending';
}

export const BankConnection: React.FC = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Crear link token llamando a nuestra API serverless
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'user-123', // TODO: Obtener del usuario autenticado
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create link token');
        }

        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error fetching link token:', error);
        showError('Error al inicializar Plaid');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkToken();
  }, []);

  // Configurar Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      console.log('✅ Banco conectado:', metadata);

      try {
        // Intercambiar public_token por access_token
        const response = await fetch('/api/exchange-public-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            public_token: publicToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        const data = await response.json();
        console.log('Access token:', data.access_token);

        // TODO: Guardar access_token en Firebase

        showSuccess('¡Banco conectado exitosamente!');
        loadConnectedAccounts();
      } catch (error) {
        console.error('Error exchanging token:', error);
        showError('Error al guardar la conexión');
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error:', err);
        showError('Error al conectar banco');
      }
    },
  });

  const loadConnectedAccounts = () => {
    // TODO: Cargar cuentas desde Firebase
    setConnectedAccounts([
      {
        id: '1',
        name: 'Chase Checking',
        mask: '1234',
        type: 'checking',
        balance: 5420.50,
        lastSync: new Date(),
        status: 'active',
      },
    ]);
  };

  const handleConnectBank = () => {
    if (!linkToken) {
      showError('Inicializando Plaid...');
      return;
    }

    if (ready) {
      open();
    }
  };

  const handleDisconnectBank = async (accountId: string) => {
    try {
      setIsLoading(true);
      // TODO: Eliminar de Firebase
      setConnectedAccounts(prev => prev.filter(a => a.id !== accountId));
      showSuccess('Banco desconectado');
    } catch (error) {
      showError('Error al desconectar banco');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncNow = async (accountId: string) => {
    try {
      setIsLoading(true);
      // TODO: Sincronizar transacciones
      showSuccess('Transacciones sincronizadas');
    } catch (error) {
      showError('Error al sincronizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-400" />
            Conexión Bancaria
          </h3>
          <p className="text-sm text-white/50 mt-1">
            Conecta tus cuentas para sincronizar transacciones automáticamente
          </p>
        </div>
      </div>

      {/* Benefits */}
      <Card className="bg-primary-500/10 border border-primary-500/20">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-white mb-2">Beneficios de conectar tu banco:</h4>
            <ul className="space-y-1.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" />
                Sincronización automática de transacciones
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" />
                Actualización de saldos en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-400 flex-shrink-0" />
                Categorización inteligente de gastos
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-400 flex-shrink-0" />
                Conexión 100% segura con encriptación bancaria
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white/70">Cuentas Conectadas</h4>
          {connectedAccounts.map(account => (
            <Card key={account.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-primary-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-white">{account.name}</h5>
                    {account.status === 'active' && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activa
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-white/50">
                    •••• {account.mask}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-4 h-4 text-primary-400" />
                      <span className="font-semibold text-white">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      Sincronizado hace {Math.floor((Date.now() - account.lastSync.getTime()) / 60000)} min
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSyncNow(account.id)}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDisconnectBank(account.id)}
                    disabled={isLoading}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Button - SIEMPRE VISIBLE */}
      <div className="relative group">
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"
        />
        <button
          onClick={handleConnectBank}
          disabled={isLoading || !ready}
          className="relative w-full px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300
                     bg-white/10 backdrop-blur-xl border border-white/20
                     hover:bg-white/20 hover:border-primary-400/50 hover:scale-[1.02]
                     active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg hover:shadow-primary-500/50
                     flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(5, 191, 219, 0.15), rgba(8, 131, 149, 0.15))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Building2 className="w-6 h-6" />
          <span className="text-lg">
            {connectedAccounts.length > 0 ? 'Conectar Otra Cuenta' : 'Conectar mi Banco'}
          </span>
          {isLoading && (
            <RefreshCw className="w-5 h-5 animate-spin ml-2" />
          )}
        </button>
      </div>

      {/* Security Notice */}
      <Card className="bg-white/5 border-none">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-white/50">
            <p className="font-semibold text-white/70 mb-1">Conexión 100% Segura</p>
            <p>
              Usamos Plaid, la misma tecnología de Venmo y Robinhood.
              Tus credenciales nunca son almacenadas y toda la comunicación está encriptada.
            </p>
          </div>
        </div>
      </Card>

      {/* Status */}
      <Card className={`${isLoading ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
        <div className="flex items-start gap-3">
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 animate-spin" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-200 mb-1">⏳ Inicializando...</p>
                <p className="text-yellow-200/70">
                  Conectando con Plaid de forma segura
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-green-200 mb-1">✅ Listo para Conectar</p>
                <p className="text-green-200/70">
                  Haz click en "Conectar mi Banco" para comenzar
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BankConnection;