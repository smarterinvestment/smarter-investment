// ============================================
// 🤖 ASSISTANT PAGE v21.1 - Real AI Financial Advisor
// Uses Claude API for intelligent financial analysis
// ============================================
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, Loader2, TrendingUp, TrendingDown, Target, AlertTriangle, RefreshCw, Mic, MicOff, Trash2 } from 'lucide-react';
import { useStore, getThemeColors } from '../../stores/useStore';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../utils/cn';
import { formatCurrency } from '../../utils/financial';

// Quick action prompts
const QUICK_ACTIONS = [
  { id: '1', icon: '📊', label: 'Resumen', prompt: 'Dame un resumen completo de mi situación financiera actual, incluyendo ingresos, gastos y recomendaciones.' },
  { id: '2', icon: '💡', label: 'Consejos', prompt: 'Dame consejos personalizados para mejorar mis finanzas basándote en mis datos actuales.' },
  { id: '3', icon: '💰', label: 'Ahorro', prompt: '¿Cómo puedo ahorrar más dinero? Analiza mis gastos y sugiere dónde puedo reducir.' },
  { id: '4', icon: '🎯', label: 'Metas', prompt: 'Ayúdame a planificar mis metas financieras. ¿Cuánto tiempo me tomará alcanzarlas?' },
  { id: '5', icon: '📈', label: 'Inversión', prompt: '¿Qué opciones de inversión me recomiendas según mi perfil financiero actual?' },
  { id: '6', icon: '⚠️', label: 'Alertas', prompt: '¿Hay algo preocupante en mis finanzas? Dame alertas y advertencias.' },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// Claude API Service
const callClaudeAPI = async (
  userMessage: string,
  financialContext: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const systemPrompt = `Eres un asesor financiero personal experto y amigable llamado "Smarter Assistant". Tu trabajo es ayudar a los usuarios a mejorar sus finanzas personales.

CONTEXTO FINANCIERO DEL USUARIO:
${financialContext}

INSTRUCCIONES:
1. Analiza los datos financieros del usuario y da consejos personalizados
2. Sé específico con los números y porcentajes
3. Usa emojis para hacer las respuestas más amigables
4. Da consejos prácticos y accionables
5. Si detectas problemas (gastos excesivos, poco ahorro), menciónalos con tacto
6. Responde siempre en español
7. Mantén las respuestas concisas pero útiles (máximo 300 palabras)
8. Usa formato con saltos de línea para mejor legibilidad
9. Si no tienes suficientes datos, sugiere al usuario que agregue más transacciones

REGLAS IMPORTANTES:
- Nunca des consejos de inversión específicos (acciones particulares, etc.)
- Siempre recomienda consultar con un profesional para decisiones importantes
- Sé empático y positivo, incluso cuando señales problemas`;

  const messages = [
    ...conversationHistory.slice(-6), // Keep last 6 messages for context
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error: any) {
    console.error('Claude API error:', error);
    throw error;
  }
};

export const AssistantPage: React.FC = () => {
  const { user, expenses, incomes, goals, budgets, recurringTransactions, theme, currency } = useStore();
  const themeColors = getThemeColors(theme);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Safe arrays
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeBudgets = budgets || {};
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  // Generate financial context for AI
  const financialContext = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Current month data
    const monthlyExpenses = safeExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthlyIncomes = safeIncomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Totals
    const totalIncome = monthlyIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Category breakdown
    const expensesByCategory: Record<string, number> = {};
    monthlyExpenses.forEach(e => {
      const cat = e.category || 'Otros';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (Number(e.amount) || 0);
    });

    const topCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => `${name}: ${formatCurrency(amount, currency)}`);

    // Goals
    const goalsInfo = safeGoals.map(g => {
      const progress = (Number(g.currentAmount) || 0) / (Number(g.targetAmount) || 1) * 100;
      return `${g.name}: ${progress.toFixed(0)}% completado (${formatCurrency(g.currentAmount || 0, currency)} de ${formatCurrency(g.targetAmount || 0, currency)})`;
    });

    // Recurring
    const recurringExpenses = safeRecurring.filter(r => r.type === 'expense' && r.isActive);
    const recurringIncome = safeRecurring.filter(r => r.type === 'income' && r.isActive);

    return `
RESUMEN FINANCIERO (${now.toLocaleDateString('es', { month: 'long', year: 'numeric' })}):
- Ingresos del mes: ${formatCurrency(totalIncome, currency)}
- Gastos del mes: ${formatCurrency(totalExpenses, currency)}
- Balance: ${formatCurrency(balance, currency)}
- Tasa de ahorro: ${savingsRate.toFixed(1)}%

GASTOS POR CATEGORÍA (Top 5):
${topCategories.length > 0 ? topCategories.join('\n') : 'Sin datos de gastos'}

METAS DE AHORRO:
${goalsInfo.length > 0 ? goalsInfo.join('\n') : 'Sin metas configuradas'}

TRANSACCIONES RECURRENTES:
- Ingresos fijos: ${recurringIncome.length} (${recurringIncome.map(r => `${r.name}: ${formatCurrency(r.amount, currency)}`).join(', ') || 'ninguno'})
- Gastos fijos: ${recurringExpenses.length} (${recurringExpenses.map(r => `${r.name}: ${formatCurrency(r.amount, currency)}`).join(', ') || 'ninguno'})

PRESUPUESTOS CONFIGURADOS:
${Object.keys(safeBudgets).length > 0 
  ? Object.entries(safeBudgets).map(([cat, amount]) => `${cat}: ${formatCurrency(Number(amount), currency)}`).join(', ')
  : 'Sin presupuestos configurados'}

DATOS HISTÓRICOS:
- Total de transacciones de gastos: ${safeExpenses.length}
- Total de transacciones de ingresos: ${safeIncomes.length}
`;
  }, [safeExpenses, safeIncomes, safeGoals, safeBudgets, safeRecurring, currency]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `¡Hola${user?.displayName ? ` ${user.displayName.split(' ')[0]}` : ''}! 👋

Soy tu asistente financiero personal con inteligencia artificial. Puedo ayudarte a:

📊 Analizar tus finanzas
💡 Darte consejos personalizados
🎯 Planificar tus metas de ahorro
⚠️ Detectar problemas en tus gastos

¿En qué puedo ayudarte hoy?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  // Send message
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setError(null);
    setInput('');

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }]);

    setIsLoading(true);

    try {
      // Prepare conversation history
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      // Call Claude API
      const response = await callClaudeAPI(messageText, financialContext, history);

      // Replace loading message with response
      setMessages(prev => prev.map(m => 
        m.id === loadingId 
          ? { ...m, content: response, isLoading: false }
          : m
      ));
    } catch (err: any) {
      // Remove loading message and show error
      setMessages(prev => prev.filter(m => m.id !== loadingId));
      
      if (err.message === 'API key not configured') {
        setError('API no configurada. Agrega VITE_CLAUDE_API_KEY en tu archivo .env');
      } else {
        setError('Error al conectar con el asistente. Intenta de nuevo.');
      }
      
      // Add fallback message
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: generateFallbackResponse(messageText),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback response when API fails
  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    const totalIncome = safeIncomes
      .filter(i => new Date(i.date).getMonth() === new Date().getMonth())
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    
    const totalExpenses = safeExpenses
      .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    if (q.includes('resumen') || q.includes('situación')) {
      return `📊 **Tu Resumen Financiero**

💰 Ingresos: ${formatCurrency(totalIncome, currency)}
💸 Gastos: ${formatCurrency(totalExpenses, currency)}
${balance >= 0 ? '✅' : '⚠️'} Balance: ${formatCurrency(balance, currency)}
📈 Tasa de ahorro: ${savingsRate.toFixed(1)}%

${savingsRate >= 20 
  ? '¡Excelente! Tu tasa de ahorro está por encima del 20% recomendado.' 
  : savingsRate >= 0 
    ? 'Considera aumentar tu tasa de ahorro al menos al 20%.'
    : '⚠️ Estás gastando más de lo que ganas. Revisa tus gastos.'}`;
    }

    if (q.includes('consejo') || q.includes('ayuda')) {
      return `💡 **Consejos Financieros**

1. **Regla 50/30/20**: 
   - 50% para necesidades
   - 30% para deseos
   - 20% para ahorro

2. **Fondo de emergencia**: Ahorra 3-6 meses de gastos

3. **Automatiza**: Configura transferencias automáticas a tu cuenta de ahorro

4. **Revisa gastos hormiga**: Pequeños gastos diarios suman mucho

¿Quieres que analice algo específico de tus finanzas?`;
    }

    return `Gracias por tu pregunta. Basándome en tus datos:

📊 Balance actual: ${formatCurrency(balance, currency)}
📈 Tasa de ahorro: ${savingsRate.toFixed(1)}%

Para darte un análisis más detallado, asegúrate de tener la API configurada correctamente.

¿Hay algo específico que quieras saber sobre tus finanzas?`;
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="text-center py-3 border-b border-white/10">
        <h1 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Bot className="w-6 h-6" style={{ color: themeColors.primary }} />
          Asistente Financiero AI
        </h1>
        <p className="text-white/50 text-xs">Powered by Claude</p>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_ACTIONS.map(action => (
            <Button
              key={action.id}
              size="sm"
              variant="secondary"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="flex-shrink-0 whitespace-nowrap"
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-4 mt-2">
          <Card className="p-3 bg-warning-500/10 border-warning-500/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-400" />
              <span className="text-sm text-warning-400">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-warning-400 hover:text-warning-300"
              >
                ✕
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                'max-w-[85%] rounded-2xl p-4',
                msg.role === 'user'
                  ? 'bg-primary-500/20 rounded-br-md'
                  : 'bg-white/5 rounded-bl-md'
              )}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${themeColors.primary}30` }}
                    >
                      <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
                    </div>
                    <span className="text-xs text-white/50">Smarter Assistant</span>
                    {msg.isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                    )}
                  </div>
                )}

                {msg.isLoading ? (
                  <div className="flex items-center gap-2 text-white/50">
                    <span className="animate-pulse">Analizando tus finanzas...</span>
                  </div>
                ) : (
                  <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content.split('\n').map((line, i) => {
                      // Bold text
                      if (line.includes('**')) {
                        const parts = line.split(/\*\*/);
                        return (
                          <p key={i} className="my-1">
                            {parts.map((part, j) => 
                              j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                            )}
                          </p>
                        );
                      }
                      // Headers
                      if (line.startsWith('##') || line.startsWith('#')) {
                        return <h3 key={i} className="font-bold text-white mt-2 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
                      }
                      // Lists
                      if (line.startsWith('- ') || line.startsWith('• ')) {
                        return <p key={i} className="pl-2 my-0.5">{line}</p>;
                      }
                      // Regular line
                      return line ? <p key={i} className="my-1">{line}</p> : <br key={i} />;
                    })}
                  </div>
                )}

                {!msg.isLoading && (
                  <p className="text-xs text-white/30 mt-2">
                    {msg.timestamp.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Pregunta sobre tus finanzas..."
              disabled={isLoading}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-primary-500 disabled:opacity-50"
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
              </div>
            )}
          </div>

          <Button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-xs text-white/30 text-center mt-2">
          El asistente analiza tus datos financieros para darte consejos personalizados
        </p>
      </div>
    </div>
  );
};

export default AssistantPage;
