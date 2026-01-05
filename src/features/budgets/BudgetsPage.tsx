// src/features/budgets/BudgetsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, TrendingUp, AlertCircle, Edit2, Trash2, DollarSign, Target } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Alimentación', icon: '🍔', color: '#F59E0B' },
  { name: 'Transporte', icon: '🚗', color: '#3B82F6' },
  { name: 'Entretenimiento', icon: '🎬', color: '#8B5CF6' },
  { name: 'Salud', icon: '💊', color: '#EF4444' },
  { name: 'Educación', icon: '📚', color: '#10B981' },
  { name: 'Hogar', icon: '🏠', color: '#F97316' },
  { name: 'Servicios', icon: '💡', color: '#6366F1' },
  { name: 'Compras', icon: '🛍️', color: '#EC4899' },
  { name: 'Viajes', icon: '✈️', color: '#14B8A6' },
  { name: 'Otros', icon: '📦', color: '#64748B' },
];

interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  alertThreshold: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  amount: number;
  category: string | string[];
  type?: 'income' | 'expense';
  date: string;
  synced_from_plaid?: boolean;
  recurring?: boolean;
}

export const BudgetsPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Función helper para normalizar categorías
  const normalizeCategory = (category: string | string[]): string => {
    if (Array.isArray(category)) {
      return (category[0] || '').toLowerCase().trim();
    }
    return (category || '').toLowerCase().trim();
  };

  // Función helper para determinar el tipo de transacción
  const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
    if (tx.synced_from_plaid) {
      return tx.amount > 0 ? 'expense' : 'income';
    }
    return tx.type || 'expense';
  };

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('🔵 Cargando presupuestos y transacciones...');

    // Escuchar presupuestos
    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );

    const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData: Budget[] = [];
      snapshot.forEach((doc) => {
        budgetsData.push({ id: doc.id, ...doc.data() } as Budget);
      });
      console.log('💰 Presupuestos:', budgetsData);
      setBudgets(budgetsData);
      setLoading(false);
    });

    // Escuchar TODAS las transacciones del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', firstDayOfMonth)
    );

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.recurring) {
          txData.push({ id: doc.id, ...data } as Transaction);
        }
      });
      
      console.log('📊 Total transacciones del mes:', txData.length);
      txData.forEach(tx => {
        const cat = normalizeCategory(tx.category);
        const type = getTransactionType(tx);
        console.log(`  - ${cat}: $${tx.amount} (${type})`);
      });
      
      setTransactions(txData);
    });

    return () => {
      unsubBudgets();
      unsubTx();
    };
  }, []);

  // CALCULAR GASTOS EN TIEMPO REAL (sin actualizar Firestore)
  const budgetsWithSpending = useMemo(() => {
    console.log('🔄 Calculando gastos para cada presupuesto...');
    
    return budgets.map(budget => {
      const categoryNormalized = budget.category.toLowerCase().trim();
      
      // Filtrar transacciones que coincidan con esta categoría
      const categoryTransactions = transactions.filter(tx => {
        const txType = getTransactionType(tx);
        if (txType !== 'expense') return false;
        
        const txCategory = normalizeCategory(tx.category);
        
        // Comparación flexible
        const matches = 
          txCategory === categoryNormalized ||
          txCategory.includes(categoryNormalized) ||
          categoryNormalized.includes(txCategory);
        
        return matches;
      });
      
      const spent = categoryTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      
      console.log(`💵 ${budget.category}: $${spent.toFixed(2)} / $${budget.limit.toFixed(2)} (${categoryTransactions.length} transacciones)`);
      
      return {
        ...budget,
        spent,
        transactionCount: categoryTransactions.length
      };
    });
  }, [budgets, transactions]);

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (confirm('¿Eliminar este presupuesto?')) {
      try {
        await deleteDoc(doc(db, 'budgets', budgetId));
        console.log('✅ Presupuesto eliminado');
      } catch (error) {
        console.error('❌ Error:', error);
        alert('Error al eliminar el presupuesto');
      }
    }
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'bg-red-500', text: 'Excedido' };
    if (percentage >= 80) return { status: 'warning', color: 'bg-yellow-500', text: 'Alerta' };
    return { status: 'ok', color: 'bg-green-500', text: 'Bien' };
  };

  const totalBudget = budgetsWithSpending.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgetsWithSpending.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              💰 Presupuestos
            </h1>
            <p className="text-white/60 mt-1">
              Gestiona y monitorea tus límites de gasto
            </p>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-300" />
            <Button 
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              className="relative"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Presupuesto
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">Presupuesto Total</p>
                <p className="text-2xl font-bold text-white">${totalBudget.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-white/50">Gastado</p>
                <p className="text-2xl font-bold text-red-400">${totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                totalRemaining >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <DollarSign className={`w-5 h-5 ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
              <div>
                <p className="text-xs text-white/50">Restante</p>
                <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${totalRemaining.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="p-4 mb-6 bg-blue-500/10 border-blue-500/20">
          <p className="text-sm text-blue-400 mb-2">
            🔍 <strong>Debug:</strong> {transactions.length} transacciones del mes | {budgets.length} presupuestos
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {budgetsWithSpending.map(b => (
              <div key={b.id} className="text-white/70">
                {b.category}: ${b.spent.toFixed(2)} ({b.transactionCount} tx)
              </div>
            ))}
          </div>
        </Card>

        {/* Budgets List */}
        {budgetsWithSpending.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Sin presupuestos
            </h3>
            <p className="text-white/60 mb-4">
              Crea tu primer presupuesto para empezar a controlar tus gastos
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Crear Presupuesto
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetsWithSpending.map((budget) => {
              const category = CATEGORIES.find(c => c.name === budget.category);
              const percentage = (budget.spent / budget.limit) * 100;
              const status = getBudgetStatus(budget.spent, budget.limit);

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-6 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${category?.color}20` }}
                        >
                          {category?.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{budget.category}</h3>
                          <p className="text-xs text-white/50">
                            {budget.transactionCount} transacciones
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={status.status === 'exceeded' ? 'danger' : status.status === 'warning' ? 'warning' : 'success'}
                          size="sm"
                        >
                          {status.text}
                        </Badge>
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-white/70" />
                        </button>
                        <button
                          onClick={() => handleDelete(budget.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Gastado</span>
                        <span className="font-semibold text-white">
                          ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: category?.color }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-white/50">{percentage.toFixed(0)}%</span>
                          <span className={`font-medium ${
                            budget.limit - budget.spent >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${Math.abs(budget.limit - budget.spent).toFixed(2)} {
                              budget.limit - budget.spent >= 0 ? 'restante' : 'excedido'
                            }
                          </span>
                        </div>
                      </div>

                      {percentage >= budget.alertThreshold && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-400">
                            Has alcanzado el {budget.alertThreshold}% de tu presupuesto
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};

interface BudgetModalProps {
  budget: Budget | null;
  onClose: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ budget, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(budget?.category || '');
  const [limit, setLimit] = useState(budget?.limit.toString() || '');
  const [alertThreshold, setAlertThreshold] = useState(budget?.alertThreshold.toString() || '80');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limit) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No authenticated user');

      const budgetData = {
        userId,
        category: selectedCategory,
        limit: parseFloat(limit),
        alertThreshold: parseInt(alertThreshold),
        createdAt: budget?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (budget) {
        await updateDoc(doc(db, 'budgets', budget.id), budgetData);
        console.log('✅ Presupuesto actualizado');
      } else {
        await addDoc(collection(db, 'budgets'), budgetData);
        console.log('✅ Presupuesto creado');
      }

      onClose();
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar el presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(5, 191, 219, 0.1), rgba(8, 131, 149, 0.05))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px 0 rgba(5, 191, 219, 0.15)',
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          {budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedCategory === cat.name
                      ? 'border-primary-400 bg-primary-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm text-white font-medium">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Límite mensual ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-400"
              placeholder="500.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Alerta al (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-400"
              placeholder="80"
            />
            <p className="text-xs text-white/50 mt-1">
              Recibirás una notificación cuando alcances este porcentaje
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? '⏳ Guardando...' : budget ? '✅ Actualizar' : '💾 Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetsPage;