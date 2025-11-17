/**
 * 🤖 VIRTUAL ASSISTANT MODULE - PARTE 1: ASISTENTE AI MEJORADO
 * =============================================================
 * Chat interactivo con análisis financiero inteligente
 * 
 * Características:
 * ✅ Modo Offline - Respuestas inteligentes sin API
 * ✅ Modo Online - Claude API para respuestas avanzadas
 * ✅ Análisis financiero basado en tus datos reales
 * ✅ Consejos personalizados según tu situación
 * ✅ Historial de conversaciones guardado
 * ✅ UI moderna y responsiva
 * ✅ Acciones rápidas predefinidas
 * ✅ Análisis de patrones de gasto
 */

class VirtualAssistantModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.conversationHistory = [];
        this.isOnline = navigator.onLine;
        this.claudeAPIKey = localStorage.getItem('claudeAPIKey') || '';
        this.useOnlineMode = localStorage.getItem('assistantOnlineMode') === 'true';
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
            
            // Cargar configuración
            await this.loadSettings();
            
            // Cargar datos del usuario
            await this.loadUserData();
            
            // Cargar historial de conversaciones
            await this.loadConversationHistory();
            
            console.log('✅ Asistente Virtual inicializado');
            console.log(`Modo: ${this.useOnlineMode ? '🌐 Online' : '📴 Offline'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando asistente:', error);
            return false;
        }
    }

    /**
     * ⚙️ Cargar configuración
     */
    async loadSettings() {
        try {
            const settingsDoc = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('assistant')
                .get();
            
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                this.claudeAPIKey = settings.apiKey || this.claudeAPIKey;
                this.useOnlineMode = settings.onlineMode || this.useOnlineMode;
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar configuración del asistente');
        }
    }

    /**
     * 💾 Guardar configuración
     */
    async saveSettings() {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('assistant')
                .set({
                    apiKey: this.claudeAPIKey,
                    onlineMode: this.useOnlineMode,
                    lastUpdated: new Date()
                });
            
            // También guardar en localStorage
            localStorage.setItem('claudeAPIKey', this.claudeAPIKey);
            localStorage.setItem('assistantOnlineMode', this.useOnlineMode);
            
            return true;
        } catch (error) {
            console.error('Error guardando configuración:', error);
            return false;
        }
    }

    /**
     * 📊 Cargar datos del usuario
     */
    async loadUserData() {
        try {
            // Cargar gastos recientes (últimos 30 días)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const expensesSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
                .get();
            
            this.userData.expenses = expensesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar ingresos
            const incomesSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('incomes')
                .orderBy('date', 'desc')
                .limit(10)
                .get();
            
            this.userData.incomes = incomesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar presupuestos
            const budgetsSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('budgets')
                .get();
            
            if (budgetsSnap.exists) {
                this.userData.budgets = budgetsSnap.data();
            }
            
            // Cargar metas
            const goalsSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('goals')
                .get();
            
            this.userData.goals = goalsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar gastos recurrentes
            const recurringSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .get();
            
            this.userData.recurringExpenses = recurringSnap.docs.map(doc => ({
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
            
            console.log('✅ Datos del usuario cargados');
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
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
            
            if (this.useOnlineMode && this.claudeAPIKey && this.isOnline) {
                // Modo Online - Claude API
                assistantResponse = await this.getOnlineResponse(userMessage);
            } else {
                // Modo Offline - Respuestas inteligentes locales
                assistantResponse = await this.getOfflineResponse(userMessage);
            }
            
            // Agregar respuesta del asistente
            const assistantMsg = {
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date(),
                mode: this.useOnlineMode && this.claudeAPIKey ? 'online' : 'offline'
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
     * 🌐 Obtener respuesta online (Claude API)
     */
    async getOnlineResponse(userMessage) {
        try {
            // Preparar contexto con datos del usuario
            const context = this.buildUserContext();
            
            const systemPrompt = `Eres un asistente financiero personal experto y amigable. Ayudas a usuarios a gestionar sus finanzas personales con consejos prácticos y análisis detallados.

Contexto del usuario:
${context}

Instrucciones:
- Da respuestas concisas y prácticas (máximo 150 palabras)
- Usa emojis apropiados para hacer la conversación más amigable
- Basa tus análisis en los datos reales del usuario cuando estén disponibles
- Si detectas problemas financieros, ofrece soluciones específicas
- Sé empático y motivador
- Usa formato markdown para mejor legibilidad`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.claudeAPIKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 500,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ]
                })
            });

            if (!response.ok) {
                console.error('Error en API de Claude:', response.status);
                // Fallback a modo offline
                return this.getOfflineResponse(userMessage);
            }

            const data = await response.json();
            return data.content[0].text;

        } catch (error) {
            console.error('Error en modo online:', error);
            // Fallback a modo offline
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
        
        if (intent === 'expenses' || messageLower.includes('gasté') || messageLower.includes('gastando')) {
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
        
        // 3. Búsqueda en knowledge base
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            const hasKeyword = data.keywords.some(kw => messageLower.includes(kw));
            if (hasKeyword) {
                const response = data.responses[Math.floor(Math.random() * data.responses.length)];
                return this.personalizeResponse(response, category);
            }
        }
        
        // 4. Respuesta por defecto con análisis básico
        return this.getDefaultResponse();
    }

    /**
     * 🎯 Detectar intención del mensaje
     */
    detectIntent(message) {
        const intents = {
            analysis: ['análisis', 'resumen', 'cómo voy', 'situación', 'estado'],
            expenses: ['gasté', 'gastando', 'compré', 'gastos', 'cuánto gasto'],
            budget: ['presupuesto', 'límite', 'cuánto puedo', 'sobrepaso'],
            goals: ['meta', 'objetivo', 'ahorrar para', 'quiero'],
            savings: ['ahorrar', 'ahorro', 'guardar'],
            help: ['ayuda', 'help', 'qué puedes', 'cómo funciona']
        };
        
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(kw => message.includes(kw))) {
                return intent;
            }
        }
        
        return 'general';
    }

    /**
     * 📊 Generar análisis financiero
     */
    generateFinancialAnalysis() {
        const { totalExpenses, totalIncome, expenses, budgets } = this.userData;
        
        let analysis = '📊 **Análisis Financiero**\n\n';
        
        // Situación actual
        const balance = totalIncome - totalExpenses;
        analysis += `💰 **Balance del mes:**\n`;
        analysis += `Ingresos: $${totalIncome.toFixed(2)}\n`;
        analysis += `Gastos: $${totalExpenses.toFixed(2)}\n`;
        analysis += `Balance: ${balance >= 0 ? '✅' : '⚠️'} $${balance.toFixed(2)}\n\n`;
        
        // Análisis por categorías
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const topCategories = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        if (topCategories.length > 0) {
            analysis += `📈 **Top 3 Categorías de Gasto:**\n`;
            topCategories.forEach(([cat, amount], i) => {
                const emoji = ['🥇', '🥈', '🥉'][i];
                analysis += `${emoji} ${cat}: $${amount.toFixed(2)}\n`;
            });
            analysis += '\n';
        }
        
        // Recomendaciones
        analysis += this.generateRecommendations(balance, categoryTotals);
        
        return analysis;
    }

    /**
     * 💸 Generar insight de gastos
     */
    generateExpenseInsight() {
        const { expenses } = this.userData;
        
        if (expenses.length === 0) {
            return '📝 Aún no tienes gastos registrados. ¡Empieza a registrar tus gastos para obtener análisis personalizados!';
        }
        
        const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const avgDaily = total / 30;
        
        // Análisis por categoría
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const topCategory = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0];
        
        let insight = `💸 **Análisis de Gastos (últimos 30 días)**\n\n`;
        insight += `Total gastado: $${total.toFixed(2)}\n`;
        insight += `Promedio diario: $${avgDaily.toFixed(2)}\n\n`;
        
        if (topCategory) {
            insight += `Tu categoría principal es **${topCategory[0]}** con $${topCategory[1].toFixed(2)}\n\n`;
        }
        
        // Consejo
        if (avgDaily > 50) {
            insight += `💡 **Consejo:** Con $${avgDaily.toFixed(2)}/día, podrías ahorrar $${(avgDaily * 0.2).toFixed(2)}/día reduciendo gastos pequeños.`;
        }
        
        return insight;
    }

    /**
     * 💰 Generar insight de presupuesto
     */
    generateBudgetInsight() {
        const { budgets, expenses } = this.userData;
        
        if (Object.keys(budgets).length === 0) {
            return '📋 Aún no has configurado presupuestos. Te recomiendo usar la regla 50/30/20: 50% necesidades, 30% gustos, 20% ahorro.';
        }
        
        const categoryTotals = this.calculateCategoryTotals(expenses);
        
        let insight = '💰 **Estado del Presupuesto**\n\n';
        
        for (const [category, limit] of Object.entries(budgets)) {
            const spent = categoryTotals[category] || 0;
            const percentage = (spent / limit) * 100;
            
            let status = '✅';
            if (percentage >= 95) status = '🚨';
            else if (percentage >= 80) status = '⚠️';
            
            insight += `${status} **${category}**\n`;
            insight += `$${spent.toFixed(2)} / $${limit.toFixed(2)} (${percentage.toFixed(0)}%)\n\n`;
        }
        
        return insight;
    }

    /**
     * 🎯 Generar insight de metas
     */
    generateGoalsInsight() {
        const { goals } = this.userData;
        
        if (goals.length === 0) {
            return '🎯 Aún no has creado metas de ahorro. ¡Define una meta y te ayudaré a alcanzarla! Usa el método SMART: Específica, Medible, Alcanzable, Relevante y con Tiempo definido.';
        }
        
        let insight = '🎯 **Progreso de Metas**\n\n';
        
        goals.forEach(goal => {
            const progress = ((goal.current || 0) / (goal.target || 1)) * 100;
            const remaining = (goal.target || 0) - (goal.current || 0);
            
            let emoji = '🌱';
            if (progress >= 75) emoji = '🔥';
            else if (progress >= 50) emoji = '💪';
            
            insight += `${emoji} **${goal.name}**\n`;
            insight += `Progreso: ${progress.toFixed(0)}% ($${(goal.current || 0).toFixed(2)} / $${(goal.target || 0).toFixed(2)})\n`;
            insight += `Falta: $${remaining.toFixed(2)}\n\n`;
        });
        
        return insight;
    }

    /**
     * 💎 Generar consejos de ahorro
     */
    generateSavingsAdvice() {
        const { totalIncome, totalExpenses } = this.userData;
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        
        let advice = '💎 **Consejos de Ahorro**\n\n';
        
        if (savingsRate < 10) {
            advice += '⚠️ Tu tasa de ahorro es muy baja. Objetivo recomendado: 20%\n\n';
            advice += '**Acciones inmediatas:**\n';
            advice += '1. Identifica 3 gastos que puedas reducir\n';
            advice += '2. Automatiza un ahorro de al menos 10%\n';
            advice += '3. Revisa suscripciones no usadas\n';
        } else if (savingsRate < 20) {
            advice += '👍 Vas bien, pero puedes mejorar. Objetivo: 20%\n\n';
            advice += '**Siguiente paso:**\n';
            advice += `Aumenta tu ahorro en $${((totalIncome * 0.20) - savings).toFixed(2)} para alcanzar el 20%`;
        } else {
            advice += '🌟 ¡Excelente! Estás ahorrando más del 20%\n\n';
            advice += '**Considera:**\n';
            advice += '1. Crear un fondo de emergencia (3-6 meses)\n';
            advice += '2. Invertir en instrumentos a largo plazo\n';
            advice += '3. Establecer nuevas metas financieras\n';
        }
        
        return advice;
    }

    /**
     * 📋 Calcular totales por categoría
     */
    calculateCategoryTotals(expenses) {
        const totals = {};
        expenses.forEach(expense => {
            const category = expense.category || 'Sin categoría';
            totals[category] = (totals[category] || 0) + parseFloat(expense.amount || 0);
        });
        return totals;
    }

    /**
     * 💡 Generar recomendaciones
     */
    generateRecommendations(balance, categoryTotals) {
        let recommendations = '💡 **Recomendaciones:**\n';
        
        if (balance < 0) {
            recommendations += '⚠️ Estás gastando más de lo que ganas. Prioriza reducir gastos.\n';
        }
        
        // Categoría con más gasto
        const topCategory = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])[0];
        
        if (topCategory && topCategory[1] > 500) {
            recommendations += `Revisa tus gastos en ${topCategory[0]} - es tu categoría más alta.\n`;
        }
        
        return recommendations;
    }

    /**
     * 🔧 Personalizar respuesta
     */
    personalizeResponse(response, category) {
        // Agregar datos específicos del usuario si están disponibles
        if (category === 'budget' && Object.keys(this.userData.budgets).length > 0) {
            response += '\n\n💡 Según tus datos, revisa tus presupuestos en la sección de Presupuesto.';
        }
        
        return response;
    }

    /**
     * 🏠 Respuesta por defecto
     */
    getDefaultResponse() {
        const responses = [
            '¡Hola! 👋 Soy tu asistente financiero. Puedo ayudarte con análisis de gastos, presupuestos, metas y consejos de ahorro. ¿En qué te puedo ayudar?',
            'Estoy aquí para ayudarte con tus finanzas. Puedo darte un análisis de tus gastos, revisar tu presupuesto o darte consejos personalizados. ¿Qué necesitas?',
            'Como tu asistente financiero, puedo analizar tus patrones de gasto, revisar tus metas o darte consejos para mejorar tus finanzas. ¿Quieres saber algo específico?'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * 🧠 Construir contexto del usuario para Claude API
     */
    buildUserContext() {
        const { totalIncome, totalExpenses, expenses, budgets, goals } = this.userData;
        
        let context = '';
        
        // Resumen financiero
        context += `Resumen Financiero (últimos 30 días):\n`;
        context += `- Ingresos totales: $${totalIncome.toFixed(2)}\n`;
        context += `- Gastos totales: $${totalExpenses.toFixed(2)}\n`;
        context += `- Balance: $${(totalIncome - totalExpenses).toFixed(2)}\n\n`;
        
        // Gastos por categoría
        if (expenses.length > 0) {
            const categoryTotals = this.calculateCategoryTotals(expenses);
            context += `Gastos por categoría:\n`;
            Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([cat, amount]) => {
                    context += `- ${cat}: $${amount.toFixed(2)}\n`;
                });
            context += '\n';
        }
        
        // Presupuestos
        if (Object.keys(budgets).length > 0) {
            context += `Presupuestos configurados:\n`;
            Object.entries(budgets).forEach(([cat, limit]) => {
                context += `- ${cat}: $${limit.toFixed(2)}\n`;
            });
            context += '\n';
        }
        
        // Metas
        if (goals.length > 0) {
            context += `Metas de ahorro:\n`;
            goals.slice(0, 3).forEach(goal => {
                const progress = ((goal.current || 0) / (goal.target || 1)) * 100;
                context += `- ${goal.name}: ${progress.toFixed(0)}% completado\n`;
            });
        }
        
        return context;
    }

    /**
     * 💾 Guardar conversación
     */
    async saveConversation() {
        try {
            if (!this.currentConversationId) {
                this.currentConversationId = Date.now().toString();
            }
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('assistantConversations')
                .doc(this.currentConversationId)
                .set({
                    messages: this.conversationHistory,
                    lastUpdated: new Date(),
                    messageCount: this.conversationHistory.length
                });
        } catch (error) {
            console.error('Error guardando conversación:', error);
        }
    }

    /**
     * 📜 Cargar historial de conversaciones
     */
    async loadConversationHistory() {
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('assistantConversations')
                .orderBy('lastUpdated', 'desc')
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                this.currentConversationId = doc.id;
                this.conversationHistory = doc.data().messages || [];
            }
        } catch (error) {
            console.warn('No se pudo cargar historial de conversaciones');
        }
    }

    /**
     * 🆕 Nueva conversación
     */
    startNewConversation() {
        this.conversationHistory = [];
        this.currentConversationId = Date.now().toString();
    }

    /**
     * 🔄 Cambiar modo online/offline
     */
    async toggleMode() {
        this.useOnlineMode = !this.useOnlineMode;
        await this.saveSettings();
        return this.useOnlineMode;
    }

    /**
     * 🔑 Configurar API Key
     */
    async setAPIKey(apiKey) {
        this.claudeAPIKey = apiKey;
        await this.saveSettings();
        return true;
    }

    /**
     * 🌐 Mostrar estado de conexión
     */
    showConnectionStatus(status) {
        const message = status === 'online' 
            ? '🌐 Conexión restaurada' 
            : '📴 Sin conexión - Modo offline activado';
        
        if (window.Toastify) {
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: status === 'online' 
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : 'linear-gradient(to right, #f59e0b, #d97706)'
                }
            }).showToast();
        }
    }

    /**
     * 📚 Base de conocimientos mejorada
     */
    buildEnhancedKnowledgeBase() {
        return {
            budget: {
                keywords: ['presupuesto', 'budget', 'gastar', 'límite', 'cuanto puedo'],
                responses: [
                    '💰 **Presupuesto Inteligente:**\n\nLa regla 50/30/20 es ideal:\n• 50% Necesidades (renta, comida, servicios)\n• 30% Gustos (entretenimiento, salidas)\n• 20% Ahorro e inversión\n\n¿Quieres que analice tu presupuesto actual?',
                    '📊 **Crear un Presupuesto:**\n\n1. Calcula tus ingresos fijos\n2. Lista gastos esenciales\n3. Define límites por categoría\n4. Revisa semanalmente\n\nUsa la app para automatizar este proceso.',
                    '💡 **Tip de Presupuesto:**\n\nEmpieza simple con 5 categorías:\n• Vivienda\n• Alimentos\n• Transporte\n• Entretenimiento\n• Ahorro\n\nAjusta según tus necesidades.'
                ]
            },
            
            saving: {
                keywords: ['ahorrar', 'ahorro', 'save', 'guardar', 'saving'],
                responses: [
                    '💎 **Estrategia de Ahorro:**\n\n1. **Págate primero** - Ahorra antes de gastar\n2. **Automatiza** - Configura transferencias automáticas\n3. **Meta 20%** - Intenta ahorrar al menos 20% de tus ingresos\n\n¿Quieres crear una meta de ahorro?',
                    '🌟 **Fondo de Emergencia:**\n\nPrioridad #1: Crear un fondo de 3-6 meses de gastos.\n\nPasos:\n• Calcula tus gastos mensuales\n• Multiplica × 3 (mínimo)\n• Ahorra gradualmente\n• Guárdalo en cuenta separada',
                    '🚀 **Desafío de Ahorro:**\n\n**Semana 1:** $10\n**Semana 2:** $20\n**Semana 3:** $30\n...\n**Semana 52:** $520\n\nTotal anual: $13,780\n\n¿Te animas?'
                ]
            },
            
            debt: {
                keywords: ['deuda', 'debt', 'debo', 'préstamo', 'tarjeta', 'crédito', 'adeudo'],
                responses: [
                    '⛓️ **Método Bola de Nieve:**\n\n1. Lista deudas de menor a mayor\n2. Paga el mínimo en todas\n3. Pon extra en la más pequeña\n4. Al terminarla, ataca la siguiente\n\nEfectivo psicológicamente - ¡victorias rápidas!',
                    '📉 **Método Avalancha:**\n\n1. Lista deudas por tasa de interés\n2. Paga el mínimo en todas\n3. Pon extra en la de mayor interés\n4. Repite hasta liquidar\n\nAhorra más dinero a largo plazo.',
                    '💪 **Plan Anti-Deudas:**\n\n• NO crear nuevas deudas\n• Vende artículos no usados\n• Busca ingresos extra\n• Negocia tasas de interés\n• Celebra cada pago\n\n¡Puedes lograrlo!'
                ]
            },
            
            investment: {
                keywords: ['invertir', 'invest', 'inversión', 'acciones', 'stocks', 'etf'],
                responses: [
                    '📈 **Antes de Invertir:**\n\n✅ Fondo de emergencia (3-6 meses)\n✅ Deudas de alto interés pagadas\n✅ Metas claras definidas\n✅ Conocimiento básico\n✅ Horizonte de 5+ años\n\n¿Ya cumples estos requisitos?',
                    '🎯 **Inversión para Principiantes:**\n\n• **ETFs/Fondos Indexados** - Bajo riesgo, diversificados\n• **Plazo Fijo** - Seguro, predecible\n• **CETES** - Respaldo gubernamental\n\nRegla: Diversifica siempre.',
                    '⚠️ **Reglas de Oro:**\n\n1. Solo invierte dinero que NO necesites a corto plazo\n2. Diversifica - nunca todo en un lugar\n3. Piensa en años, no en días\n4. Aprende antes de invertir\n5. No sigas modas (crypto, meme stocks)'
                ]
            },
            
            goals: {
                keywords: ['meta', 'goal', 'objetivo', 'lograr', 'alcanzar', 'propósito'],
                responses: [
                    '🎯 **Método SMART para Metas:**\n\n• **S**pecific (Específica)\n• **M**easurable (Medible)\n• **A**chievable (Alcanzable)\n• **R**elevant (Relevante)\n• **T**ime-bound (Con plazo)\n\nEjemplo: "Ahorrar $10,000 para vacaciones en 10 meses"',
                    '🏆 **Divide y Vencerás:**\n\nMeta grande = Muchas pequeñas\n\n$10,000 en 1 año =\n$833/mes =\n$192/semana =\n$27/día\n\n¿Más alcanzable, verdad?',
                    '📊 **Seguimiento de Metas:**\n\n• Revisa progreso semanalmente\n• Celebra pequeños logros\n• Ajusta si es necesario\n• Visualiza el resultado final\n\nEl seguimiento aumenta éxito en 42%'
                ]
            },
            
            expenses: {
                keywords: ['gasto', 'expense', 'compra', 'gastando', 'compré', 'salida'],
                responses: [
                    '🐜 **Gastos Hormiga:**\n\nPequeños gastos que suman mucho:\n• Café diario: $90/mes\n• Snacks: $150/mes\n• Apps no usadas: $200/mes\n• Delivery: $400/mes\n\nTotal: $840/mes = $10,080/año',
                    '🛒 **Regla de las 24 horas:**\n\nAntes de comprar algo:\n1. Espera 24 horas\n2. Pregúntate: ¿Realmente lo necesito?\n3. ¿Tengo presupuesto?\n4. ¿Hay alternativa más barata?\n\nEvita compras impulsivas',
                    '📝 **Control de Gastos:**\n\nRegistra TODO:\n• Gastos grandes (obvios)\n• Gastos pequeños (los que más suman)\n• Gastos digitales (suscripciones)\n\nLo que se mide, se controla'
                ]
            },
            
            help: {
                keywords: ['ayuda', 'help', 'qué puedes', 'cómo funciona', 'comandos'],
                responses: [
                    '🤖 **Puedo ayudarte con:**\n\n💰 Análisis de gastos\n📊 Estado de presupuesto\n🎯 Progreso de metas\n💡 Consejos personalizados\n📈 Patrones de gasto\n\n¿Qué te gustaría saber?',
                    '💬 **Pregúntame sobre:**\n\n"¿Cómo voy este mes?"\n"Analiza mis gastos"\n"¿Cómo ahorro más?"\n"Estado de mi presupuesto"\n"Consejos para invertir"\n\nEstoy aquí para ayudarte',
                    '🌟 **Dos modos disponibles:**\n\n📴 **Offline** - Respuestas inteligentes locales\n🌐 **Online** - Claude AI avanzado\n\nCambia en configuración según prefieras'
                ]
            }
        };
    }

    /**
     * ⚡ Acciones rápidas predefinidas
     */
    getQuickActions() {
        return [
            {
                id: 'analysis',
                icon: '📊',
                label: 'Análisis del mes',
                message: 'Dame un análisis completo de mis finanzas este mes'
            },
            {
                id: 'budget_status',
                icon: '💰',
                label: 'Estado de presupuesto',
                message: '¿Cómo va mi presupuesto?'
            },
            {
                id: 'goals_progress',
                icon: '🎯',
                label: 'Progreso de metas',
                message: 'Muéstrame el progreso de mis metas'
            },
            {
                id: 'savings_tips',
                icon: '💡',
                label: 'Consejos de ahorro',
                message: '¿Cómo puedo ahorrar más dinero?'
            },
            {
                id: 'expense_patterns',
                icon: '📈',
                label: 'Patrones de gasto',
                message: '¿En qué estoy gastando más?'
            }
        ];
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.VirtualAssistantModule = VirtualAssistantModule;
}

console.log('✅ Módulo de Asistente Virtual cargado');
