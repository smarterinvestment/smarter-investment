// ============================================
// 🔔 PUSH NOTIFICATION SERVICE
// Integrates with FCM and Smart Alerts
// ============================================
import { doc, setDoc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth, requestNotificationPermission, onForegroundMessage, showLocalNotification } from '../lib/firebase';
import type { SmartAlert } from './notificationService';

export interface PushNotificationSettings {
  enabled: boolean;
  budgetAlerts: boolean;
  goalAlerts: boolean;
  weeklyReport: boolean;
  unusualSpending: boolean;
  billReminders: boolean;
  lowBalance: boolean;
}

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: true,
  budgetAlerts: true,
  goalAlerts: true,
  weeklyReport: true,
  unusualSpending: true,
  billReminders: true,
  lowBalance: true,
};

export const pushNotificationService = {
  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Request permission and get token
      const token = await requestNotificationPermission();
      
      if (token && auth.currentUser) {
        // Save token to Firestore for the user
        await this.saveToken(token);
        
        // Set up foreground message handler
        onForegroundMessage((payload) => {
          const title = payload.notification?.title || 'Smarter Investment';
          const body = payload.notification?.body || '';
          showLocalNotification(title, body);
        });
        
        console.log('✅ Push notifications initialized');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  },

  /**
   * Save FCM token to Firestore
   */
  async saveToken(token: string): Promise<void> {
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'settings', 'push'), {
        fcmToken: token,
        updatedAt: Timestamp.now(),
        platform: 'web',
        userAgent: navigator.userAgent,
      }, { merge: true });
      
      console.log('✅ FCM token saved');
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  },

  /**
   * Get notification settings
   */
  async getSettings(): Promise<PushNotificationSettings> {
    if (!auth.currentUser) return DEFAULT_SETTINGS;

    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'notifications');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...docSnap.data() } as PushNotificationSettings;
      }
      
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update notification settings
   */
  async updateSettings(settings: Partial<PushNotificationSettings>): Promise<void> {
    if (!auth.currentUser) return;

    try {
      await setDoc(
        doc(db, 'users', auth.currentUser.uid, 'settings', 'notifications'),
        { ...settings, updatedAt: Timestamp.now() },
        { merge: true }
      );
      
      console.log('✅ Notification settings updated');
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  },

  /**
   * Schedule a notification (stored for Cloud Function to process)
   */
  async scheduleNotification(
    notification: {
      title: string;
      body: string;
      type: string;
      priority: 'high' | 'medium' | 'low';
      data?: Record<string, unknown>;
      scheduledFor?: Date;
    }
  ): Promise<string | null> {
    if (!auth.currentUser) return null;

    try {
      const docRef = await addDoc(
        collection(db, 'users', auth.currentUser.uid, 'scheduled-notifications'),
        {
          ...notification,
          createdAt: Timestamp.now(),
          scheduledFor: notification.scheduledFor 
            ? Timestamp.fromDate(notification.scheduledFor) 
            : Timestamp.now(),
          sent: false,
        }
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  /**
   * Send smart alert as push notification
   */
  async sendSmartAlert(alert: SmartAlert): Promise<void> {
    const settings = await this.getSettings();
    
    // Check if this type of alert is enabled
    const shouldSend = this.shouldSendAlert(alert.type, settings);
    
    if (!shouldSend) {
      console.log('⏭️ Alert skipped (disabled in settings):', alert.type);
      return;
    }

    // For high priority, show immediately via local notification
    if (alert.priority === 'high') {
      showLocalNotification(alert.title, alert.message, '/logo-smarter.jpg');
    }

    // Also schedule for Cloud Function processing
    await this.scheduleNotification({
      title: alert.title,
      body: alert.message,
      type: alert.type,
      priority: alert.priority,
      data: alert.data,
    });
  },

  /**
   * Check if alert type should be sent based on settings
   */
  shouldSendAlert(type: string, settings: PushNotificationSettings): boolean {
    if (!settings.enabled) return false;

    switch (type) {
      case 'budget_warning':
      case 'budget_exceeded':
        return settings.budgetAlerts;
      case 'goal_progress':
      case 'goal_completed':
        return settings.goalAlerts;
      case 'unusual_spending':
        return settings.unusualSpending;
      case 'low_balance':
        return settings.lowBalance;
      case 'weekly_summary':
        return settings.weeklyReport;
      case 'bill_reminder':
        return settings.billReminders;
      default:
        return true;
    }
  },

  /**
   * Send budget alert
   */
  async sendBudgetAlert(category: string, percentage: number, spent: number, limit: number): Promise<void> {
    const title = percentage >= 100 ? '🔴 ¡Presupuesto excedido!' : '🟡 Presupuesto casi agotado';
    const body = percentage >= 100
      ? `Has superado tu límite de ${category}`
      : `${category}: ${percentage.toFixed(0)}% usado`;

    await this.sendSmartAlert({
      type: percentage >= 100 ? 'budget_exceeded' : 'budget_warning',
      priority: percentage >= 100 ? 'high' : 'medium',
      title,
      message: body,
      icon: percentage >= 100 ? '🔴' : '🟡',
      actionLabel: 'Ver presupuestos',
      actionPage: 'budgets',
      data: { category, percentage, spent, limit },
    });
  },

  /**
   * Send goal milestone alert
   */
  async sendGoalAlert(goalName: string, progress: number, isCompleted: boolean): Promise<void> {
    const title = isCompleted ? '🎉 ¡Meta alcanzada!' : '🚀 ¡Casi lo logras!';
    const body = isCompleted
      ? `¡Felicidades! Has completado tu meta "${goalName}"`
      : `"${goalName}" al ${progress.toFixed(0)}%. ¡Ya casi!`;

    await this.sendSmartAlert({
      type: isCompleted ? 'goal_completed' : 'goal_progress',
      priority: isCompleted ? 'high' : 'low',
      title,
      message: body,
      icon: isCompleted ? '🏆' : '🚀',
      actionLabel: 'Ver metas',
      actionPage: 'goals',
      data: { goalName, progress },
    });
  },

  /**
   * Send low balance alert
   */
  async sendLowBalanceAlert(balance: number, savingsRate: number): Promise<void> {
    const isNegative = balance < 0;
    const title = isNegative ? '⚠️ Balance negativo' : '🟡 Ahorro bajo';
    const body = isNegative
      ? `Has gastado más de lo que ganaste este mes`
      : `Tu tasa de ahorro es ${savingsRate.toFixed(1)}%`;

    await this.sendSmartAlert({
      type: 'low_balance',
      priority: isNegative ? 'high' : 'medium',
      title,
      message: body,
      icon: isNegative ? '🔴' : '🟡',
      actionLabel: 'Ver finanzas',
      actionPage: 'dashboard',
      data: { balance, savingsRate },
    });
  },

  /**
   * Send unusual spending alert
   */
  async sendUnusualSpendingAlert(
    category: string, 
    currentAmount: number, 
    previousAmount: number, 
    increasePercent: number
  ): Promise<void> {
    await this.sendSmartAlert({
      type: 'unusual_spending',
      priority: 'medium',
      title: '📈 Gasto inusual detectado',
      message: `${category}: +${increasePercent.toFixed(0)}% vs mes anterior`,
      icon: '📈',
      actionLabel: 'Ver transacciones',
      actionPage: 'transactions',
      data: { category, currentAmount, previousAmount, increasePercent },
    });
  },

  /**
   * Send weekly summary
   */
  async sendWeeklySummary(
    weekIncome: number, 
    weekExpenses: number, 
    weekBalance: number,
    topCategory?: { name: string; amount: number }
  ): Promise<void> {
    const emoji = weekBalance >= 0 ? '🎉' : '⚠️';
    const balanceText = weekBalance >= 0 
      ? `Ahorraste ${Math.abs(weekBalance).toFixed(0)}` 
      : `Déficit de ${Math.abs(weekBalance).toFixed(0)}`;

    await this.sendSmartAlert({
      type: 'weekly_summary',
      priority: 'low',
      title: '📊 Resumen semanal',
      message: `${balanceText} ${emoji}${topCategory ? `. Mayor gasto: ${topCategory.name}` : ''}`,
      icon: '📈',
      actionLabel: 'Ver reportes',
      actionPage: 'reports',
      data: { weekIncome, weekExpenses, weekBalance, topCategory },
    });
  },

  /**
   * Check and send all relevant alerts
   */
  async checkAndSendAlerts(
    totalIncome: number,
    totalExpenses: number,
    budgets: Record<string, number>,
    expenses: Array<{ category: string; amount: number }>,
    goals: Array<{ name: string; currentAmount: number; targetAmount: number; isCompleted?: boolean }>
  ): Promise<void> {
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Check low balance
    if (balance < 0 || savingsRate < 10) {
      await this.sendLowBalanceAlert(balance, savingsRate);
    }

    // Check budgets
    const spendingByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + e.amount;
    });

    for (const [category, limit] of Object.entries(budgets)) {
      const spent = spendingByCategory[category] || 0;
      const percentage = (spent / limit) * 100;
      
      if (percentage >= 80) {
        await this.sendBudgetAlert(category, percentage, spent, limit);
      }
    }

    // Check goals
    for (const goal of goals) {
      const progress = goal.targetAmount > 0 
        ? (goal.currentAmount / goal.targetAmount) * 100 
        : 0;
      
      if (progress >= 100 && !goal.isCompleted) {
        await this.sendGoalAlert(goal.name, progress, true);
      } else if (progress >= 75 && progress < 100) {
        await this.sendGoalAlert(goal.name, progress, false);
      }
    }
  },
};

export default pushNotificationService;
