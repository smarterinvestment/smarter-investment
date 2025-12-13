// ============================================
// 🔄 RECURRING TRANSACTIONS PAGE - COMPLETE
// ============================================
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Bell,
  BellOff,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useRecurring } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Select, Modal, Badge, EmptyState, Switch } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate } from '../../utils/financial';
import { showSuccess } from '../../lib/errorHandler';
import type { RecurringTransaction, RecurringFrequency } from '../../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../types';

// ========================================
// FREQUENCY LABELS
// ========================================
const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

const DAY_OF_WEEK_OPTIONS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
];

// ========================================
// RECURRING FORM
// ========================================
interface RecurringFormProps {
  isOpen: boolean;
  onClose: () => void;
  recurring?: RecurringTransaction | null;
  onSubmit: (data: Partial<RecurringTransaction>) => void;
  isSubmitting?: boolean;
}

const RecurringForm: React.FC<RecurringFormProps> = ({ isOpen, onClose, recurring, onSubmit, isSubmitting = false }) => {
  const [type, setType] = useState<'expense' | 'income'>(recurring?.type || 'expense');
  const [name, setName] = useState(recurring?.name || '');
  const [description, setDescription] = useState(recurring?.description || '');
  const [amount, setAmount] = useState(recurring?.amount?.toString() || '');
  const [category, setCategory] = useState(recurring?.category || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(recurring?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(recurring?.dayOfMonth?.toString() || '1');
  const [dayOfWeek, setDayOfWeek] = useState(recurring?.dayOfWeek?.toString() || '1');
  const [reminderDays, setReminderDays] = useState(recurring?.reminderDays?.toString() || '3');
  const [isActive, setIsActive] = useState(recurring?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      if (recurring) {
        setType(recurring.type || 'expense');
        setName(recurring.name || '');
        setDescription(recurring.description || '');
        setAmount(recurring.amount?.toString() || '');
        setCategory(recurring.category || '');
        setFrequency(recurring.frequency || 'monthly');
        setDayOfMonth(recurring.dayOfMonth?.toString() || '1');
        setDayOfWeek(recurring.dayOfWeek?.toString() || '1');
        setReminderDays(recurring.reminderDays?.toString() || '3');
        setIsActive(recurring.isActive ?? true);
      } else {
        setType('expense');
        setName('');
        setDescription('');
        setAmount('');
        setCategory('');
        setFrequency('monthly');
        setDayOfMonth('1');
        setDayOfWeek('1');
        setReminderDays('3');
        setIsActive(true);
      }
    }
  }, [recurring, isOpen]);

  const calculateNextDueDate = (): string => {
    const now = new Date();
    const nextDate = new Date();

    switch (frequency) {
      case 'daily':
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        const targetDay = parseInt(dayOfWeek);
        const currentDay = now.getDay();
        const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
        nextDate.setDate(now.getDate() + daysUntil);
        break;
      case 'biweekly':
        nextDate.setDate(now.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        nextDate.setDate(Math.min(parseInt(dayOfMonth), 28));
        break;
      case 'yearly':
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
    }

    return nextDate.toISOString();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (!category) {
      setError('Selecciona una categoría');
      return;
    }

    console.log('📤 Submitting recurring form:', { name, amount, category, type, frequency });

    onSubmit({
      id: recurring?.id,
      name: name.trim(),
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      type,
      frequency,
      dayOfMonth: frequency === 'monthly' ? parseInt(dayOfMonth) : 1,
      dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : 1,
      isActive,
      reminderDays: parseInt(reminderDays),
      nextDueDate: calculateNextDueDate(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recurring ? 'Editar Recurrente' : 'Nuevo Pago Recurrente'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-danger-500/20 border border-danger-500/50 rounded-lg text-danger-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Type Toggle */}
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

        {/* NOMBRE - Campo principal y visible */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">
            Nombre <span className="text-danger-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Netflix, Renta, Salario..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-700/60 border-2 border-white/10 text-white placeholder-white/40 focus:border-primary-500 focus:outline-none"
            required
          />
        </div>

        <Input label="Descripción (opcional)" placeholder="Detalles adicionales..." value={description} onChange={(e) => setDescription(e.target.value)} />
        
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">
            Monto <span className="text-danger-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-xl bg-dark-700/60 border-2 border-white/10 text-white placeholder-white/40 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Category Grid */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría</label>
          <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto">
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

        {/* Frequency */}
        <Select label="Frecuencia" value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)} options={FREQUENCY_OPTIONS} />

        {/* Day of Month (for monthly) */}
        {frequency === 'monthly' && (
          <Select label="Día del mes" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)}
            options={Array.from({ length: 28 }, (_, i) => ({ value: `${i + 1}`, label: `Día ${i + 1}` }))} />
        )}

        {/* Day of Week (for weekly) */}
        {frequency === 'weekly' && (
          <Select label="Día de la semana" value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} options={DAY_OF_WEEK_OPTIONS} />
        )}

        {/* Reminder */}
        <Select label="Recordatorio (días antes)" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)}
          options={[
            { value: '0', label: 'Sin recordatorio' },
            { value: '1', label: '1 día antes' },
            { value: '2', label: '2 días antes' },
            { value: '3', label: '3 días antes' },
            { value: '5', label: '5 días antes' },
            { value: '7', label: '7 días antes' },
          ]} />

        {/* Active Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
          <div className="flex items-center gap-3">
            {isActive ? <Play className="w-5 h-5 text-success-400" /> : <Pause className="w-5 h-5 text-warning-400" />}
            <span className="text-white/90">{isActive ? 'Activo' : 'Pausado'}</span>
          </div>
          <Switch checked={isActive} onChange={setIsActive} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (recurring ? 'Guardar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ========================================
// MAIN PAGE
// ========================================
export const RecurringPage: React.FC = () => {
  const { currency, theme } = useStore();
  const { recurring, add, update, remove } = useRecurring();
  const themeColors = getThemeColors(theme);

  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [deletingRecurring, setDeletingRecurring] = useState<RecurringTransaction | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for action menu click outside detection
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuId(null);
      }
    };

    if (actionMenuId) {
      // Small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuId]);

  // Filter recurring transactions
  const filteredRecurring = useMemo(() => {
    let items = [...recurring];
    if (filterType !== 'all') {
      items = items.filter(r => r.type === filterType);
    }
    return items.sort((a, b) => {
      // Active first, then by next due date
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
    });
  }, [recurring, filterType]);

  // Summary
  const summary = useMemo(() => {
    const activeRecurring = recurring.filter(r => r.isActive);
    const monthlyExpenses = activeRecurring
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => {
        const multiplier = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
        return sum + r.amount * multiplier;
      }, 0);
    const monthlyIncome = activeRecurring
      .filter(r => r.type === 'income')
      .reduce((sum, r) => {
        const multiplier = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
        return sum + r.amount * multiplier;
      }, 0);
    return { monthlyExpenses, monthlyIncome, net: monthlyIncome - monthlyExpenses };
  }, [recurring]);

  // Upcoming payments (next 7 days)
  const upcomingPayments = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);

    return recurring
      .filter(r => r.isActive && new Date(r.nextDueDate) <= weekFromNow)
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [recurring]);

  const handleAdd = async (data: Partial<RecurringTransaction>) => {
    console.log('📋 RecurringPage handleAdd called with:', data);
    setIsSubmitting(true);
    try {
      const recurringData = {
        name: data.name || '',
        description: data.description || '',
        amount: data.amount || 0,
        category: data.category || '',
        type: data.type || 'expense',
        frequency: data.frequency || 'monthly',
        dayOfMonth: data.dayOfMonth || 1,
        dayOfWeek: data.dayOfWeek || 1,
        isActive: data.isActive !== false,
        reminderDays: data.reminderDays || 3,
        nextDueDate: data.nextDueDate || new Date().toISOString(),
      };
      console.log('📤 Sending to Firebase:', recurringData);
      await add(recurringData);
      showSuccess('Pago recurrente creado');
      setShowForm(false);
    } catch (error: any) {
      console.error('❌ RecurringPage handleAdd error:', error);
      console.error('Error details:', error?.message, error?.code);
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: Partial<RecurringTransaction>) => {
    if (!editingRecurring) return;
    setIsSubmitting(true);
    try {
      await update(editingRecurring.id, data);
      showSuccess('Pago recurrente actualizado');
      setEditingRecurring(null);
      setShowForm(false);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecurring) return;
    setIsSubmitting(true);
    try {
      await remove(deletingRecurring.id);
      showSuccess('Pago recurrente eliminado');
      setDeletingRecurring(null);
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await update(item.id, { isActive: !item.isActive });
      showSuccess(item.isActive ? 'Pago pausado' : 'Pago activado');
    } catch (error) {
      // Error handled in hook
    }
  };

  const getDaysUntil = (date: Date | string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pagos Recurrentes</h1>
          <p className="text-white/60">{recurring.filter(r => r.isActive).length} activos</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Añadir</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Ingresos / mes</p>
          <p className="text-lg font-bold text-success-400">+{formatCurrency(summary.monthlyIncome, currency)}</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Gastos / mes</p>
          <p className="text-lg font-bold text-danger-400">-{formatCurrency(summary.monthlyExpenses, currency)}</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Balance / mes</p>
          <p className={cn('text-lg font-bold', summary.net >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(summary.net, currency)}
          </p>
        </Card>
      </div>

      {/* Upcoming Alerts */}
      {upcomingPayments.length > 0 && (
        <Card className="border-l-4 border-warning-500 bg-warning-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-white">Próximos Pagos (7 días)</h3>
              <div className="mt-2 space-y-2">
                {upcomingPayments.slice(0, 3).map(item => {
                  const daysUntil = getDaysUntil(item.nextDueDate);
                  return (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-medium', item.type === 'income' ? 'text-success-400' : 'text-danger-400')}>
                          {formatCurrency(item.amount, currency)}
                        </span>
                        <Badge variant={daysUntil <= 1 ? 'danger' : daysUntil <= 3 ? 'warning' : 'primary'} size="sm">
                          {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
        {(['all', 'expense', 'income'] as const).map(type => (
          <button key={type} onClick={() => setFilterType(type)}
            className={cn('flex-1 py-2 px-4 rounded-lg font-medium transition-all text-sm',
              filterType === type ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white')}>
            {type === 'all' ? 'Todos' : type === 'expense' ? 'Gastos' : 'Ingresos'}
          </button>
        ))}
      </div>

      {/* List */}
      <Card padding="none">
        {filteredRecurring.length === 0 ? (
          <EmptyState icon="🔄" title="Sin pagos recurrentes" description="Configura tus pagos automáticos"
            action={<Button size="sm" onClick={() => setShowForm(true)}>Añadir</Button>} />
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRecurring.map((item, i) => {
              const daysUntil = getDaysUntil(item.nextDueDate);
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className={cn('flex items-center gap-3 p-4', !item.isActive && 'opacity-50')}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                    item.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20')}>
                    {item.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{item.name}</p>
                      <Badge size="sm" variant={item.isActive ? 'primary' : 'secondary'}>
                        {FREQUENCY_LABELS[item.frequency]}
                      </Badge>
                      {!item.isActive && <Badge size="sm" variant="warning">Pausado</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-xs text-white/50">
                        {item.isActive ? (
                          daysUntil === 0 ? 'Vence hoy' : daysUntil === 1 ? 'Vence mañana' : daysUntil < 0 ? 'Vencido' : `En ${daysUntil} días`
                        ) : 'Pausado'}
                      </span>
                    </div>
                  </div>
                  <p className={cn('font-bold', item.type === 'income' ? 'text-success-400' : 'text-danger-400')}>
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                  </p>
                  <div className="relative" ref={actionMenuId === item.id ? menuRef : null}>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActionMenuId(actionMenuId === item.id ? null : item.id);
                      }} 
                      className="p-2 rounded-lg hover:bg-white/10"
                    >
                      <MoreVertical className="w-4 h-4 text-white/40" />
                    </button>
                    <AnimatePresence>
                      {actionMenuId === item.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 top-10 w-40 bg-dark-500 border border-white/10 rounded-xl shadow-xl z-50"
                        >
                          <button 
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleActive(item); 
                              setActionMenuId(null); 
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/5"
                          >
                            {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {item.isActive ? 'Pausar' : 'Activar'}
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingRecurring(item); 
                              setShowForm(true); 
                              setActionMenuId(null); 
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/5"
                          >
                            <Edit2 className="w-4 h-4" /> Editar
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.preventDefault();
                              e.stopPropagation();
                              setDeletingRecurring(item); 
                              setActionMenuId(null); 
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-danger-400 hover:bg-danger-500/10"
                          >
                            <Trash2 className="w-4 h-4" /> Eliminar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <RecurringForm 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); setEditingRecurring(null); }}
        recurring={editingRecurring} 
        onSubmit={editingRecurring ? handleEdit : handleAdd}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation */}
      <Modal isOpen={!!deletingRecurring} onClose={() => setDeletingRecurring(null)} title="Eliminar" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-6">¿Eliminar "{deletingRecurring?.name}"?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingRecurring(null)} fullWidth>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecurringPage;
