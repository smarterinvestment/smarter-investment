// ============================================
// 🤖 ASSISTANT PAGE v20 - INTELLIGENT FINANCIAL ADVISOR
// Real-time analysis with smart responses
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, AlertCircle, Loader2, TrendingUp, TrendingDown, Target, PiggyBank, RefreshCw, Lightbulb } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import type { ChatMessage } from '../../types';

// Quick Actions with smart queries
const QUICK_ACTIONS = [
  { id: '1', icon: '📊', label: 'Mi Resumen', message: 'Dame un resumen completo de mis finanzas' },
  { id: '2', icon: '💡', label: 'Consejos', message: 'Dame consejos personalizados para mejorar mis finanzas' },
  { id: '3', icon: '🎯', label: 'Metas', message: 'Analiza el progreso de mis metas de ahorro' },
  { id: '4', icon: '💰', label: 'Gastos', message: 'Analiza mis gastos y dónde puedo ahorrar' },
  { id: '5', icon: '📈', label: 'Proyección', message: 'Proyecta mis finanzas a 6 meses' },
  { id: '6', icon: '⚠️', label: 'Alertas', message: 'Muéstrame alertas y problemas en mis finanzas' },
];

// Smart Alert Type
interface SmartAlert {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  title: string;
  message: string;
}

export const AssistantPage: React.FC = () => {
  const { user, expenses, incomes, goals, budgets, recurringTransactions, theme, currency } = useStore();
  const themeColors = getThemeColors(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  // Calculate comprehensive financial context
  const ctx = useMemo(() => {
    // Current month filter
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthExpenses = safeExpenses.filter(e => e.date >= monthStart);
    const monthIncomes = safeIncomes.filter(i => i.date >= monthStart);

    // Previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const prevExpenses = safeExpenses.filter(e => e.date >= prevMonthStart && e.date <= prevMonthEnd);
    const prevIncomes = safeIncomes.filter(i => i.date >= prevMonthStart && i.date <= prevMonthEnd);

    // Base totals
    const baseIncome = monthIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const baseExpenses = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const prevIncome = prevIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const prevExpense = prevExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Recurring (monthly equivalent)
    const activeRecurring = safeRecurring.filter(r => r.isActive);
    let recurringIncome = 0, recurringExpense = 0;
    activeRecurring.forEach(r => {
      const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
      if (r.type === 'income') recurringIncome += r.amount * mult;
      else recurringExpense += r.amount * mult;
    });

    const totalIncome = baseIncome + recurringIncome;
    const totalExpenses = baseExpenses + recurringExpense;
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
    });
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount, percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);

    // Budget status
    const budgetStatus = Object.entries(safeBudgets).map(([category, limit]) => {
      const spent = categoryTotals[category] || 0;
      return { category, limit, spent, percentage: limit > 0 ? (spent / limit) * 100 : 0 };
    });
    const exceededBudgets = budgetStatus.filter(b => b.percentage >= 100);
    const warningBudgets = budgetStatus.filter(b => b.percentage >= 80 && b.percentage < 100);

    // Goals progress
    const goalsStatus = safeGoals.map(g => ({
      name: g.name,
      target: Number(g.targetAmount) || 0,
      current: Number(g.currentAmount) || 0,
      progress: (Number(g.targetAmount) || 0) > 0 ? ((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 0)) * 100 : 0,
      remaining: Math.max(0, (Number(g.targetAmount) || 0) - (Number(g.currentAmount) || 0)),
    }));
    const activeGoals = goalsStatus.filter(g => g.progress < 100);
    const completedGoals = goalsStatus.filter(g => g.progress >= 100);

    // Month-over-month comparison
    const expenseChange = prevExpense > 0 ? ((baseExpenses - prevExpense) / prevExpense) * 100 : 0;
    const incomeChange = prevIncome > 0 ? ((baseIncome - prevIncome) / prevIncome) * 100 : 0;

    // Total budget
    const totalBudget = Object.values(safeBudgets).reduce((sum, b) => sum + b, 0);
    const totalBudgetSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const budgetUsage = totalBudget > 0 ? (totalBudgetSpent / totalBudget) * 100 : 0;

    return {
      totalIncome, totalExpenses, balance, savingsRate,
      baseIncome, baseExpenses, recurringIncome, recurringExpense,
      topCategories, budgetStatus, exceededBudgets, warningBudgets,
      goalsStatus, activeGoals, completedGoals,
      expenseChange, incomeChange,
      totalBudget, totalBudgetSpent, budgetUsage,
      transactionCount: monthExpenses.length + monthIncomes.length,
      avgDailyExpense: monthExpenses.length > 0 ? baseExpenses / now.getDate() : 0,
    };
  }, [safeExpenses, safeIncomes, safeGoals, safeBudgets, safeRecurring]);

  // Generate smart alerts
  const smartAlerts = useMemo((): SmartAlert[] => {
    const alerts: SmartAlert[] = [];
    const fmt = (n: number) => formatCurrency(n, currency);

    // Balance alerts
    if (ctx.balance < 0) {
      alerts.push({
        type: 'danger',
        icon: '🚨',
        title: 'Déficit Financiero',
        message: `Estás gastando ${fmt(Math.abs(ctx.balance))} más de lo que ganas este mes.`,
      });
    } else if (ctx.savingsRate < 10) {
      alerts.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Ahorro Bajo',
        message: `Solo estás ahorrando ${ctx.savingsRate.toFixed(1)}%. La meta es 20%.`,
      });
    } else if (ctx.savingsRate >= 20) {
      alerts.push({
        type: 'success',
        icon: '🎉',
        title: '¡Excelente Ahorro!',
        message: `Estás ahorrando ${ctx.savingsRate.toFixed(1)}% de tus ingresos.`,
      });
    }

    // Budget alerts
    ctx.exceededBudgets.forEach(b => {
      alerts.push({
        type: 'danger',
        icon: '🔴',
        title: `Presupuesto Excedido: ${b.category}`,
        message: `Gastaste ${fmt(b.spent)} de ${fmt(b.limit)} (${b.percentage.toFixed(0)}%)`,
      });
    });

    // Goal achievements
    ctx.completedGoals.forEach(g => {
      alerts.push({
        type: 'success',
        icon: '🏆',
        title: `¡Meta Completada!`,
        message: `"${g.name}" - ${fmt(g.current)}`,
      });
    });

    // Expense increase warning
    if (ctx.expenseChange > 20) {
      alerts.push({
        type: 'warning',
        icon: '📈',
        title: 'Gastos en Aumento',
        message: `Tus gastos aumentaron ${ctx.expenseChange.toFixed(0)}% vs mes anterior.`,
      });
    }

    return alerts.slice(0, 5);
  }, [ctx, currency]);

  // Intelligent response generator
  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    const fmt = (n: number) => formatCurrency(n, currency);

    // RESUMEN COMPLETO
    if (msg.includes('resumen') || msg.includes('situación') || msg.includes('cómo estoy') || msg.includes('como estoy')) {
      let response = `## 📊 Tu Resumen Financiero\n\n`;
      response += `**💰 Balance del Mes:**\n`;
      response += `• Ingresos: ${fmt(ctx.totalIncome)}\n`;
      response += `• Gastos: ${fmt(ctx.totalExpenses)}\n`;
      response += `• Balance: ${fmt(ctx.balance)} ${ctx.balance >= 0 ? '✅' : '❌'}\n`;
      response += `• Tasa de ahorro: ${ctx.savingsRate.toFixed(1)}%\n\n`;

      if (ctx.recurringIncome > 0 || ctx.recurringExpense > 0) {
        response += `**🔄 Transacciones Fijas (mensual):**\n`;
        response += `• Ingresos fijos: ${fmt(ctx.recurringIncome)}\n`;
        response += `• Gastos fijos: ${fmt(ctx.recurringExpense)}\n\n`;
      }

      if (ctx.totalBudget > 0) {
        response += `**📋 Presupuesto:**\n`;
        response += `• Uso: ${fmt(ctx.totalBudgetSpent)} de ${fmt(ctx.totalBudget)} (${ctx.budgetUsage.toFixed(0)}%)\n`;
        response += `• Disponible: ${fmt(ctx.totalBudget - ctx.totalBudgetSpent)}\n`;
        if (ctx.exceededBudgets.length > 0) {
          response += `• ⚠️ ${ctx.exceededBudgets.length} categoría(s) excedida(s)\n`;
        }
        response += '\n';
      }

      if (ctx.activeGoals.length > 0) {
        response += `**🎯 Metas Activas:** ${ctx.activeGoals.length}\n`;
        ctx.activeGoals.slice(0, 3).forEach(g => {
          response += `• ${g.name}: ${g.progress.toFixed(0)}% (${fmt(g.current)}/${fmt(g.target)})\n`;
        });
      }

      return response;
    }

    // CONSEJOS PERSONALIZADOS
    if (msg.includes('consejo') || msg.includes('mejorar') || msg.includes('tips') || msg.includes('ayuda')) {
      let response = `## 💡 Consejos Personalizados\n\n`;

      // Basado en tasa de ahorro
      if (ctx.savingsRate < 0) {
        response += `**🚨 Prioridad Urgente: Reducir Gastos**\n`;
        response += `Estás en déficit de ${fmt(Math.abs(ctx.balance))}. Acciones:\n`;
        response += `1. Revisa gastos no esenciales inmediatamente\n`;
        response += `2. Cancela suscripciones innecesarias\n`;
        response += `3. Reduce ${ctx.topCategories[0]?.category || 'tu mayor gasto'} un 30%\n\n`;
      } else if (ctx.savingsRate < 10) {
        response += `**⚠️ Aumentar Ahorro**\n`;
        const needed = ctx.totalIncome * 0.2 - ctx.balance;
        response += `Para llegar al 20% recomendado, necesitas ahorrar ${fmt(needed)} más.\n\n`;
        response += `**Sugerencias:**\n`;
        if (ctx.topCategories.length > 0) {
          const top = ctx.topCategories[0];
          response += `• Reduce ${top.category} (${top.percentage.toFixed(0)}% de gastos): ahorra ${fmt(top.amount * 0.2)}\n`;
        }
      } else if (ctx.savingsRate >= 20) {
        response += `**✅ ¡Vas muy bien!**\n`;
        response += `Tu ahorro del ${ctx.savingsRate.toFixed(1)}% es excelente.\n\n`;
        response += `**Siguiente nivel:**\n`;
        response += `• Considera invertir tu excedente de ${fmt(ctx.balance)}\n`;
        response += `• Aumenta aportes a tus metas\n`;
        response += `• Crea un fondo de emergencia (3-6 meses de gastos)\n\n`;
      }

      // Consejos de presupuesto
      if (ctx.exceededBudgets.length > 0) {
        response += `**📋 Presupuestos a Ajustar:**\n`;
        ctx.exceededBudgets.forEach(b => {
          response += `• ${b.category}: excedido por ${fmt(b.spent - b.limit)}\n`;
        });
      }

      return response;
    }

    // ANÁLISIS DE GASTOS
    if (msg.includes('gasto') || msg.includes('gastar') || msg.includes('analiz') || msg.includes('donde') || msg.includes('dónde')) {
      let response = `## 💸 Análisis de Gastos\n\n`;
      response += `**Total gastado este mes:** ${fmt(ctx.totalExpenses)}\n`;
      response += `**Promedio diario:** ${fmt(ctx.avgDailyExpense)}\n\n`;

      if (ctx.topCategories.length > 0) {
        response += `**Top 5 Categorías:**\n`;
        ctx.topCategories.slice(0, 5).forEach((cat, i) => {
          const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i];
          response += `${emoji} **${cat.category}**: ${fmt(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
        });
        response += '\n';

        const top = ctx.topCategories[0];
        if (top && top.percentage > 30) {
          response += `**💡 Observación:** ${top.category} representa el ${top.percentage.toFixed(0)}% de tus gastos. `;
          response += `Si reduces un 20%, ahorras ${fmt(top.amount * 0.2)}/mes.\n`;
        }
      }

      // Comparación con mes anterior
      if (Math.abs(ctx.expenseChange) > 5) {
        response += `\n**📈 vs Mes Anterior:** `;
        if (ctx.expenseChange > 0) {
          response += `Gastos ↑ ${ctx.expenseChange.toFixed(0)}% (gastando más)\n`;
        } else {
          response += `Gastos ↓ ${Math.abs(ctx.expenseChange).toFixed(0)}% (¡bien hecho!)\n`;
        }
      }

      return response;
    }

    // METAS
    if (msg.includes('meta') || msg.includes('objetivo') || msg.includes('ahorro') || msg.includes('progreso')) {
      let response = `## 🎯 Estado de Metas\n\n`;

      if (ctx.goalsStatus.length === 0) {
        response += `No tienes metas configuradas.\n\n`;
        response += `**¿Por qué crear metas?**\n`;
        response += `• Te mantienen motivado\n`;
        response += `• Miden tu progreso\n`;
        response += `• Dan propósito a tu ahorro\n\n`;
        response += `Ve a **Metas** para crear tu primera meta.`;
        return response;
      }

      // Completadas
      if (ctx.completedGoals.length > 0) {
        response += `**🏆 Metas Completadas (${ctx.completedGoals.length}):**\n`;
        ctx.completedGoals.forEach(g => {
          response += `• ✅ ${g.name}: ${fmt(g.current)}\n`;
        });
        response += '\n';
      }

      // En progreso
      if (ctx.activeGoals.length > 0) {
        response += `**📈 En Progreso (${ctx.activeGoals.length}):**\n`;
        ctx.activeGoals.forEach(g => {
          const emoji = g.progress >= 75 ? '🟢' : g.progress >= 50 ? '🟡' : '🔴';
          response += `${emoji} **${g.name}**\n`;
          response += `   Progreso: ${g.progress.toFixed(0)}% (${fmt(g.current)}/${fmt(g.target)})\n`;
          response += `   Falta: ${fmt(g.remaining)}\n`;
          if (g.remaining > 0 && ctx.balance > 0) {
            const monthsNeeded = Math.ceil(g.remaining / ctx.balance);
            response += `   A este ritmo: ~${monthsNeeded} mes(es)\n`;
          }
          response += '\n';
        });
      }

      return response;
    }

    // PROYECCIÓN
    if (msg.includes('proyec') || msg.includes('futuro') || msg.includes('6 meses') || msg.includes('predicción')) {
      let response = `## 📈 Proyección Financiera\n\n`;
      response += `**Basado en tu balance mensual de ${fmt(ctx.balance)}:**\n\n`;

      if (ctx.balance > 0) {
        response += `**Proyección de Ahorro:**\n`;
        response += `• En 3 meses: +${fmt(ctx.balance * 3)}\n`;
        response += `• En 6 meses: +${fmt(ctx.balance * 6)}\n`;
        response += `• En 1 año: +${fmt(ctx.balance * 12)}\n\n`;

        if (ctx.activeGoals.length > 0) {
          response += `**Tiempo estimado para metas:**\n`;
          ctx.activeGoals.slice(0, 3).forEach(g => {
            if (g.remaining > 0) {
              const months = Math.ceil(g.remaining / ctx.balance);
              response += `• ${g.name}: ~${months} mes(es)\n`;
            }
          });
        }
      } else {
        response += `⚠️ **Alerta:** Con un déficit de ${fmt(Math.abs(ctx.balance))}/mes:\n\n`;
        response += `• En 3 meses: -${fmt(Math.abs(ctx.balance) * 3)}\n`;
        response += `• En 6 meses: -${fmt(Math.abs(ctx.balance) * 6)}\n\n`;
        response += `**Necesitas reducir gastos urgentemente.**\n`;
      }

      return response;
    }

    // ALERTAS
    if (msg.includes('alerta') || msg.includes('problema') || msg.includes('crítico')) {
      let response = `## ⚠️ Alertas y Problemas\n\n`;

      if (smartAlerts.length === 0) {
        response += `✅ **¡Todo en orden!** No hay alertas críticas.\n\n`;
        response += `Tu situación financiera es estable.`;
        return response;
      }

      smartAlerts.forEach(alert => {
        const typeIcon = alert.type === 'danger' ? '🔴' : alert.type === 'warning' ? '🟡' : alert.type === 'success' ? '🟢' : 'ℹ️';
        response += `${typeIcon} **${alert.title}**\n`;
        response += `   ${alert.message}\n\n`;
      });

      return response;
    }

    // PRESUPUESTO
    if (msg.includes('presupuesto') || msg.includes('límite') || msg.includes('budget')) {
      let response = `## 📋 Estado de Presupuestos\n\n`;

      if (ctx.totalBudget === 0) {
        response += `No tienes presupuestos configurados.\n\n`;
        response += `**Recomendación (Regla 50/30/20):**\n`;
        const income = ctx.totalIncome || 1000;
        response += `• Necesidades (50%): ${fmt(income * 0.5)}\n`;
        response += `• Deseos (30%): ${fmt(income * 0.3)}\n`;
        response += `• Ahorro (20%): ${fmt(income * 0.2)}\n`;
        return response;
      }

      response += `**Resumen:**\n`;
      response += `• Total presupuestado: ${fmt(ctx.totalBudget)}\n`;
      response += `• Usado: ${fmt(ctx.totalBudgetSpent)} (${ctx.budgetUsage.toFixed(0)}%)\n`;
      response += `• Disponible: ${fmt(ctx.totalBudget - ctx.totalBudgetSpent)}\n\n`;

      response += `**Por Categoría:**\n`;
      ctx.budgetStatus.forEach(b => {
        const status = b.percentage >= 100 ? '🔴' : b.percentage >= 80 ? '🟡' : '🟢';
        response += `${status} **${b.category}**: ${fmt(b.spent)}/${fmt(b.limit)} (${b.percentage.toFixed(0)}%)\n`;
      });

      return response;
    }

    // DEFAULT - Resumen rápido
    return `## 📊 Tu Situación Actual\n\n` +
      `• **Ingresos:** ${fmt(ctx.totalIncome)}\n` +
      `• **Gastos:** ${fmt(ctx.totalExpenses)}\n` +
      `• **Balance:** ${fmt(ctx.balance)} ${ctx.balance >= 0 ? '✅' : '❌'}\n` +
      `• **Tasa de ahorro:** ${ctx.savingsRate.toFixed(1)}%\n` +
      `• **Metas activas:** ${ctx.activeGoals.length}\n\n` +
      `**¿Qué quieres saber?**\n` +
      `• "Dame consejos" - Tips personalizados\n` +
      `• "Analiza mis gastos" - Desglose detallado\n` +
      `• "Cómo van mis metas" - Progreso de ahorro\n` +
      `• "Muestra alertas" - Problemas detectados`;
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = `¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋\n\n` +
        `Soy tu **asesor financiero inteligente**. Analizo tus datos en tiempo real.\n\n` +
        `**Tu resumen rápido:**\n` +
        `• Balance: ${formatCurrency(ctx.balance, currency)}\n` +
        `• Tasa de ahorro: ${ctx.savingsRate.toFixed(1)}%\n` +
        `• Metas activas: ${ctx.activeGoals.length}\n\n` +
        `¿En qué te puedo ayudar?`;

      setMessages([{
        id: '1',
        role: 'assistant',
        content: welcomeMsg,
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Handle send
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    const response = generateResponse(userMessage.content);
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Render message with markdown-like formatting
  const renderMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-lg font-bold text-white mt-2 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-white mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-white/90">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
          </p>
        );
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <p key={i} className="text-white/80 ml-2">{line}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-white/80">{line}</p>;
    });
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 justify-center">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`, boxShadow: `0 0 20px ${themeColors.primary}40` }}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Asesor Financiero
              <Sparkles className="w-5 h-5" style={{ color: themeColors.primary }} />
            </h1>
            <p className="text-sm text-white/60">Análisis inteligente en tiempo real</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAlerts(!showAlerts)} leftIcon={<AlertCircle className="w-4 h-4" />}>
          {smartAlerts.length}
        </Button>
      </div>

      {/* Smart Alerts */}
      <AnimatePresence>
        {showAlerts && smartAlerts.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-2">
            {smartAlerts.slice(0, 3).map((alert, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
                className={cn('p-3 rounded-xl border flex items-center gap-3',
                  alert.type === 'danger' && 'bg-danger-500/10 border-danger-500/30',
                  alert.type === 'warning' && 'bg-warning-500/10 border-warning-500/30',
                  alert.type === 'success' && 'bg-success-500/10 border-success-500/30',
                  alert.type === 'info' && 'bg-primary-500/10 border-primary-500/30')}>
                <span className="text-xl">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{alert.title}</p>
                  <p className="text-xs text-white/60 truncate">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColors.primary}20` }}>
                  <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
                </div>
              )}
              <div className={cn('max-w-[85%] p-3 rounded-2xl', msg.role === 'user' ? 'rounded-br-md' : 'bg-white/5 rounded-bl-md')}
                style={msg.role === 'user' ? { background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)` } : {}}>
                {renderMessage(msg.content)}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
              </div>
              <div className="bg-white/5 p-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_ACTIONS.map(action => (
              <button key={action.id} onClick={() => { setInput(action.message); setTimeout(handleSend, 100); }}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm">
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre tus finanzas..." className="flex-1 px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none" disabled={isTyping} />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-4" style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AssistantPage;
