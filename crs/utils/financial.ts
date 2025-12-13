// ============================================
// 💰 FINANCIAL UTILITIES
// ============================================
import type { 
  Transaction, 
  Currency, 
  CategorySummary, 
  MonthlyData,
  FinancialSummary,
  ComparisonData,
  Budget,
  Goal,
  RecurringTransaction,
} from '../types';

// ========================================
// CURRENCY FORMATTING
// ========================================
const CURRENCY_CONFIG: Record<Currency, { locale: string; symbol: string }> = {
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  MXN: { locale: 'es-MX', symbol: '$' },
  COP: { locale: 'es-CO', symbol: '$' },
  ARS: { locale: 'es-AR', symbol: '$' },
  CLP: { locale: 'es-CL', symbol: '$' },
  PEN: { locale: 'es-PE', symbol: 'S/' },
};

export const formatCurrency = (
  amount: number,
  currency: Currency = 'USD',
  options?: { compact?: boolean }
): string => {
  const config = CURRENCY_CONFIG[currency];
  
  if (options?.compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    });
    return formatter.format(amount);
  }
  
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

// ========================================
// DATE UTILITIES
// ========================================
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const formats: Record<typeof format, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };
  
  return d.toLocaleDateString('es', formats[format]);
};

export const getMonthName = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { month: 'long' });
};

export const getMonthYear = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es', { month: 'short', year: 'numeric' });
};

export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isThisMonth = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
};

export const getDateRange = (period: 'week' | 'month' | 'year' | 'all'): { from: Date; to: Date } => {
  const to = new Date();
  const from = new Date();
  
  switch (period) {
    case 'week':
      from.setDate(to.getDate() - 7);
      break;
    case 'month':
      from.setMonth(to.getMonth() - 1);
      break;
    case 'year':
      from.setFullYear(to.getFullYear() - 1);
      break;
    case 'all':
      from.setFullYear(2000);
      break;
  }
  
  return { from, to };
};

// ========================================
// TRANSACTION CALCULATIONS
// ========================================
export const calculateTotal = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
};

export const filterByDateRange = (
  transactions: Transaction[],
  from: Date | string,
  to: Date | string
): Transaction[] => {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return date >= fromDate && date <= toDate;
  });
};

export const filterByMonth = (transactions: Transaction[], month?: Date): Transaction[] => {
  const targetMonth = month || new Date();
  return transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      date.getMonth() === targetMonth.getMonth() &&
      date.getFullYear() === targetMonth.getFullYear()
    );
  });
};

export const groupByCategory = (transactions: Transaction[]): Record<string, number> => {
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
};

export const calculateExpensesByCategory = (expenses: Transaction[]): Record<string, number> => {
  return groupByCategory(expenses);
};

export const getCategorySummary = (transactions: Transaction[]): CategorySummary[] => {
  const total = calculateTotal(transactions);
  const grouped = groupByCategory(transactions);
  
  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      count: transactions.filter((t) => t.category === category).length,
      avgTransaction: amount / transactions.filter((t) => t.category === category).length,
    }))
    .sort((a, b) => b.amount - a.amount);
};

// ========================================
// MONTHLY DATA
// ========================================
export const getMonthlyData = (
  expenses: Transaction[],
  incomes: Transaction[],
  months: number = 6
): MonthlyData[] => {
  const data: MonthlyData[] = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthExpenses = filterByMonth(expenses, date);
    const monthIncomes = filterByMonth(incomes, date);
    
    const income = calculateTotal(monthIncomes);
    const expense = calculateTotal(monthExpenses);
    
    data.push({
      month: getMonthYear(date),
      income,
      expenses: expense,
      balance: income - expense,
    });
  }
  
  return data;
};

// ========================================
// FINANCIAL SUMMARY
// ========================================
export const calculateFinancialSummary = (
  expenses: Transaction[],
  incomes: Transaction[],
  month?: Date
): FinancialSummary => {
  const monthExpenses = filterByMonth(expenses, month);
  const monthIncomes = filterByMonth(incomes, month);
  
  const totalIncome = calculateTotal(monthIncomes);
  const totalExpenses = calculateTotal(monthExpenses);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  const topCategories = getCategorySummary(monthExpenses).slice(0, 5);
  
  // Calculate trend vs previous month
  const prevMonth = new Date(month || new Date());
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevExpenses = filterByMonth(expenses, prevMonth);
  const prevTotal = calculateTotal(prevExpenses);
  
  const trendPercentage = prevTotal > 0 ? ((totalExpenses - prevTotal) / prevTotal) * 100 : 0;
  const trend = trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable';
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    savingsRate,
    topCategories,
    trend,
    trendPercentage,
  };
};

// ========================================
// COMPARISON
// ========================================
export const calculateComparison = (
  expenses: Transaction[],
  incomes: Transaction[]
): ComparisonData => {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  const currentExpenses = filterByMonth(expenses, today);
  const currentIncomes = filterByMonth(incomes, today);
  const prevExpenses = filterByMonth(expenses, lastMonth);
  const prevIncomes = filterByMonth(incomes, lastMonth);
  
  const current = {
    income: calculateTotal(currentIncomes),
    expenses: calculateTotal(currentExpenses),
    balance: calculateTotal(currentIncomes) - calculateTotal(currentExpenses),
  };
  
  const previous = {
    income: calculateTotal(prevIncomes),
    expenses: calculateTotal(prevExpenses),
    balance: calculateTotal(prevIncomes) - calculateTotal(prevExpenses),
  };
  
  const calcChange = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0;
  
  return {
    current,
    previous,
    percentageChange: {
      income: calcChange(current.income, previous.income),
      expenses: calcChange(current.expenses, previous.expenses),
      balance: calcChange(current.balance, previous.balance),
    },
  };
};

// ========================================
// BUDGET UTILITIES
// ========================================
export const getBudgetStatus = (
  budgets: Record<string, number>,
  expenses: Transaction[]
): Array<{ category: string; budget: number; spent: number; percentage: number; remaining: number }> => {
  const expensesByCategory = groupByCategory(filterByMonth(expenses));
  
  return Object.entries(budgets).map(([category, budget]) => {
    const spent = expensesByCategory[category] || 0;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const remaining = budget - spent;
    
    return { category, budget, spent, percentage, remaining };
  });
};

export const getBudgetAlerts = (
  budgets: Record<string, number>,
  expenses: Transaction[],
  threshold: number = 80
): Array<{ category: string; percentage: number; status: 'warning' | 'critical' | 'exceeded' }> => {
  const status = getBudgetStatus(budgets, expenses);
  
  return status
    .filter((b) => b.percentage >= threshold)
    .map((b) => ({
      category: b.category,
      percentage: b.percentage,
      status: b.percentage >= 100 ? 'exceeded' : b.percentage >= 90 ? 'critical' : 'warning',
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

// ========================================
// GOAL UTILITIES
// ========================================
export const getGoalProgress = (goal: Goal): number => {
  if (goal.targetAmount <= 0) return 0;
  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
};

export const getDaysUntilDeadline = (goal: Goal): number | null => {
  if (!goal.deadline) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(goal.deadline);
  deadline.setHours(0, 0, 0, 0);
  
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getRequiredMonthlySaving = (goal: Goal): number | null => {
  if (!goal.deadline || goal.isCompleted) return null;
  
  const remaining = goal.targetAmount - goal.currentAmount;
  const months = getDaysUntilDeadline(goal);
  
  if (!months || months <= 0) return remaining;
  return remaining / (months / 30);
};

// ========================================
// RECURRING UTILITIES
// ========================================
export const calculateNextDueDate = (
  frequency: string,
  fromDate: Date,
  dayOfMonth?: number
): Date => {
  const result = new Date(fromDate);
  
  switch (frequency) {
    case 'daily':
      result.setDate(result.getDate() + 1);
      break;
    case 'weekly':
      result.setDate(result.getDate() + 7);
      break;
    case 'biweekly':
      result.setDate(result.getDate() + 14);
      break;
    case 'monthly':
      result.setMonth(result.getMonth() + 1);
      if (dayOfMonth) {
        const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
        result.setDate(Math.min(dayOfMonth, maxDay));
      }
      break;
    case 'yearly':
      result.setFullYear(result.getFullYear() + 1);
      break;
  }
  
  return result;
};

export const getMonthlyRecurringTotal = (recurring: RecurringTransaction[]): number => {
  const frequencyMultipliers: Record<string, number> = {
    daily: 30,
    weekly: 4.33,
    biweekly: 2.17,
    monthly: 1,
    yearly: 1 / 12,
  };
  
  return recurring
    .filter((r) => r.isActive && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount * (frequencyMultipliers[r.frequency] || 1), 0);
};

// ========================================
// ANALYTICS
// ========================================
export const getSpendingTrend = (expenses: Transaction[], days: number = 30): number => {
  const now = new Date();
  const midpoint = new Date(now);
  midpoint.setDate(midpoint.getDate() - days / 2);
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  
  const firstHalf = expenses.filter((e) => {
    const date = new Date(e.date);
    return date >= start && date < midpoint;
  });
  
  const secondHalf = expenses.filter((e) => {
    const date = new Date(e.date);
    return date >= midpoint && date <= now;
  });
  
  const firstTotal = calculateTotal(firstHalf);
  const secondTotal = calculateTotal(secondHalf);
  
  if (firstTotal === 0) return secondTotal > 0 ? 100 : 0;
  return ((secondTotal - firstTotal) / firstTotal) * 100;
};

export const getDailyAverage = (expenses: Transaction[], days: number = 30): number => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  
  const filtered = expenses.filter((e) => new Date(e.date) >= start);
  return calculateTotal(filtered) / days;
};
