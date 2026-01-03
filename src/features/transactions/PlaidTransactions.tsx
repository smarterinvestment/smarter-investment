// src/features/transactions/PlaidTransactions.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { Card } from '../../components/ui';
import {
  TrendingDown, TrendingUp, Calendar, Building2,
  CreditCard, ShoppingBag, Coffee, Car, Home, Bell
} from 'lucide-react';

interface Transaction {
  id: string;
  plaid_transaction_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category?: string[];
  pending: boolean;
  synced_from_plaid: boolean;
}

export const PlaidTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('synced_from_plaid', '==', true),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        txns.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txns);
      setLoading(false);

      // Notificación de nuevas transacciones
      if (txns.length > 0 && snapshot.docChanges().some(change => change.type === 'added')) {
        const newTxns = snapshot.docChanges().filter(change => change.type === 'added');
        if (newTxns.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('💳 Nueva transacción bancaria', {
            body: `${newTxns[0].doc.data().merchant_name || newTxns[0].doc.data().name}: $${Math.abs(newTxns[0].doc.data().amount).toFixed(2)}`,
            icon: '/favicon.ico',
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Solicitar permisos de notificación
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getCategoryIcon = (category?: string[]) => {
    if (!category || category.length === 0) return <CreditCard className="w-5 h-5" />;

    const mainCategory = category[0].toLowerCase();

    if (mainCategory.includes('food') || mainCategory.includes('restaurant')) 
      return <Coffee className="w-5 h-5 text-orange-400" />;
    if (mainCategory.includes('shop') || mainCategory.includes('retail')) 
      return <ShoppingBag className="w-5 h-5 text-purple-400" />;
    if (mainCategory.includes('transfer') || mainCategory.includes('payment')) 
      return <TrendingUp className="w-5 h-5 text-blue-400" />;
    if (mainCategory.includes('travel') || mainCategory.includes('transportation')) 
      return <Car className="w-5 h-5 text-green-400" />;
    if (mainCategory.includes('home')) 
      return <Home className="w-5 h-5 text-red-400" />;

    return <CreditCard className="w-5 h-5 text-primary-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary-400" />
            Transacciones Bancarias
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Sincronizadas automáticamente desde tu banco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-white/50">
            {transactions.length} transacciones
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-xs text-white/50">Total Gastos</p>
              <p className="text-xl font-bold text-red-400">
                ${transactions
                  .filter(t => t.amount > 0)
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-xs text-white/50">Total Ingresos</p>
              <p className="text-xl font-bold text-green-400">
                ${transactions
                  .filter(t => t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary-400" />
            <div>
              <p className="text-xs text-white/50">Este Mes</p>
              <p className="text-xl font-bold text-white">
                {transactions.filter(t => {
                  const txDate = new Date(t.date);
                  const now = new Date();
                  return txDate.getMonth() === now.getMonth() && 
                         txDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de transacciones */}
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                {getCategoryIcon(transaction.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">
                    {transaction.merchant_name || transaction.name}
                  </h3>
                  {transaction.pending && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(transaction.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                  {transaction.category && transaction.category[0] && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5">
                      {transaction.category[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${
                  transaction.amount > 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {transaction.amount > 0 ? '-' : '+'}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {transactions.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white mb-2">
            No hay transacciones sincronizadas
          </p>
          <p className="text-sm text-white/50">
            Conecta tu banco y sincroniza para ver tus transacciones aquí
          </p>
        </Card>
      )}
    </div>
  );
};

export default PlaidTransactions;