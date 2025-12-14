// ============================================
// 🤖 CLAUDE AI SERVICE - REAL FINANCIAL ASSISTANT
// Uses Anthropic Claude API for intelligent responses
// ============================================

interface FinancialContext {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  budgets: Array<{ category: string; limit: number; spent: number; percentage: number }>;
  goals: Array<{ name: string; target: number; current: number; progress: number; deadline?: string }>;
  recentTransactions: Array<{ description: string; amount: number; category: string; type: string; date: string }>;
  monthlyTrend: { income: number; expenses: number; savings: number }[];
  currency: string;
  userName?: string;
}

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Eres un asistente financiero personal experto llamado "Smarter". Tu trabajo es ayudar a los usuarios a mejorar sus finanzas personales.

PERSONALIDAD:
- Amigable, motivador y profesional
- Usa emojis ocasionalmente para hacer la conversación más amena
- Sé directo y da consejos accionables
- Usa lenguaje simple, evita jerga financiera compleja
- Celebra los logros del usuario
- Sé empático cuando hay problemas financieros

CAPACIDADES:
- Analizar ingresos, gastos y balance
- Identificar patrones de gasto
- Dar consejos de ahorro personalizados
- Ayudar a alcanzar metas financieras
- Sugerir presupuestos óptimos
- Detectar gastos inusuales
- Proyectar finanzas futuras

FORMATO DE RESPUESTAS:
- Usa **negritas** para destacar puntos importantes
- Usa listas con bullets (•) para múltiples puntos
- Mantén respuestas concisas (máximo 250 palabras)
- Incluye números específicos cuando sea posible
- Termina con una pregunta o acción sugerida

REGLAS:
- SIEMPRE basa tus respuestas en los datos financieros del usuario
- Si no tienes suficientes datos, pide más información
- No des consejos de inversión específicos (acciones, crypto, etc.)
- Protege la privacidad del usuario
- Si el usuario está en crisis financiera, sé comprensivo y da pasos concretos`;

export const claudeService = {
  /**
   * Generate a response using Claude API
   */
  async generateResponse(
    userMessage: string,
    financialContext: FinancialContext,
    conversationHistory: ClaudeMessage[] = []
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    // If no API key, use fallback local response
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return this.generateLocalResponse(userMessage, financialContext);
    }

    try {
      // Build context message with financial data
      const contextMessage = this.buildContextMessage(financialContext);
      
      // Prepare messages for Claude
      const messages: ClaudeMessage[] = [
        { role: 'user', content: contextMessage },
        { role: 'assistant', content: 'Entendido. Tengo acceso a los datos financieros del usuario. ¿En qué puedo ayudarte?' },
        ...conversationHistory.slice(-10), // Last 10 messages for context
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        console.error('Claude API error:', response.status);
        return this.generateLocalResponse(userMessage, financialContext);
      }

      const data = await response.json();
      return data.content[0]?.text || this.generateLocalResponse(userMessage, financialContext);
    } catch (error) {
      console.error('Claude API error:', error);
      return this.generateLocalResponse(userMessage, financialContext);
    }
  },

  /**
   * Build context message with user's financial data
   */
  buildContextMessage(context: FinancialContext): string {
    const { currency } = context;
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    let message = `[DATOS FINANCIEROS DEL USUARIO - ${new Date().toLocaleDateString('es')}]\n\n`;
    
    message += `📊 RESUMEN MENSUAL:\n`;
    message += `• Ingresos: ${formatMoney(context.totalIncome)}\n`;
    message += `• Gastos: ${formatMoney(context.totalExpenses)}\n`;
    message += `• Balance: ${formatMoney(context.balance)}\n`;
    message += `• Tasa de ahorro: ${context.savingsRate.toFixed(1)}%\n\n`;

    if (context.topCategories.length > 0) {
      message += `💸 TOP CATEGORÍAS DE GASTO:\n`;
      context.topCategories.slice(0, 5).forEach((cat, i) => {
        message += `${i + 1}. ${cat.category}: ${formatMoney(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
      });
      message += '\n';
    }

    if (context.budgets.length > 0) {
      message += `📋 PRESUPUESTOS:\n`;
      context.budgets.forEach(budget => {
        const status = budget.percentage >= 100 ? '🔴' : budget.percentage >= 80 ? '🟡' : '🟢';
        message += `${status} ${budget.category}: ${formatMoney(budget.spent)}/${formatMoney(budget.limit)} (${budget.percentage.toFixed(0)}%)\n`;
      });
      message += '\n';
    }

    if (context.goals.length > 0) {
      message += `🎯 METAS DE AHORRO:\n`;
      context.goals.forEach(goal => {
        message += `• ${goal.name}: ${formatMoney(goal.current)}/${formatMoney(goal.target)} (${goal.progress.toFixed(0)}%)`;
        if (goal.deadline) message += ` - Fecha límite: ${goal.deadline}`;
        message += '\n';
      });
      message += '\n';
    }

    if (context.recentTransactions.length > 0) {
      message += `📝 ÚLTIMAS TRANSACCIONES:\n`;
      context.recentTransactions.slice(0, 5).forEach(tx => {
        const sign = tx.type === 'income' ? '+' : '-';
        message += `• ${tx.date}: ${tx.description} (${tx.category}): ${sign}${formatMoney(tx.amount)}\n`;
      });
    }

    return message;
  },

  /**
   * Fallback local response when API is not available
   */
  generateLocalResponse(message: string, context: FinancialContext): string {
    const lowerMessage = message.toLowerCase();
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency: context.currency }).format(amount);

    // Análisis de gastos
    if (lowerMessage.includes('gasto') || lowerMessage.includes('gastar') || lowerMessage.includes('analiz')) {
      let response = `📊 **Análisis de tus gastos este mes:**\n\n`;
      response += `• Total gastado: ${formatMoney(context.totalExpenses)}\n`;
      response += `• Balance actual: ${formatMoney(context.balance)}\n\n`;
      
      if (context.topCategories.length > 0) {
        response += `**Top categorías:**\n`;
        context.topCategories.slice(0, 3).forEach((cat, i) => {
          response += `${i + 1}. ${cat.category}: ${formatMoney(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
        });
        
        const topCat = context.topCategories[0];
        if (topCat && topCat.percentage > 30) {
          response += `\n💡 **Consejo:** Tu mayor gasto es **${topCat.category}** con ${topCat.percentage.toFixed(0)}% del total. Considera establecer un presupuesto específico para esta categoría.`;
        }
      }
      
      return response;
    }

    // Consejos de ahorro
    if (lowerMessage.includes('ahorro') || lowerMessage.includes('ahorrar') || lowerMessage.includes('guardar')) {
      let response = `💰 **Análisis de ahorro personalizado:**\n\n`;
      response += `• Tu tasa de ahorro actual: **${context.savingsRate.toFixed(1)}%**\n`;
      response += `• Ahorras ${formatMoney(context.balance)} este mes\n\n`;
      
      if (context.savingsRate >= 20) {
        response += `✅ ¡Excelente! Estás ahorrando más del 20%. Sigue así y considera aumentar tus metas.\n\n`;
      } else if (context.savingsRate >= 10) {
        response += `⚠️ Tu ahorro es moderado. La regla de oro es 20%. Te falta ${formatMoney(context.totalIncome * 0.2 - context.balance)} para llegar.\n\n`;
      } else if (context.savingsRate > 0) {
        response += `🔴 Tu ahorro es bajo. Revisa estos gastos:\n`;
        context.topCategories.slice(0, 2).forEach(cat => {
          response += `• ${cat.category}: ¿Puedes reducir un 20%? Ahorrarías ${formatMoney(cat.amount * 0.2)}/mes\n`;
        });
      } else {
        response += `⚠️ **Alerta:** Estás gastando más de lo que ganas. Es urgente revisar gastos y crear un presupuesto estricto.`;
      }
      
      return response;
    }

    // Metas
    if (lowerMessage.includes('meta') || lowerMessage.includes('objetivo') || lowerMessage.includes('alcanzar')) {
      if (context.goals.length === 0) {
        return `🎯 **No tienes metas configuradas**\n\nCrear metas te ayuda a:\n• Mantener motivación\n• Medir progreso\n• Ahorrar con propósito\n\n¿Te gustaría crear una meta? Ve a la sección de Metas y define tu objetivo.`;
      }
      
      let response = `🎯 **Estado de tus metas:**\n\n`;
      context.goals.forEach(goal => {
        const emoji = goal.progress >= 75 ? '🟢' : goal.progress >= 50 ? '🟡' : '🔴';
        response += `${emoji} **${goal.name}**\n`;
        response += `   • Progreso: ${goal.progress.toFixed(0)}% (${formatMoney(goal.current)}/${formatMoney(goal.target)})\n`;
        
        if (goal.target > goal.current) {
          const remaining = goal.target - goal.current;
          const monthlyNeeded = remaining / 6; // Assume 6 months
          response += `   • Necesitas: ${formatMoney(monthlyNeeded)}/mes para lograrlo en 6 meses\n`;
        }
        response += '\n';
      });
      
      return response;
    }

    // Presupuesto
    if (lowerMessage.includes('presupuesto') || lowerMessage.includes('distribuir')) {
      if (context.budgets.length === 0) {
        const income = context.totalIncome || 1000;
        return `📋 **Presupuesto sugerido (basado en 50/30/20):**\n\n` +
          `Con ingresos de ${formatMoney(income)}:\n\n` +
          `• **Necesidades (50%):** ${formatMoney(income * 0.5)}\n` +
          `  - Vivienda, servicios, comida, transporte\n\n` +
          `• **Deseos (30%):** ${formatMoney(income * 0.3)}\n` +
          `  - Entretenimiento, restaurantes, compras\n\n` +
          `• **Ahorro (20%):** ${formatMoney(income * 0.2)}\n` +
          `  - Emergencias, metas, inversiones\n\n` +
          `💡 Ve a Presupuestos para configurar límites por categoría.`;
      }
      
      let response = `📋 **Estado de tus presupuestos:**\n\n`;
      context.budgets.forEach(budget => {
        const status = budget.percentage >= 100 ? '🔴 EXCEDIDO' : budget.percentage >= 80 ? '🟡 CASI' : '🟢 OK';
        response += `**${budget.category}** ${status}\n`;
        response += `• Usado: ${formatMoney(budget.spent)} de ${formatMoney(budget.limit)}\n`;
        response += `• Disponible: ${formatMoney(Math.max(0, budget.limit - budget.spent))}\n\n`;
      });
      
      return response;
    }

    // Saludo o ayuda
    if (lowerMessage.includes('hola') || lowerMessage.includes('ayuda') || lowerMessage.includes('qué puedes')) {
      return `¡Hola! 👋 Soy tu asistente financiero personal.\n\n` +
        `**Puedo ayudarte con:**\n` +
        `• 📊 Analizar tus gastos\n` +
        `• 💰 Consejos de ahorro personalizados\n` +
        `• 🎯 Revisar progreso de metas\n` +
        `• 📋 Sugerir presupuestos\n` +
        `• 📈 Proyecciones financieras\n\n` +
        `**Tu resumen rápido:**\n` +
        `• Balance: ${formatMoney(context.balance)}\n` +
        `• Tasa de ahorro: ${context.savingsRate.toFixed(1)}%\n\n` +
        `¿En qué te puedo ayudar hoy?`;
    }

    // Respuesta por defecto con contexto
    return `Basándome en tus finanzas:\n\n` +
      `• **Ingresos:** ${formatMoney(context.totalIncome)}\n` +
      `• **Gastos:** ${formatMoney(context.totalExpenses)}\n` +
      `• **Balance:** ${formatMoney(context.balance)}\n` +
      `• **Ahorro:** ${context.savingsRate.toFixed(1)}%\n\n` +
      `¿Te gustaría que analice algo específico? Puedo ayudarte con:\n` +
      `• Análisis de gastos por categoría\n` +
      `• Consejos de ahorro personalizados\n` +
      `• Estado de tus metas\n` +
      `• Sugerencias de presupuesto`;
  },

  /**
   * Generate smart alerts based on financial data
   */
  generateSmartAlerts(context: FinancialContext): Array<{
    type: 'warning' | 'success' | 'info' | 'danger';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const alerts: Array<{
      type: 'warning' | 'success' | 'info' | 'danger';
      title: string;
      message: string;
      priority: 'high' | 'medium' | 'low';
    }> = [];
    
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency: context.currency }).format(amount);

    // Budget alerts
    context.budgets.forEach(budget => {
      if (budget.percentage >= 100) {
        alerts.push({
          type: 'danger',
          title: `¡Presupuesto excedido!`,
          message: `Has superado tu límite de ${budget.category}: ${formatMoney(budget.spent)}/${formatMoney(budget.limit)}`,
          priority: 'high'
        });
      } else if (budget.percentage >= 80) {
        alerts.push({
          type: 'warning',
          title: `Presupuesto casi agotado`,
          message: `${budget.category}: ${budget.percentage.toFixed(0)}% usado. Te quedan ${formatMoney(budget.limit - budget.spent)}`,
          priority: 'medium'
        });
      }
    });

    // Low savings alert
    if (context.savingsRate < 0) {
      alerts.push({
        type: 'danger',
        title: 'Gastos superan ingresos',
        message: `Este mes has gastado ${formatMoney(Math.abs(context.balance))} más de lo que ganaste. Revisa tus gastos urgentemente.`,
        priority: 'high'
      });
    } else if (context.savingsRate < 10 && context.savingsRate >= 0) {
      alerts.push({
        type: 'warning',
        title: 'Ahorro bajo',
        message: `Tu tasa de ahorro es solo ${context.savingsRate.toFixed(1)}%. Intenta llegar al 20%.`,
        priority: 'medium'
      });
    }

    // Goal progress alerts
    context.goals.forEach(goal => {
      if (goal.progress >= 100) {
        alerts.push({
          type: 'success',
          title: '¡Meta alcanzada! 🎉',
          message: `¡Felicidades! Has completado tu meta "${goal.name}"`,
          priority: 'high'
        });
      } else if (goal.progress >= 75) {
        alerts.push({
          type: 'info',
          title: 'Meta casi completada',
          message: `"${goal.name}" al ${goal.progress.toFixed(0)}%. ¡Ya casi lo logras!`,
          priority: 'low'
        });
      }
    });

    // Unusual spending (if category is >40% of total)
    const unusualSpending = context.topCategories.find(cat => cat.percentage > 40);
    if (unusualSpending) {
      alerts.push({
        type: 'warning',
        title: 'Gasto inusual detectado',
        message: `${unusualSpending.category} representa el ${unusualSpending.percentage.toFixed(0)}% de tus gastos (${formatMoney(unusualSpending.amount)})`,
        priority: 'medium'
      });
    }

    // Positive savings
    if (context.savingsRate >= 20) {
      alerts.push({
        type: 'success',
        title: '¡Excelente ahorro! 💪',
        message: `Estás ahorrando ${context.savingsRate.toFixed(1)}% de tus ingresos. ¡Sigue así!`,
        priority: 'low'
      });
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
};

export default claudeService;
