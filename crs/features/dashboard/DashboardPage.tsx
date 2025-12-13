// ============================================
// 🏠 DASHBOARD PAGE - COMPLETE
// ============================================
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, StatCard, Button, ProgressBar, Badge, EmptyState } from '../../components/ui';
import { cn } from '../../utils/cn';
import {
  formatCurrency,
  calculateFinancialSummary,
  getBudgetStatus,
  getBudgetAlerts,
  filterByMonth,
  getGoalProgress,
} from '../../utils/financial';

// ========================================
// DASHBOARD PAGE
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
    openModal,
  } = useStore();

  const themeColors = getThemeColors(theme);

  // Calculate summary
  const summary = useMemo(
    () => calculateFinancialSummary(expenses, incomes),
    [expenses, incomes]
  );

  // Budget alerts
  const budgetAlerts = useMemo(
    () => getBudgetAlerts(budgets, expenses),
    [budgets, expenses]
  );

  // Recent transactions
  const recentTransactions = useMemo(() => {
    const all = [
      ...expenses.map(e => ({ ...e, type: 'expense' as const })),
      ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    return all;
  }, [expenses, incomes]);

  // Active goals
  const activeGoals = goals.filter(g => !g.isCompleted).slice(0, 3);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">
          ¡Hola! 👋
        </h1>
        <p className="text-white/60 mt-1">
          Resumen de tus finanzas este mes
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Balance"
          value={formatCurrency(summary.balance, currency)}
          icon={<Wallet className="w-5 h-5" />}
          change={summary.trendPercentage}
          changeLabel="vs mes anterior"
        />
        <StatCard
          title="Ingresos"
          value={formatCurrency(summary.totalIncome, currency)}
          icon={<ArrowUpRight className="w-5 h-5" />}
          className="border-l-4 border-success-500"
        />
        <StatCard
          title="Gastos"
          value={formatCurrency(summary.totalExpenses, currency)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          className="border-l-4 border-danger-500"
        />
        <StatCard
          title="Tasa de Ahorro"
          value={`${summary.savingsRate.toFixed(1)}%`}
          icon={summary.savingsRate >= 20 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          className={cn(
            'border-l-4',
            summary.savingsRate >= 20 ? 'border-success-500' : 'border-warning-500'
          )}
        />
      </motion.div>

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-warning-500 bg-warning-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">Alertas de Presupuesto</h3>
                <div className="mt-2 space-y-2">
                  {budgetAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{alert.category}</span>
                      <Badge
                        variant={
                          alert.status === 'exceeded'
                            ? 'danger'
                            : alert.status === 'critical'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {alert.percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Últimos Movimientos</h2>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => openModal({ id: 'add-transaction', type: 'add-transaction' })}
              >
                Añadir
              </Button>
            </div>

            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="💸"
                title="Sin movimientos"
                description="Registra tu primer ingreso o gasto"
                action={
                  <Button
                    size="sm"
                    onClick={() => openModal({ id: 'add-transaction', type: 'add-transaction' })}
                  >
                    Añadir Movimiento
                  </Button>
                }
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
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                        transaction.type === 'income'
                          ? 'bg-success-500/20'
                          : 'bg-danger-500/20'
                      )}
                    >
                      {transaction.type === 'income' ? '💰' : '💸'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-white/50">{transaction.category}</p>
                    </div>
                    <p
                      className={cn(
                        'font-semibold',
                        transaction.type === 'income'
                          ? 'text-success-400'
                          : 'text-danger-400'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, currency)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Goals Progress */}
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Metas Activas</h2>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Target className="w-4 h-4" />}
                onClick={() => openModal({ id: 'add-goal', type: 'add-goal' })}
              >
                Nueva
              </Button>
            </div>

            {activeGoals.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="Sin metas"
                description="Crea tu primera meta de ahorro"
                action={
                  <Button
                    size="sm"
                    onClick={() => openModal({ id: 'add-goal', type: 'add-goal' })}
                  >
                    Crear Meta
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal, index) => {
                  const progress = getGoalProgress(goal);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-white/5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{goal.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{goal.name}</p>
                          <p className="text-xs text-white/50">
                            {formatCurrency(goal.currentAmount, currency)} de {formatCurrency(goal.targetAmount, currency)}
                          </p>
                        </div>
                        <Badge variant={progress >= 100 ? 'success' : 'primary'}>
                          {progress.toFixed(0)}%
                        </Badge>
                      </div>
                      <ProgressBar
                        value={goal.currentAmount}
                        max={goal.targetAmount}
                        variant={progress >= 100 ? 'success' : 'default'}
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Top Categories */}
      {summary.topCategories.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <h2 className="text-lg font-bold text-white mb-4">
              Principales Categorías de Gasto
            </h2>
            <div className="space-y-4">
              {summary.topCategories.slice(0, 5).map((category, index) => (
                <div key={category.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">{category.category}</span>
                    <span className="text-sm font-medium text-white">
                      {formatCurrency(category.amount, currency)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="absolute h-full rounded-full"
                      style={{ backgroundColor: themeColors.primary }}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">
                    {category.percentage.toFixed(1)}% del total
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Recurring */}
      {recurringTransactions.filter(r => r.isActive).length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-bold text-white">Próximos Pagos</h2>
            </div>
            <div className="space-y-3">
              {recurringTransactions
                .filter(r => r.isActive)
                .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
                .slice(0, 3)
                .map((recurring) => {
                  const daysUntil = Math.ceil(
                    (new Date(recurring.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={recurring.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <div>
                        <p className="font-medium text-white">{recurring.name}</p>
                        <p className="text-xs text-white/50">
                          {daysUntil === 0
                            ? 'Hoy'
                            : daysUntil === 1
                            ? 'Mañana'
                            : `En ${daysUntil} días`}
                        </p>
                      </div>
                      <p className="font-semibold text-white">
                        {formatCurrency(recurring.amount, currency)}
                      </p>
                    </div>
                  );
                })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions FAB */}
      <motion.div
        variants={itemVariants}
        className="fixed bottom-24 right-4 lg:bottom-8"
      >
        <Button
          onClick={() => openModal({ id: 'add-transaction', type: 'add-transaction' })}
          className="w-14 h-14 rounded-full shadow-lg pulse-glow"
          aria-label="Añadir movimiento"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
