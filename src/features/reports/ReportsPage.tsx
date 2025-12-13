// ============================================
// 📊 REPORTS PAGE - COMPLETE WITH CHARTS
// ============================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, TrendingDown, PieChart, Calendar, Download, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Select, Badge, Tabs, StatCard } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, getMonthlyData, calculateFinancialSummary, getCategorySummary, calculateComparison, getSpendingTrend, getDailyAverage, filterByMonth, filterByDateRange } from '../../utils/financial';

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];
const PERIODS = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: '180', label: 'Últimos 6 meses' },
  { value: '365', label: 'Último año' },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-500 border border-white/20 rounded-lg p-3 shadow-xl">
        <p className="text-white/60 text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="font-semibold" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ReportsPage: React.FC = () => {
  const { expenses, incomes, currency, theme } = useStore();
  const themeColors = getThemeColors(theme);

  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  // Filter data by period
  const filteredData = useMemo(() => {
    const days = parseInt(period);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const toDate = new Date();

    return {
      expenses: filterByDateRange(expenses, fromDate, toDate),
      incomes: filterByDateRange(incomes, fromDate, toDate),
    };
  }, [expenses, incomes, period]);

  // Summary calculations
  const summary = useMemo(() => calculateFinancialSummary(filteredData.expenses, filteredData.incomes), [filteredData]);
  const comparison = useMemo(() => calculateComparison(expenses, incomes), [expenses, incomes]);
  const categoryData = useMemo(() => getCategorySummary(filteredData.expenses), [filteredData.expenses]);
  const monthlyData = useMemo(() => getMonthlyData(expenses, incomes, 6), [expenses, incomes]);
  const spendingTrend = useMemo(() => getSpendingTrend(filteredData.expenses, parseInt(period)), [filteredData.expenses, period]);
  const dailyAverage = useMemo(() => getDailyAverage(filteredData.expenses, parseInt(period)), [filteredData.expenses, period]);

  // Totals
  const totalIncome = filteredData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Pie chart data
  const pieData = categoryData.slice(0, 6).map((cat, i) => ({
    name: cat.category,
    value: cat.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Daily spending for the period
  const dailySpending = useMemo(() => {
    const days = parseInt(period);
    const data: { date: string; amount: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayExpenses = filteredData.expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);
      data.push({ date: date.toLocaleDateString('es', { day: '2-digit', month: 'short' }), amount: dayExpenses });
    }

    // Group by week if more than 30 days
    if (days > 30) {
      const weeklyData: { date: string; amount: number }[] = [];
      for (let i = 0; i < data.length; i += 7) {
        const week = data.slice(i, i + 7);
        const total = week.reduce((sum, d) => sum + d.amount, 0);
        weeklyData.push({ date: week[0].date, amount: total });
      }
      return weeklyData;
    }

    return data;
  }, [filteredData.expenses, period]);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorías', icon: <PieChart className="w-4 h-4" /> },
    { id: 'trends', label: 'Tendencias', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="text-white/60 mt-1">Análisis de tus finanzas</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onChange={e => setPeriod(e.target.value)} options={PERIODS} />
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Exportar</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ingresos" value={formatCurrency(totalIncome, currency)} icon={<ArrowUpRight className="w-5 h-5" />} change={comparison.percentageChange.income} changeLabel="vs mes anterior" className="border-l-4 border-success-500" />
        <StatCard title="Gastos" value={formatCurrency(totalExpenses, currency)} icon={<ArrowDownRight className="w-5 h-5" />} change={comparison.percentageChange.expenses} changeLabel="vs mes anterior" className="border-l-4 border-danger-500" />
        <StatCard title="Balance" value={formatCurrency(balance, currency)} icon={balance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />} change={comparison.percentageChange.balance} className={cn('border-l-4', balance >= 0 ? 'border-success-500' : 'border-danger-500')} />
        <StatCard title="Gasto Diario Prom." value={formatCurrency(dailyAverage, currency)} icon={<Calendar className="w-5 h-5" />} className="border-l-4 border-primary-500" />
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Comparison Chart */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Ingresos vs Gastos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend />
                  <Bar dataKey="income" name="Ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Balance Trend */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Balance Mensual</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={themeColors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={themeColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Area type="monotone" dataKey="balance" name="Balance" stroke={themeColors.primary} fill="url(#balanceGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Distribución de Gastos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category List */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Top Categorías</h3>
            <div className="space-y-4">
              {categoryData.slice(0, 8).map((cat, index) => (
                <motion.div key={cat.category} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-white truncate">{cat.category}</span>
                      <span className="font-semibold text-white">{formatCurrency(cat.amount, currency)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-white/50">
                      <span>{cat.count} transacciones</span>
                      <span>{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Spending Trend Alert */}
          <Card className={cn('border-l-4', spendingTrend > 10 ? 'border-danger-500 bg-danger-500/5' : spendingTrend < -10 ? 'border-success-500 bg-success-500/5' : 'border-primary-500')}>
            <div className="flex items-center gap-4">
              {spendingTrend > 10 ? <TrendingUp className="w-8 h-8 text-danger-400" /> : spendingTrend < -10 ? <TrendingDown className="w-8 h-8 text-success-400" /> : <BarChart2 className="w-8 h-8 text-primary-400" />}
              <div>
                <h3 className="font-semibold text-white">Tendencia de Gastos</h3>
                <p className="text-white/60">
                  {spendingTrend > 10 ? `Tus gastos aumentaron ${spendingTrend.toFixed(1)}% en este período` : spendingTrend < -10 ? `Tus gastos disminuyeron ${Math.abs(spendingTrend).toFixed(1)}% en este período` : 'Tus gastos se mantienen estables'}
                </p>
              </div>
            </div>
          </Card>

          {/* Daily Spending Chart */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Gasto {parseInt(period) > 30 ? 'Semanal' : 'Diario'}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySpending}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} interval={parseInt(period) > 30 ? 0 : 'preserveStartEnd'} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Line type="monotone" dataKey="amount" name="Gasto" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Savings Rate */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Tasa de Ahorro</h3>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <circle cx="64" cy="64" r="56" fill="none" stroke={summary.savingsRate >= 20 ? '#22C55E' : summary.savingsRate >= 10 ? '#F59E0B' : '#EF4444'} strokeWidth="12" strokeDasharray={`${(summary.savingsRate / 100) * 352} 352`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{Math.max(0, summary.savingsRate).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <p className="text-white/60 mb-2">
                  {summary.savingsRate >= 20 ? '¡Excelente! Estás ahorrando más del 20% de tus ingresos.' : summary.savingsRate >= 10 ? 'Buen trabajo. Intenta llegar al 20% para mejores resultados.' : summary.savingsRate >= 0 ? 'Podrías mejorar tu tasa de ahorro. El objetivo es 20% o más.' : 'Estás gastando más de lo que ganas. Revisa tus gastos.'}
                </p>
                <div className="flex gap-4">
                  <div><p className="text-xs text-white/50">Ingresos</p><p className="font-semibold text-success-400">{formatCurrency(totalIncome, currency)}</p></div>
                  <div><p className="text-xs text-white/50">Gastos</p><p className="font-semibold text-danger-400">{formatCurrency(totalExpenses, currency)}</p></div>
                  <div><p className="text-xs text-white/50">Ahorro</p><p className="font-semibold text-primary-400">{formatCurrency(Math.max(0, balance), currency)}</p></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
