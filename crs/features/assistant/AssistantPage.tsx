// ============================================
// 🤖 ASSISTANT PAGE - AI CHAT
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Lightbulb, TrendingUp, PiggyBank, Target, X, Loader2 } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Avatar } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';
import type { ChatMessage, QuickAction } from '../../types';

// Quick Actions
const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', icon: '💡', label: 'Consejos de ahorro', message: '¿Qué consejos me das para ahorrar más dinero?' },
  { id: '2', icon: '📊', label: 'Analizar gastos', message: 'Analiza mis gastos de este mes y dame recomendaciones' },
  { id: '3', icon: '🎯', label: 'Alcanzar metas', message: '¿Cómo puedo alcanzar mis metas de ahorro más rápido?' },
  { id: '4', icon: '💰', label: 'Reducir gastos', message: '¿En qué categorías podría reducir mis gastos?' },
  { id: '5', icon: '📈', label: 'Mejorar finanzas', message: '¿Cómo puedo mejorar mi salud financiera?' },
  { id: '6', icon: '🏠', label: 'Presupuesto', message: '¿Cómo debería distribuir mi presupuesto mensual?' },
];

// Knowledge base for offline responses
const KNOWLEDGE_BASE: Record<string, string> = {
  'ahorro': 'Para ahorrar más dinero te recomiendo:\n\n1. **Regla 50/30/20**: Destina 50% a necesidades, 30% a deseos y 20% al ahorro.\n2. **Automatiza**: Programa transferencias automáticas a tu cuenta de ahorros.\n3. **Revisa suscripciones**: Cancela las que no uses.\n4. **Cocina en casa**: Reduce gastos en restaurantes.\n5. **Compara precios**: Antes de comprar, busca ofertas.',
  'gastos': 'Para controlar tus gastos:\n\n1. **Registra todo**: Anota cada gasto, por pequeño que sea.\n2. **Establece límites**: Define presupuestos por categoría.\n3. **Usa efectivo**: Limita el uso de tarjetas.\n4. **Espera 24h**: Antes de compras impulsivas, espera un día.\n5. **Revisa semanalmente**: Analiza tus gastos cada semana.',
  'metas': 'Para alcanzar tus metas de ahorro:\n\n1. **Sé específico**: Define montos y fechas exactas.\n2. **Divide en pequeñas metas**: Es más motivador.\n3. **Visualiza el progreso**: Usa gráficos y porcentajes.\n4. **Celebra logros**: Prémiate al alcanzar hitos.\n5. **Ajusta si es necesario**: Sé flexible con los plazos.',
  'presupuesto': 'Distribución sugerida del presupuesto:\n\n• **Vivienda**: 25-35%\n• **Transporte**: 10-15%\n• **Alimentación**: 10-15%\n• **Servicios**: 5-10%\n• **Ahorro**: 15-20%\n• **Entretenimiento**: 5-10%\n• **Personal**: 5-10%\n• **Emergencias**: 5-10%',
  'default': '¡Hola! Soy tu asistente financiero. Puedo ayudarte con:\n\n• 💡 Consejos de ahorro\n• 📊 Análisis de gastos\n• 🎯 Estrategias para metas\n• 💰 Presupuestos\n• 📈 Mejora de finanzas\n\n¿En qué puedo ayudarte hoy?',
};

// Generate response based on user message and financial data
const generateResponse = (message: string, financialContext: any): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords
  if (lowerMessage.includes('ahorro') || lowerMessage.includes('ahorrar') || lowerMessage.includes('guardar')) {
    return KNOWLEDGE_BASE['ahorro'];
  }
  if (lowerMessage.includes('gasto') || lowerMessage.includes('gastar') || lowerMessage.includes('reducir')) {
    const topCategory = financialContext.topCategories?.[0];
    let response = KNOWLEDGE_BASE['gastos'];
    if (topCategory) {
      response += `\n\n📊 **Dato**: Tu mayor gasto este mes es en "${topCategory.category}" con ${formatCurrency(topCategory.amount, 'USD')} (${topCategory.percentage.toFixed(1)}% del total).`;
    }
    return response;
  }
  if (lowerMessage.includes('meta') || lowerMessage.includes('objetivo') || lowerMessage.includes('alcanzar')) {
    return KNOWLEDGE_BASE['metas'];
  }
  if (lowerMessage.includes('presupuesto') || lowerMessage.includes('distribuir') || lowerMessage.includes('organizar')) {
    return KNOWLEDGE_BASE['presupuesto'];
  }
  if (lowerMessage.includes('analiz') || lowerMessage.includes('recomend')) {
    const { totalIncome, totalExpenses, savingsRate } = financialContext;
    let analysis = `📊 **Análisis de este mes**:\n\n`;
    analysis += `• Ingresos: ${formatCurrency(totalIncome, 'USD')}\n`;
    analysis += `• Gastos: ${formatCurrency(totalExpenses, 'USD')}\n`;
    analysis += `• Tasa de ahorro: ${savingsRate.toFixed(1)}%\n\n`;
    
    if (savingsRate >= 20) {
      analysis += `✅ ¡Excelente! Estás ahorrando más del 20%. Sigue así.`;
    } else if (savingsRate >= 10) {
      analysis += `⚠️ Tu tasa de ahorro está en ${savingsRate.toFixed(1)}%. Intenta llegar al 20% reduciendo gastos no esenciales.`;
    } else if (savingsRate >= 0) {
      analysis += `🔴 Tu tasa de ahorro es baja (${savingsRate.toFixed(1)}%). Revisa tus gastos y establece presupuestos más estrictos.`;
    } else {
      analysis += `⚠️ ¡Atención! Estás gastando más de lo que ganas. Necesitas revisar urgentemente tus gastos.`;
    }
    return analysis;
  }
  if (lowerMessage.includes('hola') || lowerMessage.includes('ayuda') || lowerMessage.includes('qué puedes')) {
    return KNOWLEDGE_BASE['default'];
  }
  
  // Default response with context
  return `Gracias por tu mensaje. Basándome en tus finanzas actuales:\n\n• Tu balance este mes es ${formatCurrency(financialContext.balance, 'USD')}\n• Tu tasa de ahorro es ${financialContext.savingsRate.toFixed(1)}%\n\n¿Te gustaría que te dé consejos específicos sobre algún tema? Puedo ayudarte con ahorro, gastos, metas o presupuestos.`;
};

export const AssistantPage: React.FC = () => {
  const { user, expenses, incomes, goals, theme, setActivePage } = useStore();
  const themeColors = getThemeColors(theme);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋\n\nSoy tu asistente financiero personal. Estoy aquí para ayudarte a:\n\n• 💡 Mejorar tus hábitos de ahorro\n• 📊 Analizar tus gastos\n• 🎯 Alcanzar tus metas financieras\n• 💰 Crear presupuestos efectivos\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate financial context
  const financialContext = {
    totalIncome: incomes.reduce((sum, i) => sum + i.amount, 0),
    totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
    balance: incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
    savingsRate: incomes.reduce((sum, i) => sum + i.amount, 0) > 0
      ? ((incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)) / incomes.reduce((sum, i) => sum + i.amount, 0)) * 100
      : 0,
    topCategories: Object.entries(expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>))
      .map(([category, amount]) => ({ category, amount, percentage: (amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100 }))
      .sort((a, b) => b.amount - a.amount),
    activeGoals: goals.filter(g => !g.isCompleted).length,
  };

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

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate response
    const response = generateResponse(messageText, financialContext);

    // Add assistant message
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.message);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Asistente Financiero</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-sm text-white/50">En línea</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setActivePage('dashboard')}>
          <X className="w-5 h-5" />
        </Button>
      </div>

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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Avatar src={user?.photoURL} name={user?.displayName || 'U'} size="sm" />
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'assistant'
                      ? 'bg-white/10 rounded-tl-sm'
                      : 'bg-primary-500/20 rounded-tr-sm'
                  )}
                >
                  <p className="text-white whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-white/50 mb-3">Sugerencias rápidas:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm text-white/70 hover:text-white"
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
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-primary-500 focus:ring-0 transition-colors"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!input.trim() || isTyping} className="px-4">
              {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default AssistantPage;
