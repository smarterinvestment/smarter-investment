/**
 * 📊 STATE MANAGER - Sistema de Gestión de Estado Global
 * ======================================================
 * Sistema centralizado tipo Redux pero más simple y ligero
 * para manejar el estado de la aplicación
 */

class StateManager {
    constructor() {
        this.state = {
            // Usuario
            user: {
                uid: null,
                email: null,
                displayName: null,
                photoURL: null,
                subscription: null,
                isAuthenticated: false
            },
            
            // Datos financieros
            finances: {
                expenses: [],
                incomes: [],
                budgets: [],
                categories: [],
                totalExpenses: 0,
                totalIncomes: 0,
                balance: 0,
                lastSync: null
            },
            
            // UI State
            ui: {
                currentView: 'dashboard',
                isLoading: false,
                isSidebarOpen: false,
                modalsOpen: {},
                notifications: [],
                theme: 'dark'
            },
            
            // Configuración
            settings: {
                currency: 'USD',
                language: 'es',
                notifications: {
                    enabled: true,
                    budgetAlerts: true,
                    recurringReminders: true
                },
                sync: {
                    autoSync: true,
                    syncInterval: 300000 // 5 minutos
                }
            },
            
            // Cache
            cache: {
                lastFetch: {},
                data: {}
            }
        };
        
        this.listeners = new Set();
        this.middleware = [];
        this.persistedKeys = ['settings', 'cache'];
        
        // Cargar estado persistido
        this.loadPersistedState();
        
        // Auto-guardar cada 30 segundos
        setInterval(() => this.persistState(), 30000);
    }
    
    /**
     * Obtener el estado completo o una parte específica
     */
    getState(path = null) {
        if (!path) return { ...this.state };
        
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }
    
    /**
     * Actualizar el estado
     */
    setState(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);
        
        const oldValue = target[lastKey];
        target[lastKey] = value;
        
        // Ejecutar middleware
        this.runMiddleware({ type: 'SET_STATE', path, value, oldValue });
        
        // Notificar a listeners
        this.notify({ type: 'STATE_CHANGED', path, value, oldValue });
        
        // Persistir si es necesario
        if (this.shouldPersist(path)) {
            this.persistState();
        }
    }
    
    /**
     * Actualizar múltiples valores
     */
    updateState(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.setState(path, value);
        });
    }
    
    /**
     * Suscribirse a cambios del estado
     */
    subscribe(callback, filter = null) {
        const listener = { callback, filter };
        this.listeners.add(listener);
        
        // Retornar función para desuscribirse
        return () => this.listeners.delete(listener);
    }
    
    /**
     * Notificar a todos los listeners
     */
    notify(event) {
        this.listeners.forEach(listener => {
            // Si hay filtro, verificar si aplica
            if (listener.filter && !event.path.startsWith(listener.filter)) {
                return;
            }
            
            try {
                listener.callback(event, this.state);
            } catch (error) {
                console.error('Error en listener:', error);
            }
        });
    }
    
    /**
     * Agregar middleware
     */
    use(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * Ejecutar middleware
     */
    runMiddleware(action) {
        this.middleware.forEach(middleware => {
            try {
                middleware(action, this.state);
            } catch (error) {
                console.error('Error en middleware:', error);
            }
        });
    }
    
    /**
     * Resetear el estado
     */
    reset(keepAuth = true) {
        const userState = keepAuth ? this.state.user : null;
        
        this.state = {
            user: userState || {
                uid: null,
                email: null,
                displayName: null,
                photoURL: null,
                subscription: null,
                isAuthenticated: false
            },
            finances: {
                expenses: [],
                incomes: [],
                budgets: [],
                categories: [],
                totalExpenses: 0,
                totalIncomes: 0,
                balance: 0,
                lastSync: null
            },
            ui: {
                currentView: 'dashboard',
                isLoading: false,
                isSidebarOpen: false,
                modalsOpen: {},
                notifications: [],
                theme: 'dark'
            },
            settings: this.state.settings, // Mantener settings
            cache: { lastFetch: {}, data: {} }
        };
        
        this.notify({ type: 'STATE_RESET' });
    }
    
    /**
     * Determinar si un path debe ser persistido
     */
    shouldPersist(path) {
        return this.persistedKeys.some(key => path.startsWith(key));
    }
    
    /**
     * Persistir estado en localStorage
     */
    persistState() {
        try {
            const stateToPersist = {};
            
            this.persistedKeys.forEach(key => {
                if (this.state[key]) {
                    stateToPersist[key] = this.state[key];
                }
            });
            
            localStorage.setItem('smarter_state', JSON.stringify(stateToPersist));
        } catch (error) {
            console.error('Error persistiendo estado:', error);
        }
    }
    
    /**
     * Cargar estado persistido
     */
    loadPersistedState() {
        try {
            const persisted = localStorage.getItem('smarter_state');
            
            if (persisted) {
                const data = JSON.parse(persisted);
                
                this.persistedKeys.forEach(key => {
                    if (data[key]) {
                        this.state[key] = data[key];
                    }
                });
                
                console.log('✅ Estado cargado desde localStorage');
            }
        } catch (error) {
            console.error('Error cargando estado:', error);
        }
    }
    
    /**
     * Actions comunes (helpers)
     */
    actions = {
        // Usuario
        setUser: (userData) => {
            this.setState('user', {
                ...userData,
                isAuthenticated: true
            });
        },
        
        logout: () => {
            this.setState('user', {
                uid: null,
                email: null,
                displayName: null,
                photoURL: null,
                subscription: null,
                isAuthenticated: false
            });
            this.setState('finances', {
                expenses: [],
                incomes: [],
                budgets: [],
                categories: [],
                totalExpenses: 0,
                totalIncomes: 0,
                balance: 0,
                lastSync: null
            });
        },
        
        // Finanzas
        setExpenses: (expenses) => {
            this.setState('finances.expenses', expenses);
            this.actions.calculateTotals();
        },
        
        addExpense: (expense) => {
            const expenses = [...this.getState('finances.expenses'), expense];
            this.setState('finances.expenses', expenses);
            this.actions.calculateTotals();
        },
        
        updateExpense: (expenseId, updates) => {
            const expenses = this.getState('finances.expenses').map(exp =>
                exp.id === expenseId ? { ...exp, ...updates } : exp
            );
            this.setState('finances.expenses', expenses);
            this.actions.calculateTotals();
        },
        
        deleteExpense: (expenseId) => {
            const expenses = this.getState('finances.expenses').filter(exp => 
                exp.id !== expenseId
            );
            this.setState('finances.expenses', expenses);
            this.actions.calculateTotals();
        },
        
        setIncomes: (incomes) => {
            this.setState('finances.incomes', incomes);
            this.actions.calculateTotals();
        },
        
        calculateTotals: () => {
            const expenses = this.getState('finances.expenses') || [];
            const incomes = this.getState('finances.incomes') || [];
            
            const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const totalIncomes = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
            const balance = totalIncomes - totalExpenses;
            
            this.updateState({
                'finances.totalExpenses': totalExpenses,
                'finances.totalIncomes': totalIncomes,
                'finances.balance': balance
            });
        },
        
        // UI
        setLoading: (isLoading, text = 'Cargando...') => {
            this.updateState({
                'ui.isLoading': isLoading,
                'ui.loadingText': text
            });
        },
        
        setView: (view) => {
            this.setState('ui.currentView', view);
        },
        
        toggleSidebar: () => {
            const isOpen = this.getState('ui.isSidebarOpen');
            this.setState('ui.isSidebarOpen', !isOpen);
        },
        
        openModal: (modalName) => {
            const modals = this.getState('ui.modalsOpen') || {};
            this.setState('ui.modalsOpen', { ...modals, [modalName]: true });
        },
        
        closeModal: (modalName) => {
            const modals = this.getState('ui.modalsOpen') || {};
            this.setState('ui.modalsOpen', { ...modals, [modalName]: false });
        },
        
        addNotification: (notification) => {
            const notifications = this.getState('ui.notifications') || [];
            this.setState('ui.notifications', [
                ...notifications,
                { ...notification, id: Date.now(), timestamp: new Date() }
            ]);
        },
        
        removeNotification: (notificationId) => {
            const notifications = this.getState('ui.notifications') || [];
            this.setState('ui.notifications', 
                notifications.filter(n => n.id !== notificationId)
            );
        },
        
        // Cache
        setCache: (key, data, ttl = 300000) => { // 5 minutos por defecto
            const cache = this.getState('cache') || { lastFetch: {}, data: {} };
            this.setState('cache', {
                lastFetch: {
                    ...cache.lastFetch,
                    [key]: Date.now()
                },
                data: {
                    ...cache.data,
                    [key]: data
                }
            });
        },
        
        getCache: (key, maxAge = 300000) => {
            const cache = this.getState('cache') || { lastFetch: {}, data: {} };
            const lastFetch = cache.lastFetch[key];
            
            if (!lastFetch || Date.now() - lastFetch > maxAge) {
                return null; // Cache expirado
            }
            
            return cache.data[key];
        },
        
        clearCache: (key = null) => {
            if (key) {
                const cache = this.getState('cache') || { lastFetch: {}, data: {} };
                delete cache.lastFetch[key];
                delete cache.data[key];
                this.setState('cache', cache);
            } else {
                this.setState('cache', { lastFetch: {}, data: {} });
            }
        }
    };
}

// ✅ Crear instancia global
const store = new StateManager();

// ✅ Middleware de logging (solo en desarrollo)
if (window.location.hostname === 'localhost') {
    store.use((action, state) => {
        console.log('🔄 Estado actualizado:', action);
    });
}

// ✅ Middleware de analytics
store.use((action, state) => {
    // Enviar eventos importantes a analytics
    if (action.type === 'SET_STATE' && action.path.startsWith('finances')) {
        // Track cambios financieros
        if (window.Analytics) {
            window.Analytics.track('finance_data_changed', {
                path: action.path,
                timestamp: new Date()
            });
        }
    }
});

// Exportar store global
window.store = store;

console.log('✅ State Manager inicializado');
