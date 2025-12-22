// ============================================
// 📊 FLEXIBLE CHART - WITH PERIOD & TYPE SELECTORS
// Supports Line, Bar, Pie, Area charts
// ============================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { BarChart2, TrendingUp, PieChart as PieIcon, Activity, Calendar } from 'lucide-react';
import { getThemeColors } from '../../stores/useStore';
import { formatCurrency } from '../../utils/financial';
import { cn } from '../../utils/cn';
import type { Transaction } from '../../types';

// Period options
export type ChartPeriod = 'day' | 'week' | 'biweek' | 'month' | 'quarter' | 'year';
export type ChartType = 'bar' | 'line' | 'pie' | 'area';

const PERIOD_OPTIONS: { value: ChartPeriod; label: string; days: number }[] = [
  { value: 'day', label: 'Hoy', days: 1 },
  { value: 'week', label: '7 días', days: 7 },
  { value: 'biweek', label: '15 días', days: 15 },
  { value: 'month', label: '30 días', days: 30 },
  { value: 'quarter', label: '3 meses', days: 90 },
  { value: 'year', label: '1 año', days: 365 },
];

const CHART_TYPE_OPTIONS: { value: ChartType; icon: React.ReactNode; label: string }[] = [
  { value: 'bar', icon: <BarChart2 className="w-4 h-4" />, label: 'Barras' },
  { value: 'line', icon: <TrendingUp className="w-4 h-4" />, label: 'Línea' },
  { value: 'area', icon: <Activity className="w-4 h-4" />, label: 'Área' },
  { value: 'pie', icon: <PieIcon className="w-4 h-4" />, label: 'Circular' },
];

const CHART_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#3B82F6'];

interface FlexibleChartProps {
  title: string;
  expenses: Transaction[];
  incomes: Transaction[];
  theme: string;
  currency: string;
  showTypeSelector?: boolean;
  showPeriodSelector?: boolean;
  defaultPeriod?: ChartPeriod;
  defaultType?: ChartType;
  dataMode?: 'comparison' | 'categories' | 'trend';
  height?: number;
}

// Custom Tooltip - Enhanced
const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    // Calculate total if multiple items
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    const hasMultipleItems = payload.length > 1;

    return (
      <div className="bg-gradient-to-br from-black/95 to-black/85 border border-white/20 rounded-xl p-4 shadow-2xl backdrop-blur-md min-w-[180px]">
        {/* Label */}
        <p className="text-white/70 text-xs font-medium mb-2 uppercase tracking-wide">{label}</p>

        {/* Items */}
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-white/80 text-sm font-medium">{entry.name}</span>
              </div>
              <span
                className="font-bold text-sm tabular-nums"
                style={{ color: entry.color || entry.fill }}
              >
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Total (if multiple items) */}
        {hasMultipleItems && (
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/60 text-xs font-medium">Total</span>
              <span className="font-bold text-sm text-white tabular-nums">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const FlexibleChart: React.FC<FlexibleChartProps> = ({
  title,
  expenses,
  incomes,
  theme,
  currency,
  showTypeSelector = true,
  showPeriodSelector = true,
  defaultPeriod = 'month',
  defaultType = 'bar',
  dataMode = 'comparison',
  height = 280,
}) => {
  const themeColors = getThemeColors(theme);
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);
  const [chartType, setChartType] = useState<ChartType>(defaultType);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  // Filter data by period
  const filteredData = useMemo(() => {
    const periodConfig = PERIOD_OPTIONS.find(p => p.value === period);
    const days = periodConfig?.days || 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromStr = fromDate.toISOString().split('T')[0];

    return {
      expenses: safeExpenses.filter(e => e.date >= fromStr),
      incomes: safeIncomes.filter(i => i.date >= fromStr),
    };
  }, [safeExpenses, safeIncomes, period]);

  // Generate chart data based on mode
  const chartData = useMemo(() => {
    const { expenses: filtExp, incomes: filtInc } = filteredData;

    if (dataMode === 'categories') {
      // Category breakdown for pie/bar
      const categoryTotals: Record<string, number> = {};
      filtExp.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });
      return Object.entries(categoryTotals)
        .map(([name, value], i) => ({
          name: name.length > 12 ? name.substring(0, 12) + '...' : name,
          fullName: name,
          value,
          fill: CHART_COLORS[i % CHART_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }

    if (dataMode === 'trend') {
      // Daily/weekly trend
      const periodConfig = PERIOD_OPTIONS.find(p => p.value === period);
      const days = periodConfig?.days || 30;
      const groupByDays = days > 30 ? 7 : days > 7 ? 1 : 1;
      
      const dataPoints: { label: string; gastos: number; ingresos: number }[] = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i -= groupByDays) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + groupByDays);
        const endStr = endDate.toISOString().split('T')[0];
        
        const dayExpenses = filtExp
          .filter(e => e.date >= dateStr && e.date < endStr)
          .reduce((sum, e) => sum + e.amount, 0);
        const dayIncomes = filtInc
          .filter(i => i.date >= dateStr && i.date < endStr)
          .reduce((sum, i) => sum + i.amount, 0);
        
        const label = days > 30 
          ? `S${Math.floor((days - i) / 7)}` 
          : date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
        
        dataPoints.push({ label, gastos: dayExpenses, ingresos: dayIncomes });
      }
      
      return dataPoints.slice(-12); // Max 12 data points
    }

    // Default: comparison (income vs expense by period)
    const periodConfig = PERIOD_OPTIONS.find(p => p.value === period);
    const days = periodConfig?.days || 30;
    const intervals = days <= 7 ? days : days <= 30 ? Math.ceil(days / 7) : Math.ceil(days / 30);
    const intervalDays = Math.ceil(days / intervals);
    
    const dataPoints: { label: string; ingresos: number; gastos: number }[] = [];
    const now = new Date();
    
    for (let i = intervals - 1; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i + 1) * intervalDays);
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - i * intervalDays);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const periodExpenses = filtExp
        .filter(e => e.date >= startStr && e.date < endStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const periodIncomes = filtInc
        .filter(inc => inc.date >= startStr && inc.date < endStr)
        .reduce((sum, inc) => sum + inc.amount, 0);
      
      let label: string;
      if (days <= 7) {
        label = startDate.toLocaleDateString('es', { weekday: 'short' });
      } else if (days <= 30) {
        label = `S${intervals - i}`;
      } else {
        label = startDate.toLocaleDateString('es', { month: 'short' });
      }
      
      dataPoints.push({ label, ingresos: periodIncomes, gastos: periodExpenses });
    }
    
    return dataPoints;
  }, [filteredData, period, dataMode]);

  // Render chart based on type
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-white/50">
          No hay datos para el período seleccionado
        </div>
      );
    }

    const commonProps = {
      data: chartData,
    };

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              animationDuration={800}
              animationBegin={0}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell
                  key={index}
                  fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              formatter={(value) => <span className="text-white/70 text-xs">{value}</span>}
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            {dataMode !== 'categories' && (
              <>
                <Line type="monotone" dataKey="ingresos" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }} activeDot={{ r: 6 }} name="Ingresos" animationDuration={800} />
                <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', r: 4, strokeWidth: 2, stroke: '#1a1a1a' }} activeDot={{ r: 6 }} name="Gastos" animationDuration={800} />
              </>
            )}
            {dataMode === 'categories' && (
              <Line type="monotone" dataKey="value" stroke={themeColors.primary} strokeWidth={3} dot={{ fill: themeColors.primary, r: 4, strokeWidth: 2, stroke: '#1a1a1a' }} activeDot={{ r: 6 }} name="Monto" animationDuration={800} />
            )}
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="ingresos" stroke="#22C55E" fill="url(#incomeGrad)" strokeWidth={3} name="Ingresos" animationDuration={800} dot={{ fill: '#22C55E', r: 3 }} />
            <Area type="monotone" dataKey="gastos" stroke="#EF4444" fill="url(#expenseGrad)" strokeWidth={3} name="Gastos" animationDuration={800} dot={{ fill: '#EF4444', r: 3 }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart {...commonProps} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          {dataMode !== 'categories' && (
            <>
              <Bar dataKey="ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} name="Ingresos" animationDuration={800} />
              <Bar dataKey="gastos" fill="#EF4444" radius={[4, 4, 0, 0]} name="Gastos" animationDuration={800} />
            </>
          )}
          {dataMode === 'categories' && (
            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Monto" animationDuration={800}>
              {chartData.map((entry: any, index: number) => (
                <Cell key={index} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          )}
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5" style={{ color: themeColors.primary }} />
          {title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          {showPeriodSelector && (
            <div className="flex bg-white/5 rounded-lg p-0.5">
              {PERIOD_OPTIONS.slice(0, 4).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-all',
                    period === opt.value 
                      ? 'text-white' 
                      : 'text-white/50 hover:text-white'
                  )}
                  style={period === opt.value ? { 
                    backgroundColor: `${themeColors.primary}30`,
                    color: themeColors.primary 
                  } : {}}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Chart Type Selector */}
          {showTypeSelector && (
            <div className="flex bg-white/5 rounded-lg p-0.5">
              {CHART_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setChartType(opt.value)}
                  className={cn(
                    'p-1.5 rounded transition-all',
                    chartType === opt.value 
                      ? 'text-white' 
                      : 'text-white/50 hover:text-white'
                  )}
                  style={chartType === opt.value ? { 
                    backgroundColor: `${themeColors.primary}30`,
                    color: themeColors.primary 
                  } : {}}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <motion.div
        key={`${chartType}-${period}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height }}
      >
        {renderChart()}
      </motion.div>
    </div>
  );
};

export default FlexibleChart;
