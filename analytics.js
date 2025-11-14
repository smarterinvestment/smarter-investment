/**
 * 📊 ANALYTICS - Sistema de Tracking y Métricas
 * =============================================
 * Sistema para rastrear eventos, comportamiento de usuarios y métricas
 */

class Analytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.sessionStart = Date.now();
        this.isProduction = window.location.hostname !== 'localhost';
        
        // Inicializar tracking de sesión
        this.trackSession();
        
        // Enviar eventos acumulados cada 30 segundos
        setInterval(() => this.flushEvents(), 30000);
        
        // Enviar eventos antes de cerrar
        window.addEventListener('beforeunload', () => this.flushEvents());
        
        console.log('✅ Analytics inicializado - Session ID:', this.sessionId);
    }
    
    /**
     * Generar ID de sesión único
     */
    generateSessionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Obtener contexto del usuario
     */
    getUserContext() {
        const user = window.store?.getState('user');
        return {
            uid: user?.uid || 'anonymous',
            email: user?.email || null,
            subscription: user?.subscription?.plan || 'free',
            isAuthenticated: user?.isAuthenticated || false
        };
    }
    
    /**
     * Obtener contexto del dispositivo
     */
    getDeviceContext() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            platform: navigator.platform,
            mobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
            connection: navigator.connection?.effectiveType || 'unknown'
        };
    }
    
    /**
     * Trackear evento
     */
    track(eventName, properties = {}) {
        const event = {
            id: Date.now() + Math.random(),
            name: eventName,
            properties,
            timestamp: new Date(),
            session: this.sessionId,
            user: this.getUserContext(),
            device: this.getDeviceContext(),
            page: {
                url: window.location.href,
                title: document.title,
                referrer: document.referrer
            }
        };
        
        this.events.push(event);
        
        // Log en desarrollo
        if (!this.isProduction) {
            console.log('📊 Event tracked:', eventName, properties);
        }
        
        // Si hay muchos eventos, enviar
        if (this.events.length >= 10) {
            this.flushEvents();
        }
    }
    
    /**
     * Enviar eventos acumulados al servidor
     */
    async flushEvents() {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            if (window.firebaseDb) {
                // Enviar en batch
                const batch = window.firebaseDb.batch();
                
                eventsToSend.forEach(event => {
                    const docRef = window.firebaseDb.collection('analytics').doc();
                    batch.set(docRef, {
                        ...event,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
                
                await batch.commit();
                
                if (!this.isProduction) {
                    console.log(`📊 ${eventsToSend.length} eventos enviados al servidor`);
                }
            }
        } catch (error) {
            console.error('Error enviando analytics:', error);
            // Reintent agregar eventos de vuelta
            this.events.push(...eventsToSend);
        }
    }
    
    /**
     * Trackear vista de página
     */
    pageView(pageName, properties = {}) {
        this.track('page_view', {
            page: pageName,
            ...properties
        });
    }
    
    /**
     * Trackear click de botón
     */
    buttonClick(buttonName, properties = {}) {
        this.track('button_click', {
            button: buttonName,
            ...properties
        });
    }
    
    /**
     * Trackear interacción con formulario
     */
    formInteraction(formName, action, properties = {}) {
        this.track('form_interaction', {
            form: formName,
            action, // submit, focus, error, etc.
            ...properties
        });
    }
    
    /**
     * Trackear error
     */
    error(errorType, message, properties = {}) {
        this.track('error', {
            type: errorType,
            message,
            ...properties
        });
    }
    
    /**
     * Trackear sesión
     */
    trackSession() {
        this.track('session_start', {
            sessionId: this.sessionId
        });
        
        // Trackear duración de sesión al salir
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - this.sessionStart;
            this.track('session_end', {
                sessionId: this.sessionId,
                duration: Math.floor(duration / 1000) // en segundos
            });
        });
    }
    
    /**
     * Eventos financieros específicos
     */
    finance = {
        expenseAdded: (amount, category) => {
            this.track('expense_added', { amount, category });
        },
        
        expenseDeleted: (amount, category) => {
            this.track('expense_deleted', { amount, category });
        },
        
        incomeAdded: (amount, source) => {
            this.track('income_added', { amount, source });
        },
        
        budgetCreated: (category, amount) => {
            this.track('budget_created', { category, amount });
        },
        
        budgetExceeded: (category, amount, limit) => {
            this.track('budget_exceeded', { category, amount, limit });
        },
        
        reportViewed: (reportType, dateRange) => {
            this.track('report_viewed', { reportType, dateRange });
        },
        
        exportData: (format, dataType) => {
            this.track('export_data', { format, dataType });
        }
    };
    
    /**
     * Eventos de usuario
     */
    user = {
        signup: (method) => {
            this.track('user_signup', { method });
        },
        
        login: (method) => {
            this.track('user_login', { method });
        },
        
        logout: () => {
            this.track('user_logout');
        },
        
        profileUpdated: (fields) => {
            this.track('profile_updated', { fields });
        },
        
        subscriptionStarted: (plan) => {
            this.track('subscription_started', { plan });
        },
        
        subscriptionCanceled: (plan, reason) => {
            this.track('subscription_canceled', { plan, reason });
        },
        
        featureUsed: (feature) => {
            this.track('feature_used', { feature });
        }
    };
    
    /**
     * Eventos de AI Assistant
     */
    ai = {
        querySubmitted: (query, tokensUsed) => {
            this.track('ai_query_submitted', { 
                queryLength: query.length,
                tokensUsed
            });
        },
        
        queryFailed: (error) => {
            this.track('ai_query_failed', { error });
        },
        
        rateLimitHit: () => {
            this.track('ai_rate_limit_hit');
        }
    };
    
    /**
     * Métricas de rendimiento
     */
    performance = {
        pageLoad: () => {
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
                const firstPaint = performance.getEntriesByType('paint')
                    .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
                
                this.track('performance_metrics', {
                    loadTime: Math.round(loadTime),
                    domReady: Math.round(domReady),
                    firstPaint: Math.round(firstPaint)
                });
            }
        },
        
        apiCall: (endpoint, duration, success) => {
            this.track('api_performance', {
                endpoint,
                duration: Math.round(duration),
                success
            });
        }
    };
    
    /**
     * Setup de tracking automático
     */
    setupAutoTracking() {
        // Trackear clicks en botones
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button && button.dataset.trackClick) {
                this.buttonClick(button.dataset.trackClick, {
                    text: button.textContent.trim()
                });
            }
        });
        
        // Trackear envío de formularios
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.dataset.trackForm) {
                this.formInteraction(form.dataset.trackForm, 'submit');
            }
        });
        
        // Trackear rendimiento de página
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.performance.pageLoad();
            }, 0);
        });
    }
    
    /**
     * Obtener estadísticas de la sesión actual
     */
    getSessionStats() {
        const duration = Date.now() - this.sessionStart;
        const eventsCount = this.events.length;
        const eventsByType = {};
        
        this.events.forEach(event => {
            eventsByType[event.name] = (eventsByType[event.name] || 0) + 1;
        });
        
        return {
            sessionId: this.sessionId,
            duration: Math.floor(duration / 1000),
            eventsCount,
            eventsByType
        };
    }
}

/**
 * 🎯 A/B TESTING - Sistema simple de pruebas A/B
 */
class ABTesting {
    constructor() {
        this.experiments = new Map();
        this.userVariants = this.loadUserVariants();
    }
    
    /**
     * Cargar variantes del usuario desde localStorage
     */
    loadUserVariants() {
        try {
            const stored = localStorage.getItem('ab_tests');
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }
    
    /**
     * Guardar variantes del usuario
     */
    saveUserVariants() {
        try {
            localStorage.setItem('ab_tests', JSON.stringify(this.userVariants));
        } catch (error) {
            console.error('Error guardando variantes A/B:', error);
        }
    }
    
    /**
     * Crear experimento
     */
    createExperiment(name, variants, weights = null) {
        if (!weights) {
            // Distribución equitativa
            weights = new Array(variants.length).fill(1 / variants.length);
        }
        
        this.experiments.set(name, { variants, weights });
    }
    
    /**
     * Obtener variante para el usuario
     */
    getVariant(experimentName) {
        // Si ya tiene asignada una variante, retornarla
        if (this.userVariants[experimentName]) {
            return this.userVariants[experimentName];
        }
        
        // Asignar nueva variante
        const experiment = this.experiments.get(experimentName);
        if (!experiment) return null;
        
        const random = Math.random();
        let cumulative = 0;
        let variant = null;
        
        for (let i = 0; i < experiment.variants.length; i++) {
            cumulative += experiment.weights[i];
            if (random <= cumulative) {
                variant = experiment.variants[i];
                break;
            }
        }
        
        // Guardar variante asignada
        this.userVariants[experimentName] = variant;
        this.saveUserVariants();
        
        // Trackear asignación
        if (window.analytics) {
            window.analytics.track('ab_test_assigned', {
                experiment: experimentName,
                variant
            });
        }
        
        return variant;
    }
}

// ✅ Crear instancias globales
const analytics = new Analytics();
const abTesting = new ABTesting();

// Setup tracking automático
analytics.setupAutoTracking();

// Exportar globalmente
window.Analytics = analytics;
window.ABTesting = abTesting;

console.log('✅ Analytics y A/B Testing inicializados');
