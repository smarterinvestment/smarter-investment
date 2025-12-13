// ============================================
// 🎯 GOALS PAGE - COMPLETE
// ============================================
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Target, TrendingUp, Calendar, Gift, Zap, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Input, Modal, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, getGoalProgress, getDaysUntilDeadline, getRequiredMonthlySaving } from '../../utils/financial';
import type { Goal } from '../../types';

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '👶', '🏝️', '💪', '📚', '🎮', '🎨', '🏋️', '🍽️'];
const GOAL_COLORS = ['#05BFDB', '#ec4899', '#a855f7', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6'];

// Goal Form
const GoalForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSubmit: (data: Partial<Goal>) => void;
}> = ({ isOpen, onClose, goal, onSubmit }) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount?.toString() || '0');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [icon, setIcon] = useState(goal?.icon || '🎯');
  const [color, setColor] = useState(goal?.color || '#05BFDB');
  const [description, setDescription] = useState(goal?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    onSubmit({
      id: goal?.id,
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      deadline: deadline || undefined,
      icon,
      color,
      description,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Editar Meta' : 'Nueva Meta'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nombre de la meta" placeholder="Ej: Vacaciones, Auto nuevo..." value={name} onChange={e => setName(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Monto objetivo" type="number" step="0.01" min="0" placeholder="0.00" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} leftIcon={<span>$</span>} required />
          <Input label="Ahorrado actualmente" type="number" step="0.01" min="0" placeholder="0.00" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} leftIcon={<span>$</span>} />
        </div>

        <Input label="Fecha límite (opcional)" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Ícono</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map(i => (
              <button key={i} type="button" onClick={() => setIcon(i)} className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all', icon === i ? 'bg-primary-500/30 border-2 border-primary-500' : 'bg-white/5 hover:bg-white/10')}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Color</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={cn('w-8 h-8 rounded-full transition-all', color === c && 'ring-2 ring-offset-2 ring-offset-dark-700')} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Descripción (opcional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="¿Por qué es importante esta meta?" className="w-full px-4 py-3 rounded-xl bg-dark-700/60 border-2 border-white/10 text-white placeholder-white/40 focus:border-primary-500 resize-none" rows={2} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" fullWidth>{goal ? 'Guardar' : 'Crear'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// Contribution Modal
const ContributionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSubmit: (amount: number) => void;
}> = ({ isOpen, onClose, goal, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const { currency } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    onSubmit(parseFloat(amount));
    setAmount('');
    onClose();
  };

  if (!goal) return null;

  // Sanitize values to avoid NaN
  const targetAmount = Number(goal.targetAmount) || 0;
  const currentAmount = Number(goal.currentAmount) || 0;
  const remaining = Math.max(0, targetAmount - currentAmount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Aporte" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <span className="text-4xl">{goal.icon}</span>
          <h3 className="text-lg font-semibold text-white mt-2">{goal.name}</h3>
          <p className="text-white/50 text-sm">
            {remaining > 0 ? `Faltan ${formatCurrency(remaining, currency)}` : 'Meta completada'}
          </p>
        </div>

        <Input 
          label="Monto a aportar" 
          type="number" 
          step="0.01" 
          min="0.01" 
          placeholder="0.00" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
          leftIcon={<span>$</span>} 
          required 
        />

        <div className="flex gap-2">
          {[25, 50, 100].map(preset => (
            <button 
              key={preset} 
              type="button" 
              onClick={() => setAmount(String(preset))} 
              className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors"
            >
              {formatCurrency(preset, currency, { compact: true })}
            </button>
          ))}
          {remaining > 0 && (
            <button 
              type="button" 
              onClick={() => setAmount(String(remaining))} 
              className="flex-1 py-2 rounded-lg bg-white/5 text-white/70 text-sm hover:bg-white/10 transition-colors"
            >
              Todo
            </button>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" fullWidth leftIcon={<DollarSign className="w-4 h-4" />}>Aportar</Button>
        </div>
      </form>
    </Modal>
  );
};

export const GoalsPage: React.FC = () => {
  const { goals, currency, theme, addGoal, updateGoal, deleteGoal, addContribution } = useStore();
  const themeColors = getThemeColors(theme);

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredGoals = useMemo(() => {
    switch (filter) {
      case 'active': return goals.filter(g => !g.isCompleted);
      case 'completed': return goals.filter(g => g.isCompleted);
      default: return goals;
    }
  }, [goals, filter]);

  const summary = useMemo(() => {
    const active = goals.filter(g => !g.isCompleted);
    const completed = goals.filter(g => g.isCompleted);
    const totalTarget = active.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
    const totalSaved = active.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return { 
      active: active.length, 
      completed: completed.length, 
      totalTarget: isNaN(totalTarget) ? 0 : totalTarget, 
      totalSaved: isNaN(totalSaved) ? 0 : totalSaved, 
      progress: isNaN(progress) ? 0 : progress 
    };
  }, [goals]);

  const handleAdd = (data: Partial<Goal>) => {
    addGoal({
      id: Date.now().toString(),
      name: data.name || '',
      targetAmount: data.targetAmount || 0,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline,
      icon: data.icon || '🎯',
      color: data.color || '#05BFDB',
      description: data.description,
      createdAt: new Date(),
      isCompleted: false,
    });
  };

  const handleEdit = (data: Partial<Goal>) => {
    if (editingGoal) { updateGoal(editingGoal.id, data); setEditingGoal(null); }
  };

  const handleDelete = () => { if (deletingGoal) { deleteGoal(deletingGoal.id); setDeletingGoal(null); } };

  const handleContribution = (amount: number) => {
    if (contributingGoal) {
      addContribution(contributingGoal.id, amount);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas de Ahorro</h1>
          <p className="text-white/60 mt-1">{summary.active} activas, {summary.completed} completadas</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Nueva Meta</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center"><Target className="w-8 h-8 mx-auto mb-2 text-primary-400" /><p className="text-xs text-white/50">Objetivo Total</p><p className="text-lg font-bold text-white">{formatCurrency(summary.totalTarget, currency)}</p></Card>
        <Card className="text-center"><TrendingUp className="w-8 h-8 mx-auto mb-2 text-success-400" /><p className="text-xs text-white/50">Ahorrado</p><p className="text-lg font-bold text-success-400">{formatCurrency(summary.totalSaved, currency)}</p></Card>
        <Card className="text-center"><Zap className="w-8 h-8 mx-auto mb-2 text-warning-400" /><p className="text-xs text-white/50">Progreso</p><p className="text-lg font-bold text-warning-400">{summary.progress.toFixed(1)}%</p></Card>
        <Card className="text-center"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary-400" /><p className="text-xs text-white/50">Completadas</p><p className="text-lg font-bold text-white">{summary.completed}</p></Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn('px-4 py-2 rounded-lg font-medium transition-all', filter === f ? 'bg-primary-500/20 text-primary-400' : 'text-white/50 hover:text-white')}>
            {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Completadas'}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <Card><EmptyState icon="🎯" title={filter === 'completed' ? 'Sin metas completadas' : 'Sin metas'} description={filter === 'all' ? 'Crea tu primera meta de ahorro' : undefined} action={filter === 'all' && <Button onClick={() => setShowForm(true)}>Crear Meta</Button>} /></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredGoals.map((goal, index) => {
            const progress = getGoalProgress(goal);
            const daysLeft = getDaysUntilDeadline(goal);
            const monthlyNeeded = getRequiredMonthlySaving(goal);
            const isOverdue = daysLeft !== null && daysLeft < 0;

            return (
              <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className={cn('relative overflow-hidden', goal.isCompleted && 'border-success-500/50')}>
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10" style={{ backgroundColor: goal.color }} />

                  {/* Completed badge */}
                  {goal.isCompleted && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Completada</Badge>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${goal.color}20` }}>
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{goal.name}</h3>
                      {goal.description && <p className="text-white/50 text-sm mt-1 line-clamp-1">{goal.description}</p>}
                      {goal.deadline && (
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar className="w-3 h-3 text-white/40" />
                          <span className={cn('text-xs', isOverdue ? 'text-danger-400' : 'text-white/50')}>
                            {isOverdue ? `Venció hace ${Math.abs(daysLeft!)} días` : daysLeft === 0 ? 'Vence hoy' : `${daysLeft} días restantes`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Progreso</span>
                      <span className="font-semibold text-white">{isNaN(progress) ? '0.0' : progress.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${isNaN(progress) ? 0 : progress}%` }} transition={{ duration: 0.5 }} className="absolute h-full rounded-full" style={{ backgroundColor: goal.color }} />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex justify-between text-sm mb-4">
                    <div><p className="text-white/50">Ahorrado</p><p className="font-semibold text-white">{formatCurrency(Number(goal.currentAmount) || 0, currency)}</p></div>
                    <div className="text-right"><p className="text-white/50">Objetivo</p><p className="font-semibold text-white">{formatCurrency(Number(goal.targetAmount) || 0, currency)}</p></div>
                  </div>

                  {/* Monthly needed */}
                  {monthlyNeeded && monthlyNeeded > 0 && !goal.isCompleted && (
                    <div className="p-3 rounded-xl bg-white/5 text-center mb-4">
                      <p className="text-xs text-white/50">Ahorra mensualmente</p>
                      <p className="font-bold text-white" style={{ color: goal.color }}>{formatCurrency(monthlyNeeded, currency)}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!goal.isCompleted && (
                      <Button variant="primary" size="sm" fullWidth leftIcon={<DollarSign className="w-4 h-4" />} onClick={() => setContributingGoal(goal)} style={{ background: `linear-gradient(135deg, ${goal.color}, ${goal.color}dd)` }}>
                        Aportar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setEditingGoal(goal); setShowForm(true); }}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingGoal(goal)} className="text-danger-400 hover:bg-danger-500/10"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GoalForm isOpen={showForm} onClose={() => { setShowForm(false); setEditingGoal(null); }} goal={editingGoal} onSubmit={editingGoal ? handleEdit : handleAdd} />
      <ContributionModal isOpen={!!contributingGoal} onClose={() => setContributingGoal(null)} goal={contributingGoal} onSubmit={handleContribution} />

      <Modal isOpen={!!deletingGoal} onClose={() => setDeletingGoal(null)} title="Eliminar Meta" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center"><Trash2 className="w-8 h-8 text-danger-400" /></div>
          <p className="text-white/80 mb-6">¿Eliminar la meta "{deletingGoal?.name}"?</p>
          <div className="flex gap-3"><Button variant="secondary" onClick={() => setDeletingGoal(null)} fullWidth>Cancelar</Button><Button variant="danger" onClick={handleDelete} fullWidth>Eliminar</Button></div>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
