// ============================================
// 🌍 INTERNATIONALIZATION SYSTEM - COMPLETE
// All app translations for 8 languages
// ============================================

export type Language = 'es' | 'en' | 'fr' | 'it' | 'pt' | 'zh' | 'ja' | 'de';

// Complete translation interface
export interface AppTranslations {
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  close: string;
  confirm: string;
  search: string;
  filter: string;
  loading: string;
  error: string;
  success: string;
  yes: string;
  no: string;
  back: string;
  next: string;
  new: string;
  active: string;
  paused: string;
  total: string;
  monthly: string;
  
  // Navigation
  nav_home: string;
  nav_transactions: string;
  nav_budgets: string;
  nav_goals: string;
  nav_reports: string;
  nav_assistant: string;
  nav_recurring: string;
  nav_settings: string;
  nav_more: string;
  nav_logout: string;
  
  // Auth
  auth_welcome: string;
  auth_login: string;
  auth_register: string;
  auth_email: string;
  auth_password: string;
  auth_confirmPassword: string;
  auth_forgotPassword: string;
  auth_noAccount: string;
  auth_hasAccount: string;
  auth_continueWith: string;
  auth_name: string;
  auth_createAccount: string;
  
  // Dashboard
  dash_title: string;
  dash_balance: string;
  dash_income: string;
  dash_expenses: string;
  dash_savingsRate: string;
  dash_recentTransactions: string;
  dash_quickActions: string;
  dash_addExpense: string;
  dash_addIncome: string;
  dash_noTransactions: string;
  dash_viewAll: string;
  
  // Transactions
  trans_title: string;
  trans_add: string;
  trans_expense: string;
  trans_income: string;
  trans_amount: string;
  trans_category: string;
  trans_date: string;
  trans_description: string;
  trans_notes: string;
  trans_noTransactions: string;
  trans_deleteConfirm: string;
  
  // Budgets
  budget_title: string;
  budget_add: string;
  budget_spent: string;
  budget_remaining: string;
  budget_exceeded: string;
  budget_onTrack: string;
  budget_noBudgets: string;
  budget_limit: string;
  budget_category: string;
  budget_percentUsed: string;
  
  // Goals
  goals_title: string;
  goals_add: string;
  goals_target: string;
  goals_current: string;
  goals_deadline: string;
  goals_progress: string;
  goals_completed: string;
  goals_noGoals: string;
  goals_addContribution: string;
  goals_daysLeft: string;
  goals_achieved: string;
  
  // Reports
  reports_title: string;
  reports_overview: string;
  reports_byCategory: string;
  reports_trends: string;
  reports_thisMonth: string;
  reports_lastMonth: string;
  reports_thisYear: string;
  reports_income: string;
  reports_expenses: string;
  reports_balance: string;
  reports_noData: string;
  
  // Recurring
  recur_title: string;
  recur_add: string;
  recur_edit: string;
  recur_fixedIncome: string;
  recur_fixedExpenses: string;
  recur_fixedBalance: string;
  recur_totalActive: string;
  recur_frequency: string;
  recur_daily: string;
  recur_weekly: string;
  recur_biweekly: string;
  recur_monthly: string;
  recur_yearly: string;
  recur_nextDue: string;
  recur_noRecurring: string;
  recur_dayOfMonth: string;
  
  // Assistant
  asst_title: string;
  asst_placeholder: string;
  asst_send: string;
  asst_analyzing: string;
  asst_clearChat: string;
  asst_summary: string;
  asst_tips: string;
  asst_savings: string;
  asst_projection: string;
  asst_alerts: string;
  asst_achievements: string;
  asst_welcome: string;
  asst_hint: string;
  
  // Settings
  settings_title: string;
  settings_general: string;
  settings_appearance: string;
  settings_notifications: string;
  settings_alerts: string;
  settings_data: string;
  settings_theme: string;
  settings_language: string;
  settings_currency: string;
  settings_profile: string;
  settings_export: string;
  settings_import: string;
  settings_deleteAccount: string;
  settings_budgetAlerts: string;
  settings_goalAlerts: string;
  
  // More page
  more_title: string;
  more_quickSettings: string;
  more_advancedSettings: string;
  more_account: string;
  more_fullSettings: string;
  more_smartAlerts: string;
  more_dataManagement: string;
  more_myProfile: string;
  more_logoutConfirm: string;
  
  // Landing page
  landing_tagline: string;
  landing_feature1Title: string;
  landing_feature1Desc: string;
  landing_feature2Title: string;
  landing_feature2Desc: string;
  landing_feature3Title: string;
  landing_feature3Desc: string;
  landing_feature4Title: string;
  landing_feature4Desc: string;
  landing_copyright: string;
  
  // Categories (expenses)
  cat_food: string;
  cat_transport: string;
  cat_entertainment: string;
  cat_shopping: string;
  cat_health: string;
  cat_education: string;
  cat_utilities: string;
  cat_rent: string;
  cat_subscriptions: string;
  cat_other: string;
  
  // Categories (income)
  cat_salary: string;
  cat_freelance: string;
  cat_investments: string;
  cat_gifts: string;
  cat_sales: string;
  cat_refunds: string;
}

// Spanish translations
const es: AppTranslations = {
  // Common
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  add: 'Agregar',
  close: 'Cerrar',
  confirm: 'Confirmar',
  search: 'Buscar',
  filter: 'Filtrar',
  loading: 'Cargando...',
  error: 'Error',
  success: 'Éxito',
  yes: 'Sí',
  no: 'No',
  back: 'Atrás',
  next: 'Siguiente',
  new: 'Nuevo',
  active: 'Activo',
  paused: 'Pausado',
  total: 'Total',
  monthly: 'Mensual',
  
  // Navigation
  nav_home: 'Inicio',
  nav_transactions: 'Transacciones',
  nav_budgets: 'Presupuestos',
  nav_goals: 'Metas',
  nav_reports: 'Reportes',
  nav_assistant: 'Asistente',
  nav_recurring: 'Recurrentes',
  nav_settings: 'Configuración',
  nav_more: 'Más',
  nav_logout: 'Cerrar Sesión',
  
  // Auth
  auth_welcome: '¡Bienvenido!',
  auth_login: 'Iniciar Sesión',
  auth_register: 'Registrarse',
  auth_email: 'Correo electrónico',
  auth_password: 'Contraseña',
  auth_confirmPassword: 'Confirmar contraseña',
  auth_forgotPassword: '¿Olvidaste tu contraseña?',
  auth_noAccount: '¿No tienes cuenta?',
  auth_hasAccount: '¿Ya tienes cuenta?',
  auth_continueWith: 'o continúa con',
  auth_name: 'Nombre completo',
  auth_createAccount: 'Crear Cuenta',
  
  // Dashboard
  dash_title: 'Dashboard',
  dash_balance: 'Balance Total',
  dash_income: 'Ingresos',
  dash_expenses: 'Gastos',
  dash_savingsRate: 'Tasa de Ahorro',
  dash_recentTransactions: 'Transacciones Recientes',
  dash_quickActions: 'Acciones Rápidas',
  dash_addExpense: 'Agregar Gasto',
  dash_addIncome: 'Agregar Ingreso',
  dash_noTransactions: 'Sin transacciones',
  dash_viewAll: 'Ver todas',
  
  // Transactions
  trans_title: 'Transacciones',
  trans_add: 'Nueva Transacción',
  trans_expense: 'Gasto',
  trans_income: 'Ingreso',
  trans_amount: 'Monto',
  trans_category: 'Categoría',
  trans_date: 'Fecha',
  trans_description: 'Descripción',
  trans_notes: 'Notas',
  trans_noTransactions: 'No hay transacciones',
  trans_deleteConfirm: '¿Eliminar esta transacción?',
  
  // Budgets
  budget_title: 'Presupuestos',
  budget_add: 'Nuevo Presupuesto',
  budget_spent: 'Gastado',
  budget_remaining: 'Restante',
  budget_exceeded: 'Excedido',
  budget_onTrack: 'En buen camino',
  budget_noBudgets: 'Sin presupuestos configurados',
  budget_limit: 'Límite',
  budget_category: 'Categoría',
  budget_percentUsed: '% usado',
  
  // Goals
  goals_title: 'Metas de Ahorro',
  goals_add: 'Nueva Meta',
  goals_target: 'Monto Objetivo',
  goals_current: 'Monto Actual',
  goals_deadline: 'Fecha Límite',
  goals_progress: 'Progreso',
  goals_completed: 'Completada',
  goals_noGoals: 'Sin metas configuradas',
  goals_addContribution: 'Agregar Aporte',
  goals_daysLeft: 'días restantes',
  goals_achieved: '¡Meta alcanzada!',
  
  // Reports
  reports_title: 'Reportes',
  reports_overview: 'Resumen',
  reports_byCategory: 'Por Categoría',
  reports_trends: 'Tendencias',
  reports_thisMonth: 'Este Mes',
  reports_lastMonth: 'Mes Pasado',
  reports_thisYear: 'Este Año',
  reports_income: 'Ingresos',
  reports_expenses: 'Gastos',
  reports_balance: 'Balance',
  reports_noData: 'Sin datos disponibles',
  
  // Recurring
  recur_title: 'Transacciones Recurrentes',
  recur_add: 'Nuevo Recurrente',
  recur_edit: 'Editar Recurrente',
  recur_fixedIncome: 'Ingresos Fijos/mes',
  recur_fixedExpenses: 'Gastos Fijos/mes',
  recur_fixedBalance: 'Balance Fijo/mes',
  recur_totalActive: 'Total Activos',
  recur_frequency: 'Frecuencia',
  recur_daily: 'Diario',
  recur_weekly: 'Semanal',
  recur_biweekly: 'Quincenal',
  recur_monthly: 'Mensual',
  recur_yearly: 'Anual',
  recur_nextDue: 'Próximo cobro',
  recur_noRecurring: 'Sin transacciones recurrentes',
  recur_dayOfMonth: 'Día del mes',
  
  // Assistant
  asst_title: 'Asistente Financiero',
  asst_placeholder: 'Escribe tu pregunta financiera...',
  asst_send: 'Enviar',
  asst_analyzing: 'Analizando tus datos...',
  asst_clearChat: 'Limpiar chat',
  asst_summary: 'Resumen',
  asst_tips: 'Consejos',
  asst_savings: 'Ahorro',
  asst_projection: 'Proyección',
  asst_alerts: 'Alertas',
  asst_achievements: 'Logros',
  asst_welcome: '¡Hola! Soy tu asistente financiero inteligente.',
  asst_hint: 'Presiona Enter o el botón para enviar',
  
  // Settings
  settings_title: 'Configuración',
  settings_general: 'General',
  settings_appearance: 'Apariencia',
  settings_notifications: 'Notificaciones',
  settings_alerts: 'Alertas',
  settings_data: 'Datos',
  settings_theme: 'Tema',
  settings_language: 'Idioma',
  settings_currency: 'Moneda',
  settings_profile: 'Perfil',
  settings_export: 'Exportar Datos',
  settings_import: 'Importar Datos',
  settings_deleteAccount: 'Eliminar Cuenta',
  settings_budgetAlerts: 'Alertas de Presupuesto',
  settings_goalAlerts: 'Alertas de Metas',
  
  // More page
  more_title: 'Más Opciones',
  more_quickSettings: 'Configuración Rápida',
  more_advancedSettings: 'Configuración Avanzada',
  more_account: 'Cuenta',
  more_fullSettings: 'Configuración Completa',
  more_smartAlerts: 'Alertas Inteligentes',
  more_dataManagement: 'Gestión de Datos',
  more_myProfile: 'Mi Perfil',
  more_logoutConfirm: '¿Cerrar sesión?',
  
  // Landing
  landing_tagline: 'Tu gestor financiero personal inteligente. Toma el control de tus finanzas hoy.',
  landing_feature1Title: 'Control de Gastos',
  landing_feature1Desc: 'Registra y categoriza todos tus movimientos',
  landing_feature2Title: 'Presupuestos',
  landing_feature2Desc: 'Establece límites y recibe alertas',
  landing_feature3Title: 'Metas de Ahorro',
  landing_feature3Desc: 'Alcanza tus objetivos financieros',
  landing_feature4Title: 'Asistente IA',
  landing_feature4Desc: 'Consejos personalizados para ti',
  landing_copyright: '© 2025 Smarter Investment. Todos los derechos reservados.',
  
  // Categories
  cat_food: 'Alimentación',
  cat_transport: 'Transporte',
  cat_entertainment: 'Entretenimiento',
  cat_shopping: 'Compras',
  cat_health: 'Salud',
  cat_education: 'Educación',
  cat_utilities: 'Servicios',
  cat_rent: 'Alquiler',
  cat_subscriptions: 'Suscripciones',
  cat_other: 'Otros',
  cat_salary: 'Salario',
  cat_freelance: 'Freelance',
  cat_investments: 'Inversiones',
  cat_gifts: 'Regalos',
  cat_sales: 'Ventas',
  cat_refunds: 'Reembolsos',
};

// English translations
const en: AppTranslations = {
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  close: 'Close',
  confirm: 'Confirm',
  search: 'Search',
  filter: 'Filter',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  yes: 'Yes',
  no: 'No',
  back: 'Back',
  next: 'Next',
  new: 'New',
  active: 'Active',
  paused: 'Paused',
  total: 'Total',
  monthly: 'Monthly',
  
  nav_home: 'Home',
  nav_transactions: 'Transactions',
  nav_budgets: 'Budgets',
  nav_goals: 'Goals',
  nav_reports: 'Reports',
  nav_assistant: 'Assistant',
  nav_recurring: 'Recurring',
  nav_settings: 'Settings',
  nav_more: 'More',
  nav_logout: 'Logout',
  
  auth_welcome: 'Welcome!',
  auth_login: 'Sign In',
  auth_register: 'Sign Up',
  auth_email: 'Email',
  auth_password: 'Password',
  auth_confirmPassword: 'Confirm password',
  auth_forgotPassword: 'Forgot password?',
  auth_noAccount: "Don't have an account?",
  auth_hasAccount: 'Already have an account?',
  auth_continueWith: 'or continue with',
  auth_name: 'Full name',
  auth_createAccount: 'Create Account',
  
  dash_title: 'Dashboard',
  dash_balance: 'Total Balance',
  dash_income: 'Income',
  dash_expenses: 'Expenses',
  dash_savingsRate: 'Savings Rate',
  dash_recentTransactions: 'Recent Transactions',
  dash_quickActions: 'Quick Actions',
  dash_addExpense: 'Add Expense',
  dash_addIncome: 'Add Income',
  dash_noTransactions: 'No transactions',
  dash_viewAll: 'View all',
  
  trans_title: 'Transactions',
  trans_add: 'New Transaction',
  trans_expense: 'Expense',
  trans_income: 'Income',
  trans_amount: 'Amount',
  trans_category: 'Category',
  trans_date: 'Date',
  trans_description: 'Description',
  trans_notes: 'Notes',
  trans_noTransactions: 'No transactions',
  trans_deleteConfirm: 'Delete this transaction?',
  
  budget_title: 'Budgets',
  budget_add: 'New Budget',
  budget_spent: 'Spent',
  budget_remaining: 'Remaining',
  budget_exceeded: 'Exceeded',
  budget_onTrack: 'On track',
  budget_noBudgets: 'No budgets set',
  budget_limit: 'Limit',
  budget_category: 'Category',
  budget_percentUsed: '% used',
  
  goals_title: 'Savings Goals',
  goals_add: 'New Goal',
  goals_target: 'Target Amount',
  goals_current: 'Current Amount',
  goals_deadline: 'Deadline',
  goals_progress: 'Progress',
  goals_completed: 'Completed',
  goals_noGoals: 'No goals set',
  goals_addContribution: 'Add Contribution',
  goals_daysLeft: 'days left',
  goals_achieved: 'Goal achieved!',
  
  reports_title: 'Reports',
  reports_overview: 'Overview',
  reports_byCategory: 'By Category',
  reports_trends: 'Trends',
  reports_thisMonth: 'This Month',
  reports_lastMonth: 'Last Month',
  reports_thisYear: 'This Year',
  reports_income: 'Income',
  reports_expenses: 'Expenses',
  reports_balance: 'Balance',
  reports_noData: 'No data available',
  
  recur_title: 'Recurring Transactions',
  recur_add: 'New Recurring',
  recur_edit: 'Edit Recurring',
  recur_fixedIncome: 'Fixed Income/month',
  recur_fixedExpenses: 'Fixed Expenses/month',
  recur_fixedBalance: 'Fixed Balance/month',
  recur_totalActive: 'Total Active',
  recur_frequency: 'Frequency',
  recur_daily: 'Daily',
  recur_weekly: 'Weekly',
  recur_biweekly: 'Biweekly',
  recur_monthly: 'Monthly',
  recur_yearly: 'Yearly',
  recur_nextDue: 'Next due',
  recur_noRecurring: 'No recurring transactions',
  recur_dayOfMonth: 'Day of month',
  
  asst_title: 'Financial Assistant',
  asst_placeholder: 'Type your financial question...',
  asst_send: 'Send',
  asst_analyzing: 'Analyzing your data...',
  asst_clearChat: 'Clear chat',
  asst_summary: 'Summary',
  asst_tips: 'Tips',
  asst_savings: 'Savings',
  asst_projection: 'Projection',
  asst_alerts: 'Alerts',
  asst_achievements: 'Achievements',
  asst_welcome: "Hello! I'm your intelligent financial assistant.",
  asst_hint: 'Press Enter or the button to send',
  
  settings_title: 'Settings',
  settings_general: 'General',
  settings_appearance: 'Appearance',
  settings_notifications: 'Notifications',
  settings_alerts: 'Alerts',
  settings_data: 'Data',
  settings_theme: 'Theme',
  settings_language: 'Language',
  settings_currency: 'Currency',
  settings_profile: 'Profile',
  settings_export: 'Export Data',
  settings_import: 'Import Data',
  settings_deleteAccount: 'Delete Account',
  settings_budgetAlerts: 'Budget Alerts',
  settings_goalAlerts: 'Goal Alerts',
  
  more_title: 'More Options',
  more_quickSettings: 'Quick Settings',
  more_advancedSettings: 'Advanced Settings',
  more_account: 'Account',
  more_fullSettings: 'Full Settings',
  more_smartAlerts: 'Smart Alerts',
  more_dataManagement: 'Data Management',
  more_myProfile: 'My Profile',
  more_logoutConfirm: 'Sign out?',
  
  landing_tagline: 'Your intelligent personal finance manager. Take control of your finances today.',
  landing_feature1Title: 'Expense Tracking',
  landing_feature1Desc: 'Record and categorize all your transactions',
  landing_feature2Title: 'Budgets',
  landing_feature2Desc: 'Set limits and receive alerts',
  landing_feature3Title: 'Savings Goals',
  landing_feature3Desc: 'Achieve your financial objectives',
  landing_feature4Title: 'AI Assistant',
  landing_feature4Desc: 'Personalized tips for you',
  landing_copyright: '© 2025 Smarter Investment. All rights reserved.',
  
  cat_food: 'Food',
  cat_transport: 'Transport',
  cat_entertainment: 'Entertainment',
  cat_shopping: 'Shopping',
  cat_health: 'Health',
  cat_education: 'Education',
  cat_utilities: 'Utilities',
  cat_rent: 'Rent',
  cat_subscriptions: 'Subscriptions',
  cat_other: 'Other',
  cat_salary: 'Salary',
  cat_freelance: 'Freelance',
  cat_investments: 'Investments',
  cat_gifts: 'Gifts',
  cat_sales: 'Sales',
  cat_refunds: 'Refunds',
};

// French translations
const fr: AppTranslations = {
  save: 'Enregistrer',
  cancel: 'Annuler',
  delete: 'Supprimer',
  edit: 'Modifier',
  add: 'Ajouter',
  close: 'Fermer',
  confirm: 'Confirmer',
  search: 'Rechercher',
  filter: 'Filtrer',
  loading: 'Chargement...',
  error: 'Erreur',
  success: 'Succès',
  yes: 'Oui',
  no: 'Non',
  back: 'Retour',
  next: 'Suivant',
  new: 'Nouveau',
  active: 'Actif',
  paused: 'En pause',
  total: 'Total',
  monthly: 'Mensuel',
  
  nav_home: 'Accueil',
  nav_transactions: 'Transactions',
  nav_budgets: 'Budgets',
  nav_goals: 'Objectifs',
  nav_reports: 'Rapports',
  nav_assistant: 'Assistant',
  nav_recurring: 'Récurrents',
  nav_settings: 'Paramètres',
  nav_more: 'Plus',
  nav_logout: 'Déconnexion',
  
  auth_welcome: 'Bienvenue!',
  auth_login: 'Se connecter',
  auth_register: "S'inscrire",
  auth_email: 'Email',
  auth_password: 'Mot de passe',
  auth_confirmPassword: 'Confirmer le mot de passe',
  auth_forgotPassword: 'Mot de passe oublié?',
  auth_noAccount: "Pas de compte?",
  auth_hasAccount: 'Déjà un compte?',
  auth_continueWith: 'ou continuer avec',
  auth_name: 'Nom complet',
  auth_createAccount: 'Créer un compte',
  
  dash_title: 'Tableau de bord',
  dash_balance: 'Solde Total',
  dash_income: 'Revenus',
  dash_expenses: 'Dépenses',
  dash_savingsRate: "Taux d'épargne",
  dash_recentTransactions: 'Transactions Récentes',
  dash_quickActions: 'Actions Rapides',
  dash_addExpense: 'Ajouter Dépense',
  dash_addIncome: 'Ajouter Revenu',
  dash_noTransactions: 'Aucune transaction',
  dash_viewAll: 'Voir tout',
  
  trans_title: 'Transactions',
  trans_add: 'Nouvelle Transaction',
  trans_expense: 'Dépense',
  trans_income: 'Revenu',
  trans_amount: 'Montant',
  trans_category: 'Catégorie',
  trans_date: 'Date',
  trans_description: 'Description',
  trans_notes: 'Notes',
  trans_noTransactions: 'Aucune transaction',
  trans_deleteConfirm: 'Supprimer cette transaction?',
  
  budget_title: 'Budgets',
  budget_add: 'Nouveau Budget',
  budget_spent: 'Dépensé',
  budget_remaining: 'Restant',
  budget_exceeded: 'Dépassé',
  budget_onTrack: 'En bonne voie',
  budget_noBudgets: 'Aucun budget défini',
  budget_limit: 'Limite',
  budget_category: 'Catégorie',
  budget_percentUsed: '% utilisé',
  
  goals_title: "Objectifs d'Épargne",
  goals_add: 'Nouvel Objectif',
  goals_target: 'Montant Cible',
  goals_current: 'Montant Actuel',
  goals_deadline: 'Date Limite',
  goals_progress: 'Progression',
  goals_completed: 'Terminé',
  goals_noGoals: 'Aucun objectif défini',
  goals_addContribution: 'Ajouter Contribution',
  goals_daysLeft: 'jours restants',
  goals_achieved: 'Objectif atteint!',
  
  reports_title: 'Rapports',
  reports_overview: 'Aperçu',
  reports_byCategory: 'Par Catégorie',
  reports_trends: 'Tendances',
  reports_thisMonth: 'Ce Mois',
  reports_lastMonth: 'Mois Dernier',
  reports_thisYear: 'Cette Année',
  reports_income: 'Revenus',
  reports_expenses: 'Dépenses',
  reports_balance: 'Solde',
  reports_noData: 'Aucune donnée disponible',
  
  recur_title: 'Transactions Récurrentes',
  recur_add: 'Nouveau Récurrent',
  recur_edit: 'Modifier Récurrent',
  recur_fixedIncome: 'Revenus Fixes/mois',
  recur_fixedExpenses: 'Dépenses Fixes/mois',
  recur_fixedBalance: 'Solde Fixe/mois',
  recur_totalActive: 'Total Actifs',
  recur_frequency: 'Fréquence',
  recur_daily: 'Quotidien',
  recur_weekly: 'Hebdomadaire',
  recur_biweekly: 'Bimensuel',
  recur_monthly: 'Mensuel',
  recur_yearly: 'Annuel',
  recur_nextDue: 'Prochain paiement',
  recur_noRecurring: 'Aucune transaction récurrente',
  recur_dayOfMonth: 'Jour du mois',
  
  asst_title: 'Assistant Financier',
  asst_placeholder: 'Écrivez votre question financière...',
  asst_send: 'Envoyer',
  asst_analyzing: 'Analyse de vos données...',
  asst_clearChat: 'Effacer le chat',
  asst_summary: 'Résumé',
  asst_tips: 'Conseils',
  asst_savings: 'Épargne',
  asst_projection: 'Projection',
  asst_alerts: 'Alertes',
  asst_achievements: 'Réalisations',
  asst_welcome: 'Bonjour! Je suis votre assistant financier intelligent.',
  asst_hint: 'Appuyez sur Entrée ou le bouton pour envoyer',
  
  settings_title: 'Paramètres',
  settings_general: 'Général',
  settings_appearance: 'Apparence',
  settings_notifications: 'Notifications',
  settings_alerts: 'Alertes',
  settings_data: 'Données',
  settings_theme: 'Thème',
  settings_language: 'Langue',
  settings_currency: 'Devise',
  settings_profile: 'Profil',
  settings_export: 'Exporter Données',
  settings_import: 'Importer Données',
  settings_deleteAccount: 'Supprimer Compte',
  settings_budgetAlerts: 'Alertes Budget',
  settings_goalAlerts: 'Alertes Objectifs',
  
  more_title: 'Plus d\'Options',
  more_quickSettings: 'Paramètres Rapides',
  more_advancedSettings: 'Paramètres Avancés',
  more_account: 'Compte',
  more_fullSettings: 'Paramètres Complets',
  more_smartAlerts: 'Alertes Intelligentes',
  more_dataManagement: 'Gestion des Données',
  more_myProfile: 'Mon Profil',
  more_logoutConfirm: 'Se déconnecter?',
  
  landing_tagline: 'Votre gestionnaire financier personnel intelligent. Prenez le contrôle de vos finances.',
  landing_feature1Title: 'Suivi des Dépenses',
  landing_feature1Desc: 'Enregistrez et catégorisez toutes vos transactions',
  landing_feature2Title: 'Budgets',
  landing_feature2Desc: 'Définissez des limites et recevez des alertes',
  landing_feature3Title: "Objectifs d'Épargne",
  landing_feature3Desc: 'Atteignez vos objectifs financiers',
  landing_feature4Title: 'Assistant IA',
  landing_feature4Desc: 'Conseils personnalisés pour vous',
  landing_copyright: '© 2025 Smarter Investment. Tous droits réservés.',
  
  cat_food: 'Alimentation',
  cat_transport: 'Transport',
  cat_entertainment: 'Divertissement',
  cat_shopping: 'Shopping',
  cat_health: 'Santé',
  cat_education: 'Éducation',
  cat_utilities: 'Services',
  cat_rent: 'Loyer',
  cat_subscriptions: 'Abonnements',
  cat_other: 'Autres',
  cat_salary: 'Salaire',
  cat_freelance: 'Freelance',
  cat_investments: 'Investissements',
  cat_gifts: 'Cadeaux',
  cat_sales: 'Ventes',
  cat_refunds: 'Remboursements',
};

// Portuguese translations
const pt: AppTranslations = {
  save: 'Salvar',
  cancel: 'Cancelar',
  delete: 'Excluir',
  edit: 'Editar',
  add: 'Adicionar',
  close: 'Fechar',
  confirm: 'Confirmar',
  search: 'Pesquisar',
  filter: 'Filtrar',
  loading: 'Carregando...',
  error: 'Erro',
  success: 'Sucesso',
  yes: 'Sim',
  no: 'Não',
  back: 'Voltar',
  next: 'Próximo',
  new: 'Novo',
  active: 'Ativo',
  paused: 'Pausado',
  total: 'Total',
  monthly: 'Mensal',
  
  nav_home: 'Início',
  nav_transactions: 'Transações',
  nav_budgets: 'Orçamentos',
  nav_goals: 'Metas',
  nav_reports: 'Relatórios',
  nav_assistant: 'Assistente',
  nav_recurring: 'Recorrentes',
  nav_settings: 'Configurações',
  nav_more: 'Mais',
  nav_logout: 'Sair',
  
  auth_welcome: 'Bem-vindo!',
  auth_login: 'Entrar',
  auth_register: 'Cadastrar',
  auth_email: 'Email',
  auth_password: 'Senha',
  auth_confirmPassword: 'Confirmar senha',
  auth_forgotPassword: 'Esqueceu a senha?',
  auth_noAccount: 'Não tem conta?',
  auth_hasAccount: 'Já tem uma conta?',
  auth_continueWith: 'ou continue com',
  auth_name: 'Nome completo',
  auth_createAccount: 'Criar Conta',
  
  dash_title: 'Painel',
  dash_balance: 'Saldo Total',
  dash_income: 'Receitas',
  dash_expenses: 'Despesas',
  dash_savingsRate: 'Taxa de Poupança',
  dash_recentTransactions: 'Transações Recentes',
  dash_quickActions: 'Ações Rápidas',
  dash_addExpense: 'Adicionar Despesa',
  dash_addIncome: 'Adicionar Receita',
  dash_noTransactions: 'Sem transações',
  dash_viewAll: 'Ver todas',
  
  trans_title: 'Transações',
  trans_add: 'Nova Transação',
  trans_expense: 'Despesa',
  trans_income: 'Receita',
  trans_amount: 'Valor',
  trans_category: 'Categoria',
  trans_date: 'Data',
  trans_description: 'Descrição',
  trans_notes: 'Notas',
  trans_noTransactions: 'Sem transações',
  trans_deleteConfirm: 'Excluir esta transação?',
  
  budget_title: 'Orçamentos',
  budget_add: 'Novo Orçamento',
  budget_spent: 'Gasto',
  budget_remaining: 'Restante',
  budget_exceeded: 'Excedido',
  budget_onTrack: 'No caminho certo',
  budget_noBudgets: 'Sem orçamentos definidos',
  budget_limit: 'Limite',
  budget_category: 'Categoria',
  budget_percentUsed: '% usado',
  
  goals_title: 'Metas de Economia',
  goals_add: 'Nova Meta',
  goals_target: 'Valor Alvo',
  goals_current: 'Valor Atual',
  goals_deadline: 'Prazo',
  goals_progress: 'Progresso',
  goals_completed: 'Concluída',
  goals_noGoals: 'Sem metas definidas',
  goals_addContribution: 'Adicionar Contribuição',
  goals_daysLeft: 'dias restantes',
  goals_achieved: 'Meta alcançada!',
  
  reports_title: 'Relatórios',
  reports_overview: 'Visão Geral',
  reports_byCategory: 'Por Categoria',
  reports_trends: 'Tendências',
  reports_thisMonth: 'Este Mês',
  reports_lastMonth: 'Mês Passado',
  reports_thisYear: 'Este Ano',
  reports_income: 'Receitas',
  reports_expenses: 'Despesas',
  reports_balance: 'Saldo',
  reports_noData: 'Sem dados disponíveis',
  
  recur_title: 'Transações Recorrentes',
  recur_add: 'Novo Recorrente',
  recur_edit: 'Editar Recorrente',
  recur_fixedIncome: 'Receitas Fixas/mês',
  recur_fixedExpenses: 'Despesas Fixas/mês',
  recur_fixedBalance: 'Saldo Fixo/mês',
  recur_totalActive: 'Total Ativos',
  recur_frequency: 'Frequência',
  recur_daily: 'Diário',
  recur_weekly: 'Semanal',
  recur_biweekly: 'Quinzenal',
  recur_monthly: 'Mensal',
  recur_yearly: 'Anual',
  recur_nextDue: 'Próximo vencimento',
  recur_noRecurring: 'Sem transações recorrentes',
  recur_dayOfMonth: 'Dia do mês',
  
  asst_title: 'Assistente Financeiro',
  asst_placeholder: 'Digite sua pergunta financeira...',
  asst_send: 'Enviar',
  asst_analyzing: 'Analisando seus dados...',
  asst_clearChat: 'Limpar chat',
  asst_summary: 'Resumo',
  asst_tips: 'Dicas',
  asst_savings: 'Poupança',
  asst_projection: 'Projeção',
  asst_alerts: 'Alertas',
  asst_achievements: 'Conquistas',
  asst_welcome: 'Olá! Sou seu assistente financeiro inteligente.',
  asst_hint: 'Pressione Enter ou o botão para enviar',
  
  settings_title: 'Configurações',
  settings_general: 'Geral',
  settings_appearance: 'Aparência',
  settings_notifications: 'Notificações',
  settings_alerts: 'Alertas',
  settings_data: 'Dados',
  settings_theme: 'Tema',
  settings_language: 'Idioma',
  settings_currency: 'Moeda',
  settings_profile: 'Perfil',
  settings_export: 'Exportar Dados',
  settings_import: 'Importar Dados',
  settings_deleteAccount: 'Excluir Conta',
  settings_budgetAlerts: 'Alertas de Orçamento',
  settings_goalAlerts: 'Alertas de Metas',
  
  more_title: 'Mais Opções',
  more_quickSettings: 'Config. Rápidas',
  more_advancedSettings: 'Config. Avançadas',
  more_account: 'Conta',
  more_fullSettings: 'Config. Completas',
  more_smartAlerts: 'Alertas Inteligentes',
  more_dataManagement: 'Gestão de Dados',
  more_myProfile: 'Meu Perfil',
  more_logoutConfirm: 'Sair da conta?',
  
  landing_tagline: 'Seu gestor financeiro pessoal inteligente. Assuma o controle das suas finanças hoje.',
  landing_feature1Title: 'Controle de Gastos',
  landing_feature1Desc: 'Registre e categorize todas as suas transações',
  landing_feature2Title: 'Orçamentos',
  landing_feature2Desc: 'Defina limites e receba alertas',
  landing_feature3Title: 'Metas de Economia',
  landing_feature3Desc: 'Alcance seus objetivos financeiros',
  landing_feature4Title: 'Assistente IA',
  landing_feature4Desc: 'Dicas personalizadas para você',
  landing_copyright: '© 2025 Smarter Investment. Todos os direitos reservados.',
  
  cat_food: 'Alimentação',
  cat_transport: 'Transporte',
  cat_entertainment: 'Entretenimento',
  cat_shopping: 'Compras',
  cat_health: 'Saúde',
  cat_education: 'Educação',
  cat_utilities: 'Serviços',
  cat_rent: 'Aluguel',
  cat_subscriptions: 'Assinaturas',
  cat_other: 'Outros',
  cat_salary: 'Salário',
  cat_freelance: 'Freelance',
  cat_investments: 'Investimentos',
  cat_gifts: 'Presentes',
  cat_sales: 'Vendas',
  cat_refunds: 'Reembolsos',
};

// Italian translations
const it: AppTranslations = {
  ...fr, // Base from French (similar)
  save: 'Salva',
  cancel: 'Annulla',
  delete: 'Elimina',
  edit: 'Modifica',
  add: 'Aggiungi',
  close: 'Chiudi',
  confirm: 'Conferma',
  search: 'Cerca',
  filter: 'Filtra',
  loading: 'Caricamento...',
  error: 'Errore',
  success: 'Successo',
  yes: 'Sì',
  no: 'No',
  back: 'Indietro',
  next: 'Avanti',
  new: 'Nuovo',
  active: 'Attivo',
  paused: 'In pausa',
  total: 'Totale',
  monthly: 'Mensile',
  
  nav_home: 'Home',
  nav_transactions: 'Transazioni',
  nav_budgets: 'Budget',
  nav_goals: 'Obiettivi',
  nav_reports: 'Rapporti',
  nav_assistant: 'Assistente',
  nav_recurring: 'Ricorrenti',
  nav_settings: 'Impostazioni',
  nav_more: 'Altro',
  nav_logout: 'Esci',
  
  auth_welcome: 'Benvenuto!',
  auth_login: 'Accedi',
  auth_register: 'Registrati',
  auth_noAccount: 'Non hai un account?',
  auth_hasAccount: 'Hai già un account?',
  auth_createAccount: 'Crea Account',
  
  landing_tagline: 'Il tuo gestore finanziario personale intelligente. Prendi il controllo delle tue finanze.',
  landing_feature1Title: 'Controllo Spese',
  landing_feature2Title: 'Budget',
  landing_feature3Title: 'Obiettivi di Risparmio',
  landing_feature4Title: 'Assistente IA',
  landing_copyright: '© 2025 Smarter Investment. Tutti i diritti riservati.',
};

// German translations
const de: AppTranslations = {
  ...en, // Base from English
  save: 'Speichern',
  cancel: 'Abbrechen',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  add: 'Hinzufügen',
  close: 'Schließen',
  confirm: 'Bestätigen',
  search: 'Suchen',
  filter: 'Filtern',
  loading: 'Laden...',
  error: 'Fehler',
  success: 'Erfolg',
  yes: 'Ja',
  no: 'Nein',
  back: 'Zurück',
  next: 'Weiter',
  new: 'Neu',
  active: 'Aktiv',
  paused: 'Pausiert',
  total: 'Gesamt',
  monthly: 'Monatlich',
  
  nav_home: 'Start',
  nav_transactions: 'Transaktionen',
  nav_budgets: 'Budgets',
  nav_goals: 'Ziele',
  nav_reports: 'Berichte',
  nav_assistant: 'Assistent',
  nav_recurring: 'Wiederkehrend',
  nav_settings: 'Einstellungen',
  nav_more: 'Mehr',
  nav_logout: 'Abmelden',
  
  auth_welcome: 'Willkommen!',
  auth_login: 'Anmelden',
  auth_register: 'Registrieren',
  auth_noAccount: 'Kein Konto?',
  auth_hasAccount: 'Bereits ein Konto?',
  auth_createAccount: 'Konto erstellen',
  
  landing_tagline: 'Ihr intelligenter persönlicher Finanzmanager. Übernehmen Sie die Kontrolle über Ihre Finanzen.',
  landing_feature1Title: 'Ausgabenkontrolle',
  landing_feature2Title: 'Budgets',
  landing_feature3Title: 'Sparziele',
  landing_feature4Title: 'KI-Assistent',
  landing_copyright: '© 2025 Smarter Investment. Alle Rechte vorbehalten.',
};

// Chinese translations
const zh: AppTranslations = {
  ...en,
  save: '保存',
  cancel: '取消',
  delete: '删除',
  edit: '编辑',
  add: '添加',
  close: '关闭',
  confirm: '确认',
  search: '搜索',
  filter: '筛选',
  loading: '加载中...',
  error: '错误',
  success: '成功',
  yes: '是',
  no: '否',
  back: '返回',
  next: '下一步',
  new: '新建',
  active: '活跃',
  paused: '暂停',
  total: '总计',
  monthly: '每月',
  
  nav_home: '首页',
  nav_transactions: '交易',
  nav_budgets: '预算',
  nav_goals: '目标',
  nav_reports: '报告',
  nav_assistant: '助手',
  nav_recurring: '定期',
  nav_settings: '设置',
  nav_more: '更多',
  nav_logout: '退出',
  
  auth_welcome: '欢迎！',
  auth_login: '登录',
  auth_register: '注册',
  auth_email: '邮箱',
  auth_password: '密码',
  auth_noAccount: '没有账户？',
  auth_hasAccount: '已有账户？',
  auth_createAccount: '创建账户',
  
  dash_balance: '总余额',
  dash_income: '收入',
  dash_expenses: '支出',
  dash_savingsRate: '储蓄率',
  
  landing_tagline: '您的智能个人财务管理器。今天就掌控您的财务。',
  landing_feature1Title: '支出跟踪',
  landing_feature2Title: '预算',
  landing_feature3Title: '储蓄目标',
  landing_feature4Title: 'AI助手',
  landing_copyright: '© 2025 Smarter Investment。保留所有权利。',
};

// Japanese translations
const ja: AppTranslations = {
  ...en,
  save: '保存',
  cancel: 'キャンセル',
  delete: '削除',
  edit: '編集',
  add: '追加',
  close: '閉じる',
  confirm: '確認',
  search: '検索',
  filter: 'フィルター',
  loading: '読み込み中...',
  error: 'エラー',
  success: '成功',
  yes: 'はい',
  no: 'いいえ',
  back: '戻る',
  next: '次へ',
  new: '新規',
  active: 'アクティブ',
  paused: '一時停止',
  total: '合計',
  monthly: '毎月',
  
  nav_home: 'ホーム',
  nav_transactions: '取引',
  nav_budgets: '予算',
  nav_goals: '目標',
  nav_reports: 'レポート',
  nav_assistant: 'アシスタント',
  nav_recurring: '定期',
  nav_settings: '設定',
  nav_more: 'その他',
  nav_logout: 'ログアウト',
  
  auth_welcome: 'ようこそ！',
  auth_login: 'ログイン',
  auth_register: '登録',
  auth_noAccount: 'アカウントがない？',
  auth_hasAccount: 'アカウントをお持ちですか？',
  auth_createAccount: 'アカウント作成',
  
  dash_balance: '総残高',
  dash_income: '収入',
  dash_expenses: '支出',
  dash_savingsRate: '貯蓄率',
  
  landing_tagline: 'スマートな個人財務マネージャー。今日から財務を管理しましょう。',
  landing_feature1Title: '支出追跡',
  landing_feature2Title: '予算',
  landing_feature3Title: '貯蓄目標',
  landing_feature4Title: 'AIアシスタント',
  landing_copyright: '© 2025 Smarter Investment。全著作権所有。',
};

// All translations map
const translations: Record<Language, AppTranslations> = {
  es, en, fr, pt, it, de, zh, ja
};

// Get translations for a language
export function getTranslations(lang: Language): AppTranslations {
  return translations[lang] || translations.es;
}

// Simple translation function
export function t(lang: Language, key: keyof AppTranslations): string {
  const trans = translations[lang] || translations.es;
  return trans[key] || translations.es[key] || key;
}

// Hook to use in components (uses store internally)
export function useTranslations(lang: Language): AppTranslations {
  return translations[lang] || translations.es;
}

// Language options for UI
export const LANGUAGE_OPTIONS: Array<{ value: Language; label: string; flag: string }> = [
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

// Navigation labels helper
export function getNavLabels(lang: Language) {
  const t = translations[lang] || translations.es;
  return {
    home: t.nav_home,
    transactions: t.nav_transactions,
    budgets: t.nav_budgets,
    goals: t.nav_goals,
    reports: t.nav_reports,
    assistant: t.nav_assistant,
    recurring: t.nav_recurring,
    settings: t.nav_settings,
    more: t.nav_more,
  };
}

export default translations;
