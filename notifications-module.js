/**
 * 🔔 ENHANCED NOTIFICATIONS MODULE
 * ================================
 * Sistema completo de notificaciones con:
 * - Configuración de horarios
 * - Push notifications al celular
 * - Recordatorios inteligentes
 * - Frecuencias personalizables
 */

class NotificationsModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.isInitialized = false;
        
        // Preferencias del usuario
        this.preferences = {
            enabled: true,
            dailyReminder: true,
            dailyReminderTime: '20:00', // Hora del recordatorio diario
            weeklyReport: true,
            weeklyReportDay: 0, // 0 = Domingo
            weeklyReportTime: '18:00',
            budgetAlerts: true,
            unusualExpenses: true,
            monthlyReminder: true,
            monthlyReminderDay: 1, // Día 1 de cada mes
            monthlyReminderTime: '09:00',
            pushEnabled: false // Push notifications al celular
        };
        
        // Historial de notificaciones
        this.history = [];
        
        // Tipos de recordatorios
        this.reminderTypes = {
            DAILY_EXPENSE: {
                title: '📝 ¿Ya registraste tus gastos de hoy?',
                body: 'No olvides mantener tu registro actualizado',
                icon: '💰'
            },
            WEEKLY_INCOME: {
                title: '💵 ¿Ya ingresaste tus ingresos de esta semana?',
                body: 'Mantén tu balance al día',
                icon: '📊'
            },
            WEEKLY_REPORT: {
                title: '📊 Resumen semanal de tus finanzas',
                body: 'Revisa tu progreso de la semana',
                icon: '📈'
            },
            MONTHLY_REPORT: {
                title: '📅 Resumen mensual',
                body: 'Revisa cómo te fue este mes',
                icon: '🎯'
            },
            BUDGET_WARNING: {
                title: '⚠️ Alerta de presupuesto',
                body: 'Te estás acercando al límite',
                icon: '💸'
            },
            BUDGET_EXCEEDED: {
                title: '🚨 Presupuesto excedido',
                body: 'Has superado tu límite establecido',
                icon: '❌'
            },
            RECURRING_EXPENSE: {
                title: '🔄 Gasto recurrente próximo',
                body: 'Tienes un pago programado pronto',
                icon: '📆'
            }
        };
        
        // Intervalo de verificación
        this.checkInterval = null;
    }

    /**
     * 🚀 Inicializar módulo
     */
    async initialize() {
        try {
            console.log('🔔 Inicializando módulo de notificaciones...');
            
            // Cargar preferencias
            await this.loadPreferences();
            
            // Cargar historial
            await this.loadHistory();
            
            // Solicitar permisos de notificaciones
            if (this.preferences.pushEnabled) {
                await this.requestNotificationPermission();
            }
            
            // Iniciar verificación periódica (cada 30 minutos)
            this.startPeriodicCheck();
            
            // Programar recordatorios
            this.scheduleReminders();
            
            this.isInitialized = true;
            console.log('✅ Módulo de notificaciones inicializado');
            
            return true;
        } catch (error) {
            console.error('❌ Error inicializando notificaciones:', error);
            return false;
        }
    }

    /**
     * 📥 Cargar preferencias del usuario
     */
    async loadPreferences() {
        try {
            const doc = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('notifications')
                .get();
            
            if (doc.exists) {
                this.preferences = { ...this.preferences, ...doc.data() };
            }
        } catch (error) {
            console.error('Error cargando preferencias:', error);
        }
    }

    /**
     * 💾 Guardar preferencias
     */
    async updatePreferences(updates) {
        try {
            this.preferences = { ...this.preferences, ...updates };
            
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('notifications')
                .set(this.preferences);
            
            // Si se habilitaron push notifications, solicitar permisos
            if (updates.pushEnabled && !this.hasNotificationPermission()) {
                await this.requestNotificationPermission();
            }
            
            // Reprogramar recordatorios
            this.scheduleReminders();
            
            return { success: true };
        } catch (error) {
            console.error('Error guardando preferencias:', error);
            return { success: false, error };
        }
    }

    /**
     * 📜 Cargar historial
     */
    async loadHistory() {
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();
            
            this.history = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }

    /**
     * 🔔 Solicitar permisos de notificaciones
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('Este navegador no soporta notificaciones');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    }

    /**
     * 🔍 Verificar si tiene permisos
     */
    hasNotificationPermission() {
        return 'Notification' in window && Notification.permission === 'granted';
    }

    /**
     * 📲 Enviar notificación push
     */
    async sendPushNotification(type, customData = {}) {
        if (!this.preferences.enabled || !this.preferences.pushEnabled) {
            return;
        }
        
        if (!this.hasNotificationPermission()) {
            console.warn('No hay permisos para notificaciones');
            return;
        }
        
        const template = this.reminderTypes[type];
        if (!template) {
            console.error('Tipo de notificación desconocido:', type);
            return;
        }
        
        const notification = new Notification(template.title, {
            body: customData.body || template.body,
            icon: '/ios/180.png',
            badge: '/ios/180.png',
            tag: type,
            requireInteraction: false,
            vibrate: [200, 100, 200]
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        // Guardar en historial
        await this.saveToHistory({
            type,
            title: template.title,
            body: customData.body || template.body,
            timestamp: new Date(),
            read: false
        });
    }

    /**
     * 💾 Guardar notificación en historial
     */
    async saveToHistory(notificationData) {
        try {
            await this.db
                .collection('users')
                .doc(this.userId)
                .collection('notificationHistory')
                .add({
                    ...notificationData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            // Actualizar historial local
            this.history.unshift(notificationData);
        } catch (error) {
            console.error('Error guardando en historial:', error);
        }
    }

    /**
     * ⏰ Programar recordatorios
     */
    scheduleReminders() {
        // Limpiar intervalos anteriores
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        // Verificar cada minuto si es hora de enviar recordatorios
        this.checkInterval = setInterval(() => {
            this.checkScheduledReminders();
        }, 60000); // Cada 60 segundos
        
        console.log('⏰ Recordatorios programados');
    }

    /**
     * 🔍 Verificar recordatorios programados
     */
    async checkScheduledReminders() {
        if (!this.preferences.enabled) return;
        
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const currentDay = now.getDay();
        const currentDayOfMonth = now.getDate();
        
        // Recordatorio diario
        if (this.preferences.dailyReminder && currentTime === this.preferences.dailyReminderTime) {
            await this.sendDailyReminder();
        }
        
        // Reporte semanal
        if (this.preferences.weeklyReport && 
            currentDay === this.preferences.weeklyReportDay && 
            currentTime === this.preferences.weeklyReportTime) {
            await this.sendWeeklyReport();
        }
        
        // Recordatorio mensual
        if (this.preferences.monthlyReminder && 
            currentDayOfMonth === this.preferences.monthlyReminderDay && 
            currentTime === this.preferences.monthlyReminderTime) {
            await this.sendMonthlyReport();
        }
    }

    /**
     * 📝 Enviar recordatorio diario
     */
    async sendDailyReminder() {
        // Verificar si ya registró gastos hoy
        const today = new Date().toISOString().split('T')[0];
        
        const snapshot = await this.db
            .collection('users')
            .doc(this.userId)
            .collection('expenses')
            .where('date', '==', today)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            await this.sendPushNotification('DAILY_EXPENSE');
        }
    }

    /**
     * 📊 Enviar reporte semanal
     */
    async sendWeeklyReport() {
        await this.sendPushNotification('WEEKLY_REPORT', {
            body: 'Revisa tu progreso de la semana y ajusta tus metas'
        });
    }

    /**
     * 📅 Enviar reporte mensual
     */
    async sendMonthlyReport() {
        await this.sendPushNotification('MONTHLY_REPORT', {
            body: 'Analiza tus finanzas del mes y planifica el siguiente'
        });
    }

    /**
     * 🔄 Iniciar verificación periódica
     */
    startPeriodicCheck() {
        // Verificar cada 30 minutos
        setInterval(async () => {
            if (!this.preferences.enabled) return;
            
            await this.checkBudgetAlerts();
            await this.checkRecurringExpenses();
        }, 1800000); // 30 minutos
    }

    /**
     * 💰 Verificar alertas de presupuesto
     */
    async checkBudgetAlerts() {
        if (!this.preferences.budgetAlerts) return;
        
        // Implementar lógica de verificación de presupuesto
        // (se conectaría con el módulo de presupuestos)
    }

    /**
     * 🔄 Verificar gastos recurrentes próximos
     */
    async checkRecurringExpenses() {
        // Implementar lógica de verificación de gastos recurrentes
        // (se conectaría con el módulo de gastos recurrentes)
    }

    /**
     * 🎨 Renderizar configuración de notificaciones
     */
    renderSettings() {
        return `
            <div class="notification-settings">
                <h3>🔔 Configuración de Notificaciones</h3>
                
                <!-- Activar/Desactivar -->
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.enabled ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ enabled: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">Activar notificaciones</span>
                    </label>
                </div>
                
                <!-- Push Notifications -->
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.pushEnabled ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ pushEnabled: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">📲 Notificaciones push al celular</span>
                    </label>
                </div>
                
                <!-- Recordatorio diario -->
                <div class="setting-group">
                    <h4>📝 Recordatorio Diario</h4>
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.dailyReminder ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ dailyReminder: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">¿Ya registraste tus gastos de hoy?</span>
                    </label>
                    <div class="time-input">
                        <label>Hora:</label>
                        <input type="time" value="${this.preferences.dailyReminderTime}" 
                               onchange="notificationsModule.updatePreferences({ dailyReminderTime: this.value })">
                    </div>
                </div>
                
                <!-- Reporte semanal -->
                <div class="setting-group">
                    <h4>📊 Reporte Semanal</h4>
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.weeklyReport ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ weeklyReport: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">Resumen semanal de finanzas</span>
                    </label>
                    <div class="time-input">
                        <label>Día:</label>
                        <select onchange="notificationsModule.updatePreferences({ weeklyReportDay: parseInt(this.value) })">
                            <option value="0" ${this.preferences.weeklyReportDay === 0 ? 'selected' : ''}>Domingo</option>
                            <option value="1" ${this.preferences.weeklyReportDay === 1 ? 'selected' : ''}>Lunes</option>
                            <option value="6" ${this.preferences.weeklyReportDay === 6 ? 'selected' : ''}>Sábado</option>
                        </select>
                        <label>Hora:</label>
                        <input type="time" value="${this.preferences.weeklyReportTime}" 
                               onchange="notificationsModule.updatePreferences({ weeklyReportTime: this.value })">
                    </div>
                </div>
                
                <!-- Reporte mensual -->
                <div class="setting-group">
                    <h4>📅 Reporte Mensual</h4>
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.monthlyReminder ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ monthlyReminder: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">Resumen mensual</span>
                    </label>
                    <div class="time-input">
                        <label>Día del mes:</label>
                        <input type="number" min="1" max="28" value="${this.preferences.monthlyReminderDay}" 
                               onchange="notificationsModule.updatePreferences({ monthlyReminderDay: parseInt(this.value) })">
                        <label>Hora:</label>
                        <input type="time" value="${this.preferences.monthlyReminderTime}" 
                               onchange="notificationsModule.updatePreferences({ monthlyReminderTime: this.value })">
                    </div>
                </div>
                
                <!-- Alertas de presupuesto -->
                <div class="setting-item">
                    <label class="toggle-label">
                        <input type="checkbox" ${this.preferences.budgetAlerts ? 'checked' : ''} 
                               onchange="notificationsModule.updatePreferences({ budgetAlerts: this.checked })">
                        <span class="toggle-slider"></span>
                        <span class="toggle-text">⚠️ Alertas de presupuesto</span>
                    </label>
                </div>
            </div>
        `;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.NotificationsModule = NotificationsModule;
}

console.log('✅ Módulo de notificaciones mejorado cargado');

