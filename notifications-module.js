/**
 * 🔔 INTELLIGENT NOTIFICATIONS MODULE - PARTE 3
 * =============================================
 * Sistema completo de notificaciones inteligentes y proactivas
 * 
 * Funcionalidades:
 * - Push Notifications (PWA)
 * - Recordatorios automáticos de gastos recurrentes
 * - Alertas de presupuesto
 * - Notificaciones de progreso de metas
 * - Insights diarios y semanales
 * - Alertas de gastos inusuales
 * - Notificaciones de logros
 * - Sistema de preferencias personalizable
 */

class IntelligentNotifications {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.preferences = this.getDefaultPreferences();
        this.notificationQueue = [];
        this.isInitialized = false;
        this.checkInterval = null;
    }

    /**
     * ⚙️ Preferencias por defecto
     */
    getDefaultPreferences() {
        return {
            enabled: true,
            pushEnabled: false,
            
            // Tipos de notificaciones
            budgetAlerts: true,
            goalProgress: true,
            recurringReminders: true,
            dailyInsights: true,
            weeklyReports: true,
            unusualExpenses: true,
            achievements: true,
            
            // Horarios
            dailyInsightTime: '09:00',
            weeklyReportDay: 'monday',
            
            // Umbrales
            budgetWarningThreshold: 80, // %
            budgetCriticalThreshold: 95, // %
            unusualExpenseMultiplier: 2.0,
            recurringReminderDays: 1 // días antes
        };
    }

    /**
     * 🚀 Inicializar sistema de notificaciones
     */
    async initialize() {
        try {
            console.log('🔔 Inicializando sistema de notificaciones...');
            
            // Cargar preferencias
            await this.loadPreferences();
            
            // Verificar soporte de notificaciones
            if (!("Notification" in window)) {
                console.warn('⚠️ Este navegador no soporta notificaciones');
                return false;
            }
            
            // Si están habilitadas, iniciar checks periódicos
            if (this.preferences.enabled) {
                this.startPeriodicChecks();
            }
            
            this.isInitialized = true;
            console.log('✅ Sistema de notificaciones inicializado');
            return true;
            
        } catch (error) {
            console.error('❌ Error al inicializar notificaciones:', error);
            return false;
        }
    }

    /**
     * 📥 Cargar preferencias desde Firebase
     */
    async loadPreferences() {
        try {
            const docRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('notifications');
            
            const doc = await docRef.get();
            
            if (doc.exists) {
                this.preferences = { ...this.getDefaultPreferences(), ...doc.data() };
            } else {
                // Guardar preferencias por defecto
                await this.savePreferences();
            }
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        }
    }

    /**
     * 💾 Guardar preferencias en Firebase
     */
    async savePreferences() {
        try {
            const docRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('notifications');
            
            await docRef.set(this.preferences);
            console.log('✅ Preferencias guardadas');
        } catch (error) {
            console.error('Error guardando preferencias:', error);
        }
    }

    /**
     * 🔄 Iniciar checks periódicos
     */
    startPeriodicChecks() {
        // Verificar cada 5 minutos
        this.checkInterval = setInterval(() => {
            this.performAllChecks();
        }, 5 * 60 * 1000);
        
        // Realizar check inicial
        setTimeout(() => this.performAllChecks(), 5000);
    }

    /**
     * 🔍 Realizar todos los checks de notificaciones
     */
    async performAllChecks() {
        if (!this.preferences.enabled) return;
        
        try {
            // Budget Alerts
            if (this.preferences.budgetAlerts) {
                await this.checkBudgetAlerts();
            }
            
            // Goal Progress
            if (this.preferences.goalProgress) {
                await this.checkGoalProgress();
            }
            
            // Recurring Reminders
            if (this.preferences.recurringReminders) {
                await this.checkRecurringReminders();
            }
            
            // Daily Insights
            if (this.preferences.dailyInsights) {
                await this.checkDailyInsight();
            }
            
            // Weekly Reports
            if (this.preferences.weeklyReports) {
                await this.checkWeeklyReport();
            }
            
            // Unusual Expenses
            if (this.preferences.unusualExpenses) {
                await this.checkUnusualExpenses();
            }
            
        } catch (error) {
            console.error('Error en checks periódicos:', error);
        }
    }

    /**
     * 💰 Verificar alertas de presupuesto
     */
    async checkBudgetAlerts() {
        try {
            const budgetRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('budgets');
            
            const snapshot = await budgetRef.get();
            const currentMonth = new Date().toISOString().slice(0, 7);
            
            snapshot.forEach(async (doc) => {
                const budget = doc.data();
                const percentage = (budget.spent / budget.amount) * 100;
                
                // Alerta crítica (95%)
                if (percentage >= this.preferences.budgetCriticalThreshold && 
                    !this.wasNotified(`budget-critical-${doc.id}-${currentMonth}`)) {
                    
                    this.sendNotification({
                        title: '🚨 ¡Presupuesto Crítico!',
                        body: `Has gastado el ${percentage.toFixed(0)}% de tu presupuesto en ${budget.category}`,
                        icon: '🚨',
                        priority: 'high',
                        tag: `budget-critical-${doc.id}-${currentMonth}`
                    });
                }
                // Alerta de advertencia (80%)
                else if (percentage >= this.preferences.budgetWarningThreshold && 
                         !this.wasNotified(`budget-warning-${doc.id}-${currentMonth}`)) {
                    
                    this.sendNotification({
                        title: '⚠️ Alerta de Presupuesto',
                        body: `Has gastado el ${percentage.toFixed(0)}% de tu presupuesto en ${budget.category}`,
                        icon: '⚠️',
                        priority: 'normal',
                        tag: `budget-warning-${doc.id}-${currentMonth}`
                    });
                }
            });
            
        } catch (error) {
            console.error('Error verificando presupuestos:', error);
        }
    }

    /**
     * 🎯 Verificar progreso de metas
     */
    async checkGoalProgress() {
        try {
            const goalsRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('goals')
                .where('status', '==', 'active');
            
            const snapshot = await goalsRef.get();
            
            snapshot.forEach(async (doc) => {
                const goal = doc.data();
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                
                // Notificar en hitos: 25%, 50%, 75%, 100%
                const milestones = [25, 50, 75, 100];
                
                milestones.forEach(milestone => {
                    if (percentage >= milestone && 
                        !this.wasNotified(`goal-${doc.id}-${milestone}`)) {
                        
                        let message = '';
                        let icon = '';
                        
                        if (milestone === 100) {
                            message = `¡Felicidades! Has completado tu meta: ${goal.name}`;
                            icon = '🎉';
                        } else {
                            message = `Has alcanzado el ${milestone}% de tu meta: ${goal.name}`;
                            icon = '🎯';
                        }
                        
                        this.sendNotification({
                            title: icon + ' Progreso de Meta',
                            body: message,
                            icon: icon,
                            priority: milestone === 100 ? 'high' : 'normal',
                            tag: `goal-${doc.id}-${milestone}`
                        });
                    }
                });
            });
            
        } catch (error) {
            console.error('Error verificando metas:', error);
        }
    }

    /**
     * 🔄 Verificar recordatorios de gastos recurrentes
     */
    async checkRecurringReminders() {
        try {
            const recurringRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .where('active', '==', true);
            
            const snapshot = await recurringRef.get();
            const today = new Date();
            const reminderDate = new Date(today);
            reminderDate.setDate(today.getDate() + this.preferences.recurringReminderDays);
            
            snapshot.forEach(async (doc) => {
                const expense = doc.data();
                const nextDate = this.calculateNextDate(expense);
                
                // Si el próximo pago está dentro del período de recordatorio
                if (nextDate && 
                    nextDate <= reminderDate && 
                    !this.wasNotified(`recurring-${doc.id}-${nextDate.toISOString().split('T')[0]}`)) {
                    
                    const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
                    
                    this.sendNotification({
                        title: '🔔 Recordatorio de Gasto',
                        body: `${expense.description} - $${expense.amount} vence en ${daysUntil} día(s)`,
                        icon: '🔔',
                        priority: 'normal',
                        tag: `recurring-${doc.id}-${nextDate.toISOString().split('T')[0]}`
                    });
                }
            });
            
        } catch (error) {
            console.error('Error verificando gastos recurrentes:', error);
        }
    }

    /**
     * 📊 Verificar y enviar insight diario
     */
    async checkDailyInsight() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const notificationTag = `daily-insight-${today}`;
            
            if (this.wasNotified(notificationTag)) return;
            
            // Verificar si es hora de enviar
            const now = new Date();
            const [hours, minutes] = this.preferences.dailyInsightTime.split(':');
            const targetTime = new Date();
            targetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // Solo enviar si estamos cerca de la hora objetivo (±30 min)
            const timeDiff = Math.abs(now - targetTime);
            if (timeDiff > 30 * 60 * 1000) return;
            
            // Obtener gastos del día
            const startOfDay = new Date(today + 'T00:00:00');
            const endOfDay = new Date(today + 'T23:59:59');
            
            const expensesRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', startOfDay)
                .where('date', '<=', endOfDay);
            
            const snapshot = await expensesRef.get();
            
            let totalSpent = 0;
            let expenseCount = 0;
            
            snapshot.forEach(doc => {
                const expense = doc.data();
                totalSpent += expense.amount || 0;
                expenseCount++;
            });
            
            if (expenseCount > 0) {
                this.sendNotification({
                    title: '📊 Resumen del Día',
                    body: `Has gastado $${totalSpent.toFixed(2)} en ${expenseCount} transacción(es) hoy`,
                    icon: '📊',
                    priority: 'low',
                    tag: notificationTag
                });
            }
            
        } catch (error) {
            console.error('Error generando insight diario:', error);
        }
    }

    /**
     * 📈 Verificar y enviar reporte semanal
     */
    async checkWeeklyReport() {
        try {
            const today = new Date();
            const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // Solo enviar el día configurado
            if (dayName !== this.preferences.weeklyReportDay.toLowerCase()) return;
            
            const weekTag = `weekly-report-${this.getWeekNumber(today)}`;
            if (this.wasNotified(weekTag)) return;
            
            // Calcular inicio y fin de semana
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            
            // Obtener gastos de la semana
            const expensesRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', startOfWeek)
                .where('date', '<=', endOfWeek);
            
            const snapshot = await expensesRef.get();
            
            let totalSpent = 0;
            let expenseCount = 0;
            
            snapshot.forEach(doc => {
                const expense = doc.data();
                totalSpent += expense.amount || 0;
                expenseCount++;
            });
            
            this.sendNotification({
                title: '📈 Reporte Semanal',
                body: `Esta semana gastaste $${totalSpent.toFixed(2)} en ${expenseCount} transacciones`,
                icon: '📈',
                priority: 'normal',
                tag: weekTag
            });
            
        } catch (error) {
            console.error('Error generando reporte semanal:', error);
        }
    }

    /**
     * 🔍 Detectar gastos inusuales
     */
    async checkUnusualExpenses() {
        try {
            // Obtener promedio de gastos por categoría del último mes
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            
            const expensesRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', oneMonthAgo);
            
            const snapshot = await expensesRef.get();
            
            // Calcular promedios por categoría
            const categoryStats = {};
            
            snapshot.forEach(doc => {
                const expense = doc.data();
                const category = expense.category || 'other';
                
                if (!categoryStats[category]) {
                    categoryStats[category] = { amounts: [], total: 0, count: 0 };
                }
                
                categoryStats[category].amounts.push(expense.amount);
                categoryStats[category].total += expense.amount;
                categoryStats[category].count++;
            });
            
            // Calcular promedios
            Object.keys(categoryStats).forEach(category => {
                const stats = categoryStats[category];
                stats.average = stats.total / stats.count;
            });
            
            // Verificar gastos recientes (últimas 24 horas)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            const recentExpensesRef = firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', yesterday);
            
            const recentSnapshot = await recentExpensesRef.get();
            
            recentSnapshot.forEach(doc => {
                const expense = doc.data();
                const category = expense.category || 'other';
                
                if (categoryStats[category]) {
                    const average = categoryStats[category].average;
                    const threshold = average * this.preferences.unusualExpenseMultiplier;
                    
                    if (expense.amount > threshold && 
                        !this.wasNotified(`unusual-${doc.id}`)) {
                        
                        this.sendNotification({
                            title: '⚠️ Gasto Inusual Detectado',
                            body: `Gastaste $${expense.amount} en ${category}. Tu promedio es $${average.toFixed(2)}`,
                            icon: '⚠️',
                            priority: 'normal',
                            tag: `unusual-${doc.id}`
                        });
                    }
                }
            });
            
        } catch (error) {
            console.error('Error detectando gastos inusuales:', error);
        }
    }

    /**
     * 🏆 Enviar notificación de logro
     */
    async notifyAchievement(achievementData) {
        if (!this.preferences.achievements) return;
        
        this.sendNotification({
            title: '🏆 ¡Nuevo Logro Desbloqueado!',
            body: achievementData.description,
            icon: '🏆',
            priority: 'high',
            tag: `achievement-${achievementData.id}`
        });
    }

    /**
     * 📤 Enviar notificación
     */
    async sendNotification(options) {
        try {
            // Verificar si ya se notificó
            if (this.wasNotified(options.tag)) {
                return;
            }
            
            // Marcar como notificado
            await this.markAsNotified(options.tag);
            
            // Notificación push si está habilitada
            if (this.preferences.pushEnabled && Notification.permission === 'granted') {
                const notification = new Notification(options.title, {
                    body: options.body,
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    tag: options.tag,
                    requireInteraction: options.priority === 'high'
                });
                
                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            }
            
            // Notificación in-app (siempre)
            this.showInAppNotification(options);
            
            // Guardar en historial
            await this.saveToHistory(options);
            
        } catch (error) {
            console.error('Error enviando notificación:', error);
        }
    }

    /**
     * 🔔 Mostrar notificación in-app
     */
    showInAppNotification(options) {
        // Crear elemento de notificación
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification-toast priority-${options.priority || 'normal'}`;
        notificationEl.innerHTML = `
            <div class="notification-icon">${options.icon}</div>
            <div class="notification-content">
                <div class="notification-title">${options.title}</div>
                <div class="notification-body">${options.body}</div>
            </div>
            <button class="notification-close">✕</button>
        `;
        
        // Agregar al DOM
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notificationEl);
        
        // Animar entrada
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 100);
        
        // Botón cerrar
        const closeBtn = notificationEl.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notificationEl.classList.remove('show');
            setTimeout(() => notificationEl.remove(), 300);
        });
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (notificationEl.parentElement) {
                notificationEl.classList.remove('show');
                setTimeout(() => notificationEl.remove(), 300);
            }
        }, 5000);
    }

    /**
     * ✅ Verificar si ya se notificó
     */
    wasNotified(tag) {
        const notified = localStorage.getItem(`notified-${tag}`);
        return notified !== null;
    }

    /**
     * 📝 Marcar como notificado
     */
    async markAsNotified(tag) {
        localStorage.setItem(`notified-${tag}`, Date.now().toString());
    }

    /**
     * 💾 Guardar en historial
     */
    async saveToHistory(notification) {
        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .add({
                    ...notification,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                });
        } catch (error) {
            console.error('Error guardando en historial:', error);
        }
    }

    /**
     * 🔢 Calcular siguiente fecha de gasto recurrente
     */
    calculateNextDate(expense) {
        const today = new Date();
        const lastDate = expense.lastExecuted ? expense.lastExecuted.toDate() : new Date(expense.startDate);
        
        let nextDate = new Date(lastDate);
        
        switch (expense.frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        
        return nextDate > today ? nextDate : null;
    }

    /**
     * 📅 Obtener número de semana
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * 🔔 Solicitar permisos de notificaciones push
     */
    async requestPermission() {
        try {
            if (!("Notification" in window)) {
                throw new Error('Este navegador no soporta notificaciones');
            }
            
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                this.preferences.pushEnabled = true;
                await this.savePreferences();
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Error solicitando permisos:', error);
            return false;
        }
    }

    /**
     * ⚙️ Actualizar preferencias
     */
    async updatePreferences(newPreferences) {
        this.preferences = { ...this.preferences, ...newPreferences };
        await this.savePreferences();
        
        // Reiniciar checks si es necesario
        if (this.preferences.enabled && !this.checkInterval) {
            this.startPeriodicChecks();
        } else if (!this.preferences.enabled && this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * 📋 Obtener historial de notificaciones
     */
    async getHistory(limit = 20) {
        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
        } catch (error) {
            console.error('Error obteniendo historial:', error);
            return [];
        }
    }

    /**
     * ✅ Marcar notificación como leída
     */
    async markAsRead(notificationId) {
        try {
            await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .doc(notificationId)
                .update({ read: true });
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    }

    /**
     * 🗑️ Limpiar historial antiguo
     */
    async cleanOldHistory(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .where('timestamp', '<', cutoffDate)
                .get();
            
            const batch = firebase.firestore().batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log(`✅ Limpiados ${snapshot.size} registros antiguos`);
            
        } catch (error) {
            console.error('Error limpiando historial:', error);
        }
    }

    /**
     * 🛑 Destruir y limpiar
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isInitialized = false;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.IntelligentNotifications = IntelligentNotifications;
}
