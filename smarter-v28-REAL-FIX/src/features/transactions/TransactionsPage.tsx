// ============================================
// 💸 TRANSACTIONS PAGE - FIXED VERSION
// Delete/Edit working + FAB opens modal
// ============================================
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useTransactions } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Select, Modal, Badge, EmptyState } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate } from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';
import type { Transaction } from '../../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../types';

// ========================================
// TRANSACTION FORM COMPONENT
// ========================================
interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSubmit: (data: Partial<Transaction>) => void;
  isSubmitting?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  transaction,
  onSubmit,
  isSubmitting = false,
}) => {
  const [type, setType] = useState<'expense' | 'income'>(transaction?.type || 'expense');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(transaction?.notes || '');

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  // Reset form when opening/closing or when transaction changes
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setType(transaction.type || 'expense');
        setDescription(transaction.description || '');
        setAmount(transaction.amount?.toString() || '');
        setCategory(transaction.category || '');
        setDate(transaction.date || new Date().toISOString().split('T')[0]);
        setNotes(transaction.notes || '');
      } else {
        setType('expense');
        setDescription('');
        setAmount('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // PREVENCIÓN: No permitir submit si ya está procesando
    if (isSubmitting) {
      return;
    }
    
    if (!description.trim() || !amount || !category) {
      showError('Por favor completa todos los campos');
      return;
    }
    onSubmit({ 
      id: transaction?.id, 
      type, 
      description: description.trim(), 
      amount: parseFloat(amount), 
      category, 
      date, 
      notes: notes.trim() 
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={transaction ? 'Editar Movimiento' : 'Nuevo Movimiento'} 
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
          <button 
            type="button" 
            onClick={() => { setType('expense'); setCategory(''); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'expense' ? 'bg-danger-500/20 text-danger-400' : 'text-white/50 hover:text-white'
            )}
          >
            <ArrowDownRight className="w-4 h-4" /> Gasto
          </button>
          <button 
            type="button" 
            onClick={() => { setType('income'); setCategory(''); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'income' ? 'bg-success-500/20 text-success-400' : 'text-white/50 hover:text-white'
            )}
          >
            <ArrowUpRight className="w-4 h-4" /> Ingreso
          </button>
        </div>

        {/* Description */}
        <Input 
          label="Descripción" 
          placeholder="Ej: Almuerzo, Netflix..." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />

        {/* Amount */}
        <Input 
          label="Monto" 
          type="number" 
          step="0.01" 
          min="0" 
          placeholder="0.00" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          leftIcon={<span>$</span>} 
          required 
        />

        {/* Category Grid */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Categoría</label>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                type="button" 
                onClick={() => setCategory(cat.name)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
                  category === cat.name 
                    ? 'bg-primary-500/20 border-2 border-primary-500' 
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[10px] text-white/70 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <Input 
          label="Fecha" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          required 
        />

        {/* Notes */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Notas (opcional)</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Detalles adicionales..."
            className="w-full px-4 py-3 rounded-xl bg-dark-700/60 border-2 border-white/10 text-white placeholder-white/40 focus:border-primary-500 focus:outline-none resize-none" 
            rows={2} 
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (transaction ? 'Guardar' : 'Añadir')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ========================================
// ACTION MENU COMPONENT (Fixed)
// ========================================
interface ActionMenuProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ transaction, onEdit, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="absolute right-0 top-10 w-36 bg-dark-500 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit();
        }} 
        className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/10 transition-colors"
      >
        <Edit2 className="w-4 h-4" /> Editar
      </button>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }} 
        className="w-full flex items-center gap-2 px-4 py-2.5 text-danger-400 hover:bg-danger-500/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" /> Eliminar
      </button>
    </motion.div>
  );
};

// ========================================
// MAIN TRANSACTIONS PAGE
// ========================================
export const TransactionsPage: React.FC = () => {
  const { currency, theme, transactionFilters, setTransactionFilters, clearTransactionFilters } = useStore();
  const { expenses, incomes, add, update, remove } = useTransactions();
  const themeColors = getThemeColors(theme);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  // Filter and sort transactions
  const allTransactions = useMemo(() => {
    let transactions = [
      ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
      ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ];

    // Apply filters
    if (transactionFilters.type && transactionFilters.type !== 'all') {
      transactions = transactions.filter((t) => t.type === transactionFilters.type);
    }
    if (transactionFilters.category) {
      transactions = transactions.filter((t) => t.category === transactionFilters.category);
    }
    if (transactionFilters.dateFrom) {
      transactions = transactions.filter((t) => t.date >= transactionFilters.dateFrom!);
    }
    if (transactionFilters.dateTo) {
      transactions = transactions.filter((t) => t.date <= transactionFilters.dateTo!);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter((t) =>
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.notes?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return transactions;
  }, [expenses, incomes, transactionFilters, searchQuery]);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set([...expenses.map((e) => e.category), ...incomes.map((i) => i.category)]);
    return Array.from(cats).sort();
  }, [expenses, incomes]);

  // Pagination
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const paginatedTransactions = allTransactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Summary calculation
  const summary = useMemo(() => {
    const totalIncome = allTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [allTransactions]);

  // Handlers
  const handleAdd = async (data: Partial<Transaction>) => {
    // TRIPLE PREVENCIÓN DE DUPLICACIÓN
    if (isSubmitting) {
      console.log('❌ Submit bloqueado - ya está procesando');
      return;
    }
    
    setIsSubmitting(true);
    console.log('✅ Iniciando submit de transacción...');
    
    try {
      await add({ 
        type: data.type!, 
        description: data.description!, 
        amount: data.amount!, 
        category: data.category!, 
        date: data.date!, 
        notes: data.notes || '' 
      });
      console.log('✅ Transacción guardada exitosamente');
      showSuccess('Transacción agregada');
      setShowForm(false);
      // Limpiar cualquier estado residual
      setTimeout(() => setIsSubmitting(false), 500);
    } catch (error) {
      console.error('❌ Error al agregar:', error);
      showError('Error al agregar transacción');
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: Partial<Transaction>) => {
    if (!editingTransaction) return;
    
    // TRIPLE PREVENCIÓN DE DUPLICACIÓN
    if (isSubmitting) {
      console.log('❌ Submit bloqueado - ya está procesando');
      return;
    }
    
    setIsSubmitting(true);
    console.log('✅ Iniciando actualización de transacción...');
    
    try {
      await update(editingTransaction.id, editingTransaction.type, { 
        description: data.description, 
        amount: data.amount, 
        category: data.category, 
        date: data.date, 
        notes: data.notes 
      });
      console.log('✅ Transacción actualizada exitosamente');
      showSuccess('Transacción actualizada');
      setEditingTransaction(null);
      setShowForm(false);
      // Limpiar cualquier estado residual
      setTimeout(() => setIsSubmitting(false), 500);
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      showError('Error al actualizar transacción');
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    setIsSubmitting(true);
    try {
      await remove(deletingTransaction.id, deletingTransaction.type);
      showSuccess('Transacción eliminada');
      setDeletingTransaction(null);
    } catch (error) {
      showError('Error al eliminar transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setActionMenuId(null);
  };

  const openDeleteConfirm = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setActionMenuId(null);
  };

  const hasActiveFilters = transactionFilters.type !== 'all' || transactionFilters.category || transactionFilters.dateFrom || transactionFilters.dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Movimientos</h1>
          <p className="text-white/60">{allTransactions.length} transacciones</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setEditingTransaction(null); setShowForm(true); }}>
          Añadir
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Ingresos</p>
          <p className="text-lg font-bold text-success-400">+{formatCurrency(summary.totalIncome, currency)}</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Gastos</p>
          <p className="text-lg font-bold text-danger-400">-{formatCurrency(summary.totalExpense, currency)}</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-xs text-white/50">Balance</p>
          <p className={cn('text-lg font-bold', summary.balance >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(summary.balance, currency)}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="sm">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              placeholder="Buscar..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4" />
                </button>
              ) : undefined} 
            />
          </div>
          <Button 
            variant={showFilters ? 'primary' : 'secondary'} 
            onClick={() => setShowFilters(!showFilters)} 
            className="relative"
          >
            <Filter className="w-4 h-4" />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full" />}
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }} 
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10 mt-4">
                <Select 
                  label="Tipo" 
                  value={transactionFilters.type || 'all'} 
                  onChange={(e) => setTransactionFilters({ type: e.target.value as any })} 
                  options={[
                    { value: 'all', label: 'Todos' }, 
                    { value: 'expense', label: 'Gastos' }, 
                    { value: 'income', label: 'Ingresos' }
                  ]} 
                />
                <Select 
                  label="Categoría" 
                  value={transactionFilters.category || ''} 
                  onChange={(e) => setTransactionFilters({ category: e.target.value })} 
                  options={[
                    { value: '', label: 'Todas' }, 
                    ...allCategories.map((c) => ({ value: c, label: c }))
                  ]} 
                />
                <Input 
                  label="Desde" 
                  type="date" 
                  value={transactionFilters.dateFrom || ''} 
                  onChange={(e) => setTransactionFilters({ dateFrom: e.target.value })} 
                />
                <Input 
                  label="Hasta" 
                  type="date" 
                  value={transactionFilters.dateTo || ''} 
                  onChange={(e) => setTransactionFilters({ dateTo: e.target.value })} 
                />
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" onClick={() => { clearTransactionFilters(); setCurrentPage(1); }}>
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Transactions List */}
      <Card padding="none">
        {paginatedTransactions.length === 0 ? (
          <EmptyState 
            icon="💸" 
            title="Sin movimientos" 
            description={hasActiveFilters || searchQuery ? 'No hay resultados con estos filtros' : 'Registra tu primer movimiento'} 
            action={<Button size="sm" onClick={() => { setEditingTransaction(null); setShowForm(true); }}>Añadir</Button>} 
          />
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedTransactions.map((t, i) => (
              <motion.div 
                key={t.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.02 }} 
                className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0', 
                  t.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20'
                )}>
                  {t.type === 'income' ? '💰' : '💸'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{t.description}</p>
                    <Badge size="sm">{t.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/50">{formatDate(t.date)}</span>
                  </div>
                </div>

                {/* Amount */}
                <p className={cn('font-bold flex-shrink-0', t.type === 'income' ? 'text-success-400' : 'text-danger-400')}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </p>

                {/* Actions Menu */}
                <div className="relative flex-shrink-0">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActionMenuId(actionMenuId === t.id ? null : t.id);
                    }} 
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </button>
                  
                  <AnimatePresence>
                    {actionMenuId === t.id && (
                      <ActionMenu
                        transaction={t}
                        onEdit={() => openEditForm(t)}
                        onDelete={() => openDeleteConfirm(t)}
                        onClose={() => setActionMenuId(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-sm text-white/50">Página {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Form Modal */}
      <TransactionForm 
        isOpen={showForm} 
        onClose={() => { setShowForm(false); setEditingTransaction(null); }} 
        transaction={editingTransaction} 
        onSubmit={editingTransaction ? handleEdit : handleAdd}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deletingTransaction} 
        onClose={() => setDeletingTransaction(null)} 
        title="Eliminar Transacción" 
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-2">¿Estás seguro?</p>
          <p className="text-white/50 text-sm mb-6">
            Se eliminará "{deletingTransaction?.description}" permanentemente.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingTransaction(null)} fullWidth disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Floating Action Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-24 right-4 lg:bottom-8 z-30"
      >
        <Button
          onClick={() => { setEditingTransaction(null); setShowForm(true); }}
          className="w-14 h-14 rounded-full shadow-lg"
          style={{
            boxShadow: `0 0 30px ${themeColors.primary}40`,
          }}
          aria-label="Añadir movimiento"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  );
};

export default TransactionsPage;
