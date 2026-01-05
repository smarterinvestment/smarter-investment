// src/components/BudgetComparisonChart.tsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export const BudgetComparisonChart: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const budgetsQuery = query(
      collection(db, 'budgets'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      const budgetsData: Budget[] = [];
      snapshot.forEach((doc) => {
        budgetsData.push({ id: doc.id, ...doc.data() } as Budget);
      });
      setBudgets(budgetsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
            Crea presupuestos para ver comparativas
          </p>
        </div>
      </Card>
    );
  }

  const chartData = budgets.map(b => ({
    category: b.category.length > 10 ? b.category.substring(0, 10) + '...' : b.category,
    Presupuesto: b.limit,
    Gastado: b.spent,
    percentage: (b.spent / b.limit) * 100,
  }));

  const hasAlerts = budgets.some(b => (b.spent / b.limit) * 100 >= 80);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          📊 Presupuesto vs Gasto Real
        </h3>
        {hasAlerts && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Alertas activas</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="category" 
            stroke="rgba(255,255,255,0.5)" 
            style={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
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
        {budgets.slice(0, 6).map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          return (
            <div key={budget.id} className="p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-white/70 truncate">{budget.category}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-white">
                  {percentage.toFixed(0)}%
                </span>
                <span className={`text-xs font-medium ${
                  percentage >= 100 ? 'text-red-400' : 
                  percentage >= 80 ? 'text-yellow-400' : 
                  'text-green-400'
                }`}>
                  ${budget.spent.toFixed(0)}/${budget.limit.toFixed(0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BudgetComparisonChart;