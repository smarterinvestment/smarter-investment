// ============================================
// 💰 BUDGETS PAGE - FULLY FUNCTIONAL v20
// ============================================
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, TrendingDown, PiggyBank, BarChart2 } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useBudgets } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Modal, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, filterByMonth, groupByCategory } from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../types';

// Budget Form Component - Fixed with proper state management
const BudgetForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialAmount?: number;
  existingCategories: string[];
  onSubmit: (category: string, amount: number) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, initialCategory, initialAmount, existingCategories, onSubmit, isSubmitting }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or initial values change
  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory || '');
      setAmount(initialAmount?.toString() || '');
      setError(null);
    }
  }, [isOpen, initialCategory, initialAmount]);

  // Available categories (exclude already used ones, unless editing that category)
  const availableCategories = DEFAULT_EXPENSE_CATEGORIES.filter(
    cat => !existingCategories.includes(cat.name) || cat.name === initialCategory
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Selecciona una categoría');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      await onSubmit(category, parseFloat(amount));
      onClose();
    } catch (err) {
      setError('Error al guardar. Intenta de nuevo.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialCategory ? '✏️ Editar Presupuesto' : '➕ Nuevo Presupuesto'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría *</label>
          {availableCategories.length === 0 ? (
            <div className="p-4 bg-white/5 rounded-xl text-center text-white/60">
              Ya tienes presupuestos para todas las categorías
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
              {availableCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  disabled={!!initialCategory && initialCategory !== cat.name}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl transition-all border-2',
                    category === cat.name 
                      ? 'bg-primary-500/20 border-primary-500' 
                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20',
                    !!initialCategory && initialCategory !== cat.name && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs text-white/70 text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input 
          label="Límite Mensual *" 
          type="number" 
          step="0.01" 
          min="0.01" 
          placeholder="Ej: 500.00" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          leftIcon={<span className="text-white/50">$</span>} 
        />

        {category && amount && (
          <div className="p-3 bg-white/5 rounded-xl">
            <p className="text-sm text-white/60 text-center">
              Límite de <strong className="text-white">{formatCurrency(parseFloat(amount) || 0, 'USD')}</strong> para <strong className="text-white">{category}</strong>
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={!category || !amount || isSubmitting} isLoading={isSubmitting}>
            {initialCategory ? 'Actualizar' : 'Crear Presupuesto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const BudgetsPage: React.FC = () => {
  const { expenses, currency, theme } = useStore();
  const { budgets, update: updateBudget, remove: deleteBudget } = useBudgets();
  const themeColors = getThemeColors(theme);

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | undefined>();
  const [editingAmount, setEditingAmount] = useState<number | undefined>();
  const [deletingBudget, setDeletingBudget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeBudgets = budgets || {};
  const existingCategories = Object.keys(safeBudgets);

  // Get current month expenses
  const monthlyExpenses = useMemo(() => filterByMonth(safeExpenses), [safeExpenses]);
  const expensesByCategory = useMemo(() => groupByCategory(monthlyExpenses), [monthlyExpenses]);

  // Calculate budget status for each category
  const budgetStatus = useMemo(() => {
    return Object.entries(safeBudgets)
      .map(([category, budget]) => {
        const spent = expensesByCategory[category] || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        const remaining = budget - spent;
        const status = percentage >= 100 ? 'exceeded' : percentage >= 85 ? 'critical' : percentage >= 70 ? 'warning' : 'safe';
        return { category, budget, spent, percentage, remaining, status };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [safeBudgets, expensesByCategory]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalBudget = Object.values(safeBudgets).reduce((sum, b) => sum + b, 0);
    const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetStatus.filter(b => b.status === 'exceeded').length;
    const warningCount = budgetStatus.filter(b => ['critical', 'warning'].includes(b.status)).length;
    return { totalBudget, totalSpent, totalRemaining: totalBudget - totalSpent, overBudgetCount, warningCount };
  }, [safeBudgets, budgetStatus]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingCategory(undefined);
    setEditingAmount(undefined);
    setShowForm(true);
  };

  const handleOpenEdit = (category: string, amount: number) => {
    setEditingCategory(category);
    setEditingAmount(amount);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(undefined);
    setEditingAmount(undefined);
  };

  const handleSave = async (category: string, amount: number) => {
    setIsSubmitting(true);
    try {
      await updateBudget(category, amount);
      showSuccess(editingCategory ? 'Presupuesto actualizado' : 'Presupuesto creado');
    } catch (error) {
      console.error('Error saving budget:', error);
      showError('Error al guardar el presupuesto');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    setIsSubmitting(true);
    try {
      await deleteBudget(deletingBudget);
      showSuccess('Presupuesto eliminado');
      setDeletingBudget(null);
    } catch (error) {
      console.error('Error deleting budget:', error);
      showError('Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'exceeded' || status === 'critical') return 'danger';
    if (status === 'warning') return 'warning';
    return 'success';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'exceeded') return '🔴';
    if (status === 'critical') return '🟠';
    if (status === 'warning') return '🟡';
    return '🟢';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-white">💰 Presupuestos</h1>
          <p className="text-white/60 mt-1">{existingCategories.length} categorías configuradas</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenCreate}>
          Nuevo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <PiggyBank className="w-8 h-8 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <p className="text-xs text-white/50">Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(summary.totalBudget, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <BarChart2 className="w-8 h-8 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <p className="text-xs text-white/50">Gastado</p>
          <p className="text-lg font-bold text-white">{formatCurrency(summary.totalSpent, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success-400" />
          <p className="text-xs text-white/50">Disponible</p>
          <p className={cn('text-lg font-bold', summary.totalRemaining >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(summary.totalRemaining, currency)}
          </p>
        </Card>
        <Card className="text-center p-4">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning-400" />
          <p className="text-xs text-white/50">Alertas</p>
          <p className="text-lg font-bold text-warning-400">{summary.overBudgetCount + summary.warningCount}</p>
        </Card>
      </div>

      {/* Progress Overview */}
      {budgetStatus.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-bold text-white mb-4 text-center">Progreso General</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Uso del presupuesto</span>
            <span className="font-semibold text-white">
              {summary.totalBudget > 0 ? ((summary.totalSpent / summary.totalBudget) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <ProgressBar value={summary.totalSpent} max={summary.totalBudget} size="lg" />
          <div className="flex justify-center gap-6 text-sm mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success-500" />
              <span className="text-white/60">OK</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning-500" />
              <span className="text-white/60">Alerta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger-500" />
              <span className="text-white/60">Excedido</span>
            </div>
          </div>
        </Card>
      )}

      {/* Budget List */}
      {budgetStatus.length === 0 ? (
        <Card className="p-8">
          <EmptyState 
            icon="💰" 
            title="Sin presupuestos" 
            description="Crea presupuestos para controlar tus gastos por categoría" 
            action={<Button onClick={handleOpenCreate}>Crear Presupuesto</Button>} 
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {budgetStatus.map((budget, index) => {
            const cat = DEFAULT_EXPENSE_CATEGORIES.find(c => c.name === budget.category);
            return (
              <motion.div 
                key={budget.category} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn('relative overflow-hidden', budget.status === 'exceeded' && 'border-danger-500/50')}>
                  {/* Status glow effect */}
                  <div className={cn(
                    'absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-20 blur-xl',
                    budget.status === 'exceeded' && 'bg-danger-500',
                    budget.status === 'critical' && 'bg-warning-500',
                    budget.status === 'warning' && 'bg-warning-500',
                    budget.status === 'safe' && 'bg-success-500'
                  )} />
                  
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
                        {cat?.icon || '📦'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{budget.category}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg">{getStatusIcon(budget.status)}</span>
                          <Badge variant={getStatusColor(budget.status)} size="sm">
                            {budget.percentage.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleOpenEdit(budget.category, budget.budget)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-white/40 hover:text-white" />
                      </button>
                      <button 
                        onClick={() => setDeletingBudget(budget.category)}
                        className="p-2 rounded-lg hover:bg-danger-500/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-danger-400/60 hover:text-danger-400" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <ProgressBar value={budget.spent} max={budget.budget} variant={getStatusColor(budget.status)} />
                  
                  {/* Details */}
                  <div className="flex justify-between text-sm mt-3">
                    <div>
                      <p className="text-white/50">Gastado</p>
                      <p className="font-semibold text-white">{formatCurrency(budget.spent, currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50">Límite</p>
                      <p className="font-semibold text-white">{formatCurrency(budget.budget, currency)}</p>
                    </div>
                  </div>
                  
                  {/* Remaining */}
                  <div className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl mt-3',
                    budget.remaining >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10'
                  )}>
                    {budget.remaining >= 0 
                      ? <TrendingUp className="w-4 h-4 text-success-400" /> 
                      : <TrendingDown className="w-4 h-4 text-danger-400" />
                    }
                    <span className={cn('font-semibold', budget.remaining >= 0 ? 'text-success-400' : 'text-danger-400')}>
                      {budget.remaining >= 0 ? 'Disponible: ' : 'Excedido: '}
                      {formatCurrency(Math.abs(budget.remaining), currency)}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <BudgetForm 
        isOpen={showForm} 
        onClose={handleCloseForm} 
        initialCategory={editingCategory}
        initialAmount={editingAmount}
        existingCategories={existingCategories}
        onSubmit={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingBudget} onClose={() => setDeletingBudget(null)} title="🗑️ Eliminar Presupuesto" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-2">¿Eliminar el presupuesto de</p>
          <p className="text-xl font-bold text-white mb-6">"{deletingBudget}"?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingBudget(null)} fullWidth disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} fullWidth isLoading={isSubmitting}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
