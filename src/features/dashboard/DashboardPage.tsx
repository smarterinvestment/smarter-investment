// src/features/dashboard/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
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
  ShoppingBag,
  AlertCircle,
  Zap,
  Clock,
  Award,
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
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { BudgetComparisonChart } from '../../components/BudgetComparisonChart';
import { useStore } from '../../stores/useStore';
import { motion } from 'framer-motion';

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

const COLORS = ['#05bfdb', '#08c792', '#ffc107', '#ff5722', '#9c27b0', '#EC4899', '#14B8A6', '#F97316'];

export const DashboardPage: React.FC = () => {
  const { setActivePage } = useStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M' | 'YTD' | 'ALL'>('1M');

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

    const unsubTx = onSnapshot(
      txQuery,
      (snapshot) => {
        const txns: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.recurring) {
            txns.push({ id: doc.id, ...data } as Transaction);
          }
        });
        
        txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(txns.slice(0, 100));
        setLoading(false);
      },
      (error) => {
        console.error('Error en transacciones listener:', error);
        if (error.code === 'permission-denied') {
          console.error('❌ Error de permisos. Verifica las reglas de Firebase.');
        }
        setLoading(false);
      }
    );

    const goalsQuery = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );

    const unsubGoals = onSnapshot(
      goalsQuery,
      (snapshot) => {
        const goalsData: Goal[] = [];
        snapshot.forEach((doc) => {
          goalsData.push({ id: doc.id, ...doc.data() } as Goal);
        });
        setGoals(goalsData.slice(0, 3));
      },
      (error) => {
        console.error('Error en metas listener:', error);
      }
    );

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

  const getMerchantName = (tx: Transaction): string => {
    return tx.merchant_name || tx.name || tx.description || 'Comercio';
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

  // ========================================
  // ANÁLISIS AVANZADOS
  // ========================================

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
        const category = getTransactionCategory(tx);
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
        const category = getTransactionCategory(tx).toLowerCase();
        const amount = Math.abs(tx.amount);

        if (category.includes('food') || category.includes('aliment')) {
          patterns['Comida'] += amount;
        } else if (category.includes('transport') || category.includes('travel')) {
          patterns['Transporte'] += amount;
        } else if (category.includes('entertain') || category.includes('recreation')) {
          patterns['Entretenimiento'] += amount;
        } else if (category.includes('health') || category.includes('medical')) {
          patterns['Salud'] += amount;
        } else if (category.includes('home') || category.includes('house')) {
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

  // 6. INSIGHTS
  const insights = useMemo(() => {
    const avgDaily = totalExpense / Math.max(filteredTransactions.filter(tx => getTransactionType(tx) === 'expense').length, 1);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const topCategory = categoryDistribution[0]?.name || 'N/A';
    const topMerchant = topMerchants[0]?.name || 'N/A';

    return [
      {
        title: 'Gasto Promedio',
        value: `$${avgDaily.toFixed(2)}`,
        subtitle: 'por transacción',
        icon: DollarSign,
        color: 'text-blue-400'
      },
      {
        title: 'Tasa de Ahorro',
        value: `${savingsRate.toFixed(0)}%`,
        subtitle: savingsRate > 20 ? '¡Excelente!' : 'Puede mejorar',
        icon: TrendingUp,
        color: savingsRate > 20 ? 'text-green-400' : 'text-yellow-400'
      },
      {
        title: 'Categoría Top',
        value: topCategory,
        subtitle: 'Mayor gasto',
        icon: Target,
        color: 'text-purple-400'
      },
      {
        title: 'Comercio Frecuente',
        value: topMerchant,
        subtitle: `${topMerchants[0]?.count || 0} visitas`,
        icon: ShoppingBag,
        color: 'text-pink-400'
      }
    ];
  }, [totalIncome, totalExpense, filteredTransactions, categoryDistribution, topMerchants]);

  // 7. PROYECCIÓN DEL MES
  const projection = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysLeft = daysInMonth - dayOfMonth;

    const monthTxs = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && 
             txDate.getFullYear() === currentYear &&
             getTransactionType(tx) === 'expense';
    });

    const currentSpending = monthTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const dailyAverage = dayOfMonth > 0 ? currentSpending / dayOfMonth : 0;
    const projectedTotal = dailyAverage * daysInMonth;

    return {
      current: currentSpending,
      projected: projectedTotal,
      dailyAverage,
      daysLeft
    };
  }, [filteredTransactions]);

  const lineChartData = getLast30DaysData();
  const categoryData = getCategoryData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              ¡Hola! 👋
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('new-transaction')}
              className="px-3 md:px-4 py-2 rounded-xl font-medium transition-all bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Movimiento</span>
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-400" />
              <span className="text-sm text-white/70 font-medium">Período:</span>
            </div>
            <div className="flex gap-2">
              {(['1W', '1M', '3M', 'YTD', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border-primary-500/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Patrimonio Neto</p>
                <h3 className="text-3xl font-bold text-white">
                  ${netWorth.toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${netWorth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netWorth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="font-medium">{Math.abs(netWorth).toFixed(2)}</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Ingresos</p>
                <h3 className="text-3xl font-bold text-white">
                  ${totalIncome.toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-white/50">
              {filteredTransactions.filter(tx => getTransactionType(tx) === 'income').length} movimientos
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Gastos</p>
                <h3 className="text-3xl font-bold text-white">
                  ${totalExpense.toFixed(2)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
            </div>
            <p className="text-xs text-white/50">
              {filteredTransactions.filter(tx => getTransactionType(tx) === 'expense').length} movimientos
            </p>
          </Card>
        </div>

        {/* INSIGHTS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* PROYECCIÓN DEL MES */}
        <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
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

        {/* GRÁFICA DE PRESUPUESTOS */}
        <div>
          <BudgetComparisonChart />
        </div>

        {/* GRÁFICOS PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ingresos vs Gastos */}
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

          {/* Distribución de Gastos */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-400" />
                Distribución de Gastos
              </h3>
              <button
                onClick={() => setActivePage('reports')}
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

        {/* ANÁLISIS AVANZADOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Distribución por Categoría Mejorada */}
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

        {/* TOP COMERCIOS */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">🏆 Top 10 Comercios</h3>
          {topMerchants.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <p className="text-white/50 text-sm">Sin comercios registrados</p>
            </div>
          )}
        </Card>

        {/* ÚLTIMOS MOVIMIENTOS Y METAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Últimos Movimientos</h3>
              <button
                onClick={() => setActivePage('transactions')}
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
                onClick={() => setActivePage('goals')}
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
                <Button size="sm" onClick={() => setActivePage('goals')}>
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
