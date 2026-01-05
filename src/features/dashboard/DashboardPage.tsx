// src/features/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  CreditCard,
} from 'lucide-react';
import { Card, Button } from '../../components/ui';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export const DashboardPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'YTD' | 'ALL'>('1M');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Query SIN orderBy (para evitar índice compuesto)
    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.recurring) {
          txns.push({ id: doc.id, ...data } as Transaction);
        }
      });
      
      // Ordenar en el frontend
      txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(txns.slice(0, 100));
      setLoading(false);
    });

    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      const goalsData: Goal[] = [];
      snapshot.forEach((doc) => {
        goalsData.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(goalsData.slice(0, 3));
    });

    return () => {
      unsubTx();
      unsubGoals();
    };
  }, []);

  const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
    if (tx.synced_from_plaid) {
      return tx.amount > 0 ? 'expense' : 'income';
    }
    return tx.type || 'expense';
  };

  const getTransactionName = (tx: Transaction): string => {
    if (tx.synced_from_plaid) {
      return tx.merchant_name || tx.name || 'Transacción';
    }
    return tx.description || 'Transacción';
  };

  const getTransactionCategory = (tx: Transaction): string => {
    if (tx.synced_from_plaid && Array.isArray(tx.category)) {
      return tx.category[0] || 'Sin categoría';
    }
    return tx.category as string || 'Sin categoría';
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    const ranges = {
      '1W': 7,
      '1M': 30,
      '3M': 90,
      'YTD': Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)),
      'ALL': Infinity,
    };

    const daysBack = ranges[timeRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return transactions.filter(tx => new Date(tx.date) >= cutoffDate);
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions
    .filter(tx => getTransactionType(tx) === 'income')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const totalExpense = filteredTransactions
    .filter(tx => getTransactionType(tx) === 'expense')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const netWorth = totalIncome - totalExpense;

  const getLast30DaysData = () => {
    const data: { date: string; income: number; expense: number }[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTxns = filteredTransactions.filter(tx => tx.date === dateStr);
      const income = dayTxns
        .filter(tx => getTransactionType(tx) === 'income')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      const expense = dayTxns
        .filter(tx => getTransactionType(tx) === 'expense')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      data.push({
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        income,
        expense,
      });
    }

    return data;
  };

  const getCategoryData = () => {
    const categoryTotals: { [key: string]: number } = {};

    filteredTransactions
      .filter(tx => getTransactionType(tx) === 'expense')
      .forEach(tx => {
        const category = getTransactionCategory(tx);
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(tx.amount);
      });

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const lineChartData = getLast30DaysData();
  const categoryData = getCategoryData();

  const COLORS = ['#05bfdb', '#08c792', '#ffc107', '#ff5722', '#9c27b0'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              ¡Hola! 👋
            </h1>
            <p className="text-white/60 mt-1">Tu resumen financiero</p>
          </div>
          <Button onClick={() => window.location.href = '/#/new-transaction'}>
            <Plus className="w-5 h-5 mr-2" />
            Nuevo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-primary-600/10 border-primary-500/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white/70 uppercase tracking-wide">
                Patrimonio Neto
              </p>
              <Wallet className="w-5 h-5 text-primary-400" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-white">
                ${netWorth.toFixed(2)}
              </p>
              <div className="flex items-center gap-1 text-sm">
                {netWorth >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">+0.00%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">-0.00%</span>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white/70 uppercase tracking-wide">
                Ingresos
              </p>
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              ${totalIncome.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-white/70 uppercase tracking-wide">
                Gastos
              </p>
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">
              ${totalExpense.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card className="p-2 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-white/50" />
            <span className="text-sm text-white/70 mr-2">Período</span>
            <div className="flex gap-1">
              {(['1W', '1M', '3M', 'YTD', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    timeRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Ingresos vs Gastos
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={lineChartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#08c792" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#08c792" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff50" style={{ fontSize: 12 }} />
                <YAxis stroke="#ffffff50" style={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#08c792"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  name="Ingresos"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ff5722"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                  name="Gastos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-400" />
                Distribución de Gastos
              </h3>
              <button
                onClick={() => window.location.href = '/#/analytics'}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Ver todos
              </button>
            </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid #ffffff20',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/50 text-sm">Sin datos</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Últimos Movimientos</h3>
              <button
                onClick={() => window.location.href = '/#/transactions'}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Ver todos
              </button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCard className="w-12 h-12 text-white/20 mb-3" />
                <p className="text-white/50 text-sm mb-1">Sin movimientos</p>
                <p className="text-white/30 text-xs mb-4">Registra tu primer movimiento</p>
                <Button size="sm" onClick={() => window.location.href = '/#/new-transaction'}>
                  Añadir
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.slice(0, 5).map((tx) => {
                  const txType = getTransactionType(tx);
                  const txName = getTransactionName(tx);
                  const txCategory = getTransactionCategory(tx);

                  return (
                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary-400" />
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-white truncate">{txName}</p>
                        <p className="text-xs text-white/50">{txCategory}</p>
                      </div>

                      <div className="text-right">
                        <p className={`font-bold ${txType === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {txType === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-white/50">
                          {new Date(tx.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                Metas Activas
              </h3>
              <button
                onClick={() => window.location.href = '/#/goals'}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Ver todas
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Target className="w-12 h-12 text-white/20 mb-3" />
                <p className="text-white/50 text-sm mb-1">Sin metas</p>
                <p className="text-white/30 text-xs mb-4">Crea tu primera meta</p>
                <Button size="sm" onClick={() => window.location.href = '/#/goals'}>
                  Crear meta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{goal.name}</h4>
                        <span className="text-sm text-white/70">
                          ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>{progress.toFixed(0)}%</span>
                        <span>
                          {new Date(goal.deadline).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;