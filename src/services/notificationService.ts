// ============================================
// 🔔 NOTIFICATION SERVICE - SMART ALERTS
// Intelligent financial alerts and notifications
// ============================================
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Notification, Transaction, Budget, Goal } from '../types';

// Helper to get current user ID
const getUserId = (): string => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

export interface SmartAlert {
  type: 'budget_warning' | 'budget_exceeded' | 'goal_progress' | 'goal_completed' | 'unusual_spending' | 'low_balance' | 'savings_tip' | 'weekly_summary';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
  actionPage?: string;
  data?: Record<string, unknown>;
}

export const notificationService = {
  /**
   * Create a new notification in Firebase
   */
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'users', userId, 'notifications'), {
      ...notification,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const userId = getUserId();
    await updateDoc(doc(db, 'users', userId, 'notifications', id), {
      isRead: true,
      readAt: Timestamp.now(),
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    const userId = getUserId();
    const snapshot = await getDocs(
      query(collection(db, 'users', userId, 'notifications'), where('isRead', '==', false))
    );
    
    const batch = snapshot.docs.map(docSnap => 
      updateDoc(doc(db, 'users', userId, 'notifications', docSnap.id), {
        isRead: true,
        readAt: Timestamp.now(),
      })
    );
    
    await Promise.all(batch);
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    const userId = getUserId();
    await deleteDoc(doc(db, 'users', userId, 'notifications', id));
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    const userId = getUserId();
    const snapshot = await getDocs(
      query(collection(db, 'users', userId, 'notifications'), where('isRead', '==', true))
    );
    
    const batch = snapshot.docs.map(docSnap => 
      deleteDoc(doc(db, 'users', userId, 'notifications', docSnap.id))
    );
    
    await Promise.all(batch);
  },

  /**
   * Subscribe to notifications
   */
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    const userId = getUserId();
    return onSnapshot(
      query(
        collection(db, 'users', userId, 'notifications'),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        })) as Notification[];
        callback(notifications);
      }
    );
  },

  /**
   * Check budgets and generate alerts
   */
  checkBudgets(
    expenses: Transaction[],
    budgets: Budget[],
    currency: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    // Get current month expenses
    const now = new Date();
    const currentMonthExpenses = expenses.filter(e => {
      const expenseDate = e.date instanceof Date ? e.date : new Date(e.date);
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    });

    // Calculate spending per category
    const spendingByCategory: Record<string, number> = {};
    currentMonthExpenses.forEach(expense => {
      spendingByCategory[expense.category] = (spendingByCategory[expense.category] || 0) + expense.amount;
    });

    // Check each budget
    budgets.forEach(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 100) {
        alerts.push({
          type: 'budget_exceeded',
          priority: 'high',
          title: '¡Presupuesto excedido!',
          message: `Has superado tu límite de ${budget.category}: ${formatMoney(spent)} de ${formatMoney(budget.limit)}`,
          icon: '🔴',
          actionLabel: 'Ver presupuestos',
          actionPage: 'budgets',
          data: { category: budget.category, spent, limit: budget.limit, percentage }
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'budget_warning',
          priority: 'medium',
          title: 'Presupuesto casi agotado',
          message: `${budget.category}: ${percentage.toFixed(0)}% usado. Te quedan ${formatMoney(budget.limit - spent)}`,
          icon: '🟡',
          actionLabel: 'Ver detalles',
          actionPage: 'budgets',
          data: { category: budget.category, spent, limit: budget.limit, percentage }
        });
      } else if (percentage >= 50) {
        alerts.push({
          type: 'budget_warning',
          priority: 'low',
          title: 'Presupuesto al 50%',
          message: `${budget.category}: Has usado la mitad de tu presupuesto (${formatMoney(spent)}/${formatMoney(budget.limit)})`,
          icon: '🟢',
          actionLabel: 'Ver detalles',
          actionPage: 'budgets',
          data: { category: budget.category, spent, limit: budget.limit, percentage }
        });
      }
    });

    return alerts;
  },

  /**
   * Check goals and generate alerts
   */
  checkGoals(goals: Goal[], currency: string): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    goals.forEach(goal => {
      const targetAmount = Number(goal.targetAmount) || 0;
      const currentAmount = Number(goal.currentAmount) || 0;
      const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

      if (progress >= 100 && !goal.isCompleted) {
        alerts.push({
          type: 'goal_completed',
          priority: 'high',
          title: '🎉 ¡Meta alcanzada!',
          message: `¡Felicidades! Has completado tu meta "${goal.name}" de ${formatMoney(targetAmount)}`,
          icon: '🏆',
          actionLabel: 'Ver metas',
          actionPage: 'goals',
          data: { goalId: goal.id, goalName: goal.name, progress }
        });
      } else if (progress >= 75) {
        alerts.push({
          type: 'goal_progress',
          priority: 'low',
          title: '¡Casi lo logras!',
          message: `"${goal.name}" al ${progress.toFixed(0)}%. Te faltan ${formatMoney(targetAmount - currentAmount)}`,
          icon: '🚀',
          actionLabel: 'Aportar',
          actionPage: 'goals',
          data: { goalId: goal.id, goalName: goal.name, progress }
        });
      } else if (progress >= 50) {
        alerts.push({
          type: 'goal_progress',
          priority: 'low',
          title: 'A mitad de camino',
          message: `"${goal.name}" al ${progress.toFixed(0)}%. ¡Sigue así!`,
          icon: '💪',
          actionLabel: 'Ver progreso',
          actionPage: 'goals',
          data: { goalId: goal.id, goalName: goal.name, progress }
        });
      }

      // Check deadline
      if (goal.deadline) {
        const deadline = new Date(goal.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft <= 7 && daysLeft > 0 && progress < 100) {
          alerts.push({
            type: 'goal_progress',
            priority: 'high',
            title: 'Meta por vencer',
            message: `"${goal.name}" vence en ${daysLeft} días y estás al ${progress.toFixed(0)}%`,
            icon: '⏰',
            actionLabel: 'Aportar ahora',
            actionPage: 'goals',
            data: { goalId: goal.id, goalName: goal.name, daysLeft, progress }
          });
        }
      }
    });

    return alerts;
  },

  /**
   * Detect unusual spending patterns
   */
  detectUnusualSpending(
    expenses: Transaction[],
    currency: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    const now = new Date();
    
    // Get expenses for current and previous months
    const currentMonth = expenses.filter(e => {
      const date = e.date instanceof Date ? e.date : new Date(e.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const previousMonth = expenses.filter(e => {
      const date = e.date instanceof Date ? e.date : new Date(e.date);
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Calculate spending by category for both months
    const currentByCategory: Record<string, number> = {};
    const previousByCategory: Record<string, number> = {};

    currentMonth.forEach(e => {
      currentByCategory[e.category] = (currentByCategory[e.category] || 0) + e.amount;
    });

    previousMonth.forEach(e => {
      previousByCategory[e.category] = (previousByCategory[e.category] || 0) + e.amount;
    });

    // Compare categories
    Object.entries(currentByCategory).forEach(([category, currentAmount]) => {
      const previousAmount = previousByCategory[category] || 0;
      
      if (previousAmount > 0) {
        const increasePercent = ((currentAmount - previousAmount) / previousAmount) * 100;
        
        if (increasePercent >= 50 && currentAmount > 100) { // >50% increase and significant amount
          alerts.push({
            type: 'unusual_spending',
            priority: 'medium',
            title: 'Gasto inusual detectado',
            message: `${category}: ${formatMoney(currentAmount)} este mes (+${increasePercent.toFixed(0)}% vs mes anterior)`,
            icon: '📈',
            actionLabel: 'Ver transacciones',
            actionPage: 'transactions',
            data: { category, currentAmount, previousAmount, increasePercent }
          });
        }
      }
    });

    return alerts;
  },

  /**
   * Check balance and generate low balance alert
   */
  checkBalance(
    totalIncome: number,
    totalExpenses: number,
    currency: string
  ): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    if (balance < 0) {
      alerts.push({
        type: 'low_balance',
        priority: 'high',
        title: '⚠️ Balance negativo',
        message: `Has gastado ${formatMoney(Math.abs(balance))} más de lo que ganaste este mes`,
        icon: '🔴',
        actionLabel: 'Ver gastos',
        actionPage: 'transactions',
        data: { balance, savingsRate }
      });
    } else if (savingsRate < 10 && savingsRate >= 0) {
      alerts.push({
        type: 'low_balance',
        priority: 'medium',
        title: 'Ahorro bajo',
        message: `Tu tasa de ahorro es ${savingsRate.toFixed(1)}%. La meta ideal es 20%`,
        icon: '🟡',
        actionLabel: 'Tips de ahorro',
        actionPage: 'assistant',
        data: { balance, savingsRate }
      });
    } else if (savingsRate >= 20) {
      alerts.push({
        type: 'savings_tip',
        priority: 'low',
        title: '🌟 ¡Excelente ahorro!',
        message: `Estás ahorrando ${savingsRate.toFixed(1)}% de tus ingresos. ¡Sigue así!`,
        icon: '💪',
        data: { balance, savingsRate }
      });
    }

    return alerts;
  },

  /**
   * Generate weekly summary
   */
  generateWeeklySummary(
    expenses: Transaction[],
    incomes: Transaction[],
    currency: string
  ): SmartAlert | null {
    const formatMoney = (amount: number) => 
      new Intl.NumberFormat('es', { style: 'currency', currency }).format(amount);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get transactions from last week
    const weekExpenses = expenses.filter(e => {
      const date = e.date instanceof Date ? e.date : new Date(e.date);
      return date >= weekAgo && date <= now;
    });

    const weekIncomes = incomes.filter(i => {
      const date = i.date instanceof Date ? i.date : new Date(i.date);
      return date >= weekAgo && date <= now;
    });

    const totalWeekExpenses = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWeekIncomes = weekIncomes.reduce((sum, i) => sum + i.amount, 0);
    const weekBalance = totalWeekIncomes - totalWeekExpenses;

    // Find top category
    const categoryTotals: Record<string, number> = {};
    weekExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    
    const topCategory = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      type: 'weekly_summary',
      priority: 'low',
      title: '📊 Resumen semanal',
      message: `Esta semana: ${formatMoney(totalWeekIncomes)} ingresos, ${formatMoney(totalWeekExpenses)} gastos. ${
        weekBalance >= 0 ? `Ahorraste ${formatMoney(weekBalance)} 🎉` : `Déficit de ${formatMoney(Math.abs(weekBalance))} ⚠️`
      }${topCategory ? `. Mayor gasto: ${topCategory[0]} (${formatMoney(topCategory[1])})` : ''}`,
      icon: '📈',
      actionLabel: 'Ver reportes',
      actionPage: 'reports',
      data: { 
        weekIncomes: totalWeekIncomes, 
        weekExpenses: totalWeekExpenses, 
        weekBalance,
        topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
      }
    };
  },

  /**
   * Get all smart alerts for current financial state
   */
  getAllSmartAlerts(
    expenses: Transaction[],
    incomes: Transaction[],
    budgets: Budget[],
    goals: Goal[],
    currency: string
  ): SmartAlert[] {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const alerts: SmartAlert[] = [
      ...this.checkBudgets(expenses, budgets, currency),
      ...this.checkGoals(goals, currency),
      ...this.detectUnusualSpending(expenses, currency),
      ...this.checkBalance(totalIncome, totalExpenses, currency),
    ];

    // Add weekly summary if it's Sunday
    if (new Date().getDay() === 0) {
      const summary = this.generateWeeklySummary(expenses, incomes, currency);
      if (summary) alerts.push(summary);
    }

    // Sort by priority
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
};

export default notificationService;
