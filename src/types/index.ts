// ============================================
// 📦 TYPES - COMPLETE TYPE DEFINITIONS
// ============================================

// ========================================
// USER & AUTH
// ========================================
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency: Currency;
  language: Language;
  theme: Theme;
  notifications: NotificationSettings;
}

export type Currency = 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN';
export type Language = 'es' | 'en';
export type Theme = 'dark' | 'pink' | 'purple' | 'turquoise';

export interface NotificationSettings {
  enabled: boolean;
  budgetAlerts: boolean;
  budgetThreshold: number;
  goalProgress: boolean;
  weeklyReport: boolean;
  weeklyReportDay: WeekDay;
  recurringReminders: boolean;
  reminderDaysBefore: number;
  unusualExpenses: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// ========================================
// TRANSACTIONS
// ========================================
export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  isRecurring?: boolean;
  recurringId?: string;
  tags?: string[];
  attachments?: string[];
}

export interface TransactionFormData {
  type: 'expense' | 'income';
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
}

// ========================================
// CATEGORIES - Based on Excel Budget Structure
// ========================================
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  group: BudgetGroup;
  isCustom?: boolean;
}

// 6 Main Budget Groups (like in Excel)
export type BudgetGroup = 
  | 'ingresos'           // INGRESOS
  | 'gastos_esenciales'  // GASTOS ESENCIALES
  | 'gastos_discrecionales' // GASTOS DISCRECIONALES
  | 'pago_deudas'        // PAGO DE DEUDAS
  | 'ahorros'            // AHORROS
  | 'inversiones';       // INVERSIONES

export const BUDGET_GROUPS = {
  ingresos: { id: 'ingresos', name: 'Ingresos', icon: '💰', color: '#22C55E' },
  gastos_esenciales: { id: 'gastos_esenciales', name: 'Gastos Esenciales', icon: '🏠', color: '#3B82F6' },
  gastos_discrecionales: { id: 'gastos_discrecionales', name: 'Gastos Discrecionales', icon: '🎬', color: '#F59E0B' },
  pago_deudas: { id: 'pago_deudas', name: 'Pago de Deudas', icon: '💳', color: '#EF4444' },
  ahorros: { id: 'ahorros', name: 'Ahorros', icon: '🐷', color: '#8B5CF6' },
  inversiones: { id: 'inversiones', name: 'Inversiones', icon: '📈', color: '#14B8A6' },
};

// INGRESOS Categories
export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary1', name: 'Salario', icon: '💼', color: '#22C55E', type: 'income', group: 'ingresos' },
  { id: 'salary2', name: 'Salario 2', icon: '💵', color: '#16A34A', type: 'income', group: 'ingresos' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#15803D', type: 'income', group: 'ingresos' },
  { id: 'bonus', name: 'Bonos', icon: '🎁', color: '#166534', type: 'income', group: 'ingresos' },
  { id: 'other-income', name: 'Otros Ingresos', icon: '💰', color: '#14532D', type: 'income', group: 'ingresos' },
];

// GASTOS ESENCIALES Categories  
export const ESSENTIAL_EXPENSE_CATEGORIES: Category[] = [
  { id: 'vivienda', name: 'Vivienda', icon: '🏠', color: '#3B82F6', type: 'expense', group: 'gastos_esenciales' },
  { id: 'celular', name: 'Celular', icon: '📱', color: '#2563EB', type: 'expense', group: 'gastos_esenciales' },
  { id: 'seguro-carro', name: 'Seguro Carro', icon: '🚗', color: '#1D4ED8', type: 'expense', group: 'gastos_esenciales' },
  { id: 'gasolina', name: 'Gasolina y Aceite', icon: '⛽', color: '#1E40AF', type: 'expense', group: 'gastos_esenciales' },
  { id: 'alimentacion-casa', name: 'Alimentación Casa', icon: '🍽️', color: '#1E3A8A', type: 'expense', group: 'gastos_esenciales' },
  { id: 'servicios', name: 'Servicios', icon: '📄', color: '#3730A3', type: 'expense', group: 'gastos_esenciales' },
  { id: 'familia', name: 'Familia', icon: '👨‍👩‍👧', color: '#4338CA', type: 'expense', group: 'gastos_esenciales' },
];

// GASTOS DISCRECIONALES Categories
export const DISCRETIONARY_EXPENSE_CATEGORIES: Category[] = [
  { id: 'comida-calle', name: 'Comida Calle', icon: '🍔', color: '#F59E0B', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'salidas', name: 'Salidas', icon: '🎉', color: '#D97706', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'estudio', name: 'Estudio', icon: '📚', color: '#B45309', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'mecato', name: 'Mecato/Snacks', icon: '🍫', color: '#92400E', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'peluqueria', name: 'Peluquería', icon: '💇', color: '#78350F', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'suscripciones', name: 'Suscripciones', icon: '📺', color: '#F97316', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'cafe', name: 'Café', icon: '☕', color: '#EA580C', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎬', color: '#C2410C', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'ropa', name: 'Ropa', icon: '👕', color: '#9A3412', type: 'expense', group: 'gastos_discrecionales' },
  { id: 'otros-discrecional', name: 'Otros', icon: '📦', color: '#7C2D12', type: 'expense', group: 'gastos_discrecionales' },
];

// PAGO DE DEUDAS Categories
export const DEBT_CATEGORIES: Category[] = [
  { id: 'vehiculo', name: 'Vehículo', icon: '🚙', color: '#EF4444', type: 'expense', group: 'pago_deudas' },
  { id: 'tarjeta-credito', name: 'Tarjeta de Crédito', icon: '💳', color: '#DC2626', type: 'expense', group: 'pago_deudas' },
  { id: 'prestamo', name: 'Préstamo', icon: '🏦', color: '#B91C1C', type: 'expense', group: 'pago_deudas' },
  { id: 'hipoteca', name: 'Hipoteca', icon: '🏡', color: '#991B1B', type: 'expense', group: 'pago_deudas' },
  { id: 'otra-deuda', name: 'Otra Deuda', icon: '📋', color: '#7F1D1D', type: 'expense', group: 'pago_deudas' },
];

// AHORROS Categories
export const SAVINGS_CATEGORIES: Category[] = [
  { id: 'emergencias', name: 'Fondo Emergencias', icon: '🆘', color: '#8B5CF6', type: 'expense', group: 'ahorros' },
  { id: 'vacaciones', name: 'Vacaciones', icon: '✈️', color: '#7C3AED', type: 'expense', group: 'ahorros' },
  { id: 'retiro', name: 'Retiro', icon: '🏖️', color: '#6D28D9', type: 'expense', group: 'ahorros' },
  { id: 'meta-especial', name: 'Meta Especial', icon: '🎯', color: '#5B21B6', type: 'expense', group: 'ahorros' },
  { id: 'otro-ahorro', name: 'Otro Ahorro', icon: '💰', color: '#4C1D95', type: 'expense', group: 'ahorros' },
];

// INVERSIONES Categories
export const INVESTMENT_CATEGORIES: Category[] = [
  { id: 'acciones', name: 'Acciones', icon: '📊', color: '#14B8A6', type: 'expense', group: 'inversiones' },
  { id: 'crypto', name: 'Criptomonedas', icon: '₿', color: '#0D9488', type: 'expense', group: 'inversiones' },
  { id: 'fondos', name: 'Fondos', icon: '📈', color: '#0F766E', type: 'expense', group: 'inversiones' },
  { id: 'bienes-raices', name: 'Bienes Raíces', icon: '🏢', color: '#115E59', type: 'expense', group: 'inversiones' },
  { id: 'negocio', name: 'Negocio', icon: '🏪', color: '#134E4A', type: 'expense', group: 'inversiones' },
  { id: 'otra-inversion', name: 'Otra Inversión', icon: '💎', color: '#042F2E', type: 'expense', group: 'inversiones' },
];

// Combined for backwards compatibility - ALL expense categories
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  ...ESSENTIAL_EXPENSE_CATEGORIES,
  ...DISCRETIONARY_EXPENSE_CATEGORIES,
  ...DEBT_CATEGORIES,
  ...SAVINGS_CATEGORIES,
  ...INVESTMENT_CATEGORIES,
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = INCOME_CATEGORIES;

// All categories combined
export const ALL_CATEGORIES: Category[] = [
  ...INCOME_CATEGORIES,
  ...ESSENTIAL_EXPENSE_CATEGORIES,
  ...DISCRETIONARY_EXPENSE_CATEGORIES,
  ...DEBT_CATEGORIES,
  ...SAVINGS_CATEGORIES,
  ...INVESTMENT_CATEGORIES,
];

// Get categories by group
export const getCategoriesByGroup = (group: BudgetGroup): Category[] => {
  return ALL_CATEGORIES.filter(cat => cat.group === group);
};

// ========================================
// BUDGETS
// ========================================
export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  rollover?: boolean;
  alerts?: BudgetAlert[];
}

export interface BudgetAlert {
  threshold: number; // percentage
  triggered: boolean;
  triggeredAt?: Date;
}

export interface BudgetFormData {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

// ========================================
// GOALS
// ========================================
export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
  createdAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
  contributions?: GoalContribution[];
  autoSave?: AutoSaveConfig;
}

export interface GoalContribution {
  id: string;
  amount: number;
  date: Date;
  notes?: string;
}

export interface AutoSaveConfig {
  enabled: boolean;
  amount: number;
  frequency: RecurringFrequency;
}

export interface GoalFormData {
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
}

// ========================================
// RECURRING
// ========================================
export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  createdAt: Date;
  nextDueDate: Date;
  lastProcessedAt?: Date;
  endDate?: Date;
  reminderDays?: number;
}

export interface RecurringFormData {
  name: string;
  description: string;
  amount: number;
  category: string;
  type: 'expense' | 'income';
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate?: Date;
  endDate?: Date;
}

// ========================================
// NOTIFICATIONS
// ========================================
export type NotificationType = 
  | 'budget_warning'
  | 'budget_critical'
  | 'budget_exceeded'
  | 'goal_progress'
  | 'goal_completed'
  | 'recurring_due'
  | 'tip'
  | 'achievement'
  | 'weekly_report';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

// ========================================
// REPORTS & ANALYTICS
// ========================================
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  topCategories: CategorySummary[];
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  avgTransaction: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface ComparisonData {
  current: {
    income: number;
    expenses: number;
    balance: number;
  };
  previous: {
    income: number;
    expenses: number;
    balance: number;
  };
  percentageChange: {
    income: number;
    expenses: number;
    balance: number;
  };
}

// ========================================
// UI STATE
// ========================================
export interface UIState {
  isLoading: boolean;
  loadingMessage?: string;
  activePage: Page;
  sidebarOpen: boolean;
  modalStack: Modal[];
  theme: Theme;
  language: Language;
  currency: Currency;
}

export type Page = 
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'goals'
  | 'reports'
  | 'settings'
  | 'assistant'
  | 'recurring'
  | 'more';

export interface Modal {
  id: string;
  type: ModalType;
  props?: Record<string, unknown>;
}

export type ModalType = 
  | 'add-transaction'
  | 'edit-transaction'
  | 'add-budget'
  | 'edit-budget'
  | 'add-goal'
  | 'edit-goal'
  | 'add-recurring'
  | 'edit-recurring'
  | 'confirm-delete'
  | 'notifications'
  | 'settings'
  | 'export'
  | 'import';

// ========================================
// ASSISTANT
// ========================================
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  message: string;
}

// ========================================
// API RESPONSES
// ========================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ========================================
// FORM VALIDATION
// ========================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ========================================
// FILTERS & SORTING
// ========================================
export interface TransactionFilters {
  type?: 'expense' | 'income' | 'all';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// ========================================
// EXPORT/IMPORT
// ========================================
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    from: string;
    to: string;
  };
  includeCategories?: boolean;
  includeBudgets?: boolean;
  includeGoals?: boolean;
}
