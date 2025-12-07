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
            
            console.log('📊 Datos del usuario cargados');
        } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            this.userData = { expenses: [], incomes: [], budgets: {}, goals: [], recurringExpenses: [] };
        }
    }

    /**
     * 💬 Cargar historial de conversaciones
     */
    async loadConversationHistory() {
        try {
            const historySnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('assistantConversations')
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            this.conversationHistory = historySnap.docs.map(doc => doc.data());
            console.log('💬 Historial de conversaciones cargado');
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.conversationHistory = [];
        }
    }

    /**
     * 📝 Guardar mensaje en historial
     */
    async saveMessage(message, isUser = true) {
        try {
            if (!this.currentConversationId) {
                const convRef = await this.db
                    .collection('users')
                    .doc(this.userId)
                    .collection('assistantConversations')
                    .add({
                        timestamp: new Date(),
                        messages: []
                    });
                this.currentConversationId = convRef.id;
            }
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('assistantConversations')
                .doc(this.currentConversationId)
                .update({
                    messages: firebase.firestore.FieldValue.arrayUnion({
                        text: message,
                        isUser,
                        timestamp: new Date()
                    })
                });
        } catch (error) {
            console.error('Error guardando mensaje:', error);
        }
    }

    /**
     * 🤖 Procesar mensaje del usuario
     */
    async processMessage(message) {
        try {
            this.saveMessage(message, true);
            
            if (this.useOnlineMode && this.isOnline && this.claudeAPIKey) {
                return await this.getClaudeResponse(message);
            } else {
                return this.getOfflineResponse(message);
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
            return 'Lo siento, ocurrió un error. Intenta de nuevo.';
        }
    }

    /**
     * 🌐 Obtener respuesta de Claude AI
     */
    async getClaudeResponse(message) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.claudeAPIKey
                },
                body: JSON.stringify({
                    prompt: this.buildPrompt(message),
                    model: 'claude-2.0',
                    max_tokens_to_sample: 300,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) throw new Error('Error en API');
            
            const data = await response.json();
            const reply = data.completion.trim();
            
            this.saveMessage(reply, false);
            return reply;
        } catch (error) {
            console.error('Error con Claude API:', error);
            return this.getOfflineResponse(message); // Fallback offline
        }
    }

    /**
     * 📴 Obtener respuesta offline inteligente
     */
    getOfflineResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Buscar en knowledge base
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            if (data.keywords.some(kw => lowerMessage.includes(kw))) {
                const response = data.responses[Math.floor(Math.random() * data.responses.length)];
                this.saveMessage(response, false);
                return response;
            }
        }
        
        // Análisis financiero personalizado si aplica
        if (lowerMessage.includes('análisis') || lowerMessage.includes('gastos')) {
            const analysis = this.generateFinancialAnalysis();
            this.saveMessage(analysis, false);
            return analysis;
        }
        
        // Respuesta default
        const defaultResponse = '🤖 Lo siento, no entendí bien. ¿Puedes reformular? Puedo ayudarte con presupuestos, ahorros, deudas, inversiones o análisis de gastos.';
        this.saveMessage(defaultResponse, false);
        return defaultResponse;
    }

    /**
     * 📊 Generar análisis financiero personalizado
     */
    generateFinancialAnalysis() {
        const { totalIncome, totalExpenses, budgets, goals, recurringExpenses } = this.userData;
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
        
        let analysis = `📊 **Análisis Financiero Rápido:**\n\n`;
        analysis += `Ingresos totales: $${totalIncome.toFixed(2)}\n`;
        analysis += `Gastos totales: $${totalExpenses.toFixed(2)}\n`;
        analysis += `Balance: $${balance.toFixed(2)} (${balance > 0 ? 'positivo' : 'negativo'})\n`;
        analysis += `Tasa de ahorro: ${savingsRate}%\n\n`;
        
        // Análisis de presupuesto
        const overBudget = Object.entries(budgets).filter(([cat, amount]) => {
            const catExpenses = this.userData.expenses
                .filter(e => e.category === cat)
                .reduce((sum, e) => sum + e.amount, 0);
            return catExpenses > amount;
        });
        
        if (overBudget.length > 0) {
            analysis += `⚠️ Sobrepasas presupuesto en: ${overBudget.map(([cat]) => cat).join(', ')}\n`;
        }
        
        // Progreso de metas
        if (goals.length > 0) {
            const firstGoal = goals[0];
            const progress = ((firstGoal.current / firstGoal.target) * 100).toFixed(1);
            analysis += `🎯 Progreso en "${firstGoal.name}": ${progress}%\n`;
        }
        
        // Gastos recurrentes
        if (recurringExpenses.length > 0) {
            const monthlyRecurring = recurringExpenses.reduce((sum, r) => sum + (r.amount / (r.frequency === 'monthly' ? 1 : 12)), 0);
            analysis += `🔄 Gastos recurrentes mensuales: $${monthlyRecurring.toFixed(2)}\n`;
        }
        
        // Recomendación
        analysis += `\n💡 Consejo: ${balance > 0 ? '¡Buen trabajo! Considera invertir el excedente.' : 'Reduce gastos no esenciales para mejorar tu balance.'}`;
        
        return analysis;
    }

    /**
     * 📝 Construir prompt para Claude
     */
    buildPrompt(message) {
        let prompt = `Eres un asistente financiero experto. Analiza los datos del usuario y da consejos prácticos.\n\n`;
        prompt += `Datos actuales:\n${JSON.stringify(this.userData, null, 2)}\n\n`;
        prompt += `Mensaje del usuario: ${message}\n\n`;
        prompt += `Responde de manera clara, estructurada y útil. Usa emojis para mejorar la lectura.`;
        return prompt;
    }

    /**
     * 📈 Construir knowledge base mejorada
     */
    buildEnhancedKnowledgeBase() {
        return {
            budget: {
                keywords: ['presupuesto', 'budget', 'gastos', 'expenses'],
                responses: [
                    '📊 **Regla 50/30/20:**\n\n• 50% necesidades\n• 30% deseos\n• 20% ahorro/deudas\n\nAjusta según tu situación.',
                    '🔧 **Crea un Presupuesto:**\n\n1. Lista ingresos\n2. Resta gastos fijos\n3. Asigna a cada categoría\n4. Revisa semanalmente\n\nUsa la app para automatizar este proceso.',
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

    // NUEVO: Método para abrir el chat (llamado desde menú)
    openChat() {
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
            chatContainer.style.display = 'block';
            // Renderizar chat si es necesario
        } else {
            console.warn('Chat container no encontrado');
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.VirtualAssistantModule = VirtualAssistantModule;
}

console.log('✅ Módulo de Asistente Virtual cargado');