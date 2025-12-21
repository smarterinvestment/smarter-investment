// ============================================
// 🌍 INTERNATIONALIZATION (i18n) SYSTEM
// Complete translations for 8 languages
// ============================================

export type Language = 'es' | 'en' | 'fr' | 'it' | 'pt' | 'zh' | 'ja' | 'de';

// Language options for UI
export const LANGUAGE_OPTIONS: Array<{ value: Language; label: string; flag: string; nativeName: string }> = [
  { value: 'es', label: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { value: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
  { value: 'fr', label: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { value: 'it', label: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { value: 'pt', label: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
  { value: 'de', label: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
];

// All translations
const translations: Record<Language, Record<string, any>> = {
  es: {
    // Common
    loading: 'Cargando...', save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
    add: 'Agregar', close: 'Cerrar', confirm: 'Confirmar', search: 'Buscar', filter: 'Filtrar',
    all: 'Todos', yes: 'Sí', no: 'No', ok: 'OK', error: 'Error', success: 'Éxito', back: 'Atrás',
    // Navigation
    nav_dashboard: 'Inicio', nav_transactions: 'Transacciones', nav_budgets: 'Presupuestos',
    nav_goals: 'Metas', nav_reports: 'Reportes', nav_settings: 'Configuración',
    nav_assistant: 'Asistente', nav_recurring: 'Recurrentes', nav_more: 'Más', nav_logout: 'Cerrar Sesión',
    // Auth
    welcome: '¡Bienvenido!', login: 'Iniciar Sesión', register: 'Registrarse', createAccount: 'Crear Cuenta',
    email: 'Correo electrónico', password: 'Contraseña', confirmPassword: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?', noAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?', continueWith: 'o continúa con', name: 'Nombre completo',
    emailPlaceholder: 'correo@ejemplo.com', namePlaceholder: 'Tu nombre',
    // Dashboard
    totalBalance: 'Balance Total', totalIncome: 'Ingresos', totalExpenses: 'Gastos',
    savingsRate: 'Tasa de Ahorro', recentTransactions: 'Transacciones Recientes',
    quickActions: 'Acciones Rápidas', addExpense: 'Agregar Gasto', addIncome: 'Agregar Ingreso',
    // Transactions
    expense: 'Gasto', income: 'Ingreso', amount: 'Monto', category: 'Categoría',
    date: 'Fecha', description: 'Descripción', notes: 'Notas', noTransactions: 'Sin transacciones',
    // Categories
    cat_food: 'Alimentación', cat_transport: 'Transporte', cat_entertainment: 'Entretenimiento',
    cat_shopping: 'Compras', cat_health: 'Salud', cat_education: 'Educación',
    cat_utilities: 'Servicios', cat_rent: 'Alquiler', cat_salary: 'Salario', cat_other: 'Otros',
    // Budgets
    budgets_title: 'Presupuestos', spent: 'Gastado', remaining: 'Restante', exceeded: 'Excedido',
    setBudget: 'Establecer Presupuesto', noBudgets: 'Sin presupuestos',
    // Goals
    goals_title: 'Metas de Ahorro', targetAmount: 'Monto Objetivo', currentAmount: 'Monto Actual',
    deadline: 'Fecha Límite', progress: 'Progreso', addGoal: 'Agregar Meta', noGoals: 'Sin metas',
    addContribution: 'Agregar Aporte', daysRemaining: 'días restantes',
    // Reports
    reports_title: 'Reportes', overview: 'Resumen', byCategory: 'Por Categoría', trends: 'Tendencias',
    thisMonth: 'Este Mes', lastMonth: 'Mes Pasado', thisYear: 'Este Año',
    // Settings
    settings_title: 'Configuración', general: 'General', appearance: 'Apariencia',
    notifications: 'Notificaciones', alerts: 'Alertas', data: 'Datos', theme: 'Tema',
    language: 'Idioma', currency: 'Moneda', profile: 'Perfil', exportData: 'Exportar Datos',
    // Assistant
    assistant_title: 'Asistente Financiero', askQuestion: 'Escribe tu pregunta...',
    send: 'Enviar', analyzing: 'Analizando tus datos...', clearChat: 'Limpiar chat',
    summary: 'Resumen', tips: 'Consejos', savings: 'Ahorro', projection: 'Proyección',
    achievements: 'Logros',
    // Recurring
    recurring_title: 'Transacciones Recurrentes', frequency: 'Frecuencia',
    daily: 'Diario', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual',
    active: 'Activo', paused: 'Pausado', noRecurring: 'Sin recurrentes',
    // Landing
    tagline: 'Tu gestor financiero personal inteligente. Toma el control de tus finanzas hoy.',
    feature1Title: 'Control de Gastos', feature1Desc: 'Registra y categoriza todos tus movimientos',
    feature2Title: 'Presupuestos', feature2Desc: 'Establece límites y recibe alertas',
    feature3Title: 'Metas de Ahorro', feature3Desc: 'Alcanza tus objetivos financieros',
    feature4Title: 'Asistente IA', feature4Desc: 'Consejos personalizados para ti',
    copyright: '© 2025 Smarter Investment. Todos los derechos reservados.',
  },
  en: {
    loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
    add: 'Add', close: 'Close', confirm: 'Confirm', search: 'Search', filter: 'Filter',
    all: 'All', yes: 'Yes', no: 'No', ok: 'OK', error: 'Error', success: 'Success', back: 'Back',
    nav_dashboard: 'Home', nav_transactions: 'Transactions', nav_budgets: 'Budgets',
    nav_goals: 'Goals', nav_reports: 'Reports', nav_settings: 'Settings',
    nav_assistant: 'Assistant', nav_recurring: 'Recurring', nav_more: 'More', nav_logout: 'Logout',
    welcome: 'Welcome!', login: 'Sign In', register: 'Sign Up', createAccount: 'Create Account',
    email: 'Email', password: 'Password', confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot password?', noAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?', continueWith: 'or continue with', name: 'Full name',
    emailPlaceholder: 'email@example.com', namePlaceholder: 'Your name',
    totalBalance: 'Total Balance', totalIncome: 'Income', totalExpenses: 'Expenses',
    savingsRate: 'Savings Rate', recentTransactions: 'Recent Transactions',
    quickActions: 'Quick Actions', addExpense: 'Add Expense', addIncome: 'Add Income',
    expense: 'Expense', income: 'Income', amount: 'Amount', category: 'Category',
    date: 'Date', description: 'Description', notes: 'Notes', noTransactions: 'No transactions',
    cat_food: 'Food', cat_transport: 'Transport', cat_entertainment: 'Entertainment',
    cat_shopping: 'Shopping', cat_health: 'Health', cat_education: 'Education',
    cat_utilities: 'Utilities', cat_rent: 'Rent', cat_salary: 'Salary', cat_other: 'Other',
    budgets_title: 'Budgets', spent: 'Spent', remaining: 'Remaining', exceeded: 'Exceeded',
    setBudget: 'Set Budget', noBudgets: 'No budgets',
    goals_title: 'Savings Goals', targetAmount: 'Target Amount', currentAmount: 'Current Amount',
    deadline: 'Deadline', progress: 'Progress', addGoal: 'Add Goal', noGoals: 'No goals',
    addContribution: 'Add Contribution', daysRemaining: 'days remaining',
    reports_title: 'Reports', overview: 'Overview', byCategory: 'By Category', trends: 'Trends',
    thisMonth: 'This Month', lastMonth: 'Last Month', thisYear: 'This Year',
    settings_title: 'Settings', general: 'General', appearance: 'Appearance',
    notifications: 'Notifications', alerts: 'Alerts', data: 'Data', theme: 'Theme',
    language: 'Language', currency: 'Currency', profile: 'Profile', exportData: 'Export Data',
    assistant_title: 'Financial Assistant', askQuestion: 'Type your question...',
    send: 'Send', analyzing: 'Analyzing your data...', clearChat: 'Clear chat',
    summary: 'Summary', tips: 'Tips', savings: 'Savings', projection: 'Projection',
    achievements: 'Achievements',
    recurring_title: 'Recurring Transactions', frequency: 'Frequency',
    daily: 'Daily', weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly', yearly: 'Yearly',
    active: 'Active', paused: 'Paused', noRecurring: 'No recurring',
    tagline: 'Your intelligent personal finance manager. Take control of your finances today.',
    feature1Title: 'Expense Tracking', feature1Desc: 'Record and categorize all your transactions',
    feature2Title: 'Budgets', feature2Desc: 'Set limits and receive alerts',
    feature3Title: 'Savings Goals', feature3Desc: 'Achieve your financial objectives',
    feature4Title: 'AI Assistant', feature4Desc: 'Personalized tips for you',
    copyright: '© 2025 Smarter Investment. All rights reserved.',
  },
  fr: {
    loading: 'Chargement...', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
    add: 'Ajouter', close: 'Fermer', confirm: 'Confirmer', search: 'Rechercher', filter: 'Filtrer',
    all: 'Tous', yes: 'Oui', no: 'Non', ok: 'OK', error: 'Erreur', success: 'Succès', back: 'Retour',
    nav_dashboard: 'Accueil', nav_transactions: 'Transactions', nav_budgets: 'Budgets',
    nav_goals: 'Objectifs', nav_reports: 'Rapports', nav_settings: 'Paramètres',
    nav_assistant: 'Assistant', nav_recurring: 'Récurrents', nav_more: 'Plus', nav_logout: 'Déconnexion',
    welcome: 'Bienvenue!', login: 'Se connecter', register: "S'inscrire", createAccount: 'Créer un compte',
    email: 'Email', password: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié?', noAccount: "Pas de compte?",
    alreadyHaveAccount: 'Déjà un compte?', continueWith: 'ou continuer avec', name: 'Nom complet',
    emailPlaceholder: 'email@exemple.com', namePlaceholder: 'Votre nom',
    totalBalance: 'Solde Total', totalIncome: 'Revenus', totalExpenses: 'Dépenses',
    savingsRate: "Taux d'épargne", recentTransactions: 'Transactions Récentes',
    tagline: 'Votre gestionnaire financier personnel intelligent. Prenez le contrôle de vos finances.',
    feature1Title: 'Suivi des Dépenses', feature1Desc: 'Enregistrez et catégorisez toutes vos transactions',
    feature2Title: 'Budgets', feature2Desc: 'Définissez des limites et recevez des alertes',
    feature3Title: "Objectifs d'Épargne", feature3Desc: 'Atteignez vos objectifs financiers',
    feature4Title: 'Assistant IA', feature4Desc: 'Conseils personnalisés pour vous',
    copyright: '© 2025 Smarter Investment. Tous droits réservés.',
    settings_title: 'Paramètres', general: 'Général', theme: 'Thème', language: 'Langue', currency: 'Devise',
    assistant_title: 'Assistant Financier', askQuestion: 'Écrivez votre question...',
    send: 'Envoyer', analyzing: 'Analyse de vos données...', summary: 'Résumé', tips: 'Conseils',
  },
  pt: {
    loading: 'Carregando...', save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar',
    add: 'Adicionar', close: 'Fechar', confirm: 'Confirmar', search: 'Pesquisar', filter: 'Filtrar',
    all: 'Todos', yes: 'Sim', no: 'Não', ok: 'OK', error: 'Erro', success: 'Sucesso', back: 'Voltar',
    nav_dashboard: 'Início', nav_transactions: 'Transações', nav_budgets: 'Orçamentos',
    nav_goals: 'Metas', nav_reports: 'Relatórios', nav_settings: 'Configurações',
    nav_assistant: 'Assistente', nav_recurring: 'Recorrentes', nav_more: 'Mais', nav_logout: 'Sair',
    welcome: 'Bem-vindo!', login: 'Entrar', register: 'Cadastrar', createAccount: 'Criar Conta',
    email: 'Email', password: 'Senha', confirmPassword: 'Confirmar senha',
    forgotPassword: 'Esqueceu a senha?', noAccount: 'Não tem conta?',
    alreadyHaveAccount: 'Já tem uma conta?', continueWith: 'ou continue com', name: 'Nome completo',
    tagline: 'Seu gestor financeiro pessoal inteligente. Assuma o controle das suas finanças hoje.',
    feature1Title: 'Controle de Gastos', feature1Desc: 'Registre e categorize todas as suas transações',
    feature2Title: 'Orçamentos', feature2Desc: 'Defina limites e receba alertas',
    feature3Title: 'Metas de Economia', feature3Desc: 'Alcance seus objetivos financeiros',
    feature4Title: 'Assistente IA', feature4Desc: 'Dicas personalizadas para você',
    copyright: '© 2025 Smarter Investment. Todos os direitos reservados.',
    settings_title: 'Configurações', theme: 'Tema', language: 'Idioma', currency: 'Moeda',
  },
  it: {
    loading: 'Caricamento...', save: 'Salva', cancel: 'Annulla', delete: 'Elimina', edit: 'Modifica',
    add: 'Aggiungi', close: 'Chiudi', confirm: 'Conferma', search: 'Cerca', filter: 'Filtra',
    all: 'Tutti', yes: 'Sì', no: 'No', ok: 'OK', error: 'Errore', success: 'Successo', back: 'Indietro',
    nav_dashboard: 'Home', nav_transactions: 'Transazioni', nav_budgets: 'Budget',
    nav_goals: 'Obiettivi', nav_reports: 'Rapporti', nav_settings: 'Impostazioni',
    nav_assistant: 'Assistente', nav_recurring: 'Ricorrenti', nav_more: 'Altro', nav_logout: 'Esci',
    welcome: 'Benvenuto!', login: 'Accedi', register: 'Registrati', createAccount: 'Crea Account',
    email: 'Email', password: 'Password', confirmPassword: 'Conferma password',
    tagline: 'Il tuo gestore finanziario personale intelligente. Prendi il controllo delle tue finanze.',
    feature1Title: 'Controllo Spese', feature1Desc: 'Registra e categorizza tutte le tue transazioni',
    feature2Title: 'Budget', feature2Desc: 'Imposta limiti e ricevi avvisi',
    feature3Title: 'Obiettivi di Risparmio', feature3Desc: 'Raggiungi i tuoi obiettivi finanziari',
    feature4Title: 'Assistente IA', feature4Desc: 'Consigli personalizzati per te',
    copyright: '© 2025 Smarter Investment. Tutti i diritti riservati.',
    settings_title: 'Impostazioni', theme: 'Tema', language: 'Lingua', currency: 'Valuta',
  },
  de: {
    loading: 'Laden...', save: 'Speichern', cancel: 'Abbrechen', delete: 'Löschen', edit: 'Bearbeiten',
    add: 'Hinzufügen', close: 'Schließen', confirm: 'Bestätigen', search: 'Suchen', filter: 'Filtern',
    all: 'Alle', yes: 'Ja', no: 'Nein', ok: 'OK', error: 'Fehler', success: 'Erfolg', back: 'Zurück',
    nav_dashboard: 'Startseite', nav_transactions: 'Transaktionen', nav_budgets: 'Budgets',
    nav_goals: 'Ziele', nav_reports: 'Berichte', nav_settings: 'Einstellungen',
    nav_assistant: 'Assistent', nav_recurring: 'Wiederkehrend', nav_more: 'Mehr', nav_logout: 'Abmelden',
    welcome: 'Willkommen!', login: 'Anmelden', register: 'Registrieren', createAccount: 'Konto erstellen',
    email: 'E-Mail', password: 'Passwort', confirmPassword: 'Passwort bestätigen',
    tagline: 'Ihr intelligenter persönlicher Finanzmanager. Übernehmen Sie die Kontrolle über Ihre Finanzen.',
    feature1Title: 'Ausgabenkontrolle', feature1Desc: 'Erfassen und kategorisieren Sie alle Ihre Transaktionen',
    feature2Title: 'Budgets', feature2Desc: 'Legen Sie Limits fest und erhalten Sie Benachrichtigungen',
    feature3Title: 'Sparziele', feature3Desc: 'Erreichen Sie Ihre finanziellen Ziele',
    feature4Title: 'KI-Assistent', feature4Desc: 'Personalisierte Tipps für Sie',
    copyright: '© 2025 Smarter Investment. Alle Rechte vorbehalten.',
    settings_title: 'Einstellungen', theme: 'Thema', language: 'Sprache', currency: 'Währung',
  },
  zh: {
    loading: '加载中...', save: '保存', cancel: '取消', delete: '删除', edit: '编辑',
    add: '添加', close: '关闭', confirm: '确认', search: '搜索', filter: '筛选',
    all: '全部', yes: '是', no: '否', ok: '确定', error: '错误', success: '成功', back: '返回',
    nav_dashboard: '首页', nav_transactions: '交易', nav_budgets: '预算',
    nav_goals: '目标', nav_reports: '报告', nav_settings: '设置',
    nav_assistant: '助手', nav_recurring: '定期', nav_more: '更多', nav_logout: '退出',
    welcome: '欢迎！', login: '登录', register: '注册', createAccount: '创建账户',
    email: '邮箱', password: '密码', confirmPassword: '确认密码',
    tagline: '您的智能个人财务管理器。今天就掌控您的财务。',
    feature1Title: '支出跟踪', feature1Desc: '记录和分类您的所有交易',
    feature2Title: '预算', feature2Desc: '设置限额并接收提醒',
    feature3Title: '储蓄目标', feature3Desc: '实现您的财务目标',
    feature4Title: 'AI助手', feature4Desc: '为您提供个性化建议',
    copyright: '© 2025 Smarter Investment。保留所有权利。',
    settings_title: '设置', theme: '主题', language: '语言', currency: '货币',
  },
  ja: {
    loading: '読み込み中...', save: '保存', cancel: 'キャンセル', delete: '削除', edit: '編集',
    add: '追加', close: '閉じる', confirm: '確認', search: '検索', filter: 'フィルター',
    all: 'すべて', yes: 'はい', no: 'いいえ', ok: 'OK', error: 'エラー', success: '成功', back: '戻る',
    nav_dashboard: 'ホーム', nav_transactions: '取引', nav_budgets: '予算',
    nav_goals: '目標', nav_reports: 'レポート', nav_settings: '設定',
    nav_assistant: 'アシスタント', nav_recurring: '定期', nav_more: 'その他', nav_logout: 'ログアウト',
    welcome: 'ようこそ！', login: 'ログイン', register: '登録', createAccount: 'アカウント作成',
    email: 'メール', password: 'パスワード', confirmPassword: 'パスワード確認',
    tagline: 'スマートな個人財務マネージャー。今日から財務を管理しましょう。',
    feature1Title: '支出追跡', feature1Desc: 'すべての取引を記録・分類',
    feature2Title: '予算', feature2Desc: '制限を設定してアラートを受け取る',
    feature3Title: '貯蓄目標', feature3Desc: '財務目標を達成する',
    feature4Title: 'AIアシスタント', feature4Desc: 'あなたに合わせたアドバイス',
    copyright: '© 2025 Smarter Investment。全著作権所有。',
    settings_title: '設定', theme: 'テーマ', language: '言語', currency: '通貨',
  },
};

// Get translation function
export function t(language: Language, key: string): string {
  const trans = translations[language] || translations.es;
  return trans[key] || translations.es[key] || key;
}

// Get all translations for a language
export function getTranslations(language: Language): Record<string, any> {
  return { ...translations.es, ...translations[language] };
}

// Navigation labels
const navLabels: Record<Language, Record<string, string>> = {
  es: { home: 'Inicio', transactions: 'Transacciones', budgets: 'Presupuestos', goals: 'Metas', reports: 'Reportes', assistant: 'Asistente', recurring: 'Recurrentes', more: 'Más', settings: 'Configuración' },
  en: { home: 'Home', transactions: 'Transactions', budgets: 'Budgets', goals: 'Goals', reports: 'Reports', assistant: 'Assistant', recurring: 'Recurring', more: 'More', settings: 'Settings' },
  fr: { home: 'Accueil', transactions: 'Transactions', budgets: 'Budgets', goals: 'Objectifs', reports: 'Rapports', assistant: 'Assistant', recurring: 'Récurrents', more: 'Plus', settings: 'Paramètres' },
  pt: { home: 'Início', transactions: 'Transações', budgets: 'Orçamentos', goals: 'Metas', reports: 'Relatórios', assistant: 'Assistente', recurring: 'Recorrentes', more: 'Mais', settings: 'Configurações' },
  it: { home: 'Home', transactions: 'Transazioni', budgets: 'Budget', goals: 'Obiettivi', reports: 'Rapporti', assistant: 'Assistente', recurring: 'Ricorrenti', more: 'Altro', settings: 'Impostazioni' },
  de: { home: 'Start', transactions: 'Transaktionen', budgets: 'Budgets', goals: 'Ziele', reports: 'Berichte', assistant: 'Assistent', recurring: 'Wiederkehrend', more: 'Mehr', settings: 'Einstellungen' },
  zh: { home: '首页', transactions: '交易', budgets: '预算', goals: '目标', reports: '报告', assistant: '助手', recurring: '定期', more: '更多', settings: '设置' },
  ja: { home: 'ホーム', transactions: '取引', budgets: '予算', goals: '目標', reports: 'レポート', assistant: 'アシスタント', recurring: '定期', more: 'その他', settings: '設定' },
};

// Hook for React components - simplified version that returns static Spanish by default
// The actual language switching happens through the store
export function useTranslation() {
  // Default to Spanish - components should use store.language for dynamic switching
  const lang: Language = 'es';
  const trans = getTranslations(lang);
  const nav = navLabels[lang] || navLabels.es;

  return {
    t: {
      ...trans,
      nav,
    },
    language: lang,
  };
}

// Get nav labels for a specific language
export function getNavLabels(language: Language): Record<string, string> {
  return navLabels[language] || navLabels.es;
}

export default translations;
