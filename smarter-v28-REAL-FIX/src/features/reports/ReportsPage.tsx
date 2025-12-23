// ============================================
// 📊 REPORTS PAGE v21 - Complete with Filters
// Period filters, chart types, full data integration
// ============================================
import React, { useState, useMemo } from 'react';
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

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];

// Period options
const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoy', days: 1 },
  { value: 'week', label: '7 días', days: 7 },
  { value: 'biweek', label: '15 días', days: 15 },
  { value: 'month', label: '30 días', days: 30 },
  { value: 'quarter', label: '3 meses', days: 90 },
  { value: 'year', label: '1 año', days: 365 },
];

// Chart type options
const CHART_TYPES = [
  { value: 'bar', label: 'Barras', icon: BarChart2 },
  { value: 'line', label: 'Línea', icon: Activity },
  { value: 'area', label: 'Área', icon: TrendingUp },
];

// Custom Tooltip
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
  const { expenses, incomes, goals, budgets, recurringTransactions, theme, currency } = useStore();
  const themeColors = getThemeColors(theme);

  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  // Get period config
  const periodConfig = PERIOD_OPTIONS.find(p => p.value === selectedPeriod) || PERIOD_OPTIONS[3];

  // Filter data by period
  const filteredData = useMemo(() => {
    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - periodConfig.days);

    const filteredExpenses = safeExpenses.filter(e => {
      const date = new Date(e.date);
      return date >= fromDate && date <= now;
    });

    const filteredIncomes = safeIncomes.filter(i => {
      const date = new Date(i.date);
      return date >= fromDate && date <= now;
    });

    return { expenses: filteredExpenses, incomes: filteredIncomes };
  }, [safeExpenses, safeIncomes, periodConfig.days]);

  // Calculate recurring for period
  const recurringTotals = useMemo(() => {
    let income = 0;
    let expense = 0;

    safeRecurring.forEach(r => {
      if (!r.isActive) return;
      
      let monthlyAmount = Number(r.amount) || 0;
      
      // Convert to monthly equivalent
      switch (r.frequency) {
        case 'daily': monthlyAmount *= 30; break;
        case 'weekly': monthlyAmount *= 4; break;
        case 'biweekly': monthlyAmount *= 2; break;
        case 'yearly': monthlyAmount /= 12; break;
      }

      // Scale to period
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

  // Calculate totals
  const totals = useMemo(() => {
    const baseIncome = filteredData.incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const baseExpense = filteredData.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const totalIncome = baseIncome + recurringTotals.income;
    const totalExpense = baseExpense + recurringTotals.expense;
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    return { totalIncome, totalExpense, balance, savingsRate, baseIncome, baseExpense };
  }, [filteredData, recurringTotals]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    filteredData.expenses.forEach(e => {
      const cat = e.category || 'Otros';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
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

  // Trend data for chart
  const trendData = useMemo(() => {
    const groupedData: Record<string, { income: number; expenses: number }> = {};
    
    // Determine grouping based on period
    const getGroupKey = (date: Date) => {
      if (periodConfig.days <= 7) {
        return date.toLocaleDateString('es', { weekday: 'short' });
      } else if (periodConfig.days <= 31) {
        return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
      } else {
        return date.toLocaleDateString('es', { month: 'short' });
      }
    };

    filteredData.incomes.forEach(i => {
      const key = getGroupKey(new Date(i.date));
      if (!groupedData[key]) groupedData[key] = { income: 0, expenses: 0 };
      groupedData[key].income += Number(i.amount) || 0;
    });

    filteredData.expenses.forEach(e => {
      const key = getGroupKey(new Date(e.date));
      if (!groupedData[key]) groupedData[key] = { income: 0, expenses: 0 };
      groupedData[key].expenses += Number(e.amount) || 0;
    });

    return Object.entries(groupedData).map(([name, data]) => ({
      name,
      Ingresos: data.income,
      Gastos: data.expenses,
    }));
  }, [filteredData, periodConfig.days]);

  // Budget status
  const budgetStatus = useMemo(() => {
    return Object.entries(safeBudgets).slice(0, 6).map(([category, limit]) => {
      const spent = categoryData.find(c => c.name.toLowerCase() === category.toLowerCase())?.value || 0;
      const percentage = limit > 0 ? (spent / Number(limit)) * 100 : 0;
      return {
        category,
        limit: Number(limit),
        spent,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe'
      };
    });
  }, [safeBudgets, categoryData]);

  // Goals progress
  const goalsProgress = useMemo(() => {
    return safeGoals.slice(0, 6).map(g => ({
      name: g.name,
      current: Number(g.currentAmount) || 0,
      target: Number(g.targetAmount) || 1,
      percentage: Math.min(((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1)) * 100, 100),
      icon: g.icon || '🎯'
    }));
  }, [safeGoals]);

  // Render trend chart using ChartSelector
  const renderTrendChart = () => {
    return (
      <ChartSelector
        data={trendData}
        title="📈 Tendencia de Ingresos y Gastos"
        colors={['#22C55E', '#EF4444']}
        themeColors={themeColors}
      />
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <BarChart2 className="w-7 h-7" style={{ color: themeColors.primary }} />
          Reportes Financieros
        </h1>
        <p className="text-white/60 mt-1">Análisis de tus finanzas</p>
      </div>

      {/* Period Filter */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/60">Período</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map(period => (
            <Button
              key={period.value}
              size="sm"
              variant={selectedPeriod === period.value ? 'primary' : 'secondary'}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Summary Cards - Glassmorphism */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
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
        
        <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
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
        
        <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
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
        
        <Card className="p-4 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
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

      {/* Chart Type Selector */}
      <div className="flex justify-center gap-2">
        {CHART_TYPES.map(type => (
          <Button
            key={type.value}
            size="sm"
            variant={chartType === type.value ? 'primary' : 'secondary'}
            onClick={() => setChartType(type.value)}
          >
            <type.icon className="w-4 h-4 mr-1" />
            {type.label}
          </Button>
        ))}
      </div>

      {/* Trend Chart */}
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

      {/* Category Distribution */}
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

      {/* Top Categories */}
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

      {/* Budget Status */}
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

      {/* Goals Progress */}
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

      {/* Recurring Summary */}
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
  );
};

export default ReportsPage;
