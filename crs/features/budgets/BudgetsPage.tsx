// ============================================
// 💰 BUDGETS PAGE - COMPLETE
// ============================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertTriangle, TrendingUp, TrendingDown, PiggyBank, BarChart2 } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Input, Modal, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, filterByMonth, groupByCategory } from '../../utils/financial';
import { DEFAULT_EXPENSE_CATEGORIES } from '../../types';

// Budget Form Component
const BudgetForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  category?: string;
  amount?: number;
  onSubmit: (category: string, amount: number) => void;
}> = ({ isOpen, onClose, category: initialCategory, amount: initialAmount, onSubmit }) => {
  const { budgets } = useStore();
  const [category, setCategory] = useState(initialCategory || '');
  const [amount, setAmount] = useState(initialAmount?.toString() || '');

  const availableCategories = DEFAULT_EXPENSE_CATEGORIES.filter(cat => !budgets[cat.name] || cat.name === initialCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;
    onSubmit(category, parseFloat(amount));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialCategory ? 'Editar Presupuesto' : 'Nuevo Presupuesto'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría</label>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {availableCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                disabled={!!initialCategory && initialCategory !== cat.name}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
                  category === cat.name ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10',
                  !!initialCategory && initialCategory !== cat.name && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs text-white/70">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        <Input label="Límite Mensual" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} leftIcon={<span>$</span>} required />
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" fullWidth disabled={!category || !amount}>{initialCategory ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export const BudgetsPage: React.FC = () => {
  const { expenses, budgets, currency, theme, updateBudget, deleteBudget } = useStore();
  const themeColors = getThemeColors(theme);

  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ category: string; amount: number } | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<string | null>(null);

  const monthlyExpenses = useMemo(() => filterByMonth(expenses), [expenses]);
  const expensesByCategory = useMemo(() => groupByCategory(monthlyExpenses), [monthlyExpenses]);

  const budgetStatus = useMemo(() => {
    return Object.entries(budgets).map(([category, budget]) => {
      const spent = expensesByCategory[category] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      const remaining = budget - spent;
      const status = percentage >= 100 ? 'exceeded' : percentage >= 85 ? 'critical' : percentage >= 70 ? 'warning' : 'safe';
      return { category, budget, spent, percentage, remaining, status };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, expensesByCategory]);

  const summary = useMemo(() => {
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const overBudgetCount = budgetStatus.filter(b => b.status === 'exceeded').length;
    const warningCount = budgetStatus.filter(b => b.status === 'critical' || b.status === 'warning').length;
    return { totalBudget, totalSpent, totalRemaining: totalBudget - totalSpent, overBudgetCount, warningCount };
  }, [budgets, budgetStatus]);

  const handleSave = (category: string, amount: number) => updateBudget(category, amount);
  const handleDelete = () => { if (deletingBudget) { deleteBudget(deletingBudget); setDeletingBudget(null); } };
  
  const getStatusColor = (status: string) => status === 'exceeded' || status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'success';
  const getStatusIcon = (status: string) => status === 'exceeded' ? '🔴' : status === 'critical' ? '🟠' : status === 'warning' ? '🟡' : '🟢';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Presupuestos</h1>
          <p className="text-white/60 mt-1">{Object.keys(budgets).length} categorías configuradas</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Nuevo</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center"><PiggyBank className="w-8 h-8 mx-auto mb-2 text-primary-400" /><p className="text-xs text-white/50">Total</p><p className="text-lg font-bold text-white">{formatCurrency(summary.totalBudget, currency)}</p></Card>
        <Card className="text-center"><BarChart2 className="w-8 h-8 mx-auto mb-2 text-primary-400" /><p className="text-xs text-white/50">Gastado</p><p className="text-lg font-bold text-white">{formatCurrency(summary.totalSpent, currency)}</p></Card>
        <Card className="text-center"><TrendingUp className="w-8 h-8 mx-auto mb-2 text-success-400" /><p className="text-xs text-white/50">Disponible</p><p className={cn('text-lg font-bold', summary.totalRemaining >= 0 ? 'text-success-400' : 'text-danger-400')}>{formatCurrency(summary.totalRemaining, currency)}</p></Card>
        <Card className="text-center"><AlertTriangle className="w-8 h-8 mx-auto mb-2 text-warning-400" /><p className="text-xs text-white/50">Alertas</p><p className="text-lg font-bold text-warning-400">{summary.overBudgetCount + summary.warningCount}</p></Card>
      </div>

      {budgetStatus.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold text-white mb-4">Progreso General</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">Uso del presupuesto</span>
            <span className="font-semibold text-white">{summary.totalBudget > 0 ? ((summary.totalSpent / summary.totalBudget) * 100).toFixed(1) : 0}%</span>
          </div>
          <ProgressBar value={summary.totalSpent} max={summary.totalBudget} size="lg" />
          <div className="flex gap-4 text-sm mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success-500" /><span className="text-white/60">OK</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning-500" /><span className="text-white/60">Alerta</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-danger-500" /><span className="text-white/60">Excedido</span></div>
          </div>
        </Card>
      )}

      {budgetStatus.length === 0 ? (
        <Card><EmptyState icon="💰" title="Sin presupuestos" description="Crea presupuestos para controlar tus gastos" action={<Button onClick={() => setShowForm(true)}>Crear</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {budgetStatus.map((budget, index) => {
            const cat = DEFAULT_EXPENSE_CATEGORIES.find(c => c.name === budget.category);
            return (
              <motion.div key={budget.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={cn('relative', budget.status === 'exceeded' && 'border-danger-500/50')}>
                  <div className={cn('absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full opacity-20', budget.status === 'exceeded' && 'bg-danger-500', budget.status === 'critical' && 'bg-warning-500', budget.status === 'warning' && 'bg-warning-500', budget.status === 'safe' && 'bg-success-500')} />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">{cat?.icon || '📦'}</div>
                      <div>
                        <h3 className="font-semibold text-white">{budget.category}</h3>
                        <div className="flex items-center gap-2 mt-1"><span className="text-lg">{getStatusIcon(budget.status)}</span><Badge variant={getStatusColor(budget.status)} size="sm">{budget.percentage.toFixed(0)}%</Badge></div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingBudget({ category: budget.category, amount: budget.budget }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4 text-white/40" /></button>
                      <button onClick={() => setDeletingBudget(budget.category)} className="p-2 rounded-lg hover:bg-danger-500/20"><Trash2 className="w-4 h-4 text-danger-400/60" /></button>
                    </div>
                  </div>
                  <ProgressBar value={budget.spent} max={budget.budget} variant={getStatusColor(budget.status)} />
                  <div className="flex justify-between text-sm mt-3">
                    <div><p className="text-white/50">Gastado</p><p className="font-semibold text-white">{formatCurrency(budget.spent, currency)}</p></div>
                    <div className="text-right"><p className="text-white/50">Límite</p><p className="font-semibold text-white">{formatCurrency(budget.budget, currency)}</p></div>
                  </div>
                  <div className={cn('flex items-center justify-center gap-2 p-3 rounded-xl mt-3', budget.remaining >= 0 ? 'bg-success-500/10' : 'bg-danger-500/10')}>
                    {budget.remaining >= 0 ? <TrendingUp className="w-4 h-4 text-success-400" /> : <TrendingDown className="w-4 h-4 text-danger-400" />}
                    <span className={cn('font-semibold', budget.remaining >= 0 ? 'text-success-400' : 'text-danger-400')}>{budget.remaining >= 0 ? 'Disponible: ' : 'Excedido: '}{formatCurrency(Math.abs(budget.remaining), currency)}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <BudgetForm isOpen={showForm} onClose={() => { setShowForm(false); setEditingBudget(null); }} category={editingBudget?.category} amount={editingBudget?.amount} onSubmit={handleSave} />

      <Modal isOpen={!!deletingBudget} onClose={() => setDeletingBudget(null)} title="Eliminar" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center"><Trash2 className="w-8 h-8 text-danger-400" /></div>
          <p className="text-white/80 mb-6">¿Eliminar presupuesto de "{deletingBudget}"?</p>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => setDeletingBudget(null)} fullWidth>Cancelar</Button><Button variant="danger" onClick={handleDelete} fullWidth>Eliminar</Button></div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetsPage;
