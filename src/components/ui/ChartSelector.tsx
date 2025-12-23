// ============================================
// 📊 CHART SELECTOR - MULTIPLE CHART TYPES
// Compatible con el tema system de Mauricio
// ============================================
import React, { useState } from 'react';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { cn } from '../../utils/cn';

interface ChartData {
  [key: string]: any;
}

interface ChartSelectorProps {
  data: ChartData[];
  title: string;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  className?: string;
  themeColors?: { primary: string; secondary: string };
}

const DEFAULT_COLORS = ['#05BFDB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

type ChartType = 'bar' | 'line' | 'pie';

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  data,
  title,
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_COLORS,
  className = '',
  themeColors = { primary: '#05BFDB', secondary: '#088395' }
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-white/40">
          No hay datos disponibles
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={nameKey}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(5, 191, 219, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: themeColors.primary }}
                cursor={{ fill: 'rgba(5, 191, 219, 0.1)' }}
              />
              <Bar
                dataKey={dataKey}
                fill={themeColors.primary}
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={nameKey}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(5, 191, 219, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: themeColors.primary }}
                cursor={{ stroke: themeColors.primary, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={themeColors.primary}
                strokeWidth={3}
                dot={{ fill: themeColors.primary, r: 4, strokeWidth: 2, stroke: '#000' }}
                activeDot={{ r: 6, fill: themeColors.secondary, stroke: themeColors.primary, strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => {
                  const percentage = (percent * 100).toFixed(0);
                  return percentage === '0' ? '' : `${name}: ${percentage}%`;
                }}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey={dataKey}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(5, 191, 219, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  backdropFilter: 'blur(10px)'
                }}
                formatter={(value: any) => {
                  const percentage = ((value / total) * 100).toFixed(1);
                  return [`${value} (${percentage}%)`, ''];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('card', className)}>
      {/* Header con selector de tipo */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base lg:text-lg font-bold text-white">{title}</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType('bar')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartType === 'bar'
                ? 'bg-primary-500/20 text-primary-500'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            )}
            title="Gráfico de Barras"
            type="button"
          >
            <BarChart3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType('line')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartType === 'line'
                ? 'bg-primary-500/20 text-primary-500'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            )}
            title="Gráfico de Líneas"
            type="button"
          >
            <LineChartIcon className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartType('pie')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartType === 'pie'
                ? 'bg-primary-500/20 text-primary-500'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            )}
            title="Gráfico Circular"
            type="button"
          >
            <PieChartIcon className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Gráfico con animación */}
      <motion.div
        key={chartType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderChart()}
      </motion.div>
    </div>
  );
};
