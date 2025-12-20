// ============================================
// 🎯 GOALS PAGE - WITH FIREBASE PERSISTENCE
// ============================================
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Target, TrendingUp, Calendar, Zap, DollarSign, CheckCircle, Clock, Gift } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useGoals } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Modal, Badge, EmptyState, ProgressBar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, getGoalProgress, getDaysUntilDeadline, getRequiredMonthlySaving } from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';
import type { Goal } from '../../types';

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '👶', '🏝️', '💪', '📚', '🎮', '🎨', '🏋️', '🍽️', '💰', '🎁', '🏆', '⭐'];
const GOAL_COLORS = ['#05BFDB', '#ec4899', '#a855f7', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6'];

// Goal Form Component
const GoalForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  onSubmit: (data: Partial<Goal>) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, goal, onSubmit, isSubmitting }) => {
  const [name, setName] = useState(goal?.name || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount?.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount?.toString() || '0');
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [icon, setIcon] = useState(goal?.icon || '🎯');
  const [color, setColor] = useState(goal?.color || '#05BFDB');
  const [description, setDescription] = useState(goal?.description || '');

  React.useEffect(() => {
    if (isOpen && goal) {
      setName(goal.name || '');
      setTargetAmount(goal.targetAmount?.toString() || '');
      setCurrentAmount(goal.currentAmount?.toString() || '0');
      setDeadline(goal.deadline || '');
      setIcon(goal.icon || '🎯');
      setColor(goal.color || '#05BFDB');
      setDescription(goal.description || '');
    } else if (isOpen && !goal) {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setIcon('🎯');
      setColor('#05BFDB');
      setDescription('');
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) {
      showError('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      await onSubmit({
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
      showSuccess(goal ? 'Meta actualizada' : 'Meta creada');
    } catch (error) {
      showError('Error al guardar la meta');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? '✏️ Editar Meta' : '🎯 Nueva Meta'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Nombre de la meta *" 
          placeholder="Ej: Vacaciones, Auto nuevo..." 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Monto objetivo *" 
            type="number" 
            step="0.01" 
            min="0" 
            placeholder="0.00" 
            value={targetAmount} 
            onChange={e => setTargetAmount(e.target.value)} 
            leftIcon={<span>$</span>} 
            required 
          />
          <Input 
            label="Ahorrado actualmente" 
            type="number" 
            step="0.01" 
            min="0" 
            placeholder="0.00" 
            value={currentAmount} 
            onChange={e => setCurrentAmount(e.target.value)} 
            leftIcon={<span>$</span>} 
          />
        </div>

        <Input 
          label="Fecha límite (opcional)" 
          type="date" 
          value={deadline} 
          onChange={e => setDeadline(e.target.value)} 
        />

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Ícono</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_ICONS.map(i => (
              <button 
                key={i} 
                type="button" 
                onClick={() => setIcon(i)} 
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all',
                  icon === i ? 'ring-2 ring-offset-2 ring-offset-black' : 'bg-white/5 hover:bg-white/10'
                )}
                style={icon === i ? { backgroundColor: `${color}30`, borderColor: color } : {}}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Color</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map(c => (
              <button 
                key={c} 
                type="button" 
                onClick={() => setColor(c)} 
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  color === c && 'ring-2 ring-offset-2 ring-offset-black ring-white'
                )} 
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 15px ${c}` : 'none' }} 
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Descripción (opcional)</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="¿Por qué es importante esta meta?" 
            className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-white/30 resize-none" 
            rows={2} 
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {goal ? 'Guardar' : 'Crear Meta'}
          </Button>
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
  onSubmit: (amount: number) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, goal, onSubmit, isSubmitting }) => {
  const [amount, setAmount] = useState('');
  const { currency } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    try {
      await onSubmit(parseFloat(amount));
      setAmount('');
      onClose();
      showSuccess('Aporte agregado');
    } catch (error) {
      showError('Error al agregar aporte');
    }
  };

  if (!goal) return null;

  const progress = getGoalProgress(goal);
  const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💰 Agregar Aporte" size="sm">
      <div className="space-y-4">
        <div className="text-center p-4 rounded-xl bg-white/5">
          <span className="text-3xl">{goal.icon}</span>
          <h3 className="font-bold text-white mt-2">{goal.name}</h3>
          <p className="text-sm text-white/60">
            {formatCurrency(goal.currentAmount || 0, currency)} de {formatCurrency(goal.targetAmount || 0, currency)}
          </p>
          <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all" 
              style={{ 
                width: `${Math.min(progress, 100)}%`, 
                backgroundColor: goal.color,
                boxShadow: `0 0 10px ${goal.color}`
              }} 
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Monto a aportar"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            leftIcon={<span>$</span>}
            autoFocus
          />

          <div className="flex gap-2">
            {[100, 500, 1000].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
              >
                +${preset}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(remaining.toFixed(2))}
              className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors"
            >
              Todo
            </button>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Agregar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// Main Component
export const GoalsPage: React.FC = () => {
  const { currency, theme } = useStore();
  const themeColors = getThemeColors(theme);
  
  // USE THE FIREBASE HOOK - This is the key change
  const { goals, add, update, remove, contribute } = useGoals();
  
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe array
  const safeGoals = Array.isArray(goals) ? goals : [];

  const filteredGoals = useMemo(() => {
    return safeGoals.filter(g => {
      if (filter === 'active') return !g.isCompleted;
      if (filter === 'completed') return g.isCompleted;
      return true;
    });
  }, [safeGoals, filter]);

  const summary = useMemo(() => {
    const active = safeGoals.filter(g => !g.isCompleted).length;
    const completed = safeGoals.filter(g => g.isCompleted).length;
    const totalTarget = safeGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
    const totalSaved = safeGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
    const progress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return { active, completed, totalTarget, totalSaved, progress };
  }, [safeGoals]);

  // Handlers that use Firebase
  const handleAdd = async (data: Partial<Goal>) => {
    setIsSubmitting(true);
    try {
      await add({
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: Partial<Goal>) => {
    if (!editingGoal) return;
    setIsSubmitting(true);
    try {
      await update(editingGoal.id, data);
      setEditingGoal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGoal) return;
    setIsSubmitting(true);
    try {
      await remove(deletingGoal.id);
      setDeletingGoal(null);
      showSuccess('Meta eliminada');
    } catch (error) {
      showError('Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContribution = async (amount: number) => {
    if (!contributingGoal) return;
    setIsSubmitting(true);
    try {
      await contribute(contributingGoal.id, amount);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🎯 Metas de Ahorro</h1>
          <p className="text-white/60 mt-1">{summary.active} activas, {summary.completed} completadas</p>
        </div>
        <Button 
          leftIcon={<Plus className="w-4 h-4" />} 
          onClick={() => setShowForm(true)}
        >
          Nueva Meta
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <Target className="w-8 h-8 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <p className="text-xs text-white/50">Objetivo Total</p>
          <p className="text-lg font-bold text-white">{formatCurrency(summary.totalTarget, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success-400" />
          <p className="text-xs text-white/50">Ahorrado</p>
          <p className="text-lg font-bold text-success-400">{formatCurrency(summary.totalSaved, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <Zap className="w-8 h-8 mx-auto mb-2 text-warning-400" />
          <p className="text-xs text-white/50">Progreso</p>
          <p className="text-lg font-bold text-warning-400">{summary.progress.toFixed(1)}%</p>
        </Card>
        <Card className="text-center p-4">
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <p className="text-xs text-white/50">Completadas</p>
          <p className="text-lg font-bold text-white">{summary.completed}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-all',
              filter === f ? 'text-white' : 'text-white/50 hover:text-white'
            )}
            style={filter === f ? { 
              backgroundColor: `${themeColors.primary}20`,
              color: themeColors.primary 
            } : {}}
          >
            {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Completadas'}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-16 h-16" />}
          title={filter === 'all' ? 'Sin metas' : filter === 'active' ? 'Sin metas activas' : 'Sin metas completadas'}
          description={filter === 'all' ? 'Crea tu primera meta de ahorro' : undefined}
          action={filter === 'all' ? (
            <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
              Nueva Meta
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredGoals.map((goal, index) => {
              const progress = getGoalProgress(goal);
              const daysLeft = goal.deadline ? getDaysUntilDeadline(goal) : null;
              const monthlyRequired = getRequiredMonthlySaving(goal);
              const remaining = Math.max(0, (goal.targetAmount || 0) - (goal.currentAmount || 0));

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ 
                            backgroundColor: `${goal.color}20`,
                            boxShadow: `0 0 15px ${goal.color}30`
                          }}
                        >
                          {goal.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{goal.name}</h3>
                          {goal.isCompleted && (
                            <Badge variant="success" className="mt-1">✓ Completada</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setEditingGoal(goal)}
                          className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingGoal(goal)}
                          className="p-2 rounded-lg hover:bg-danger-500/20 text-white/50 hover:text-danger-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/60">Progreso</span>
                        <span className="font-bold" style={{ color: goal.color }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ 
                            backgroundColor: goal.color,
                            boxShadow: `0 0 10px ${goal.color}`
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progress, 100)}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 rounded-lg bg-white/5">
                          <p className="text-white/50 text-xs">Ahorrado</p>
                          <p className="font-bold text-success-400">
                            {formatCurrency(goal.currentAmount || 0, currency)}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <p className="text-white/50 text-xs">Meta</p>
                          <p className="font-bold text-white">
                            {formatCurrency(goal.targetAmount || 0, currency)}
                          </p>
                        </div>
                      </div>

                      {/* Deadline info */}
                      {goal.deadline && !goal.isCompleted && (
                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-white/50" />
                          <span className={cn(
                            daysLeft !== null && daysLeft < 7 ? 'text-danger-400' : 'text-white/50'
                          )}>
                            {daysLeft !== null 
                              ? daysLeft > 0 
                                ? `${daysLeft} días restantes`
                                : 'Fecha límite pasada'
                              : `Fecha: ${goal.deadline}`
                            }
                          </span>
                        </div>
                      )}

                      {/* Monthly required */}
                      {monthlyRequired && monthlyRequired > 0 && !goal.isCompleted && (
                        <div className="mt-2 text-xs text-white/40">
                          Ahorro mensual sugerido: {formatCurrency(monthlyRequired, currency)}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {!goal.isCompleted && (
                      <Button
                        variant="secondary"
                        onClick={() => setContributingGoal(goal)}
                        className="mt-4 w-full"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                      >
                        Agregar Aporte
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <GoalForm 
        isOpen={showForm || !!editingGoal} 
        onClose={() => { setShowForm(false); setEditingGoal(null); }} 
        goal={editingGoal} 
        onSubmit={editingGoal ? handleEdit : handleAdd}
        isSubmitting={isSubmitting}
      />
      
      <ContributionModal 
        isOpen={!!contributingGoal} 
        onClose={() => setContributingGoal(null)} 
        goal={contributingGoal} 
        onSubmit={handleContribution}
        isSubmitting={isSubmitting}
      />

      <Modal isOpen={!!deletingGoal} onClose={() => setDeletingGoal(null)} title="🗑️ Eliminar Meta" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-6">¿Eliminar la meta "{deletingGoal?.name}"?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingGoal(null)} fullWidth disabled={isSubmitting}>
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

export default GoalsPage;
