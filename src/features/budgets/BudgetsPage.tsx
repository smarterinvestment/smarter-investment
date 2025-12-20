// ============================================
// 💰 BUDGETS PAGE v21 - Based on Excel Structure
// 6 Main Budget Groups with Estimado vs Real
// ============================================
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, PiggyBank, BarChart2, DollarSign, Target, CreditCard, Wallet, Check, AlertTriangle, X, Save } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useStore, getThemeColors } from '../../stores/useStore';
import { useBudgets } from '../../hooks/useFirebaseData';
import { Card, Button, Input, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import { showSuccess, showError } from '../../lib/errorHandler';

// 6 Budget Groups based on Excel structure
const BUDGET_GROUPS = [
  { id: 'ingresos', name: 'Ingresos', icon: '💰', color: '#22C55E', type: 'income' },
  { id: 'gastos_esenciales', name: 'Gastos Esenciales', icon: '🏠', color: '#3B82F6', type: 'expense' },
  { id: 'gastos_discrecionales', name: 'Gastos Discrecionales', icon: '🎬', color: '#F59E0B', type: 'expense' },
  { id: 'pago_deudas', name: 'Pago de Deudas', icon: '💳', color: '#EF4444', type: 'expense' },
  { id: 'ahorros', name: 'Ahorros', icon: '🐷', color: '#8B5CF6', type: 'savings' },
  { id: 'inversiones', name: 'Inversiones', icon: '📈', color: '#14B8A6', type: 'investment' },
];

// Categories per group (based on Excel)
const CATEGORIES_BY_GROUP: Record<string, Array<{id: string, name: string, icon: string}>> = {
  ingresos: [
    { id: 'salario1', name: 'Salario Principal', icon: '💼' },
    { id: 'salario2', name: 'Salario 2', icon: '💵' },
    { id: 'freelance', name: 'Freelance', icon: '💻' },
    { id: 'otros_ingresos', name: 'Otros Ingresos', icon: '💰' },
  ],
  gastos_esenciales: [
    { id: 'vivienda', name: 'Vivienda/Arriendo', icon: '🏠' },
    { id: 'familia', name: 'Familia', icon: '👨‍👩‍👧' },
    { id: 'celular', name: 'Celular', icon: '📱' },
    { id: 'seguro_carro', name: 'Seguro Carro', icon: '🚗' },
    { id: 'gasolina', name: 'Gasolina y Aceite', icon: '⛽' },
    { id: 'alimentacion', name: 'Alimentación Casa', icon: '🍽️' },
    { id: 'servicios', name: 'Servicios', icon: '📄' },
  ],
  gastos_discrecionales: [
    { id: 'salidas', name: 'Salidas', icon: '🎉' },
    { id: 'comida_calle', name: 'Comida Calle', icon: '🍔' },
    { id: 'estudio', name: 'Estudio', icon: '📚' },
    { id: 'mecato', name: 'Mecato/Snacks', icon: '🍫' },
    { id: 'peluqueria', name: 'Peluquería', icon: '💇' },
    { id: 'almacenamiento', name: 'Almacenamiento', icon: '☁️' },
    { id: 'cafe', name: 'Café', icon: '☕' },
    { id: 'suscripciones', name: 'Suscripciones', icon: '📺' },
  ],
  pago_deudas: [
    { id: 'vehiculo', name: 'Vehículo', icon: '🚙' },
    { id: 'credito', name: 'Crédito', icon: '💳' },
    { id: 'tarjeta', name: 'Tarjeta de Crédito', icon: '💳' },
    { id: 'prestamo', name: 'Préstamo', icon: '🏦' },
  ],
  ahorros: [
    { id: 'emergencias', name: 'Fondo Emergencias', icon: '🆘' },
    { id: 'vacaciones', name: 'Vacaciones', icon: '✈️' },
    { id: 'meta_especial', name: 'Meta Especial', icon: '🎯' },
  ],
  inversiones: [
    { id: 'acciones', name: 'Acciones', icon: '📊' },
    { id: 'crypto', name: 'Criptomonedas', icon: '₿' },
    { id: 'fondos', name: 'Fondos', icon: '📈' },
    { id: 'negocio', name: 'Negocio', icon: '🏪' },
  ],
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value, currency)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const BudgetsPage: React.FC = () => {
  const { expenses, incomes, currency, theme } = useStore();
  const { budgets, update: updateBudget } = useBudgets();
  const themeColors = getThemeColors(theme);

  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeBudgets = budgets || {};

  // Get current month transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = useMemo(() => {
    return safeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [safeExpenses, currentMonth, currentYear]);

  const monthlyIncomes = useMemo(() => {
    return safeIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [safeIncomes, currentMonth, currentYear]);

  // Calculate totals by category
  const expensesByCategory = useMemo(() => {
    return monthlyExpenses.reduce((acc, e) => {
      const cat = e.category?.toLowerCase().replace(/\s+/g, '_') || 'otros';
      acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [monthlyExpenses]);

  const incomesByCategory = useMemo(() => {
    return monthlyIncomes.reduce((acc, i) => {
      const cat = i.category?.toLowerCase().replace(/\s+/g, '_') || 'otros';
      acc[cat] = (acc[cat] || 0) + (Number(i.amount) || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [monthlyIncomes]);

  // Calculate group totals
  const groupTotals = useMemo(() => {
    const totals: Record<string, { estimated: number; actual: number }> = {};

    BUDGET_GROUPS.forEach(group => {
      const categories = CATEGORIES_BY_GROUP[group.id] || [];
      let estimated = 0;
      let actual = 0;

      categories.forEach(cat => {
        estimated += Number(safeBudgets[cat.id]) || 0;
        
        if (group.id === 'ingresos') {
          actual += incomesByCategory[cat.id] || incomesByCategory[cat.name.toLowerCase()] || 0;
        } else {
          actual += expensesByCategory[cat.id] || expensesByCategory[cat.name.toLowerCase()] || 0;
        }
      });

      // Also sum from category names that might match
      if (group.id === 'ingresos') {
        actual = actual || monthlyIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      }

      totals[group.id] = { estimated, actual };
    });

    return totals;
  }, [safeBudgets, expensesByCategory, incomesByCategory, monthlyIncomes]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalIncome = groupTotals.ingresos?.actual || 0;
    const totalEssential = groupTotals.gastos_esenciales?.actual || 0;
    const totalDiscretionary = groupTotals.gastos_discrecionales?.actual || 0;
    const totalDebt = groupTotals.pago_deudas?.actual || 0;
    const totalSavings = groupTotals.ahorros?.actual || 0;
    const totalInvestments = groupTotals.inversiones?.actual || 0;

    const totalExpenses = totalEssential + totalDiscretionary + totalDebt;
    const remanente = totalIncome - totalExpenses - totalSavings - totalInvestments;
    const savingsRate = totalIncome > 0 ? ((totalSavings + totalInvestments) / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      totalInvestments,
      remanente,
      savingsRate,
    };
  }, [groupTotals]);

  // Start editing a group
  const startEditing = (groupId: string) => {
    const categories = CATEGORIES_BY_GROUP[groupId] || [];
    const initial: Record<string, number> = {};
    categories.forEach(cat => {
      initial[cat.id] = safeBudgets[cat.id] || 0;
    });
    setLocalBudgets(initial);
    setEditingGroup(groupId);
  };

  // Save budgets
  const saveBudgets = async () => {
    try {
      for (const [catId, amount] of Object.entries(localBudgets)) {
        if (amount > 0) {
          await updateBudget(catId, amount);
        }
      }
      showSuccess('Presupuesto actualizado');
      setEditingGroup(null);
    } catch (error) {
      showError('Error al guardar');
    }
  };

  // Chart data for comparison
  const comparisonData = BUDGET_GROUPS.map(group => ({
    name: group.name.replace('Gastos ', 'G.').replace('Pago de ', ''),
    Estimado: groupTotals[group.id]?.estimated || 0,
    Real: groupTotals[group.id]?.actual || 0,
    fill: group.color,
  }));

  // Pie chart data - where money goes
  const pieData = BUDGET_GROUPS
    .filter(g => g.type === 'expense' && (groupTotals[g.id]?.actual || 0) > 0)
    .map(group => ({
      name: group.name.replace('Gastos ', ''),
      value: groupTotals[group.id]?.actual || 0,
      fill: group.color,
    }));

  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <PiggyBank className="w-7 h-7" style={{ color: themeColors.primary }} />
          Presupuesto Mensual
        </h1>
        <p className="text-white/60 mt-1">
          {new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center bg-gradient-to-br from-success-500/20 to-transparent">
          <TrendingUp className="w-6 h-6 mx-auto mb-1 text-success-400" />
          <p className="text-xs text-white/50">Ingresos</p>
          <p className="text-lg font-bold text-success-400">{formatCurrency(summary.totalIncome, currency)}</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-danger-500/20 to-transparent">
          <TrendingDown className="w-6 h-6 mx-auto mb-1 text-danger-400" />
          <p className="text-xs text-white/50">Gastos</p>
          <p className="text-lg font-bold text-danger-400">{formatCurrency(summary.totalExpenses, currency)}</p>
        </Card>
        <Card className="p-4 text-center bg-gradient-to-br from-purple-500/20 to-transparent">
          <Target className="w-6 h-6 mx-auto mb-1 text-purple-400" />
          <p className="text-xs text-white/50">Ahorro + Inversión</p>
          <p className="text-lg font-bold text-purple-400">
            {formatCurrency(summary.totalSavings + summary.totalInvestments, currency)}
          </p>
        </Card>
        <Card className={cn(
          'p-4 text-center',
          summary.remanente >= 0 
            ? 'bg-gradient-to-br from-success-500/20 to-transparent' 
            : 'bg-gradient-to-br from-danger-500/20 to-transparent'
        )}>
          <Wallet className="w-6 h-6 mx-auto mb-1" style={{ color: summary.remanente >= 0 ? '#22C55E' : '#EF4444' }} />
          <p className="text-xs text-white/50">Remanente</p>
          <p className={cn('text-lg font-bold', summary.remanente >= 0 ? 'text-success-400' : 'text-danger-400')}>
            {formatCurrency(summary.remanente, currency)}
          </p>
        </Card>
      </div>

      {/* Savings Rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium">Tasa de Ahorro e Inversión</span>
          <Badge variant={summary.savingsRate >= 20 ? 'success' : summary.savingsRate >= 10 ? 'warning' : 'danger'}>
            {summary.savingsRate.toFixed(1)}%
          </Badge>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(summary.savingsRate, 100)}%` }}
            transition={{ duration: 0.8 }}
            className={cn(
              'h-full rounded-full',
              summary.savingsRate >= 20 ? 'bg-success-500' : summary.savingsRate >= 10 ? 'bg-warning-500' : 'bg-danger-500'
            )}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>0%</span>
          <span className="text-warning-400">Meta: 20%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-center gap-2">
        <Button 
          size="sm" 
          variant={viewMode === 'cards' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('cards')}
        >
          📊 Tarjetas
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'table' ? 'primary' : 'secondary'}
          onClick={() => setViewMode('table')}
        >
          📈 Gráficos
        </Button>
      </div>

      {/* Cards View - 6 Budget Groups */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {BUDGET_GROUPS.map((group, idx) => {
            const { estimated, actual } = groupTotals[group.id] || { estimated: 0, actual: 0 };
            const percentage = estimated > 0 ? (actual / estimated) * 100 : (actual > 0 ? 100 : 0);
            const diff = actual - estimated;
            const isIncome = group.type === 'income';
            const isGood = isIncome ? actual >= estimated : actual <= estimated;

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card 
                  className={cn(
                    'p-4 cursor-pointer hover:scale-[1.01] transition-all relative overflow-hidden',
                    !isGood && estimated > 0 && 'border-warning-500/50'
                  )}
                  onClick={() => startEditing(group.id)}
                >
                  {/* Glow */}
                  <div 
                    className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 blur-2xl"
                    style={{ backgroundColor: group.color }}
                  />

                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{group.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isGood || estimated === 0 ? 'success' : 'warning'} 
                          size="sm"
                        >
                          {percentage.toFixed(0)}%
                        </Badge>
                        {!isGood && estimated > 0 && (
                          <AlertTriangle className="w-4 h-4 text-warning-400" />
                        )}
                      </div>
                    </div>
                    <Edit2 className="w-4 h-4 text-white/30" />
                  </div>

                  {/* Progress */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-white/40 text-xs">Estimado</p>
                      <p className="font-bold text-white">{formatCurrency(estimated, currency)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/40 text-xs">Real</p>
                      <p className="font-bold" style={{ color: group.color }}>
                        {formatCurrency(actual, currency)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-xs">Diferencia</p>
                      <p className={cn('font-bold', isGood ? 'text-success-400' : 'text-warning-400')}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff, currency)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Charts View */}
      {viewMode === 'table' && (
        <div className="space-y-6">
          {/* Bar Chart - Estimado vs Real */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">📊 Estimado vs Real</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis 
                  type="number" 
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} 
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} 
                  width={90} 
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Estimado" fill="#6366F1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Real" fill="#22C55E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pie Chart - Distribution */}
          <Card className="p-4">
            <h3 className="font-semibold text-white mb-4 text-center">🎯 ¿A Dónde Va Mi Dinero?</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend 
                    formatter={(value, entry: any) => {
                      const item = pieData.find(d => d.name === value);
                      const pct = item && totalPie > 0 ? ((item.value / totalPie) * 100).toFixed(0) : 0;
                      return `${value} (${pct}%)`;
                    }}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-white/50">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Agrega gastos para ver la distribución</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingGroup(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg bg-card-bg rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {BUDGET_GROUPS.find(g => g.id === editingGroup)?.icon}
                  </span>
                  <h2 className="text-xl font-bold text-white">
                    {BUDGET_GROUPS.find(g => g.id === editingGroup)?.name}
                  </h2>
                </div>
                <button 
                  onClick={() => setEditingGroup(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Total */}
              <div 
                className="p-4 rounded-xl mb-6 text-center"
                style={{ backgroundColor: `${BUDGET_GROUPS.find(g => g.id === editingGroup)?.color}20` }}
              >
                <p className="text-white/60 text-sm">Total Presupuestado</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(
                    Object.values(localBudgets).reduce((sum, v) => sum + (v || 0), 0),
                    currency
                  )}
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {(CATEGORIES_BY_GROUP[editingGroup] || []).map(cat => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-white/80 block mb-1">{cat.name}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={localBudgets[cat.id] || ''}
                          onChange={e => setLocalBudgets(prev => ({
                            ...prev,
                            [cat.id]: parseFloat(e.target.value) || 0
                          }))}
                          placeholder="0.00"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-8 py-2 text-white placeholder-white/30 focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => setEditingGroup(null)} fullWidth>
                  Cancelar
                </Button>
                <Button onClick={saveBudgets} fullWidth>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetsPage;
