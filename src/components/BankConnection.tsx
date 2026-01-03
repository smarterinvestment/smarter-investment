# Eliminar el archivo viejo
rm src/components/BankConnection.tsx

# Crear el archivo LIMPIO (copia TODO hasta EOF)
cat > src/components/BankConnection.tsx << 'EOF'
// ============================================
// 🏦 BANK CONNECTION COMPONENT
// Plaid integration for automatic bank sync
// ============================================
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, CheckCircle2, XCircle, RefreshCw, AlertCircle,
  CreditCard, DollarSign, TrendingUp, Clock, Shield, Zap
} from 'lucide-react';
import { Card, Button, Badge } from './ui';
import { showSuccess, showError } from '../lib/errorHandler';

// Plaid Link
// import { usePlaidLink } from 'react-plaid-link';

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

  // Crear link token cuando el componente monta
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        // TODO: Cuando tengas las API keys configuradas, descomenta esto
        // const userId = 'user-123'; // Obtener del usuario autenticado
        // const response = await createLinkToken(userId);
        // setLinkToken(response.link_token);
        
        console.log('🔧 Configura tus API keys de Plaid en .env');
      } catch (error) {
        showError('Error al conectar con Plaid');
      }
    };
    
    fetchLinkToken();
  }, []);

  // Configurar Plaid Link
  /*
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      console.log('✅ Banco conectado:', metadata);
      
      // TODO: Intercambiar public token por access token
      // const accessToken = await exchangePublicToken(publicToken);
      
      // TODO: Guardar access_token en Firebase
      
      showSuccess('¡Banco conectado exitosamente!');
      
      // Recargar cuentas
      loadConnectedAccounts();
    },
    onExit: (err, metadata) => {
      if (err) {
        showError('Error al conectar banco');
      }
    },
  });
  */

  const loadConnectedAccounts = () => {
    // TODO: Cargar cuentas desde Firebase
    // Por ahora, datos de ejemplo
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
      showError('Primero necesitas configurar tus API keys de Plaid en .env');
      return;
    }
    
    // if (ready) {
    //   open();
    // }
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
      
      // TODO: Sincronizar transacciones con Plaid
      
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
                    {account.status === 'error' && (
                      <Badge variant="danger" size="sm">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Error
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

      {/* Connect Button - SIEMPRE VISIBLE CON GLASSMORPHISM */}
      <div className="relative group">
        <div 
          className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"
        />
        <button
          onClick={handleConnectBank}
          disabled={isLoading}
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

      {/* Setup Instructions */}
      <Card className="bg-yellow-500/10 border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-200 mb-1">⚙️ Configuración Pendiente</p>
            <p className="text-yellow-200/70">
              Para activar esta función, configura tus API keys de Plaid en el archivo .env
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BankConnection;
EOF