// ============================================
// 🔥 FIREBASE SERVICE - DATA OPERATIONS
// ============================================
import {
  collection,
  doc,
  addDoc,
  setDoc,
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
      // Use setDoc with merge to create document if not exists
      await setDoc(budgetRef, { [category]: amount }, { merge: true });
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
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        targetAmount: Number(data.targetAmount) || 0,
        currentAmount: Number(data.currentAmount) || 0,
        deadline: data.deadline || undefined,
        icon: data.icon || '🎯',
        color: data.color || '#05BFDB',
        description: data.description || '',
        isCompleted: Boolean(data.isCompleted),
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    }) as Goal[];
  },

  async add(goal: Omit<Goal, 'id'>) {
    const userId = getUserId();
    const docRef = await addDoc(collection(db, 'users', userId, 'goals'), {
      name: goal.name,
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0,
      deadline: goal.deadline || null,
      icon: goal.icon || '🎯',
      color: goal.color || '#05BFDB',
      description: goal.description || '',
      isCompleted: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Goal>) {
    const userId = getUserId();
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.targetAmount !== undefined) updateData.targetAmount = Number(data.targetAmount) || 0;
    if (data.currentAmount !== undefined) updateData.currentAmount = Number(data.currentAmount) || 0;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
    
    await updateDoc(doc(db, 'users', userId, 'goals', id), updateData);
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
      const goal = snapshot.data();
      const currentAmount = Number(goal.currentAmount) || 0;
      const targetAmount = Number(goal.targetAmount) || 0;
      const newAmount = currentAmount + Number(amount);
      const isCompleted = newAmount >= targetAmount;
      
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
        const goals = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            targetAmount: Number(data.targetAmount) || 0,
            currentAmount: Number(data.currentAmount) || 0,
            deadline: data.deadline || undefined,
            icon: data.icon || '🎯',
            color: data.color || '#05BFDB',
            description: data.description || '',
            isCompleted: Boolean(data.isCompleted),
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };
        });
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
    // Removed orderBy to avoid index requirement
    const snapshot = await getDocs(collection(db, 'users', userId, 'recurring-expenses'));
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Timestamp to Date string for consistent handling
        nextDueDate: data.nextDueDate?.toDate?.() 
          ? data.nextDueDate.toDate().toISOString() 
          : data.nextDueDate,
      };
    }) as RecurringTransaction[];
    // Sort in JavaScript instead
    return items.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  },

  async add(recurring: Omit<RecurringTransaction, 'id'>) {
    const userId = getUserId();
    console.log('📝 Adding recurring transaction:', recurring);
    
    // Ensure nextDueDate is properly formatted
    let nextDueDate: any = recurring.nextDueDate;
    if (nextDueDate instanceof Date) {
      nextDueDate = Timestamp.fromDate(nextDueDate);
    } else if (typeof nextDueDate === 'string') {
      nextDueDate = Timestamp.fromDate(new Date(nextDueDate));
    }
    
    const dataToSave = {
      name: recurring.name || '',
      description: recurring.description || '',
      amount: recurring.amount || 0,
      category: recurring.category || '',
      type: recurring.type || 'expense',
      frequency: recurring.frequency || 'monthly',
      dayOfMonth: recurring.dayOfMonth || 1,
      dayOfWeek: recurring.dayOfWeek || 1,
      isActive: recurring.isActive !== false,
      reminderDays: recurring.reminderDays || 3,
      nextDueDate: nextDueDate,
      createdAt: Timestamp.now(),
    };
    
    console.log('💾 Data to save:', dataToSave);
    
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'recurring-expenses'), dataToSave);
      console.log('✅ Recurring added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding recurring:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<RecurringTransaction>) {
    const userId = getUserId();
    console.log('📝 Updating recurring:', id, data);
    
    // Convert Date to Timestamp if present
    const updateData: any = { ...data };
    if (updateData.nextDueDate) {
      if (updateData.nextDueDate instanceof Date) {
        updateData.nextDueDate = Timestamp.fromDate(updateData.nextDueDate);
      } else if (typeof updateData.nextDueDate === 'string') {
        updateData.nextDueDate = Timestamp.fromDate(new Date(updateData.nextDueDate));
      }
    }
    
    updateData.updatedAt = Timestamp.now();
    
    try {
      await updateDoc(doc(db, 'users', userId, 'recurring-expenses', id), updateData);
      console.log('✅ Recurring updated');
    } catch (error) {
      console.error('❌ Error updating recurring:', error);
      throw error;
    }
  },

  async delete(id: string) {
    const userId = getUserId();
    console.log('🗑️ Deleting recurring:', id);
    try {
      await deleteDoc(doc(db, 'users', userId, 'recurring-expenses', id));
      console.log('✅ Recurring deleted');
    } catch (error) {
      console.error('❌ Error deleting recurring:', error);
      throw error;
    }
  },

  subscribe(callback: (recurring: RecurringTransaction[]) => void) {
    const userId = getUserId();
    // Removed orderBy to avoid index requirement
    return onSnapshot(
      collection(db, 'users', userId, 'recurring-expenses'),
      (snapshot) => {
        const recurring = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Convert Timestamp to Date string
            nextDueDate: data.nextDueDate?.toDate?.() 
              ? data.nextDueDate.toDate().toISOString() 
              : data.nextDueDate,
          };
        });
        // Sort in JavaScript
        recurring.sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
        callback(recurring as RecurringTransaction[]);
      },
      (error) => {
        console.error('❌ Error in recurring subscription:', error);
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
    const collections = ['expenses', 'incomes', 'goals', 'recurring-expenses', 'notifications'];
    
    for (const collName of collections) {
      const snapshot = await getDocs(collection(db, 'users', userId, collName));
      snapshot.docs.forEach(docSnapshot => {
        batch.delete(docSnapshot.ref);
      });
    }

    await batch.commit();
  },
};
