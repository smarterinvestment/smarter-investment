// src/features/transactions/TransactionsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Wallet,
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description?: string;
  name?: string;
  merchant_name?: string;
  category?: string | string[];
  type?: 'income' | 'expense';
  synced_from_plaid?: boolean;
  pending?: boolean;
  recurring?: boolean;
}

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Query para obtener TODAS las transacciones (manuales + Plaid, NO recurrentes)
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Excluir recurrentes
        if (!data.recurring) {
          txns.push({ id: doc.id, ...data } as Transaction);
        }
      });
      
      // Ordenar por fecha
      txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(txns);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Determinar si es ingreso o gasto
  const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
    if (tx.synced_from_plaid) {
      // En Plaid: amount positivo = gasto, negativo = ingreso
      return tx.amount > 0 ? 'expense' : 'income';
    }
    // Transacciones manuales ya tienen el campo type
    return tx.type || 'expense';
  };

  // Obtener nombre de la transacción
  const getTransactionName = (tx: Transaction): string => {
    if (tx.synced_from_plaid) {
      return tx.merchant_name || tx.name || 'Transacción';
    }
    return tx.description || 'Transacción';
  };

  // Obtener categoría como string
  const getTransactionCategory = (tx: Transaction): string => {
    if (tx.synced_from_plaid && Array.isArray(tx.category)) {
      return tx.category[0] || 'Sin categoría';
    }
    return tx.category as string || 'Sin categoría';
  };

  // Calcular totales
  const totalIncome = transactions
    .filter(tx => getTransactionType(tx) === 'income')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpense = transactions
    .filter(tx => getTransactionType(tx) === 'expense')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const balance = totalIncome - totalExpense;

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = getTransactionName(tx).toLowerCase().includes(searchTerm.toLowerCase());
    const txType = getTransactionType(tx);
    const matchesFilter = filterType === 'all' || txType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Obtener icono por categoría
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('restaurant')) 
      return <Coffee className="w-5 h-5 text-orange-400" />;
    if (cat.includes('shop') || cat.includes('retail')) 
      return <ShoppingBag className="w-5 h-5 text-purple-400" />;
    if (cat.includes('transfer') || cat.includes('payment')) 
      return <TrendingUp className="w-5 h-5 text-blue-400" />;
    if (cat.includes('travel') || cat.includes('transportation')) 
      return <Car className="w-5 h-5 text-green-400" />;
    if (cat.includes('home')) 
      return <Home className="w-5 h-5 text-red-400" />;
    return <Wallet className="w-5 h-5 text-primary-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Transacciones
            </h1>
            <p className="text-white/60 mt-1">
              {transactions.length} transacciones totales
            </p>
          </div>
          <Button onClick={() => window.location.href = '/#/new-transaction'}>
            <Plus className="w-5 h-5 mr-2" />
            Nuevo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-green-500/10 border-green-500/20">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-xs text-white/50">Ingresos</p>
                <p className="text-xl font-bold text-green-400">
                  +${totalIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-red-500/10 border-red-500/20">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-xs text-white/50">Gastos</p>
                <p className="text-xl font-bold text-red-400">
                  -${totalExpense.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-primary-500/10 border-primary-500/20">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-primary-400" />
              <div>
                <p className="text-xs text-white/50">Balance</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${balance.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Gastos
              </button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <Card className="p-12 text-center">
              <Wallet className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-lg font-semibold text-white mb-2">
                Sin movimientos
              </p>
              <p className="text-sm text-white/50">
                Registra tu primer movimiento o conecta tu banco
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/#/new-transaction'}>
                Añadir
              </Button>
            </Card>
          ) : (
            filteredTransactions.map((tx) => {
              const txType = getTransactionType(tx);
              const txName = getTransactionName(tx);
              const txCategory = getTransactionCategory(tx);
              
              return (
                <Card key={tx.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(txCategory)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {txName}
                        </h3>
                        {tx.synced_from_plaid && (
                          <Badge variant="secondary" size="sm">
                            Auto
                          </Badge>
                        )}
                        {tx.pending && (
                          <Badge variant="warning" size="sm">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(tx.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-white/5">
                          {txCategory}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        txType === 'income' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {txType === 'income' ? '+' : '-'}$
                        {Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;