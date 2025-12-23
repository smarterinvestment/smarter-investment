// ============================================
// 🪝 USE FIREBASE DATA HOOK
// ============================================
import { useEffect, useCallback } from 'react';
import { useStore } from '../stores/useStore';
import { 
  transactionService, 
  budgetService, 
  goalService, 
  recurringService, 
  notificationService 
} from '../services/firebaseService';
import { showError } from '../lib/errorHandler';

export const useFirebaseData = () => {
  const { 
    user, 
    setExpenses, 
    setIncomes, 
    setBudgets, 
    setGoals, 
    setRecurringTransactions, 
    setNotifications,
    setLoading 
  } = useStore();

  // Load all data on mount
  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [transactions, budgets, goals, recurring, notifications] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll(),
        recurringService.getAll(),
        notificationService.getAll(),
      ]);

      setExpenses(transactions.expenses);
      setIncomes(transactions.incomes);
      setBudgets(budgets);
      setGoals(goals);
      setRecurringTransactions(recurring);
      setNotifications(notifications);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user, setExpenses, setIncomes, setBudgets, setGoals, setRecurringTransactions, setNotifications, setLoading]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const unsubscribers: (() => void)[] = [];

    try {
      // Subscribe to expenses
      unsubscribers.push(transactionService.subscribeToExpenses(setExpenses));
      
      // Subscribe to incomes
      unsubscribers.push(transactionService.subscribeToIncomes(setIncomes));
      
      // Subscribe to budgets
      unsubscribers.push(budgetService.subscribe(setBudgets));
      
      // Subscribe to goals
      unsubscribers.push(goalService.subscribe(setGoals));
      
      // Subscribe to recurring
      unsubscribers.push(recurringService.subscribe(setRecurringTransactions));
      
      // Subscribe to notifications
      unsubscribers.push(notificationService.subscribe(setNotifications));
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user, setExpenses, setIncomes, setBudgets, setGoals, setRecurringTransactions, setNotifications]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  return { reload: loadData };
};

// ============================================
// 🪝 USE TRANSACTIONS HOOK
// ============================================
export const useTransactions = () => {
  const { expenses, incomes, addTransaction, updateTransaction, deleteTransaction } = useStore();

  // Ensure arrays are never undefined
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  const add = async (transaction: any) => {
    try {
      const id = await transactionService.add(transaction);
      addTransaction({ ...transaction, id });
      return id;
    } catch (error) {
      showError('Error al agregar transacción');
      throw error;
    }
  };

  const update = async (id: string, type: 'expense' | 'income', data: any) => {
    try {
      await transactionService.update(id, type, data);
      updateTransaction(id, data);
    } catch (error) {
      showError('Error al actualizar transacción');
      throw error;
    }
  };

  const remove = async (id: string, type: 'expense' | 'income') => {
    try {
      await transactionService.delete(id, type);
      deleteTransaction(id, type);
    } catch (error) {
      showError('Error al eliminar transacción');
      throw error;
    }
  };

  return {
    expenses: safeExpenses,
    incomes: safeIncomes,
    all: [...safeExpenses, ...safeIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    add,
    update,
    remove,
  };
};

// ============================================
// 🪝 USE BUDGETS HOOK
// ============================================
export const useBudgets = () => {
  const { budgets, updateBudget, deleteBudget } = useStore();

  const update = async (category: string, amount: number) => {
    try {
      await budgetService.update(category, amount);
      updateBudget(category, amount);
    } catch (error) {
      showError('Error al actualizar presupuesto');
      throw error;
    }
  };

  const remove = async (category: string) => {
    try {
      await budgetService.delete(category);
      deleteBudget(category);
    } catch (error) {
      showError('Error al eliminar presupuesto');
      throw error;
    }
  };

  return {
    budgets,
    update,
    remove,
  };
};

// ============================================
// 🪝 USE GOALS HOOK
// ============================================
export const useGoals = () => {
  const { goals, addGoal, updateGoal, deleteGoal, addContribution } = useStore();

  // Ensure array is never undefined
  const safeGoals = Array.isArray(goals) ? goals : [];

  const add = async (goal: any) => {
    try {
      const id = await goalService.add(goal);
      addGoal({ ...goal, id });
      return id;
    } catch (error) {
      showError('Error al crear meta');
      throw error;
    }
  };

  const update = async (id: string, data: any) => {
    try {
      await goalService.update(id, data);
      updateGoal(id, data);
    } catch (error) {
      showError('Error al actualizar meta');
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await goalService.delete(id);
      deleteGoal(id);
    } catch (error) {
      showError('Error al eliminar meta');
      throw error;
    }
  };

  const contribute = async (id: string, amount: number) => {
    try {
      await goalService.addContribution(id, amount);
      addContribution(id, amount);
    } catch (error) {
      showError('Error al agregar aporte');
      throw error;
    }
  };

  return {
    goals: safeGoals,
    activeGoals: safeGoals.filter(g => !g.isCompleted),
    completedGoals: safeGoals.filter(g => g.isCompleted),
    add,
    update,
    remove,
    contribute,
  };
};

// ============================================
// 🪝 USE RECURRING HOOK
// ============================================
export const useRecurring = () => {
  const { recurringTransactions, addRecurring, updateRecurring, deleteRecurring } = useStore();

  // Ensure array is never undefined
  const safeRecurring = Array.isArray(recurringTransactions) ? recurringTransactions : [];

  const add = async (recurring: any) => {
    console.log('🔄 useRecurring.add called with:', recurring);
    try {
      const id = await recurringService.add(recurring);
      console.log('✅ useRecurring.add success, id:', id);
      addRecurring({ ...recurring, id });
      return id;
    } catch (error: any) {
      console.error('❌ useRecurring.add error:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      showError(`Error al crear transacción recurrente: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const update = async (id: string, data: any) => {
    console.log('🔄 useRecurring.update called:', id, data);
    try {
      await recurringService.update(id, data);
      updateRecurring(id, data);
    } catch (error: any) {
      console.error('❌ useRecurring.update error:', error);
      showError(`Error al actualizar: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  const remove = async (id: string) => {
    console.log('🔄 useRecurring.remove called:', id);
    try {
      await recurringService.delete(id);
      deleteRecurring(id);
    } catch (error: any) {
      console.error('❌ useRecurring.remove error:', error);
      showError(`Error al eliminar: ${error?.message || 'Unknown error'}`);
      throw error;
    }
  };

  return {
    recurring: safeRecurring,
    active: safeRecurring.filter(r => r.isActive),
    add,
    update,
    remove,
  };
};

// ============================================
// 🪝 USE NOTIFICATIONS HOOK
// ============================================
export const useNotifications = () => {
  const { notifications, addNotification, markNotificationRead, markAllNotificationsRead } = useStore();

  // Ensure array is never undefined
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      markNotificationRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllNotificationsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications: safeNotifications,
    unread: safeNotifications.filter(n => !n.isRead),
    unreadCount: safeNotifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead,
  };
};
