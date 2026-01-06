// src/features/analytics/AdvancedAnalyticsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { 
  TrendingUp, TrendingDown, Calendar, DollarSign, 
  ShoppingBag, AlertCircle, Zap, Target, Clock, Award 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  category: string | string[];
  type?: 'income' | 'expense';
  merchant_name?: string;
  name?: string;
  description?: string;
  synced_from_plaid?: boolean;
  recurring?: boolean;
}

const COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const AdvancedAnalyticsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(txQuery, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.recurring) {
          txData.push({ id: doc.id, ...data } as Transaction);
        }
      });
      
      txData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
    if (tx.synced_from_plaid) {
      return tx.amount > 0 ? 'expense' : 'income';
    }
    return tx.type || 'expense';
  };

  const getCategory = (tx: Transaction): string => {
    if (Array.isArray(tx.category)) {
      return tx.category[0] || 'Otros';
    }
    return tx.category || 'Otros';
  };

  const getMerchantName = (tx: Transaction): string => {
    return tx.merchant_name || tx.name || tx.description || 'Comercio';
  };

  // Filtrar por rango de tiempo
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const ranges = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 };
    const daysBack = ranges[timeRange];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return transactions.filter(tx => new Date(tx.date) >= cutoffDate);
  }, [transactions, timeRange]);

  // 1. TENDENCIA MENSUAL
  const monthlyTrend = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    filteredTransactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      const type = getTransactionType(tx);
      if (type === 'income') {
        monthlyData[monthKey].income += Math.abs(tx.amount);
      } else {
        monthlyData[monthKey].expense += Math.abs(tx.amount);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        Ingresos: data.income,
        Gastos: data.expense,
        Balance: data.income - data.expense
      }));
  }, [filteredTransactions]);

  // 2. DISTRIBUCIÓN POR DÍA DE LA SEMANA
  const weekdayDistribution = useMemo(() => {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const distribution = Array(7).fill(0).map((_, i) => ({
      day: weekdays[i],
      amount: 0,
      count: 0
    }));

    filteredTransactions
      .filter(tx => getTransactionType(tx) === 'expense')
      .forEach(tx => {
        const dayOfWeek = new Date(tx.date).getDay();
        distribution[dayOfWeek].amount += Math.abs(tx.amount);
        distribution[dayOfWeek].count += 1;
      });

    return distribution.map(d => ({
      ...d,
      average: d.count > 0 ? d.amount / d.count : 0
    }));
  }, [filteredTransactions]);

  // 3. TOP 10 COMERCIOS
  const topMerchants = useMemo(() => {
    const merchantTotals: Record<string, { amount: number; count: number }> = {};

    filteredTransactions
      .filter(tx => getTransactionType(tx) === 'expense')
      .forEach(tx => {
        const merchant = getMerchantName(tx);
        if (!merchantTotals[merchant]) {
          merchantTotals[merchant] = { amount: 0, count: 0 };
        }
        merchantTotals[merchant].amount += Math.abs(tx.amount);
        merchantTotals[merchant].count += 1;
      });

    return Object.entries(merchantTotals)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filteredTransactions]);

  // 4. GASTOS POR CATEGORÍA (PIE)
  const categoryDistribution = useMemo(() => {
    const categoryTotals: Record<string, number> = {};

    filteredTransactions
      .filter(tx => getTransactionType(tx) === 'expense')
      .forEach(tx => {
        const category = getCategory(tx);
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(tx.amount);
      });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  // 5. ANÁLISIS DE PATRONES (RADAR)
  const spendingPatterns = useMemo(() => {
    const patterns = {
      'Comida': 0,
      'Transporte': 0,
      'Entretenimiento': 0,
      'Salud': 0,
      'Hogar': 0,
      'Otros': 0
    };

    filteredTransactions
      .filter(tx => getTransactionType(tx) === 'expense')
      .forEach(tx => {
        const category = getCategory(tx).toLowerCase();
        const amount = Math.abs(tx.amount);

        if (category.includes('food') || category.includes('aliment')) {
          patterns['Comida'] += amount;
        } else if (category.includes('transport') || category.includes('car')) {
          patterns['Transporte'] += amount;
        } else if (category.includes('entertainment') || category.includes('entret')) {
          patterns['Entretenimiento'] += amount;
        } else if (category.includes('health') || category.includes('salud')) {
          patterns['Salud'] += amount;
        } else if (category.includes('home') || category.includes('hogar')) {
          patterns['Hogar'] += amount;
        } else {
          patterns['Otros'] += amount;
        }
      });

    const maxValue = Math.max(...Object.values(patterns));

    return Object.entries(patterns).map(([category, value]) => ({
      category,
      value,
      normalized: maxValue > 0 ? (value / maxValue) * 100 : 0
    }));
  }, [filteredTransactions]);

  // 6. INSIGHTS AUTOMÁTICOS
  const insights = useMemo(() => {
    const expenses = filteredTransactions.filter(tx => getTransactionType(tx) === 'expense');
    const totalExpense = expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;

    const lastMonth = expenses.filter(tx => {
      const date = new Date(tx.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const prevMonth = expenses.filter(tx => {
      const date = new Date(tx.date);
      const now = new Date();
      now.setMonth(now.getMonth() - 1);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const lastMonthTotal = lastMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const prevMonthTotal = prevMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const monthlyChange = prevMonthTotal > 0 ? ((lastMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    const biggestCategory = categoryDistribution[0];
    const mostFrequentMerchant = topMerchants[0];

    return [
      {
        icon: TrendingUp,
        color: 'text-blue-400',
        title: 'Gasto promedio',
        value: `$${avgExpense.toFixed(2)}`,
        subtitle: 'por transacción'
      },
      {
        icon: monthlyChange > 0 ? TrendingUp : TrendingDown,
        color: monthlyChange > 0 ? 'text-red-400' : 'text-green-400',
        title: 'Cambio mensual',
        value: `${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`,
        subtitle: 'vs mes anterior'
      },
      {
        icon: ShoppingBag,
        color: 'text-purple-400',
        title: 'Categoría top',
        value: biggestCategory?.name || 'N/A',
        subtitle: `$${biggestCategory?.value.toFixed(2) || 0}`
      },
      {
        icon: Award,
        color: 'text-yellow-400',
        title: 'Comercio frecuente',
        value: mostFrequentMerchant?.name.substring(0, 15) || 'N/A',
        subtitle: `${mostFrequentMerchant?.count || 0} transacciones`
      }
    ];
  }, [filteredTransactions, categoryDistribution, topMerchants]);

  // 7. PROYECCIÓN MENSUAL
  const projection = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();

    const thisMonthExpenses = filteredTransactions
      .filter(tx => {
        const date = new Date(tx.date);
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear() &&
               getTransactionType(tx) === 'expense';
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const projectedTotal = (thisMonthExpenses / dayOfMonth) * daysInMonth;
    const remainingDays = daysInMonth - dayOfMonth;

    return {
      current: thisMonthExpenses,
      projected: projectedTotal,
      remaining: projectedTotal - thisMonthExpenses,
      daysLeft: remainingDays,
      dailyAverage: thisMonthExpenses / dayOfMonth
    };
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Análisis Avanzado</h1>
          <p className="text-white/60">Insights profundos de tus finanzas personales</p>
        </div>

        {/* Time Range Selector */}
        <Card className="p-2 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-white/50" />
            <span className="text-sm text-white/70 mr-2">Período</span>
            <div className="flex gap-1">
              {(['1M', '3M', '6M', '1Y'] as const).map((range) => (
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

        {/* Insights Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-4">
                  <Icon className={`w-6 h-6 ${insight.color} mb-2`} />
                  <p className="text-xs text-white/50 mb-1">{insight.title}</p>
                  <p className="text-xl font-bold text-white mb-1">{insight.value}</p>
                  <p className="text-xs text-white/40">{insight.subtitle}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Proyección del mes */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">💡 Proyección del mes</h3>
              <p className="text-sm text-white/60">Basado en tu ritmo actual de gastos</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">{projection.daysLeft} días restantes</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-white/50 mb-1">Gastado</p>
              <p className="text-2xl font-bold text-white">${projection.current.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Proyectado</p>
              <p className="text-2xl font-bold text-yellow-400">${projection.projected.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Promedio diario</p>
              <p className="text-2xl font-bold text-blue-400">${projection.dailyAverage.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tendencia Mensual */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Tendencia Mensual</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorIncome2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff50" style={{ fontSize: 11 }} />
                <YAxis stroke="#ffffff50" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="Ingresos" stroke="#22C55E" fill="url(#colorIncome2)" />
                <Area type="monotone" dataKey="Gastos" stroke="#EF4444" fill="url(#colorExpense2)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribución Semanal */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📅 Gastos por Día de la Semana</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weekdayDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#ffffff50" style={{ fontSize: 11 }} />
                <YAxis stroke="#ffffff50" style={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="amount" fill="#05BFDB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Distribución por Categoría */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Distribución por Categoría</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
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
          </Card>

          {/* Patrones de Gasto (Radar) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🎭 Patrones de Gasto</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={spendingPatterns}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis dataKey="category" stroke="#ffffff50" style={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#ffffff50" style={{ fontSize: 11 }} />
                <Radar name="Gasto" dataKey="normalized" stroke="#05BFDB" fill="#05BFDB" fillOpacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a2e',
                    border: '1px solid #ffffff20',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Comercios */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Top 10 Comercios</h3>
          <div className="space-y-3">
            {topMerchants.map((merchant, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-400">#{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-white">{merchant.name}</p>
                    <span className="text-sm font-semibold text-white">${merchant.amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(merchant.amount / topMerchants[0].amount) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">{merchant.count} transacciones</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsPage;