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
export type Theme = 'dark' | 'light' | 'pink' | 'purple' | 'system';

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
// CATEGORIES
// ========================================
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  isCustom?: boolean;
}

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentación', icon: '🍔', color: '#F59E0B', type: 'expense' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#3B82F6', type: 'expense' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '🎬', color: '#8B5CF6', type: 'expense' },
  { id: 'health', name: 'Salud', icon: '💊', color: '#EF4444', type: 'expense' },
  { id: 'education', name: 'Educación', icon: '📚', color: '#10B981', type: 'expense' },
  { id: 'shopping', name: 'Compras', icon: '🛒', color: '#EC4899', type: 'expense' },
  { id: 'bills', name: 'Servicios', icon: '📄', color: '#6366F1', type: 'expense' },
  { id: 'home', name: 'Hogar', icon: '🏠', color: '#14B8A6', type: 'expense' },
  { id: 'subscriptions', name: 'Suscripciones', icon: '📺', color: '#F97316', type: 'expense' },
  { id: 'other', name: 'Otros', icon: '📦', color: '#6B7280', type: 'expense' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salario', icon: '💼', color: '#22C55E', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#3B82F6', type: 'income' },
  { id: 'investments', name: 'Inversiones', icon: '📈', color: '#8B5CF6', type: 'income' },
  { id: 'sales', name: 'Ventas', icon: '🏷️', color: '#F59E0B', type: 'income' },
  { id: 'gifts', name: 'Regalos', icon: '🎁', color: '#EC4899', type: 'income' },
  { id: 'refunds', name: 'Reembolsos', icon: '💰', color: '#14B8A6', type: 'income' },
  { id: 'other-income', name: 'Otros Ingresos', icon: '💵', color: '#6B7280', type: 'income' },
];

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
  | 'assistant';

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
