// ============================================
// 🏠 DASHBOARD PAGE - PREMIUM FINTECH DESIGN
// Net Worth Chart | Neon Cards | Comparatives
// ============================================
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertTriangle,
  Target,
  Calendar,
  PiggyBank,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useTransactions } from '../../hooks/useFirebaseData';
import { Card, StatCard, Button, ProgressBar, Badge, EmptyState, Modal, Input } from '../../components/ui';
import { ChartSelector } from '../../components/ui/ChartSelector';
import { cn } from '../../utils/cn';
import {
  formatCurrency,
  calculateFinancialSummary,
  getBudgetAlerts,
} from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../types';
import { useTranslations } from '../../utils/translations';
import type { Transaction } from '../../types';

// ========================================
// NET WORTH CHART COMPONENT
// ========================================
type TimePeriod = '1W' | '1M' | '3M' | 'YTD' | 'ALL';

const NetWorthCard: React.FC<{
  totalBalance: number;
  changePercent: number;
  currency: string;
  expenses: Transaction[];
  incomes: Transaction[];
  theme: string;
}> = ({ totalBalance, changePercent, currency, expenses, incomes, theme }) => {
  const [period, setPeriod] = useState<TimePeriod>('1M');
  const themeColors = getThemeColors(theme);

  // Generate historical data based on period
  const chartData = useMemo(() => {
    const now = new Date();
    let days = 30;
    
    switch (period) {
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case '3M': days = 90; break;
      case 'YTD': days = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)); break;
      case 'ALL': days = 365; break;
    }

    const data: { date: string; balance: number; label: string }[] = [];
    let runningBalance = totalBalance;

    // Create data points going backwards
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Find transactions for this day
      const dayExpenses = expenses
        .filter(e => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const dayIncomes = incomes
        .filter(inc => inc.date === dateStr)
        .reduce((sum, inc) => sum + inc.amount, 0);

      // Adjust running balance (work backwards)
      if (i !== 0) {
        runningBalance = runningBalance - dayIncomes + dayExpenses;
      }

      // Format label based on period
      let label = '';
      if (period === '1W') {
        label = date.toLocaleDateString('es', { weekday: 'short' });
      } else if (period === '1M' || period === '3M') {
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        label = date.toLocaleDateString('es', { month: 'short' });
      }

      data.push({
        date: dateStr,
        balance: Math.max(0, runningBalance + (Math.random() * 500 - 250)), // Add some variance for visual appeal
        label,
      });
    }

    // Ensure last point is the actual balance
    if (data.length > 0) {
      data[data.length - 1].balance = totalBalance;
    }

    return data;
  }, [period, expenses, incomes, totalBalance]);

  const getGradientColor = () => {
    switch (theme) {
      case 'pink': return { start: '#ec4899', end: '#db2777' };
      case 'purple': return { start: '#a855f7', end: '#9333ea' };
      case 'light': return { start: '#0891b2', end: '#0e7490' };
      default: return { start: '#05BFDB', end: '#088395' };
    }
  };

  const colors = getGradientColor();

  return (
    <div className="net-worth-card relative overflow-hidden">
      {/* Floating glow effect */}
      <div 
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: colors.start }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-white/60 text-sm font-medium tracking-wide">PATRIMONIO NETO</span>
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <Sparkles className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {/* Balance */}
      <div className="flex items-baseline gap-3 mb-6 relative z-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">
          {formatCurrency(totalBalance, currency)}
        </h2>
        <span className={cn(
          'text-lg font-semibold',
          changePercent >= 0 ? 'text-success-400' : 'text-danger-400'
        )}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Chart */}
      <div className="h-32 mb-4 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors.start} stopOpacity={0.4} />
                <stop offset="100%" stopColor={colors.end} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="balance"
              stroke={colors.start}
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              style={{ filter: `drop-shadow(0 0 8px ${colors.start}80)` }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0, 24, 69, 0.95)',
                border: `1px solid ${colors.start}50`,
                borderRadius: '12px',
                boxShadow: `0 0 20px ${colors.start}30`,
              }}
              labelStyle={{ color: 'white' }}
              formatter={(value: number) => [formatCurrency(value, currency), 'Balance']}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Period Selector */}
      <div className="flex justify-between relative z-10">
        {(['1W', '1M', '3M', 'YTD', 'ALL'] as TimePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'period-btn',
              period === p && 'active'
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

// ========================================
// QUICK ADD FORM
// ========================================
const QuickAddForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Transaction>) => void;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [type, setType] = React.useState<'expense' | 'income'>('expense');
  const [description, setDescription] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  React.useEffect(() => {
    if (isOpen) {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || !category) {
      showError('Por favor completa todos los campos');
      return;
    }
    onSubmit({ type, description: description.trim(), amount: parseFloat(amount), category, date, notes: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Movimiento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
          <button type="button" onClick={() => { setType('expense'); setCategory(''); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'expense' ? 'bg-danger-500/20 text-danger-400' : 'text-white/50 hover:text-white')}>
            <ArrowDownRight className="w-4 h-4" /> Gasto
          </button>
          <button type="button" onClick={() => { setType('income'); setCategory(''); }}
            className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'income' ? 'bg-success-500/20 text-success-400' : 'text-white/50 hover:text-white')}>
            <ArrowUpRight className="w-4 h-4" /> Ingreso
          </button>
        </div>
        <Input label="Descripción" placeholder="Ej: Almuerzo, Netflix..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Input label="Monto" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} leftIcon={<span>$</span>} required />
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría</label>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  category === cat.name ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10')}>
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[10px] text-white/70 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Añadir'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// ========================================
// INCOME VS EXPENSES CHART
// ========================================
const IncomeVsExpensesChart: React.FC<{
  expenses: Transaction[];
  incomes: Transaction[];
  currency: string;
  theme: string;
}> = ({ expenses, incomes, currency, theme }) => {
  const themeColors = getThemeColors(theme);

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const monthLabel = date.toLocaleDateString('es', { month: 'short' });
      
      const monthExpenses = expenses
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
      
      const monthIncomes = incomes
        .filter(inc => inc.date.startsWith(monthStr))
        .reduce((sum, inc) => sum + inc.amount, 0);

      months.push({
        month: monthLabel,
        ingresos: monthIncomes,
        gastos: monthExpenses,
      });
    }
    
    return months;
  }, [expenses, incomes]);

  return (
    <div className="card-neon">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" style={{ color: themeColors.primary }} />
        Ingresos vs Gastos
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={8}>
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(0, 24, 69, 0.95)',
                border: '1px solid rgba(5, 191, 219, 0.3)',
                borderRadius: '12px',
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
            <Bar dataKey="ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} name="Ingresos" />
            <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ========================================
// EXPENSE DISTRIBUTION CHART
// ========================================
const ExpenseDistributionChart: React.FC<{
  expenses: Transaction[];
  currency: string;
  theme: string;
}> = ({ expenses, currency, theme }) => {
  const themeColors = getThemeColors(theme);

  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const sorted = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return sorted;
  }, [expenses]);

  if (chartData.length === 0) {
    return (
      <div className="card-neon">
        <h3 className="text-lg font-bold text-white mb-4">Distribución de Gastos</h3>
        <EmptyState icon="📊" title="Sin datos" description="Agrega gastos para ver estadísticas" />
      </div>
    );
  }

  return (
    <ChartSelector
      data={chartData}
      title="💸 Top 5 Categorías de Gastos"
      dataKey="value"
      nameKey="name"
      colors={['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#a855f7']}
      themeColors={themeColors}
    />
  );
};

// ========================================
// MAIN DASHBOARD PAGE
// ========================================
export const DashboardPage: React.FC = () => {
  const {
    expenses,
    incomes,
    budgets,
    goals,
    recurringTransactions,
    currency,
    theme,
    language,
    setActivePage,
  } = useStore();

  const { add } = useTransactions();
  const themeColors = getThemeColors(theme);
  const t = useTranslations(language);

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};

  // Calculate recurring totals for current month
  const recurringTotals = useMemo(() => {
    const activeRecurring = safeRecurring.filter(r => r.isActive);
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    activeRecurring.forEach(r => {
      const amount = Number(r.amount) || 0;
      let monthlyAmount = amount;

      // Convert to monthly equivalent
      switch (r.frequency) {
        case 'daily': monthlyAmount = amount * 30; break;
        case 'weekly': monthlyAmount = amount * 4; break;
        case 'biweekly': monthlyAmount = amount * 2; break;
        case 'monthly': monthlyAmount = amount; break;
        case 'yearly': monthlyAmount = amount / 12; break;
      }

      if (r.type === 'income') {
        monthlyIncome += monthlyAmount;
      } else {
        monthlyExpense += monthlyAmount;
      }
    });

    return { monthlyIncome, monthlyExpense };
  }, [safeRecurring]);

  const handleQuickAdd = async (data: Partial<Transaction>) => {
    setIsSubmitting(true);
    try {
      await add({
        type: data.type!,
        description: data.description!,
        amount: data.amount!,
        category: data.category!,
        date: data.date!,
        notes: '',
      });
      showSuccess('Transacción agregada');
      setShowQuickAdd(false);
    } catch (error) {
      showError('Error al agregar transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Include recurring in summary
  const summary = useMemo(() => {
    const baseSummary = calculateFinancialSummary(safeExpenses, safeIncomes);
    return {
      ...baseSummary,
      totalIncome: baseSummary.totalIncome + recurringTotals.monthlyIncome,
      totalExpenses: baseSummary.totalExpenses + recurringTotals.monthlyExpense,
      balance: baseSummary.balance + recurringTotals.monthlyIncome - recurringTotals.monthlyExpense,
      recurringIncome: recurringTotals.monthlyIncome,
      recurringExpense: recurringTotals.monthlyExpense,
    };
  }, [safeExpenses, safeIncomes, recurringTotals]);

  const budgetAlerts = useMemo(
    () => getBudgetAlerts(safeBudgets, safeExpenses),
    [safeBudgets, safeExpenses]
  );

  const recentTransactions = useMemo(() => {
    const all = [
      ...safeExpenses.map(e => ({ ...e, type: 'expense' as const })),
      ...safeIncomes.map(i => ({ ...i, type: 'income' as const })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return all;
  }, [safeExpenses, safeIncomes]);

  const activeGoals = safeGoals.filter(g => !g.isCompleted).slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 relative z-10"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            ¡Hola! 👋
          </h1>
          <p className="text-white/60 mt-1">
            Tu resumen financiero
          </p>
        </div>
        <Button 
          onClick={() => setShowQuickAdd(true)}
          className="btn-primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Nuevo
        </Button>
      </motion.div>

      {/* Net Worth Card - Premium */}
      <motion.div variants={itemVariants}>
        <NetWorthCard
          totalBalance={summary.balance}
          changePercent={summary.trendPercentage}
          currency={currency}
          expenses={safeExpenses}
          incomes={safeIncomes}
          theme={theme}
        />
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="card-neon p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Ingresos</p>
              <p className="text-lg font-bold text-success-400">
                {formatCurrency(summary.totalIncome, currency)}
              </p>
            </div>
          </div>
        </div>
        <div className="card-neon p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-danger-400" />
            </div>
            <div>
              <p className="text-xs text-white/50">Gastos</p>
              <p className="text-lg font-bold text-danger-400">
                {formatCurrency(summary.totalExpenses, currency)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        <IncomeVsExpensesChart
          expenses={expenses}
          incomes={incomes}
          currency={currency}
          theme={theme}
        />
        <ExpenseDistributionChart
          expenses={expenses}
          currency={currency}
          theme={theme}
        />
      </motion.div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="card-neon border-l-4 border-warning-500">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">Alertas de Presupuesto</h3>
                <div className="mt-2 space-y-2">
                  {budgetAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{alert.category}</span>
                      <Badge variant={alert.status === 'exceeded' ? 'danger' : alert.status === 'critical' ? 'warning' : 'primary'}>
                        {alert.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Transactions & Goals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <div className="card-neon">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Últimos Movimientos</h2>
              <Button variant="ghost" size="sm" onClick={() => setActivePage('transactions')}>
                Ver todos
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="💸"
                title="Sin movimientos"
                description="Registra tu primer ingreso o gasto"
                action={<Button size="sm" onClick={() => setShowQuickAdd(true)}>Añadir</Button>}
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                      transaction.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20'
                    )}>
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{transaction.description}</p>
                      <p className="text-xs text-white/50">{transaction.category}</p>
                    </div>
                    <p className={cn(
                      'font-semibold',
                      transaction.type === 'income' ? 'text-success-400' : 'text-danger-400'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Goals */}
        <motion.div variants={itemVariants}>
          <div className="card-neon">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: themeColors.primary }} />
                Metas Activas
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setActivePage('goals')}>
                Ver todas
              </Button>
            </div>

            {activeGoals.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="Sin metas"
                description="Crea tu primera meta de ahorro"
                action={<Button size="sm" onClick={() => setActivePage('goals')}>Crear Meta</Button>}
              />
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => {
                  const targetAmount = Number(goal.targetAmount) || 0;
                  const currentAmount = Number(goal.currentAmount) || 0;
                  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
                  const safeProgress = isNaN(progress) ? 0 : Math.min(Math.max(progress, 0), 100);
                  
                  return (
                    <div key={goal.id} className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{goal.icon} {goal.name}</span>
                        <span className="text-sm" style={{ color: themeColors.primary }}>
                          {safeProgress.toFixed(0)}%
                        </span>
                      </div>
                      <ProgressBar value={safeProgress} max={100} size="sm" />
                      <div className="flex justify-between mt-2 text-xs text-white/50">
                        <span>{formatCurrency(currentAmount, currency)}</span>
                        <span>{formatCurrency(targetAmount, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Savings Rate Indicator */}
      <motion.div variants={itemVariants}>
        <div className="card-neon-intense p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Tasa de Ahorro</p>
              <p className="text-3xl font-bold text-white mt-1">
                {summary.savingsRate.toFixed(1)}%
              </p>
              <p className="text-xs text-white/50 mt-1">
                {summary.savingsRate >= 20 ? '¡Excelente! Estás ahorrando bien' : 
                 summary.savingsRate >= 10 ? 'Buen trabajo, sigue así' : 
                 'Intenta aumentar tu ahorro'}
              </p>
            </div>
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center',
              summary.savingsRate >= 20 ? 'bg-success-500/20' : 
              summary.savingsRate >= 10 ? 'bg-warning-500/20' : 'bg-danger-500/20'
            )}>
              {summary.savingsRate >= 20 ? (
                <TrendingUp className="w-8 h-8 text-success-400" />
              ) : summary.savingsRate >= 10 ? (
                <TrendingUp className="w-8 h-8 text-warning-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-danger-400" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Add Modal */}
      <QuickAddForm
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSubmit={handleQuickAdd}
        isSubmitting={isSubmitting}
      />

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowQuickAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full flex items-center justify-center z-40"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
          boxShadow: `0 0 30px ${themeColors.primary}60, 0 10px 30px rgba(0,0,0,0.3)`,
        }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </motion.div>
  );
};

export default DashboardPage;
