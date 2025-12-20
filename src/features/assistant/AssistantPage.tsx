// ============================================
// 🤖 ASSISTANT PAGE v21.2 - Smart Local Analysis
// Works without API - Full intelligent financial advisor
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Loader2, TrendingUp, TrendingDown, Target, AlertTriangle, Trash2, Lightbulb, PiggyBank, CreditCard, Calendar, Award, ChevronRight } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';

// Quick action prompts
const QUICK_ACTIONS = [
  { id: '1', icon: '📊', label: 'Resumen', keyword: 'resumen' },
  { id: '2', icon: '💡', label: 'Consejos', keyword: 'consejos' },
  { id: '3', icon: '💰', label: 'Ahorro', keyword: 'ahorro' },
  { id: '4', icon: '🎯', label: 'Metas', keyword: 'metas' },
  { id: '5', icon: '📈', label: 'Proyección', keyword: 'proyeccion' },
  { id: '6', icon: '⚠️', label: 'Alertas', keyword: 'alertas' },
  { id: '7', icon: '📉', label: 'Gastos', keyword: 'gastos' },
  { id: '8', icon: '🏆', label: 'Logros', keyword: 'logros' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FinancialAlert {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  title: string;
  message: string;
  priority: number;
}

export const AssistantPage: React.FC = () => {
  const { user, expenses, incomes, goals, budgets, recurringTransactions, theme, currency } = useStore();
  const themeColors = getThemeColors(theme);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  // Financial Context Calculator
  const ctx = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay;

    // Current month transactions
    const currentExpenses = safeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const currentIncomes = safeIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Last month transactions
    const lastExpenses = safeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });
    const lastIncomes = safeIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Totals
    const totalIncome = currentIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpenses = currentExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const lastTotalExpenses = lastExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const lastTotalIncome = lastIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // Recurring calculations
    let recurringIncome = 0;
    let recurringExpense = 0;
    safeRecurring.forEach(r => {
      if (!r.isActive) return;
      let monthly = Number(r.amount) || 0;
      switch (r.frequency) {
        case 'daily': monthly *= 30; break;
        case 'weekly': monthly *= 4; break;
        case 'biweekly': monthly *= 2; break;
        case 'yearly': monthly /= 12; break;
      }
      if (r.type === 'income') recurringIncome += monthly;
      else recurringExpense += monthly;
    });

    // Effective amounts
    const effectiveIncome = totalIncome || recurringIncome;
    const effectiveExpenses = totalExpenses;
    const balance = effectiveIncome - effectiveExpenses;
    const savingsRate = effectiveIncome > 0 ? (balance / effectiveIncome) * 100 : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    currentExpenses.forEach(e => {
      const cat = e.category || 'Otros';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);
    });
    
    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }));

    // Budget alerts
    const budgetAlerts: Array<{ category: string; percentage: number; status: string; spent: number; limit: number }> = [];
    Object.entries(safeBudgets).forEach(([cat, limit]) => {
      const spent = categoryTotals[cat] || 0;
      const pct = Number(limit) > 0 ? (spent / Number(limit)) * 100 : 0;
      if (pct >= 50) {
        budgetAlerts.push({
          category: cat,
          percentage: pct,
          status: pct >= 100 ? 'exceeded' : pct >= 80 ? 'warning' : 'safe',
          spent,
          limit: Number(limit)
        });
      }
    });

    // Goals analysis
    const goalsStatus = safeGoals.map(g => ({
      name: g.name,
      current: Number(g.currentAmount) || 0,
      target: Number(g.targetAmount) || 1,
      percentage: Math.min(((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1)) * 100, 100),
      remaining: Math.max((Number(g.targetAmount) || 0) - (Number(g.currentAmount) || 0), 0),
      monthsToComplete: balance > 0 ? Math.ceil(Math.max((Number(g.targetAmount) || 0) - (Number(g.currentAmount) || 0), 0) / balance) : null
    }));

    // Changes vs last month
    const expenseChange = lastTotalExpenses > 0 
      ? ((totalExpenses - lastTotalExpenses) / lastTotalExpenses) * 100 
      : 0;
    const incomeChange = lastTotalIncome > 0 
      ? ((totalIncome - lastTotalIncome) / lastTotalIncome) * 100 
      : 0;

    // Average daily expense
    const avgDailyExpense = totalExpenses / (currentDay || 1);
    const projectedMonthlyExpense = avgDailyExpense * daysInMonth;

    // 50/30/20 analysis
    const needsTarget = effectiveIncome * 0.5;
    const wantsTarget = effectiveIncome * 0.3;
    const savingsTarget = effectiveIncome * 0.2;

    return {
      totalIncome,
      totalExpenses,
      effectiveIncome,
      effectiveExpenses,
      balance,
      savingsRate,
      recurringIncome,
      recurringExpense,
      topCategories,
      budgetAlerts,
      goalsStatus,
      expenseChange,
      incomeChange,
      avgDailyExpense,
      projectedMonthlyExpense,
      daysRemaining,
      currentDay,
      daysInMonth,
      lastTotalExpenses,
      lastTotalIncome,
      needsTarget,
      wantsTarget,
      savingsTarget,
      transactionCount: currentExpenses.length + currentIncomes.length,
      categoryTotals,
    };
  }, [safeExpenses, safeIncomes, safeGoals, safeBudgets, safeRecurring]);

  // Generate Smart Alerts
  const alerts = useMemo(() => {
    const alertList: FinancialAlert[] = [];

    // Critical: Deficit
    if (ctx.balance < 0) {
      alertList.push({
        type: 'danger',
        icon: '🚨',
        title: 'Déficit Financiero',
        message: `Estás gastando ${formatCurrency(Math.abs(ctx.balance), currency)} más de lo que ganas. Necesitas reducir gastos urgentemente.`,
        priority: 1
      });
    }

    // Low savings rate
    if (ctx.savingsRate >= 0 && ctx.savingsRate < 10 && ctx.effectiveIncome > 0) {
      alertList.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Tasa de Ahorro Baja',
        message: `Tu tasa de ahorro es ${ctx.savingsRate.toFixed(1)}%. Se recomienda al menos 20% para seguridad financiera.`,
        priority: 2
      });
    }

    // Budget exceeded
    ctx.budgetAlerts.filter(b => b.status === 'exceeded').forEach(b => {
      alertList.push({
        type: 'danger',
        icon: '🔴',
        title: `Presupuesto Excedido: ${b.category}`,
        message: `Has gastado ${formatCurrency(b.spent, currency)} de ${formatCurrency(b.limit, currency)} (${b.percentage.toFixed(0)}%)`,
        priority: 1
      });
    });

    // Budget warning
    ctx.budgetAlerts.filter(b => b.status === 'warning').forEach(b => {
      alertList.push({
        type: 'warning',
        icon: '🟡',
        title: `Presupuesto en Riesgo: ${b.category}`,
        message: `${b.percentage.toFixed(0)}% del presupuesto usado, quedan ${formatCurrency(b.limit - b.spent, currency)}`,
        priority: 3
      });
    });

    // Expense increase
    if (ctx.expenseChange > 20) {
      alertList.push({
        type: 'warning',
        icon: '📈',
        title: 'Gastos Aumentaron',
        message: `Tus gastos subieron ${ctx.expenseChange.toFixed(0)}% comparado con el mes anterior`,
        priority: 3
      });
    }

    // Goal almost complete
    ctx.goalsStatus.filter(g => g.percentage >= 90 && g.percentage < 100).forEach(g => {
      alertList.push({
        type: 'info',
        icon: '🎯',
        title: `Meta Casi Lista: ${g.name}`,
        message: `¡Solo te falta ${formatCurrency(g.remaining, currency)} para completarla!`,
        priority: 4
      });
    });

    // Goal completed
    ctx.goalsStatus.filter(g => g.percentage >= 100).forEach(g => {
      alertList.push({
        type: 'success',
        icon: '🎉',
        title: `¡Meta Completada!`,
        message: `Felicidades, completaste tu meta "${g.name}"`,
        priority: 5
      });
    });

    // Good savings rate
    if (ctx.savingsRate >= 20) {
      alertList.push({
        type: 'success',
        icon: '✨',
        title: 'Excelente Ahorro',
        message: `Tu tasa de ahorro de ${ctx.savingsRate.toFixed(1)}% está por encima del promedio recomendado.`,
        priority: 5
      });
    }

    // Projected expense
    if (ctx.projectedMonthlyExpense > ctx.effectiveIncome && ctx.effectiveIncome > 0) {
      alertList.push({
        type: 'warning',
        icon: '📊',
        title: 'Proyección de Gastos Alta',
        message: `Al ritmo actual, gastarás ${formatCurrency(ctx.projectedMonthlyExpense, currency)} este mes, superando tus ingresos.`,
        priority: 2
      });
    }

    return alertList.sort((a, b) => a.priority - b.priority);
  }, [ctx, currency]);

  // Intelligent Response Generator
  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    // RESUMEN
    if (q.includes('resumen') || q.includes('general') || q.includes('hola') || q.includes('situación') || q.includes('como estoy')) {
      let response = `## 📊 Tu Resumen Financiero\n`;
      response += `*${new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}*\n\n`;
      
      response += `### 💵 Balance General\n`;
      response += `• **Ingresos:** ${formatCurrency(ctx.effectiveIncome, currency)}\n`;
      response += `• **Gastos:** ${formatCurrency(ctx.totalExpenses, currency)}\n`;
      response += `• **Balance:** ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🔴'}\n`;
      response += `• **Tasa de Ahorro:** ${ctx.savingsRate.toFixed(1)}%\n\n`;
      
      if (ctx.topCategories.length > 0) {
        response += `### 🏆 Top 3 Gastos\n`;
        ctx.topCategories.slice(0, 3).forEach((c, i) => {
          response += `${i + 1}. **${c.name}**: ${formatCurrency(c.amount, currency)} (${c.percentage.toFixed(0)}%)\n`;
        });
        response += `\n`;
      }

      if (alerts.length > 0) {
        response += `### ⚠️ Alertas (${alerts.length})\n`;
        alerts.slice(0, 3).forEach(a => {
          response += `• ${a.icon} ${a.title}\n`;
        });
      }

      response += `\n💡 *Pregúntame por "consejos" para recomendaciones personalizadas*`;
      return response;
    }

    // CONSEJOS
    if (q.includes('consejo') || q.includes('tip') || q.includes('mejora') || q.includes('recomen') || q.includes('suger')) {
      let response = `## 💡 Consejos Personalizados\n\n`;

      if (ctx.balance < 0) {
        response += `### 🚨 URGENTE: Estás en Déficit\n`;
        response += `Estás gastando ${formatCurrency(Math.abs(ctx.balance), currency)} más de lo que ganas.\n\n`;
        response += `**Acciones inmediatas:**\n`;
        if (ctx.topCategories[0]) {
          response += `1. Reduce "${ctx.topCategories[0].name}" - tu mayor gasto (${formatCurrency(ctx.topCategories[0].amount, currency)})\n`;
        }
        response += `2. Revisa gastos no esenciales y elimínalos temporalmente\n`;
        response += `3. Busca ingresos adicionales si es posible\n\n`;
      } else if (ctx.savingsRate < 10) {
        const needed = ctx.effectiveIncome * 0.20 - ctx.balance;
        response += `### ⚠️ Aumenta tu Ahorro\n`;
        response += `Tu tasa de ahorro es ${ctx.savingsRate.toFixed(1)}%. Para llegar al 20% ideal, necesitas ahorrar ${formatCurrency(Math.max(needed, 0), currency)} más.\n\n`;
        response += `**Sugerencias:**\n`;
        if (ctx.topCategories[0]) {
          response += `1. Reduce "${ctx.topCategories[0].name}" un 15-20%\n`;
        }
        response += `2. Automatiza transferencias a ahorro el día de pago\n`;
        response += `3. Usa la regla 24h: espera un día antes de compras no planeadas\n\n`;
      } else if (ctx.savingsRate >= 20) {
        response += `### ✅ ¡Excelente trabajo!\n`;
        response += `Tu tasa de ahorro de ${ctx.savingsRate.toFixed(1)}% está por encima del promedio.\n\n`;
        response += `**Siguiente nivel:**\n`;
        response += `1. Considera invertir el excedente para generar rendimientos\n`;
        response += `2. Si tienes deudas, acelera el pago para ahorrar en intereses\n`;
        response += `3. Aumenta tus metas de ahorro o crea nuevas\n\n`;
      }

      // 50/30/20 Analysis
      response += `### 📊 Regla 50/30/20\n`;
      response += `Basado en tus ingresos de ${formatCurrency(ctx.effectiveIncome, currency)}:\n`;
      response += `• **Necesidades (50%):** ${formatCurrency(ctx.needsTarget, currency)}\n`;
      response += `• **Deseos (30%):** ${formatCurrency(ctx.wantsTarget, currency)}\n`;
      response += `• **Ahorro (20%):** ${formatCurrency(ctx.savingsTarget, currency)}\n`;

      return response;
    }

    // GASTOS
    if (q.includes('gasto') || q.includes('expense') || q.includes('donde') || q.includes('dinero')) {
      let response = `## 💸 Análisis de Gastos\n\n`;
      response += `**Total este mes:** ${formatCurrency(ctx.totalExpenses, currency)}\n`;
      response += `**Promedio diario:** ${formatCurrency(ctx.avgDailyExpense, currency)}\n`;
      response += `**Proyección mensual:** ${formatCurrency(ctx.projectedMonthlyExpense, currency)}\n`;
      
      if (ctx.expenseChange !== 0) {
        const emoji = ctx.expenseChange > 0 ? '📈' : '📉';
        const changeText = ctx.expenseChange > 0 ? 'aumentaron' : 'disminuyeron';
        response += `**vs Mes anterior:** ${changeText} ${Math.abs(ctx.expenseChange).toFixed(1)}% ${emoji}\n`;
      }
      response += `\n`;

      if (ctx.topCategories.length > 0) {
        response += `### 📊 Distribución por Categoría\n`;
        ctx.topCategories.forEach((c, i) => {
          const bar = '█'.repeat(Math.round(c.percentage / 5)) + '░'.repeat(20 - Math.round(c.percentage / 5));
          response += `**${c.name}**\n`;
          response += `${bar} ${c.percentage.toFixed(0)}% (${formatCurrency(c.amount, currency)})\n\n`;
        });
      }

      if (ctx.daysRemaining > 0) {
        const dailyBudget = Math.max(0, (ctx.effectiveIncome - ctx.totalExpenses)) / ctx.daysRemaining;
        response += `### 💰 Presupuesto Restante\n`;
        response += `Te quedan ${ctx.daysRemaining} días. Puedes gastar hasta ${formatCurrency(dailyBudget, currency)}/día sin exceder tus ingresos.\n`;
      }

      return response;
    }

    // AHORRO
    if (q.includes('ahorro') || q.includes('ahorr') || q.includes('save') || q.includes('guardar')) {
      let response = `## 🐷 Análisis de Ahorro\n\n`;
      response += `**Balance disponible:** ${formatCurrency(ctx.balance, currency)}\n`;
      response += `**Tasa de ahorro:** ${ctx.savingsRate.toFixed(1)}%\n\n`;

      if (ctx.savingsRate < 0) {
        response += `### 🚨 Situación Crítica\n`;
        response += `No estás ahorrando porque gastas más de lo que ganas. Prioridad: reducir gastos.\n\n`;
      } else if (ctx.savingsRate < 10) {
        response += `### ⚠️ Necesitas Mejorar\n`;
        response += `Tu ahorro está por debajo del mínimo recomendado (10%).\n\n`;
      } else if (ctx.savingsRate < 20) {
        response += `### 👍 Buen Camino\n`;
        response += `Vas bien, pero intenta llegar al 20% para seguridad financiera.\n\n`;
      } else {
        response += `### ✅ Excelente\n`;
        response += `Tu tasa de ahorro supera el 20% recomendado. ¡Sigue así!\n\n`;
      }

      response += `### 📈 Proyecciones\n`;
      const monthly = Math.max(0, ctx.balance);
      response += `Si mantienes este ritmo:\n`;
      response += `• **3 meses:** ${formatCurrency(monthly * 3, currency)}\n`;
      response += `• **6 meses:** ${formatCurrency(monthly * 6, currency)}\n`;
      response += `• **1 año:** ${formatCurrency(monthly * 12, currency)}\n\n`;

      response += `### 💡 Tips para Ahorrar Más\n`;
      response += `1. Paga tu ahorro primero (como si fuera una factura)\n`;
      response += `2. Automatiza transferencias el día de pago\n`;
      response += `3. Redondea gastos y ahorra la diferencia\n`;

      return response;
    }

    // METAS
    if (q.includes('meta') || q.includes('goal') || q.includes('objetivo')) {
      if (ctx.goalsStatus.length === 0) {
        return `## 🎯 Metas de Ahorro\n\n` +
          `No tienes metas configuradas todavía.\n\n` +
          `**Te sugiero crear metas para:**\n` +
          `• 🆘 Fondo de emergencias (3-6 meses de gastos = ${formatCurrency(ctx.totalExpenses * 4, currency)})\n` +
          `• ✈️ Vacaciones\n` +
          `• 🚗 Compras importantes\n` +
          `• 🏠 Pago inicial de vivienda\n\n` +
          `*Ve a la sección "Metas" para crear tu primera meta.*`;
      }

      let response = `## 🎯 Progreso de Metas\n\n`;
      ctx.goalsStatus.forEach(g => {
        const bar = '█'.repeat(Math.round(g.percentage / 5)) + '░'.repeat(20 - Math.round(g.percentage / 5));
        const emoji = g.percentage >= 100 ? '🎉' : g.percentage >= 75 ? '🔥' : g.percentage >= 50 ? '👍' : '💪';
        response += `### ${emoji} ${g.name}\n`;
        response += `${bar} **${g.percentage.toFixed(0)}%**\n`;
        response += `${formatCurrency(g.current, currency)} de ${formatCurrency(g.target, currency)}\n`;
        if (g.remaining > 0 && g.monthsToComplete) {
          response += `⏱️ ~${g.monthsToComplete} mes(es) para completar al ritmo actual\n`;
        } else if (g.percentage >= 100) {
          response += `✅ ¡Meta completada!\n`;
        }
        response += `\n`;
      });

      return response;
    }

    // PROYECCIÓN
    if (q.includes('proyec') || q.includes('futuro') || q.includes('estimad') || q.includes('predic')) {
      let response = `## 📈 Proyección Financiera\n\n`;
      const monthly = ctx.balance;

      response += `### Situación Actual\n`;
      response += `• Balance mensual: ${formatCurrency(monthly, currency)}\n`;
      response += `• Promedio diario de gasto: ${formatCurrency(ctx.avgDailyExpense, currency)}\n\n`;

      response += `### Proyección de Ahorro\n`;
      if (monthly > 0) {
        response += `| Período | Acumulado |\n`;
        response += `|---------|----------|\n`;
        response += `| 3 meses | ${formatCurrency(monthly * 3, currency)} |\n`;
        response += `| 6 meses | ${formatCurrency(monthly * 6, currency)} |\n`;
        response += `| 1 año | ${formatCurrency(monthly * 12, currency)} |\n`;
        response += `| 5 años | ${formatCurrency(monthly * 60, currency)} |\n\n`;
        response += `✅ A este ritmo, en 1 año tendrás ${formatCurrency(monthly * 12, currency)} ahorrados.\n`;
      } else {
        response += `⚠️ Con un balance negativo de ${formatCurrency(monthly, currency)}/mes, `;
        response += `acumularás ${formatCurrency(Math.abs(monthly) * 12, currency)} en deuda en 1 año.\n\n`;
        response += `**Necesitas:** Reducir gastos en al menos ${formatCurrency(Math.abs(monthly), currency)}/mes para equilibrar.`;
      }

      return response;
    }

    // ALERTAS
    if (q.includes('alert') || q.includes('problema') || q.includes('aviso') || q.includes('advertencia')) {
      if (alerts.length === 0) {
        return `## ✅ Sin Alertas\n\n` +
          `¡Todo está bajo control! No hay alertas activas.\n\n` +
          `Tu situación financiera parece estable. Sigue así y mantén tus buenos hábitos.`;
      }

      let response = `## ⚠️ Alertas Activas (${alerts.length})\n\n`;
      alerts.forEach(a => {
        const typeEmoji = a.type === 'danger' ? '🔴' : a.type === 'warning' ? '🟡' : a.type === 'success' ? '🟢' : '🔵';
        response += `### ${a.icon} ${a.title} ${typeEmoji}\n`;
        response += `${a.message}\n\n`;
      });

      return response;
    }

    // LOGROS
    if (q.includes('logro') || q.includes('achievement') || q.includes('bien') || q.includes('positivo')) {
      let response = `## 🏆 Tus Logros\n\n`;
      let logros = 0;

      if (ctx.savingsRate >= 20) {
        response += `### 🌟 Super Ahorrador\n`;
        response += `Tu tasa de ahorro supera el 20% recomendado.\n\n`;
        logros++;
      }
      if (ctx.savingsRate >= 10 && ctx.savingsRate < 20) {
        response += `### ⭐ Buen Ahorrador\n`;
        response += `Mantienes una tasa de ahorro saludable.\n\n`;
        logros++;
      }
      if (ctx.balance > 0) {
        response += `### 💰 Balance Positivo\n`;
        response += `Tus ingresos superan tus gastos. ¡Sigue así!\n\n`;
        logros++;
      }
      if (ctx.goalsStatus.some(g => g.percentage >= 100)) {
        response += `### 🎯 Cumplidor de Metas\n`;
        response += `Has completado al menos una meta financiera.\n\n`;
        logros++;
      }
      if (ctx.transactionCount >= 20) {
        response += `### 📝 Rastreador Dedicado\n`;
        response += `Tienes ${ctx.transactionCount} transacciones registradas este mes.\n\n`;
        logros++;
      }
      if (ctx.expenseChange < -10) {
        response += `### 📉 Reductor de Gastos\n`;
        response += `Redujiste tus gastos ${Math.abs(ctx.expenseChange).toFixed(0)}% vs el mes pasado.\n\n`;
        logros++;
      }

      if (logros === 0) {
        response += `Todavía no has desbloqueado logros. ¡Sigue trabajando en tus finanzas!\n\n`;
        response += `**Próximos objetivos:**\n`;
        response += `• Mantén balance positivo por un mes\n`;
        response += `• Alcanza 10% de tasa de ahorro\n`;
        response += `• Registra 20+ transacciones\n`;
      }

      return response;
    }

    // PRESUPUESTO
    if (q.includes('presupuesto') || q.includes('budget') || q.includes('limite')) {
      let response = `## 💰 Estado de Presupuestos\n\n`;
      
      if (Object.keys(safeBudgets).length === 0) {
        response += `No tienes presupuestos configurados.\n\n`;
        response += `**Presupuesto Sugerido (50/30/20):**\n`;
        response += `• Necesidades: ${formatCurrency(ctx.needsTarget, currency)}/mes\n`;
        response += `• Deseos: ${formatCurrency(ctx.wantsTarget, currency)}/mes\n`;
        response += `• Ahorro: ${formatCurrency(ctx.savingsTarget, currency)}/mes\n\n`;
        response += `*Ve a "Presupuestos" para configurar tus límites.*`;
      } else {
        Object.entries(safeBudgets).forEach(([cat, limit]) => {
          const spent = ctx.categoryTotals[cat] || 0;
          const pct = Number(limit) > 0 ? (spent / Number(limit)) * 100 : 0;
          const status = pct >= 100 ? '🔴' : pct >= 80 ? '🟡' : '🟢';
          response += `${status} **${cat}**\n`;
          response += `${formatCurrency(spent, currency)} / ${formatCurrency(Number(limit), currency)} (${pct.toFixed(0)}%)\n\n`;
        });
      }

      return response;
    }

    // Default / Help
    return `## 🤖 Asistente Financiero\n\n` +
      `Soy tu asesor financiero inteligente. Puedo ayudarte con:\n\n` +
      `• **"Resumen"** - Tu situación financiera actual\n` +
      `• **"Consejos"** - Recomendaciones personalizadas\n` +
      `• **"Gastos"** - Análisis detallado de gastos\n` +
      `• **"Ahorro"** - Tips y proyecciones de ahorro\n` +
      `• **"Metas"** - Progreso de tus objetivos\n` +
      `• **"Proyección"** - Estimaciones futuras\n` +
      `• **"Alertas"** - Problemas detectados\n` +
      `• **"Logros"** - Tus achievements financieros\n` +
      `• **"Presupuesto"** - Estado de límites\n\n` +
      `¿En qué te puedo ayudar?`;
  };

  // Handle send message
  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `## 👋 ¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}!\n\n` +
          `Soy tu asistente financiero inteligente. Analizo tus datos en tiempo real para darte consejos personalizados.\n\n` +
          `### 📊 Vista Rápida\n` +
          `• **Balance:** ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🔴'}\n` +
          `• **Tasa de ahorro:** ${ctx.savingsRate.toFixed(1)}%\n` +
          `• **Alertas activas:** ${alerts.length}\n\n` +
          `Usa los botones de arriba o escribe tu pregunta. ¿En qué puedo ayudarte?`,
        timestamp: new Date()
      };
      setMessages([welcome]);
    }
  }, []);

  // Render markdown-like content
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-white mt-3 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold text-white/90 mt-3 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('| ')) {
        return <p key={i} className="text-white/60 font-mono text-xs my-0.5">{line}</p>;
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="text-white/80 pl-2 my-0.5">{line}</p>;
      }
      if (line.match(/^\d+\. /)) {
        return <p key={i} className="text-white/80 pl-2 my-0.5">{line}</p>;
      }
      if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        return <p key={i} className="text-white/50 text-sm italic my-1">{line.replace(/\*/g, '')}</p>;
      }
      if (line.includes('**')) {
        const parts = line.split(/\*\*/);
        return (
          <p key={i} className="text-white/80 my-0.5">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
          </p>
        );
      }
      return line ? <p key={i} className="text-white/80 my-0.5">{line}</p> : <br key={i} />;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="text-center py-3 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Bot className="w-6 h-6" style={{ color: themeColors.primary }} />
          Asistente Financiero
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge variant="success" size="sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Análisis Inteligente
          </Badge>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.filter(a => a.type === 'danger' || a.type === 'warning').length > 0 && (
        <div className="px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning-400" />
            <span className="text-warning-400">
              {alerts.filter(a => a.type === 'danger' || a.type === 'warning').length} alerta(s) activa(s)
            </span>
            <Button size="sm" variant="secondary" onClick={() => handleSend('alertas')} className="ml-auto">
              Ver
            </Button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_ACTIONS.map(action => (
            <Button
              key={action.id}
              size="sm"
              variant="secondary"
              onClick={() => handleSend(action.keyword)}
              disabled={isTyping}
              className="flex-shrink-0"
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[90%] rounded-2xl p-4',
                msg.role === 'user'
                  ? 'bg-primary-500/20 rounded-br-md'
                  : 'bg-white/5 rounded-bl-md backdrop-blur-sm'
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${themeColors.primary}30` }}
                    >
                      <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
                    </div>
                    <span className="text-xs text-white/50">Asistente</span>
                  </div>
                )}
                <div className="text-sm">
                  {msg.role === 'assistant' ? renderContent(msg.content) : (
                    <p className="text-white">{msg.content}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/5 rounded-2xl rounded-bl-md p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: themeColors.primary }} />
                <span className="text-white/60 text-sm">Analizando...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Limpiar chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta..."
            disabled={isTyping}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-500 disabled:opacity-50"
          />

          <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
