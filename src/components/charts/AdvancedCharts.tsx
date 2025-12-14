// ============================================
// 📊 ADVANCED CHARTS - PREMIUM VISUALIZATIONS
// Sankey, Radar, Heatmap, Waterfall, Gauge
// ============================================
import React, { useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Treemap,
  Sankey,
  Tooltip,
  Layer,
  Rectangle,
} from 'recharts';
import { motion } from 'framer-motion';
import { getThemeColors } from '../../stores/useStore';
import { formatCurrency } from '../../utils/financial';
import type { Transaction, Budget, Goal } from '../../types';

// ========================================
// RADAR CHART - Budget vs Actual
// ========================================
interface RadarChartProps {
  expenses: Transaction[];
  budgets: Record<string, number>;
  theme: string;
  currency: string;
}

export const BudgetRadarChart: React.FC<RadarChartProps> = ({ 
  expenses, 
  budgets, 
  theme,
  currency 
}) => {
  const themeColors = getThemeColors(theme);
  
  const data = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const safeBudgets = budgets || {};
    
    // Calculate actual spending per category
    const spending: Record<string, number> = {};
    safeExpenses.forEach(exp => {
      spending[exp.category] = (spending[exp.category] || 0) + exp.amount;
    });

    // Create radar data
    return Object.entries(safeBudgets).map(([category, limit]) => {
      const actual = spending[category] || 0;
      const percentage = limit > 0 ? (actual / limit) * 100 : 0;
      return {
        category: category.length > 10 ? category.substring(0, 10) + '...' : category,
        fullCategory: category,
        presupuesto: 100, // Budget is always 100%
        actual: Math.min(percentage, 150), // Cap at 150% for visualization
        realValue: actual,
        budgetValue: limit,
      };
    }).filter(d => d.budgetValue > 0);
  }, [expenses, budgets]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50">
        No hay presupuestos configurados
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }}
        />
        <PolarRadiusAxis 
          angle={90} 
          domain={[0, 150]} 
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Radar
          name="Presupuesto"
          dataKey="presupuesto"
          stroke={themeColors.secondary}
          fill={themeColors.secondary}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Actual"
          dataKey="actual"
          stroke={themeColors.primary}
          fill={themeColors.primary}
          fillOpacity={0.4}
          strokeWidth={2}
        />
        <Tooltip
          content={({ payload }) => {
            if (!payload || !payload[0]) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
                <p className="font-bold text-white">{data.fullCategory}</p>
                <p className="text-sm text-white/70">
                  Gastado: {formatCurrency(data.realValue, currency)}
                </p>
                <p className="text-sm text-white/70">
                  Presupuesto: {formatCurrency(data.budgetValue, currency)}
                </p>
                <p className={`text-sm font-bold ${data.actual > 100 ? 'text-danger-400' : 'text-success-400'}`}>
                  {data.actual.toFixed(0)}% usado
                </p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// ========================================
// HEATMAP CALENDAR - Daily Spending
// ========================================
interface HeatmapProps {
  expenses: Transaction[];
  theme: string;
  currency: string;
}

export const SpendingHeatmap: React.FC<HeatmapProps> = ({ expenses, theme, currency }) => {
  const themeColors = getThemeColors(theme);
  
  const calendarData = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const dailySpending: Record<string, number> = {};
    
    // Get last 12 weeks
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 84); // 12 weeks

    safeExpenses.forEach(exp => {
      const date = typeof exp.date === 'string' ? exp.date : new Date(exp.date).toISOString().split('T')[0];
      dailySpending[date] = (dailySpending[date] || 0) + exp.amount;
    });

    // Calculate max for color scaling
    const values = Object.values(dailySpending);
    const maxSpending = Math.max(...values, 1);

    // Generate calendar grid
    const weeks: Array<Array<{ date: string; amount: number; intensity: number; dayOfWeek: number }>> = [];
    let currentWeek: Array<{ date: string; amount: number; intensity: number; dayOfWeek: number }> = [];
    
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const amount = dailySpending[dateStr] || 0;
      const intensity = amount / maxSpending;
      
      currentWeek.push({
        date: dateStr,
        amount,
        intensity,
        dayOfWeek: d.getDay(),
      });

      if (d.getDay() === 6) { // Saturday ends week
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, maxSpending };
  }, [expenses]);

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(255,255,255,0.05)';
    const rgb = themeColors.primary.replace('#', '');
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
  };

  const dayLabels = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-2">
        <div className="w-4" />
        {calendarData.weeks.map((_, i) => (
          <div key={i} className="w-4 text-[10px] text-white/30 text-center">
            {i % 4 === 0 ? `S${Math.floor(i / 4) + 1}` : ''}
          </div>
        ))}
      </div>
      {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
        <div key={dayIndex} className="flex gap-1 mb-1">
          <div className="w-4 text-[10px] text-white/50 flex items-center justify-center">
            {dayLabels[dayIndex]}
          </div>
          {calendarData.weeks.map((week, weekIndex) => {
            const day = week.find(d => d.dayOfWeek === dayIndex);
            if (!day) return <div key={weekIndex} className="w-4 h-4" />;
            return (
              <motion.div
                key={weekIndex}
                className="w-4 h-4 rounded-sm cursor-pointer transition-transform hover:scale-125"
                style={{ backgroundColor: getColor(day.intensity) }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: weekIndex * 0.02 }}
                title={`${day.date}: ${formatCurrency(day.amount, currency)}`}
              />
            );
          })}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-4 text-xs text-white/50">
        <span>Menos</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: getColor(intensity) }}
          />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
};

// ========================================
// TREEMAP - Category Breakdown
// ========================================
interface TreemapProps {
  expenses: Transaction[];
  theme: string;
  currency: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Alimentación': '#22C55E',
  'Transporte': '#3B82F6',
  'Entretenimiento': '#F59E0B',
  'Compras': '#EC4899',
  'Servicios': '#8B5CF6',
  'Salud': '#EF4444',
  'Educación': '#06B6D4',
  'Vivienda': '#F97316',
  'Otros': '#6B7280',
};

export const CategoryTreemap: React.FC<TreemapProps> = ({ expenses, theme, currency }) => {
  const themeColors = getThemeColors(theme);
  
  const data = useMemo(() => {
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const categoryTotals: Record<string, number> = {};
    
    safeExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        fill: CATEGORY_COLORS[name] || themeColors.primary,
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, themeColors]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/50">
        No hay gastos registrados
      </div>
    );
  }

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, value, fill } = props;
    
    if (width < 50 || height < 30) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={2}
          rx={4}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="white"
              fontSize={12}
              fontWeight="bold"
            >
              {name.length > 12 ? name.substring(0, 12) + '...' : name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize={10}
            >
              {formatCurrency(value, currency)}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        stroke="rgba(0,0,0,0.3)"
        content={<CustomTreemapContent />}
      >
        <Tooltip
          content={({ payload }) => {
            if (!payload || !payload[0]) return null;
            const data = payload[0].payload;
            return (
              <div className="bg-black/90 border border-white/20 rounded-lg p-3 shadow-xl">
                <p className="font-bold text-white">{data.name}</p>
                <p className="text-sm text-white/70">
                  {formatCurrency(data.value, currency)}
                </p>
              </div>
            );
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
};

// ========================================
// WATERFALL CHART - Cash Flow
// ========================================
interface WaterfallProps {
  incomes: Transaction[];
  expenses: Transaction[];
  theme: string;
  currency: string;
}

export const CashFlowWaterfall: React.FC<WaterfallProps> = ({ 
  incomes, 
  expenses, 
  theme, 
  currency 
}) => {
  const themeColors = getThemeColors(theme);
  
  const data = useMemo(() => {
    const safeIncomes = Array.isArray(incomes) ? incomes : [];
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    
    const totalIncome = safeIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    safeExpenses.forEach(exp => {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    const sortedCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    let running = totalIncome;
    const result = [
      { 
        name: 'Ingresos', 
        value: totalIncome, 
        fill: '#22C55E', 
        start: 0, 
        end: totalIncome 
      },
    ];

    sortedCategories.forEach(([category, amount]) => {
      result.push({
        name: category.length > 10 ? category.substring(0, 10) + '...' : category,
        value: -amount,
        fill: '#EF4444',
        start: running,
        end: running - amount,
      });
      running -= amount;
    });

    const otherExpenses = totalExpenses - sortedCategories.reduce((sum, [, val]) => sum + val, 0);
    if (otherExpenses > 0) {
      result.push({
        name: 'Otros',
        value: -otherExpenses,
        fill: '#6B7280',
        start: running,
        end: running - otherExpenses,
      });
      running -= otherExpenses;
    }

    result.push({
      name: 'Balance',
      value: running,
      fill: running >= 0 ? '#22C55E' : '#EF4444',
      start: 0,
      end: running,
    });

    return result;
  }, [incomes, expenses]);

  const maxValue = Math.max(...data.map(d => Math.max(d.start, d.end)));

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const width = Math.abs(item.end - item.start) / maxValue * 100;
        const left = Math.min(item.start, item.end) / maxValue * 100;
        
        return (
          <motion.div
            key={index}
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-24 text-sm text-white/70 text-right truncate">
              {item.name}
            </div>
            <div className="flex-1 h-8 bg-white/5 rounded relative overflow-hidden">
              <div
                className="absolute h-full rounded transition-all"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: item.fill,
                  boxShadow: `0 0 10px ${item.fill}50`,
                }}
              />
            </div>
            <div className={`w-24 text-sm font-bold ${item.value >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {item.value >= 0 ? '+' : ''}{formatCurrency(item.value, currency)}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ========================================
// GAUGE CHART - Savings Rate
// ========================================
interface GaugeProps {
  value: number; // 0-100
  label: string;
  theme: string;
}

export const SavingsGauge: React.FC<GaugeProps> = ({ value, label, theme }) => {
  const themeColors = getThemeColors(theme);
  const safeValue = Math.min(Math.max(isNaN(value) ? 0 : value, 0), 100);
  
  // SVG arc calculation
  const radius = 80;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half circle
  const progress = (safeValue / 100) * circumference;
  
  const getColor = () => {
    if (safeValue >= 20) return '#22C55E';
    if (safeValue >= 10) return '#F59E0B';
    if (safeValue >= 0) return '#EF4444';
    return '#EF4444';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Background arc */}
        <path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${getColor()})` }}
        />
        {/* Value text */}
        <text
          x="100"
          y="85"
          textAnchor="middle"
          fill="white"
          fontSize="32"
          fontWeight="bold"
        >
          {safeValue.toFixed(0)}%
        </text>
        {/* Label */}
        <text
          x="100"
          y="110"
          textAnchor="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize="12"
        >
          {label}
        </text>
      </svg>
      {/* Scale labels */}
      <div className="flex justify-between w-full px-4 text-xs text-white/40">
        <span>0%</span>
        <span className="text-warning-400">10%</span>
        <span className="text-success-400">20%+</span>
      </div>
    </div>
  );
};

// ========================================
// SPARKLINE - Mini trend chart
// ========================================
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  theme: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ 
  data, 
  color,
  height = 40, 
  theme 
}) => {
  const themeColors = getThemeColors(theme);
  const lineColor = color || themeColors.primary;
  
  if (!data || data.length === 0) return null;

  const safeData = data.filter(d => !isNaN(d));
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;
  
  const width = 120;
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const points = safeData.map((value, index) => {
    const x = padding + (index / (safeData.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${theme})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last point dot */}
      {safeData.length > 0 && (
        <circle
          cx={width - padding}
          cy={padding + chartHeight - ((safeData[safeData.length - 1] - min) / range) * chartHeight}
          r={3}
          fill={lineColor}
          style={{ filter: `drop-shadow(0 0 4px ${lineColor})` }}
        />
      )}
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${theme}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
};

// ========================================
// GOALS PROGRESS RING
// ========================================
interface GoalRingProps {
  goals: Goal[];
  theme: string;
  currency: string;
}

export const GoalsProgressRing: React.FC<GoalRingProps> = ({ goals, theme, currency }) => {
  const themeColors = getThemeColors(theme);
  const safeGoals = Array.isArray(goals) ? goals : [];
  
  const totalTarget = safeGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const totalCurrent = safeGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(overallProgress, 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <svg width="150" height="150" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx="75"
            cy="75"
            r={radius}
            fill="none"
            stroke={themeColors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${themeColors.primary})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {overallProgress.toFixed(0)}%
          </span>
          <span className="text-xs text-white/50">completado</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {safeGoals.slice(0, 4).map((goal, index) => {
          const goalProgress = (Number(goal.targetAmount) || 0) > 0 
            ? ((Number(goal.currentAmount) || 0) / (Number(goal.targetAmount) || 0)) * 100 
            : 0;
          return (
            <div key={goal.id || index} className="flex items-center gap-2">
              <span className="text-lg">{goal.icon || '🎯'}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70 truncate max-w-[100px]">{goal.name}</span>
                  <span className="text-white/50">{goalProgress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: goal.color || themeColors.primary,
                      boxShadow: `0 0 6px ${goal.color || themeColors.primary}`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        {safeGoals.length > 4 && (
          <p className="text-xs text-white/40">+{safeGoals.length - 4} más</p>
        )}
      </div>
    </div>
  );
};

export default {
  BudgetRadarChart,
  SpendingHeatmap,
  CategoryTreemap,
  CashFlowWaterfall,
  SavingsGauge,
  Sparkline,
  GoalsProgressRing,
};
