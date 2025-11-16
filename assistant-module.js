/**
 * 🤖 VIRTUAL ASSISTANT MODULE - ASISTENTE AI MEJORADO CON VERCEL
 * ==============================================================
 * Chat interactivo con análisis financiero inteligente
 * 
 * 🔧 CORREGIDO:
 * ✅ Integrado con Vercel Function (sin CORS)
 * ✅ Análisis financiero profundo con datos reales
 * ✅ Consejos de inversión y trading
 * ✅ Educación financiera personalizada
 * ✅ Modo Offline con respuestas inteligentes
 * ✅ Historial de conversaciones guardado
 * ✅ UI moderna y responsiva
 * ✅ Acciones rápidas predefinidas
 * ✅ Análisis de patrones de gasto
 * ✅ Comparación con presupuestos
 * 
 * 🎯 FUNCIONALIDADES NUEVAS:
 * - Análisis de gastos vs presupuesto
 * - Consejos de inversión básica
 * - Estrategias de trading para principiantes
 * - Optimización de finanzas personales
 */

class VirtualAssistantModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.conversationHistory = [];
        this.isOnline = navigator.onLine;
        
        // 🔥 CAMBIO: Ya no necesitamos API key en el frontend
        // Todo se maneja en el backend de Vercel
        this.apiEndpoint = '/api/claude'; // Vercel Function endpoint
        this.useOnlineMode = localStorage.getItem('assistantOnlineMode') !== 'false'; // Por defecto true
        this.currentConversationId = null;
        
        // Datos del usuario cargados
        this.userData = {
            expenses: [],
            incomes: [],
            budgets: {},
            goals: [],
            totalIncome: 0,
            totalExpenses: 0,
            recurringExpenses: []
        };
        
        // Knowledge base offline mejorada
        this.knowledgeBase = this.buildEnhancedKnowledgeBase();
        
        // Escuchar cambios de conectividad
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showConnectionStatus('online');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showConnectionStatus('offline');
        });
    }

    /**
     * 🚀 Inicializar módulo
     */
    async initialize() {
        try {
            console.log('🤖 Inicializando Asistente Virtual...');
            
            // Cargar datos del usuario
            await this.loadUserData();
            
            // Cargar historial de conversaciones
            await this.loadConversationHistory();
            
            console.log('✅ Asistente Virtual inicializado');
            console.log(`Modo: ${this.useOnlineMode ? '🌐 Online (Vercel + Claude)' : '📴 Offline'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando asistente:', error);
            return false;
        }
    }

    /**
     * 📊 Cargar datos del usuario desde Firestore
     */
    async loadUserData() {
        try {
            // Cargar gastos del mes actual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const expensesSnapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', startOfMonth.toISOString())
                .get();
            
            this.userData.expenses = expensesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar ingresos
            const incomesSnapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('income')
                .where('date', '>=', startOfMonth.toISOString())
                .get();
            
            this.userData.incomes = incomesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar presupuestos
            const budgetsSnapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('budgets')
                .get();
            
            budgetsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                this.userData.budgets[data.category] = data.amount;
            });
            
            // Cargar metas
            const goalsSnapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('goals')
                .get();
            
            this.userData.goals = goalsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Calcular totales
            this.userData.totalExpenses = this.userData.expenses.reduce(
                (sum, exp) => sum + (parseFloat(exp.amount) || 0), 0
            );
            
            this.userData.totalIncome = this.userData.incomes.reduce(
                (sum, inc) => sum + (parseFloat(inc.amount) || 0), 0
            );
            
            console.log('✅ Datos del usuario cargados:', {
                gastos: this.userData.expenses.length,
                ingresos: this.userData.incomes.length,
                presupuestos: Object.keys(this.userData.budgets).length,
                metas: this.userData.goals.length
            });
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
        }
    }

    /**
     * 📜 Cargar historial de conversaciones
     */
    async loadConversationHistory() {
        try {
            const historySnapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('assistant_conversations')
                .orderBy('timestamp', 'desc')
                .limit(1)
                .get();
            
            if (!historySnapshot.empty) {
                const lastConversation = historySnapshot.docs[0];
                this.currentConversationId = lastConversation.id;
                this.conversationHistory = lastConversation.data().messages || [];
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar historial previo');
        }
    }

    /**
     * 💾 Guardar conversación
     */
    async saveConversation() {
        try {
            if (!this.currentConversationId) {
                // Crear nueva conversación
                const docRef = await this.db
                    .collection('users')
                    .doc(this.userId)
                    .collection('assistant_conversations')
                    .add({
                        messages: this.conversationHistory,
                        timestamp: new Date(),
                        lastUpdate: new Date()
                    });
                this.currentConversationId = docRef.id;
            } else {
                // Actualizar conversación existente
                await this.db
                    .collection('users')
                    .doc(this.userId)
                    .collection('assistant_conversations')
                    .doc(this.currentConversationId)
                    .update({
                        messages: this.conversationHistory,
                        lastUpdate: new Date()
                    });
            }
        } catch (error) {
            console.error('Error guardando conversación:', error);
        }
    }

    /**
     * 💬 Enviar mensaje al asistente
     */
    async sendMessage(userMessage) {
        try {
            // Agregar mensaje del usuario al historial
            const userMsg = {
                role: 'user',
                content: userMessage,
                timestamp: new Date()
            };
            this.conversationHistory.push(userMsg);
            
            // Decidir si usar modo online u offline
            let assistantResponse;
            
            if (this.useOnlineMode && this.isOnline) {
                // Modo Online - Vercel Function + Claude API
                console.log('🌐 Usando modo online (Vercel + Claude)');
                assistantResponse = await this.getOnlineResponse(userMessage);
            } else {
                // Modo Offline - Respuestas inteligentes locales
                console.log('📴 Usando modo offline');
                assistantResponse = await this.getOfflineResponse(userMessage);
            }
            
            // Agregar respuesta del asistente
            const assistantMsg = {
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date(),
                mode: this.useOnlineMode && this.isOnline ? 'online' : 'offline'
            };
            this.conversationHistory.push(assistantMsg);
            
            // Guardar conversación
            await this.saveConversation();
            
            return assistantResponse;
            
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            return 'Lo siento, hubo un error al procesar tu mensaje. ¿Podrías intentarlo de nuevo?';
        }
    }

    /**
     * 🌐 Obtener respuesta online (Vercel Function + Claude API)
     * 🔥 CORREGIDO: Ahora usa Vercel en lugar de llamar directamente a Anthropic
     */
    async getOnlineResponse(userMessage) {
        try {
            console.log('📡 Llamando a Vercel Function...');
            
            // Preparar payload con todos los datos financieros
            const payload = {
                message: userMessage,
                expenses: this.userData.expenses,
                income: this.userData.incomes,
                budgets: Object.entries(this.userData.budgets).map(([category, amount]) => ({
                    category,
                    amount
                })),
                goals: this.userData.goals
            };

            // 🔥 Llamar a la función de Vercel
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Error en Vercel Function:', errorData);
                
                // Fallback a modo offline
                console.log('↩️ Fallback a modo offline');
                return this.getOfflineResponse(userMessage);
            }

            const data = await response.json();
            
            if (data.success && data.message) {
                console.log('✅ Respuesta de Claude recibida');
                return data.message;
            } else {
                throw new Error('Respuesta inválida del servidor');
            }

        } catch (error) {
            console.error('❌ Error en modo online:', error);
            
            // Fallback a modo offline
            console.log('↩️ Fallback a modo offline por error');
            return this.getOfflineResponse(userMessage);
        }
    }

    /**
     * 📴 Obtener respuesta offline (inteligencia local)
     */
    async getOfflineResponse(userMessage) {
        const messageLower = userMessage.toLowerCase();
        
        // 1. Análisis de intención del mensaje
        const intent = this.detectIntent(messageLower);
        
        // 2. Respuestas basadas en datos del usuario
        if (intent === 'analysis' || messageLower.includes('análisis') || messageLower.includes('resumen')) {
            return this.generateFinancialAnalysis();
        }
        
        if (intent === 'expenses' || messageLower.includes('gasté') || messageLower.includes('gastando') || messageLower.includes('gastos')) {
            return this.generateExpenseInsight();
        }
        
        if (intent === 'budget' || messageLower.includes('presupuesto')) {
            return this.generateBudgetInsight();
        }
        
        if (intent === 'goals' || messageLower.includes('meta') || messageLower.includes('objetivo')) {
            return this.generateGoalsInsight();
        }
        
        if (intent === 'savings' || messageLower.includes('ahorr')) {
            return this.generateSavingsAdvice();
        }
        
        if (messageLower.includes('inver') || messageLower.includes('trading')) {
            return this.generateInvestmentAdvice();
        }
        
        // 3. Búsqueda en knowledge base
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            const hasKeyword = data.keywords.some(kw => messageLower.includes(kw));
            if (hasKeyword) {
                const response = data.responses[Math.floor(Math.random() * data.responses.length)];
                return this.personalizeResponse(response, category);
            }
        }
        
        // 4. Respuesta por defecto
        return this.getDefaultResponse();
    }

    // ============================================
    // CONTINUARÁ EN LA PARTE 2...
    // ============================================
    // ============================================
    // PARTE 2: FUNCIONES DE ANÁLISIS FINANCIERO
    // ============================================

    /**
     * 🔍 Detectar intención del mensaje
     */
    detectIntent(message) {
        const intents = {
            analysis: ['análisis', 'resumen', 'situación', 'estado', 'cómo voy', 'overview'],
            expenses: ['gasté', 'gastando', 'gasto', 'cuánto', 'dinero'],
            budget: ['presupuesto', 'límite', 'cuánto puedo gastar'],
            goals: ['meta', 'objetivo', 'ahorro', 'ahorrar'],
            savings: ['ahorrar', 'guardar', 'economizar'],
            investment: ['invertir', 'inversión', 'trading', 'acciones']
        };
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(kw => message.includes(kw))) {
                return intent;
            }
        }
        
        return 'general';
    }

    /**
     * 📊 Generar análisis financiero completo
     */
    generateFinancialAnalysis() {
        const { totalIncome, totalExpenses, expenses, budgets, goals } = this.userData;
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
        
        let analysis = '📊 **ANÁLISIS FINANCIERO COMPLETO**\n\n';
        
        // Balance general
        analysis += `💰 **Balance del mes:**\n`;
        analysis += `• Ingresos: $${totalIncome.toFixed(2)}\n`;
        analysis += `• Gastos: $${totalExpenses.toFixed(2)}\n`;
        analysis += `• Balance: $${balance.toFixed(2)} ${balance >= 0 ? '✅' : '⚠️'}\n`;
        analysis += `• Tasa de ahorro: ${savingsRate}%\n\n`;
        
        // Estado del balance
        if (balance < 0) {
            analysis += `🚨 **Alerta:** Estás gastando más de lo que ganas. Necesitas ajustar tu presupuesto urgentemente.\n\n`;
        } else if (savingsRate < 10) {
            analysis += `⚠️ **Atención:** Tu tasa de ahorro es baja. Objetivo recomendado: 20%.\n\n`;
        } else if (savingsRate >= 20) {
            analysis += `🌟 **¡Excelente!** Estás ahorrando ${savingsRate}%. Sigue así.\n\n`;
        }
        
        // Análisis por categoría
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (topCategories.length > 0) {
            analysis += `📈 **Top 3 Categorías de Gasto:**\n`;
            topCategories.forEach(([cat, amount], i) => {
                const emoji = ['🥇', '🥈', '🥉'][i];
                const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                analysis += `${emoji} ${cat}: $${amount.toFixed(2)} (${percentage}%)\n`;
            });
            analysis += '\n';
        }
        
        // Estado de presupuestos
        if (Object.keys(budgets).length > 0) {
            analysis += `🎯 **Estado de Presupuestos:**\n`;
            let budgetWarnings = 0;
            
            for (const [category, limit] of Object.entries(budgets)) {
                const spent = categoryTotals[category] || 0;
                const percentage = ((spent / limit) * 100).toFixed(0);
                
                let status = '✅';
                if (percentage >= 95) {
                    status = '🚨';
                    budgetWarnings++;
                } else if (percentage >= 80) {
                    status = '⚠️';
                    budgetWarnings++;
                }
                
                analysis += `${status} ${category}: ${percentage}% usado\n`;
            }
            
            if (budgetWarnings > 0) {
                analysis += `\n⚠️ Tienes ${budgetWarnings} ${budgetWarnings === 1 ? 'presupuesto' : 'presupuestos'} cerca del límite.\n`;
            }
            analysis += '\n';
        }
        
        // Recomendaciones
        analysis += this.generateRecommendations(balance, categoryTotals, savingsRate);
        
        return analysis;
    }

    /**
     * 💸 Generar insight de gastos
     */
    generateExpenseInsight() {
        const { expenses, totalExpenses } = this.userData;
        
        if (expenses.length === 0) {
            return '📝 Aún no tienes gastos registrados este mes. ¡Empieza a registrar tus gastos para obtener análisis personalizados!';
        }
        
        const avgDaily = totalExpenses / new Date().getDate(); // Promedio hasta hoy
        const projectedMonthly = avgDaily * 30;
        
        // Análisis por categoría
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const topCategory = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0];
        
        let insight = `💸 **ANÁLISIS DE GASTOS**\n\n`;
        insight += `📅 **Este mes (hasta hoy):**\n`;
        insight += `• Total gastado: $${totalExpenses.toFixed(2)}\n`;
        insight += `• Promedio diario: $${avgDaily.toFixed(2)}\n`;
        insight += `• Proyección mensual: $${projectedMonthly.toFixed(2)}\n`;
        insight += `• Número de gastos: ${expenses.length}\n\n`;
        
        if (topCategory) {
            const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(1);
            insight += `🎯 **Categoría principal:**\n`;
            insight += `${topCategory[0]}: $${topCategory[1].toFixed(2)} (${percentage}%)\n\n`;
        }
        
        // Análisis de tendencia
        const recentExpenses = expenses.slice(-7); // Últimos 7 gastos
        const avgRecent = recentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0) / recentExpenses.length;
        
        if (avgRecent > avgDaily * 1.2) {
            insight += `📈 **Tendencia:** Tus gastos recientes están por encima del promedio. Modera un poco.\n\n`;
        }
        
        // Consejo personalizado
        if (avgDaily > 50) {
            const savingsPotential = avgDaily * 0.15 * 30; // 15% de ahorro
            insight += `💡 **Oportunidad de ahorro:**\n`;
            insight += `Reduciendo un 15% tus gastos diarios, podrías ahorrar $${savingsPotential.toFixed(2)} al mes.\n`;
        }
        
        return insight;
    }

    /**
     * 💰 Generar insight de presupuesto
     */
    generateBudgetInsight() {
        const { budgets, expenses } = this.userData;
        
        if (Object.keys(budgets).length === 0) {
            return `📋 **CONFIGURA TU PRESUPUESTO**\n\n` +
                   `Aún no has configurado presupuestos. Te recomiendo usar la regla 50/30/20:\n\n` +
                   `💡 **Regla 50/30/20:**\n` +
                   `• 50% - Necesidades (comida, vivienda, transporte)\n` +
                   `• 30% - Gustos (entretenimiento, compras)\n` +
                   `• 20% - Ahorro e inversión\n\n` +
                   `Ve a la sección de Presupuesto para configurar tus límites mensuales.`;
        }
        
        const categoryTotals = this.calculateCategoryTotals(expenses);
        
        let insight = '💰 **ESTADO DEL PRESUPUESTO**\n\n';
        
        const budgetItems = Object.entries(budgets).map(([category, limit]) => {
            const spent = categoryTotals[category] || 0;
            const remaining = limit - spent;
            const percentage = (spent / limit) * 100;
            
            let status = '✅';
            let advice = '';
            
            if (percentage >= 95) {
                status = '🚨';
                advice = '¡Límite alcanzado!';
            } else if (percentage >= 80) {
                status = '⚠️';
                advice = 'Cerca del límite';
            } else if (percentage < 50) {
                status = '💚';
                advice = 'Excelente control';
            }
            
            return {
                category,
                spent,
                limit,
                remaining,
                percentage,
                status,
                advice
            };
        });
        
        // Ordenar por porcentaje (más críticos primero)
        budgetItems.sort((a, b) => b.percentage - a.percentage);
        
        budgetItems.forEach(item => {
            insight += `${item.status} **${item.category}**\n`;
            insight += `$${item.spent.toFixed(2)} / $${item.limit.toFixed(2)} (${item.percentage.toFixed(0)}%)\n`;
            insight += `Disponible: $${item.remaining.toFixed(2)}`;
            if (item.advice) {
                insight += ` - ${item.advice}`;
            }
            insight += `\n\n`;
        });
        
        // Resumen general
        const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
        const totalSpent = Object.values(categoryTotals).reduce((sum, s) => sum + s, 0);
        const overallPercentage = ((totalSpent / totalBudget) * 100).toFixed(1);
        
        insight += `📊 **Resumen General:**\n`;
        insight += `Total presupuestado: $${totalBudget.toFixed(2)}\n`;
        insight += `Total gastado: $${totalSpent.toFixed(2)}\n`;
        insight += `Uso general: ${overallPercentage}%\n`;
        
        return insight;
    }

    /**
     * 🎯 Generar insight de metas
     */
    generateGoalsInsight() {
        const { goals, totalIncome, totalExpenses } = this.userData;
        
        if (goals.length === 0) {
            return `🎯 **ESTABLECE TUS METAS**\n\n` +
                   `Aún no has creado metas de ahorro. ¡Define una meta y te ayudaré a alcanzarla!\n\n` +
                   `💡 **Método SMART para metas:**\n` +
                   `• **E**specífica: Define claramente qué quieres\n` +
                   `• **M**edible: Con monto y fecha específicos\n` +
                   `• **A**lcanzable: Realista según tus ingresos\n` +
                   `• **R**elevante: Importante para ti\n` +
                   `• **T**emporal: Con fecha límite\n\n` +
                   `Ejemplo: "Ahorrar $5,000 para vacaciones en 6 meses"`;
        }
        
        const balance = totalIncome - totalExpenses;
        
        let insight = '🎯 **PROGRESO DE METAS**\n\n';
        
        goals.forEach(goal => {
            const current = parseFloat(goal.current) || 0;
            const target = parseFloat(goal.target) || 1;
            const progress = ((current / target) * 100).toFixed(1);
            const remaining = target - current;
            
            let emoji = '🌱';
            let status = 'En progreso';
            
            if (progress >= 100) {
                emoji = '🎉';
                status = '¡Completada!';
            } else if (progress >= 75) {
                emoji = '🔥';
                status = 'Casi llegando';
            } else if (progress >= 50) {
                emoji = '💪';
                status = 'Buen avance';
            } else if (progress >= 25) {
                emoji = '📈';
                status = 'Avanzando';
            }
            
            insight += `${emoji} **${goal.name}**\n`;
            insight += `• Progreso: ${progress}% - ${status}\n`;
            insight += `• Actual: $${current.toFixed(2)} / $${target.toFixed(2)}\n`;
            insight += `• Falta: $${remaining.toFixed(2)}\n`;
            
            // Calcular meses para completar
            if (balance > 0 && remaining > 0) {
                const monthsNeeded = Math.ceil(remaining / balance);
                insight += `• Tiempo estimado: ${monthsNeeded} ${monthsNeeded === 1 ? 'mes' : 'meses'} (al ritmo actual)\n`;
            }
            
            insight += `\n`;
        });
        
        // Consejo general
        if (balance > 0) {
            insight += `💡 **Consejo:** Con tu ahorro mensual actual de $${balance.toFixed(2)}, `;
            insight += `puedes destinar una parte a tus metas de manera automática.\n`;
        } else {
            insight += `⚠️ **Atención:** Necesitas generar un balance positivo para avanzar en tus metas. `;
            insight += `Revisa tus gastos y ajusta tu presupuesto.\n`;
        }
        
        return insight;
    }

    /**
     * 💎 Generar consejos de ahorro
     */
    generateSavingsAdvice() {
        const { totalIncome, totalExpenses, expenses } = this.userData;
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        
        let advice = '💎 **CONSEJOS DE AHORRO PERSONALIZADOS**\n\n';
        
        // Análisis de tasa de ahorro
        advice += `📊 **Tu tasa de ahorro actual: ${savingsRate.toFixed(1)}%**\n\n`;
        
        if (savingsRate < 10) {
            advice += `🚨 **Nivel Crítico** - Objetivo recomendado: 20%\n\n`;
            advice += `**Plan de acción inmediato:**\n`;
            advice += `1. 🔍 Identifica 3 gastos que puedas reducir o eliminar\n`;
            advice += `2. 💳 Cancela suscripciones que no uses activamente\n`;
            advice += `3. 🍽️ Reduce comidas fuera de casa a 2 veces por semana\n`;
            advice += `4. 🛒 Haz lista antes de comprar (evita compras impulsivas)\n`;
            advice += `5. 💰 Automatiza ahorro del 10% apenas recibas ingresos\n\n`;
            
            const targetSavings = totalIncome * 0.20;
            const needToSave = targetSavings - savings;
            advice += `💡 **Meta:** Necesitas ahorrar $${needToSave.toFixed(2)} más para llegar al 20%\n`;
            
        } else if (savingsRate < 20) {
            advice += `⚠️ **Nivel Intermedio** - Vas bien, pero puedes mejorar\n\n`;
            advice += `**Siguientes pasos:**\n`;
            advice += `1. 📈 Aumenta tu ahorro gradualmente (1% cada mes)\n`;
            advice += `2. 🎯 Establece una meta de ahorro específica\n`;
            advice += `3. 💳 Paga deudas de alto interés primero\n`;
            advice += `4. 🏪 Compara precios antes de comprar\n`;
            advice += `5. ⚡ Reduce gastos en servicios (luz, gas, internet)\n\n`;
            
            const targetSavings = totalIncome * 0.20;
            const needToSave = targetSavings - savings;
            advice += `💡 **Próximo nivel:** Solo $${needToSave.toFixed(2)} más para alcanzar el 20%\n`;
            
        } else {
            advice += `🌟 **¡Excelente nivel!** - Estás en la élite financiera\n\n`;
            advice += `**Maximiza tus finanzas:**\n`;
            advice += `1. 🏦 Crea fondo de emergencia (3-6 meses de gastos)\n`;
            advice += `2. 📈 Invierte en instrumentos de largo plazo\n`;
            advice += `3. 🎓 Invierte en educación financiera\n`;
            advice += `4. 💼 Considera diversificar ingresos\n`;
            advice += `5. 🎯 Establece nuevas metas financieras ambiciosas\n\n`;
            
            advice += `💡 **Oportunidad:** Con tu capacidad de ahorro, puedes crear riqueza a largo plazo\n`;
        }
        
        // Análisis de categorías con potencial de ahorro
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const discretionaryCategories = ['Entretenimiento', 'Restaurantes', 'Compras', 'Suscripciones'];
        
        const potentialSavings = discretionaryCategories
            .filter(cat => categoryTotals[cat])
            .map(cat => ({
                category: cat,
                amount: categoryTotals[cat],
                potential: categoryTotals[cat] * 0.30 // 30% de reducción posible
            }));
        
        if (potentialSavings.length > 0) {
            const totalPotential = potentialSavings.reduce((sum, p) => sum + p.potential, 0);
            advice += `\n🎯 **Potencial de ahorro identificado:**\n`;
            advice += `Reduciendo 30% en gastos discrecionales: $${totalPotential.toFixed(2)}/mes\n\n`;
            
            potentialSavings.forEach(p => {
                advice += `• ${p.category}: Ahorrar $${p.potential.toFixed(2)}\n`;
            });
        }
        
        return advice;
    }

    /**
     * 📈 Generar consejos de inversión y trading
     * 🆕 NUEVA FUNCIÓN
     */
    generateInvestmentAdvice() {
        const { totalIncome, totalExpenses } = this.userData;
        const disposableIncome = totalIncome - totalExpenses;
        
        let advice = '📈 **GUÍA DE INVERSIÓN Y TRADING PARA PRINCIPIANTES**\n\n';
        
        // Evaluar capacidad de inversión
        if (disposableIncome <= 0) {
            advice += `⚠️ **Primero lo primero:** Necesitas tener un balance positivo antes de invertir.\n\n`;
            advice += `**Pasos previos:**\n`;
            advice += `1. Reduce gastos y genera ahorro mensual\n`;
            advice += `2. Crea un fondo de emergencia (3-6 meses)\n`;
            advice += `3. Elimina deudas de alto interés\n`;
            advice += `4. Aprende sobre finanzas personales\n`;
            return advice;
        }
        
        const emergencyFund = totalExpenses * 3; // 3 meses de gastos
        const canInvest = disposableIncome > 0;
        
        advice += `💰 **Tu capacidad de inversión:** $${disposableIncome.toFixed(2)}/mes\n\n`;
        
        if (canInvest) {
            advice += `**📚 PASO 1: FUNDAMENTOS**\n`;
            advice += `Antes de invertir, asegúrate de:\n`;
            advice += `• ✅ Tener fondo de emergencia ($${emergencyFund.toFixed(2)})\n`;
            advice += `• ✅ No tener deudas de alto interés\n`;
            advice += `• ✅ Educarte sobre inversiones básicas\n`;
            advice += `• ✅ Definir tu perfil de riesgo\n\n`;
            
            advice += `**💼 PASO 2: OPCIONES DE INVERSIÓN**\n\n`;
            
            // Inversiones conservadoras
            advice += `🔵 **Nivel Principiante (Bajo Riesgo):**\n`;
            advice += `• CETES (México): Rendimiento 10-11% anual\n`;
            advice += `• Fondos indexados (S&P 500): Promedio 10% anual\n`;
            advice += `• Bonos gubernamentales: Bajo riesgo, rendimiento estable\n`;
            advice += `• Certificados de depósito (CDs): Seguro y predecible\n\n`;
            
            // Inversiones moderadas
            advice += `🟡 **Nivel Intermedio (Riesgo Moderado):**\n`;
            advice += `• ETFs diversificados: Balance riesgo/rendimiento\n`;
            advice += `• Fondos de inversión: Administración profesional\n`;
            advice += `• Bienes raíces (REITs): Ingreso pasivo + apreciación\n`;
            advice += `• Acciones blue chip: Empresas establecidas\n\n`;
            
            // Inversiones avanzadas
            advice += `🔴 **Nivel Avanzado (Alto Riesgo):**\n`;
            advice += `• Trading de acciones: Requiere estudio intensivo\n`;
            advice += `• Opciones y futuros: Para traders experimentados\n`;
            advice += `• Criptomonedas: Alta volatilidad, solo 5-10% portafolio\n`;
            advice += `• Startups: Alto riesgo, alto potencial\n\n`;
            
            advice += `**📊 PASO 3: ESTRATEGIA RECOMENDADA**\n\n`;
            const monthlyInvestment = Math.min(disposableIncome * 0.7, disposableIncome);
            
            advice += `Invierte: $${monthlyInvestment.toFixed(2)}/mes\n\n`;
            advice += `Distribución sugerida:\n`;
            advice += `• 60% - Fondos indexados (S&P 500)\n`;
            advice += `• 25% - CETES o bonos\n`;
            advice += `• 10% - ETFs sectoriales\n`;
            advice += `• 5% - Educación/práctica trading\n\n`;
            
            advice += `**🎯 PARA TRADING:**\n`;
            advice += `Si quieres hacer trading, empieza con:\n`;
            advice += `1. 📚 Educación: Cursos, libros, simuladores\n`;
            advice += `2. 💰 Capital pequeño: Máximo 10% de tus ahorros\n`;
            advice += `3. 📊 Paper trading: Practica sin dinero real 3-6 meses\n`;
            advice += `4. 📈 Estrategia simple: Aprende análisis técnico básico\n`;
            advice += `5. 🛡️ Stop loss: SIEMPRE protege tu capital\n`;
            advice += `6. 🧘 Control emocional: No operes con emociones\n\n`;
            
            advice += `**⚠️ REGLAS DE ORO:**\n`;
            advice += `• Nunca inviertas dinero que necesites a corto plazo\n`;
            advice += `• Diversifica (no pongas todo en un solo lugar)\n`;
            advice += `• Piensa a largo plazo (5-10+ años)\n`;
            advice += `• Reinvierte los rendimientos (interés compuesto)\n`;
            advice += `• Edúcate constantemente\n`;
        }
        
        return advice;
    }

    // ============================================
    // CONTINUARÁ EN LA PARTE 3...
    // ============================================
    // ============================================
    // PARTE 3: KNOWLEDGE BASE Y FUNCIONES AUXILIARES
    // ============================================

    /**
     * 📚 Construir knowledge base mejorada
     */
    buildEnhancedKnowledgeBase() {
        return {
            budget: {
                keywords: ['presupuesto', 'límite', 'cuánto puedo gastar', 'control'],
                responses: [
                    `📊 Un presupuesto es tu plan de gastos mensual. Te ayuda a controlar tus finanzas.\n\n` +
                    `**Regla 50/30/20:**\n` +
                    `• 50% Necesidades\n• 30% Gustos\n• 20% Ahorro/Inversión\n\n` +
                    `Configura tus presupuestos en la sección de Presupuesto.`,
                    
                    `💰 Para crear un presupuesto efectivo:\n\n` +
                    `1. Calcula tus ingresos mensuales\n` +
                    `2. Lista todos tus gastos fijos\n` +
                    `3. Define límites por categoría\n` +
                    `4. Revisa semanalmente\n` +
                    `5. Ajusta según necesites\n\n` +
                    `Un buen presupuesto es flexible pero disciplinado.`
                ]
            },
            
            savings: {
                keywords: ['ahorrar', 'ahorro', 'guardar dinero', 'economizar'],
                responses: [
                    `💎 Tips para ahorrar efectivamente:\n\n` +
                    `1. Paga primero a ti mismo (automatiza)\n` +
                    `2. Regla de las 24 horas (espera antes de comprar)\n` +
                    `3. Reduce gastos hormiga\n` +
                    `4. Compara precios siempre\n` +
                    `5. Usa cupones y promociones\n\n` +
                    `Meta: Ahorra mínimo 20% de tus ingresos.`,
                    
                    `🎯 Método del sobre (versión digital):\n\n` +
                    `Divide tu dinero en categorías:\n` +
                    `• Necesidades - 50%\n• Gustos - 30%\n• Ahorro - 20%\n\n` +
                    `Cuando una categoría se vacía, espera al siguiente mes. ¡Disciplina!`
                ]
            },
            
            investment: {
                keywords: ['invertir', 'inversión', 'acciones', 'bolsa', 'stocks'],
                responses: [
                    `📈 Empezar a invertir:\n\n` +
                    `**Para principiantes:**\n` +
                    `1. Fondo de emergencia primero (3-6 meses)\n` +
                    `2. Elimina deudas de alto interés\n` +
                    `3. Empieza con fondos indexados (S&P 500)\n` +
                    `4. Invierte regularmente (DCA - Dollar Cost Averaging)\n` +
                    `5. Piensa a largo plazo (5-10+ años)\n\n` +
                    `Recuerda: Nunca inviertas dinero que necesites pronto.`,
                    
                    `💼 Tipos de inversión por perfil:\n\n` +
                    `🔵 Conservador: CETES, bonos, CDs\n` +
                    `🟡 Moderado: ETFs, fondos mutuos\n` +
                    `🔴 Agresivo: Acciones individuales, crypto (max 10%)\n\n` +
                    `Diversifica SIEMPRE. No pongas todos los huevos en una canasta.`
                ]
            },
            
            trading: {
                keywords: ['trading', 'trade', 'comprar acciones', 'trader', 'day trading'],
                responses: [
                    `⚡ Trading para principiantes:\n\n` +
                    `**ADVERTENCIA:** 90% de traders pierden dinero.\n\n` +
                    `Si quieres intentarlo:\n` +
                    `1. Edúcate 6-12 meses (cursos, libros, YouTube)\n` +
                    `2. Paper trading 3-6 meses (sin dinero real)\n` +
                    `3. Empieza con $500-1000 máximo\n` +
                    `4. Usa SIEMPRE stop loss\n` +
                    `5. Máximo 1-2% de riesgo por trade\n\n` +
                    `Mejor opción: Invierte a largo plazo en índices.`,
                    
                    `📊 Conceptos básicos de trading:\n\n` +
                    `• **Stop Loss:** Límite de pérdida automático\n` +
                    `• **Take Profit:** Vende automáticamente en ganancia\n` +
                    `• **Risk/Reward:** Mínimo 1:2 (arriesga $1 para ganar $2)\n` +
                    `• **Position Size:** Nunca arriesgues más del 2%\n` +
                    `• **Diversificación:** Múltiples activos\n\n` +
                    `La disciplina y el control emocional son el 80% del éxito.`
                ]
            },
            
            debt: {
                keywords: ['deuda', 'debo', 'crédito', 'préstamo', 'tarjeta'],
                responses: [
                    `💳 Manejo de deudas:\n\n` +
                    `**Método Avalancha (óptimo):**\n` +
                    `Paga primero deudas con mayor interés.\n\n` +
                    `**Método Bola de Nieve (psicológico):**\n` +
                    `Paga primero deudas más pequeñas.\n\n` +
                    `Tips:\n` +
                    `• Paga más del mínimo siempre\n` +
                    `• Consolida si es posible\n` +
                    `• No adquieras más deuda\n` +
                    `• Usa windfalls para pagar`,
                    
                    `🎯 Prioridad de pago:\n\n` +
                    `1. Tarjetas de crédito (18-40% anual)\n` +
                    `2. Préstamos personales (12-25%)\n` +
                    `3. Préstamos estudiantiles (6-8%)\n` +
                    `4. Hipoteca (3-6%)\n\n` +
                    `Paga las de mayor interés primero. Cada peso cuenta.`
                ]
            },
            
            emergency: {
                keywords: ['emergencia', 'fondo', 'imprevistos', 'contingencia'],
                responses: [
                    `🚨 Fondo de emergencia:\n\n` +
                    `**¿Cuánto?** 3-6 meses de gastos\n` +
                    `**¿Dónde?** Cuenta de ahorro líquida\n` +
                    `**¿Para qué?** Emergencias REALES:\n` +
                    `• Pérdida de empleo\n• Emergencia médica\n• Reparación urgente\n\n` +
                    `**NO es para:**\n` +
                    `• Vacaciones\n• Compras\n• Antojos\n\n` +
                    `Construye $1000 primero, luego ve por los 3-6 meses.`
                ]
            },
            
            income: {
                keywords: ['ingresos', 'ganar', 'dinero extra', 'side hustle'],
                responses: [
                    `💰 Aumentar ingresos:\n\n` +
                    `**Corto plazo:**\n` +
                    `• Freelancing en tu área\n• Vende cosas que no uses\n` +
                    `• Uber/Rappi part-time\n• Tutorías o clases\n\n` +
                    `**Largo plazo:**\n` +
                    `• Desarrolla nuevas habilidades\n• Negocía aumento\n` +
                    `• Cambia de trabajo\n• Inicia negocio\n\n` +
                    `Recuerda: Aumentar ingresos + controlar gastos = Riqueza`
                ]
            },
            
            goals: {
                keywords: ['meta', 'objetivo', 'alcanzar', 'lograr'],
                responses: [
                    `🎯 Establecer metas SMART:\n\n` +
                    `• **E**specífica: Clara y concreta\n` +
                    `• **M**edible: Con números definidos\n` +
                    `• **A**lcanzable: Realista\n` +
                    `• **R**elevante: Importante para ti\n` +
                    `• **T**emporal: Con fecha límite\n\n` +
                    `Ejemplo: "Ahorrar $10,000 para enganche de auto en 12 meses" ✅\n` +
                    `NO: "Quiero ahorrar" ❌`
                ]
            }
        };
    }

    /**
     * 📋 Calcular totales por categoría
     */
    calculateCategoryTotals(expenses) {
        const totals = {};
        if (!expenses || !Array.isArray(expenses)) return totals;
        
        expenses.forEach(expense => {
            const category = expense.category || 'Sin categoría';
            totals[category] = (totals[category] || 0) + parseFloat(expense.amount || 0);
        });
        return totals;
    }

    /**
     * 💡 Generar recomendaciones
     */
    generateRecommendations(balance, categoryTotals, savingsRate) {
        let recommendations = '💡 **RECOMENDACIONES PERSONALIZADAS:**\n\n';
        
        // Recomendación según balance
        if (balance < 0) {
            recommendations += `🚨 **URGENTE:** Gastas más de lo que ganas.\n`;
            recommendations += `Acción inmediata: Reduce gastos en 20% este mes.\n\n`;
        } else if (savingsRate < 10) {
            recommendations += `⚠️ **IMPORTANTE:** Aumenta tu tasa de ahorro.\n`;
            recommendations += `Meta: Llegar al 20% en 3 meses.\n\n`;
        }
        
        // Análisis de categorías
        const sortedCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1]);
        
        if (sortedCategories.length > 0) {
            const topCategory = sortedCategories[0];
            const topAmount = topCategory[1];
            const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
            const topPercentage = ((topAmount / totalSpent) * 100).toFixed(0);
            
            if (topPercentage > 40) {
                recommendations += `📊 **ATENCIÓN:** ${topCategory[0]} representa el ${topPercentage}% de tus gastos.\n`;
                recommendations += `Considera reducir esta categoría en 15-20%.\n\n`;
            }
        }
        
        // Consejos generales
        recommendations += `**Pasos siguientes:**\n`;
        recommendations += `1. Revisa tus gastos semanalmente\n`;
        recommendations += `2. Automatiza tu ahorro\n`;
        recommendations += `3. Elimina gastos innecesarios\n`;
        recommendations += `4. Establece metas claras\n`;
        
        return recommendations;
    }

    /**
     * 🔧 Personalizar respuesta
     */
    personalizeResponse(response, category) {
        // Agregar datos específicos del usuario si están disponibles
        if (category === 'budget' && Object.keys(this.userData.budgets).length > 0) {
            response += '\n\n💡 Ve a la sección de Presupuesto para ajustar tus límites mensuales.';
        }
        
        if (category === 'savings' && this.userData.totalExpenses > 0) {
            const savingsPotential = this.userData.totalExpenses * 0.15;
            response += `\n\n💰 Potencial: Podrías ahorrar $${savingsPotential.toFixed(2)}/mes reduciendo un 15% tus gastos.`;
        }
        
        return response;
    }

    /**
     * 🏠 Respuesta por defecto
     */
    getDefaultResponse() {
        const responses = [
            '¡Hola! 👋 Soy tu asistente financiero inteligente.\n\n' +
            'Puedo ayudarte con:\n' +
            '• 📊 Análisis de gastos e ingresos\n' +
            '• 💰 Optimización de presupuestos\n' +
            '• 🎯 Seguimiento de metas\n' +
            '• 💎 Consejos de ahorro\n' +
            '• 📈 Guías de inversión y trading\n\n' +
            '¿En qué te puedo ayudar?',
            
            'Estoy aquí para mejorar tu salud financiera. 💪\n\n' +
            'Algunas cosas que puedo hacer:\n' +
            '• Analizar tus patrones de gasto\n' +
            '• Darte tips personalizados de ahorro\n' +
            '• Explicarte conceptos de inversión\n' +
            '• Ayudarte a alcanzar tus metas\n\n' +
            '¿Qué quieres saber?',
            
            '¡Bienvenido! 🤖\n\n' +
            'Como tu asesor financiero personal, puedo:\n' +
            '✅ Revisar tu situación financiera\n' +
            '✅ Crear planes de ahorro personalizados\n' +
            '✅ Enseñarte sobre inversiones\n' +
            '✅ Darte consejos de trading básico\n\n' +
            'Pregúntame cualquier cosa sobre finanzas.'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 📡 Mostrar estado de conexión
     */
    showConnectionStatus(status) {
        const statusMessage = status === 'online' 
            ? '🌐 Modo Online activado - Análisis con Claude AI'
            : '📴 Sin conexión - Usando modo offline';
        
        console.log(statusMessage);
        
        // Mostrar toast si Toastify está disponible
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: statusMessage,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: status === 'online' 
                        ? 'linear-gradient(135deg, #05BFDB 0%, #0891B2 100%)'
                        : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                }
            }).showToast();
        }
    }

    /**
     * 🎨 Renderizar interfaz del asistente
     */
    renderAssistantUI() {
        return `
            <div class="assistant-container">
                <div class="assistant-header">
                    <div class="assistant-title">
                        <span class="assistant-icon">🤖</span>
                        <h2>Asistente Financiero AI</h2>
                    </div>
                    <div class="assistant-mode">
                        ${this.useOnlineMode ? '🌐 Online' : '📴 Offline'}
                    </div>
                    <button class="assistant-close" onclick="window.closeAssistant()">✕</button>
                </div>
                
                <div class="assistant-quick-actions">
                    <button class="quick-action-btn" onclick="window.assistantQuickAction('analysis')">
                        📊 Análisis
                    </button>
                    <button class="quick-action-btn" onclick="window.assistantQuickAction('expenses')">
                        💸 Gastos
                    </button>
                    <button class="quick-action-btn" onclick="window.assistantQuickAction('budget')">
                        💰 Presupuesto
                    </button>
                    <button class="quick-action-btn" onclick="window.assistantQuickAction('savings')">
                        💎 Ahorro
                    </button>
                    <button class="quick-action-btn" onclick="window.assistantQuickAction('investment')">
                        📈 Inversión
                    </button>
                </div>
                
                <div class="assistant-chat" id="assistant-chat">
                    ${this.renderChatHistory()}
                </div>
                
                <div class="assistant-input-container">
                    <textarea 
                        id="assistant-input"
                        class="assistant-input"
                        placeholder="Pregúntame sobre finanzas, gastos, ahorro, inversiones..."
                        rows="2"
                    ></textarea>
                    <button class="assistant-send-btn" onclick="window.sendAssistantMessage()">
                        <span class="send-icon">📤</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 💬 Renderizar historial de chat
     */
    renderChatHistory() {
        if (this.conversationHistory.length === 0) {
            return `
                <div class="assistant-welcome">
                    <div class="welcome-icon">👋</div>
                    <h3>¡Hola! Soy tu asistente financiero</h3>
                    <p>Pregúntame sobre tus finanzas, gastos, presupuestos, ahorro o inversiones.</p>
                    <div class="welcome-examples">
                        <p><strong>Ejemplos:</strong></p>
                        <ul>
                            <li>"¿Cómo van mis gastos este mes?"</li>
                            <li>"Dame consejos para ahorrar más"</li>
                            <li>"¿Cómo puedo empezar a invertir?"</li>
                            <li>"Explícame sobre trading"</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        return this.conversationHistory.map(msg => {
            const isUser = msg.role === 'user';
            const mode = msg.mode === 'online' ? '🌐' : '📴';
            
            return `
                <div class="chat-message ${isUser ? 'user-message' : 'assistant-message'}">
                    <div class="message-avatar">
                        ${isUser ? '👤' : '🤖'}
                    </div>
                    <div class="message-content">
                        <div class="message-text">${this.formatMessage(msg.content)}</div>
                        ${!isUser ? `<div class="message-mode">${mode}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 📝 Formatear mensaje con markdown básico
     */
    formatMessage(text) {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    /**
     * 🔄 Actualizar UI del chat
     */
    updateChatUI() {
        const chatContainer = document.getElementById('assistant-chat');
        if (chatContainer) {
            chatContainer.innerHTML = this.renderChatHistory();
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    /**
     * 🎬 Acción rápida
     */
    async quickAction(action) {
        const messages = {
            analysis: '¿Cómo está mi situación financiera este mes?',
            expenses: '¿Cuánto he gastado y en qué categorías?',
            budget: '¿Cómo va mi presupuesto?',
            savings: 'Dame consejos para ahorrar más dinero',
            investment: '¿Cómo puedo empezar a invertir mi dinero?'
        };
        
        const message = messages[action] || 'Ayúdame con mis finanzas';
        
        // Agregar mensaje del usuario
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        this.updateChatUI();
        
        // Obtener respuesta
        const response = await this.sendMessage(message);
        this.updateChatUI();
        
        return response;
    }

    /**
     * 🗑️ Limpiar conversación
     */
    clearConversation() {
        this.conversationHistory = [];
        this.currentConversationId = null;
        this.updateChatUI();
    }

    /**
     * ⚙️ Cambiar modo (online/offline)
     */
    toggleMode() {
        this.useOnlineMode = !this.useOnlineMode;
        localStorage.setItem('assistantOnlineMode', this.useOnlineMode);
        
        const modeText = this.useOnlineMode ? 'Online (Claude AI)' : 'Offline';
        console.log(`🔄 Modo cambiado a: ${modeText}`);
        
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: `Modo ${modeText} activado`,
                duration: 2000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: 'linear-gradient(135deg, #05BFDB 0%, #0891B2 100%)'
                }
            }).showToast();
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.VirtualAssistantModule = VirtualAssistantModule;
    console.log('✅ Módulo de Asistente Virtual cargado (versión mejorada con Vercel)');
}
