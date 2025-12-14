// ============================================
// 🤖 ASSISTANT PAGE - AI CHAT WITH REAL CLAUDE
// Uses Anthropic Claude API for intelligent responses
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, X, Loader2, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Avatar, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import { claudeService } from '../../services/claudeService';
import { notificationService, type SmartAlert } from '../../services/notificationService';
import type { ChatMessage, QuickAction } from '../../types';

// Quick Actions
const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', icon: '💡', label: 'Consejos de ahorro', message: '¿Qué consejos personalizados me das para ahorrar más dinero?' },
  { id: '2', icon: '📊', label: 'Analizar gastos', message: 'Analiza mis gastos de este mes y dame recomendaciones específicas' },
  { id: '3', icon: '🎯', label: 'Mis metas', message: '¿Cómo van mis metas de ahorro y cómo puedo alcanzarlas más rápido?' },
  { id: '4', icon: '💰', label: 'Reducir gastos', message: '¿En qué categorías específicas podría reducir mis gastos?' },
  { id: '5', icon: '📈', label: 'Proyección', message: 'Si sigo así, ¿cómo estarán mis finanzas en 3 meses?' },
  { id: '6', icon: '🏠', label: 'Presupuesto ideal', message: '¿Cómo debería distribuir mi presupuesto mensual según mis ingresos?' },
];

export const AssistantPage: React.FC = () => {
  const { user, expenses, incomes, goals, budgets, theme, currency, setActivePage } = useStore();
  const themeColors = getThemeColors(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate financial context for AI
  const financialContext = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Top categories
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Budget status
    const budgetStatus = budgets.map(budget => {
      const spent = categoryTotals[budget.category] || 0;
      return {
        category: budget.category,
        limit: budget.limit,
        spent,
        percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0
      };
    });

    // Goals status
    const goalsStatus = goals.map(goal => ({
      name: goal.name,
      target: Number(goal.targetAmount) || 0,
      current: Number(goal.currentAmount) || 0,
      progress: (Number(goal.targetAmount) || 0) > 0 
        ? ((Number(goal.currentAmount) || 0) / (Number(goal.targetAmount) || 0)) * 100 
        : 0,
      deadline: goal.deadline
    }));

    // Recent transactions
    const recentTransactions = [...expenses, ...incomes]
      .sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10)
      .map(tx => ({
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        date: (tx.date instanceof Date ? tx.date : new Date(tx.date)).toLocaleDateString('es')
      }));

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      topCategories,
      budgets: budgetStatus,
      goals: goalsStatus,
      recentTransactions,
      monthlyTrend: [],
      currency,
      userName: user?.displayName?.split(' ')[0]
    };
  }, [expenses, incomes, goals, budgets, currency, user]);

  // Generate smart alerts on load
  useEffect(() => {
    const alerts = notificationService.getAllSmartAlerts(
      expenses,
      incomes,
      budgets,
      goals,
      currency
    );
    setSmartAlerts(alerts);
  }, [expenses, incomes, budgets, goals, currency]);

  // Initial greeting message
  useEffect(() => {
    const greeting = `¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋

Soy tu asistente financiero personal con **inteligencia artificial**. Puedo analizar tus datos reales y darte consejos personalizados.

**Tu resumen rápido:**
• Balance: ${formatCurrency(financialContext.balance, currency)}
• Tasa de ahorro: ${financialContext.savingsRate.toFixed(1)}%
• Metas activas: ${goals.filter(g => !g.isCompleted).length}

¿En qué puedo ayudarte hoy?`;

    setMessages([{
      id: '0',
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowAlerts(false);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }));

      // Generate response using Claude
      const response = await claudeService.generateResponse(
        messageText,
        financialContext,
        conversationHistory
      );

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.message);
  };

  const handleAlertAction = (alert: SmartAlert) => {
    if (alert.actionPage) {
      setActivePage(alert.actionPage as any);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-danger-500/50 bg-danger-500/10';
      case 'medium': return 'border-warning-500/50 bg-warning-500/10';
      default: return 'border-success-500/50 bg-success-500/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-5 h-5 text-danger-400" />;
      case 'medium': return <Zap className="w-5 h-5 text-warning-400" />;
      default: return <CheckCircle className="w-5 h-5 text-success-400" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
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
              Asistente IA
              <Badge variant="primary" className="text-xs">Claude</Badge>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-sm text-white/50">Conectado</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAlerts(!showAlerts)}>
            <Sparkles className="w-5 h-5" />
            {smartAlerts.filter(a => a.priority === 'high').length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-danger-500" />
            )}
          </Button>
        </div>
      </div>

      {/* Smart Alerts Panel */}
      <AnimatePresence>
        {showAlerts && smartAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: themeColors.primary }} />
                  Alertas Inteligentes
                </h3>
                <button 
                  onClick={() => setShowAlerts(false)}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {smartAlerts.slice(0, 5).map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
                      getPriorityColor(alert.priority)
                    )}
                    onClick={() => handleAlertAction(alert)}
                  >
                    <div className="flex items-start gap-3">
                      {getPriorityIcon(alert.priority)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{alert.title}</p>
                        <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{alert.message}</p>
                      </div>
                      {alert.actionLabel && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 whitespace-nowrap">
                          {alert.actionLabel}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <Card className="flex-1 overflow-hidden flex flex-col" padding="none">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
              >
                {message.role === 'assistant' ? (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Avatar src={user?.photoURL} name={user?.displayName || 'U'} size="sm" />
                )}
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'assistant'
                      ? 'bg-white/10 rounded-tl-sm'
                      : 'rounded-tr-sm'
                  )}
                  style={message.role === 'user' ? {
                    background: `${themeColors.primary}20`,
                    borderColor: `${themeColors.primary}30`
                  } : {}}
                >
                  <div 
                    className="text-white text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/•/g, '&bull;')
                    }}
                  />
                  <p className="text-xs text-white/30 mt-2">
                    {message.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-white/50 mr-2">Analizando</span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColors.primary, animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColors.primary, animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: themeColors.primary, animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-3">Pregúntame sobre:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-sm text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta financiera..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none transition-colors"
              style={{ 
                borderColor: input ? `${themeColors.primary}50` : undefined 
              }}
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isTyping} 
              className="px-4"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-xs text-white/30 mt-2 text-center">
            Powered by Claude AI • Tus datos están seguros
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AssistantPage;
