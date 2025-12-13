// ============================================
// 🔥 FIREBASE SERVICE - DATA OPERATIONS
// ============================================
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Transaction, Budget, Goal, RecurringTransaction, Notification } from '../types';

// Helper to get current user ID
const getUserId = (): string => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// ============================================
// TRANSACTIONS
// ============================================
export const transactionService = {
  // Get all transactions (expenses + incomes)
  async getAll() {
    const userId = getUserId();
    const [expenses, incomes] = await Promise.all([
      getDocs(query(collection(db, 'users', userId, 'expenses'), orderBy('date', 'desc'))),
      getDocs(query(collection(db, 'users', userId, 'incomes'), orderBy('date', 'desc'))),
    ]);

    return {
      expenses: expenses.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'expense' })) as Transaction[],
      incomes: incomes.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'income' })) as Transaction[],
    };
  },

  // Add transaction
  async add(transaction: Omit<Transaction, 'id'>) {
    const userId = getUserId();
    const collectionName = transaction.type === 'expense' ? 'expenses' : 'incomes';
    const docRef = await addDoc(collection(db, 'users', userId, collectionName), {
      ...transaction,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update transaction
  async update(id: string, type: 'expense' | 'income', data: Partial<Transaction>) {
    const userId = getUserId();
    const collectionName = type === 'expense' ? 'expenses' : 'incomes';
    await updateDoc(doc(db, 'users', userId, collectionName, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete transaction
  async delete(id: string, type: 'expense' | 'income') {
    const userId = getUserId();
    const collectionName = type === 'expense' ? 'expenses' : 'incomes';
    await deleteDoc(doc(db, 'users', userId, collectionName, id));
  },

  // Subscribe to real-time updates
  subscribeToExpenses(callback: (expenses: Transaction[]) => void) {
    const userId = getUserId();
    return onSnapshot(
      query(collection(db, 'users', userId, 'expenses'), orderBy('date', 'desc')),
      (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'expense' as const }));
        callback(expenses as Transaction[]);
      }
    );
  },

  subscribeToIncomes(callback: (incomes: Transaction[]) => void) {
    const userId = getUserId();
    return onSnapshot(
      query(collection(db, 'users', userId, 'incomes'), orderBy('date', 'desc')),
      (snapshot) => {
        const incomes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'income' as const }));
        callback(incomes as Transaction[]);
      }
    );
  },
};

// ============================================
// BUDGETS
// ============================================
export const budgetService = {
  async getAll(): Promise<Record<string, number>> {
    const userId = getUserId();
    const snapshot = await getDoc(doc(db, 'users', userId, 'settings', 'budgets'));
    return snapshot.exists() ? snapshot.data() as Record<string, number> : {};
  },

  async update(category: string, amount: number) {
    const userId = getUserId();
    const budgetRef = doc(db, 'users', userId, 'settings', 'budgets');
    const snapshot = await getDoc(budgetRef);
    
    if (snapshot.exists()) {
      await updateDoc(budgetRef, { [category]: amount });
    } else {
      await addDoc(collection(db, 'users', userId, 'settings'), { [category]: amount });
    }
  },

  async delete(category: string) {
    const userId = getUserId();
    const budgetRef = doc(db, 'users', userId, 'settings', 'budgets');
    const snapshot = await getDoc(budgetRef);
    
    if (snapshot.exists()) {
      const budgets = snapshot.data() as Record<string, number>;
      delete budgets[category];
      await updateDoc(budgetRef, budgets);
    }
  },

  subscribe(callback: (budgets: Record<string, number>) => void) {
    const userId = getUserId();
    return onSnapshot(
      doc(db, 'users', userId, 'settings', 'budgets'),
      (snapshot) => {
        callback(snapshot.exists() ? snapshot.data() as Record<string, number> : {});
      }
    );
  },
};

// ============================================
// GOALS
// ============================================
export const goalService = {
  async getAll(): Promise<Goal[]> {
    const userId = getUserId();
    const snapshot = await getDocs(query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[];
  },

  async add(goal: Omit<Goal, 'id'>) {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'users', userId, 'goals'), {
      ...goal,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Goal>) {
    const userId = getUserId();
    await updateDoc(doc(db, 'users', userId, 'goals', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    const userId = getUserId();
    await deleteDoc(doc(db, 'users', userId, 'goals', id));
  },

  async addContribution(id: string, amount: number) {
    const userId = getUserId();
    const goalRef = doc(db, 'users', userId, 'goals', id);
    const snapshot = await getDoc(goalRef);
    
    if (snapshot.exists()) {
      const goal = snapshot.data() as Goal;
      const newAmount = (goal.currentAmount || 0) + amount;
      const isCompleted = newAmount >= goal.targetAmount;
      
      await updateDoc(goalRef, {
        currentAmount: newAmount,
        isCompleted,
        updatedAt: Timestamp.now(),
        ...(isCompleted ? { completedAt: Timestamp.now() } : {}),
      });
    }
  },

  subscribe(callback: (goals: Goal[]) => void) {
    const userId = getUserId();
    return onSnapshot(
      query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(goals as Goal[]);
      }
    );
  },
};

// ============================================
// RECURRING TRANSACTIONS
// ============================================
export const recurringService = {
  async getAll(): Promise<RecurringTransaction[]> {
    const userId = getUserId();
    const snapshot = await getDocs(query(collection(db, 'users', userId, 'recurring'), orderBy('nextDueDate', 'asc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecurringTransaction[];
  },

  async add(recurring: Omit<RecurringTransaction, 'id'>) {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'users', userId, 'recurring'), {
      ...recurring,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<RecurringTransaction>) {
    const userId = getUserId();
    await updateDoc(doc(db, 'users', userId, 'recurring', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string) {
    const userId = getUserId();
    await deleteDoc(doc(db, 'users', userId, 'recurring', id));
  },

  subscribe(callback: (recurring: RecurringTransaction[]) => void) {
    const userId = getUserId();
    return onSnapshot(
      query(collection(db, 'users', userId, 'recurring'), orderBy('nextDueDate', 'asc')),
      (snapshot) => {
        const recurring = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(recurring as RecurringTransaction[]);
      }
    );
  },
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const userId = getUserId();
    const snapshot = await getDocs(
      query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc'), limit(50))
    );
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
  },

  async add(notification: Omit<Notification, 'id'>) {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'users', userId, 'notifications'), {
      ...notification,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async markAsRead(id: string) {
    const userId = getUserId();
    await updateDoc(doc(db, 'users', userId, 'notifications', id), {
      isRead: true,
      readAt: Timestamp.now(),
    });
  },

  async markAllAsRead() {
    const userId = getUserId();
    const batch = writeBatch(db);
    const snapshot = await getDocs(
      query(collection(db, 'users', userId, 'notifications'), where('isRead', '==', false))
    );
    
    snapshot.docs.forEach(docSnapshot => {
      batch.update(docSnapshot.ref, { isRead: true, readAt: Timestamp.now() });
    });
    
    await batch.commit();
  },

  async delete(id: string) {
    const userId = getUserId();
    await deleteDoc(doc(db, 'users', userId, 'notifications', id));
  },

  subscribe(callback: (notifications: Notification[]) => void) {
    const userId = getUserId();
    return onSnapshot(
      query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc'), limit(50)),
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications as Notification[]);
      }
    );
  },
};

// ============================================
// USER SETTINGS
// ============================================
export const settingsService = {
  async get() {
    const userId = getUserId();
    const snapshot = await getDoc(doc(db, 'users', userId, 'settings', 'preferences'));
    return snapshot.exists() ? snapshot.data() : {};
  },

  async update(settings: Record<string, any>) {
    const userId = getUserId();
    const settingsRef = doc(db, 'users', userId, 'settings', 'preferences');
    const snapshot = await getDoc(settingsRef);
    
    if (snapshot.exists()) {
      await updateDoc(settingsRef, settings);
    } else {
      await addDoc(collection(db, 'users', userId, 'settings'), settings);
    }
  },

  subscribe(callback: (settings: Record<string, any>) => void) {
    const userId = getUserId();
    return onSnapshot(
      doc(db, 'users', userId, 'settings', 'preferences'),
      (snapshot) => {
        callback(snapshot.exists() ? snapshot.data() : {});
      }
    );
  },
};

// ============================================
// DATA EXPORT/IMPORT
// ============================================
export const dataService = {
  async exportAll() {
    const userId = getUserId();
    const [transactions, budgets, goals, recurring] = await Promise.all([
      transactionService.getAll(),
      budgetService.getAll(),
      goalService.getAll(),
      recurringService.getAll(),
    ]);

    return {
      exportDate: new Date().toISOString(),
      userId,
      data: {
        expenses: transactions.expenses,
        incomes: transactions.incomes,
        budgets,
        goals,
        recurring,
      },
    };
  },

  async deleteAllData() {
    const userId = getUserId();
    const batch = writeBatch(db);

    // Delete all subcollections
    const collections = ['expenses', 'incomes', 'goals', 'recurring', 'notifications'];
    
    for (const collName of collections) {
      const snapshot = await getDocs(collection(db, 'users', userId, collName));
      snapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
    }

    await batch.commit();
  },
};
