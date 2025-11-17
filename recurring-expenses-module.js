/**
 * 🔄 RECURRING EXPENSES MODULE - PARTE 2: GASTOS RECURRENTES MEJORADOS
 * ======================================================================
 * Sistema completo de gestión de gastos recurrentes automáticos
 * 
 * Características:
 * ✅ Crear gastos automáticos con múltiples frecuencias
 * ✅ Frecuencias: Diaria, Semanal, Quincenal, Mensual, Anual
 * ✅ Pausar/reactivar gastos en cualquier momento
 * ✅ Generación automática según fecha configurada
 * ✅ Notificaciones antes del vencimiento
 * ✅ Historial completo de gastos generados
 * ✅ Editar y eliminar gastos recurrentes
 * ✅ Vista calendario de próximos gastos
 * ✅ Estadísticas y análisis
 */

class RecurringExpensesModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.recurringExpenses = [];
        this.generatedHistory = [];
        this.isInitialized = false;
        
        // Configuración de frecuencias
        this.frequencies = {
            daily: {
                label: 'Diario',
                icon: '📅',
                days: 1
            },
            weekly: {
                label: 'Semanal',
                icon: '📆',
                days: 7
            },
            biweekly: {
                label: 'Quincenal',
                icon: '🗓️',
                days: 15
            },
            monthly: {
                label: 'Mensual',
                icon: '📋',
                days: 30
            },
            annual: {
                label: 'Anual',
                icon: '🎂',
                days: 365
            }
        };
        
        // Intervalo para verificar gastos pendientes
        this.checkInterval = null;
    }

    /**
     * 🚀 Inicializar módulo
     */
    async initialize() {
        try {
            console.log('🔄 Inicializando módulo de gastos recurrentes...');
            
            // Cargar gastos recurrentes
            await this.loadRecurringExpenses();
            
            // Cargar historial
            await this.loadGeneratedHistory();
            
            // Verificar y generar gastos pendientes
            await this.checkAndGenerateRecurring();
            
            // Iniciar verificación periódica (cada hora)
            this.startPeriodicCheck();
            
            this.isInitialized = true;
            console.log('✅ Módulo de gastos recurrentes inicializado');
            console.log(`📊 Gastos recurrentes activos: ${this.recurringExpenses.filter(r => r.active).length}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando gastos recurrentes:', error);
            return false;
        }
    }

    /**
     * 📥 Cargar gastos recurrentes
     */
    async loadRecurringExpenses() {
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .orderBy('nextDate', 'asc')
                .get();
            
            this.recurringExpenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`✅ ${this.recurringExpenses.length} gastos recurrentes cargados`);
        } catch (error) {
            console.error('Error cargando gastos recurrentes:', error);
            this.recurringExpenses = [];
        }
    }

    /**
     * 📜 Cargar historial de gastos generados
     */
    async loadGeneratedHistory() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('isRecurring', '==', true)
                .where('date', '>=', this.formatDate(thirtyDaysAgo))
                .orderBy('date', 'desc')
                .get();
            
            this.generatedHistory = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📜 ${this.generatedHistory.length} gastos recurrentes en historial`);
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.generatedHistory = [];
        }
    }

    /**
     * ➕ Crear nuevo gasto recurrente
     */
    async createRecurringExpense(expenseData) {
        try {
            const { description, amount, category, frequency, startDate, dayOfMonth } = expenseData;
            
            // Validaciones
            if (!description || !amount || !category || !frequency || !startDate) {
                throw new Error('Todos los campos son obligatorios');
            }
            
            if (amount <= 0) {
                throw new Error('El monto debe ser mayor a 0');
            }
            
            if (!this.frequencies[frequency]) {
                throw new Error('Frecuencia no válida');
            }
            
            // Calcular primera fecha de generación
            const firstDate = new Date(startDate);
            
            // Si es mensual y se especificó día del mes
            if (frequency === 'monthly' && dayOfMonth) {
                firstDate.setDate(dayOfMonth);
                if (firstDate < new Date()) {
                    firstDate.setMonth(firstDate.getMonth() + 1);
                }
            }
            
            const recurringExpense = {
                description: description.trim(),
                amount: parseFloat(amount),
                category,
                frequency,
                startDate: this.formatDate(new Date(startDate)),
                nextDate: this.formatDate(firstDate),
                dayOfMonth: dayOfMonth || null,
                active: true,
                createdAt: new Date(),
                lastGenerated: null,
                timesGenerated: 0
            };
            
            const docRef = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .add(recurringExpense);
            
            // Agregar a la lista local
            this.recurringExpenses.push({
                id: docRef.id,
                ...recurringExpense
            });
            
            this.showNotification(
                `✅ Gasto recurrente creado: ${description}`,
                'success'
            );
            
            return { success: true, id: docRef.id };
            
        } catch (error) {
            console.error('Error creando gasto recurrente:', error);
            this.showNotification(
                `❌ Error: ${error.message}`,
                'error'
            );
            return { success: false, error: error.message };
        }
    }

    /**
     * ✏️ Editar gasto recurrente
     */
    async updateRecurringExpense(id, updates) {
        try {
            const allowedFields = ['description', 'amount', 'category', 'frequency', 'dayOfMonth'];
            const updateData = {};
            
            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key) && updates[key] !== undefined) {
                    updateData[key] = updates[key];
                }
            });
            
            if (Object.keys(updateData).length === 0) {
                throw new Error('No hay campos para actualizar');
            }
            
            updateData.updatedAt = new Date();
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .update(updateData);
            
            // Actualizar en lista local
            const index = this.recurringExpenses.findIndex(r => r.id === id);
            if (index !== -1) {
                this.recurringExpenses[index] = {
                    ...this.recurringExpenses[index],
                    ...updateData
                };
            }
            
            this.showNotification('✅ Gasto recurrente actualizado', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('Error actualizando gasto recurrente:', error);
            this.showNotification(`❌ Error: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * ⏸️ Pausar gasto recurrente
     */
    async pauseRecurringExpense(id) {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .update({
                    active: false,
                    pausedAt: new Date()
                });
            
            // Actualizar en lista local
            const index = this.recurringExpenses.findIndex(r => r.id === id);
            if (index !== -1) {
                this.recurringExpenses[index].active = false;
            }
            
            this.showNotification('⏸️ Gasto recurrente pausado', 'info');
            return { success: true };
            
        } catch (error) {
            console.error('Error pausando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ▶️ Reactivar gasto recurrente
     */
    async resumeRecurringExpense(id) {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .update({
                    active: true,
                    resumedAt: new Date()
                });
            
            // Actualizar en lista local
            const index = this.recurringExpenses.findIndex(r => r.id === id);
            if (index !== -1) {
                this.recurringExpenses[index].active = true;
            }
            
            this.showNotification('▶️ Gasto recurrente reactivado', 'success');
            return { success: true };
            
        } catch (error) {
            console.error('Error reactivando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ Eliminar gasto recurrente
     */
    async deleteRecurringExpense(id) {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .delete();
            
            // Eliminar de lista local
            this.recurringExpenses = this.recurringExpenses.filter(r => r.id !== id);
            
            this.showNotification('🗑️ Gasto recurrente eliminado', 'info');
            return { success: true };
            
        } catch (error) {
            console.error('Error eliminando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔄 Verificar y generar gastos pendientes
     */
    async checkAndGenerateRecurring() {
        if (!this.isInitialized && this.recurringExpenses.length === 0) {
            return;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let generatedCount = 0;
        const promises = [];
        
        for (const recurring of this.recurringExpenses) {
            // Solo procesar gastos activos
            if (!recurring.active) continue;
            
            const nextDate = new Date(recurring.nextDate);
            nextDate.setHours(0, 0, 0, 0);
            
            // Si la fecha ya llegó, generar el gasto
            if (nextDate <= today) {
                promises.push(this.generateExpenseFromRecurring(recurring, today));
                generatedCount++;
            }
        }
        
        // Ejecutar todas las generaciones en paralelo
        if (promises.length > 0) {
            await Promise.all(promises);
            
            // Recargar datos
            await this.loadRecurringExpenses();
            await this.loadGeneratedHistory();
            
            this.showNotification(
                `✅ ${generatedCount} gasto(s) recurrente(s) generado(s)`,
                'success'
            );
        }
        
        return generatedCount;
    }

    /**
     * 💸 Generar gasto desde recurrente
     */
    async generateExpenseFromRecurring(recurring, date) {
        try {
            // Crear el gasto
            const newExpense = {
                description: recurring.description,
                amount: recurring.amount,
                category: recurring.category,
                date: this.formatDate(date),
                timestamp: new Date(),
                isRecurring: true,
                recurringId: recurring.id,
                recurringFrequency: recurring.frequency
            };
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .add(newExpense);
            
            // Calcular próxima fecha
            const nextDate = this.calculateNextDate(date, recurring.frequency, recurring.dayOfMonth);
            
            // Actualizar el gasto recurrente
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(recurring.id)
                .update({
                    nextDate: this.formatDate(nextDate),
                    lastGenerated: new Date(),
                    timesGenerated: (recurring.timesGenerated || 0) + 1
                });
            
            console.log(`✅ Generado: ${recurring.description} - $${recurring.amount}`);
            
            // Notificación del navegador
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('💰 Gasto Recurrente Generado', {
                    body: `${recurring.description}: $${recurring.amount.toFixed(2)}`,
                    icon: './ios/180.png',
                    badge: './ios/96.png',
                    tag: `recurring-${recurring.id}`
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('Error generando gasto:', error);
            return false;
        }
    }

    /**
     * 📅 Calcular próxima fecha
     */
    calculateNextDate(currentDate, frequency, dayOfMonth = null) {
        const nextDate = new Date(currentDate);
        
        switch (frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
                
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
                
            case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 15);
                break;
                
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                if (dayOfMonth) {
                    nextDate.setDate(Math.min(dayOfMonth, this.getDaysInMonth(nextDate)));
                }
                break;
                
            case 'annual':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
                
            default:
                nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        return nextDate;
    }

    /**
     * 📊 Obtener estadísticas
     */
    getStatistics() {
        const active = this.recurringExpenses.filter(r => r.active);
        const paused = this.recurringExpenses.filter(r => !r.active);
        
        // Total mensual estimado
        let monthlyTotal = 0;
        active.forEach(recurring => {
            const freqDays = this.frequencies[recurring.frequency]?.days || 30;
            const monthlyOccurrences = 30 / freqDays;
            monthlyTotal += recurring.amount * monthlyOccurrences;
        });
        
        // Por categoría
        const byCategory = {};
        active.forEach(recurring => {
            byCategory[recurring.category] = (byCategory[recurring.category] || 0) + recurring.amount;
        });
        
        // Por frecuencia
        const byFrequency = {};
        active.forEach(recurring => {
            const freq = recurring.frequency;
            byFrequency[freq] = (byFrequency[freq] || 0) + 1;
        });
        
        return {
            total: this.recurringExpenses.length,
            active: active.length,
            paused: paused.length,
            monthlyEstimate: monthlyTotal,
            byCategory,
            byFrequency,
            totalGenerated: this.generatedHistory.length
        };
    }

    /**
     * 📆 Obtener próximos gastos (calendario)
     */
    getUpcomingExpenses(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        
        const upcoming = [];
        
        for (const recurring of this.recurringExpenses) {
            if (!recurring.active) continue;
            
            let currentDate = new Date(recurring.nextDate);
            
            while (currentDate <= futureDate) {
                if (currentDate >= today) {
                    upcoming.push({
                        ...recurring,
                        dueDate: new Date(currentDate),
                        daysUntil: Math.ceil((currentDate - today) / (1000 * 60 * 60 * 24))
                    });
                }
                
                currentDate = this.calculateNextDate(currentDate, recurring.frequency, recurring.dayOfMonth);
            }
        }
        
        // Ordenar por fecha
        return upcoming.sort((a, b) => a.dueDate - b.dueDate);
    }

    /**
     * 🔔 Enviar recordatorios
     */
    async sendReminders(daysBefore = 1) {
        const today = new Date();
        const reminderDate = new Date();
        reminderDate.setDate(reminderDate.getDate() + daysBefore);
        
        const reminders = [];
        
        for (const recurring of this.recurringExpenses) {
            if (!recurring.active) continue;
            
            const nextDate = new Date(recurring.nextDate);
            nextDate.setHours(0, 0, 0, 0);
            reminderDate.setHours(0, 0, 0, 0);
            
            if (nextDate.getTime() === reminderDate.getTime()) {
                reminders.push(recurring);
                
                // Notificación del navegador
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('🔔 Recordatorio: Gasto Próximo', {
                        body: `Mañana: ${recurring.description} - $${recurring.amount.toFixed(2)}`,
                        icon: './ios/180.png',
                        badge: './ios/96.png',
                        tag: `reminder-${recurring.id}`
                    });
                }
            }
        }
        
        return reminders;
    }

    /**
     * ⏱️ Iniciar verificación periódica
     */
    startPeriodicCheck() {
        // Verificar cada hora
        this.checkInterval = setInterval(() => {
            console.log('🔄 Verificando gastos recurrentes...');
            this.checkAndGenerateRecurring();
        }, 60 * 60 * 1000); // 1 hora
        
        console.log('✅ Verificación periódica iniciada');
    }

    /**
     * 🛑 Detener verificación periódica
     */
    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('⏹️ Verificación periódica detenida');
        }
    }

    /**
     * 🔧 Utilidades
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    showNotification(message, type = 'info') {
        if (window.Toastify) {
            const backgrounds = {
                success: 'linear-gradient(to right, #10b981, #059669)',
                error: 'linear-gradient(to right, #ef4444, #dc2626)',
                info: 'linear-gradient(to right, #3b82f6, #2563eb)',
                warning: 'linear-gradient(to right, #f59e0b, #d97706)'
            };
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'top',
                position: 'right',
                style: {
                    background: backgrounds[type] || backgrounds.info
                }
            }).showToast();
        } else {
            console.log(message);
        }
    }

    /**
     * 🧹 Limpiar y destruir
     */
    destroy() {
        this.stopPeriodicCheck();
        this.recurringExpenses = [];
        this.generatedHistory = [];
        this.isInitialized = false;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.RecurringExpensesModule = RecurringExpensesModule;
}

console.log('✅ Módulo de Gastos Recurrentes cargado');
