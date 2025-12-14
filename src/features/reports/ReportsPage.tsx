// ============================================
// 📊 REPORTS PAGE - ADVANCED CHARTS
// Radar, Heatmap, Treemap, Waterfall, Gauge
// ============================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, TrendingDown, PieChart, Calendar, 
  Download, ArrowUpRight, ArrowDownRight, Target, Radar, 
  Grid3X3, Activity, Gauge 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line 
} from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { 
  formatCurrency, getMonthlyData, calculateFinancialSummary, 
  getCategorySummary, calculateComparison, getSpendingTrend, 
  getDailyAverage, filterByDateRange 
} from '../../utils/financial';
import {
  BudgetRadarChart,
  SpendingHeatmap,
  CategoryTreemap,
  CashFlowWaterfall,
  SavingsGauge,
  GoalsProgressRing,
  Sparkline,
} from '../../components/charts/AdvancedCharts';

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];

const PERIODS = [
  { value: '7', label: '7 días' },
  { value: '30', label: '30 días' },
  { value: '90', label: '3 meses' },
  { value: '180', label: '6 meses' },
  { value: '365', label: '1 año' },
];

const TABS = [
  { id: 'overview', label: 'Resumen', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'advanced', label: 'Avanzado', icon: <Activity className="w-4 h-4" /> },
  { id: 'trends', label: 'Tendencias', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'goals', label: 'Metas', icon: <Target className="w-4 h-4" /> },
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
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
  const { expenses, incomes, budgets, goals, currency, theme } = useStore();
  const themeColors = getThemeColors(theme);

  const [period, setPeriod] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeBudgets = budgets || {};
  const safeGoals = Array.isArray(goals) ? goals : [];

  // Filter data by period
  const filteredData = useMemo(() => {
    const days = parseInt(period);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const toDate = new Date();

    return {
      expenses: filterByDateRange(safeExpenses, fromDate, toDate),
      incomes: filterByDateRange(safeIncomes, fromDate, toDate),
    };
  }, [safeExpenses, safeIncomes, period]);

  // Summary calculations
  const summary = useMemo(() => calculateFinancialSummary(filteredData.expenses, filteredData.incomes), [filteredData]);
  const comparison = useMemo(() => calculateComparison(safeExpenses, safeIncomes), [safeExpenses, safeIncomes]);
  const categoryData = useMemo(() => getCategorySummary(filteredData.expenses), [filteredData.expenses]);
  const monthlyData = useMemo(() => getMonthlyData(safeExpenses, safeIncomes, 6), [safeExpenses, safeIncomes]);

  // Totals
  const totalIncome = filteredData.incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // Pie chart data
  const pieData = categoryData.slice(0, 6).map((cat, i) => ({
    name: cat.category,
    value: cat.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Sparkline data
  const last7DaysExpenses = useMemo(() => {
    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTotal = safeExpenses
        .filter(e => {
          const expDate = typeof e.date === 'string' ? e.date : new Date(e.date).toISOString().split('T')[0];
          return expDate === dateStr;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      data.push(dayTotal);
    }
    return data;
  }, [safeExpenses]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="text-white/60 mt-1">Análisis detallado de tus finanzas</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-white/5 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  period === p.value 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/50 hover:text-white'
                )}
                style={period === p.value ? { 
                  backgroundColor: `${themeColors.primary}20`,
                  color: themeColors.primary 
                } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap',
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-white/50 hover:text-white'
            )}
            style={activeTab === tab.id ? { 
              backgroundColor: `${themeColors.primary}20`,
              color: themeColors.primary,
              boxShadow: `0 0 15px ${themeColors.primary}30`
            } : {}}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-success-400" />
                <span className="text-sm text-white/60">Ingresos</span>
              </div>
              <p className="text-xl font-bold text-success-400">{formatCurrency(totalIncome, currency)}</p>
              <div className="mt-2">
                <Sparkline data={last7DaysExpenses} theme={theme} color="#22C55E" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-danger-400" />
                <span className="text-sm text-white/60">Gastos</span>
              </div>
              <p className="text-xl font-bold text-danger-400">{formatCurrency(totalExpenses, currency)}</p>
              <div className="mt-2">
                <Sparkline data={last7DaysExpenses} theme={theme} color="#EF4444" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5" style={{ color: themeColors.primary }} />
                <span className="text-sm text-white/60">Balance</span>
              </div>
              <p className={cn('text-xl font-bold', balance >= 0 ? 'text-success-400' : 'text-danger-400')}>
                {formatCurrency(balance, currency)}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="w-5 h-5" style={{ color: themeColors.primary }} />
                <span className="text-sm text-white/60">Ahorro</span>
              </div>
              <p className={cn('text-xl font-bold', savingsRate >= 20 ? 'text-success-400' : savingsRate >= 10 ? 'text-warning-400' : 'text-danger-400')}>
                {savingsRate.toFixed(1)}%
              </p>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5" style={{ color: themeColors.primary }} />
                Tendencia Mensual
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Bar dataKey="income" name="Ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Gastos" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Category Distribution */}
            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" style={{ color: themeColors.primary }} />
                Distribución por Categoría
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip currency={currency} />} />
                    <Legend 
                      formatter={(value) => <span className="text-white/70 text-sm">{value}</span>}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/50">
                  No hay datos para mostrar
                </div>
              )}
            </Card>
          </div>

          {/* Top Categories */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4">Top Categorías</h3>
            <div className="space-y-3">
              {categoryData.slice(0, 5).map((cat, i) => (
                <div key={cat.category} className="flex items-center gap-4">
                  <div 
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white/80">{cat.category}</span>
                      <span className="text-white/60">{cat.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                  <span className="text-white font-medium w-24 text-right">
                    {formatCurrency(cat.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Radar & Gauge */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Radar className="w-5 h-5" style={{ color: themeColors.primary }} />
                Presupuesto vs Real
              </h3>
              <BudgetRadarChart 
                expenses={safeExpenses} 
                budgets={safeBudgets} 
                theme={theme} 
                currency={currency} 
              />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5" style={{ color: themeColors.primary }} />
                Tasa de Ahorro
              </h3>
              <div className="flex justify-center">
                <SavingsGauge value={savingsRate} label="Tasa de Ahorro" theme={theme} />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-white/60">
                  {savingsRate >= 20 
                    ? '¡Excelente! Superas el 20% recomendado' 
                    : savingsRate >= 10 
                    ? 'Bien, pero intenta llegar al 20%' 
                    : 'Necesitas aumentar tu ahorro'}
                </p>
              </div>
            </Card>
          </div>

          {/* Heatmap */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: themeColors.primary }} />
              Calendario de Gastos (últimas 12 semanas)
            </h3>
            <SpendingHeatmap expenses={safeExpenses} theme={theme} currency={currency} />
          </Card>

          {/* Treemap & Waterfall */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Grid3X3 className="w-5 h-5" style={{ color: themeColors.primary }} />
                Mapa de Categorías
              </h3>
              <CategoryTreemap expenses={filteredData.expenses} theme={theme} currency={currency} />
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: themeColors.primary }} />
                Flujo de Efectivo
              </h3>
              <CashFlowWaterfall 
                incomes={filteredData.incomes} 
                expenses={filteredData.expenses} 
                theme={theme} 
                currency={currency} 
              />
            </Card>
          </div>
        </motion.div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Trend Chart */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: themeColors.primary }} />
              Evolución de Ingresos vs Gastos
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Ingresos"
                  stroke="#22C55E" 
                  fill="url(#incomeGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Gastos"
                  stroke="#EF4444" 
                  fill="url(#expenseGradient)" 
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h4 className="text-sm text-white/60 mb-2">vs Mes Anterior</h4>
              <div className="flex items-center gap-2">
                {comparison.expenseChange >= 0 ? (
                  <ArrowUpRight className="w-5 h-5 text-danger-400" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-success-400" />
                )}
                <span className={cn(
                  'text-2xl font-bold',
                  comparison.expenseChange >= 0 ? 'text-danger-400' : 'text-success-400'
                )}>
                  {Math.abs(comparison.expenseChange).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm text-white/50 mt-1">en gastos</p>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm text-white/60 mb-2">Promedio Diario</h4>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalExpenses / parseInt(period), currency)}
              </p>
              <p className="text-sm text-white/50 mt-1">últimos {period} días</p>
            </Card>

            <Card className="p-4">
              <h4 className="text-sm text-white/60 mb-2">Proyección Mensual</h4>
              <p className="text-2xl font-bold text-warning-400">
                {formatCurrency((totalExpenses / parseInt(period)) * 30, currency)}
              </p>
              <p className="text-sm text-white/50 mt-1">si continúas así</p>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" style={{ color: themeColors.primary }} />
              Progreso de Metas
            </h3>
            {safeGoals.length > 0 ? (
              <GoalsProgressRing goals={safeGoals} theme={theme} currency={currency} />
            ) : (
              <div className="text-center py-8 text-white/50">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tienes metas configuradas</p>
                <p className="text-sm mt-2">Crea tu primera meta para ver tu progreso aquí</p>
              </div>
            )}
          </Card>

          {/* Goals List */}
          {safeGoals.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {safeGoals.map((goal) => {
                const progress = (Number(goal.targetAmount) || 0) > 0 
                  ? ((Number(goal.currentAmount) || 0) / (Number(goal.targetAmount) || 0)) * 100 
                  : 0;
                const remaining = (Number(goal.targetAmount) || 0) - (Number(goal.currentAmount) || 0);
                
                return (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${goal.color || themeColors.primary}20` }}
                      >
                        {goal.icon || '🎯'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{goal.name}</h4>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-white/60">
                            {formatCurrency(Number(goal.currentAmount) || 0, currency)}
                          </span>
                          <span className="text-white/40">
                            de {formatCurrency(Number(goal.targetAmount) || 0, currency)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ 
                              backgroundColor: goal.color || themeColors.primary,
                              boxShadow: `0 0 8px ${goal.color || themeColors.primary}`
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <span className={cn(
                            'font-medium',
                            progress >= 100 ? 'text-success-400' : 'text-white/60'
                          )}>
                            {progress.toFixed(0)}% completado
                          </span>
                          {remaining > 0 && (
                            <span className="text-white/40">
                              Faltan {formatCurrency(remaining, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ReportsPage;
