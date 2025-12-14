// ============================================
// 🤖 ASSISTANT PAGE - SMART AI ASSISTANT
// Intelligent responses with financial analysis
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X, Loader2, AlertCircle, CheckCircle, Zap, TrendingUp, TrendingDown, PiggyBank, Target, RefreshCw } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import type { ChatMessage } from '../../types';

// Quick Actions
const QUICK_ACTIONS = [
  { id: '1', icon: '💡', label: 'Consejos', message: '¿Qué consejos me das para ahorrar más?' },
  { id: '2', icon: '📊', label: 'Analizar', message: 'Analiza mis gastos de este mes' },
  { id: '3', icon: '🎯', label: 'Metas', message: '¿Cómo van mis metas de ahorro?' },
  { id: '4', icon: '💰', label: 'Reducir', message: '¿Dónde puedo reducir gastos?' },
  { id: '5', icon: '📈', label: 'Proyección', message: '¿Cómo estarán mis finanzas en 3 meses?' },
  { id: '6', icon: '🏠', label: 'Presupuesto', message: '¿Cómo distribuir mi presupuesto?' },
];

// Smart Alert Types
interface SmartAlert {
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  message: string;
  icon: string;
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

  // Calculate financial context
  const financialContext = useMemo(() => {
    const totalIncome = safeIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = safeExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Add recurring to totals
    const activeRecurring = safeRecurring.filter(r => r.isActive);
    const monthlyRecurringIncome = activeRecurring
      .filter(r => r.type === 'income')
      .reduce((sum, r) => {
        const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
        return sum + r.amount * mult;
      }, 0);
    const monthlyRecurringExpense = activeRecurring
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => {
        const mult = r.frequency === 'daily' ? 30 : r.frequency === 'weekly' ? 4 : r.frequency === 'biweekly' ? 2 : r.frequency === 'yearly' ? 1/12 : 1;
        return sum + r.amount * mult;
      }, 0);

    const adjustedIncome = totalIncome + monthlyRecurringIncome;
    const adjustedExpenses = totalExpenses + monthlyRecurringExpense;
    const balance = adjustedIncome - adjustedExpenses;
    const savingsRate = adjustedIncome > 0 ? (balance / adjustedIncome) * 100 : 0;

    // Top categories
    const categoryTotals: Record<string, number> = {};
    safeExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: adjustedExpenses > 0 ? (amount / adjustedExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Budget status
    const budgetStatus = Object.entries(safeBudgets).map(([category, limit]) => {
      const spent = categoryTotals[category] || 0;
      return {
        category,
        limit,
        spent,
        percentage: limit > 0 ? (spent / limit) * 100 : 0
      };
    });

    // Goals status
    const goalsStatus = safeGoals.map(goal => ({
      name: goal.name,
      target: Number(goal.targetAmount) || 0,
      current: Number(goal.currentAmount) || 0,
      progress: (Number(goal.targetAmount) || 0) > 0 
        ? ((Number(goal.currentAmount) || 0) / (Number(goal.targetAmount) || 0)) * 100 
        : 0,
      deadline: goal.deadline
    }));

    return {
      totalIncome: adjustedIncome,
      totalExpenses: adjustedExpenses,
      balance,
      savingsRate,
      topCategories,
      budgets: budgetStatus,
      goals: goalsStatus,
      recurringIncome: monthlyRecurringIncome,
      recurringExpense: monthlyRecurringExpense,
      currency,
    };
  }, [safeExpenses, safeIncomes, safeGoals, safeBudgets, safeRecurring, currency]);

  // Generate smart alerts
  const smartAlerts = useMemo((): SmartAlert[] => {
    const alerts: SmartAlert[] = [];
    const { savingsRate, budgets, goals, topCategories, balance } = financialContext;

    // Savings rate alerts
    if (savingsRate < 0) {
      alerts.push({
        type: 'danger',
        title: '⚠️ Gastos superan ingresos',
        message: `Este mes estás gastando más de lo que ganas (${formatCurrency(Math.abs(balance), currency)})`,
        icon: '🔴'
      });
    } else if (savingsRate < 10) {
      alerts.push({
        type: 'warning',
        title: '💡 Ahorro bajo',
        message: `Tu tasa de ahorro es ${savingsRate.toFixed(1)}%. Intenta llegar al 20%`,
        icon: '🟡'
      });
    } else if (savingsRate >= 20) {
      alerts.push({
        type: 'success',
        title: '🎉 ¡Excelente ahorro!',
        message: `Estás ahorrando ${savingsRate.toFixed(1)}% de tus ingresos`,
        icon: '🟢'
      });
    }

    // Budget alerts
    budgets.forEach(b => {
      if (b.percentage >= 100) {
        alerts.push({
          type: 'danger',
          title: `🔴 ${b.category} excedido`,
          message: `Has gastado ${formatCurrency(b.spent, currency)} de ${formatCurrency(b.limit, currency)}`,
          icon: '🔴'
        });
      } else if (b.percentage >= 80) {
        alerts.push({
          type: 'warning',
          title: `🟡 ${b.category} casi agotado`,
          message: `${b.percentage.toFixed(0)}% usado`,
          icon: '🟡'
        });
      }
    });

    // Goal progress
    goals.forEach(g => {
      if (g.progress >= 100) {
        alerts.push({
          type: 'success',
          title: `🏆 ¡Meta alcanzada!`,
          message: `"${g.name}" completada`,
          icon: '🏆'
        });
      } else if (g.progress >= 75) {
        alerts.push({
          type: 'info',
          title: `🚀 Meta casi lista`,
          message: `"${g.name}" al ${g.progress.toFixed(0)}%`,
          icon: '🚀'
        });
      }
    });

    return alerts.slice(0, 5);
  }, [financialContext, currency]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋\n\nSoy tu asistente financiero personal. Analizo tus datos en tiempo real para darte consejos personalizados.\n\n**Tu resumen rápido:**\n• Balance: ${formatCurrency(financialContext.balance, currency)}\n• Tasa de ahorro: ${financialContext.savingsRate.toFixed(1)}%\n• Metas activas: ${financialContext.goals.filter(g => g.progress < 100).length}\n\n¿En qué te puedo ayudar hoy?`,
        timestamp: new Date(),
      }]);
    }
  }, []);

  // Generate AI response
  const generateResponse = (userMessage: string): string => {
    const ctx = financialContext;
    const msg = userMessage.toLowerCase();
    const fmt = (n: number) => formatCurrency(n, currency);

    // Análisis de gastos
    if (msg.includes('gasto') || msg.includes('gastar') || msg.includes('analiz')) {
      let response = `📊 **Análisis de gastos:**\n\n`;
      response += `• Total gastado: **${fmt(ctx.totalExpenses)}**\n`;
      response += `• Balance: **${fmt(ctx.balance)}**\n\n`;
      
      if (ctx.topCategories.length > 0) {
        response += `**Top categorías:**\n`;
        ctx.topCategories.slice(0, 5).forEach((cat, i) => {
          const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i];
          response += `${emoji} ${cat.category}: ${fmt(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
        });
        
        const top = ctx.topCategories[0];
        if (top && top.percentage > 30) {
          response += `\n💡 **Consejo:** ${top.category} representa ${top.percentage.toFixed(0)}% de tus gastos. Considera establecer un límite mensual para esta categoría.`;
        }
      } else {
        response += `No tienes gastos registrados aún. ¡Empieza a registrar tus transacciones!`;
      }
      
      return response;
    }

    // Consejos de ahorro
    if (msg.includes('ahorro') || msg.includes('ahorrar') || msg.includes('consejo')) {
      let response = `💰 **Consejos de ahorro personalizados:**\n\n`;
      response += `Tu tasa de ahorro actual: **${ctx.savingsRate.toFixed(1)}%**\n\n`;
      
      if (ctx.savingsRate >= 20) {
        response += `✅ ¡Excelente! Estás por encima del 20% recomendado.\n\n`;
        response += `**Siguiente nivel:**\n`;
        response += `• Considera invertir tu excedente\n`;
        response += `• Aumenta tus metas de ahorro\n`;
        response += `• Crea un fondo de emergencia de 6 meses\n`;
      } else if (ctx.savingsRate >= 10) {
        const needed = ctx.totalIncome * 0.2 - ctx.balance;
        response += `⚠️ Estás cerca, pero puedes mejorar.\n\n`;
        response += `**Para llegar al 20%:**\n`;
        response += `• Necesitas ahorrar ${fmt(needed)} más al mes\n`;
        if (ctx.topCategories[0]) {
          response += `• Reduce ${ctx.topCategories[0].category} un 15% = ${fmt(ctx.topCategories[0].amount * 0.15)}\n`;
        }
      } else if (ctx.savingsRate > 0) {
        response += `🔴 Tu ahorro es bajo. Aquí hay acciones concretas:\n\n`;
        ctx.topCategories.slice(0, 3).forEach(cat => {
          response += `• ${cat.category}: Reduce 20% → Ahorras ${fmt(cat.amount * 0.2)}/mes\n`;
        });
      } else {
        response += `⚠️ **Alerta:** Estás gastando más de lo que ganas.\n\n`;
        response += `**Pasos urgentes:**\n`;
        response += `1. Revisa gastos no esenciales\n`;
        response += `2. Cancela suscripciones innecesarias\n`;
        response += `3. Establece un presupuesto estricto\n`;
      }
      
      return response;
    }

    // Metas
    if (msg.includes('meta') || msg.includes('objetivo')) {
      if (ctx.goals.length === 0) {
        return `🎯 **No tienes metas configuradas**\n\nCrear metas te ayuda a:\n• Mantener motivación\n• Medir progreso\n• Ahorrar con propósito\n\n¡Ve a la sección de Metas y crea tu primera meta!`;
      }
      
      let response = `🎯 **Estado de tus metas:**\n\n`;
      ctx.goals.forEach(goal => {
        const emoji = goal.progress >= 75 ? '🟢' : goal.progress >= 50 ? '🟡' : '🔴';
        response += `${emoji} **${goal.name}**\n`;
        response += `   Progreso: ${goal.progress.toFixed(0)}% (${fmt(goal.current)}/${fmt(goal.target)})\n`;
        
        if (goal.target > goal.current) {
          const remaining = goal.target - goal.current;
          const monthlyNeeded = remaining / 6;
          response += `   Para lograrla en 6 meses: ${fmt(monthlyNeeded)}/mes\n`;
        }
        response += '\n';
      });
      
      return response;
    }

    // Presupuesto
    if (msg.includes('presupuesto') || msg.includes('distribuir')) {
      if (ctx.budgets.length === 0) {
        const income = ctx.totalIncome || 1000;
        return `📋 **Presupuesto sugerido (Regla 50/30/20):**\n\n` +
          `Con ingresos de ${fmt(income)}:\n\n` +
          `**🏠 Necesidades (50%):** ${fmt(income * 0.5)}\n` +
          `• Vivienda, servicios, comida, transporte\n\n` +
          `**🎭 Deseos (30%):** ${fmt(income * 0.3)}\n` +
          `• Entretenimiento, restaurantes, compras\n\n` +
          `**💰 Ahorro (20%):** ${fmt(income * 0.2)}\n` +
          `• Emergencias, metas, inversiones\n\n` +
          `Ve a Presupuestos para configurar tus límites.`;
      }
      
      let response = `📋 **Estado de tus presupuestos:**\n\n`;
      ctx.budgets.forEach(budget => {
        const emoji = budget.percentage >= 100 ? '🔴' : budget.percentage >= 80 ? '🟡' : '🟢';
        response += `${emoji} **${budget.category}**\n`;
        response += `   ${fmt(budget.spent)} / ${fmt(budget.limit)} (${budget.percentage.toFixed(0)}%)\n`;
        if (budget.limit > budget.spent) {
          response += `   Disponible: ${fmt(budget.limit - budget.spent)}\n`;
        }
        response += '\n';
      });
      
      return response;
    }

    // Proyección
    if (msg.includes('proyec') || msg.includes('futuro') || msg.includes('3 meses')) {
      const monthlyBalance = ctx.balance;
      const projection3m = monthlyBalance * 3;
      const projection6m = monthlyBalance * 6;
      const projection12m = monthlyBalance * 12;
      
      let response = `📈 **Proyección financiera:**\n\n`;
      response += `Balance mensual actual: ${fmt(monthlyBalance)}\n\n`;
      
      if (monthlyBalance > 0) {
        response += `**Si sigues así:**\n`;
        response += `• En 3 meses: +${fmt(projection3m)}\n`;
        response += `• En 6 meses: +${fmt(projection6m)}\n`;
        response += `• En 1 año: +${fmt(projection12m)}\n\n`;
        
        response += `**💡 Consejo:** `;
        if (ctx.savingsRate < 20) {
          response += `Aumenta tu ahorro al 20% y podrías acumular ${fmt(ctx.totalIncome * 0.2 * 12)} en un año.`;
        } else {
          response += `¡Vas muy bien! Considera invertir parte de tu ahorro.`;
        }
      } else {
        response += `⚠️ **Alerta:** Estás perdiendo ${fmt(Math.abs(monthlyBalance))}/mes\n\n`;
        response += `En 3 meses habrás perdido: ${fmt(Math.abs(projection3m))}\n\n`;
        response += `**Es urgente tomar acción:**\n`;
        response += `1. Reduce gastos innecesarios\n`;
        response += `2. Busca ingresos adicionales\n`;
        response += `3. Revisa tus suscripciones\n`;
      }
      
      return response;
    }

    // Recurrentes
    if (msg.includes('recurr') || msg.includes('fijo') || msg.includes('mensual')) {
      const { recurringIncome, recurringExpense } = ctx;
      let response = `🔄 **Transacciones recurrentes:**\n\n`;
      response += `• Ingresos fijos: ${fmt(recurringIncome)}/mes\n`;
      response += `• Gastos fijos: ${fmt(recurringExpense)}/mes\n`;
      response += `• Balance fijo: ${fmt(recurringIncome - recurringExpense)}/mes\n\n`;
      
      if (recurringExpense > recurringIncome * 0.5) {
        response += `⚠️ Tus gastos fijos son más del 50% de tus ingresos. Intenta reducirlos.`;
      } else {
        response += `✅ Tus gastos fijos están en un nivel saludable.`;
      }
      
      return response;
    }

    // Default response
    return `📊 **Tu resumen financiero:**\n\n` +
      `• Ingresos: ${fmt(ctx.totalIncome)}\n` +
      `• Gastos: ${fmt(ctx.totalExpenses)}\n` +
      `• Balance: ${fmt(ctx.balance)}\n` +
      `• Tasa de ahorro: ${ctx.savingsRate.toFixed(1)}%\n\n` +
      `¿Qué te gustaría saber? Puedo ayudarte con:\n` +
      `• 📊 Análisis de gastos\n` +
      `• 💰 Consejos de ahorro\n` +
      `• 🎯 Estado de metas\n` +
      `• 📋 Presupuestos\n` +
      `• 📈 Proyecciones`;
  };

  // Handle send message
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

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

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

  // Handle quick action
  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setInput(action.message);
    setTimeout(() => {
      const event = { key: 'Enter' } as React.KeyboardEvent;
      handleSend();
    }, 100);
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 0 20px ${themeColors.primary}40`
            }}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Asistente Financiero
              <Sparkles className="w-5 h-5" style={{ color: themeColors.primary }} />
            </h1>
            <p className="text-sm text-white/60">Tu asesor personal con IA</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAlerts(!showAlerts)}
          leftIcon={<AlertCircle className="w-4 h-4" />}
        >
          {smartAlerts.length}
        </Button>
      </div>

      {/* Smart Alerts */}
      <AnimatePresence>
        {showAlerts && smartAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 overflow-hidden"
          >
            {smartAlerts.slice(0, 3).map((alert, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'p-3 rounded-xl border flex items-center gap-3',
                  alert.type === 'danger' && 'bg-danger-500/10 border-danger-500/30',
                  alert.type === 'warning' && 'bg-warning-500/10 border-warning-500/30',
                  alert.type === 'success' && 'bg-success-500/10 border-success-500/30',
                  alert.type === 'info' && 'bg-primary-500/10 border-primary-500/30',
                )}
              >
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

      {/* Chat Messages */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                msg.role === 'user' && 'justify-end'
              )}
            >
              {msg.role === 'assistant' && (
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColors.primary}20` }}
                >
                  <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-white/10 text-white rounded-br-md'
                    : 'bg-white/5 text-white/90 rounded-bl-md'
                )}
                style={msg.role === 'user' ? { 
                  background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)` 
                } : {}}
              >
                {msg.content.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-white">{line.replace(/\*\*/g, '')}</p>;
                  }
                  if (line.includes('**')) {
                    const parts = line.split('**');
                    return (
                      <p key={i}>
                        {parts.map((part, j) => 
                          j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                        )}
                      </p>
                    );
                  }
                  return <p key={i}>{line}</p>;
                })}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">👤</span>
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${themeColors.primary}20` }}
              >
                <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
              </div>
              <div className="bg-white/5 p-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-sm"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none transition-colors"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4"
              style={{ 
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AssistantPage;
