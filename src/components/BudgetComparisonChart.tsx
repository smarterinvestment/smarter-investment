// src/components/BudgetComparisonChart.tsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  alertThreshold: number;
}

interface Transaction {
  id: string;
  amount: number;
  category: string | string[];
  type?: 'income' | 'expense';
  synced_from_plaid?: boolean;
  date: string;
  recurring?: boolean;
}

export const BudgetComparisonChart: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

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
      setBudgets(budgetsData);
      setLoading(false);
    }, (error) => {
      console.error('Error en budgets:', error);
      setLoading(false);
    });

    // Escuchar transacciones del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    const txQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar solo transacciones del mes actual y no recurrentes
        if (!data.recurring && data.date >= firstDayOfMonth) {
          txData.push({ id: doc.id, ...data } as Transaction);
        }
      });
      setTransactions(txData);
    }, (error) => {
      console.error('Error en transactions:', error);
    });

    return () => {
      unsubBudgets();
      unsubTx();
    };
  }, []);

  // Calcular gastos por categoría cada vez que cambien las transacciones
  useEffect(() => {
    if (budgets.length === 0 || transactions.length === 0) return;

    budgets.forEach(async (budget) => {
      const getTransactionType = (tx: Transaction): 'income' | 'expense' => {
        if (tx.synced_from_plaid) {
          return tx.amount > 0 ? 'expense' : 'income';
        }
        return tx.type || 'expense';
      };

      const getTransactionCategory = (tx: Transaction): string => {
        if (Array.isArray(tx.category)) {
          return tx.category[0] || 'Otros';
        }
        return tx.category || 'Otros';
      };

      // Calcular gasto total para esta categoría
      const spent = transactions
        .filter(tx => {
          const txCategory = getTransactionCategory(tx);
          const txType = getTransactionType(tx);
          return txCategory === budget.category && txType === 'expense';
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Actualizar solo si cambió
      if (Math.abs(spent - budget.spent) > 0.01) {
        try {
          await updateDoc(doc(db, 'budgets', budget.id), { 
            spent,
            updatedAt: new Date().toISOString()
          });

          // Verificar alerta
          const percentage = (spent / budget.limit) * 100;
          if (percentage >= budget.alertThreshold && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`⚠️ Alerta: ${budget.category}`, {
              body: `Gastaste ${percentage.toFixed(0)}% ($${spent.toFixed(2)} de $${budget.limit.toFixed(2)})`,
              icon: '/icon-192x192.png',
            });
          }
        } catch (error) {
          console.error('Error updating budget:', error);
        }
      }
    });
  }, [budgets, transactions]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400" />
        </div>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📊 Presupuesto vs Gasto Real
        </h3>
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-white/20 mb-3" />
          <p className="text-white/50 text-sm mb-2">Sin presupuestos configurados</p>
          <p className="text-white/30 text-xs">
            Ve a Presupuestos para crear uno
          </p>
          <button
            onClick={() => window.location.href = '/#/budgets'}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Crear Presupuesto
          </button>
        </div>
      </Card>
    );
  }

  const chartData = budgets.map(b => ({
    category: b.category.length > 12 ? b.category.substring(0, 12) + '...' : b.category,
    Presupuesto: b.limit,
    Gastado: b.spent,
    percentage: (b.spent / b.limit) * 100,
  }));

  const hasAlerts = budgets.some(b => (b.spent / b.limit) * 100 >= 80);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            📊 Presupuesto vs Gasto Real
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Total: ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)} ({((totalSpent/totalBudget)*100).toFixed(0)}%)
          </p>
        </div>
        {hasAlerts && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Alertas activas</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="category" 
            stroke="rgba(255,255,255,0.5)" 
            style={{ fontSize: 10 }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid #ffffff20',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => `$${value.toFixed(2)}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Presupuesto" fill="#05BFDB" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastado" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          return (
            <div key={budget.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/70 truncate font-medium">{budget.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-lg font-bold ${
                  percentage >= 100 ? 'text-red-400' : 
                  percentage >= 80 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs text-white/50">
                  ${budget.spent.toFixed(0)}/${budget.limit.toFixed(0)}
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 100 ? 'bg-red-500' : 
                    percentage >= 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BudgetComparisonChart;