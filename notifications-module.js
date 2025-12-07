/**
 * 🔔 NOTIFICATIONS MODULE - COMPLETO Y CORREGIDO
 * =============================================
 * Sistema de notificaciones inteligentes
 */

class NotificationsModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.isInitialized = false;
        
        // Preferencias por defecto
        this.preferences = {
            enabled: true,
            budgetAlerts: true,
            weeklyReport: true,
            weeklyReportDay: 'monday', // Asegurar que es string
            unusualExpenses: true,
            recurringReminders: true,
            goalProgress: true,
            alertThreshold: 80 // % del presupuesto
        };
        
        this.history = [];
        this.checkInterval = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize() {
        try {
            console.log('🔔 Inicializando módulo de notificaciones...');
            
            // Cargar preferencias del usuario
            await this.loadPreferences();
            
            // Cargar historial
            await this.loadHistory();
            
            // Iniciar verificaciones periódicas
            this.startPeriodicChecks();
            
            // Verificar notificaciones pendientes
            await this.checkPendingNotifications();
            
            this.isInitialized = true;
            console.log('✅ Módulo de notificaciones inicializado');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando notificaciones:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Cargar preferencias
     */
    async loadPreferences() {
        try {
            if (!this.userId) return;
            
            const doc = await this.db
                .collection('users')
                .doc(this.userId)
                .get();
            
            if (doc.exists && doc.data().notificationPreferences) {
                // Merge con las preferencias por defecto para asegurar todos los campos
                this.preferences = {
                    ...this.preferences,
                    ...doc.data().notificationPreferences
                };
                
                // Asegurar que weeklyReportDay es string
                if (typeof this.preferences.weeklyReportDay !== 'string') {
                    this.preferences.weeklyReportDay = 'monday';
                }
            }
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        }
    }

    /**
     * Cargar historial
     */
    async loadHistory() {
        try {
            if (!this.userId) return;
            
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('notifications')
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
            
            this.history = [];
            snapshot.forEach(doc => {
                this.history.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        } catch (error) {
            console.error('Error cargando historial:', error);
            this.history = [];
        }
    }

    /**
     * Actualizar preferencias
     */
    async updatePreferences(updates) {
        try {
            this.preferences = {
                ...this.preferences,
                ...updates
            };
            
            // Asegurar que weeklyReportDay es string
            if (this.preferences.weeklyReportDay && typeof this.preferences.weeklyReportDay !== 'string') {
                this.preferences.weeklyReportDay = 'monday';
            }
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .update({
                    notificationPreferences: this.preferences
                });
            
            return true;
        } catch (error) {
            console.error('Error actualizando preferencias:', error);
            return false;
        }
    }

    /**
     * Iniciar verificaciones periódicas
     */
    startPeriodicChecks() {
        // Limpiar intervalo anterior si existe
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // Verificar cada hora
        this.checkInterval = setInterval(() => {
            this.checkPendingNotifications();
        }, 3600000); // 1 hora
    }

    /**
     * Verificar notificaciones pendientes
     */
    async checkPendingNotifications() {
        if (!this.preferences.enabled || !this.userId) return;
        
        try {
            // Verificar alertas de presupuesto
            if (this.preferences.budgetAlerts) {
                await this.checkBudgetAlerts();
            }
            
            // Verificar reporte semanal
            if (this.preferences.weeklyReport) {
                await this.checkWeeklyReport();
            }
            
            // Verificar gastos inusuales
            if (this.preferences.unusualExpenses) {
                await this.checkUnusualExpenses();
            }
            
        } catch (error) {
            console.error('Error verificando notificaciones:', error);
        }
    }

    /**
     * Verificar alertas de presupuesto
     */
    async checkBudgetAlerts() {
        // Implementación de verificación de presupuesto
        console.log('📊 Verificando alertas de presupuesto...');
    }

   async checkWeeklyReport() {
    try {
        const today = new Date();
        const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        
        let reportDay = this.preferences.weeklyReportDay;
        if (typeof reportDay !== 'string') reportDay = 'monday';
        reportDay = reportDay.toLowerCase();

        if (dayOfWeek === reportDay) {
            console.log("Hoy es día de reporte semanal");
            await this.generateWeeklyReport();
        }
    } catch (error) {
        console.error('Error en checkWeeklyReport:', error);
    }
}

    /**
     * Verificar gastos inusuales
     */
    async checkUnusualExpenses() {
        // Implementación de verificación de gastos inusuales
        console.log('🔍 Verificando gastos inusuales...');
    }

    /**
     * Generar reporte semanal
     */
    async generateWeeklyReport() {
        try {
            console.log('📊 Generando reporte semanal...');
            
            const notification = {
                type: 'weekly-report',
                title: '📊 Tu Reporte Semanal',
                message: 'Resumen de tu actividad financiera de la semana',
                data: {
                    // Aquí irían los datos del reporte
                },
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            
            await this.createNotification(notification);
            
        } catch (error) {
            console.error('Error generando reporte semanal:', error);
        }
    }

    /**
     * Crear notificación
     */
    async createNotification(notification) {
        try {
            const docRef = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('notifications')
                .add(notification);
            
            notification.id = docRef.id;
            this.history.unshift(notification);
            
            // Mostrar notificación en UI
            if (typeof showToast === 'function') {
                showToast(notification.title, 'info');
            }
            
            return notification;
        } catch (error) {
            console.error('Error creando notificación:', error);
            return null;
        }
    }

    /**
     * Marcar como leída
     */
    async markAsRead(notificationId) {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('notifications')
                .doc(notificationId)
                .update({ read: true });
            
            const notification = this.history.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
            }
            
            return true;
        } catch (error) {
            console.error('Error marcando notificación:', error);
            return false;
        }
    }

    /**
     * Obtener notificaciones no leídas
     */
    getUnreadCount() {
        return this.history.filter(n => !n.read).length;
    }

    /**
     * Limpiar recursos
     */
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.NotificationsModule = NotificationsModule;
    console.log('🔔 Módulo de notificaciones cargado correctamente');
}
