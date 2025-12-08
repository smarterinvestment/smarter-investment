// ========================================
// 🔥 FIREBASE-DB.JS - Operaciones de Base de Datos
// ========================================

// ========== CARGAR DATOS ==========

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Cargar gastos
        const expensesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').orderBy('date', 'desc').get();
        expenses = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Cargar ingresos
        const incomesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').orderBy('date', 'desc').get();
        incomeHistory = incomesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calcular income summary
        income = { salary: 0, freelance: 0, investments: 0 };
        incomeHistory.forEach(inc => {
            const cat = (inc.category || '').toLowerCase();
            if (cat.includes('salario') || cat.includes('salary')) {
                income.salary += inc.amount || 0;
            } else if (cat.includes('freelance') || cat.includes('extra')) {
                income.freelance += inc.amount || 0;
            } else if (cat.includes('inversion') || cat.includes('investment')) {
                income.investments += inc.amount || 0;
            }
        });
        
        // Cargar metas
        const goalsSnap = await db.collection('users').doc(currentUser.uid)
            .collection('goals').get();
        goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Cargar presupuestos
        const budgetsDoc = await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').get();
        if (budgetsDoc.exists) {
            budgets = { ...budgets, ...budgetsDoc.data() };
        }
        
        console.log('✅ Datos cargados:', { expenses: expenses.length, incomes: incomeHistory.length, goals: goals.length });
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

async function loadExpenses() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('expenses').get();
    expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return expenses;
}

async function loadIncome() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('incomes').get();
    incomeHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return incomeHistory;
}

async function loadGoals() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('goals').get();
    goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return goals;
}

async function loadBudgets() {
    const doc = await db.collection('users').doc(currentUser.uid).collection('settings').doc('budgets').get();
    if (doc.exists) {
        budgets = { ...budgets, ...doc.data() };
    }
    return budgets;
}

// ========== GASTOS ==========

async function addExpense(expense) {
    if (!currentUser) return;
    
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').add({
                ...expense,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        expenses.unshift({ id: docRef.id, ...expense });
        render();
        showToast('Gasto agregado', 'success');
        
        // Verificar alertas de presupuesto
        if (typeof checkBudgetAlerts === 'function') {
            checkBudgetAlerts(expense.category);
        }
    } catch (error) {
        console.error('Error agregando gasto:', error);
        showToast('Error al agregar gasto', 'error');
    }
}

async function deleteExpense(id) {
    if (!currentUser || !confirm('¿Eliminar este gasto?')) return;
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('expenses').doc(id).delete();
        
        expenses = expenses.filter(e => e.id !== id);
        render();
        showToast('Gasto eliminado', 'success');
    } catch (error) {
        console.error('Error eliminando gasto:', error);
        showToast('Error al eliminar', 'error');
    }
}

// ========== INGRESOS ==========

async function addIncome(incomeEntry) {
    if (!currentUser) return;
    
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').add({
                ...incomeEntry,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        incomeHistory.unshift({ id: docRef.id, ...incomeEntry });
        
        // Actualizar resumen de ingresos
        const cat = (incomeEntry.category || '').toLowerCase();
        if (cat.includes('salario')) income.salary += incomeEntry.amount;
        else if (cat.includes('freelance')) income.freelance += incomeEntry.amount;
        else if (cat.includes('inversion')) income.investments += incomeEntry.amount;
        
        render();
        showToast('Ingreso agregado', 'success');
    } catch (error) {
        console.error('Error agregando ingreso:', error);
        showToast('Error al agregar ingreso', 'error');
    }
}

async function deleteIncome(id) {
    if (!currentUser || !confirm('¿Eliminar este ingreso?')) return;
    
    try {
        // Encontrar el ingreso para actualizar el resumen
        const incomeToDelete = incomeHistory.find(i => i.id === id);
        
        await db.collection('users').doc(currentUser.uid)
            .collection('incomes').doc(id).delete();
        
        incomeHistory = incomeHistory.filter(i => i.id !== id);
        
        // Actualizar resumen
        if (incomeToDelete) {
            const cat = (incomeToDelete.category || '').toLowerCase();
            if (cat.includes('salario')) income.salary -= incomeToDelete.amount;
            else if (cat.includes('freelance')) income.freelance -= incomeToDelete.amount;
            else if (cat.includes('inversion')) income.investments -= incomeToDelete.amount;
        }
        
        render();
        showToast('Ingreso eliminado', 'success');
    } catch (error) {
        console.error('Error eliminando ingreso:', error);
        showToast('Error al eliminar', 'error');
    }
}

// ========== METAS ==========

async function addGoal(goal) {
    if (!currentUser) return;
    
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('goals').add({
                ...goal,
                current: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        goals.push({ id: docRef.id, ...goal, current: 0 });
        render();
        showToast('Meta creada', 'success');
    } catch (error) {
        console.error('Error creando meta:', error);
        showToast('Error al crear meta', 'error');
    }
}

async function deleteGoal(id) {
    if (!currentUser || !confirm('¿Eliminar esta meta?')) return;
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('goals').doc(id).delete();
        
        goals = goals.filter(g => g.id !== id);
        render();
        showToast('Meta eliminada', 'success');
    } catch (error) {
        console.error('Error eliminando meta:', error);
    }
}

async function addMoneyToGoal(goalId, amount) {
    if (!currentUser) return;
    
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newAmount = (goal.current || 0) + amount;
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('goals').doc(goalId).update({ current: newAmount });
        
        goal.current = newAmount;
        render();
        
        if (newAmount >= goal.target) {
            showToast('🎉 ¡Meta completada!', 'success');
        } else {
            showToast('Ahorro agregado', 'success');
        }
    } catch (error) {
        console.error('Error actualizando meta:', error);
    }
}

// ========== PRESUPUESTOS ==========

async function updateBudget(category, amount) {
    if (!currentUser) return;
    
    try {
        budgets[category] = amount;
        
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        
        render();
        showToast('Presupuesto actualizado', 'success');
    } catch (error) {
        console.error('Error actualizando presupuesto:', error);
    }
}

// ========== TUTORIAL ==========

async function saveTutorialStatus() {
    if (!currentUser) return;
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('tutorial').set({
                completed: tutorialCompleted,
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
    } catch (error) {
        console.error('Error guardando estado tutorial:', error);
    }
}

async function loadTutorialStatus() {
    if (!currentUser) return;
    
    try {
        const doc = await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('tutorial').get();
        
        if (doc.exists) {
            tutorialCompleted = doc.data().completed || false;
        }
    } catch (error) {
        console.error('Error cargando estado tutorial:', error);
    }
}

// ========== RECURRENTES ==========

async function loadRecurringFromFirebase() {
    if (!currentUser) return [];
    
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('recurring').get();
        
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (typeof recurringModule !== 'undefined' && recurringModule) {
            recurringModule.recurringExpenses = list;
        }
        
        console.log('✅ Recurrentes cargados:', list.length);
        return list;
    } catch (error) {
        console.error('Error cargando recurrentes:', error);
        return [];
    }
}

async function toggleRecurring(id) {
    if (!currentUser) return;
    
    try {
        const docRef = db.collection('users').doc(currentUser.uid).collection('recurring').doc(id);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const currentActive = doc.data().active;
            await docRef.update({ active: !currentActive });
            await loadRecurringFromFirebase();
            refreshRecurringView();
            showToast(currentActive ? 'Gasto pausado' : 'Gasto activado', 'success');
        }
    } catch (error) {
        console.error('Error toggling recurring:', error);
    }
}

async function deleteRecurring(id) {
    if (!currentUser || !confirm('¿Eliminar este gasto recurrente?')) return;
    
    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('recurring').doc(id).delete();
        
        await loadRecurringFromFirebase();
        refreshRecurringView();
        showToast('Gasto recurrente eliminado', 'success');
    } catch (error) {
        console.error('Error eliminando recurrente:', error);
    }
}

function refreshRecurringView() {
    const content = document.getElementById('recurring-content');
    if (content && typeof renderRecurringExpensesViewIntegrated === 'function') {
        content.innerHTML = renderRecurringExpensesViewIntegrated();
    }
    
    if (activeTab === 'more-recurring') {
        render();
    }
}

console.log('✅ firebase-db.js cargado');
