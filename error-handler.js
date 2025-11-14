/**
 * 🚨 ERROR HANDLER - Sistema de Manejo de Errores y Logging
 * ==========================================================
 * Sistema centralizado para capturar, registrar y reportar errores
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100; // Máximo de errores en memoria
        this.listeners = new Set();
        this.isProduction = window.location.hostname !== 'localhost';
        
        // Instalar manejadores globales
        this.installGlobalHandlers();
        
        console.log('✅ Error Handler inicializado');
    }
    
    /**
     * Instalar manejadores globales de errores
     */
    installGlobalHandlers() {
        // Errores no capturados
        window.addEventListener('error', (event) => {
            this.captureError({
                type: 'uncaught_error',
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                stack: event.error?.stack,
                timestamp: new Date()
            });
        });
        
        // Promesas rechazadas no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            this.captureError({
                type: 'unhandled_rejection',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack,
                timestamp: new Date()
            });
        });
        
        // Errores de recursos
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.captureError({
                    type: 'resource_error',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    resource: event.target.tagName,
                    timestamp: new Date()
                }, 'warning');
            }
        }, true);
    }
    
    /**
     * Capturar error
     */
    captureError(error, level = 'error') {
        const errorObj = {
            id: Date.now() + Math.random(),
            level,
            ...error,
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            user: this.getUserContext()
        };
        
        // Agregar a la lista
        this.errors.push(errorObj);
        
        // Mantener solo los últimos N errores
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        // Log en consola (solo en desarrollo)
        if (!this.isProduction) {
            console.group(`🚨 ${level.toUpperCase()}: ${error.type || 'Error'}`);
            console.error('Message:', error.message);
            if (error.stack) console.error('Stack:', error.stack);
            console.error('Details:', errorObj);
            console.groupEnd();
        }
        
        // Notificar listeners
        this.notifyListeners(errorObj);
        
        // Enviar a servidor (en producción)
        if (this.isProduction) {
            this.sendToServer(errorObj);
        }
        
        // Mostrar al usuario si es crítico
        if (level === 'error') {
            this.showUserNotification(error);
        }
    }
    
    /**
     * Obtener contexto del usuario
     */
    getUserContext() {
        const user = window.store?.getState('user');
        return {
            uid: user?.uid || 'anonymous',
            email: user?.email || null,
            subscription: user?.subscription?.plan || 'free'
        };
    }
    
    /**
     * Enviar error al servidor
     */
    async sendToServer(error) {
        try {
            // Enviar a Firebase o servicio de logging
            if (window.firebaseDb) {
                await window.firebaseDb.collection('errors').add({
                    ...error,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error('Error enviando log al servidor:', e);
        }
    }
    
    /**
     * Mostrar notificación al usuario
     */
    showUserNotification(error) {
        // Solo mostrar notificaciones para ciertos tipos de errores
        const showTypes = ['api_error', 'network_error', 'auth_error'];
        
        if (showTypes.includes(error.type) && window.Toastify) {
            Toastify({
                text: this.getUserFriendlyMessage(error),
                duration: 5000,
                gravity: "top",
                position: "right",
                className: "error-toast",
                style: {
                    background: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)"
                }
            }).showToast();
        }
    }
    
    /**
     * Convertir error técnico a mensaje amigable
     */
    getUserFriendlyMessage(error) {
        const messages = {
            network_error: 'Error de conexión. Verifica tu internet.',
            api_error: 'Error al procesar tu solicitud. Intenta de nuevo.',
            auth_error: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
            validation_error: 'Por favor, verifica los datos ingresados.',
            not_found: 'Recurso no encontrado.',
            permission_denied: 'No tienes permisos para realizar esta acción.',
            rate_limit: 'Has excedido el límite de solicitudes. Espera un momento.'
        };
        
        return messages[error.type] || 'Ha ocurrido un error. Intenta de nuevo.';
    }
    
    /**
     * Suscribirse a errores
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    /**
     * Notificar listeners
     */
    notifyListeners(error) {
        this.listeners.forEach(callback => {
            try {
                callback(error);
            } catch (e) {
                console.error('Error en listener de errores:', e);
            }
        });
    }
    
    /**
     * Obtener errores almacenados
     */
    getErrors(filter = {}) {
        let errors = this.errors;
        
        if (filter.level) {
            errors = errors.filter(e => e.level === filter.level);
        }
        
        if (filter.type) {
            errors = errors.filter(e => e.type === filter.type);
        }
        
        if (filter.since) {
            errors = errors.filter(e => e.timestamp >= filter.since);
        }
        
        return errors;
    }
    
    /**
     * Limpiar errores
     */
    clearErrors() {
        this.errors = [];
    }
    
    /**
     * Helpers para errores comunes
     */
    network(message, details = {}) {
        this.captureError({
            type: 'network_error',
            message,
            ...details
        });
    }
    
    api(message, details = {}) {
        this.captureError({
            type: 'api_error',
            message,
            ...details
        });
    }
    
    auth(message, details = {}) {
        this.captureError({
            type: 'auth_error',
            message,
            ...details
        });
    }
    
    validation(message, errors = {}) {
        this.captureError({
            type: 'validation_error',
            message,
            validationErrors: errors
        }, 'warning');
    }
    
    notFound(resource, details = {}) {
        this.captureError({
            type: 'not_found',
            message: `${resource} no encontrado`,
            ...details
        }, 'warning');
    }
    
    permissionDenied(action, details = {}) {
        this.captureError({
            type: 'permission_denied',
            message: `Permiso denegado para: ${action}`,
            ...details
        });
    }
    
    rateLimit(message = 'Rate limit excedido', details = {}) {
        this.captureError({
            type: 'rate_limit',
            message,
            ...details
        }, 'warning');
    }
}

/**
 * 📊 LOGGER - Sistema de Logging
 */
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 500;
        this.isProduction = window.location.hostname !== 'localhost';
    }
    
    /**
     * Log genérico
     */
    log(level, message, data = {}) {
        const logEntry = {
            id: Date.now() + Math.random(),
            level,
            message,
            data,
            timestamp: new Date(),
            url: window.location.href,
            user: window.store?.getState('user')?.uid || 'anonymous'
        };
        
        this.logs.push(logEntry);
        
        // Mantener solo los últimos N logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Mostrar en consola (solo en desarrollo)
        if (!this.isProduction) {
            const emoji = {
                debug: '🐛',
                info: 'ℹ️',
                warn: '⚠️',
                error: '❌',
                success: '✅'
            }[level] || '📝';
            
            console.log(`${emoji} [${level.toUpperCase()}] ${message}`, data);
        }
        
        // Enviar logs importantes al servidor
        if (this.isProduction && ['error', 'warn'].includes(level)) {
            this.sendToServer(logEntry);
        }
    }
    
    /**
     * Enviar log al servidor
     */
    async sendToServer(log) {
        try {
            if (window.firebaseDb) {
                await window.firebaseDb.collection('logs').add({
                    ...log,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error('Error enviando log al servidor:', e);
        }
    }
    
    /**
     * Métodos de conveniencia
     */
    debug(message, data) {
        this.log('debug', message, data);
    }
    
    info(message, data) {
        this.log('info', message, data);
    }
    
    warn(message, data) {
        this.log('warn', message, data);
    }
    
    error(message, data) {
        this.log('error', message, data);
    }
    
    success(message, data) {
        this.log('success', message, data);
    }
    
    /**
     * Obtener logs
     */
    getLogs(filter = {}) {
        let logs = this.logs;
        
        if (filter.level) {
            logs = logs.filter(l => l.level === filter.level);
        }
        
        if (filter.since) {
            logs = logs.filter(l => l.timestamp >= filter.since);
        }
        
        return logs;
    }
    
    /**
     * Limpiar logs
     */
    clearLogs() {
        this.logs = [];
    }
}

// ✅ Crear instancias globales
const errorHandler = new ErrorHandler();
const logger = new Logger();

// ✅ Wrapper para try-catch
async function safeExecute(fn, errorType = 'unknown', defaultValue = null) {
    try {
        return await fn();
    } catch (error) {
        errorHandler.captureError({
            type: errorType,
            message: error.message,
            stack: error.stack
        });
        return defaultValue;
    }
}

// Exportar globalmente
window.errorHandler = errorHandler;
window.logger = logger;
window.safeExecute = safeExecute;

console.log('✅ Error Handler y Logger inicializados');
