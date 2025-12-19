// ============================================
// 📊 REPORTS PAGE v20 - COMPLETE WITH FILTERS
// Period filters, chart type selectors, full data integration
// ============================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, TrendingDown, PieChart, Calendar, 
  ArrowUpRight, ArrowDownRight, Target, Activity, LineChart,
  RefreshCw, DollarSign, Percent
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  LineChart as RechartsLine, Line, RadialBarChart, RadialBar
} from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
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
  { value: 'bar', label: 'Barras', icon: <BarChart2 className="w-4 h-4" /> },
  { value: 'line', label: 'Línea', icon: <LineChart className="w-4 h-4" /> },
  { value: 'area', label: 'Área', icon: <Activity className="w-4 h-4" /> },
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
  const { expenses, incomes, budgets, goals, recurringTransactions, currency, theme } = useStore();
  const themeColors = getThemeColors(theme);

  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  // Safe arrays - CRITICAL for preventing errors
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeBudgets = budgets || {};
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  // Get period config
  const periodConfig = PERIOD_OPTIONS.find(p => p.value === period) || PERIOD_OPTIONS[3];

  // Filter data by period
  const filteredData = useMemo(() => {
    const days = periodConfig.days;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    fromDate.setHours(0, 0, 0, 0);
    const fromStr = fromDate.toISOString().split('T')[0];

    return {
      expenses: safeExpenses.filter(e => e.date >= fromStr),
      incomes: safeIncomes.filter(i => i.date >= fromStr),
    };
  }, [safeExpenses, safeIncomes, periodConfig.days]);

  // Calculate recurring monthly equivalents
  const recurringTotals = useMemo(() => {
    const activeRecurring = safeRecurring.filter(r => r.isActive);
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    activeRecurring.forEach(r => {
      const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : 
                   r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
      const monthly = r.amount * mult;
      if (r.type === 'income') monthlyIncome += monthly;
      else monthlyExpense += monthly;
    });

    // Scale to period
    const periodRatio = periodConfig.days / 30;
    return {
      income: monthlyIncome * periodRatio,
      expense: monthlyExpense * periodRatio,
    };
  }, [safeRecurring, periodConfig.days]);

  // Calculate totals including recurring
  const totals = useMemo(() => {
    const baseIncome = filteredData.incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const baseExpenses = filteredData.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const totalIncome = baseIncome + recurringTotals.income;
    const totalExpenses = baseExpenses + recurringTotals.expense;
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, balance, savingsRate, baseIncome, baseExpenses };
  }, [filteredData, recurringTotals]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const catTotals: Record<string, number> = {};
    filteredData.expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + (Number(e.amount) || 0);
    });
    
    return Object.entries(catTotals)
      .map(([name, value], i) => ({
        name: name.length > 10 ? name.substring(0, 10) + '...' : name,
        fullName: name,
        value,
        fill: CHART_COLORS[i % CHART_COLORS.length],
        percentage: totals.totalExpenses > 0 ? (value / totals.totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData.expenses, totals.totalExpenses]);

  // Trend data for chart
  const trendData = useMemo(() => {
    const days = periodConfig.days;
    const dataPoints: { label: string; ingresos: number; gastos: number }[] = [];
    
    // Determine grouping
    let groupDays = 1;
    let numPoints = days;
    if (days > 90) { groupDays = 30; numPoints = Math.ceil(days / 30); }
    else if (days > 30) { groupDays = 7; numPoints = Math.ceil(days / 7); }
    else if (days > 7) { groupDays = 1; numPoints = days; }
    else { groupDays = 1; numPoints = days; }

    // Limit points
    numPoints = Math.min(numPoints, 12);
    groupDays = Math.ceil(days / numPoints);

    const now = new Date();
    for (let i = numPoints - 1; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i + 1) * groupDays);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - i * groupDays);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const periodExpenses = filteredData.expenses
        .filter(e => e.date >= startStr && e.date < endStr)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      
      const periodIncomes = filteredData.incomes
        .filter(i => i.date >= startStr && i.date < endStr)
        .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

      let label: string;
      if (days <= 7) {
        label = startDate.toLocaleDateString('es', { weekday: 'short' });
      } else if (days <= 30) {
        label = startDate.toLocaleDateString('es', { day: '2-digit', month: 'short' });
      } else {
        label = startDate.toLocaleDateString('es', { month: 'short' });
      }

      dataPoints.push({ label, ingresos: periodIncomes, gastos: periodExpenses });
    }

    return dataPoints;
  }, [filteredData, periodConfig.days]);

  // Budget status
  const budgetStatus = useMemo(() => {
    return Object.entries(safeBudgets).map(([category, limit]) => {
      const spent = filteredData.expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      return { category, limit, spent, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [safeBudgets, filteredData.expenses]);

  // Goals progress
  const goalsProgress = useMemo(() => {
    return safeGoals.map(g => ({
      name: g.name,
      progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0,
      current: g.currentAmount,
      target: g.targetAmount,
      fill: g.color || themeColors.primary,
    }));
  }, [safeGoals, themeColors.primary]);

  // Render trend chart based on type
  const renderTrendChart = () => {
    const commonProps = {
      data: trendData,
      margin: { top: 10, right: 10, left: -10, bottom: 0 },
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RechartsLine {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Line type="monotone" dataKey="ingresos" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} name="Ingresos" />
            <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Gastos" />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </RechartsLine>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area type="monotone" dataKey="ingresos" stroke="#22C55E" fill="url(#incomeGrad)" strokeWidth={2} name="Ingresos" />
            <Area type="monotone" dataKey="gastos" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={2} name="Gastos" />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: bar
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart {...commonProps} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Bar dataKey="ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} name="Ingresos" />
          <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gastos" />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Period & Chart Type Selectors */}
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <BarChart2 className="w-6 h-6" style={{ color: themeColors.primary }} />
            Reportes Financieros
          </h1>
          <p className="text-white/60 mt-1">Análisis detallado de tus finanzas</p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Period Selector */}
          <div className="flex bg-white/5 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  period === opt.value ? 'text-white' : 'text-white/50 hover:text-white'
                )}
                style={period === opt.value ? { backgroundColor: `${themeColors.primary}30`, color: themeColors.primary } : {}}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-white/5 rounded-xl p-1">
            {CHART_TYPES.map(opt => (
              <button
                key={opt.value}
                onClick={() => setChartType(opt.value as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1',
                  chartType === opt.value ? 'text-white' : 'text-white/50 hover:text-white'
                )}
                style={chartType === opt.value ? { backgroundColor: `${themeColors.primary}30`, color: themeColors.primary } : {}}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-success-400" />
          <p className="text-xs text-white/50">Ingresos</p>
          <p className="text-lg font-bold text-success-400">{formatCurrency(totals.totalIncome, currency)}</p>
          <div className="w-full h-1 bg-success-500/20 rounded-full mt-2">
            <div className="h-full bg-success-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </Card>
        <Card className="p-4 text-center">
          <ArrowDownRight className="w-8 h-8 mx-auto mb-2 text-danger-400" />
          <p className="text-xs text-white/50">Gastos</p>
          <p className="text-lg font-bold text-danger-400">{formatCurrency(totals.totalExpenses, currency)}</p>
          <div className="w-full h-1 bg-danger-500/20 rounded-full mt-2">
            <div className="h-full bg-danger-500 rounded-full" style={{ width: `${Math.min(100, totals.totalIncome > 0 ? (totals.totalExpenses / totals.totalIncome) * 100 : 0)}%` }} />
          </div>
        </Card>
        <Card className="p-4 text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2" style={{ color: totals.balance >= 0 ? '#22C55E' : '#EF4444' }} />
          <p className="text-xs text-white/50">Balance</p>
          <p className={cn('text-lg font-bold', totals.balance >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(totals.balance, currency)}
          </p>
        </Card>
        <Card className="p-4 text-center">
          <Percent className="w-8 h-8 mx-auto mb-2" style={{ color: totals.savingsRate >= 20 ? '#22C55E' : totals.savingsRate >= 10 ? '#F59E0B' : '#EF4444' }} />
          <p className="text-xs text-white/50">Ahorro</p>
          <p className={cn('text-lg font-bold', totals.savingsRate >= 20 ? 'text-success-400' : totals.savingsRate >= 10 ? 'text-warning-400' : 'text-danger-400')}>
            {totals.savingsRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: themeColors.primary }} />
            Tendencia {periodConfig.label}
          </h3>
          {trendData.length > 0 ? renderTrendChart() : (
            <div className="h-48 flex items-center justify-center text-white/50">
              No hay datos para el período seleccionado
            </div>
          )}
        </Card>

        {/* Category Distribution */}
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <PieChart className="w-5 h-5" style={{ color: themeColors.primary }} />
            Distribución por Categoría
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/50">
              No hay datos para mostrar
            </div>
          )}
        </Card>
      </div>

      {/* Top Categories List */}
      {categoryData.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 text-center">Top Categorías de Gasto</h3>
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: cat.fill }}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white text-sm">{cat.fullName}</span>
                    <span className="text-white/70 text-sm">{formatCurrency(cat.value, currency)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.fill }} />
                  </div>
                </div>
                <span className="text-white/50 text-sm w-12 text-right">{cat.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budget Status */}
      {budgetStatus.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 text-center">Estado de Presupuestos</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetStatus.slice(0, 6).map((b, i) => (
              <div key={i} className={cn('p-3 rounded-xl', b.percentage >= 100 ? 'bg-danger-500/10' : b.percentage >= 80 ? 'bg-warning-500/10' : 'bg-success-500/10')}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">{b.category}</span>
                  <Badge variant={b.percentage >= 100 ? 'danger' : b.percentage >= 80 ? 'warning' : 'success'} size="sm">
                    {b.percentage.toFixed(0)}%
                  </Badge>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full rounded-full', b.percentage >= 100 ? 'bg-danger-500' : b.percentage >= 80 ? 'bg-warning-500' : 'bg-success-500')} 
                    style={{ width: `${Math.min(100, b.percentage)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>{formatCurrency(b.spent, currency)}</span>
                  <span>{formatCurrency(b.limit, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Goals Progress */}
      {goalsProgress.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 text-center">Progreso de Metas</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalsProgress.slice(0, 6).map((g, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm font-medium">{g.name}</span>
                  <span className="text-sm font-bold" style={{ color: g.fill }}>{g.progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, g.progress)}%`, backgroundColor: g.fill }} />
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>{formatCurrency(g.current, currency)}</span>
                  <span>{formatCurrency(g.target, currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recurring Summary */}
      {safeRecurring.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" style={{ color: themeColors.primary }} />
            Transacciones Recurrentes (equivalente mensual)
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-white/50">Ingresos Fijos</p>
              <p className="text-lg font-bold text-success-400">{formatCurrency(recurringTotals.income * (30 / periodConfig.days), currency)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Gastos Fijos</p>
              <p className="text-lg font-bold text-danger-400">{formatCurrency(recurringTotals.expense * (30 / periodConfig.days), currency)}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Balance Fijo</p>
              <p className={cn('text-lg font-bold', recurringTotals.income > recurringTotals.expense ? 'text-success-400' : 'text-danger-400')}>
                {formatCurrency((recurringTotals.income - recurringTotals.expense) * (30 / periodConfig.days), currency)}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
