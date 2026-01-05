// src/features/reports/ReportsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, TrendingDown, PieChart, Calendar, 
  ArrowUpRight, ArrowDownRight, Target, Activity, Filter,
  RefreshCw, DollarSign, Percent, Wallet, CreditCard
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  LineChart, Line
} from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { ChartSelector } from '../../components/ui/ChartSelector';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoy', days: 1 },
  { value: 'week', label: '7 días', days: 7 },
  { value: 'biweek', label: '15 días', days: 15 },
  { value: 'month', label: '30 días', days: 30 },
  { value: 'quarter', label: '3 meses', days: 90 },
  { value: 'year', label: '1 año', days: 365 },
];

const CHART_TYPES = [
  { value: 'bar', label: 'Barras', icon: BarChart2 },
  { value: 'line', label: 'Línea', icon: Activity },
  { value: 'area', label: 'Área', icon: TrendingUp },
];

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

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-sm">
        <p className="text-white/60 text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-semibold text-sm" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ReportsPage: React.FC = () => {
  const { goals, budgets, recurringTransactions, theme, currency } = useStore();
  const themeColors = getThemeColors(theme);
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('area');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txns: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.recurring) {
            txns.push({ id: doc.id, ...data } as Transaction);
          }
        });
        
        txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(txns);
        setLoading(false);
      },
      (error) => {
        console.error('Error en reportes listener:', error);
        if (error.code === 'permission-denied') {
          console.error('❌ Error de permisos en reportes.');
        }
        setLoading(false);
        setTransactions([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  const periodConfig = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[3];

  const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
    if (tx.synced_from_plaid) {
      return tx.amount > 0 ? 'expense' : 'income';
    }
    return tx.type || 'expense';
  };

  const getTransactionCategory = (tx: Transaction): string => {
    if (tx.synced_from_plaid && Array.isArray(tx.category)) {
      return tx.category[0] || 'Otros';
    }
    return tx.category as string || 'Otros';
  };

  const filteredData = useMemo(() => {
    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - periodConfig.days);

    const filtered = transactions.filter(tx => {
      const date = new Date(tx.date);
      return date >= fromDate && date <= now;
    });

    const incomes = filtered.filter(tx => getTransactionType(tx) === 'income');
    const expenses = filtered.filter(tx => getTransactionType(tx) === 'expense');

    return { incomes, expenses };
  }, [transactions, periodConfig.days]);

  const recurringTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    safeRecurring.forEach(r => {
      if (!r.isActive) return;
      
      let monthlyAmount = Number(r.amount) || 0;
      
      switch (r.frequency) {
        case 'daily': monthlyAmount *= 30; break;
        case 'weekly': monthlyAmount *= 4; break;
        case 'biweekly': monthlyAmount *= 2; break;
        case 'yearly': monthlyAmount /= 12; break;
      }

      const periodRatio = periodConfig.days / 30;
      const periodAmount = monthlyAmount * periodRatio;

      if (r.type === 'income') {
        income += periodAmount;
      } else {
        expense += periodAmount;
      }
    });

    return { income, expense };
  }, [safeRecurring, periodConfig.days]);

  const totals = useMemo(() => {
    const baseIncome = filteredData.incomes.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const baseExpense = filteredData.expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const totalIncome = baseIncome + recurringTotals.income;
    const totalExpense = baseExpense + recurringTotals.expense;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    return { totalIncome, totalExpense, balance, savingsRate, baseIncome, baseExpense };
  }, [filteredData, recurringTotals]);

  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredData.expenses.forEach(tx => {
      const cat = getTransactionCategory(tx);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(tx.amount);
    });

    return Object.entries(categoryTotals)
      .map(([name, value], index) => ({
        name,
        value,
        fill: CHART_COLORS[index % CHART_COLORS.length],
        percentage: totals.totalExpense > 0 ? (value / totals.totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData.expenses, totals.totalExpense]);

  const trendData = useMemo(() => {
    const groupedData: Record<string, { income: number; expenses: number }> = {};
    
    const getGroupKey = (date: Date) => {
      if (periodConfig.days <= 7) {
        return date.toLocaleDateString('es', { weekday: 'short' });
      } else if (periodConfig.days <= 31) {
        return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      } else {
        return date.toLocaleDateString('es', { month: 'short' });
      }
    };

    filteredData.incomes.forEach(tx => {
      const key = getGroupKey(new Date(tx.date));
      if (!groupedData[key]) groupedData[key] = { income: 0, expenses: 0 };
      groupedData[key].income += Math.abs(tx.amount);
    });

    filteredData.expenses.forEach(tx => {
      const key = getGroupKey(new Date(tx.date));
      if (!groupedData[key]) groupedData[key] = { income: 0, expenses: 0 };
      groupedData[key].expenses += Math.abs(tx.amount);
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      Ingresos: data.income,
      Gastos: data.expenses,
    }));
  }, [filteredData, periodConfig.days]);

  const budgetStatus = useMemo(() => {
    return Object.entries(safeBudgets).slice(0, 6).map(([category, limit]) => {
      const spent = categoryData.find(c => c.name.toLowerCase() === category.toLowerCase())?.value || 0;
      const percentage = limit > 0 ? (spent / Number(limit)) * 100 : 0;
      return {
        category,
        limit: Number(limit),
        spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      };
    });
  }, [categoryData, safeBudgets]);

  const goalsProgress = useMemo(() => {
    return safeGoals.slice(0, 6).map(g => ({
      name: g.name,
      icon: g.icon || '🎯',
      current: Number(g.currentAmount) || 0,
      target: Number(g.targetAmount) || 1,
      percentage: ((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1)) * 100
    }));
  }, [safeGoals]);

  const renderTrendChart = () => {
    const chartProps = {
      data: trendData,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    const commonComponents = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" style={{ fontSize: 11 }} />
        <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip currency={currency} />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </>
    );

    return (
      <ResponsiveContainer width="100%" height={200}>
        {chartType === 'bar' ? (
          <BarChart {...chartProps}>
            {commonComponents}
            <Bar dataKey="Ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : chartType === 'line' ? (
          <LineChart {...chartProps}>
            {commonComponents}
            <Line type="monotone" dataKey="Ingresos" stroke="#22C55E" strokeWidth={2} />
            <Line type="monotone" dataKey="Gastos" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        ) : (
          <AreaChart {...chartProps}>
            {commonComponents}
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="Ingresos" stroke="#22C55E" fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="Gastos" stroke="#EF4444" fill="url(#colorExpense)" />
          </AreaChart>
        )}
      </ResponsiveContainer>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">📊 Reportes</h1>
        </div>

        <Card className="p-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Calendar className="w-5 h-5 text-white/50 flex-shrink-0" />
            <span className="text-sm text-white/70 mr-2 flex-shrink-0">Período</span>
            {PERIOD_OPTIONS.map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap',
                  selectedPeriod === period.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-success-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-400" />
            </div>
            <p className="text-xs text-white/60 mb-1">Ingresos</p>
            <p className="text-xl font-bold text-success-400">{formatCurrency(totals.totalIncome, currency)}</p>
            {recurringTotals.income > 0 && (
              <p className="text-xs text-white/40 mt-1">
                +{formatCurrency(recurringTotals.income, currency)} recurrente
              </p>
            )}
          </Card>
          
          <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-danger-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger-400" />
            </div>
            <p className="text-xs text-white/60 mb-1">Gastos</p>
            <p className="text-xl font-bold text-danger-400">{formatCurrency(totals.totalExpense, currency)}</p>
            {recurringTotals.expense > 0 && (
              <p className="text-xs text-white/40 mt-1">
                +{formatCurrency(recurringTotals.expense, currency)} recurrente
              </p>
            )}
          </Card>
          
          <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10">
            <div className={cn(
              "w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center",
              totals.balance >= 0 ? "bg-primary-500/20" : "bg-warning-500/20"
            )}>
              <Wallet className="w-5 h-5" style={{ color: totals.balance >= 0 ? themeColors.primary : '#F59E0B' }} />
            </div>
            <p className="text-xs text-white/60 mb-1">Balance</p>
            <p className={cn('text-xl font-bold', totals.balance >= 0 ? 'text-primary-400' : 'text-warning-400')}>
              {formatCurrency(totals.balance, currency)}
            </p>
          </Card>
          
          <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10">
            <div className={cn(
              "w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center",
              totals.savingsRate >= 20 ? "bg-success-500/20" : totals.savingsRate >= 0 ? "bg-warning-500/20" : "bg-danger-500/20"
            )}>
              <Percent className="w-5 h-5" style={{ 
                color: totals.savingsRate >= 20 ? '#22C55E' : totals.savingsRate >= 0 ? '#F59E0B' : '#EF4444' 
              }} />
            </div>
            <p className="text-xs text-white/60 mb-1">Tasa Ahorro</p>
            <p className={cn(
              'text-xl font-bold',
              totals.savingsRate >= 20 ? 'text-success-400' : totals.savingsRate >= 0 ? 'text-warning-400' : 'text-danger-400'
            )}>
              {totals.savingsRate.toFixed(1)}%
            </p>
          </Card>
        </div>

        <div className="flex gap-2 justify-center">
          {CHART_TYPES.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setChartType(type.value as any)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2',
                  chartType === type.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                )}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 text-center">📈 Ingresos vs Gastos</h3>
          {trendData.length > 0 ? (
            renderTrendChart()
          ) : (
            <div className="h-[200px] flex items-center justify-center text-white/50">
              <div className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos para este período</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          {categoryData.length > 0 ? (
            <ChartSelector
              data={categoryData}
              title="🎯 Distribución de Gastos por Categoría"
              colors={CHART_COLORS}
              themeColors={themeColors}
            />
          ) : (
            <div>
              <h3 className="font-semibold text-white mb-4 text-center">🎯 Distribución de Gastos</h3>
              <div className="h-[200px] flex items-center justify-center text-white/50">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Agrega gastos para ver la distribución</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {categoryData.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">🏆 Top Categorías</h3>
            <div className="space-y-3">
              {categoryData.slice(0, 5).map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">{cat.name}</span>
                    <span className="text-white/60">{formatCurrency(cat.value, currency)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {budgetStatus.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">💰 Estado de Presupuestos</h3>
            <div className="grid grid-cols-2 gap-3">
              {budgetStatus.map((b, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white truncate">{b.category}</span>
                    <Badge 
                      variant={b.status === 'exceeded' ? 'danger' : b.status === 'warning' ? 'warning' : 'success'} 
                      size="sm"
                    >
                      {b.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full',
                        b.status === 'exceeded' ? 'bg-danger-500' : b.status === 'warning' ? 'bg-warning-500' : 'bg-success-500'
                      )}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {goalsProgress.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">🎯 Progreso de Metas</h3>
            <div className="grid grid-cols-2 gap-3">
              {goalsProgress.map((g, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-sm text-white truncate">{g.name}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${g.percentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full rounded-full bg-primary-500"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>{formatCurrency(g.current, currency)}</span>
                    <span>{g.percentage.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {(recurringTotals.income > 0 || recurringTotals.expense > 0) && (
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">🔄 Recurrentes en el Período</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-1 text-success-400" />
                <p className="text-xs text-white/50">Ingresos</p>
                <p className="font-bold text-success-400">{formatCurrency(recurringTotals.income, currency)}</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-1 text-danger-400" />
                <p className="text-xs text-white/50">Gastos</p>
                <p className="font-bold text-danger-400">{formatCurrency(recurringTotals.expense, currency)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;