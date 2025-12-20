// ============================================
// 🤖 ASSISTANT PAGE v21.5 - Smart Financial Advisor
// Full intelligent local analysis - No API needed
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Sparkles, Loader2, TrendingUp, TrendingDown, Target, 
  AlertTriangle, Trash2, Cpu, Zap, Brain, ChevronRight, RefreshCw
} from 'lucide-react';
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
        message: `Estás gastando ${formatCurrency(Math.abs(ctx.balance), currency)} más de lo que ganas.`,
        priority: 1
      });
    }

    // Low savings rate
    if (ctx.savingsRate >= 0 && ctx.savingsRate < 10 && ctx.effectiveIncome > 0) {
      alertList.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Tasa de Ahorro Baja',
        message: `Tu tasa de ahorro es ${ctx.savingsRate.toFixed(1)}%. Se recomienda al menos 20%.`,
        priority: 2
      });
    }

    // Budget exceeded
    ctx.budgetAlerts.filter(b => b.status === 'exceeded').forEach(b => {
      alertList.push({
        type: 'danger',
        icon: '🔴',
        title: `Presupuesto Excedido: ${b.category}`,
        message: `${b.percentage.toFixed(0)}% usado`,
        priority: 1
      });
    });

    // Budget warning
    ctx.budgetAlerts.filter(b => b.status === 'warning').forEach(b => {
      alertList.push({
        type: 'warning',
        icon: '🟡',
        title: `Presupuesto en Riesgo: ${b.category}`,
        message: `${b.percentage.toFixed(0)}% usado`,
        priority: 3
      });
    });

    // Expense increase
    if (ctx.expenseChange > 20) {
      alertList.push({
        type: 'warning',
        icon: '📈',
        title: 'Gastos Aumentaron',
        message: `+${ctx.expenseChange.toFixed(0)}% vs mes anterior`,
        priority: 3
      });
    }

    // Good savings rate
    if (ctx.savingsRate >= 20) {
      alertList.push({
        type: 'success',
        icon: '✨',
        title: 'Excelente Ahorro',
        message: `${ctx.savingsRate.toFixed(1)}% - Por encima del promedio`,
        priority: 5
      });
    }

    return alertList.sort((a, b) => a.priority - b.priority);
  }, [ctx, currency]);

  // Intelligent Response Generator
  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    // RESUMEN
    if (q.includes('resumen') || q.includes('general') || q.includes('hola') || q.includes('situación') || q.includes('como estoy')) {
      let response = `## 📊 Tu Resumen Financiero\n\n`;
      
      response += `### 💵 Balance del Mes\n`;
      response += `**Ingresos:** ${formatCurrency(ctx.effectiveIncome, currency)}\n`;
      response += `**Gastos:** ${formatCurrency(ctx.totalExpenses, currency)}\n`;
      response += `**Balance:** ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🔴'}\n`;
      response += `**Tasa de Ahorro:** ${ctx.savingsRate.toFixed(1)}%\n\n`;
      
      if (ctx.topCategories.length > 0) {
        response += `### 🏆 Top Gastos\n`;
        ctx.topCategories.slice(0, 3).forEach((c, i) => {
          response += `${i + 1}. **${c.name}**: ${formatCurrency(c.amount, currency)} (${c.percentage.toFixed(0)}%)\n`;
        });
        response += `\n`;
      }

      if (alerts.length > 0) {
        response += `### ⚠️ Alertas (${alerts.length})\n`;
        alerts.slice(0, 2).forEach(a => {
          response += `${a.icon} ${a.title}\n`;
        });
      }

      return response;
    }

    // CONSEJOS
    if (q.includes('consejo') || q.includes('tip') || q.includes('mejora') || q.includes('recomen') || q.includes('suger')) {
      let response = `## 💡 Consejos Personalizados\n\n`;

      if (ctx.balance < 0) {
        response += `### 🚨 Prioridad: Equilibrar tu Balance\n\n`;
        response += `Estás gastando ${formatCurrency(Math.abs(ctx.balance), currency)} más de lo que ganas.\n\n`;
        response += `**Acciones recomendadas:**\n`;
        if (ctx.topCategories[0]) {
          response += `1. Reduce **${ctx.topCategories[0].name}** (tu mayor gasto)\n`;
        }
        response += `2. Revisa gastos no esenciales\n`;
        response += `3. Busca ingresos adicionales\n`;
      } else if (ctx.savingsRate < 10) {
        response += `### ⚠️ Mejora tu Ahorro\n\n`;
        response += `Tu tasa de ahorro es ${ctx.savingsRate.toFixed(1)}%.\n`;
        response += `Para llegar al 20% ideal, necesitas ahorrar ${formatCurrency(ctx.effectiveIncome * 0.20 - ctx.balance, currency)} más.\n\n`;
        response += `**Sugerencias:**\n`;
        response += `1. Automatiza transferencias a ahorro\n`;
        response += `2. Usa la regla 24h para compras\n`;
        response += `3. Revisa suscripciones innecesarias\n`;
      } else {
        response += `### ✅ ¡Vas muy bien!\n\n`;
        response += `Tu tasa de ahorro de ${ctx.savingsRate.toFixed(1)}% está excelente.\n\n`;
        response += `**Siguiente nivel:**\n`;
        response += `1. Considera invertir el excedente\n`;
        response += `2. Acelera el pago de deudas\n`;
        response += `3. Aumenta tus metas de ahorro\n`;
      }

      return response;
    }

    // GASTOS
    if (q.includes('gasto') || q.includes('expense') || q.includes('donde') || q.includes('dinero')) {
      let response = `## 💸 Análisis de Gastos\n\n`;
      response += `**Total este mes:** ${formatCurrency(ctx.totalExpenses, currency)}\n`;
      response += `**Promedio diario:** ${formatCurrency(ctx.avgDailyExpense, currency)}\n`;
      response += `**Proyección mensual:** ${formatCurrency(ctx.projectedMonthlyExpense, currency)}\n\n`;

      if (ctx.topCategories.length > 0) {
        response += `### 📊 Por Categoría\n`;
        ctx.topCategories.forEach((c) => {
          const bar = '█'.repeat(Math.round(c.percentage / 5)) + '░'.repeat(20 - Math.round(c.percentage / 5));
          response += `**${c.name}**\n`;
          response += `${bar} ${c.percentage.toFixed(0)}%\n`;
          response += `${formatCurrency(c.amount, currency)}\n\n`;
        });
      }

      if (ctx.daysRemaining > 0) {
        const dailyBudget = Math.max(0, (ctx.effectiveIncome - ctx.totalExpenses)) / ctx.daysRemaining;
        response += `### 💰 Presupuesto Restante\n`;
        response += `Quedan ${ctx.daysRemaining} días.\n`;
        response += `Puedes gastar hasta **${formatCurrency(dailyBudget, currency)}/día**\n`;
      }

      return response;
    }

    // AHORRO
    if (q.includes('ahorro') || q.includes('ahorr') || q.includes('save') || q.includes('guardar')) {
      let response = `## 🐷 Análisis de Ahorro\n\n`;
      response += `**Balance disponible:** ${formatCurrency(ctx.balance, currency)}\n`;
      response += `**Tasa de ahorro:** ${ctx.savingsRate.toFixed(1)}%\n\n`;

      const status = ctx.savingsRate < 0 ? 'crítica' : ctx.savingsRate < 10 ? 'baja' : ctx.savingsRate < 20 ? 'buena' : 'excelente';
      response += `### Estado: ${status.toUpperCase()}\n\n`;

      response += `### 📈 Proyecciones\n`;
      const monthly = Math.max(0, ctx.balance);
      response += `Si mantienes este ritmo:\n`;
      response += `• **3 meses:** ${formatCurrency(monthly * 3, currency)}\n`;
      response += `• **6 meses:** ${formatCurrency(monthly * 6, currency)}\n`;
      response += `• **1 año:** ${formatCurrency(monthly * 12, currency)}\n`;

      return response;
    }

    // METAS
    if (q.includes('meta') || q.includes('goal') || q.includes('objetivo')) {
      if (ctx.goalsStatus.length === 0) {
        return `## 🎯 Metas de Ahorro\n\n` +
          `No tienes metas configuradas.\n\n` +
          `**Sugerencias de metas:**\n` +
          `• 🆘 Fondo de emergencias (${formatCurrency(ctx.totalExpenses * 4, currency)})\n` +
          `• ✈️ Vacaciones\n` +
          `• 🚗 Compras importantes\n`;
      }

      let response = `## 🎯 Progreso de Metas\n\n`;
      ctx.goalsStatus.forEach(g => {
        const bar = '█'.repeat(Math.round(g.percentage / 5)) + '░'.repeat(20 - Math.round(g.percentage / 5));
        const emoji = g.percentage >= 100 ? '🎉' : g.percentage >= 75 ? '🔥' : g.percentage >= 50 ? '👍' : '💪';
        response += `### ${emoji} ${g.name}\n`;
        response += `${bar} **${g.percentage.toFixed(0)}%**\n`;
        response += `${formatCurrency(g.current, currency)} de ${formatCurrency(g.target, currency)}\n`;
        if (g.remaining > 0 && g.monthsToComplete) {
          response += `~${g.monthsToComplete} mes(es) restantes\n`;
        }
        response += `\n`;
      });

      return response;
    }

    // PROYECCIÓN
    if (q.includes('proyec') || q.includes('futuro') || q.includes('estimad')) {
      let response = `## 📈 Proyección Financiera\n\n`;
      const monthly = ctx.balance;

      response += `### Situación Actual\n`;
      response += `Balance mensual: ${formatCurrency(monthly, currency)}\n\n`;

      if (monthly > 0) {
        response += `### Proyección de Ahorro\n`;
        response += `• **3 meses:** ${formatCurrency(monthly * 3, currency)}\n`;
        response += `• **6 meses:** ${formatCurrency(monthly * 6, currency)}\n`;
        response += `• **1 año:** ${formatCurrency(monthly * 12, currency)}\n`;
        response += `• **5 años:** ${formatCurrency(monthly * 60, currency)}\n`;
      } else {
        response += `### ⚠️ Proyección Negativa\n`;
        response += `Al ritmo actual, acumularás ${formatCurrency(Math.abs(monthly) * 12, currency)} en deuda en 1 año.\n`;
      }

      return response;
    }

    // ALERTAS
    if (q.includes('alert') || q.includes('problema') || q.includes('aviso')) {
      if (alerts.length === 0) {
        return `## ✅ Sin Alertas\n\n¡Todo bajo control! No hay alertas activas.`;
      }

      let response = `## ⚠️ Alertas (${alerts.length})\n\n`;
      alerts.forEach(a => {
        const color = a.type === 'danger' ? '🔴' : a.type === 'warning' ? '🟡' : '🟢';
        response += `### ${a.icon} ${a.title} ${color}\n`;
        response += `${a.message}\n\n`;
      });

      return response;
    }

    // LOGROS
    if (q.includes('logro') || q.includes('achievement') || q.includes('bien')) {
      let response = `## 🏆 Tus Logros\n\n`;
      let count = 0;

      if (ctx.savingsRate >= 20) {
        response += `### 🌟 Super Ahorrador\nTasa de ahorro superior al 20%\n\n`;
        count++;
      }
      if (ctx.balance > 0) {
        response += `### 💰 Balance Positivo\nIngresos superan gastos\n\n`;
        count++;
      }
      if (ctx.goalsStatus.some(g => g.percentage >= 100)) {
        response += `### 🎯 Cumplidor de Metas\nMeta financiera completada\n\n`;
        count++;
      }
      if (ctx.transactionCount >= 20) {
        response += `### 📝 Rastreador Dedicado\n${ctx.transactionCount} transacciones este mes\n\n`;
        count++;
      }

      if (count === 0) {
        response += `Aún no has desbloqueado logros.\n\n`;
        response += `**Próximos objetivos:**\n`;
        response += `• Mantén balance positivo\n`;
        response += `• Alcanza 10% de ahorro\n`;
        response += `• Registra 20+ transacciones\n`;
      }

      return response;
    }

    // Default / Help
    return `## 🤖 Asistente Financiero\n\n` +
      `Soy tu asesor financiero inteligente. Analizo tus datos en tiempo real.\n\n` +
      `**Comandos disponibles:**\n` +
      `• **Resumen** - Tu situación financiera\n` +
      `• **Consejos** - Recomendaciones personalizadas\n` +
      `• **Gastos** - Análisis detallado\n` +
      `• **Ahorro** - Tips y proyecciones\n` +
      `• **Metas** - Progreso de objetivos\n` +
      `• **Proyección** - Estimaciones futuras\n` +
      `• **Alertas** - Problemas detectados\n` +
      `• **Logros** - Tus achievements\n\n` +
      `¿En qué puedo ayudarte?`;
  };

  // Generate financial context for Claude API
  const generateFinancialContext = () => {
    return `
RESUMEN FINANCIERO (${new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })}):
- Ingresos del mes: ${formatCurrency(ctx.effectiveIncome, currency)}
- Gastos del mes: ${formatCurrency(ctx.totalExpenses, currency)}
- Balance: ${formatCurrency(ctx.balance, currency)}
- Tasa de ahorro: ${ctx.savingsRate.toFixed(1)}%
- Días restantes en el mes: ${ctx.daysRemaining}

TOP GASTOS POR CATEGORÍA:
${ctx.topCategories.map((c, i) => `${i + 1}. ${c.name}: ${formatCurrency(c.amount, currency)} (${c.percentage.toFixed(0)}%)`).join('\n')}

METAS DE AHORRO:
${ctx.goalsStatus.length > 0 
  ? ctx.goalsStatus.map(g => `- ${g.name}: ${g.percentage.toFixed(0)}% completado`).join('\n')
  : 'Sin metas configuradas'}

ALERTAS: ${alerts.map(a => `${a.icon} ${a.title}`).join(', ') || 'Ninguna'}
`;
  };

  // Call Claude API via backend
  const callClaudeAPI = async (userMessage: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage,
          financialContext: generateFinancialContext(),
          messages: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn('Claude API unavailable:', error);
        return null;
      }

      const data = await response.json();
      return data.content || null;
    } catch (error) {
      console.warn('Claude API error:', error);
      return null;
    }
  };

  // Handle send message
  const handleSend = async (text?: string) => {
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

    let response: string;
    let usedAPI = false;

    // Try Claude API first, fallback to local
    const apiResponse = await callClaudeAPI(messageText);
    
    if (apiResponse) {
      response = apiResponse;
      usedAPI = true;
    } else {
      // Fallback to local analysis
      await new Promise(resolve => setTimeout(resolve, 300));
      response = generateResponse(messageText);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
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
          `Soy tu asistente financiero inteligente. Analizo tus datos en tiempo real.\n\n` +
          `### 📊 Vista Rápida\n` +
          `**Balance:** ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🔴'}\n` +
          `**Tasa de ahorro:** ${ctx.savingsRate.toFixed(1)}%\n` +
          `**Alertas activas:** ${alerts.length}\n\n` +
          `Usa los botones de arriba o escribe tu pregunta.`,
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
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="text-white/80 pl-2 my-0.5">{line}</p>;
      }
      if (line.match(/^\d+\. /)) {
        return <p key={i} className="text-white/80 pl-2 my-0.5">{line}</p>;
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
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant="success" size="sm">
            <Brain className="w-3 h-3 mr-1" />
            IA Integrada
          </Badge>
          <Badge variant="secondary" size="sm">
            <Zap className="w-3 h-3 mr-1" />
            Análisis en Tiempo Real
          </Badge>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.filter(a => a.type === 'danger' || a.type === 'warning').length > 0 && (
        <div className="px-4 py-2 border-b border-white/10 bg-warning-500/5">
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
                  ? 'rounded-br-md'
                  : 'bg-white/5 rounded-bl-md backdrop-blur-sm border border-white/10'
              )}
              style={msg.role === 'user' ? { backgroundColor: `${themeColors.primary}20` } : {}}
              >
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
            <div className="bg-white/5 rounded-2xl rounded-bl-md p-4 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: themeColors.primary }} />
                <span className="text-white/60 text-sm">Analizando tus datos...</span>
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
