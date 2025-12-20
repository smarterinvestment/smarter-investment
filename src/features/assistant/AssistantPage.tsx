// ============================================
// 🤖 ASSISTANT PAGE v21 - Intelligent Financial Advisor
// Real-time analysis with smart responses
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, AlertCircle, Loader2, TrendingUp, TrendingDown, Target, PiggyBank, RefreshCw, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';

// Quick Actions
const QUICK_ACTIONS = [
  { id: '1', icon: '📊', label: 'Resumen', query: 'resumen' },
  { id: '2', icon: '💡', label: 'Consejos', query: 'consejos' },
  { id: '3', icon: '💰', label: 'Gastos', query: 'gastos' },
  { id: '4', icon: '🎯', label: 'Metas', query: 'metas' },
  { id: '5', icon: '📈', label: 'Proyección', query: 'proyeccion' },
  { id: '6', icon: '⚠️', label: 'Alertas', query: 'alertas' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Alert {
  type: 'danger' | 'warning' | 'success' | 'info';
  icon: string;
  title: string;
  message: string;
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

  // Calculate financial context
  const ctx = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month data
    const currentExpenses = safeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const currentIncomes = safeIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Last month data
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

    // Recurring monthly
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

    const effectiveIncome = totalIncome + recurringIncome;
    const effectiveExpenses = totalExpenses + recurringExpense;
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
      .map(([name, amount]) => ({ name, amount, percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0 }));

    // Budget status
    const budgetAlerts: Array<{ category: string; percentage: number; status: string }> = [];
    Object.entries(safeBudgets).forEach(([cat, limit]) => {
      const spent = categoryTotals[cat] || 0;
      const pct = Number(limit) > 0 ? (spent / Number(limit)) * 100 : 0;
      if (pct >= 80) {
        budgetAlerts.push({ category: cat, percentage: pct, status: pct >= 100 ? 'exceeded' : 'warning' });
      }
    });

    // Goals status
    const goalsStatus = safeGoals.map(g => ({
      name: g.name,
      current: Number(g.currentAmount) || 0,
      target: Number(g.targetAmount) || 1,
      percentage: Math.min(((Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1)) * 100, 100),
      remaining: Math.max((Number(g.targetAmount) || 0) - (Number(g.currentAmount) || 0), 0)
    }));

    // Changes vs last month
    const expenseChange = lastTotalExpenses > 0 
      ? ((totalExpenses - lastTotalExpenses) / lastTotalExpenses) * 100 
      : 0;
    const incomeChange = lastTotalIncome > 0 
      ? ((totalIncome - lastTotalIncome) / lastTotalIncome) * 100 
      : 0;

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
      daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate(),
      currentDay: now.getDate(),
      avgDailyExpense: totalExpenses / (now.getDate() || 1),
    };
  }, [safeExpenses, safeIncomes, safeGoals, safeBudgets, safeRecurring]);

  // Generate smart alerts
  const alerts = useMemo(() => {
    const alertList: Alert[] = [];

    if (ctx.balance < 0) {
      alertList.push({
        type: 'danger',
        icon: '🚨',
        title: 'Déficit',
        message: `Estás gastando más de lo que ganas. Déficit: ${formatCurrency(Math.abs(ctx.balance), currency)}`
      });
    }

    if (ctx.savingsRate < 10 && ctx.savingsRate >= 0) {
      alertList.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Ahorro Bajo',
        message: `Tu tasa de ahorro es ${ctx.savingsRate.toFixed(1)}%. Se recomienda al menos 20%.`
      });
    }

    ctx.budgetAlerts.forEach(b => {
      alertList.push({
        type: b.status === 'exceeded' ? 'danger' : 'warning',
        icon: b.status === 'exceeded' ? '🔴' : '🟡',
        title: `${b.category}`,
        message: `${b.percentage.toFixed(0)}% del presupuesto usado`
      });
    });

    if (ctx.expenseChange > 20) {
      alertList.push({
        type: 'warning',
        icon: '📈',
        title: 'Gastos Aumentaron',
        message: `Tus gastos subieron ${ctx.expenseChange.toFixed(0)}% vs mes anterior`
      });
    }

    ctx.goalsStatus.filter(g => g.percentage >= 90 && g.percentage < 100).forEach(g => {
      alertList.push({
        type: 'info',
        icon: '🎯',
        title: `Meta "${g.name}"`,
        message: `¡Casi lo logras! ${g.percentage.toFixed(0)}% completado`
      });
    });

    ctx.goalsStatus.filter(g => g.percentage >= 100).forEach(g => {
      alertList.push({
        type: 'success',
        icon: '🎉',
        title: `Meta "${g.name}"`,
        message: '¡Felicidades! Meta completada'
      });
    });

    return alertList;
  }, [ctx, currency]);

  // Generate intelligent response
  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();

    // RESUMEN
    if (q.includes('resumen') || q.includes('general') || q.includes('hola') || q.includes('como')) {
      let response = `## 📊 Tu Resumen Financiero\n\n`;
      response += `**Ingresos:** ${formatCurrency(ctx.effectiveIncome, currency)}\n`;
      response += `**Gastos:** ${formatCurrency(ctx.effectiveExpenses, currency)}\n`;
      response += `**Balance:** ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🚨'}\n`;
      response += `**Tasa de Ahorro:** ${ctx.savingsRate.toFixed(1)}%\n\n`;
      
      if (ctx.topCategories.length > 0) {
        response += `### 🏆 Top Gastos\n`;
        ctx.topCategories.slice(0, 3).forEach((c, i) => {
          response += `${i + 1}. ${c.name}: ${formatCurrency(c.amount, currency)} (${c.percentage.toFixed(0)}%)\n`;
        });
      }

      if (alerts.length > 0) {
        response += `\n### ⚠️ ${alerts.length} Alerta(s) Activa(s)\n`;
      }

      return response;
    }

    // CONSEJOS
    if (q.includes('consejo') || q.includes('tip') || q.includes('mejora') || q.includes('recomen')) {
      let response = `## 💡 Consejos Personalizados\n\n`;

      if (ctx.savingsRate < 0) {
        response += `🚨 **Urgente: Reduce gastos**\n`;
        response += `Estás en déficit. Acciones inmediatas:\n`;
        response += `• Revisa ${ctx.topCategories[0]?.name || 'tu mayor gasto'} (${formatCurrency(ctx.topCategories[0]?.amount || 0, currency)})\n`;
        response += `• Elimina gastos no esenciales\n`;
        response += `• Busca ingresos adicionales\n\n`;
      } else if (ctx.savingsRate < 10) {
        const needed = ctx.effectiveIncome * 0.20 - ctx.balance;
        response += `⚠️ **Aumenta tu ahorro**\n`;
        response += `Para llegar al 20% ideal, necesitas ahorrar ${formatCurrency(needed, currency)} más.\n\n`;
        response += `**Sugerencias:**\n`;
        response += `• Reduce ${ctx.topCategories[0]?.name || 'gastos principales'} un 20%\n`;
        response += `• Automatiza transferencias a ahorro\n`;
        response += `• Revisa suscripciones innecesarias\n\n`;
      } else if (ctx.savingsRate >= 20) {
        response += `✅ **¡Excelente trabajo!**\n`;
        response += `Tu tasa de ahorro de ${ctx.savingsRate.toFixed(1)}% está por encima del promedio.\n\n`;
        response += `**Siguiente nivel:**\n`;
        response += `• Considera invertir el excedente\n`;
        response += `• Acelera el pago de deudas si tienes\n`;
        response += `• Aumenta tus metas de ahorro\n\n`;
      }

      // Budget advice
      if (ctx.budgetAlerts.length > 0) {
        response += `### 🎯 Presupuestos en Riesgo\n`;
        ctx.budgetAlerts.forEach(b => {
          response += `• **${b.category}**: ${b.percentage.toFixed(0)}% usado - ${b.status === 'exceeded' ? 'EXCEDIDO' : 'Cuidado'}\n`;
        });
      }

      return response;
    }

    // GASTOS
    if (q.includes('gasto') || q.includes('expense') || q.includes('gast')) {
      let response = `## 💸 Análisis de Gastos\n\n`;
      response += `**Total este mes:** ${formatCurrency(ctx.totalExpenses, currency)}\n`;
      response += `**Promedio diario:** ${formatCurrency(ctx.avgDailyExpense, currency)}\n`;
      
      if (ctx.expenseChange !== 0) {
        response += `**vs Mes anterior:** ${ctx.expenseChange > 0 ? '+' : ''}${ctx.expenseChange.toFixed(1)}% ${ctx.expenseChange > 0 ? '📈' : '📉'}\n`;
      }

      if (ctx.topCategories.length > 0) {
        response += `\n### 📊 Distribución\n`;
        ctx.topCategories.forEach((c, i) => {
          const bar = '█'.repeat(Math.round(c.percentage / 10)) + '░'.repeat(10 - Math.round(c.percentage / 10));
          response += `${c.name}: ${bar} ${c.percentage.toFixed(0)}%\n`;
        });
      }

      if (ctx.recurringExpense > 0) {
        response += `\n### 🔄 Gastos Recurrentes\n`;
        response += `${formatCurrency(ctx.recurringExpense, currency)}/mes en gastos fijos\n`;
      }

      return response;
    }

    // METAS
    if (q.includes('meta') || q.includes('goal') || q.includes('objetivo')) {
      if (ctx.goalsStatus.length === 0) {
        return `## 🎯 Metas de Ahorro\n\nNo tienes metas configuradas.\n\n**Sugerencia:** Crea metas para:\n• Fondo de emergencias (3-6 meses de gastos)\n• Vacaciones\n• Compras importantes`;
      }

      let response = `## 🎯 Progreso de Metas\n\n`;
      ctx.goalsStatus.forEach(g => {
        const bar = '█'.repeat(Math.round(g.percentage / 10)) + '░'.repeat(10 - Math.round(g.percentage / 10));
        response += `**${g.name}**\n`;
        response += `${bar} ${g.percentage.toFixed(0)}%\n`;
        response += `${formatCurrency(g.current, currency)} / ${formatCurrency(g.target, currency)}\n`;
        if (g.remaining > 0 && ctx.balance > 0) {
          const months = Math.ceil(g.remaining / ctx.balance);
          response += `⏱️ ~${months} mes(es) para completar\n`;
        }
        response += `\n`;
      });

      return response;
    }

    // PROYECCIÓN
    if (q.includes('proyec') || q.includes('futuro') || q.includes('estimad')) {
      const monthlyBalance = ctx.balance;
      const proj3 = monthlyBalance * 3;
      const proj6 = monthlyBalance * 6;
      const proj12 = monthlyBalance * 12;

      let response = `## 📈 Proyección Financiera\n\n`;
      response += `Basado en tu balance actual de ${formatCurrency(monthlyBalance, currency)}/mes:\n\n`;
      response += `| Período | Proyección |\n`;
      response += `|---------|------------|\n`;
      response += `| 3 meses | ${formatCurrency(proj3, currency)} |\n`;
      response += `| 6 meses | ${formatCurrency(proj6, currency)} |\n`;
      response += `| 12 meses | ${formatCurrency(proj12, currency)} |\n\n`;

      if (monthlyBalance > 0) {
        response += `✅ A este ritmo, en 1 año tendrás ${formatCurrency(proj12, currency)} ahorrados.\n`;
      } else {
        response += `🚨 A este ritmo, acumularás ${formatCurrency(Math.abs(proj12), currency)} en deuda.\n`;
      }

      return response;
    }

    // ALERTAS
    if (q.includes('alert') || q.includes('problema') || q.includes('aviso')) {
      if (alerts.length === 0) {
        return `## ✅ Sin Alertas\n\n¡Todo está bajo control! No hay alertas activas.\n\nSigue así y mantén tus buenos hábitos financieros.`;
      }

      let response = `## ⚠️ Alertas Activas (${alerts.length})\n\n`;
      alerts.forEach(a => {
        response += `### ${a.icon} ${a.title}\n${a.message}\n\n`;
      });

      return response;
    }

    // PRESUPUESTO
    if (q.includes('presupuesto') || q.includes('budget')) {
      let response = `## 💰 Estado de Presupuestos\n\n`;
      
      if (Object.keys(safeBudgets).length === 0) {
        response += `No tienes presupuestos configurados.\n\n**Regla 50/30/20:**\n`;
        response += `• 50% Necesidades: ${formatCurrency(ctx.effectiveIncome * 0.5, currency)}\n`;
        response += `• 30% Deseos: ${formatCurrency(ctx.effectiveIncome * 0.3, currency)}\n`;
        response += `• 20% Ahorro: ${formatCurrency(ctx.effectiveIncome * 0.2, currency)}\n`;
      } else {
        Object.entries(safeBudgets).forEach(([cat, limit]) => {
          const spent = ctx.topCategories.find(c => c.name === cat)?.amount || 0;
          const pct = Number(limit) > 0 ? (spent / Number(limit)) * 100 : 0;
          const status = pct >= 100 ? '🔴' : pct >= 80 ? '🟡' : '🟢';
          response += `${status} **${cat}**: ${formatCurrency(spent, currency)} / ${formatCurrency(Number(limit), currency)} (${pct.toFixed(0)}%)\n`;
        });
      }

      return response;
    }

    // Default response
    return `## 🤖 Asistente Financiero\n\nPuedo ayudarte con:\n\n• **"Resumen"** - Tu situación financiera actual\n• **"Consejos"** - Recomendaciones personalizadas\n• **"Gastos"** - Análisis detallado de gastos\n• **"Metas"** - Progreso de tus objetivos\n• **"Proyección"** - Estimaciones futuras\n• **"Alertas"** - Problemas detectados\n• **"Presupuesto"** - Estado de límites\n\n¿En qué te puedo ayudar?`;
  };

  // Handle send message
  const handleSend = async (query?: string) => {
    const text = query || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
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
        content: `## 👋 ¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}!\n\nSoy tu asistente financiero inteligente. Analizo tus datos en tiempo real para darte consejos personalizados.\n\n**Estado Actual:**\n• Balance: ${formatCurrency(ctx.balance, currency)} ${ctx.balance >= 0 ? '✅' : '🚨'}\n• Tasa de ahorro: ${ctx.savingsRate.toFixed(1)}%\n${alerts.length > 0 ? `• ${alerts.length} alerta(s) activa(s) ⚠️` : '• Sin alertas ✅'}\n\n¿En qué puedo ayudarte?`,
        timestamp: new Date()
      };
      setMessages([welcome]);
    }
  }, []);

  // Render message content with markdown-like formatting
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-white mt-2 mb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-semibold text-white/90 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-white">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('• ')) {
        return <p key={i} className="text-white/80 pl-2">{line}</p>;
      }
      if (line.startsWith('|')) {
        return <p key={i} className="text-white/70 font-mono text-sm">{line}</p>;
      }
      if (line.includes('**')) {
        const parts = line.split(/\*\*/);
        return (
          <p key={i} className="text-white/80">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      }
      return <p key={i} className="text-white/80">{line}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Bot className="w-6 h-6" style={{ color: themeColors.primary }} />
          Asistente Financiero
        </h1>
        <p className="text-white/60 text-sm">Análisis inteligente en tiempo real</p>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="px-4 mb-2">
          <Card className="p-3 bg-warning-500/10 border-warning-500/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-400" />
              <span className="text-sm text-warning-400 font-medium">
                {alerts.length} alerta{alerts.length > 1 ? 's' : ''} activa{alerts.length > 1 ? 's' : ''}
              </span>
              <Button 
                size="sm" 
                variant="secondary" 
                className="ml-auto"
                onClick={() => handleSend('alertas')}
              >
                Ver
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_ACTIONS.map(action => (
            <Button
              key={action.id}
              size="sm"
              variant="secondary"
              onClick={() => handleSend(action.query)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[85%] rounded-2xl p-4',
                msg.role === 'user' 
                  ? 'bg-primary-500/20 text-white rounded-br-md' 
                  : 'bg-white/5 rounded-bl-md'
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
                    <span className="text-xs text-white/50">Asistente</span>
                  </div>
                )}
                <div className="space-y-1">
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
            <div className="bg-white/5 rounded-2xl rounded-bl-md p-4">
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
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
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
