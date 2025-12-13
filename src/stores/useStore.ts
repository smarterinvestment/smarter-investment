// ============================================
// 🏪 GLOBAL STORE - ZUSTAND
// ============================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  User,
  Transaction,
  Budget,
  Goal,
  RecurringTransaction,
  Notification,
  Theme,
  Language,
  Currency,
  Page,
  Modal,
  TransactionFilters,
} from '../types';

// ========================================
// STORE INTERFACE
// ========================================
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  
  // Data
  expenses: Transaction[];
  incomes: Transaction[];
  budgets: Record<string, number>;
  budgetDetails: Budget[];
  goals: Goal[];
  recurringTransactions: RecurringTransaction[];
  notifications: Notification[];
  
  // UI
  isLoading: boolean;
  loadingMessage: string;
  activePage: Page;
  sidebarOpen: boolean;
  modalStack: Modal[];
  
  // Settings
  theme: Theme;
  language: Language;
  currency: Currency;
  
  // Filters
  transactionFilters: TransactionFilters;
}

interface AppActions {
  // Auth actions
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => void;
  
  // Transaction actions
  setExpenses: (expenses: Transaction[]) => void;
  setIncomes: (incomes: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string, type: 'expense' | 'income') => void;
  
  // Budget actions
  setBudgets: (budgets: Record<string, number>) => void;
  setBudgetDetails: (budgets: Budget[]) => void;
  updateBudget: (category: string, amount: number) => void;
  deleteBudget: (category: string) => void;
  
  // Goal actions
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number) => void;
  
  // Recurring actions
  setRecurringTransactions: (recurring: RecurringTransaction[]) => void;
  addRecurring: (recurring: RecurringTransaction) => void;
  updateRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  
  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  setLoading: (loading: boolean, message?: string) => void;
  setActivePage: (page: Page) => void;
  toggleSidebar: () => void;
  openModal: (modal: Modal) => void;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  
  // Settings actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  
  // Filter actions
  setTransactionFilters: (filters: Partial<TransactionFilters>) => void;
  clearTransactionFilters: () => void;
  
  // Reset
  resetStore: () => void;
}

type Store = AppState & AppActions;

// ========================================
// INITIAL STATE
// ========================================
const initialState: AppState = {
  // Auth
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  
  // Data
  expenses: [],
  incomes: [],
  budgets: {},
  budgetDetails: [],
  goals: [],
  recurringTransactions: [],
  notifications: [],
  
  // UI
  isLoading: false,
  loadingMessage: '',
  activePage: 'dashboard',
  sidebarOpen: false,
  modalStack: [],
  
  // Settings
  theme: 'dark',
  language: 'es',
  currency: 'USD',
  
  // Filters
  transactionFilters: {
    type: 'all',
  },
};

// ========================================
// STORE CREATION
// ========================================
export const useStore = create<Store>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // =====================================
      // AUTH ACTIONS
      // =====================================
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          state.isAuthLoading = false;
        }),

      setAuthLoading: (loading) =>
        set((state) => {
          state.isAuthLoading = loading;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.expenses = [];
          state.incomes = [];
          state.budgets = {};
          state.budgetDetails = [];
          state.goals = [];
          state.recurringTransactions = [];
          state.notifications = [];
        }),

      // =====================================
      // TRANSACTION ACTIONS
      // =====================================
      setExpenses: (expenses) =>
        set((state) => {
          state.expenses = expenses;
        }),

      setIncomes: (incomes) =>
        set((state) => {
          state.incomes = incomes;
        }),

      addTransaction: (transaction) =>
        set((state) => {
          if (transaction.type === 'expense') {
            state.expenses.unshift(transaction);
          } else {
            state.incomes.unshift(transaction);
          }
        }),

      updateTransaction: (id, updates) =>
        set((state) => {
          const expenseIndex = state.expenses.findIndex((e) => e.id === id);
          if (expenseIndex !== -1) {
            state.expenses[expenseIndex] = { ...state.expenses[expenseIndex], ...updates };
            return;
          }
          const incomeIndex = state.incomes.findIndex((i) => i.id === id);
          if (incomeIndex !== -1) {
            state.incomes[incomeIndex] = { ...state.incomes[incomeIndex], ...updates };
          }
        }),

      deleteTransaction: (id, type) =>
        set((state) => {
          if (type === 'expense') {
            state.expenses = state.expenses.filter((e) => e.id !== id);
          } else {
            state.incomes = state.incomes.filter((i) => i.id !== id);
          }
        }),

      // =====================================
      // BUDGET ACTIONS
      // =====================================
      setBudgets: (budgets) =>
        set((state) => {
          state.budgets = budgets;
        }),

      setBudgetDetails: (budgets) =>
        set((state) => {
          state.budgetDetails = budgets;
        }),

      updateBudget: (category, amount) =>
        set((state) => {
          state.budgets[category] = amount;
        }),

      deleteBudget: (category) =>
        set((state) => {
          delete state.budgets[category];
        }),

      // =====================================
      // GOAL ACTIONS
      // =====================================
      setGoals: (goals) =>
        set((state) => {
          state.goals = goals;
        }),

      addGoal: (goal) =>
        set((state) => {
          state.goals.unshift(goal);
        }),

      updateGoal: (id, updates) =>
        set((state) => {
          const index = state.goals.findIndex((g) => g.id === id);
          if (index !== -1) {
            state.goals[index] = { ...state.goals[index], ...updates };
          }
        }),

      deleteGoal: (id) =>
        set((state) => {
          state.goals = state.goals.filter((g) => g.id !== id);
        }),

      addContribution: (goalId, amount) =>
        set((state) => {
          const goal = state.goals.find((g) => g.id === goalId);
          if (goal) {
            goal.currentAmount += amount;
            if (goal.currentAmount >= goal.targetAmount) {
              goal.isCompleted = true;
              goal.completedAt = new Date();
            }
          }
        }),

      // =====================================
      // RECURRING ACTIONS
      // =====================================
      setRecurringTransactions: (recurring) =>
        set((state) => {
          state.recurringTransactions = recurring;
        }),

      addRecurring: (recurring) =>
        set((state) => {
          state.recurringTransactions.unshift(recurring);
        }),

      updateRecurring: (id, updates) =>
        set((state) => {
          const index = state.recurringTransactions.findIndex((r) => r.id === id);
          if (index !== -1) {
            state.recurringTransactions[index] = {
              ...state.recurringTransactions[index],
              ...updates,
            };
          }
        }),

      deleteRecurring: (id) =>
        set((state) => {
          state.recurringTransactions = state.recurringTransactions.filter(
            (r) => r.id !== id
          );
        }),

      // =====================================
      // NOTIFICATION ACTIONS
      // =====================================
      setNotifications: (notifications) =>
        set((state) => {
          state.notifications = notifications;
        }),

      addNotification: (notification) =>
        set((state) => {
          state.notifications.unshift(notification);
        }),

      markNotificationRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification) {
            notification.isRead = true;
          }
        }),

      markAllNotificationsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => {
            n.isRead = true;
          });
        }),

      deleteNotification: (id) =>
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = [];
        }),

      // =====================================
      // UI ACTIONS
      // =====================================
      setLoading: (loading, message = '') =>
        set((state) => {
          state.isLoading = loading;
          state.loadingMessage = message;
        }),

      setActivePage: (page) =>
        set((state) => {
          state.activePage = page;
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      openModal: (modal) =>
        set((state) => {
          state.modalStack.push(modal);
        }),

      closeModal: (id) =>
        set((state) => {
          if (id) {
            state.modalStack = state.modalStack.filter((m) => m.id !== id);
          } else {
            state.modalStack.pop();
          }
        }),

      closeAllModals: () =>
        set((state) => {
          state.modalStack = [];
        }),

      // =====================================
      // SETTINGS ACTIONS
      // =====================================
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
          // Apply theme to document
          applyTheme(theme);
        }),

      setLanguage: (language) =>
        set((state) => {
          state.language = language;
        }),

      setCurrency: (currency) =>
        set((state) => {
          state.currency = currency;
        }),

      // =====================================
      // FILTER ACTIONS
      // =====================================
      setTransactionFilters: (filters) =>
        set((state) => {
          state.transactionFilters = { ...state.transactionFilters, ...filters };
        }),

      clearTransactionFilters: () =>
        set((state) => {
          state.transactionFilters = { type: 'all' };
        }),

      // =====================================
      // RESET
      // =====================================
      resetStore: () => set(initialState),
    })),
    {
      name: 'smarter-investment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        currency: state.currency,
      }),
    }
  )
);

// ========================================
// THEME APPLICATION HELPER
// ========================================
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const body = document.body;
  
  // Remove all theme classes
  root.classList.remove('dark', 'theme-pink', 'theme-purple');
  body.classList.remove('bg-gradient-dark', 'bg-gradient-pink', 'bg-gradient-purple');
  
  // All themes are dark with black base
  root.classList.add('dark');
  
  // Apply new theme
  switch (theme) {
    case 'dark':
      body.style.background = 'radial-gradient(ellipse at center, #062a3a 0%, #000000 50%, #000000 100%)';
      break;
    case 'pink':
      root.classList.add('theme-pink');
      body.style.background = 'radial-gradient(ellipse at center, #3a0620 0%, #000000 50%, #000000 100%)';
      break;
    case 'purple':
      root.classList.add('theme-purple');
      body.style.background = 'radial-gradient(ellipse at center, #1a0630 0%, #000000 50%, #000000 100%)';
      break;
    default:
      body.style.background = 'radial-gradient(ellipse at center, #062a3a 0%, #000000 50%, #000000 100%)';
  }
};

// ========================================
// SELECTORS
// ========================================
export const selectTotalIncome = (state: AppState) =>
  state.incomes.reduce((sum, i) => sum + i.amount, 0);

export const selectTotalExpenses = (state: AppState) =>
  state.expenses.reduce((sum, e) => sum + e.amount, 0);

export const selectBalance = (state: AppState) =>
  selectTotalIncome(state) - selectTotalExpenses(state);

export const selectUnreadNotifications = (state: AppState) =>
  state.notifications.filter((n) => !n.isRead).length;

export const selectActiveGoals = (state: AppState) =>
  state.goals.filter((g) => !g.isCompleted);

export const selectActiveRecurring = (state: AppState) =>
  state.recurringTransactions.filter((r) => r.isActive);

// Get theme colors based on current theme
export const getThemeColors = (theme: Theme) => {
  switch (theme) {
    case 'pink':
      return {
        primary: '#ec4899',
        secondary: '#db2777',
        accent: '#be185d',
        glow: 'shadow-glow-pink',
      };
    case 'purple':
      return {
        primary: '#a855f7',
        secondary: '#9333ea',
        accent: '#7c3aed',
        glow: 'shadow-glow-purple',
      };
    default:
      return {
        primary: '#05BFDB',
        secondary: '#088395',
        accent: '#0A4D68',
        glow: 'shadow-glow',
      };
  }
};
