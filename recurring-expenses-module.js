/**
 * 🔄 RECURRING EXPENSES MODULE - VERSIÓN COMPLETA Y FINAL
 * ======================================================
 * Sistema completo de gestión de gastos recurrentes automáticos
 * INCLUYE TODOS LOS MÉTODOS NECESARIOS
 */

class RecurringExpensesModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.recurringExpenses = [];
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
            yearly: {
                label: 'Anual',
                icon: '🎂',
                days: 365
            }
        };
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId || this.userId;
            console.log('🔄 Inicializando módulo de gastos recurrentes...');
            
            // Inicializar array vacío si no existe
            if (!Array.isArray(this.recurringExpenses)) {
                this.recurringExpenses = [];
            }
            
            // Cargar gastos recurrentes
            await this.loadRecurringExpenses();
            
            // Verificar y generar gastos pendientes
            await this.checkAndGenerateRecurring();
            
            this.isInitialized = true;
            console.log('✅ Módulo de gastos recurrentes inicializado');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando gastos recurrentes:', error);
            this.isInitialized = false;
            this.recurringExpenses = [];
            return false;
        }
    }

    /**
     * Cargar gastos recurrentes
     */
    async loadRecurringExpenses() {
        try {
            if (!this.userId) {
                console.warn('No hay usuario para cargar gastos recurrentes');
                this.recurringExpenses = [];
                return;
            }

            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .get();
            
            this.recurringExpenses = [];
            
            snapshot.forEach(doc => {
                this.recurringExpenses.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📋 ${this.recurringExpenses.length} gastos recurrentes cargados`);
        } catch (error) {
            console.error('Error cargando gastos recurrentes:', error);
            this.recurringExpenses = [];
        }
    }

    /**
     * Crear nuevo gasto recurrente
     */
    async createRecurringExpense(expenseData) {
        try {
            const recurring = {
                name: expenseData.name,
                amount: parseFloat(expenseData.amount),
                category: expenseData.category,
                frequency: expenseData.frequency,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                nextDate: this.calculateNextDate(new Date(), expenseData.frequency),
                lastGenerated: null
            };
            
            const docRef = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .add(recurring);
            
            recurring.id = docRef.id;
            this.recurringExpenses.push(recurring);
            
            console.log('✅ Gasto recurrente creado:', recurring);
            return { success: true, id: docRef.id };
            
        } catch (error) {
            console.error('Error creando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verificar y generar gastos recurrentes
     */
    async checkAndGenerateRecurring() {
        if (!this.isInitialized || !this.userId) {
            console.warn('Módulo no inicializado o sin usuario');
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        console.log('🔍 Verificando gastos recurrentes pendientes...');
        
        for (const recurring of this.recurringExpenses) {
            if (!recurring.active) continue;
            
            try {
                const nextDate = recurring.nextDate ? 
                    (recurring.nextDate.toDate ? recurring.nextDate.toDate() : new Date(recurring.nextDate)) : 
                    new Date();
                
                if (nextDate <= today) {
                    await this.generateExpense(recurring);
                }
            } catch (error) {
                console.error(`Error procesando gasto recurrente ${recurring.id}:`, error);
            }
        }
    }

    /**
     * Generar gasto individual
     */
    async generateExpense(recurring) {
        try {
            const expense = {
                description: `${recurring.name} (Recurrente)`,
                amount: recurring.amount,
                category: recurring.category,
                date: new Date().toISOString().split('T')[0],
                recurring: true,
                recurringId: recurring.id,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Guardar en la colección de gastos
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .add(expense);
            
            // Actualizar fecha del próximo gasto
            const nextDate = this.calculateNextDate(new Date(), recurring.frequency);
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(recurring.id)
                .update({
                    lastGenerated: firebase.firestore.FieldValue.serverTimestamp(),
                    nextDate: nextDate
                });
            
            console.log(`✅ Gasto recurrente generado: ${recurring.name}`);
            
            if (typeof showToast === 'function') {
                showToast(`✅ Gasto recurrente generado: ${recurring.name}`);
            }
            
        } catch (error) {
            console.error('Error generando gasto:', error);
        }
    }

    /**
     * NUEVO: Calcular próxima ocurrencia
     */
    calculateNextOccurrence(lastDate, frequency, dayOfMonth = 1) {
        const date = lastDate ? new Date(lastDate) : new Date();
        
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
                
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
                
            case 'biweekly':
            case 'quincenal':
                date.setDate(date.getDate() + 15);
                break;
                
            case 'monthly':
            case 'mensual':
                // Intentar mantener el mismo día del mes
                const currentMonth = date.getMonth();
                date.setMonth(currentMonth + 1);
                
                // Si el día no existe en el mes siguiente (ej: 31 de febrero)
                // usar el último día del mes
                if (date.getDate() !== dayOfMonth) {
                    date.setDate(0); // Último día del mes anterior
                }
                break;
                
            case 'yearly':
            case 'anual':
                date.setFullYear(date.getFullYear() + 1);
                break;
                
            default:
                // Si no se reconoce la frecuencia, agregar 30 días
                date.setDate(date.getDate() + 30);
        }
        
        return date;
    }

    /**
     * Calcular próxima fecha (método original mantenido por compatibilidad)
     */
    calculateNextDate(fromDate, frequency) {
        return this.calculateNextOccurrence(fromDate, frequency);
    }

    /**
     * Pausar/reactivar gasto recurrente
     */
    async toggleRecurring(id) {
        try {
            const recurring = this.recurringExpenses.find(r => r.id === id);
            if (!recurring) return { success: false, error: 'Gasto no encontrado' };
            
            const newStatus = !recurring.active;
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .update({ active: newStatus });
            
            recurring.active = newStatus;
            
            if (typeof showToast === 'function') {
                showToast(newStatus ? '✅ Gasto recurrente activado' : '⏸️ Gasto recurrente pausado');
            }
            
            return { success: true, active: newStatus };
            
        } catch (error) {
            console.error('Error actualizando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Eliminar gasto recurrente
     */
    async deleteRecurring(id) {
        try {
            if (!confirm('¿Estás seguro de que quieres eliminar este gasto recurrente?')) {
                return { success: false };
            }
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('recurringExpenses')
                .doc(id)
                .delete();
            
            this.recurringExpenses = this.recurringExpenses.filter(r => r.id !== id);
            
            if (typeof showToast === 'function') {
                showToast('🗑️ Gasto recurrente eliminado');
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Error eliminando gasto recurrente:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas
     */
    getStatistics() {
        if (!Array.isArray(this.recurringExpenses)) {
            this.recurringExpenses = [];
        }
        
        const active = this.recurringExpenses.filter(r => r.active).length;
        const paused = this.recurringExpenses.filter(r => !r.active).length;
        const monthlyEstimate = this.calculateMonthlyTotal();
        
        // Contar gastos generados en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const totalGenerated = this.recurringExpenses.reduce((count, recurring) => {
            if (recurring.lastGenerated) {
                try {
                    const lastGen = recurring.lastGenerated.toDate ? 
                        recurring.lastGenerated.toDate() : 
                        new Date(recurring.lastGenerated);
                    
                    if (lastGen >= thirtyDaysAgo) {
                        return count + 1;
                    }
                } catch (e) {
                    console.warn('Error procesando fecha:', e);
                }
            }
            return count;
        }, 0);
        
        return {
            active,
            paused,
            monthlyEstimate,
            totalGenerated
        };
    }

    /**
     * Obtener próximos gastos
     */
    getUpcomingExpenses(days = 30) {
        if (!Array.isArray(this.recurringExpenses)) {
            return [];
        }
        
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        
        const upcoming = [];
        
        this.recurringExpenses
            .filter(r => r.active)
            .forEach(recurring => {
                try {
                    const nextDate = recurring.nextDate ? 
                        (recurring.nextDate.toDate ? recurring.nextDate.toDate() : new Date(recurring.nextDate)) : 
                        this.calculateNextDate(new Date(), recurring.frequency);
                    
                    if (nextDate >= today && nextDate <= endDate) {
                        upcoming.push({
                            ...recurring,
                            nextDate: nextDate
                        });
                    }
                } catch (e) {
                    console.warn('Error procesando fecha de gasto recurrente:', e);
                }
            });
        
        return upcoming.sort((a, b) => (a.nextDate || 0) - (b.nextDate || 0));
    }

    /**
     * Calcular total mensual
     */
    calculateMonthlyTotal() {
        if (!Array.isArray(this.recurringExpenses)) {
            return 0;
        }
        
        return this.recurringExpenses
            .filter(r => r.active)
            .reduce((total, recurring) => {
                let monthlyAmount = recurring.amount || 0;
                
                switch(recurring.frequency) {
                    case 'daily':
                        monthlyAmount = recurring.amount * 30;
                        break;
                    case 'weekly':
                        monthlyAmount = recurring.amount * 4;
                        break;
                    case 'biweekly':
                    case 'quincenal':
                        monthlyAmount = recurring.amount * 2;
                        break;
                    case 'yearly':
                    case 'anual':
                        monthlyAmount = recurring.amount / 12;
                        break;
                }
                
                return total + monthlyAmount;
            }, 0);
    }

    /**
     * Renderizar vista de gastos recurrentes
     */
    renderRecurringExpensesView() {
        if (!this.isInitialized) {
            return `
                <div class="recurring-expenses">
                    <div class="empty-state">
                        <p>Módulo de gastos recurrentes no inicializado</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            🔄 Recargar Página
                        </button>
                    </div>
                </div>
            `;
        }

        if (!Array.isArray(this.recurringExpenses)) {
            this.recurringExpenses = [];
        }

        const activeRecurring = this.recurringExpenses.filter(r => r.active);
        const pausedRecurring = this.recurringExpenses.filter(r => !r.active);

        return `
            <div class="recurring-expenses-container">
                <div class="recurring-header">
                    <h3>🔄 Gastos Recurrentes</h3>
                    <p class="recurring-subtitle">Gestiona tus pagos automáticos</p>
                </div>

                <div class="recurring-stats">
                    <div class="stat-card">
                        <span class="stat-value">${this.recurringExpenses.length}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${activeRecurring.length}</span>
                        <span class="stat-label">Activos</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">$${this.calculateMonthlyTotal().toFixed(2)}</span>
                        <span class="stat-label">Total Mensual</span>
                    </div>
                </div>

                <div class="recurring-list">
                    <h4>💚 Activos</h4>
                    ${activeRecurring.length > 0 ? 
                        activeRecurring.map(r => this.renderRecurringItem(r)).join('') : 
                        '<p class="empty-message">No hay gastos recurrentes activos</p>'
                    }

                    ${pausedRecurring.length > 0 ? `
                        <h4 style="margin-top: 2rem;">⏸️ Pausados</h4>
                        ${pausedRecurring.map(r => this.renderRecurringItem(r)).join('')}
                    ` : ''}
                </div>

                <button class="fab-option add-recurring" onclick="openRecurringModal()" 
                        style="position: fixed; bottom: 100px; right: 20px; background: linear-gradient(135deg, #667EEA, #764BA2);">
                    ➕
                </button>
            </div>
        `;
    }

    /**
     * Renderizar item individual
     */
    renderRecurringItem(recurring) {
        let nextDate = new Date();
        
        try {
            if (recurring.nextDate) {
                nextDate = recurring.nextDate.toDate ? recurring.nextDate.toDate() : new Date(recurring.nextDate);
            }
        } catch (e) {
            console.warn('Error procesando fecha:', e);
        }

        return `
            <div class="recurring-item ${!recurring.active ? 'paused' : ''}">
                <div class="recurring-info">
                    <h5>${recurring.name || 'Sin nombre'}</h5>
                    <p>$${(recurring.amount || 0).toFixed(2)} - ${this.frequencies[recurring.frequency]?.label || recurring.frequency}</p>
                    <small>Próximo: ${nextDate.toLocaleDateString()}</small>
                </div>
                <div class="recurring-actions">
                    <button class="btn-icon" onclick="recurringModule.toggleRecurring('${recurring.id}')" 
                            title="${recurring.active ? 'Pausar' : 'Activar'}">
                        ${recurring.active ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn-icon" onclick="recurringModule.deleteRecurring('${recurring.id}')"
                            title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.RecurringExpensesModule = RecurringExpensesModule;
    console.log('🔄 Módulo de gastos recurrentes cargado correctamente - v2.0 COMPLETO');
}
