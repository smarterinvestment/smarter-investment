// ============================================
// 📊 MULTI-SERIES CHART - Para gráficos con múltiples series
// Compatible con Ingresos vs Gastos
// ============================================
import React, { useState } from 'react';
import { BarChart3, LineChart as LineChartIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { cn } from '../../utils/cn';

interface MultiSeriesChartProps {
  data: any[];
  title: string;
  series: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  nameKey?: string;
  className?: string;
  themeColors?: { primary: string; secondary: string };
}

type ChartType = 'bar' | 'line' | 'area';

export const MultiSeriesChart: React.FC<MultiSeriesChartProps> = ({
  data,
  title,
  series,
  nameKey = 'name',
  className = '',
  themeColors = { primary: '#05BFDB', secondary: '#088395' }
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/95 border border-white/20 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-white/60 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="font-semibold text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-white/40">
          No hay datos disponibles
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 10, right: 10, left: -10, bottom: 0 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={nameKey}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              {series.map((s) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color}
                  radius={[6, 6, 0, 0]}
                  animationDuration={800}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={nameKey}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              {series.map((s) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={3}
                  dot={{ fill: s.color, r: 4, strokeWidth: 2, stroke: '#000' }}
                  activeDot={{ r: 6, fill: s.color, stroke: '#000', strokeWidth: 2 }}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={nameKey}
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              {series.map((s) => (
                <Area
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.color}
                  fillOpacity={0.3}
                  stroke={s.color}
                  strokeWidth={2}
                  animationDuration={800}
                />
              ))}
            </AreaChart>
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
            onClick={() => setChartType('area')}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              chartType === 'area'
                ? 'bg-primary-500/20 text-primary-500'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            )}
            title="Gráfico de Área"
            type="button"
          >
            <Activity className="w-4 h-4" />
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
