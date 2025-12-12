// ========================================
// 🌍 I18N.JS - Sistema de Internacionalización
// ========================================

const i18n = {
    currentLanguage: localStorage.getItem('language') || 'es',
    currentCurrency: localStorage.getItem('currency') || 'USD',
    
    // Configuración de monedas
    currencies: {
        USD: { symbol: '$', code: 'USD', name: 'Dólar Americano', locale: 'en-US' },
        COP: { symbol: '$', code: 'COP', name: 'Peso Colombiano', locale: 'es-CO' },
        EUR: { symbol: '€', code: 'EUR', name: 'Euro', locale: 'es-ES' },
        MXN: { symbol: '$', code: 'MXN', name: 'Peso Mexicano', locale: 'es-MX' }
    },
    
    // Traducciones
    translations: {
        es: {
            // General
            appName: 'Smarter Investment',
            appSubtitle: 'Tu Gestor Financiero Personal',
            loading: 'Cargando...',
            save: 'Guardar',
            cancel: 'Cancelar',
            delete: 'Eliminar',
            edit: 'Editar',
            add: 'Agregar',
            close: 'Cerrar',
            confirm: 'Confirmar',
            yes: 'Sí',
            no: 'No',
            
            // Navegación
            nav: {
                home: 'Inicio',
                expenses: 'Gastos',
                budget: 'Presupuesto',
                goals: 'Metas',
                assistant: 'Asistente',
                more: 'Más'
            },
            
            // Dashboard
            dashboard: {
                title: 'Dashboard',
                totalIncome: 'Ingresos Totales',
                totalExpenses: 'Gastos Totales',
                balance: 'Balance',
                savingsRate: 'Tasa de Ahorro',
                thisMonth: 'Este Mes',
                lastMonth: 'Mes Anterior',
                monthlyOverview: 'Resumen Mensual',
                expensesByCategory: 'Gastos por Categoría',
                recentTransactions: 'Transacciones Recientes'
            },
            
            // Gastos
            expenses: {
                title: 'Gastos',
                addExpense: 'Agregar Gasto',
                description: 'Descripción',
                amount: 'Monto',
                category: 'Categoría',
                date: 'Fecha',
                recurring: 'Es recurrente',
                frequency: 'Frecuencia',
                noExpenses: 'No hay gastos registrados'
            },
            
            // Categorías
            categories: {
                essential: 'Gastos Esenciales',
                discretionary: 'Gastos Discrecionales',
                debt: 'Deudas',
                savings: 'Ahorros',
                investments: 'Inversiones'
            },
            
            // Frecuencias
            frequencies: {
                weekly: 'Semanal',
                biweekly: 'Quincenal',
                monthly: 'Mensual',
                yearly: 'Anual'
            },
            
            // Presupuesto
            budget: {
                title: 'Presupuesto',
                total: 'Total Presupuestado',
                spent: 'Gastado',
                remaining: 'Restante',
                overBudget: 'Excedido',
                underControl: 'Bajo Control',
                nearLimit: 'Cerca del Límite',
                generateBudget: 'Generar Presupuesto',
                editBudget: 'Editar Presupuesto'
            },
            
            // Metas
            goals: {
                title: 'Metas',
                addGoal: 'Nueva Meta',
                name: 'Nombre',
                target: 'Objetivo',
                current: 'Actual',
                progress: 'Progreso',
                deadline: 'Fecha Límite',
                addMoney: 'Agregar Dinero',
                completed: '¡Meta Completada!',
                noGoals: 'No hay metas creadas'
            },
            
            // Ingresos
            income: {
                title: 'Ingresos',
                addIncome: 'Agregar Ingreso',
                salary: 'Salario',
                freelance: 'Freelance',
                investments: 'Inversiones',
                rent: 'Renta',
                other: 'Otros'
            },
            
            // Recurrentes
            recurring: {
                title: 'Recurrentes',
                expenses: 'Gastos Recurrentes',
                income: 'Ingresos Recurrentes',
                nextPayment: 'Próximo pago',
                daysLeft: 'días restantes',
                today: '¡Hoy es día de pago!',
                tomorrow: 'Mañana es día de pago'
            },
            
            // Asistente
            assistant: {
                title: 'Asistente Financiero',
                placeholder: 'Escribe tu pregunta...',
                send: 'Enviar',
                thinking: 'Pensando...',
                offline: 'Modo Offline',
                online: 'Modo Online (Claude AI)',
                quickActions: 'Acciones Rápidas',
                analysis: 'Análisis del mes',
                budgetStatus: 'Estado de presupuesto',
                goalsProgress: 'Progreso de metas',
                savingsTips: 'Consejos de ahorro',
                patterns: 'Patrones de gasto'
            },
            
            // Configuración
            settings: {
                title: 'Configuración',
                theme: 'Tema',
                language: 'Idioma',
                currency: 'Moneda',
                notifications: 'Notificaciones',
                darkTheme: 'Oscuro',
                pinkTheme: 'Rosa',
                turquoiseTheme: 'Turquesa',
                purpleTheme: 'Morado',
                account: 'Cuenta',
                logout: 'Cerrar Sesión',
                deleteAccount: 'Eliminar Cuenta'
            },
            
            // Auth
            auth: {
                login: 'Iniciar Sesión',
                register: 'Registrarse',
                email: 'Correo Electrónico',
                password: 'Contraseña',
                confirmPassword: 'Confirmar Contraseña',
                forgotPassword: '¿Olvidaste tu contraseña?',
                resetPassword: 'Restablecer Contraseña',
                noAccount: '¿No tienes cuenta?',
                hasAccount: '¿Ya tienes cuenta?'
            },
            
            // Mensajes
            messages: {
                saved: 'Guardado correctamente',
                deleted: 'Eliminado correctamente',
                error: 'Ocurrió un error',
                confirmDelete: '¿Estás seguro de eliminar?',
                welcome: '¡Bienvenido!',
                goodbye: 'Hasta pronto'
            },
            
            // Comparación
            comparison: {
                title: 'Comparación de Períodos',
                current: 'Período Actual',
                previous: 'Período Anterior',
                reduced: 'Redujiste gastos un',
                increased: 'Aumentaste gastos un',
                byCategory: 'Por Categoría'
            }
        },
        
        en: {
            // General
            appName: 'Smarter Investment',
            appSubtitle: 'Your Personal Finance Manager',
            loading: 'Loading...',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            close: 'Close',
            confirm: 'Confirm',
            yes: 'Yes',
            no: 'No',
            
            // Navigation
            nav: {
                home: 'Home',
                expenses: 'Expenses',
                budget: 'Budget',
                goals: 'Goals',
                assistant: 'Assistant',
                more: 'More'
            },
            
            // Dashboard
            dashboard: {
                title: 'Dashboard',
                totalIncome: 'Total Income',
                totalExpenses: 'Total Expenses',
                balance: 'Balance',
                savingsRate: 'Savings Rate',
                thisMonth: 'This Month',
                lastMonth: 'Last Month',
                monthlyOverview: 'Monthly Overview',
                expensesByCategory: 'Expenses by Category',
                recentTransactions: 'Recent Transactions'
            },
            
            // Expenses
            expenses: {
                title: 'Expenses',
                addExpense: 'Add Expense',
                description: 'Description',
                amount: 'Amount',
                category: 'Category',
                date: 'Date',
                recurring: 'Is recurring',
                frequency: 'Frequency',
                noExpenses: 'No expenses recorded'
            },
            
            // Categories
            categories: {
                essential: 'Essential Expenses',
                discretionary: 'Discretionary Spending',
                debt: 'Debt',
                savings: 'Savings',
                investments: 'Investments'
            },
            
            // Frequencies
            frequencies: {
                weekly: 'Weekly',
                biweekly: 'Biweekly',
                monthly: 'Monthly',
                yearly: 'Yearly'
            },
            
            // Budget
            budget: {
                title: 'Budget',
                total: 'Total Budget',
                spent: 'Spent',
                remaining: 'Remaining',
                overBudget: 'Over Budget',
                underControl: 'Under Control',
                nearLimit: 'Near Limit',
                generateBudget: 'Generate Budget',
                editBudget: 'Edit Budget'
            },
            
            // Goals
            goals: {
                title: 'Goals',
                addGoal: 'New Goal',
                name: 'Name',
                target: 'Target',
                current: 'Current',
                progress: 'Progress',
                deadline: 'Deadline',
                addMoney: 'Add Money',
                completed: 'Goal Completed!',
                noGoals: 'No goals created'
            },
            
            // Income
            income: {
                title: 'Income',
                addIncome: 'Add Income',
                salary: 'Salary',
                freelance: 'Freelance',
                investments: 'Investments',
                rent: 'Rent',
                other: 'Other'
            },
            
            // Recurring
            recurring: {
                title: 'Recurring',
                expenses: 'Recurring Expenses',
                income: 'Recurring Income',
                nextPayment: 'Next payment',
                daysLeft: 'days left',
                today: 'Payment day is today!',
                tomorrow: 'Payment day is tomorrow'
            },
            
            // Assistant
            assistant: {
                title: 'Financial Assistant',
                placeholder: 'Type your question...',
                send: 'Send',
                thinking: 'Thinking...',
                offline: 'Offline Mode',
                online: 'Online Mode (Claude AI)',
                quickActions: 'Quick Actions',
                analysis: 'Monthly Analysis',
                budgetStatus: 'Budget Status',
                goalsProgress: 'Goals Progress',
                savingsTips: 'Savings Tips',
                patterns: 'Spending Patterns'
            },
            
            // Settings
            settings: {
                title: 'Settings',
                theme: 'Theme',
                language: 'Language',
                currency: 'Currency',
                notifications: 'Notifications',
                darkTheme: 'Dark',
                pinkTheme: 'Pink',
                turquoiseTheme: 'Turquoise',
                purpleTheme: 'Purple',
                account: 'Account',
                logout: 'Logout',
                deleteAccount: 'Delete Account'
            },
            
            // Auth
            auth: {
                login: 'Login',
                register: 'Register',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                forgotPassword: 'Forgot your password?',
                resetPassword: 'Reset Password',
                noAccount: "Don't have an account?",
                hasAccount: 'Already have an account?'
            },
            
            // Messages
            messages: {
                saved: 'Saved successfully',
                deleted: 'Deleted successfully',
                error: 'An error occurred',
                confirmDelete: 'Are you sure you want to delete?',
                welcome: 'Welcome!',
                goodbye: 'Goodbye!'
            },
            
            // Comparison
            comparison: {
                title: 'Period Comparison',
                current: 'Current Period',
                previous: 'Previous Period',
                reduced: 'You reduced expenses by',
                increased: 'You increased expenses by',
                byCategory: 'By Category'
            }
        },
        
        fr: {
            // Général
            appName: 'Smarter Investment',
            appSubtitle: 'Votre Gestionnaire Financier Personnel',
            loading: 'Chargement...',
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer',
            edit: 'Modifier',
            add: 'Ajouter',
            close: 'Fermer',
            confirm: 'Confirmer',
            yes: 'Oui',
            no: 'Non',
            
            // Navigation
            nav: {
                home: 'Accueil',
                expenses: 'Dépenses',
                budget: 'Budget',
                goals: 'Objectifs',
                assistant: 'Assistant',
                more: 'Plus'
            },
            
            // Tableau de bord
            dashboard: {
                title: 'Tableau de Bord',
                totalIncome: 'Revenus Totaux',
                totalExpenses: 'Dépenses Totales',
                balance: 'Solde',
                savingsRate: "Taux d'Épargne",
                thisMonth: 'Ce Mois',
                lastMonth: 'Mois Dernier',
                monthlyOverview: 'Aperçu Mensuel',
                expensesByCategory: 'Dépenses par Catégorie',
                recentTransactions: 'Transactions Récentes'
            },
            
            // Dépenses
            expenses: {
                title: 'Dépenses',
                addExpense: 'Ajouter une Dépense',
                description: 'Description',
                amount: 'Montant',
                category: 'Catégorie',
                date: 'Date',
                recurring: 'Est récurrent',
                frequency: 'Fréquence',
                noExpenses: 'Aucune dépense enregistrée'
            },
            
            // Catégories
            categories: {
                essential: 'Dépenses Essentielles',
                discretionary: 'Dépenses Discrétionnaires',
                debt: 'Dettes',
                savings: 'Épargne',
                investments: 'Investissements'
            },
            
            // Fréquences
            frequencies: {
                weekly: 'Hebdomadaire',
                biweekly: 'Bimensuel',
                monthly: 'Mensuel',
                yearly: 'Annuel'
            },
            
            // Budget
            budget: {
                title: 'Budget',
                total: 'Budget Total',
                spent: 'Dépensé',
                remaining: 'Restant',
                overBudget: 'Dépassé',
                underControl: 'Sous Contrôle',
                nearLimit: 'Proche de la Limite',
                generateBudget: 'Générer un Budget',
                editBudget: 'Modifier le Budget'
            },
            
            // Objectifs
            goals: {
                title: 'Objectifs',
                addGoal: 'Nouvel Objectif',
                name: 'Nom',
                target: 'Cible',
                current: 'Actuel',
                progress: 'Progrès',
                deadline: 'Date Limite',
                addMoney: 'Ajouter de l\'Argent',
                completed: 'Objectif Atteint!',
                noGoals: 'Aucun objectif créé'
            },
            
            // Revenus
            income: {
                title: 'Revenus',
                addIncome: 'Ajouter un Revenu',
                salary: 'Salaire',
                freelance: 'Freelance',
                investments: 'Investissements',
                rent: 'Loyer',
                other: 'Autre'
            },
            
            // Récurrents
            recurring: {
                title: 'Récurrents',
                expenses: 'Dépenses Récurrentes',
                income: 'Revenus Récurrents',
                nextPayment: 'Prochain paiement',
                daysLeft: 'jours restants',
                today: "C'est le jour du paiement!",
                tomorrow: 'Le paiement est demain'
            },
            
            // Assistant
            assistant: {
                title: 'Assistant Financier',
                placeholder: 'Écrivez votre question...',
                send: 'Envoyer',
                thinking: 'Réflexion...',
                offline: 'Mode Hors Ligne',
                online: 'Mode En Ligne (Claude AI)',
                quickActions: 'Actions Rapides',
                analysis: 'Analyse Mensuelle',
                budgetStatus: 'État du Budget',
                goalsProgress: 'Progrès des Objectifs',
                savingsTips: "Conseils d'Épargne",
                patterns: 'Modèles de Dépenses'
            },
            
            // Paramètres
            settings: {
                title: 'Paramètres',
                theme: 'Thème',
                language: 'Langue',
                currency: 'Devise',
                notifications: 'Notifications',
                darkTheme: 'Sombre',
                pinkTheme: 'Rose',
                turquoiseTheme: 'Turquoise',
                purpleTheme: 'Violet',
                account: 'Compte',
                logout: 'Déconnexion',
                deleteAccount: 'Supprimer le Compte'
            },
            
            // Auth
            auth: {
                login: 'Connexion',
                register: "S'inscrire",
                email: 'Email',
                password: 'Mot de Passe',
                confirmPassword: 'Confirmer le Mot de Passe',
                forgotPassword: 'Mot de passe oublié?',
                resetPassword: 'Réinitialiser le Mot de Passe',
                noAccount: "Pas de compte?",
                hasAccount: 'Déjà un compte?'
            },
            
            // Messages
            messages: {
                saved: 'Enregistré avec succès',
                deleted: 'Supprimé avec succès',
                error: 'Une erreur est survenue',
                confirmDelete: 'Êtes-vous sûr de vouloir supprimer?',
                welcome: 'Bienvenue!',
                goodbye: 'Au revoir!'
            },
            
            // Comparaison
            comparison: {
                title: 'Comparaison de Périodes',
                current: 'Période Actuelle',
                previous: 'Période Précédente',
                reduced: 'Vous avez réduit les dépenses de',
                increased: 'Vous avez augmenté les dépenses de',
                byCategory: 'Par Catégorie'
            }
        }
    },
    
    // Obtener traducción
    t(key) {
        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                // Fallback a español
                result = this.translations['es'];
                for (const k2 of keys) {
                    if (result && result[k2] !== undefined) {
                        result = result[k2];
                    } else {
                        return key;
                    }
                }
                break;
            }
        }
        
        return result;
    },
    
    // Formatear moneda
    formatCurrency(amount) {
        const currency = this.currencies[this.currentCurrency];
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // Cambiar idioma
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            document.documentElement.setAttribute('lang', lang);
            
            // Disparar evento para actualizar UI
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
            
            return true;
        }
        return false;
    },
    
    // Cambiar moneda
    setCurrency(currency) {
        if (this.currencies[currency]) {
            this.currentCurrency = currency;
            localStorage.setItem('currency', currency);
            
            // Disparar evento para actualizar UI
            window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
            
            return true;
        }
        return false;
    },
    
    // Obtener idiomas disponibles
    getAvailableLanguages() {
        return [
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' }
        ];
    },
    
    // Obtener monedas disponibles
    getAvailableCurrencies() {
        return Object.entries(this.currencies).map(([code, data]) => ({
            code,
            ...data
        }));
    },
    
    // Inicializar
    init() {
        const savedLang = localStorage.getItem('language');
        const savedCurrency = localStorage.getItem('currency');
        
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
        
        if (savedCurrency && this.currencies[savedCurrency]) {
            this.currentCurrency = savedCurrency;
        }
        
        document.documentElement.setAttribute('lang', this.currentLanguage);
        console.log(`✅ i18n inicializado: ${this.currentLanguage} / ${this.currentCurrency}`);
    }
};

// Inicializar
i18n.init();

// Helpers globales
window.t = (key) => i18n.t(key);
window.formatMoney = (amount) => i18n.formatCurrency(amount);

console.log('✅ Sistema de internacionalización cargado');
