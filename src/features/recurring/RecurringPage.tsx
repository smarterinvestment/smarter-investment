// ============================================
// 🔄 RECURRING PAGE - WITH CHARTS & TABS
// ============================================
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Edit2, Trash2, Bell, BellOff, Play, Pause,
  ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, TrendingUp,
  PieChart, BarChart2, RefreshCw
} from 'lucide-react';
import {
  PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useRecurring } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Select, Modal, Badge, EmptyState, Switch } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';
import type { RecurringTransaction, RecurringFrequency } from '../../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../types';

// Frequency config
const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Diario', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual',
};

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly', label: 'Anual' },
];

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

// ========================================
// RECURRING FORM
// ========================================
interface RecurringFormProps {
  isOpen: boolean;
  onClose: () => void;
  recurring?: RecurringTransaction | null;
  onSubmit: (data: Partial<RecurringTransaction>) => Promise<void>;
  isSubmitting: boolean;
}

const RecurringForm: React.FC<RecurringFormProps> = ({ isOpen, onClose, recurring, onSubmit, isSubmitting }) => {
  const [type, setType] = useState<'expense' | 'income'>(recurring?.type || 'expense');
  const [name, setName] = useState(recurring?.name || '');
  const [description, setDescription] = useState(recurring?.description || '');
  const [amount, setAmount] = useState(recurring?.amount?.toString() || '');
  const [category, setCategory] = useState(recurring?.category || '');
  const [frequency, setFrequency] = useState<RecurringFrequency>(recurring?.frequency || 'monthly');
  const [dayOfMonth, setDayOfMonth] = useState(recurring?.dayOfMonth?.toString() || '1');
  const [isActive, setIsActive] = useState(recurring?.isActive ?? true);

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  React.useEffect(() => {
    if (isOpen) {
      if (recurring) {
        setType(recurring.type || 'expense');
        setName(recurring.name || '');
        setDescription(recurring.description || '');
        setAmount(recurring.amount?.toString() || '');
        setCategory(recurring.category || '');
        setFrequency(recurring.frequency || 'monthly');
        setDayOfMonth(recurring.dayOfMonth?.toString() || '1');
        setIsActive(recurring.isActive ?? true);
      } else {
        setType('expense');
        setName('');
        setDescription('');
        setAmount('');
        setCategory('');
        setFrequency('monthly');
        setDayOfMonth('1');
        setIsActive(true);
      }
    }
  }, [recurring, isOpen]);

  const calculateNextDueDate = (): string => {
    const now = new Date();
    const nextDate = new Date();
    switch (frequency) {
      case 'daily': nextDate.setDate(now.getDate() + 1); break;
      case 'weekly': nextDate.setDate(now.getDate() + 7); break;
      case 'biweekly': nextDate.setDate(now.getDate() + 14); break;
      case 'monthly':
        nextDate.setMonth(now.getMonth() + 1);
        nextDate.setDate(Math.min(parseInt(dayOfMonth), 28));
        break;
      case 'yearly': nextDate.setFullYear(now.getFullYear() + 1); break;
    }
    return nextDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showError('El nombre es requerido'); return; }
    if (!amount || parseFloat(amount) <= 0) { showError('El monto debe ser mayor a 0'); return; }
    if (!category) { showError('Selecciona una categoría'); return; }

    try {
      await onSubmit({
        id: recurring?.id,
        name: name.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        category,
        type,
        frequency,
        dayOfMonth: parseInt(dayOfMonth),
        dayOfWeek: 1,
        isActive,
        reminderDays: 3,
        nextDueDate: calculateNextDueDate(),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={recurring ? '✏️ Editar Recurrente' : '➕ Nuevo Recurrente'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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

        <Input label="Nombre *" placeholder="Ej: Netflix, Salario..." value={name} onChange={e => setName(e.target.value)} required />
        
        <Input label="Monto *" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} leftIcon={<span>$</span>} required />

        {/* Category Selection */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría *</label>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                className={cn('flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-xs',
                  category === cat.name ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10')}>
                <span className="text-xl">{cat.icon}</span>
                <span className="text-white/70 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Select label="Frecuencia" value={frequency} onChange={e => setFrequency(e.target.value as RecurringFrequency)}
          options={FREQUENCY_OPTIONS} />

        {frequency === 'monthly' && (
          <Input label="Día del mes" type="number" min="1" max="28" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
        )}

        <Input label="Descripción (opcional)" placeholder="Notas adicionales..." value={description} onChange={e => setDescription(e.target.value)} />

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
          <span className="text-white/80">Activo</span>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>Cancelar</Button>
          <Button type="submit" fullWidth isLoading={isSubmitting}>{recurring ? 'Guardar' : 'Crear'}</Button>
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
  const [activeTab, setActiveTab] = useState<'all' | 'expenses' | 'incomes'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe array
  const safeRecurring = Array.isArray(recurring) ? recurring : [];

  // Filter by tab
  const filteredRecurring = useMemo(() => {
    let items = [...safeRecurring];
    if (activeTab === 'expenses') items = items.filter(r => r.type === 'expense');
    if (activeTab === 'incomes') items = items.filter(r => r.type === 'income');
    return items.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
    });
  }, [safeRecurring, activeTab]);

  // Summary calculations
  const summary = useMemo(() => {
    const activeItems = safeRecurring.filter(r => r.isActive);
    const getMonthlyAmount = (r: RecurringTransaction) => {
      const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
      return r.amount * mult;
    };
    
    const monthlyExpenses = activeItems.filter(r => r.type === 'expense').reduce((sum, r) => sum + getMonthlyAmount(r), 0);
    const monthlyIncome = activeItems.filter(r => r.type === 'income').reduce((sum, r) => sum + getMonthlyAmount(r), 0);
    const expenseCount = safeRecurring.filter(r => r.type === 'expense').length;
    const incomeCount = safeRecurring.filter(r => r.type === 'income').length;
    
    return { monthlyExpenses, monthlyIncome, net: monthlyIncome - monthlyExpenses, expenseCount, incomeCount };
  }, [safeRecurring]);

  // Chart data - by category
  const categoryChartData = useMemo(() => {
    const catTotals: Record<string, { name: string; expense: number; income: number }> = {};
    
    safeRecurring.filter(r => r.isActive).forEach(r => {
      const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
      const monthly = r.amount * mult;
      
      if (!catTotals[r.category]) {
        catTotals[r.category] = { name: r.category, expense: 0, income: 0 };
      }
      if (r.type === 'expense') catTotals[r.category].expense += monthly;
      else catTotals[r.category].income += monthly;
    });
    
    return Object.values(catTotals).sort((a, b) => (b.expense + b.income) - (a.expense + a.income)).slice(0, 6);
  }, [safeRecurring]);

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: 'Gastos Fijos', value: summary.monthlyExpenses, fill: '#EF4444' },
      { name: 'Ingresos Fijos', value: summary.monthlyIncome, fill: '#22C55E' },
    ].filter(d => d.value > 0);
  }, [summary]);

  // Handlers
  const handleAdd = async (data: Partial<RecurringTransaction>) => {
    setIsSubmitting(true);
    try {
      await add({
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
      });
      showSuccess('Recurrente creado');
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: Partial<RecurringTransaction>) => {
    if (!editingRecurring) return;
    setIsSubmitting(true);
    try {
      await update(editingRecurring.id, data);
      showSuccess('Recurrente actualizado');
      setEditingRecurring(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecurring) return;
    setIsSubmitting(true);
    try {
      await remove(deletingRecurring.id);
      showSuccess('Eliminado');
      setDeletingRecurring(null);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await update(item.id, { isActive: !item.isActive });
      showSuccess(item.isActive ? 'Pausado' : 'Activado');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCategoryIcon = (category: string, type: string) => {
    const cats = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;
    return cats.find(c => c.name === category)?.icon || '📦';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6" style={{ color: themeColors.primary }} />
            Recurrentes
          </h1>
          <p className="text-white/60 mt-1">{safeRecurring.length} transacciones configuradas</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Nuevo</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <ArrowUpRight className="w-8 h-8 mx-auto mb-2 text-success-400" />
          <p className="text-xs text-white/50">Ingresos Fijos/mes</p>
          <p className="text-lg font-bold text-success-400">{formatCurrency(summary.monthlyIncome, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <ArrowDownRight className="w-8 h-8 mx-auto mb-2 text-danger-400" />
          <p className="text-xs text-white/50">Gastos Fijos/mes</p>
          <p className="text-lg font-bold text-danger-400">{formatCurrency(summary.monthlyExpenses, currency)}</p>
        </Card>
        <Card className="text-center p-4">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: summary.net >= 0 ? '#22C55E' : '#EF4444' }} />
          <p className="text-xs text-white/50">Balance Fijo/mes</p>
          <p className={cn('text-lg font-bold', summary.net >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(summary.net, currency)}
          </p>
        </Card>
        <Card className="text-center p-4">
          <RefreshCw className="w-8 h-8 mx-auto mb-2" style={{ color: themeColors.primary }} />
          <p className="text-xs text-white/50">Total Activos</p>
          <p className="text-lg font-bold text-white">{safeRecurring.filter(r => r.isActive).length}</p>
        </Card>
      </div>

      {/* Charts */}
      {safeRecurring.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" style={{ color: themeColors.primary }} />
              Distribución Mensual
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar Chart by Category */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" style={{ color: themeColors.primary }} />
              Por Categoría
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} width={80} />
                  <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                  <Bar dataKey="income" fill="#22C55E" name="Ingreso" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="expense" fill="#EF4444" name="Gasto" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {[
          { id: 'all', label: 'Todos', count: safeRecurring.length },
          { id: 'expenses', label: 'Gastos', count: summary.expenseCount },
          { id: 'incomes', label: 'Ingresos', count: summary.incomeCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn('px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
              activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white')}
            style={activeTab === tab.id ? { backgroundColor: `${themeColors.primary}20`, color: themeColors.primary } : {}}
          >
            {tab.label}
            <Badge variant="secondary" className="text-xs">{tab.count}</Badge>
          </button>
        ))}
      </div>

      {/* List */}
      {filteredRecurring.length === 0 ? (
        <EmptyState
          icon={<RefreshCw className="w-16 h-16" />}
          title="Sin recurrentes"
          description="Agrega tus pagos y cobros fijos"
          action={<Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Crear</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRecurring.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn('p-4', !item.isActive && 'opacity-60')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                        item.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20')}>
                        {getCategoryIcon(item.category, item.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <p className="text-sm text-white/50">{item.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={item.type === 'income' ? 'success' : 'danger'}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, currency)}
                          </Badge>
                          <Badge variant="secondary">{FREQUENCY_LABELS[item.frequency]}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleToggleActive(item)}
                        className={cn('p-2 rounded-lg transition-colors',
                          item.isActive ? 'hover:bg-warning-500/20 text-success-400' : 'hover:bg-success-500/20 text-white/50')}>
                        {item.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setEditingRecurring(item)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingRecurring(item)}
                        className="p-2 rounded-lg hover:bg-danger-500/20 text-white/50 hover:text-danger-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <RecurringForm
        isOpen={showForm || !!editingRecurring}
        onClose={() => { setShowForm(false); setEditingRecurring(null); }}
        recurring={editingRecurring}
        onSubmit={editingRecurring ? handleEdit : handleAdd}
        isSubmitting={isSubmitting}
      />

      <Modal isOpen={!!deletingRecurring} onClose={() => setDeletingRecurring(null)} title="🗑️ Eliminar" size="sm">
        <div className="text-center">
          <p className="text-white/80 mb-6">¿Eliminar "{deletingRecurring?.name}"?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingRecurring(null)} fullWidth>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} fullWidth isLoading={isSubmitting}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RecurringPage;
