// ============================================
// 💸 TRANSACTIONS PAGE - COMPLETE
// ============================================
import React, { useState, useMemo } from 'react';
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
import { Card, Button, Input, Select, Modal, Badge, EmptyState } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency, formatDate, filterByDateRange } from '../../utils/financial';
import type { Transaction } from '../../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../types';

// ========================================
// TRANSACTION FORM
// ========================================
interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSubmit: (data: Partial<Transaction>) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  transaction,
  onSubmit,
}) => {
  const [type, setType] = useState<'expense' | 'income'>(transaction?.type || 'expense');
  const [description, setDescription] = useState(transaction?.description || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(transaction?.notes || '');

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    onSubmit({ id: transaction?.id, type, description, amount: parseFloat(amount), category, date, notes });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Editar Movimiento' : 'Nuevo Movimiento'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'expense' ? 'bg-danger-500/20 text-danger-400' : 'text-white/50 hover:text-white'
            )}
          >
            <ArrowDownRight className="w-4 h-4" /> Gasto
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all',
              type === 'income' ? 'bg-success-500/20 text-success-400' : 'text-white/50 hover:text-white'
            )}
          >
            <ArrowUpRight className="w-4 h-4" /> Ingreso
          </button>
        </div>

        <Input label="Descripción" placeholder="Ej: Almuerzo, Netflix..." value={description} onChange={(e) => setDescription(e.target.value)} required />
        <Input label="Monto" type="number" step="0.01" min="0" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} leftIcon={<span>$</span>} required />

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
                  category === cat.name ? 'bg-primary-500/20 border-2 border-primary-500' : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                )}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-[10px] text-white/70 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <div>
          <label className="block mb-2 text-sm font-semibold text-white/90">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles adicionales..."
            className="w-full px-4 py-3 rounded-xl bg-dark-700/60 border-2 border-white/10 text-white placeholder-white/40 focus:border-primary-500 resize-none"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
          <Button type="submit" fullWidth>{transaction ? 'Guardar' : 'Añadir'}</Button>
        </div>
      </form>
    </Modal>
  );
};

// ========================================
// MAIN PAGE
// ========================================
export const TransactionsPage: React.FC = () => {
  const { expenses, incomes, currency, theme, transactionFilters, setTransactionFilters, clearTransactionFilters, deleteTransaction, addTransaction, updateTransaction } = useStore();
  const themeColors = getThemeColors(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Filter & combine transactions
  const allTransactions = useMemo(() => {
    let transactions = [
      ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
      ...incomes.map((i) => ({ ...i, type: 'income' as const })),
    ];

    if (transactionFilters.type && transactionFilters.type !== 'all') {
      transactions = transactions.filter((t) => t.type === transactionFilters.type);
    }
    if (transactionFilters.category) {
      transactions = transactions.filter((t) => t.category === transactionFilters.category);
    }
    if (transactionFilters.dateFrom || transactionFilters.dateTo) {
      transactions = filterByDateRange(transactions, transactionFilters.dateFrom || '1900-01-01', transactionFilters.dateTo || '2100-12-31');
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      transactions = transactions.filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, incomes, transactionFilters, searchQuery]);

  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const paginatedTransactions = allTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const summary = useMemo(() => {
    const totalIncome = allTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = allTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [allTransactions]);

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => cats.add(e.category));
    incomes.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [expenses, incomes]);

  const handleAdd = (data: Partial<Transaction>) => {
    addTransaction({
      id: Date.now().toString(),
      type: data.type || 'expense',
      description: data.description || '',
      amount: data.amount || 0,
      category: data.category || '',
      date: data.date || new Date().toISOString().split('T')[0],
      notes: data.notes,
      createdAt: new Date(),
    });
  };

  const handleEdit = (data: Partial<Transaction>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    }
  };

  const handleDelete = () => {
    if (deletingTransaction) {
      deleteTransaction(deletingTransaction.id, deletingTransaction.type);
      setDeletingTransaction(null);
    }
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
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>Añadir</Button>
      </div>

      {/* Summary */}
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
          <p className={cn('text-lg font-bold', summary.balance >= 0 ? 'text-success-400' : 'text-danger-400')}>{formatCurrency(summary.balance, currency)}</p>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card padding="sm">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4" /></button>}
            />
          </div>
          <Button variant={showFilters ? 'primary' : 'secondary'} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4" />
            {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full" />}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10 mt-4">
                <Select label="Tipo" value={transactionFilters.type || 'all'} onChange={(e) => setTransactionFilters({ type: e.target.value as any })} options={[{ value: 'all', label: 'Todos' }, { value: 'expense', label: 'Gastos' }, { value: 'income', label: 'Ingresos' }]} />
                <Select label="Categoría" value={transactionFilters.category || ''} onChange={(e) => setTransactionFilters({ category: e.target.value })} options={[{ value: '', label: 'Todas' }, ...allCategories.map((c) => ({ value: c, label: c }))]} />
                <Input label="Desde" type="date" value={transactionFilters.dateFrom || ''} onChange={(e) => setTransactionFilters({ dateFrom: e.target.value })} />
                <Input label="Hasta" type="date" value={transactionFilters.dateTo || ''} onChange={(e) => setTransactionFilters({ dateTo: e.target.value })} />
              </div>
              {hasActiveFilters && (
                <div className="flex justify-end mt-3">
                  <Button variant="ghost" size="sm" onClick={() => { clearTransactionFilters(); setCurrentPage(1); }}>Limpiar filtros</Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* List */}
      <Card padding="none">
        {paginatedTransactions.length === 0 ? (
          <EmptyState icon="💸" title="Sin movimientos" description={hasActiveFilters || searchQuery ? 'No hay resultados' : 'Registra tu primer movimiento'} action={<Button size="sm" onClick={() => setShowForm(true)}>Añadir</Button>} />
        ) : (
          <div className="divide-y divide-white/5">
            {paginatedTransactions.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-3 p-4 hover:bg-white/5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg', t.type === 'income' ? 'bg-success-500/20' : 'bg-danger-500/20')}>
                  {t.type === 'income' ? '💰' : '💸'}
                </div>
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
                <p className={cn('font-bold', t.type === 'income' ? 'text-success-400' : 'text-danger-400')}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </p>
                <div className="relative">
                  <button onClick={() => setActionMenuId(actionMenuId === t.id ? null : t.id)} className="p-2 rounded-lg hover:bg-white/10">
                    <MoreVertical className="w-4 h-4 text-white/40" />
                  </button>
                  <AnimatePresence>
                    {actionMenuId === t.id && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-10 w-36 bg-dark-500 border border-white/10 rounded-xl shadow-xl z-10">
                        <button onClick={() => { setEditingTransaction(t); setShowForm(true); setActionMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-white/80 hover:bg-white/5">
                          <Edit2 className="w-4 h-4" /> Editar
                        </button>
                        <button onClick={() => { setDeletingTransaction(t); setActionMenuId(null); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-danger-400 hover:bg-danger-500/10">
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </motion.div>
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
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <TransactionForm isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(null); }} transaction={editingTransaction} onSubmit={editingTransaction ? handleEdit : handleAdd} />

      <Modal isOpen={!!deletingTransaction} onClose={() => setDeletingTransaction(null)} title="Eliminar" size="sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-danger-400" />
          </div>
          <p className="text-white/80 mb-6">¿Eliminar "{deletingTransaction?.description}"?</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeletingTransaction(null)} fullWidth>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete} fullWidth>Eliminar</Button>
          </div>
        </div>
      </Modal>

      {actionMenuId && <div className="fixed inset-0 z-0" onClick={() => setActionMenuId(null)} />}
    </div>
  );
};

export default TransactionsPage;
