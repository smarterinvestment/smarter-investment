// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================
/* 
IMPORTANTE: Agregar estos estilos CSS al archivo styles.css:

.fab-menu {
    position: fixed;
    bottom: 90px;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    z-index: 999;
    animation: fadeIn 0.3s ease;
}

.fab-option {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
}

.fab-option:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.fab-option:active {
    transform: scale(0.95);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
*/

// Firebase ya está inicializado en index.html
// Solo obtenemos las referencias
const auth = firebase.auth();
const db = firebase.firestore();

// ========================================
// ESTADO GLOBAL
// ========================================
let currentUser = null;
let currentView = 'login';
let activeTab = 'dashboard';
let expenses = [];
let incomeHistory = []; // ✅ NUEVO: Array para historial de ingresos
let goals = [];
let income = { salary: 0, freelance: 0, investments: 0 };
let budgets = {
    'Gastos Esenciales': 0,
    'Gastos Discrecionales': 0,
    'Pago Deudas': 0,
    'Ahorros': 0,
    'Inversiones': 0
};

// Variables para gráficos
let expenseChart = null;
let categoryChart = null;

// ✨ NUEVO: Variables para tutorial guiado
let tutorialActive = false;
let tutorialStep = 0;
let tutorialCompleted = false;

// 🤖 NUEVO: Asistente Virtual
let assistantModule = null;

// 🔔 NUEVO: Módulo de Notificaciones
let notificationsModule = null;

// 🔄 NUEVO: Módulo de Gastos Recurrentes
let recurringModule = null;

// 📊 NUEVO: Módulo de Reportes
let reportsModule = null;

// 📈 NUEVO: Módulo de Comparación
let comparisonModule = null;

// ✨ CATEGORÍAS PARA GASTOS E INGRESOS
const categorias = [
    { nombre: 'Alimentación', emoji: '🍔', color: '#ef4444', tipo: 'gasto' },
    { nombre: 'Transporte', emoji: '🚗', color: '#f59e0b', tipo: 'gasto' },
    { nombre: 'Entretenimiento', emoji: '🎬', color: '#8b5cf6', tipo: 'gasto' },
    { nombre: 'Salud', emoji: '💊', color: '#ec4899', tipo: 'gasto' },
    { nombre: 'Educación', emoji: '📚', color: '#3b82f6', tipo: 'gasto' },
    { nombre: 'Vivienda', emoji: '🏠', color: '#10b981', tipo: 'gasto' },
    { nombre: 'Servicios', emoji: '💡', color: '#14b8a6', tipo: 'gasto' },
    { nombre: 'Ropa', emoji: '👕', color: '#f43f5e', tipo: 'gasto' },
    { nombre: 'Tecnología', emoji: '💻', color: '#6366f1', tipo: 'gasto' },
    { nombre: 'Mascotas', emoji: '🐕', color: '#fb923c', tipo: 'gasto' },
    { nombre: 'Gastos Esenciales', emoji: '🏠', color: '#10b981', tipo: 'gasto' },
    { nombre: 'Gastos Discrecionales', emoji: '🎭', color: '#8b5cf6', tipo: 'gasto' },
    { nombre: 'Pago Deudas', emoji: '💳', color: '#ef4444', tipo: 'gasto' },
    { nombre: 'Otros', emoji: '📌', color: '#64748b', tipo: 'gasto' }
];

// ========================================
// LISTENER DE AUTENTICACIÓN
// ========================================
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        await loadUserData();
        await loadTutorialStatus(); // ✨ NUEVO: Cargar estado del tutorial
        
        // ✨✨✨ NUEVO: Inicializar notificaciones ✨✨✨
        await initializeNotifications();
        
        // 🤖 NUEVO: Inicializar Asistente Virtual Mejorado
        if (window.VirtualAssistantModule) {
            assistantModule = new VirtualAssistantModule(db, currentUser.uid);
            await assistantModule.initialize();
            console.log('✅ Asistente Virtual AI inicializado');
        }
        
        // 🔄 NUEVO: Inicializar Gastos Recurrentes
        if (window.RecurringExpensesModule) {
            recurringModule = new RecurringExpensesModule(db, currentUser.uid);
            await recurringModule.initialize();
            console.log('✅ Gastos Recurrentes inicializados');
        }
        
        // 📊 NUEVO: Inicializar Reportes Interactivos
        if (window.ReportsModule) {
            reportsModule = new ReportsModule(db, currentUser.uid);
            await reportsModule.initialize();
            console.log('✅ Reportes Interactivos inicializados');
        }
        
        // ✨ NUEVO: Iniciar tutorial automáticamente si es primera vez
        if (!tutorialCompleted && expenses.length === 0 && incomeHistory.length === 0) {
            setTimeout(() => {
                tutorialActive = true;
                tutorialStep = 0;
                render();
            }, 1000); // Esperar 1 segundo para que cargue todo
        }
        
        currentView = 'app';
        activeTab = 'dashboard';
        render();
    } else {
        currentUser = null;
        currentView = 'login';
        render();
    }
});

// ========================================
// CARGAR DATOS DEL USUARIO
// ========================================
async function loadUserData() {
    try {
        // Cargar gastos
        const expensesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').orderBy('date', 'desc').limit(100).get();
        expenses = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ✅ CORRECCIÓN 2: Cargar historial de ingresos
        const incomesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').orderBy('date', 'desc').limit(100).get();
        incomeHistory = incomesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ✅ CORRECCIÓN 3: Recalcular income total desde incomeHistory
        income = { salary: 0, freelance: 0, investments: 0 };
        incomeHistory.forEach(inc => {
            income[inc.type] = (income[inc.type] || 0) + inc.amount;
        });
        
        // Guardar el income recalculado en settings
        if (incomeHistory.length > 0) {
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('income').set(income);
        }

        // Cargar metas
        const goalsSnap = await db.collection('users').doc(currentUser.uid)
            .collection('goals').get();
        goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cargar presupuestos
        const budgetsDoc = await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').get();
        if (budgetsDoc.exists) {
            budgets = budgetsDoc.data();
        }
        
        // ✨✨✨ NUEVO: Cargar gastos recurrentes ✨✨✨
        await loadRecurringExpenses();
        await checkAndGenerateRecurringExpenses();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================
async function handleRegister(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        
        // Inicializar datos del usuario
        await db.collection('users').doc(uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Inicializar configuración
        await db.collection('users').doc(uid).collection('settings').doc('income').set(income);
        await db.collection('users').doc(uid).collection('settings').doc('budgets').set(budgets);
        
    } catch (error) {
        alert('Error al registrar: ' + error.message);
    }
}

async function handleLogin(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert('Error al iniciar sesión: ' + error.message);
    }
}

async function handleLogout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
        try {
            await auth.signOut();
        } catch (error) {
            alert('Error al cerrar sesión: ' + error.message);
        }
    }
}

// 🔐 NUEVA FUNCIÓN: Recuperación de contraseña
async function handlePasswordReset(email) {
    if (!email) {
        alert('❌ Por favor ingresa tu correo electrónico');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert('✅ Se ha enviado un correo de recuperación a ' + email + '\n\nRevisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.');
    } catch (error) {
        let errorMessage = 'Error al enviar correo de recuperación';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ No existe una cuenta con este correo electrónico';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ El correo electrónico no es válido';
        } else {
            errorMessage = '❌ ' + error.message;
        }
        
        alert(errorMessage);
    }
}

// 🔐 NUEVA FUNCIÓN: Mostrar modal de recuperación de contraseña
function showPasswordResetModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '🔐 Recuperar Contraseña';
    modalBody.innerHTML = `
        <form onsubmit="event.preventDefault(); handlePasswordResetSubmit();">
            <div class="input-group">
                <label>📧 Correo Electrónico</label>
                <input type="email" id="reset-email" placeholder="tu@email.com" required autofocus>
            </div>
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                💡 <strong>Nota:</strong> Te enviaremos un correo con instrucciones para restablecer tu contraseña.
            </div>
            <button type="submit" class="btn btn-primary">Enviar Correo de Recuperación</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        </form>
    `;
    
    modal.classList.add('active');
}

function handlePasswordResetSubmit() {
    const email = document.getElementById('reset-email').value;
    handlePasswordReset(email);
    closeModal();
}

// ========================================
// FUNCIONES DE GASTOS
// ========================================
checkUnusualExpense()
checkBudgetAlerts()
async function addExpense(expense) {
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').add({
                ...expense,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        expenses.unshift({ id: docRef.id, ...expense });
        
        // ✨✨✨ NUEVO: Notificaciones ✨✨✨
        checkUnusualExpense(expense.amount);
        await checkBudgetAlerts();
        
        render();
    } catch (error) {
        alert('Error al guardar gasto: ' + error.message);
    }
}

async function deleteExpense(id) {
    if (confirm('¿Eliminar este gasto?')) {
        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('expenses').doc(id).delete();
            expenses = expenses.filter(e => e.id !== id);
            render();
        } catch (error) {
            alert('Error al eliminar gasto: ' + error.message);
        }
    }
}

// ========================================
// FUNCIONES DE INGRESOS
// ========================================
async function addIncome(incomeEntry) {
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').add({
                ...incomeEntry,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // ✅ CORRECCIÓN 2: Agregar al array incomeHistory inmediatamente
        incomeHistory.unshift({ id: docRef.id, ...incomeEntry });
        
        // Actualizar el income global
        income[incomeEntry.type] = (income[incomeEntry.type] || 0) + incomeEntry.amount;
        
        // Guardar en settings
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('income').set(income);
        
        render();
    } catch (error) {
        alert('Error al guardar ingreso: ' + error.message);
    }
}

// ✅ NUEVO: Función para eliminar ingresos
async function deleteIncome(id) {
    console.log('🗑️ Intentando eliminar ingreso:', id);
    console.log('👤 Usuario actual:', currentUser?.uid);
    console.log('📋 Historial de ingresos:', incomeHistory.length);
    
    if (!currentUser) {
        alert('❌ Error: No hay usuario autenticado');
        return;
    }
    
    if (confirm('¿Eliminar este ingreso?')) {
        try {
            // Encontrar el ingreso a eliminar
            const incomeToDelete = incomeHistory.find(i => i.id === id);
            console.log('🔍 Ingreso encontrado:', incomeToDelete);
            
            if (!incomeToDelete) {
                alert('❌ Error: Ingreso no encontrado');
                return;
            }
            
            console.log('🔥 Eliminando de Firebase...');
            // Eliminar de Firebase
            await db.collection('users').doc(currentUser.uid)
                .collection('incomes').doc(id).delete();
            
            console.log('✅ Eliminado de Firebase');
            
            // Actualizar el income global (restar el monto)
            income[incomeToDelete.type] = Math.max(0, (income[incomeToDelete.type] || 0) - incomeToDelete.amount);
            
            console.log('💾 Guardando totales actualizados...');
            // Guardar en settings
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('income').set(income);
            
            console.log('🗑️ Eliminando localmente...');
            // Eliminar del array local
            incomeHistory = incomeHistory.filter(i => i.id !== id);
            
            console.log('✅ Ingreso eliminado correctamente');
            render();
        } catch (error) {
            console.error('❌ Error completo:', error);
            console.error('Código de error:', error.code);
            console.error('Mensaje:', error.message);
            alert('Error al eliminar ingreso: ' + error.message + '\n\nRevisa la consola para más detalles.');
        }
    }
}

// ========================================
// FUNCIONES DE METAS
// ========================================
async function addGoal(goal) {
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('goals').add({
                ...goal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        goals.push({ id: docRef.id, ...goal });
        render();
    } catch (error) {
        alert('Error al guardar meta: ' + error.message);
    }
}

async function deleteGoal(id) {
    if (confirm('¿Eliminar esta meta?')) {
        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('goals').doc(id).delete();
            goals = goals.filter(g => g.id !== id);
            render();
        } catch (error) {
            alert('Error al eliminar meta: ' + error.message);
        }
    }
}

async function addMoneyToGoal(goalId, amount) {
    try {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;
        
        const newCurrent = goal.current + amount;
        await db.collection('users').doc(currentUser.uid)
            .collection('goals').doc(goalId).update({
                current: newCurrent
            });
        
        goal.current = newCurrent;
        render();
    } catch (error) {
        alert('Error al agregar dinero: ' + error.message);
    }
}

// ========================================
// FUNCIONES DE PRESUPUESTO
// ========================================
async function updateBudget(category, amount) {
    try {
        budgets[category] = amount;
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        render();
    } catch (error) {
        alert('Error al actualizar presupuesto: ' + error.message);
    }
}

// ✨ NUEVA: Generar presupuesto basado en gastos REALES del usuario
function generateBudgetFromExpenses() {
    const { totalIncome, totalExpenses, expensesByCategory } = calculateTotals();
    
    // 💰 Verificar primero ingresos
    if (totalIncome === 0 || incomeHistory.length === 0) {
        showNeedIncomesModal();
        return;
    }
    
    // 💸 Verificar después gastos
    if (totalExpenses === 0 || expenses.length === 0) {
        showNeedExpensesModal();
        return;
    }
    
    // Calcular remanente
    const remainder = totalIncome - totalExpenses;
    
    // Calcular porcentajes por categoría
    const categoryAnalysis = {};
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
        categoryAnalysis[category] = {
            amount: amount,
            percentage: ((amount / totalIncome) * 100).toFixed(1),
            count: expenses.filter(e => e.category === category).length
        };
    });
    
    // Mostrar modal con análisis completo
    showExpenseAnalysisModal(totalIncome, totalExpenses, remainder, categoryAnalysis, expensesByCategory);
}

// 💰 NUEVA: Modal indicando que se necesitan ingresos primero
function showNeedIncomesModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '💰 Paso 1: Registra tus Ingresos';
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1.5rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">💵</div>
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">¡Primero necesitamos conocer tus ingresos!</h3>
            <p style="font-size: 1.1rem; color: rgba(255,255,255,0.9); margin-bottom: 1.5rem; line-height: 1.6;">
                Para poder generar un presupuesto inteligente basado en tus finanzas reales, 
                necesitamos saber cuánto dinero recibes cada mes.
            </p>
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid var(--color-primary); margin-bottom: 1.5rem; text-align: left;">
                <h4 style="color: var(--color-primary); margin-bottom: 0.75rem; font-size: 1rem;">📋 ¿Qué hacer?</h4>
                <ol style="margin-left: 1.5rem; line-height: 1.8; font-size: 0.95rem;">
                    <li>Ve a la pestaña <strong>"Ingresos"</strong> 📊</li>
                    <li>Agrega tu <strong>salario mensual</strong> 💵</li>
                    <li>Incluye <strong>trabajos freelance</strong> 💼 (si aplica)</li>
                    <li>Registra <strong>inversiones u otros ingresos</strong> 📈 (si aplica)</li>
                </ol>
            </div>
            <div style="background: rgba(34, 197, 94, 0.15); padding: 1rem; border-radius: 0.75rem; border-left: 4px solid var(--color-success); text-align: left; margin-bottom: 1.5rem;">
                <strong>✨ Tip:</strong> Una vez registres tus ingresos, regresa aquí para generar tu presupuesto automáticamente.
            </div>
            <button type="button" class="btn btn-primary" onclick="closeModal(); switchTab('transactions'); switchTransactionTab('incomes');">
                Ir a Registrar Ingresos 💰
            </button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Entendido</button>
        </div>
    `;
    
    modal.classList.add('active');
}

// 💸 NUEVA: Modal indicando que se necesitan gastos
function showNeedExpensesModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '💸 Paso 2: Registra tus Gastos';
    modalBody.innerHTML = `
        <div style="text-align: center; padding: 1.5rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📝</div>
            <h3 style="color: var(--color-primary); margin-bottom: 1rem;">¡Ahora registra tus gastos del mes!</h3>
            <p style="font-size: 1.1rem; color: rgba(255,255,255,0.9); margin-bottom: 1.5rem; line-height: 1.6;">
                Ya tienes tus ingresos registrados (¡excelente! 💪). Ahora necesitamos conocer 
                todos tus gastos para calcular tu <strong>remanente disponible</strong> 💵
            </p>
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid var(--color-primary); margin-bottom: 1.5rem; text-align: left;">
                <h4 style="color: var(--color-primary); margin-bottom: 0.75rem; font-size: 1rem;">📋 ¿Qué hacer?</h4>
                <ol style="margin-left: 1.5rem; line-height: 1.8; font-size: 0.95rem;">
                    <li>Ve a la pestaña <strong>"Gastos"</strong> 📊</li>
                    <li>Registra <strong>todos tus gastos</strong> del mes actual</li>
                    <li>Incluye desde los <strong>gastos grandes</strong> (renta, servicios) hasta los <strong>pequeños</strong> (café, transporte) ☕🚗</li>
                    <li>Sé lo más <strong>completo posible</strong> para obtener un presupuesto preciso 🎯</li>
                </ol>
            </div>
            <div style="background: rgba(34, 197, 94, 0.15); padding: 1rem; border-radius: 0.75rem; border-left: 4px solid var(--color-success); text-align: left; margin-bottom: 1.5rem;">
                <strong>💡 Importante:</strong> Una vez registres todos tus gastos, podrás generar un presupuesto inteligente que te mostrará tu <strong>remanente disponible</strong> (dinero que te sobra) 💰
            </div>
            <button type="button" class="btn btn-primary" onclick="closeModal(); switchTab('transactions'); switchTransactionTab('expenses');">
                Ir a Registrar Gastos 💸
            </button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Entendido</button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ✨ NUEVA: Modal con análisis completo de gastos y confirmación de presupuesto
function showExpenseAnalysisModal(totalIncome, totalExpenses, remainder, categoryAnalysis, expensesByCategory) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const remainderPercentage = ((remainder / totalIncome) * 100).toFixed(1);
    const expensesPercentage = ((totalExpenses / totalIncome) * 100).toFixed(1);
    
    // Verificar si ya existe presupuesto (actualización) o es primera vez (creación)
    const isUpdate = Object.values(budgets).some(b => b > 0);
    
    // Ordenar categorías por monto (mayor a menor)
    const sortedCategories = Object.entries(categoryAnalysis).sort((a, b) => b[1].amount - a[1].amount);
    
    modalTitle.textContent = isUpdate ? '🔄 Actualizar tu Presupuesto' : '📊 Análisis de tus Gastos Reales';
    modalBody.innerHTML = `
        ${isUpdate ? `
            <div style="padding: 1rem; background: rgba(5, 191, 219, 0.2); border-radius: 0.75rem; border: 2px solid var(--color-primary); margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 1.1rem; font-weight: bold; color: var(--color-primary); margin-bottom: 0.5rem;">
                    💡 Vas a actualizar tu presupuesto
                </div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                    El presupuesto se actualizará basándose en tus gastos de este mes. Esto te permitirá comparar entre meses.
                </div>
            </div>
        ` : ''}
        <div style="margin-bottom: 1.5rem;">
            <!-- Resumen Principal -->
            <div style="background: linear-gradient(135deg, rgba(5, 191, 219, 0.2), rgba(34, 197, 94, 0.2)); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1.5rem; text-align: center;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">💰 Ingresos</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-success);">$${totalIncome.toLocaleString()}</div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">100%</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">💸 Gastos</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-danger);">$${totalExpenses.toLocaleString()}</div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${expensesPercentage}%</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">💵 Remanente</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${remainder >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                            ${remainder >= 0 ? '+' : ''}$${Math.abs(remainder).toLocaleString()}
                        </div>
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${remainderPercentage}%</div>
                    </div>
                </div>
                
                ${remainder >= 0 ? `
                    <div style="padding: 0.75rem; background: rgba(34, 197, 94, 0.3); border-radius: 0.5rem; border: 2px solid rgba(34, 197, 94, 0.4);">
                        <div style="font-size: 0.95rem; color: var(--color-success); font-weight: bold;">
                            ✅ ¡Excelente! Te sobran $${remainder.toLocaleString()}
                        </div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-top: 0.25rem;">
                            Esto representa el ${remainderPercentage}% de tus ingresos disponible para ahorros o imprevistos
                        </div>
                    </div>
                ` : `
                    <div style="padding: 0.75rem; background: rgba(239, 68, 68, 0.3); border-radius: 0.5rem; border: 2px solid rgba(239, 68, 68, 0.4);">
                        <div style="font-size: 0.95rem; color: var(--color-danger); font-weight: bold;">
                            ⚠️ Atención: Gastaste $${Math.abs(remainder).toLocaleString()} más de tus ingresos
                        </div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-top: 0.25rem;">
                            Considera ajustar tus gastos o aumentar tus ingresos
                        </div>
                    </div>
                `}
            </div>
            
            <!-- Distribución por Categorías -->
            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2); margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: var(--color-primary); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📊</span> Distribución por Categorías
                </h4>
                <div style="margin-bottom: 1rem;">
                    ${sortedCategories.map(([category, data]) => {
                        const barWidth = data.percentage;
                        let barColor = 'var(--color-primary)';
                        if (data.percentage > 50) barColor = 'var(--color-danger)';
                        else if (data.percentage > 30) barColor = '#f59e0b';
                        else if (data.percentage > 15) barColor = 'var(--color-primary)';
                        else barColor = 'var(--color-success)';
                        
                        return `
                            <div style="margin-bottom: 1.25rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <span style="font-weight: 600; font-size: 0.95rem;">${category}</span>
                                    <div style="text-align: right;">
                                        <div style="font-weight: bold; color: ${barColor};">$${data.amount.toLocaleString()}</div>
                                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${data.count} ${data.count === 1 ? 'gasto' : 'gastos'}</div>
                                    </div>
                                </div>
                                <div style="position: relative; height: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; overflow: hidden;">
                                    <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${Math.min(barWidth, 100)}%; background: ${barColor}; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; transition: width 0.5s ease;">
                                        ${data.percentage}%
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Información y Recomendación -->
            <div style="background: rgba(212, 175, 55, 0.15); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(212, 175, 55, 0.3); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                        <div style="font-weight: bold; margin-bottom: 0.5rem;">
                            ${isUpdate ? '¿Qué sucederá al actualizar?' : '¿Qué sucederá al confirmar?'}
                        </div>
                        <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                            ${isUpdate ? `
                                <li>Tu presupuesto se <strong>actualizará</strong> con los gastos de este mes</li>
                                <li>Podrás ver la <strong>evolución</strong> comparando con meses anteriores</li>
                                <li>Las alertas se ajustarán a los nuevos límites</li>
                                <li>Puedes hacer esto cada mes para mantener tu presupuesto actualizado</li>
                            ` : `
                                <li>Los montos gastados en cada categoría se convertirán en tu <strong>presupuesto base</strong></li>
                                <li>El próximo mes podrás comparar tus gastos reales vs este presupuesto</li>
                                <li>Recibirás alertas cuando te acerques al límite de cada categoría</li>
                                <li>Podrás ajustar los montos manualmente cuando quieras</li>
                            `}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">
                ❌ Cancelar
            </button>
            <button type="button" class="btn btn-primary" onclick="confirmBudgetFromExpenses(${JSON.stringify(expensesByCategory).replace(/"/g, '&quot;')})" style="flex: 2;">
                ${isUpdate ? '🔄 Actualizar Mi Presupuesto' : '✅ Confirmar y Usar como Mi Presupuesto'}
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ✨ NUEVA: Confirmar y aplicar presupuesto basado en gastos
async function confirmBudgetFromExpenses(expensesByCategory) {
    try {
        // Verificar si es actualización o primera vez
        const isUpdate = Object.values(budgets).some(b => b > 0);
        
        // Crear presupuesto basado en los gastos reales
        const newBudgets = {};
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            newBudgets[category] = Math.ceil(amount); // Redondear hacia arriba
        });
        
        // Actualizar presupuestos globales
        Object.assign(budgets, newBudgets);
        
        // Guardar en Firebase
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        
        closeModal();
        
        // Calcular totales para el mensaje
        const { totalIncome, totalExpenses } = calculateTotals();
        const remainder = totalIncome - totalExpenses;
        
        // Mostrar notificación de éxito
        if (isUpdate) {
            alert('🔄 ¡Presupuesto Actualizado Exitosamente!\n\n' +
                  '📊 Tu presupuesto ha sido actualizado con los gastos de este mes:\n\n' +
                  `💰 Ingresos: $${totalIncome.toLocaleString()}\n` +
                  `💸 Nuevo Presupuesto: $${totalExpenses.toLocaleString()}\n` +
                  `💵 Remanente: ${remainder >= 0 ? '+' : ''}$${remainder.toLocaleString()}\n\n` +
                  '✅ Ahora puedes:\n' +
                  '• Comparar este mes vs meses anteriores\n' +
                  '• Ver cómo ha cambiado tu distribución\n' +
                  '• Ajustar categorías si es necesario\n\n' +
                  '¡Revisa el Dashboard y la sección Presupuesto!');
        } else {
            alert('🎉 ¡Presupuesto Creado Exitosamente!\n\n' +
                  '📊 Tu presupuesto ha sido generado basándose en tus gastos reales:\n\n' +
                  `💰 Ingresos: $${totalIncome.toLocaleString()}\n` +
                  `💸 Presupuesto Total: $${totalExpenses.toLocaleString()}\n` +
                  `💵 Remanente: ${remainder >= 0 ? '+' : ''}$${remainder.toLocaleString()}\n\n` +
                  '✅ A partir de ahora:\n' +
                  '• Podrás comparar tus gastos vs presupuesto\n' +
                  '• Recibirás alertas cuando te acerques al límite\n' +
                  '• Verás tu remanente actualizado en tiempo real\n\n' +
                  '¡Revisa el Dashboard y la sección Presupuesto!');
        }
        
        render();
    } catch (error) {
        alert('❌ Error al ' + (Object.values(budgets).some(b => b > 0) ? 'actualizar' : 'crear') + ' presupuesto: ' + error.message);
    }
}

// ✨ NUEVA: Mostrar opciones de generación de presupuesto

// ========================================
// TUTORIAL GUIADO
// ========================================

// ✨ Definición de pasos del tutorial
const tutorialSteps = [
    {
        step: 0,
        title: "¡Bienvenido a Smarter Investment! 💰🧠",
        description: "Te vamos a guiar paso a paso para crear tu primer presupuesto basado en tus gastos reales. ¡Es muy fácil!",
        target: null,
        action: "Empecemos",
        tab: null
    },
    {
        step: 1,
        title: "Paso 1: Registra tus Ingresos 💰",
        description: "Primero, vamos a registrar todos tus ingresos mensuales (salario, freelance, inversiones, etc.)",
        target: "incomes-tab",
        action: "Ir a Ingresos",
        tab: "incomes",
        highlight: ".tab-button[onclick*='incomes']"
    },
    {
        step: 2,
        title: "Registra tu Primer Ingreso 💵",
        description: "Ingresa tu salario o cualquier ingreso que tengas. Puedes agregar más después.",
        target: "income-form",
        action: "Continuar",
        tab: "incomes",
        highlight: ".income-section"
    },
    {
        step: 3,
        title: "Paso 2: Registra tus Gastos 💸",
        description: "Ahora vamos a registrar TODOS los gastos que has tenido este mes. Cuantos más registres, más preciso será tu presupuesto.",
        target: "expenses-tab",
        action: "Ir a Gastos",
        tab: "expenses",
        highlight: ".tab-button[onclick*='expenses']"
    },
    {
        step: 4,
        title: "Registra tus Gastos 📝",
        description: "Agrega cada gasto con su monto, categoría y descripción. Registra al menos 5 gastos para tener un buen presupuesto inicial.",
        target: "expense-form",
        action: "Continuar",
        tab: "expenses",
        highlight: ".expense-form"
    },
    {
        step: 5,
        title: "Paso 3: Genera tu Presupuesto 📊",
        description: "¡Perfecto! Ahora vamos a generar tu presupuesto automáticamente basándonos en tus gastos reales.",
        target: "budget-tab",
        action: "Ir a Presupuesto",
        tab: "budget",
        highlight: ".tab-button[onclick*='budget']"
    },
    {
        step: 6,
        title: "Genera desde tus Gastos ✨",
        description: "Haz clic en el botón 'Generar desde Gastos' para crear tu presupuesto. La app analizará tus gastos y creará un presupuesto personalizado.",
        target: "generate-budget",
        action: "Ver Dashboard",
        tab: "budget",
        highlight: "button[onclick='generateBudgetFromExpenses()']"
    },
    {
        step: 7,
        title: "¡Felicidades! 🎉",
        description: "Ya tienes tu primer presupuesto. Ahora puedes ver tu remanente, comparar gastos y recibir alertas. ¡Cada mes puedes actualizar tu presupuesto!",
        target: "dashboard-tab",
        action: "Finalizar",
        tab: "dashboard",
        highlight: null
    }
];

// ✨ Iniciar tutorial
function startTutorial() {
    tutorialActive = true;
    tutorialStep = 0;
    renderTutorialOverlay();
}

// ✨ Avanzar en el tutorial
function nextTutorialStep() {
    if (tutorialStep < tutorialSteps.length - 1) {
        tutorialStep++;
        const step = tutorialSteps[tutorialStep];
        
        // Cambiar a la pestaña requerida
        if (step.tab) {
            switchTab(step.tab);
        }
        
        renderTutorialOverlay();
    } else {
        completeTutorial();
    }
}

// ✨ Retroceder en el tutorial
function previousTutorialStep() {
    if (tutorialStep > 0) {
        tutorialStep--;
        const step = tutorialSteps[tutorialStep];
        
        // Cambiar a la pestaña requerida
        if (step.tab) {
            switchTab(step.tab);
        }
        
        renderTutorialOverlay();
    }
}

// ✨ Saltar tutorial
function skipTutorial() {
    if (confirm('¿Estás seguro que quieres saltar el tutorial?\n\nPuedes volver a verlo desde el menú de ayuda.')) {
        tutorialActive = false;
        tutorialCompleted = true;
        saveTutorialStatus();
        render();
    }
}

// ✨ Completar tutorial
async function completeTutorial() {
    tutorialActive = false;
    tutorialCompleted = true;
    await saveTutorialStatus();
    
    alert('🎉 ¡Tutorial Completado!\n\n' +
          '¡Felicidades! Ya sabes cómo usar Smarter Investment. 💰🧠\n\n' +
          '✅ Recuerda:\n' +
          '• Registra tus gastos diariamente\n' +
          '• Actualiza tu presupuesto cada mes\n' +
          '• Revisa tu remanente en el Dashboard\n' +
          '• Atiende las alertas de presupuesto\n\n' +
          '¡Empieza a tomar control de tus finanzas! 💪');
    
    render();
}

// ✨ Guardar estado del tutorial en Firebase
async function saveTutorialStatus() {
    if (currentUser) {
        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('tutorial').set({
                    completed: tutorialCompleted,
                    completedAt: new Date()
                });
        } catch (error) {
            console.error('Error guardando estado del tutorial:', error);
        }
    }
}

// ✨ Cargar estado del tutorial desde Firebase
async function loadTutorialStatus() {
    if (currentUser) {
        try {
            const doc = await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('tutorial').get();
            
            if (doc.exists) {
                tutorialCompleted = doc.data().completed || false;
            } else {
                // Primera vez del usuario, mostrar tutorial
                tutorialCompleted = false;
            }
        } catch (error) {
            console.error('Error cargando estado del tutorial:', error);
            tutorialCompleted = false;
        }
    }
}

// 🔔 Inicializar módulo de notificaciones
async function initializeNotifications() {
    try {
        if (window.IntelligentNotifications && currentUser) {
            notificationsModule = new IntelligentNotifications(db, currentUser.uid);
            await notificationsModule.initialize();
            console.log('✅ Módulo de notificaciones inicializado');
        } else {
            console.warn('⚠️ Módulo de notificaciones no disponible');
        }
    } catch (error) {
        console.error('❌ Error al inicializar notificaciones:', error);
    }
}

// ✨ Renderizar overlay del tutorial
function renderTutorialOverlay() {
    if (!tutorialActive) return '';
    
    const step = tutorialSteps[tutorialStep];
    const progress = ((tutorialStep + 1) / tutorialSteps.length * 100).toFixed(0);
    
    // Quitar highlight anterior
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    
    // Agregar highlight al elemento actual
    setTimeout(() => {
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.classList.add('tutorial-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, 100);
    
    return `
        <!-- ✨ OVERLAY DEL TUTORIAL -->
        <div class="tutorial-overlay">
            <div class="tutorial-backdrop" onclick="skipTutorial()"></div>
            <div class="tutorial-modal">
                <!-- Barra de progreso -->
                <div class="tutorial-progress-bar">
                    <div class="tutorial-progress-fill" style="width: ${progress}%"></div>
                </div>
                
                <!-- Contenido -->
                <div class="tutorial-content">
                    <div class="tutorial-step-number">
                        Paso ${tutorialStep + 1} de ${tutorialSteps.length}
                    </div>
                    
                    <h2 class="tutorial-title">${step.title}</h2>
                    
                    <p class="tutorial-description">${step.description}</p>
                    
                    ${tutorialStep === 2 && incomeHistory.length === 0 ? `
                        <div class="tutorial-warning">
                            ⚠️ <strong>Registra al menos un ingreso</strong> antes de continuar
                        </div>
                    ` : ''}
                    
                    ${tutorialStep === 4 && expenses.length < 3 ? `
                        <div class="tutorial-warning">
                            💡 <strong>Recomendación:</strong> Registra al menos 3-5 gastos para un mejor presupuesto
                        </div>
                    ` : ''}
                </div>
                
                <!-- Botones -->
                <div class="tutorial-buttons">
                    <button class="btn btn-secondary" onclick="skipTutorial()" style="flex: 1;">
                        ⏭️ Saltar
                    </button>
                    
                    ${tutorialStep > 0 ? `
                        <button class="btn btn-secondary" onclick="previousTutorialStep()" style="flex: 1;">
                            ⬅️ Anterior
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-primary" onclick="nextTutorialStep()" style="flex: 2;">
                        ${step.action} ${tutorialStep === tutorialSteps.length - 1 ? '🎉' : '➡️'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ✨ NUEVA: Mostrar opciones de generación de presupuesto
function generateAutoBudget() {
    const monthlyData = calculateMonthlyTotals();
    const months = Object.keys(monthlyData).sort().slice(-6);
    const hasHistoricalData = months.length >= 2;
    
    // Mostrar modal con opciones
    showBudgetGenerationOptions(hasHistoricalData);
}

// ✨ NUEVA: Modal con opciones de generación
function showBudgetGenerationOptions(hasHistoricalData) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const { totalIncome } = calculateTotals();
    
    modalTitle.textContent = '🤖 Generar Presupuesto Inteligente';
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1.5rem;">
                <div style="font-size: 1rem; color: rgba(255,255,255,0.9); margin-bottom: 1rem;">
                    Elige cómo quieres generar tu presupuesto:
                </div>
            </div>
            
            <!-- Opción 1: Desde Ingresos -->
            <button onclick="generateFromIncome()" class="btn btn-primary" style="width: 100%; margin-bottom: 1rem; padding: 1.5rem; text-align: left; position: relative;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2.5rem;">💰</div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">Desde Ingresos</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">
                            Distribuye tus <strong>$${totalIncome.toLocaleString()}</strong> de ingresos en categorías
                        </div>
                        <div style="font-size: 0.85rem; color: var(--color-success); margin-top: 0.25rem;">
                            ✅ Ideal para empezar | ✅ No requiere historial
                        </div>
                    </div>
                    <div style="font-size: 1.5rem;">→</div>
                </div>
            </button>
            
            <!-- Opción 2: Desde Historial -->
            <button onclick="${hasHistoricalData ? 'generateFromHistory()' : 'showHistoricalDataNeeded()'}" 
                    class="btn ${hasHistoricalData ? 'btn-primary' : 'btn-secondary'}" 
                    style="width: 100%; padding: 1.5rem; text-align: left; position: relative; ${!hasHistoricalData ? 'opacity: 0.6;' : ''}">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2.5rem;">📊</div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">
                            Desde Historial de Gastos
                            ${!hasHistoricalData ? '<span style="font-size: 0.8rem; color: #f59e0b;"> (🔒 Bloqueado)</span>' : ''}
                        </div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">
                            ${hasHistoricalData 
                                ? 'Analiza tus gastos y genera presupuesto inteligente'
                                : 'Necesitas al menos 2 meses de gastos registrados'}
                        </div>
                        <div style="font-size: 0.85rem; color: ${hasHistoricalData ? 'var(--color-success)' : '#f59e0b'}; margin-top: 0.25rem;">
                            ${hasHistoricalData 
                                ? '✅ Basado en datos reales | ✅ Más preciso'
                                : '⚠️ Registra gastos por 2 meses para desbloquear'}
                        </div>
                    </div>
                    <div style="font-size: 1.5rem;">${hasHistoricalData ? '→' : '🔒'}</div>
                </div>
            </button>
        </div>
        
        <button type="button" class="btn btn-secondary" onclick="closeModal()" style="width: 100%;">
            ❌ Cancelar
        </button>
    `;
    
    modal.classList.add('active');
}

// ✨ NUEVA: Generar presupuesto desde ingresos (Regla 50/30/20 mejorada)
function generateFromIncome() {
    const { totalIncome } = calculateTotals();
    
    if (totalIncome === 0) {
        alert('⚠️ Primero debes registrar tus ingresos para poder generar un presupuesto.');
        closeModal();
        return;
    }
    
    // Distribución inteligente basada en mejores prácticas financieras
    const suggestedBudgets = {
        'Gastos Esenciales': Math.round(totalIncome * 0.50),      // 50% - Vivienda, comida, transporte
        'Gastos Discrecionales': Math.round(totalIncome * 0.20),  // 20% - Entretenimiento, hobbies
        'Pago Deudas': Math.round(totalIncome * 0.10),            // 10% - Deudas y préstamos
        'Ahorros': Math.round(totalIncome * 0.10),                // 10% - Fondo de emergencia
        'Inversiones': Math.round(totalIncome * 0.10)             // 10% - Inversiones futuro
    };
    
    showIncomeBudgetModal(suggestedBudgets, totalIncome);
}

// ✨ NUEVA: Generar desde historial (versión original mejorada)
function generateFromHistory() {
    const monthlyData = calculateMonthlyTotals();
    const months = Object.keys(monthlyData).sort().slice(-6);
    
    const suggestedBudgets = {};
    const categories = Object.keys(budgets);
    
    categories.forEach(category => {
        let total = 0;
        let count = 0;
        
        months.forEach(monthKey => {
            const monthData = monthlyData[monthKey];
            if (monthData.expensesByCategory[category]) {
                total += monthData.expensesByCategory[category];
                count++;
            }
        });
        
        // Calcular promedio y agregar 10% de margen
        const average = count > 0 ? total / count : 0;
        suggestedBudgets[category] = Math.round(average * 1.1);
    });
    
    showAutoBudgetModal(suggestedBudgets, months.length, 'historial');
}

// ✨ NUEVA: Mostrar mensaje cuando no hay datos históricos
function showHistoricalDataNeeded() {
    alert('🔒 Función Bloqueada\n\n' +
          'Para generar un presupuesto basado en tu historial necesitas:\n\n' +
          '✓ Al menos 2 meses de gastos registrados\n' +
          '✓ Transacciones en diferentes categorías\n\n' +
          '💡 Mientras tanto, usa "Desde Ingresos" para empezar.\n\n' +
          'Esta función se desbloqueará automáticamente cuando tengas suficientes datos.');
}

// ✨ NUEVA: Renderizar tabla comparativa Planeado vs Real
function renderBudgetComparisonTable() {
    const { expensesByCategory } = calculateTotals();
    const categories = Object.keys(budgets);
    
    let totalPlanned = 0;
    let totalReal = 0;
    
    const rows = categories.map(cat => {
        const planned = budgets[cat] || 0;
        const real = expensesByCategory[cat] || 0;
        const diff = planned - real;
        const percentage = planned > 0 ? ((real / planned) * 100).toFixed(0) : 0;
        
        totalPlanned += planned;
        totalReal += real;
        
        const statusIcon = diff >= 0 ? '✅' : '❌';
        const statusColor = diff >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
        
        return `
            <tr style="border-bottom: 1px solid rgba(5, 191, 219, 0.2);">
                <td style="padding: 0.75rem; font-weight: 600;">${cat}</td>
                <td style="padding: 0.75rem; text-align: center; color: var(--color-primary);">$${planned.toLocaleString()}</td>
                <td style="padding: 0.75rem; text-align: center; color: ${percentage > 100 ? 'var(--color-danger)' : 'white'};">$${real.toLocaleString()}</td>
                <td style="padding: 0.75rem; text-align: center; color: ${statusColor}; font-weight: bold;">
                    ${statusIcon} ${diff >= 0 ? '+' : ''}$${diff.toLocaleString()}
                </td>
                <td style="padding: 0.75rem; text-align: center;">
                    <span style="padding: 0.25rem 0.75rem; background: ${percentage > 100 ? 'rgba(239, 68, 68, 0.2)' : percentage > 85 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(34, 197, 94, 0.2)'}; color: ${percentage > 100 ? 'var(--color-danger)' : percentage > 85 ? '#f59e0b' : 'var(--color-success)'}; border-radius: 1rem; font-weight: bold; font-size: 0.85rem;">
                        ${percentage}%
                    </span>
                </td>
            </tr>
        `;
    }).join('');
    
    const totalDiff = totalPlanned - totalReal;
    const totalPercentage = totalPlanned > 0 ? ((totalReal / totalPlanned) * 100).toFixed(0) : 0;
    
    return `
        <div class="card" style="overflow-x: auto;">
            <div class="card-title">
                <span>📊</span> Comparativo: Planeado vs Real
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                <thead>
                    <tr style="background: rgba(5, 191, 219, 0.15); border-bottom: 2px solid var(--color-primary);">
                        <th style="padding: 0.75rem; text-align: left; color: var(--color-primary); font-weight: bold;">Categoría</th>
                        <th style="padding: 0.75rem; text-align: center; color: var(--color-primary); font-weight: bold;">Planeado</th>
                        <th style="padding: 0.75rem; text-align: center; color: var(--color-primary); font-weight: bold;">Real</th>
                        <th style="padding: 0.75rem; text-align: center; color: var(--color-primary); font-weight: bold;">Diferencia</th>
                        <th style="padding: 0.75rem; text-align: center; color: var(--color-primary); font-weight: bold;">%</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot>
                    <tr style="background: rgba(5, 191, 219, 0.1); border-top: 2px solid var(--color-primary); font-weight: bold; font-size: 1.05rem;">
                        <td style="padding: 1rem;">TOTAL</td>
                        <td style="padding: 1rem; text-align: center; color: var(--color-primary);">$${totalPlanned.toLocaleString()}</td>
                        <td style="padding: 1rem; text-align: center;">$${totalReal.toLocaleString()}</td>
                        <td style="padding: 1rem; text-align: center; color: ${totalDiff >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                            ${totalDiff >= 0 ? '✅ +' : '❌ '}$${totalDiff.toLocaleString()}
                        </td>
                        <td style="padding: 1rem; text-align: center;">
                            <span style="padding: 0.4rem 1rem; background: ${totalPercentage > 100 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}; color: ${totalPercentage > 100 ? 'var(--color-danger)' : 'var(--color-success)'}; border-radius: 1rem; font-weight: bold;">
                                ${totalPercentage}%
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// ========================================
// CALCULAR TOTALES
// ========================================
function calculateTotals() {
    const totalIncome = (income.salary || 0) + (income.freelance || 0) + (income.investments || 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const expensesByCategory = {};
    expenses.forEach(e => {
        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    return { totalIncome, totalExpenses, balance, expensesByCategory };
}

// Calcular totales por mes
function calculateMonthlyTotals() {
    const monthlyData = {};
    
    // ✅ CALCULAR INGRESOS MES POR MES desde incomeHistory
    incomeHistory.forEach(inc => {
        const date = new Date(inc.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                income: 0,
                expenses: 0,
                expensesByCategory: {}
            };
        }
        
        monthlyData[monthKey].income += inc.amount;
    });
    
    // CALCULAR GASTOS MES POR MES
    expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                income: 0,
                expenses: 0,
                expensesByCategory: {}
            };
        }
        
        monthlyData[monthKey].expenses += expense.amount;
        monthlyData[monthKey].expensesByCategory[expense.category] = 
            (monthlyData[monthKey].expensesByCategory[expense.category] || 0) + expense.amount;
    });
    
    return monthlyData;
}

// Calcular gastos por descripción (agrupados)
function calculateExpensesByDescription() {
    const byDescription = {};
    
    expenses.forEach(expense => {
        if (!byDescription[expense.description]) {
            byDescription[expense.description] = 0;
        }
        byDescription[expense.description] += expense.amount;
    });
    
    // Ordenar por monto (mayor a menor) y tomar los top 10
    return Object.entries(byDescription)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
        }, {});
}

// Calcular distribución de ingresos
function calculateIncomeDistribution() {
    const distribution = {};
    
    if (income.salary > 0) distribution['💼 Salario'] = income.salary;
    if (income.freelance > 0) distribution['💻 Freelance'] = income.freelance;
    if (income.investments > 0) distribution['📈 Inversiones'] = income.investments;
    
    return distribution;
}

// ✨ NUEVA: Calcular remanente con comparativa mensual
function calculateRemainder() {
    const { totalIncome, totalExpenses, balance } = calculateTotals();
    const monthlyData = calculateMonthlyTotals();
    
    // Obtener mes actual y anterior
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const currentMonth = monthlyData[currentMonthKey] || { income: 0, expenses: 0 };
    const previousMonth = monthlyData[lastMonthKey] || { income: 0, expenses: 0 };
    
    const currentBalance = currentMonth.income - currentMonth.expenses;
    const previousBalance = previousMonth.income - previousMonth.expenses;
    const difference = currentBalance - previousBalance;
    
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
    
    return {
        currentBalance,
        previousBalance,
        difference,
        savingsRate,
        totalIncome,
        totalExpenses
    };
}

// Calcular tasa de ahorro mensual
function calculateMonthlySavingsRate() {
    const monthlyData = calculateMonthlyTotals();
    const savingsData = {};
    
    Object.keys(monthlyData).sort().forEach(monthKey => {
        const data = monthlyData[monthKey];
        const balance = data.income - data.expenses;
        const savingsRate = data.income > 0 ? ((balance / data.income) * 100).toFixed(1) : 0;
        const investmentAmount = data.expensesByCategory['Inversiones'] || 0;
        const investmentRate = data.income > 0 ? ((investmentAmount / data.income) * 100).toFixed(1) : 0;
        
        savingsData[monthKey] = {
            savingsRate: parseFloat(savingsRate),
            investmentRate: parseFloat(investmentRate)
        };
    });
    
    return savingsData;
}

// Obtener emoticón según tipo de meta
function getGoalEmoji(type) {
    const emojiMap = {
        'Viajes': '✈️',
        'Ahorro': '💰',
        'Inversión': '📈',
        'Compra': '🛍️',
        'Emergencia': '🚨',
        'Educación': '📚',
        'Compra de Carro': '🚗',
        'Emprendimiento': '💼',
        'Fondo de seguridad': '🛡️',
        'Otro': '🎯'
    };
    return emojiMap[type] || '🎯';
}

// ========================================
// RENDERS
// ========================================
function renderHeader(isLogin = false) {
    const logoClass = isLogin ? 'logo-container login-logo' : 'logo-container';
    return `
        <div class="header">
            <div class="header-content">
                <div class="${logoClass}">
                    <img src="logo-smarter.jpg" alt="Smarter Investment 💰🧠" class="logo-img" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display:none; font-size: 3rem; color: #088395;">💎</div>
                </div>
                <div class="app-subtitle">Tu Gestor Financiero Personal</div>
            </div>
        </div>
    `;
}

function renderLogin() {
    return `
        ${renderHeader(true)}
        <div class="auth-container">
            <div class="auth-title">🔐 Iniciar Sesión</div>
            <form onsubmit="event.preventDefault(); loginSubmit();">
                <div class="input-group">
                    <label>📧 Correo electrónico</label>
                    <input type="email" id="login-email" placeholder="tu@email.com" required autofocus>
                </div>
                <div class="input-group">
                    <label>🔒 Contraseña</label>
                    <input type="password" id="login-password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn btn-primary">Entrar 🚀</button>
            </form>
            <div style="text-align: center; margin-top: 1rem;">
                <a onclick="showPasswordResetModal()" style="color: var(--color-primary); text-decoration: none; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease;">
                    🔑 ¿Olvidaste tu contraseña?
                </a>
            </div>
            <div class="auth-switch">
                ¿No tienes cuenta? <a onclick="currentView='register'; render();">Regístrate aquí</a>
            </div>
        </div>
    `;
}

function renderRegister() {
    return `
        ${renderHeader(true)}
        <div class="auth-container">
            <div class="auth-title">✨ Crear Cuenta</div>
            <form onsubmit="event.preventDefault(); registerSubmit();">
                <div class="input-group">
                    <label>📧 Correo electrónico</label>
                    <input type="email" id="register-email" placeholder="tu@email.com" required autofocus>
                </div>
                <div class="input-group">
                    <label>🔒 Contraseña</label>
                    <input type="password" id="register-password" placeholder="Mínimo 6 caracteres" required minlength="6">
                </div>
                <div class="input-group">
                    <label>🔒 Confirmar contraseña</label>
                    <input type="password" id="register-confirm" placeholder="Repetir contraseña" required>
                </div>
                <button type="submit" class="btn btn-primary">Crear Cuenta 🎉</button>
            </form>
            <div class="auth-switch">
                ¿Ya tienes cuenta? <a onclick="currentView='login'; render();">Inicia sesión aquí</a>
            </div>
        </div>
    `;
}

function renderDashboard() {
    const { totalIncome, totalExpenses, balance, expensesByCategory } = calculateTotals();
    const expensesByDescription = calculateExpensesByDescription();
    const incomeDistribution = calculateIncomeDistribution();
    const remainderData = calculateRemainder();
    
    return `
        <!-- ✨ NUEVA: TARJETA DE REMANENTE DESTACADA -->
        <div class="card" style="background: linear-gradient(135deg, rgba(5, 191, 219, 0.2), rgba(212, 175, 55, 0.2)); border: 2px solid var(--color-primary); box-shadow: 0 8px 24px rgba(5, 191, 219, 0.3);">
            <div class="card-title" style="font-size: 1.3rem;">
                <span>💵</span> Remanente del Mes
            </div>
            <div style="text-align: center; padding: 1.5rem 0;">
                <div style="font-size: 3rem; font-weight: bold; color: ${remainderData.currentBalance >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; margin-bottom: 1rem; animation: pulseAmount 2s ease-in-out infinite;">
                    ${remainderData.currentBalance >= 0 ? '+' : ''}$${Math.abs(remainderData.currentBalance).toLocaleString()}
                </div>
                <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">💰 Ingresos</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-success);">$${remainderData.totalIncome.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">💸 Gastos</div>
                        <div style="font-size: 1.2rem; font-weight: bold; color: var(--color-danger);">$${remainderData.totalExpenses.toLocaleString()}</div>
                    </div>
                </div>
                ${remainderData.previousBalance !== 0 ? `
                    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: ${remainderData.difference >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border-radius: 2rem; font-weight: 600;">
                        <span style="font-size: 1.2rem;">${remainderData.difference >= 0 ? '📈' : '📉'}</span>
                        <span style="color: ${remainderData.difference >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                            ${remainderData.difference >= 0 ? '+' : ''}$${Math.abs(remainderData.difference).toLocaleString()} vs mes anterior
                        </span>
                    </div>
                ` : ''}
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(5, 191, 219, 0.15); border-radius: 0.75rem; display: inline-block;">
                    <span style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">📊 Tasa de ahorro: </span>
                    <span style="font-size: 1.1rem; font-weight: bold; color: var(--color-primary);">${remainderData.savingsRate}%</span>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                <span>📊</span> Resumen Financiero
            </div>
            <div class="stats-grid">
                <div class="stat-card" style="cursor: pointer;" onclick="openFinancialDetailModal('income')">
                    <div class="stat-label">💰 Ingresos</div>
                    <div class="stat-value">$${totalIncome.toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Click para ver detalles</div>
                </div>
                <div class="stat-card" style="cursor: pointer;" onclick="openFinancialDetailModal('expenses')">
                    <div class="stat-label">💸 Gastos</div>
                    <div class="stat-value text-danger">$${totalExpenses.toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Click para ver detalles</div>
                </div>
                <div class="stat-card" style="grid-column: span 2; cursor: pointer;" onclick="openFinancialDetailModal('balance')">
                    <div class="stat-label">💵 Balance</div>
                    <div class="stat-value ${balance >= 0 ? 'text-success' : 'text-danger'}">
                        ${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}
                    </div>
                    <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Click para ver detalles</div>
                </div>
            </div>
        </div>

        ${Object.keys(expensesByCategory).length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>📈</span> Gastos por Categoría
            </div>
            <div class="chart-container">
                <canvas id="expenseChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${Object.keys(expensesByDescription).length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>💸</span> ¿Dónde va mi dinero?
            </div>
            <div class="chart-container">
                <canvas id="descriptionChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${Object.keys(incomeDistribution).length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>💰</span> Distribución de Ingresos
            </div>
            <div class="chart-container">
                <canvas id="incomeChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${expenses.length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>📊</span> Tasa de Ahorro e Inversión Mensual
            </div>
            <div class="chart-container">
                <canvas id="savingsRateChart"></canvas>
            </div>
        </div>
        ` : ''}

        <div class="card">
            <div class="card-title">
                <span>📝</span> Últimos Movimientos
            </div>
            ${expenses.length > 0 || incomeHistory.length > 0 ? `
                <ul class="expense-list">
                    ${(() => {
                        // ✅ Combinar gastos e ingresos
                        const allTransactions = [
                            ...expenses.map(e => ({ ...e, type: 'expense' })),
                            ...incomeHistory.map(i => ({ ...i, type: 'income', category: i.type }))
                        ].sort((a, b) => new Date(b.date) - new Date(a.date))
                         .slice(0, 5);
                        
                        return allTransactions.map(trans => {
                            const isIncome = trans.type === 'income';
                            const icon = isIncome ? '💰' : '💸';
                            const color = isIncome ? 'var(--color-success)' : 'var(--color-danger)';
                            const sign = isIncome ? '+' : '-';
                            
                            return `
                                <li class="expense-item" style="border-left: 4px solid ${color};">
                                    <div class="expense-info">
                                        <div class="expense-description">${icon} ${trans.description}</div>
                                        <div class="expense-category">${trans.category} • ${trans.date}</div>
                                    </div>
                                    <div class="expense-amount" style="color: ${color};">
                                        ${sign}$${trans.amount.toLocaleString()}
                                    </div>
                                </li>
                            `;
                        }).join('');
                    })()}
                </ul>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No hay movimientos registrados<br>Presiona el botón + para agregar</p>
                </div>
            `}
        </div>
    `;
}

function renderExpenses() {
    // Variable para controlar qué tab está activo
    if (!window.activeExpensesTab) {
        window.activeExpensesTab = 'expenses';
    }
    
    return `
        <div class="card">
            <div class="card-title">
                <span>📊</span> Historial de Transacciones
            </div>
            
            <!-- 🔄 NUEVO: 3 Pestañas -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid rgba(5, 191, 219, 0.3); padding-bottom: 0.5rem;">
                <button class="tab-button" id="tab-expenses" onclick="switchTransactionTab('expenses')" 
                    style="flex: 1; padding: 0.75rem; background: ${window.activeExpensesTab === 'expenses' ? 'rgba(5, 191, 219, 0.2)' : 'rgba(255,255,255,0.1)'}; border: 2px solid ${window.activeExpensesTab === 'expenses' ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}; border-radius: 0.5rem; color: ${window.activeExpensesTab === 'expenses' ? 'white' : 'rgba(255,255,255,0.7)'}; font-weight: ${window.activeExpensesTab === 'expenses' ? 'bold' : 'normal'}; cursor: pointer; transition: all 0.3s ease;">
                    💸 Gastos (${expenses.length})
                </button>
                <button class="tab-button" id="tab-incomes" onclick="switchTransactionTab('incomes')" 
                    style="flex: 1; padding: 0.75rem; background: ${window.activeExpensesTab === 'incomes' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.1)'}; border: 2px solid ${window.activeExpensesTab === 'incomes' ? 'var(--color-success)' : 'rgba(255,255,255,0.2)'}; border-radius: 0.5rem; color: ${window.activeExpensesTab === 'incomes' ? 'white' : 'rgba(255,255,255,0.7)'}; font-weight: ${window.activeExpensesTab === 'incomes' ? 'bold' : 'normal'}; cursor: pointer; transition: all 0.3s ease;">
                    💰 Ingresos (${incomeHistory.length})
                </button>
                <button class="tab-button" id="tab-recurring" onclick="switchTransactionTab('recurring')" 
                    style="flex: 1; padding: 0.75rem; background: ${window.activeExpensesTab === 'recurring' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.1)'}; border: 2px solid ${window.activeExpensesTab === 'recurring' ? 'var(--color-secondary)' : 'rgba(255,255,255,0.2)'}; border-radius: 0.5rem; color: ${window.activeExpensesTab === 'recurring' ? 'white' : 'rgba(255,255,255,0.7)'}; font-weight: ${window.activeExpensesTab === 'recurring' ? 'bold' : 'normal'}; cursor: pointer; transition: all 0.3s ease;">
                    🔄 Recurrentes (${recurringModule ? recurringModule.recurringExpenses.filter(r => r.active).length : 0})
                </button>
            </div>
            
            <!-- Contenido de Gastos -->
            <div id="expenses-content" style="display: ${window.activeExpensesTab === 'expenses' ? 'block' : 'none'};">
                ${expenses.length > 0 ? `
                    <ul class="expense-list">
                        ${expenses.map(exp => `
                            <li class="expense-item" style="border-left: 4px solid var(--color-danger);">
                                <div class="expense-info">
                                    <div class="expense-description">
                                        💸 ${exp.description}
                                    </div>
                                    <div class="expense-category">${exp.category} • ${exp.date}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div class="expense-amount" style="color: var(--color-danger);">
                                        -$${exp.amount.toLocaleString()}
                                    </div>
                                    <button class="btn-icon" onclick="deleteExpense('${exp.id}')" title="Eliminar">
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">💸</div>
                        <p>No hay gastos registrados<br>Presiona el botón + para agregar tu primer gasto</p>
                    </div>
                `}
            </div>
            
            <!-- Contenido de Ingresos -->
            <div id="incomes-content" style="display: ${window.activeExpensesTab === 'incomes' ? 'block' : 'none'};">
                ${incomeHistory.length > 0 ? `
                    <ul class="expense-list">
                        ${incomeHistory.map(inc => `
                            <li class="expense-item" style="border-left: 4px solid var(--color-success);">
                                <div class="expense-info">
                                    <div class="expense-description">
                                        💰 ${inc.description}
                                    </div>
                                    <div class="expense-category">${inc.type} • ${inc.date}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div class="expense-amount" style="color: var(--color-success);">
                                        +$${inc.amount.toLocaleString()}
                                    </div>
                                    <button class="btn-delete" onclick="deleteIncome('${inc.id}')" title="Eliminar ingreso">
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                ` : `
                    <div class="empty-state">
                        <div class="empty-state-icon">💰</div>
                        <p>No hay ingresos registrados<br>Presiona el botón + para agregar tu primer ingreso</p>
                    </div>
                `}
            </div>
            
            <!-- 🔄 NUEVO: Contenido de Recurrentes -->
            <div id="recurring-content" style="display: ${window.activeExpensesTab === 'recurring' ? 'block' : 'none'};">
                ${typeof renderRecurringExpensesViewIntegrated === 'function' ? renderRecurringExpensesViewIntegrated() : '<div style="padding: 2rem; text-align: center;">Cargando módulo de recurrentes...</div>'}
            </div>
        </div>
    `;
}

function renderBudget() {
    const { expensesByCategory, totalExpenses } = calculateTotals();
    
    // ✨ Verificar si el usuario tiene presupuesto configurado
    const hasBudget = Object.values(budgets).some(b => b > 0);
    const hasExpenses = expenses.length > 0;
    
    // ✨ MODO 1: SIN PRESUPUESTO (Primera vez o sin configurar)
    if (!hasBudget) {
        return `
            <!-- ✨ BANNER INFORMATIVO PARA USUARIOS NUEVOS -->
            <div class="card" style="background: linear-gradient(135deg, rgba(5, 191, 219, 0.2), rgba(212, 175, 55, 0.2)); border: 2px solid var(--color-primary); text-align: center;">
                <div style="padding: 1rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                    <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--color-primary);">
                        ¡Bienvenido a Smarter Investment! 💰🧠
                    </div>
                    <div style="font-size: 1rem; color: rgba(255,255,255,0.9); line-height: 1.6;">
                        Para crear tu presupuesto personalizado:
                    </div>
                </div>
            </div>

            <!-- ✨ PASOS PARA EMPEZAR -->
            <div class="card">
                <div class="card-title">
                    <span>📝</span> Cómo Empezar
                </div>
                <div style="padding: 0.5rem 0;">
                    <div style="display: flex; align-items: start; gap: 1rem; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; margin-bottom: 1rem; border-left: 4px solid var(--color-primary);">
                        <div style="font-size: 2rem; min-width: 50px; text-align: center;">1️⃣</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--color-primary);">
                                Registra tus Ingresos
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Ve a la pestaña "Ingresos" y agrega todos tus ingresos mensuales (salario, freelance, etc.)
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; gap: 1rem; padding: 1rem; background: rgba(212, 175, 55, 0.1); border-radius: 0.75rem; margin-bottom: 1rem; border-left: 4px solid #D4AF37;">
                        <div style="font-size: 2rem; min-width: 50px; text-align: center;">2️⃣</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem; color: #D4AF37;">
                                Registra TODOS tus Gastos del Mes
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Ve a "Gastos" y registra cada gasto con su categoría y descripción. No te preocupes por el presupuesto todavía.
                            </div>
                            ${hasExpenses ? `
                                <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(34, 197, 94, 0.2); border-radius: 0.5rem; border: 2px solid rgba(34, 197, 94, 0.3);">
                                    <div style="font-size: 0.9rem; color: var(--color-success); font-weight: bold;">
                                        ✅ Ya tienes ${expenses.length} ${expenses.length === 1 ? 'gasto registrado' : 'gastos registrados'}
                                    </div>
                                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-top: 0.25rem;">
                                        Total: $${totalExpenses.toLocaleString()}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div style="display: flex; align-items: start; gap: 1rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border-left: 4px solid var(--color-success);">
                        <div style="font-size: 2rem; min-width: 50px; text-align: center;">3️⃣</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--color-success);">
                                Genera tu Presupuesto Automático
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Cuando termines de registrar gastos, haz clic en el botón abajo. La app creará tu presupuesto basado en tus gastos REALES.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✨ BOTÓN PRINCIPAL: GENERAR DESDE GASTOS -->
            ${hasExpenses ? `
                <div class="card" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(5, 191, 219, 0.2)); border: 2px solid var(--color-success); box-shadow: 0 8px 24px rgba(34, 197, 94, 0.4);">
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem; animation: bounce 2s ease-in-out infinite;">💰</div>
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">
                            ¡Listo para Crear tu Presupuesto!
                        </div>
                        <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9); margin-bottom: 1.5rem;">
                            Tienes <strong>${expenses.length} ${expenses.length === 1 ? 'gasto' : 'gastos'}</strong> registrados por un total de <strong>$${totalExpenses.toLocaleString()}</strong>
                        </div>
                        <button class="btn btn-primary" onclick="generateBudgetFromExpenses()" style="padding: 1.2rem 2.5rem; font-size: 1.1rem; box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5); animation: pulseAmount 2s ease-in-out infinite;">
                            ✨ Generar Mi Presupuesto desde Gastos
                        </button>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 1rem;">
                            Se analizarán tus gastos reales para crear un presupuesto personalizado
                        </div>
                    </div>
                </div>
            ` : `
                <div class="card" style="background: rgba(245, 158, 11, 0.15); border: 2px solid rgba(245, 158, 11, 0.4);">
                    <div style="text-align: center; padding: 1rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                        <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; color: #f59e0b;">
                            Empieza Registrando tus Gastos
                        </div>
                        <div style="font-size: 0.95rem; color: rgba(255,255,255,0.8);">
                            Ve a la pestaña "Gastos" y registra todos tus gastos del mes.<br>
                            Cuando termines, vuelve aquí para generar tu presupuesto.
                        </div>
                    </div>
                </div>
            `}

            <!-- ✨ OPCIÓN ALTERNATIVA -->
            <div class="card">
                <div class="card-title">
                    <span>🎯</span> ¿Prefieres Crear Presupuesto Manualmente?
                </div>
                <div style="padding: 1rem;">
                    <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9); margin-bottom: 1rem;">
                        Si ya sabes cuánto quieres gastar en cada categoría, puedes crear tu presupuesto basándote en tus ingresos:
                    </div>
                    <button class="btn btn-secondary" onclick="generateAutoBudget()" style="width: 100%;">
                        🤖 Generar Presupuesto desde Ingresos
                    </button>
                </div>
            </div>
        `;
    }
    
    // ✨ MODO 2: CON PRESUPUESTO CONFIGURADO (Usuario con experiencia)
    // [Resto del código original de renderBudget...]
    
    // Verificar alertas de presupuesto con 3 niveles
    const alertsWarning = []; // 71-85%
    const alertsCritical = []; // 86-99%
    const alertsDanger = []; // 100%+
    
    Object.entries(budgets).forEach(([cat, budget]) => {
        if (budget > 0) {
            const spent = expensesByCategory[cat] || 0;
            const percentage = (spent / budget * 100);
            
            if (percentage >= 100) {
                alertsDanger.push({
                    category: cat,
                    percentage: percentage.toFixed(1),
                    spent: spent,
                    budget: budget,
                    level: 'danger'
                });
            } else if (percentage >= 86) {
                alertsCritical.push({
                    category: cat,
                    percentage: percentage.toFixed(1),
                    spent: spent,
                    budget: budget,
                    level: 'critical'
                });
            } else if (percentage >= 71) {
                alertsWarning.push({
                    category: cat,
                    percentage: percentage.toFixed(1),
                    spent: spent,
                    budget: budget,
                    level: 'warning'
                });
            }
        }
    });
    
    const hasAlerts = alertsDanger.length > 0 || alertsCritical.length > 0 || alertsWarning.length > 0;
    
    return `
        <!-- ✨ BOTÓN SIEMPRE VISIBLE: GENERAR/ACTUALIZAR PRESUPUESTO DESDE GASTOS -->
        <div class="card" style="background: linear-gradient(135deg, rgba(5, 191, 219, 0.15), rgba(34, 197, 94, 0.15)); border: 2px solid var(--color-primary);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>${Object.values(budgets).some(b => b > 0) ? 'Actualizar Presupuesto' : 'Generar Presupuesto'}</span>
                    </div>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8); line-height: 1.5;">
                        ${expenses.length > 0 ? 
                            `Tienes ${expenses.length} ${expenses.length === 1 ? 'gasto registrado' : 'gastos registrados'} este mes. ${Object.values(budgets).some(b => b > 0) ? 'Actualiza tu presupuesto' : 'Genera tu presupuesto'} basándote en tus gastos reales.` :
                            'Registra tus gastos del mes y luego genera tu presupuesto automáticamente.'
                        }
                    </div>
                </div>
                <button class="btn btn-primary" onclick="generateBudgetFromExpenses()" 
                    style="padding: 1rem 2rem; font-size: 1rem; white-space: nowrap; box-shadow: 0 4px 12px rgba(5, 191, 219, 0.4);"
                    ${expenses.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    ${Object.values(budgets).some(b => b > 0) ? '🔄 Actualizar desde Gastos' : '✨ Generar desde Gastos'}
                </button>
            </div>
            ${expenses.length === 0 ? `
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(245, 158, 11, 0.2); border-radius: 0.5rem; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                        ⚠️ <strong>Primero registra tus gastos</strong> - Ve a la pestaña "Gastos" y agrega todos tus gastos del mes
                    </div>
                </div>
            ` : ''}
        </div>
        
        <!-- ✨ MEJORADO: ALERTAS CON 3 NIVELES -->
        ${hasAlerts ? `
        <div class="card" style="background: rgba(0, 11, 46, 0.6); border: 2px solid ${alertsDanger.length > 0 ? 'var(--color-danger)' : alertsCritical.length > 0 ? '#f97316' : '#f59e0b'};">
            <div class="card-title" style="color: ${alertsDanger.length > 0 ? 'var(--color-danger)' : alertsCritical.length > 0 ? '#f97316' : '#f59e0b'};">
                <span>${alertsDanger.length > 0 ? '🚫' : alertsCritical.length > 0 ? '🔴' : '⚠️'}</span> 
                Alertas de Presupuesto (${alertsDanger.length + alertsCritical.length + alertsWarning.length})
            </div>
            
            ${alertsDanger.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.95rem; font-weight: bold; color: var(--color-danger); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem; animation: shake 0.5s ease-in-out infinite;">🚫</span>
                        <span>CRÍTICO - Presupuesto Excedido (${alertsDanger.length})</span>
                    </div>
                    ${alertsDanger.map(alert => `
                        <div style="padding: 1rem; margin-bottom: 0.75rem; background: rgba(239, 68, 68, 0.2); border-radius: 0.75rem; border: 2px solid var(--color-danger); animation: pulseAlert 2s ease-in-out infinite;">
                            <div style="font-weight: bold; margin-bottom: 0.5rem; font-size: 1.05rem; display: flex; align-items: center; justify-content: space-between;">
                                <span>🚫 ${alert.category}</span>
                                <span style="color: var(--color-danger); font-size: 1.2rem;">${alert.percentage}%</span>
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Has gastado <span style="color: var(--color-danger); font-weight: bold;">$${alert.spent.toLocaleString()}</span> 
                                de tu presupuesto de <span style="color: var(--color-primary); font-weight: bold;">$${alert.budget.toLocaleString()}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: var(--color-danger); margin-top: 0.5rem; font-weight: bold;">
                                🚫 ¡Excedido por $${(alert.spent - alert.budget).toLocaleString()}!
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${alertsCritical.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.95rem; font-weight: bold; color: #f97316; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">🔴</span>
                        <span>ALERTA ALTA - Muy cerca del límite (${alertsCritical.length})</span>
                    </div>
                    ${alertsCritical.map(alert => `
                        <div style="padding: 1rem; margin-bottom: 0.75rem; background: rgba(249, 115, 22, 0.2); border-radius: 0.75rem; border: 2px solid #f97316;">
                            <div style="font-weight: bold; margin-bottom: 0.5rem; font-size: 1.05rem; display: flex; align-items: center; justify-content: space-between;">
                                <span>🔴 ${alert.category}</span>
                                <span style="color: #f97316; font-size: 1.2rem;">${alert.percentage}%</span>
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Has gastado <span style="color: #f97316; font-weight: bold;">$${alert.spent.toLocaleString()}</span> 
                                de tu presupuesto de <span style="color: var(--color-primary); font-weight: bold;">$${alert.budget.toLocaleString()}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #f97316; margin-top: 0.5rem;">
                                🔴 Solo te quedan $${(alert.budget - alert.spent).toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${alertsWarning.length > 0 ? `
                <div>
                    <div style="font-size: 0.95rem; font-weight: bold; color: #f59e0b; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">⚠️</span>
                        <span>ATENCIÓN - Acercándose al límite (${alertsWarning.length})</span>
                    </div>
                    ${alertsWarning.map(alert => `
                        <div style="padding: 1rem; margin-bottom: 0.75rem; background: rgba(245, 158, 11, 0.15); border-radius: 0.75rem; border: 2px solid rgba(245, 158, 11, 0.4);">
                            <div style="font-weight: bold; margin-bottom: 0.5rem; font-size: 1.05rem; display: flex; align-items: center; justify-content: space-between;">
                                <span>⚠️ ${alert.category}</span>
                                <span style="color: #f59e0b; font-size: 1.2rem;">${alert.percentage}%</span>
                            </div>
                            <div style="font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                                Has gastado <span style="color: #f59e0b; font-weight: bold;">$${alert.spent.toLocaleString()}</span> 
                                de tu presupuesto de <span style="color: var(--color-primary); font-weight: bold;">$${alert.budget.toLocaleString()}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #f59e0b; margin-top: 0.5rem;">
                                ⚠️ Disponible: $${(alert.budget - alert.spent).toLocaleString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
        ` : ''}
        
        <!-- ✨ NUEVA: TABLA COMPARATIVA -->
        ${renderBudgetComparisonTable()}
    
        <div class="card">
            <div class="card-title">
                <span>📋</span> Control de Presupuesto
            </div>
            ${Object.entries(budgets).map(([cat, budget]) => {
                const spent = expensesByCategory[cat] || 0;
                const percentage = budget > 0 ? (spent / budget * 100).toFixed(1) : 0;
                const percentageInt = parseInt(percentage);
                const remaining = budget - spent;
                const count = expenses.filter(e => e.category === cat).length;
                
                let progressClass = 'high';
                let statusIcon = '✅';
                let statusText = 'Disponible';
                let statusColor = 'var(--color-success)';
                
                if (percentageInt >= 100) {
                    progressClass = 'complete';
                    statusIcon = '🚫';
                    statusText = 'Excedido';
                    statusColor = 'var(--color-danger)';
                } else if (percentageInt >= 86) {
                    progressClass = 'critical';
                    statusIcon = '🔴';
                    statusText = 'Crítico';
                    statusColor = '#f97316';
                } else if (percentageInt >= 71) {
                    progressClass = 'medium';
                    statusIcon = '⚠️';
                    statusText = 'Alerta';
                    statusColor = '#f59e0b';
                } else if (percentageInt < 50) {
                    progressClass = 'low';
                }
                
                return `
                    <div class="progress-container" style="cursor: pointer; transition: all 0.3s ease; position: relative;" 
                         onclick="showCategoryDetailsBudget('${cat}')"
                         onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 12px rgba(5, 191, 219, 0.3)';"
                         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='';">
                        ${percentageInt >= 71 ? `
                            <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${percentageInt >= 100 ? 'var(--color-danger)' : percentageInt >= 86 ? '#f97316' : '#f59e0b'}; color: white; padding: 0.4rem 0.8rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 0.25rem; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5); animation: pulseAlert 2s ease-in-out infinite; z-index: 10;">
                                <span style="animation: shake 0.5s ease-in-out infinite;">${percentageInt >= 100 ? '🚫' : percentageInt >= 86 ? '🔴' : '⚠️'}</span>
                                <span>${percentage}%</span>
                            </div>
                        ` : ''}
                        <div class="progress-label">
                            <span class="progress-label-name">${cat}</span>
                            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                                <span class="progress-label-value">$${spent.toLocaleString()} / $${budget.toLocaleString()}</span>
                                <span style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${count} ${count === 1 ? 'gasto' : 'gastos'}</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentageInt, 100)}%;">
                                ${percentage}%
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem;">
                            <div style="font-size: 0.9rem; color: ${statusColor};">
                                ${statusIcon} ${statusText}: $${Math.abs(remaining).toLocaleString()}
                            </div>
                            <div style="font-size: 0.85rem; padding: 0.25rem 0.75rem; background: ${statusColor}33; color: ${statusColor}; border-radius: 1rem; font-weight: bold;">
                                ${percentage}%
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderGoals() {
    return `
        <div class="card">
            <div class="card-title">
                <span>🎯</span> Mis Metas Financieras
                <div style="margin-left: auto; font-size: 1rem; color: rgba(255,255,255,0.7);">
                    ${goals.length} metas
                </div>
            </div>
            ${goals.length > 0 ? `
                <ul class="goal-list">
                    ${goals.map(goal => {
                        const percentage = (goal.current / goal.target * 100).toFixed(0);
                        let progressClass = 'high';
                        if (percentage >= 100) progressClass = 'complete';
                        else if (percentage < 50) progressClass = 'low';
                        else if (percentage < 80) progressClass = 'medium';
                        
                        const emoji = getGoalEmoji(goal.type);
                        
                        return `
                            <li class="goal-item" style="display: block;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <div class="goal-info">
                                        <div class="goal-name">${emoji} ${goal.name}</div>
                                        <div class="goal-type">${goal.type}</div>
                                    </div>
                                    <div style="display: flex; gap: 0.5rem;">
                                        <button class="btn-icon" onclick="openAddMoneyModal('${goal.id}', '${goal.name}')" title="Agregar dinero" style="background: rgba(34, 197, 94, 0.2); color: var(--color-success);">
                                            💵
                                        </button>
                                        <button class="btn-icon" onclick="deleteGoal('${goal.id}')" title="Eliminar">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%;">
                                        ${percentage}%
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; font-size: 1rem;">
                                    <span class="goal-amount">$${goal.current.toLocaleString()}</span>
                                    <span style="color: rgba(255,255,255,0.7);">Meta: $${goal.target.toLocaleString()}</span>
                                </div>
                                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: ${percentage >= 100 ? 'var(--color-success)' : 'rgba(255,255,255,0.6)'};">
                                    ${percentage >= 100 ? '🎉 ¡Meta alcanzada!' : `Faltan: $${(goal.target - goal.current).toLocaleString()}`}
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <p>No hay metas creadas<br>Presiona el botón + para crear tu primera meta</p>
                </div>
            `}
        </div>
    `;
}

function renderReports() {
    const { totalIncome, totalExpenses, balance, expensesByCategory } = calculateTotals();
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
    
    // Obtener datos mensuales
    const monthlyData = calculateMonthlyTotals();
    const monthKeys = Object.keys(monthlyData).sort().reverse().slice(0, 3);
    
    return `
        <div class="card">
            <div class="card-title">
                <span>📊</span> Reporte Mensual
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-primary);">💼 Resumen General</h3>
                <div style="background: rgba(0, 11, 46, 0.6); padding: 1.5rem; border-radius: 1rem; border: 2px solid rgba(5, 191, 219, 0.3);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 1.05rem;">
                        <span>Total Ingresos:</span>
                        <span class="text-success" style="font-weight: bold;">+$${totalIncome.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 1.05rem;">
                        <span>Total Gastos:</span>
                        <span class="text-danger" style="font-weight: bold;">-$${totalExpenses.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 0.75rem; border-top: 2px solid rgba(5, 191, 219, 0.3); font-size: 1.1rem;">
                        <span style="font-weight: bold;">Balance Final:</span>
                        <span class="${balance >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: bold; font-size: 1.4rem;">
                            ${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(5, 191, 219, 0.2); font-size: 1.05rem;">
                        <span>Tasa de Ahorro:</span>
                        <span style="color: var(--color-primary); font-weight: bold;">${savingsRate}%</span>
                    </div>
                </div>
            </div>

            ${monthKeys.length > 1 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-primary);">📅 Comparativo Mensual</h3>
                    ${monthKeys.map(monthKey => {
                        const monthData = monthlyData[monthKey];
                        const monthBalance = monthData.income - monthData.expenses;
                        const monthSavingsRate = monthData.income > 0 ? ((monthBalance / monthData.income) * 100).toFixed(1) : 0;
                        const [year, month] = monthKey.split('-');
                        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        const monthName = `${monthNames[parseInt(month) - 1]} ${year}`;
                        
                        return `
                            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.2rem; border-radius: 0.85rem; border: 2px solid rgba(5, 191, 219, 0.2); margin-bottom: 1rem;">
                                <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 0.75rem; color: var(--color-primary);">${monthName}</div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
                                    <span>Ingresos:</span>
                                    <span class="text-success">+$${monthData.income.toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
                                    <span>Gastos:</span>
                                    <span class="text-danger">-$${monthData.expenses.toLocaleString()}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid rgba(5, 191, 219, 0.2); font-size: 1rem;">
                                    <span>Balance:</span>
                                    <span class="${monthBalance >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: bold;">
                                        ${monthBalance >= 0 ? '+' : ''}$${monthBalance.toLocaleString()}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.9rem;">
                                    <span style="color: rgba(255,255,255,0.7);">Tasa de Ahorro:</span>
                                    <span style="color: var(--color-primary); font-weight: bold;">${monthSavingsRate}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}

            ${Object.keys(expensesByCategory).length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--color-primary);">📈 Distribución de Gastos</h3>
                    ${Object.entries(expensesByCategory).map(([cat, amount]) => {
                        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
                        return `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding: 1rem; background: rgba(0, 11, 46, 0.6); border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2);">
                                <span style="font-weight: 600;">${cat}</span>
                                <div style="text-align: right;">
                                    <div style="color: var(--color-primary); font-weight: bold; font-size: 1.1rem;">$${amount.toLocaleString()}</div>
                                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${percentage}%</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}

            <div style="background: rgba(5, 191, 219, 0.15); border: 2px solid rgba(5, 191, 219, 0.4); border-radius: 1rem; padding: 1.5rem;">
                <div style="font-weight: bold; margin-bottom: 1rem; color: var(--color-primary); font-size: 1.15rem;">💡 Recomendaciones</div>
                <ul style="list-style: none; font-size: 1rem; color: rgba(255,255,255,0.95); line-height: 2;">
                    ${balance < 0 ? 
                        '<li>⚠️ Tus gastos superan tus ingresos. Considera revisar gastos discrecionales.</li>' : 
                        '<li>✅ Tu balance es positivo. ¡Excelente trabajo!</li>'
                    }
                    ${savingsRate < 20 ? 
                        '<li>💰 Intenta ahorrar al menos el 20% de tus ingresos mensuales.</li>' : 
                        '<li>🎉 ¡Excelente tasa de ahorro! Sigue así.</li>'
                    }
                    ${(expensesByCategory['Gastos Discrecionales'] || 0) > budgets['Gastos Discrecionales'] ? 
                        '<li>🎯 Los gastos discrecionales excedieron el presupuesto. Considera reducirlos.</li>' : ''
                    }
                    ${goals.length === 0 ? 
                        '<li>🎯 Crea metas financieras para mantener el enfoque en tus objetivos.</li>' : ''
                    }
                </ul>
            </div>
        </div>

        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <div class="card-title" style="margin: 0;">
                    <span>👤</span> Mi Cuenta
                </div>
                <button class="btn-icon" onclick="handleLogout()" style="padding: 0.9rem 1.2rem; background: rgba(239, 68, 68, 0.25); color: var(--color-danger); border: 2px solid rgba(239, 68, 68, 0.5); font-size: 1rem;">
                    🚪 Cerrar Sesión
                </button>
            </div>
            <div style="padding: 1.2rem; background: rgba(0, 11, 46, 0.6); border-radius: 0.85rem; border: 2px solid rgba(5, 191, 219, 0.3);">
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.65); margin-bottom: 0.4rem;">Email:</div>
                <div style="font-weight: 600; font-size: 1.05rem;">${currentUser ? currentUser.email : ''}</div>
            </div>
        </div>
    `;
}

// ========================================
// ✨✨✨ NUEVA FUNCIÓN: SECCIÓN "MÁS" ✨✨✨
// ========================================
function renderMoreSection() {
    return `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Gastos Recurrentes -->
            <div class="card" onclick="switchTab('more-recurring')" style="cursor: pointer;">
                <h3>🔄 Gastos Recurrentes Automáticos</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 0.5rem;">
                    Configura gastos que se repiten y deja que la app los registre por ti
                </p>
            </div>
            
            <!-- Reportes Interactivos -->
            <div class="card" onclick="switchTab('more-reports')" style="cursor: pointer;">
                <h3>📊 Reportes Detallados</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-top: 0.5rem;">
                    Análisis profundo, gráficos comparativos y exportación de datos
                </p>
            </div>
            
            <!-- Comparación Temporal -->
            ${renderComparisonView()}
            
            <!-- Notificaciones -->
            ${renderNotificationSettings()}
        </div>
    `;
}
// ========================================
// 🔄 VISTA DE GASTOS RECURRENTES - CÓDIGO COMPLETO
// ========================================
// Este código va DESPUÉS de la función renderMoreSection() en app.js

/**
 * 🔄 Renderizar vista completa de gastos recurrentes
 */
function renderRecurringExpensesView() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Módulo de Gastos Recurrentes no disponible</h3>
                <p style="color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
                    Por favor, recarga la página
                </p>
            </div>
        `;
    }

    const stats = recurringModule.getStatistics();
    const upcoming = recurringModule.getUpcomingExpenses(30);
    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    const pausedRecurring = recurringModule.recurringExpenses.filter(r => !r.active);

    return `
        <div style="padding: 1rem;">
            <!-- Header con botón volver -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <button onclick="switchTab('more')" class="btn-back" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 0.5rem; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                    ← Volver
                </button>
                <h2 style="margin: 0; flex: 1; text-align: center;">🔄 Gastos Recurrentes</h2>
                <div style="width: 80px;"></div>
            </div>

            <!-- Estadísticas rápidas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-success);">${stats.active}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Activos</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-warning);">${stats.paused}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Pausados</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Mensual estimado</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-info);">${stats.totalGenerated}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Generados (30d)</div>
                </div>
            </div>

            <!-- Botón para agregar nuevo -->
            <button 
                onclick="openRecurringModal()" 
                class="add-recurring-btn"
                style="width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border: none; border-radius: 0.85rem; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(5, 191, 219, 0.3);">
                <span style="font-size: 1.5rem;">+</span>
                Agregar Gasto Recurrente
            </button>

            <!-- Tabs: Activos / Pausados / Próximos / Gráficas -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                <button onclick="switchRecurringTab('active')" id="recurring-tab-active" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(5, 191, 219, 0.2); border: 1px solid var(--color-primary); border-radius: 0.5rem; color: white; cursor: pointer; white-space: nowrap; font-weight: 600;">
                    ✅ Activos (${stats.active})
                </button>
                <button onclick="switchRecurringTab('paused')" id="recurring-tab-paused" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    ⏸️ Pausados (${stats.paused})
                </button>
                <button onclick="switchRecurringTab('upcoming')" id="recurring-tab-upcoming" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    📅 Próximos (${upcoming.length})
                </button>
                <button onclick="switchRecurringTab('charts')" id="recurring-tab-charts" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    📊 Gráficas
                </button>
            </div>

            <!-- Contenido de tabs -->
            <div id="recurring-content-active" class="recurring-content">
                ${renderRecurringList(activeRecurring, 'active')}
            </div>

            <div id="recurring-content-paused" class="recurring-content" style="display: none;">
                ${renderRecurringList(pausedRecurring, 'paused')}
            </div>

            <div id="recurring-content-upcoming" class="recurring-content" style="display: none;">
                ${renderUpcomingExpenses(upcoming)}
            </div>

            <div id="recurring-content-charts" class="recurring-content" style="display: none;">
                ${renderRecurringCharts(stats)}
            </div>
        </div>
    `;
}

/**
 * 📋 Renderizar lista de gastos recurrentes
 */
function renderRecurringList(recurringList, type) {
    if (recurringList.length === 0) {
        const messages = {
            active: { icon: '✅', text: 'No hay gastos recurrentes activos', subtext: 'Agrega uno para automatizar tus gastos' },
            paused: { icon: '⏸️', text: 'No hay gastos pausados', subtext: 'Los gastos pausados aparecerán aquí' }
        };
        const msg = messages[type];
        
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${msg.icon}</div>
                <h3>${msg.text}</h3>
                <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem;">${msg.subtext}</p>
            </div>
        `;
    }

    return recurringList.map(recurring => {
        const freqInfo = recurringModule.frequencies[recurring.frequency];
        const nextDate = new Date(recurring.nextDate);
        const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0;
        const category = categorias.find(c => c.nombre === recurring.category);
        
        return `
            <div class="card" style="margin-bottom: 1rem; position: relative; border-left: 4px solid ${category ? category.color : 'var(--color-primary)'};">
                <!-- Badge de estado -->
                ${isOverdue ? `
                    <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: var(--color-danger); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                        ⚠️ Vencido
                    </div>
                ` : ''}
                
                <!-- Contenido principal -->
                <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                    <!-- Icono de frecuencia -->
                    <div style="font-size: 2.5rem; flex-shrink: 0;">${freqInfo.icon}</div>
                    
                    <!-- Información -->
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${recurring.description}</h3>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <!-- Monto -->
                            <div style="background: rgba(239, 68, 68, 0.2); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-weight: 600; color: var(--color-danger);">
                                $${recurring.amount.toFixed(2)}
                            </div>
                            
                            <!-- Frecuencia -->
                            <div style="background: rgba(5, 191, 219, 0.2); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; color: var(--color-primary);">
                                ${freqInfo.label}
                            </div>
                            
                            <!-- Categoría -->
                            <div style="background: rgba(255,255,255,0.1); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                                ${category ? category.emoji : '📌'} ${recurring.category}
                            </div>
                        </div>
                        
                        <!-- Próxima fecha -->
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                            ${type === 'active' ? `
                                📅 Próximo: ${nextDate.toLocaleDateString('es-ES')}
                                ${!isOverdue ? `<span style="color: var(--color-info);">(en ${daysUntil} día${daysUntil !== 1 ? 's' : ''})</span>` : ''}
                            ` : `
                                🗓️ Desde: ${new Date(recurring.startDate).toLocaleDateString('es-ES')}
                            `}
                        </div>
                        
                        <!-- Estadísticas -->
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                            📊 Generado ${recurring.timesGenerated || 0} veces
                            ${recurring.lastGenerated ? ` · Último: ${new Date(recurring.lastGenerated.seconds * 1000).toLocaleDateString('es-ES')}` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Botones de acción -->
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${type === 'active' ? `
                        <button onclick="pauseRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(251, 191, 36, 0.2); border: 1px solid var(--color-warning); border-radius: 0.5rem; color: var(--color-warning); cursor: pointer; font-weight: 600;">
                            ⏸️ Pausar
                        </button>
                    ` : `
                        <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(34, 197, 94, 0.2); border: 1px solid var(--color-success); border-radius: 0.5rem; color: var(--color-success); cursor: pointer; font-weight: 600;">
                            ▶️ Activar
                        </button>
                    `}
                    
                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(5, 191, 219, 0.2); border: 1px solid var(--color-primary); border-radius: 0.5rem; color: var(--color-primary); cursor: pointer; font-weight: 600;">
                        ✏️ Editar
                    </button>
                    
                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--color-danger); border-radius: 0.5rem; color: var(--color-danger); cursor: pointer; font-weight: 600;">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 📅 Renderizar próximos gastos (calendario)
 */
function renderUpcomingExpenses(upcoming) {
    if (upcoming.length === 0) {
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                <h3>No hay gastos próximos</h3>
                <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem;">Los próximos 30 días están libres</p>
            </div>
        `;
    }

    // Agrupar por semana
    const byWeek = {};
    upcoming.forEach(item => {
        const weekStart = new Date(item.dueDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!byWeek[weekKey]) {
            byWeek[weekKey] = [];
        }
        byWeek[weekKey].push(item);
    });

    return Object.entries(byWeek).map(([weekKey, items]) => {
        const weekStart = new Date(weekKey);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const totalWeek = items.reduce((sum, item) => sum + item.amount, 0);
        
        return `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin: 0;">
                        📅 ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </h3>
                    <div style="font-weight: 600; color: var(--color-danger);">
                        $${totalWeek.toFixed(2)}
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${items.map(item => {
                        const category = categorias.find(c => c.nombre === item.category);
                        const isToday = item.daysUntil === 0;
                        const isTomorrow = item.daysUntil === 1;
                        
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; ${isToday ? 'border: 2px solid var(--color-warning);' : ''}">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="font-size: 1.5rem;">${category ? category.emoji : '📌'}</div>
                                    <div>
                                        <div style="font-weight: 600;">${item.description}</div>
                                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                            ${item.dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            ${isToday ? '<span style="color: var(--color-warning); font-weight: 600;"> · HOY</span>' : ''}
                                            ${isTomorrow ? '<span style="color: var(--color-info); font-weight: 600;"> · MAÑANA</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div style="font-weight: 600; color: var(--color-danger);">
                                    $${item.amount.toFixed(2)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 📊 Renderizar gráficas
 */
function renderRecurringCharts(stats) {
    return `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Gráfica: Distribución por categoría -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📊 Distribución por Categoría</h3>
                <canvas id="recurring-category-chart" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Gráfica: Distribución por frecuencia -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">🔄 Distribución por Frecuencia</h3>
                <canvas id="recurring-frequency-chart" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Comparativo: Gastos totales vs recurrentes -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">💰 Impacto en el Presupuesto</h3>
                <div style="padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255,255,255,0.7);">Gastos totales este mes:</span>
                        <span style="font-weight: 600;">$${calculateMonthlyTotal().toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255,255,255,0.7);">Recurrentes estimados:</span>
                        <span style="font-weight: 600; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                        <span style="color: rgba(255,255,255,0.9); font-weight: 600;">% del presupuesto:</span>
                        <span style="font-weight: 700; color: var(--color-warning);">
                            ${calculateMonthlyTotal() > 0 ? ((stats.monthlyEstimate / calculateMonthlyTotal()) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                </div>
                <canvas id="recurring-impact-chart" style="max-height: 250px;"></canvas>
            </div>
            
            <!-- Timeline de generación -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📈 Historial de Generación (últimos 30 días)</h3>
                ${renderGenerationTimeline()}
            </div>
        </div>
    `;
}

/**
 * 📈 Renderizar timeline de generación
 */
function renderGenerationTimeline() {
    const history = recurringModule.generatedHistory;
    
    if (history.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                <div>No hay gastos generados en los últimos 30 días</div>
            </div>
        `;
    }

    // Agrupar por día
    const byDay = {};
    history.forEach(expense => {
        const day = expense.date;
        if (!byDay[day]) {
            byDay[day] = [];
        }
        byDay[day].push(expense);
    });

    return `
        <div style="max-height: 400px; overflow-y: auto;">
            ${Object.entries(byDay)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([day, expenses]) => {
                    const totalDay = expenses.reduce((sum, e) => sum + e.amount, 0);
                    const date = new Date(day);
                    
                    return `
                        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600;">
                                    ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span style="font-weight: 600; color: var(--color-danger);">
                                    $${totalDay.toFixed(2)}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem;">
                                ${expenses.map(expense => {
                                    const category = categorias.find(c => c.nombre === expense.category);
                                    return `
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                                            <span style="color: rgba(255,255,255,0.8);">
                                                ${category ? category.emoji : '📌'} ${expense.description}
                                            </span>
                                            <span style="color: rgba(255,255,255,0.9);">
                                                $${expense.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
        </div>
    `;
}

/**
 * 🎯 Cambiar entre tabs de recurrentes
 */
function switchRecurringTab(tab) {
    // Actualizar tabs
    ['active', 'paused', 'upcoming', 'charts'].forEach(t => {
        const tabButton = document.getElementById(`recurring-tab-${t}`);
        const content = document.getElementById(`recurring-content-${t}`);
        
        if (t === tab) {
            tabButton.style.background = 'rgba(5, 191, 219, 0.2)';
            tabButton.style.borderColor = 'var(--color-primary)';
            tabButton.style.color = 'white';
            tabButton.style.fontWeight = '600';
            content.style.display = 'block';
        } else {
            tabButton.style.background = 'rgba(255,255,255,0.1)';
            tabButton.style.borderColor = 'rgba(255,255,255,0.2)';
            tabButton.style.color = 'rgba(255,255,255,0.7)';
            tabButton.style.fontWeight = '400';
            content.style.display = 'none';
        }
    });

    // Renderizar gráficos si es necesario
    if (tab === 'charts') {
        setTimeout(() => {
            renderRecurringChartsCanvas();
        }, 100);
    }
}

/**
 * 📊 Renderizar gráficos con Chart.js
 */
function renderRecurringChartsCanvas() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado');
        return;
    }

    const stats = recurringModule.getStatistics();

    // Gráfico de categorías
    const categoryCanvas = document.getElementById('recurring-category-chart');
    if (categoryCanvas && stats.byCategory) {
        const categories = Object.keys(stats.byCategory);
        const amounts = Object.values(stats.byCategory);
        const colors = categories.map(cat => {
            const category = categorias.find(c => c.nombre === cat);
            return category ? category.color : 'rgba(5, 191, 219, 0.7)';
        });

        new Chart(categoryCanvas, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#000b2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white', padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de frecuencias
    const frequencyCanvas = document.getElementById('recurring-frequency-chart');
    if (frequencyCanvas && stats.byFrequency) {
        const frequencies = Object.keys(stats.byFrequency);
        const counts = Object.values(stats.byFrequency);
        const labels = frequencies.map(f => recurringModule.frequencies[f]?.label || f);

        new Chart(frequencyCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad',
                    data: counts,
                    backgroundColor: 'rgba(5, 191, 219, 0.7)',
                    borderColor: 'var(--color-primary)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: 'white',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Gráfico de impacto
    const impactCanvas = document.getElementById('recurring-impact-chart');
    if (impactCanvas) {
        const totalExpenses = calculateMonthlyTotal();
        const recurring = stats.monthlyEstimate;
        const other = Math.max(0, totalExpenses - recurring);

        new Chart(impactCanvas, {
            type: 'pie',
            data: {
                labels: ['Gastos Recurrentes', 'Otros Gastos'],
                datasets: [{
                    data: [recurring, other],
                    backgroundColor: [
                        'rgba(5, 191, 219, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 2,
                    borderColor: '#000b2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white', padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed || 0;
                                const total = totalExpenses;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * 💰 Calcular total de gastos del mes
 */
function calculateMonthlyTotal() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    return expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
        })
        .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * ➕ Abrir modal para crear/editar gasto recurrente
 */
function openRecurringModal(recurringId = null) {
    const isEdit = recurringId !== null;
    const recurring = isEdit ? recurringModule.recurringExpenses.find(r => r.id === recurringId) : null;

    const modalHTML = `
        <div class="modal-backdrop" onclick="closeRecurringModal()"></div>
        <div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>${isEdit ? '✏️ Editar' : '➕ Agregar'} Gasto Recurrente</h2>
                <button onclick="closeRecurringModal()" class="modal-close">×</button>
            </div>
            
            <form id="recurring-form" onsubmit="handleRecurringSubmit(event, ${isEdit ? `'${recurringId}'` : 'null'})" style="padding: 1.5rem;">
                <!-- Descripción -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Descripción *
                    </label>
                    <input 
                        type="text" 
                        id="recurring-description" 
                        value="${isEdit ? recurring.description : ''}"
                        placeholder="Ej: Netflix, Renta, Gym"
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                </div>

                <!-- Monto -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Monto ($) *
                    </label>
                    <input 
                        type="number" 
                        id="recurring-amount" 
                        value="${isEdit ? recurring.amount : ''}"
                        step="0.01" 
                        min="0.01" 
                        placeholder="0.00"
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                </div>

                <!-- Categoría -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Categoría *
                    </label>
                    <select 
                        id="recurring-category" 
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    >
                        <option value="" ${!isEdit ? 'selected' : ''}>Selecciona una categoría</option>
                        ${categorias.filter(c => c.tipo === 'gasto').map(cat => `
                            <option value="${cat.nombre}" ${isEdit && recurring.category === cat.nombre ? 'selected' : ''}>
                                ${cat.emoji} ${cat.nombre}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Frecuencia -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Frecuencia *
                    </label>
                    <select 
                        id="recurring-frequency" 
                        required
                        onchange="toggleDayOfMonth()"
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    >
                        ${Object.entries(recurringModule.frequencies).map(([key, freq]) => `
                            <option value="${key}" ${isEdit && recurring.frequency === key ? 'selected' : ''}>
                                ${freq.icon} ${freq.label}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Día del mes (solo para mensual) -->
                <div id="day-of-month-container" style="margin-bottom: 1.5rem; display: ${isEdit && recurring.frequency === 'monthly' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Día del mes (opcional)
                    </label>
                    <input 
                        type="number" 
                        id="recurring-day-of-month" 
                        value="${isEdit && recurring.dayOfMonth ? recurring.dayOfMonth : ''}"
                        min="1" 
                        max="31"
                        placeholder="Ej: 15 (día 15 de cada mes)"
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                        Si no especificas, se usará el día de la fecha de inicio
                    </div>
                </div>

                <!-- Fecha de inicio -->
                ${!isEdit ? `
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                            Fecha de inicio *
                        </label>
                        <input 
                            type="date" 
                            id="recurring-start-date" 
                            value="${new Date().toISOString().split('T')[0]}"
                            required
                            style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                        />
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                            Primera vez que se generará este gasto
                        </div>
                    </div>
                ` : `
                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem;">
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">
                            Fecha de inicio:
                        </div>
                        <div style="font-weight: 600;">
                            ${new Date(recurring.startDate).toLocaleDateString('es-ES')}
                        </div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 0.75rem; margin-bottom: 0.25rem;">
                            Próxima ejecución:
                        </div>
                        <div style="font-weight: 600; color: var(--color-primary);">
                            ${new Date(recurring.nextDate).toLocaleDateString('es-ES')}
                        </div>
                    </div>
                `}

                <!-- Botones -->
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button 
                        type="button" 
                        onclick="closeRecurringModal()"
                        style="flex: 1; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border: none; border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;"
                    >
                        ${isEdit ? '💾 Guardar Cambios' : '➕ Crear Recurrente'}
                    </button>
                </div>
            </form>
        </div>
    `;

    // Insertar modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'recurring-modal';
    modalContainer.className = 'modal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * 🔧 Toggle día del mes
 */
function toggleDayOfMonth() {
    const frequency = document.getElementById('recurring-frequency').value;
    const container = document.getElementById('day-of-month-container');
    
    if (frequency === 'monthly') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        document.getElementById('recurring-day-of-month').value = '';
    }
}

/**
 * ❌ Cerrar modal de recurrentes
 */
function closeRecurringModal() {
    const modal = document.getElementById('recurring-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * 💾 Manejar submit del formulario de recurrentes
 */
async function handleRecurringSubmit(event, recurringId = null) {
    event.preventDefault();
    
    const description = document.getElementById('recurring-description').value.trim();
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const category = document.getElementById('recurring-category').value;
    const frequency = document.getElementById('recurring-frequency').value;
    const dayOfMonth = document.getElementById('recurring-day-of-month')?.value || null;
    const startDate = document.getElementById('recurring-start-date')?.value || null;

    const isEdit = recurringId !== null;

    try {
        let result;
        
        if (isEdit) {
            // Actualizar
            result = await recurringModule.updateRecurringExpense(recurringId, {
                description,
                amount,
                category,
                frequency,
                dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null
            });
        } else {
            // Crear nuevo
            result = await recurringModule.createRecurringExpense({
                description,
                amount,
                category,
                frequency,
                startDate,
                dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null
            });
        }

        if (result.success) {
            closeRecurringModal();
            // Recargar vista
            switchTab('more-recurring');
        }
    } catch (error) {
        console.error('Error en formulario de recurrentes:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * ⏸️ Pausar gasto recurrente
 */
async function pauseRecurring(id) {
    if (confirm('¿Pausar este gasto recurrente?\n\nNo se generarán nuevos gastos hasta que lo reactives.')) {
        const result = await recurringModule.toggleActive(id);
        if (result.success) {
            switchTab('more-recurring');
        }
    }
}

/**
 * ▶️ Activar gasto recurrente
 */
async function activateRecurring(id) {
    const result = await recurringModule.toggleActive(id);
    if (result.success) {
        switchTab('more-recurring');
    }
}

/**
 * ✏️ Editar gasto recurrente
 */
function editRecurring(id) {
    openRecurringModal(id);
}

/**
 * 🗑️ Eliminar gasto recurrente
 */
async function deleteRecurring(id) {
    const recurring = recurringModule.recurringExpenses.find(r => r.id === id);
    
    if (!recurring) return;
    
    if (confirm(`¿Eliminar "${recurring.description}"?\n\nEsta acción no se puede deshacer. Los gastos ya generados NO serán eliminados.`)) {
        const result = await recurringModule.deleteRecurringExpense(id);
        if (result.success) {
            switchTab('more-recurring');
        }
    }
}


// ========================================
// 🤖 ASISTENTE AI - NUEVA SECCIÓN
// ========================================
function renderAssistantSection() {
    if (!assistantModule) {
        return `
            <div class="card">
                <h2>🤖 Asistente Financiero</h2>
                <p style="text-align: center; padding: 2rem;">
                    ⚠️ El módulo del asistente no está disponible
                </p>
            </div>
        `;
    }
    
    const quickActions = assistantModule.getQuickActions();
    const isOnline = assistantModule.useOnlineMode && assistantModule.claudeAPIKey;
    
    return `
        <div class="assistant-container">
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h2 style="margin: 0;">🤖 Asistente Financiero</h2>
                    <span class="mode-badge ${isOnline ? 'online' : 'offline'}">
                        ${isOnline ? '🌐 Online' : '📴 Offline'}
                    </span>
                </div>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1.5rem;">
                    Tu asistente personal para análisis financiero y consejos inteligentes
                </p>
            </div>
            
            <!-- Acciones Rápidas -->
            <div class="quick-actions">
                ${quickActions.map(action => `
                    <button class="quick-action-btn" onclick="sendQuickAction('${action.id}', '${action.message}')">
                        <span class="icon">${action.icon}</span>
                        <span>${action.label}</span>
                    </button>
                `).join('')}
            </div>
            
            <!-- Área de Chat -->
            <div class="assistant-chat-area" id="assistant-chat">
                ${renderAssistantMessages()}
            </div>
            
            <!-- Input del Asistente -->
            <div class="assistant-input-area">
                <input 
                    type="text" 
                    class="assistant-input" 
                    id="assistant-input" 
                    placeholder="Escribe tu pregunta..." 
                    onkeypress="if(event.key === 'Enter') sendAssistantMessage()"
                />
                <button class="assistant-send-btn" onclick="sendAssistantMessage()">
                    <span>Enviar</span>
                    <span>📤</span>
                </button>
            </div>
            
            <!-- Configuración -->
            <div class="assistant-settings">
                <h3 style="margin-bottom: 1rem;">⚙️ Configuración del Asistente</h3>
                
                <div class="setting-row">
                    <div>
                        <strong>Modo Online (Claude API)</strong>
                        <p style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin-top: 0.25rem;">
                            Análisis más avanzado con IA de Claude
                        </p>
                    </div>
                    <label class="switch">
                        <input type="checkbox" id="assistant-online-toggle" 
                            ${isOnline ? 'checked' : ''} 
                            onchange="toggleAssistantMode()">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="setting-row">
                    <div>
                        <strong>API Key de Claude</strong>
                        <p style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin-top: 0.25rem;">
                            Obtén tu API key en console.anthropic.com
                        </p>
                    </div>
                    <button class="btn btn-secondary" onclick="configureAssistantAPIKey()">
                        Configurar
                    </button>
                </div>
                
                <div class="setting-row">
                    <button class="btn btn-primary" onclick="startNewAssistantConversation()" style="width: 100%;">
                        🆕 Nueva Conversación
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAssistantMessages() {
    if (!assistantModule || assistantModule.conversationHistory.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <div class="empty-state-title">¡Hola! Soy tu asistente financiero</div>
                <div class="empty-state-text">Pregúntame cualquier cosa sobre tus finanzas</div>
            </div>
        `;
    }
    
    return assistantModule.conversationHistory.map(msg => {
        const isUser = msg.role === 'user';
        return `
            <div class="chat-message message-${msg.role}">
                <div class="message-bubble">
                    ${!isUser && msg.mode ? `<div class="mode-badge ${msg.mode}">${msg.mode === 'online' ? '🌐' : '📴'}</div>` : ''}
                    ${msg.content.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// 🔄 GASTOS RECURRENTES - NUEVA SECCIÓN
// ========================================
function renderRecurringExpensesSection() {
    if (!recurringModule) {
        return `
            <div class="card">
                <h2>🔄 Gastos Recurrentes</h2>
                <p style="text-align: center; padding: 2rem;">
                    ⚠️ El módulo de gastos recurrentes no está disponible
                </p>
            </div>
        `;
    }
    
    const stats = recurringModule.getStatistics();
    const upcomingExpenses = recurringModule.getUpcomingExpenses(30);
    
    return `
        <div class="recurring-container">
            <!-- Header -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0;">🔄 Gastos Recurrentes</h2>
                        <p style="color: rgba(255, 255, 255, 0.7); margin-top: 0.5rem;">
                            Gastos automáticos que se repiten
                        </p>
                    </div>
                    <button class="btn btn-primary" onclick="openCreateRecurringExpenseModal()">
                        ➕ Nuevo
                    </button>
                </div>
            </div>
            
            <!-- Estadísticas -->
            <div class="recurring-stats">
                <div class="stat-box">
                    <div class="stat-value">${stats.active}</div>
                    <div class="stat-label">Activos</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${stats.paused}</div>
                    <div class="stat-label">Pausados</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">$${stats.monthlyEstimate.toFixed(0)}</div>
                    <div class="stat-label">Estimado Mensual</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${stats.totalGenerated}</div>
                    <div class="stat-label">Generados (30d)</div>
                </div>
            </div>
            
            <!-- Lista de Gastos Recurrentes -->
            ${recurringModule.recurringExpenses.length === 0 ? `
                <div class="card">
                    <div class="empty-state">
                        <div class="empty-state-icon">🔄</div>
                        <div class="empty-state-title">No hay gastos recurrentes</div>
                        <div class="empty-state-text">Crea tu primer gasto automático</div>
                    </div>
                </div>
            ` : `
                <div class="recurring-list">
                    ${recurringModule.recurringExpenses.map(recurring => `
                        <div class="recurring-item ${recurring.active ? '' : 'paused'}">
                            <div class="recurring-header">
                                <div class="recurring-title">
                                    <div class="recurring-name">${recurring.description}</div>
                                    <div class="recurring-category">${recurring.category}</div>
                                </div>
                                <div class="recurring-amount">$${recurring.amount.toFixed(2)}</div>
                            </div>
                            
                            <div class="recurring-info">
                                <div class="recurring-info-item">
                                    <span class="info-label">Frecuencia</span>
                                    <span class="info-value">
                                        ${recurringModule.frequencies[recurring.frequency]?.icon || '📅'} 
                                        ${recurringModule.frequencies[recurring.frequency]?.label || recurring.frequency}
                                    </span>
                                </div>
                                <div class="recurring-info-item">
                                    <span class="info-label">Próxima fecha</span>
                                    <span class="info-value">${formatDate(new Date(recurring.nextDate))}</span>
                                </div>
                                <div class="recurring-info-item">
                                    <span class="info-label">Generados</span>
                                    <span class="info-value">${recurring.timesGenerated || 0} veces</span>
                                </div>
                                <div class="recurring-info-item">
                                    <span class="info-label">Estado</span>
                                    <span class="info-value">${recurring.active ? '✅ Activo' : '⏸️ Pausado'}</span>
                                </div>
                            </div>
                            
                            <div class="recurring-actions">
                                ${recurring.active ? `
                                    <button class="recurring-btn pause" onclick="pauseRecurringExpense('${recurring.id}')">
                                        ⏸️ Pausar
                                    </button>
                                ` : `
                                    <button class="recurring-btn resume" onclick="resumeRecurringExpense('${recurring.id}')">
                                        ▶️ Reanudar
                                    </button>
                                `}
                                <button class="recurring-btn edit" onclick="editRecurringExpense('${recurring.id}')">
                                    ✏️ Editar
                                </button>
                                <button class="recurring-btn delete" onclick="deleteRecurringExpense('${recurring.id}')">
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
            
            <!-- Calendario de Próximos Gastos -->
            ${upcomingExpenses.length > 0 ? `
                <div class="upcoming-calendar">
                    <h3 style="margin-bottom: 1rem;">📆 Próximos 30 Días</h3>
                    ${upcomingExpenses.slice(0, 10).map(expense => `
                        <div class="calendar-item">
                            <div class="calendar-date">
                                <div class="date-day">${expense.dueDate.getDate()}</div>
                                <div class="date-month">${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][expense.dueDate.getMonth()]}</div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${expense.description}</div>
                                <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
                                    ${expense.daysUntil === 0 ? 'Hoy' : `En ${expense.daysUntil} día${expense.daysUntil > 1 ? 's' : ''}`}
                                </div>
                            </div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary);">
                                $${expense.amount.toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// ========================================
// 📊 REPORTES INTERACTIVOS - NUEVA SECCIÓN
// ========================================
function renderReportsSection() {
    try {
        if (!reportsModule || !reportsModule.isInitialized) {
            return `
                <div class="reports-placeholder">
                    <h2>📊 Reportes Financieros</h2>
                    <p style="color: rgba(255, 255, 255, 0.7); text-align: center; padding: 2rem;">
                        El módulo de reportes no está disponible en este momento.
                    </p>
                    <button class="btn btn-primary" onclick="location.reload()" style="display: block; margin: 1rem auto;">
                        🔄 Recargar Página
                    </button>
                </div>
            `;
        }
        
        return reportsModule.renderReportsSection(expenses, incomeHistory);
    } catch (error) {
        console.error('Error en renderReportsSection:', error);
        return `
            <div class="reports-error">
                <h2>📊 Reportes Financieros</h2>
                <p style="text-align: center; padding: 2rem;">Error al cargar los reportes</p>
            </div>
        `;
    }
}
                            <div class="chart-title">📈 Tendencias (6 meses)</div>
                            <div class="chart-subtitle">Evolución de ingresos y gastos</div>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="trends-chart"></canvas>
                    </div>
                </div>
                
                <!-- Gráfico de Categorías -->
                <div class="chart-card">
                    <div class="chart-header">
                        <div>
                            <div class="chart-title">🎯 Gastos por Categoría</div>
                            <div class="chart-subtitle">Click para ver detalles</div>
                        </div>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="categories-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Top Gastos -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="margin: 0;">🏆 Top 10 Gastos</h3>
                    <button class="export-btn" onclick="exportReportToCSV()">
                        📤 Exportar CSV
                    </button>
                </div>
                
                <div class="transactions-table" style="max-height: 400px; overflow-y: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Categoría</th>
                                <th style="text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.expenses.top.map(expense => `
                                <tr>
                                    <td>${formatDate(new Date(expense.date))}</td>
                                    <td>${expense.description}</td>
                                    <td><span class="category-badge">${expense.category}</span></td>
                                    <td style="text-align: right;">
                                        <span class="transaction-amount expense">$${expense.amount.toFixed(2)}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Análisis por Categoría -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📂 Análisis por Categoría</h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${Object.values(report.expenses.byCategory)
                        .sort((a, b) => b.total - a.total)
                        .slice(0, 5)
                        .map(cat => `
                            <div style="cursor: pointer; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; transition: var(--transition);" 
                                 onclick="showCategoryDetails('${cat.name}')"
                                 onmouseover="this.style.background='rgba(5, 191, 219, 0.1)'"
                                 onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <div style="font-weight: 600;">${cat.name}</div>
                                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary);">
                                        $${cat.total.toFixed(2)}
                                    </div>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: rgba(255, 255, 255, 0.6);">
                                    <span>${cat.count} transacciones</span>
                                    <span>${cat.percentage.toFixed(1)}% del total</span>
                                </div>
                                ${cat.budget > 0 ? `
                                    <div style="margin-top: 0.5rem;">
                                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
                                            <span>Presupuesto</span>
                                            <span>${cat.budgetUsed.toFixed(0)}%</span>
                                        </div>
                                        <div style="background: rgba(0, 0, 0, 0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                                            <div style="background: ${cat.budgetUsed >= 100 ? 'var(--color-danger)' : cat.budgetUsed >= 80 ? 'var(--color-warning)' : 'var(--color-success)'}; 
                                                       height: 100%; width: ${Math.min(cat.budgetUsed, 100)}%; transition: var(--transition);"></div>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderBottomNav() {
    const tabs = [
        { id: 'dashboard', icon: '📈', name: 'Inicio' },
        { id: 'expenses', icon: '💰', name: 'Gastos' },
        { id: 'budget', icon: '📋', name: 'Presupuesto' },
        { id: 'goals', icon: '🎯', name: 'Metas' },
        { id: 'assistant', icon: '🤖', name: 'Asistente' }, // ✨ NUEVO
        { id: 'more', icon: '⚙️', name: 'Más' }
    ];

    return `
        <div class="bottom-nav">
            <div class="nav-container">
                ${tabs.map(tab => `
                    <button class="nav-item ${activeTab === tab.id ? 'active' : ''}" onclick="switchTab('${tab.id}')">
                        <span class="nav-icon">${tab.icon}</span>
                        ${tab.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderModal() {
    return `
        <div id="modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title" id="modal-title"></div>
                    <button class="btn-close" onclick="closeModal()">×</button>
                </div>
                <div id="modal-body"></div>
            </div>
        </div>
    `;
}

// ========================================
// RENDER PRINCIPAL
// ========================================
// 🤖 NUEVA: Mostrar Asistente Virtual
function showAssistant() {
    if (!assistantModule) {
        alert('⚠️ El asistente no está disponible. Recarga la página.');
        return;
    }
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '🤖 Asistente Financiero';
    modalBody.innerHTML = `
        <div class="assistant-chat" id="assistant-chat" style="
            height: 400px;
            overflow-y: auto;
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 1rem;
        ">
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
                <p>¡Hola! Soy tu asistente financiero.</p>
                <p style="font-size: 0.9rem;">Pregúntame sobre presupuestos, ahorro o análisis.</p>
            </div>
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
            <input 
                type="text" 
                id="assistant-input" 
                placeholder="Escribe tu pregunta..."
                style="flex: 1; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;"
                onkeypress="if(event.key === 'Enter') sendAssistantMessage()"
            >
            <button onclick="sendAssistantMessage()" class="btn btn-primary">
                Enviar 📤
            </button>
        </div>
        
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button onclick="quickAssistantAction('análisis')" class="btn btn-secondary" style="font-size: 0.85rem;">
                📊 Análisis
            </button>
            <button onclick="quickAssistantAction('presupuesto')" class="btn btn-secondary" style="font-size: 0.85rem;">
                💰 Presupuesto
            </button>
            <button onclick="quickAssistantAction('ahorro')" class="btn btn-secondary" style="font-size: 0.85rem;">
                🏦 Ahorro
            </button>
        </div>
        
        <button onclick="closeModal()" class="btn btn-secondary" style="width: 100%; margin-top: 1rem;">
            Cerrar
        </button>
    `;
    
    modal.classList.add('active');
}

// 🤖 NUEVA: Enviar mensaje al asistente
async function sendAssistantMessage() {
    const input = document.getElementById('assistant-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatDiv = document.getElementById('assistant-chat');
    
    // Agregar mensaje del usuario
    chatDiv.innerHTML += `
        <div style="text-align: right; margin-bottom: 1rem;">
            <div style="display: inline-block; background: rgba(5, 191, 219, 0.3); padding: 0.75rem 1rem; border-radius: 12px; max-width: 80%;">
                ${message}
            </div>
        </div>
    `;
    
    input.value = '';
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    // Mostrar "escribiendo..."
    chatDiv.innerHTML += `
        <div id="typing-indicator" style="margin-bottom: 1rem;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 0.75rem 1rem; border-radius: 12px;">
                <span style="animation: pulse 1.5s infinite;">...</span>
            </div>
        </div>
    `;
    chatDiv.scrollTop = chatDiv.scrollHeight;
    
    // Obtener respuesta
    const response = await assistantModule.sendMessage(message);
    
    // Remover "escribiendo..."
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
    
    // Agregar respuesta
    chatDiv.innerHTML += `
        <div style="margin-bottom: 1rem;">
            <div style="display: inline-block; background: rgba(255,255,255,0.1); padding: 0.75rem 1rem; border-radius: 12px; max-width: 80%;">
                ${response.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// 🤖 NUEVA: Acciones rápidas del asistente
function quickAssistantAction(topic) {
    const input = document.getElementById('assistant-input');
    const messages = {
        'análisis': '¿Puedes darme un análisis de mis finanzas?',
        'presupuesto': '¿Cómo puedo mejorar mi presupuesto?',
        'ahorro': '¿Qué consejos tienes para ahorrar más?'
    };
    input.value = messages[topic] || topic;
    sendAssistantMessage();
}

function render() {
    const app = document.getElementById('app');
    
    if (currentView === 'login') {
        app.innerHTML = `<div class="container">${renderLogin()}</div>`;
    } else if (currentView === 'register') {
        app.innerHTML = `<div class="container">${renderRegister()}</div>`;
    } else if (currentView === 'app') {
        let content = '';
        switch (activeTab) {
            case 'dashboard':
                content = renderDashboard();
                break;
            case 'expenses':
                content = renderExpenses();
                break;
            case 'budget':
                content = renderBudget();
                break;
            case 'goals':
                content = renderGoals();
                break;
            case 'assistant':
                content = renderAssistantSection(); // ✨ NUEVO
                break;
            case 'reports':
                content = renderReportsSection(); // ✨ MEJORADO
                break;
            case 'more':
                content = renderMoreSection();
                break;

            case 'more-recurring':
                content = renderRecurringExpensesView();
                break;
        }
        
        // Mostrar FAB en expenses, goals y budget
        const showFab = activeTab === 'expenses' || activeTab === 'goals' || activeTab === 'budget';
        let fabAction = 'expense';
        if (activeTab === 'goals') fabAction = 'goal';
        if (activeTab === 'budget') fabAction = 'budget';
        
        // Para expenses, mostrar menú de opciones
        const fabHTML = activeTab === 'expenses' ? `
            <div id="fab-menu" class="fab-menu" style="display: none;">
                <button class="fab-option" onclick="openModal('income')" style="background: var(--color-success);">
                    💰 Ingreso
                </button>
                <button class="fab-option" onclick="openModal('expense')" style="background: var(--color-danger);">
                    💸 Gasto
                </button>
                <!-- ✨✨✨ NUEVO BOTÓN DE GASTOS RECURRENTES ✨✨✨ -->
                <button class="fab-option" onclick="openRecurringFromFAB()" style="background: var(--color-secondary);">
                    🔄 Recurrente
                </button>
            </div>
            <button class="fab" onclick="toggleFabMenu()">+</button>
        ` : `<button class="fab" onclick="openModal('${fabAction}')">+</button>`;
        
        app.innerHTML = `
            <div class="container">
                ${renderHeader(false)}
                ${content}
            </div>
            ${renderBottomNav()}
            ${renderModal()}
            ${showFab ? fabHTML : ''}
            ${tutorialActive ? renderTutorialOverlay() : ''}
            ${tutorialCompleted && !tutorialActive ? `
                <button class="help-button" onclick="window.startTutorial(); console.log('Help button clicked!');" title="🎓 Ver tutorial nuevamente - Click aquí para aprender">
                    ❓
                </button>
            ` : ''}
            <!-- 🤖 NUEVO: Botón Asistente Virtual -->
            <button class="assistant-button" onclick="showAssistant()" title="🤖 Asistente Financiero">
                🤖
            </button>
        `;
        
        // Renderizar gráficos si estamos en dashboard y hay datos
        if (activeTab === 'dashboard') {
            setTimeout(renderAllDashboardCharts, 100);
        }
    }
}

// ========================================
// GRÁFICOS
// ========================================
function renderAllDashboardCharts() {
    // Verificar si Chart.js está cargado
    if (typeof Chart === 'undefined') {
        // Cargar Chart.js dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            console.log('✅ Chart.js cargado exitosamente');
            renderChart();
            renderDescriptionChart();
            renderIncomeChart();
            renderSavingsRateChart();
        };
        script.onerror = () => {
            console.error('❌ Error al cargar Chart.js');
        };
        document.head.appendChild(script);
    } else {
        // Chart.js ya está cargado
        renderChart();
        renderDescriptionChart();
        renderIncomeChart();
        renderSavingsRateChart();
    }
}

function renderChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    
    const { expensesByCategory } = calculateTotals();
    
    // Destruir gráfico anterior si existe
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Colores más vibrantes y diferenciados
    const colors = [
        'rgba(239, 68, 68, 0.9)',    // Rojo brillante
        'rgba(34, 197, 94, 0.9)',    // Verde vibrante
        'rgba(59, 130, 246, 0.9)',   // Azul cielo
        'rgba(245, 158, 11, 0.9)',   // Naranja
        'rgba(168, 85, 247, 0.9)',   // Púrpura vibrante
        'rgba(236, 72, 153, 0.9)',   // Rosa fuerte
        'rgba(20, 184, 166, 0.9)',   // Turquesa
        'rgba(251, 191, 36, 0.9)'    // Amarillo dorado
    ];
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: 'rgba(0, 11, 46, 0.8)',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    bodyFont: {
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Gráfico de "Dónde va mi dinero" por descripción
function renderDescriptionChart() {
    const canvas = document.getElementById('descriptionChart');
    if (!canvas) return;
    
    const expensesByDescription = calculateExpensesByDescription();
    
    const ctx = canvas.getContext('2d');
    
    const descriptions = Object.keys(expensesByDescription);
    const amounts = Object.values(expensesByDescription);
    
    // Colores para el gráfico de descripción
    const colors = [
        'rgba(236, 72, 153, 0.9)',   // Rosa
        'rgba(139, 92, 246, 0.9)',   // Púrpura
        'rgba(59, 130, 246, 0.9)',   // Azul
        'rgba(34, 197, 94, 0.9)',    // Verde
        'rgba(245, 158, 11, 0.9)',   // Naranja
        'rgba(239, 68, 68, 0.9)',    // Rojo
        'rgba(20, 184, 166, 0.9)',   // Turquesa
        'rgba(251, 191, 36, 0.9)',   // Amarillo
        'rgba(168, 85, 247, 0.9)',   // Púrpura claro
        'rgba(244, 114, 182, 0.9)'   // Rosa claro
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: descriptions,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: 'rgba(0, 11, 46, 0.8)',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 11,
                            weight: 'bold'
                        },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    bodyFont: {
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Gráfico de distribución de ingresos
function renderIncomeChart() {
    const canvas = document.getElementById('incomeChart');
    if (!canvas) return;
    
    const incomeDistribution = calculateIncomeDistribution();
    
    const ctx = canvas.getContext('2d');
    
    const labels = Object.keys(incomeDistribution);
    const amounts = Object.values(incomeDistribution);
    
    // Colores para ingresos (tonos verdes y dorados)
    const colors = [
        'rgba(34, 197, 94, 0.9)',    // Verde
        'rgba(16, 185, 129, 0.9)',   // Verde esmeralda
        'rgba(59, 130, 246, 0.9)',   // Azul
        'rgba(251, 191, 36, 0.9)'    // Dorado
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: 'rgba(0, 11, 46, 0.8)',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    bodyFont: {
                        size: 14
                    },
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Gráfico de tasa de ahorro e inversión mensual
function renderSavingsRateChart() {
    const canvas = document.getElementById('savingsRateChart');
    if (!canvas) return;
    
    const savingsData = calculateMonthlySavingsRate();
    
    const ctx = canvas.getContext('2d');
    
    const months = Object.keys(savingsData).sort();
    const savingsRates = months.map(m => savingsData[m].savingsRate);
    const investmentRates = months.map(m => savingsData[m].investmentRate);
    
    // Formatear nombres de meses
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = months.map(m => {
        const [year, month] = m.split('-');
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '💰 Tasa de Ahorro',
                    data: savingsRates,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: '📈 Tasa de Inversión',
                    data: investmentRates,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Gráfico de categoría para modal
function renderCategoryChart(category) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    // Destruir gráfico anterior si existe
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // Obtener gastos de esta categoría por fecha
    const categoryExpenses = expenses
        .filter(e => e.category === category)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dates = categoryExpenses.map(e => e.date);
    const amounts = categoryExpenses.map(e => e.amount);
    
    categoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Gasto',
                data: amounts,
                borderColor: 'rgba(5, 191, 219, 1)',
                backgroundColor: 'rgba(5, 191, 219, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Gasto: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// ========================================
// FUNCIONES DE MODAL
// ========================================
// ========================================
// 🔄 MODAL DE GASTO MEJORADO CON RECURRENTES
// ========================================
// Este código REEMPLAZA la función openModal() existente

/**
 * 🆕 Abrir modal de gasto/ingreso con opción de recurrente
 */
function openModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    
    // Determinar si es gasto o ingreso
    const isExpense = type === 'expense';
    
    modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
    
    // ✨ NUEVO: Formulario con opción de recurrente
    modalForm.innerHTML = `
        <div class="form-group">
            <label>Descripción</label>
            <input 
                type="text" 
                id="modal-description" 
                class="form-input" 
                placeholder="${isExpense ? 'Ej: Supermercado' : 'Ej: Salario'}"
                required
            >
        </div>
        
        <div class="form-group">
            <label>Monto</label>
            <input 
                type="number" 
                id="modal-amount" 
                class="form-input" 
                placeholder="0.00" 
                step="0.01"
                required
            >
        </div>
        
        <div class="form-group">
            <label>${isExpense ? 'Categoría' : 'Tipo de ingreso'}</label>
            <select id="modal-category" class="form-input" required>
                ${isExpense ? `
                    <option value="">Selecciona una categoría</option>
                    ${categorias.map(cat => `
                        <option value="${cat.nombre}">${cat.emoji} ${cat.nombre}</option>
                    `).join('')}
                ` : `
                    <option value="">Selecciona un tipo</option>
                    <option value="Salario">💼 Salario</option>
                    <option value="Freelance">💻 Freelance</option>
                    <option value="Inversiones">📈 Inversiones</option>
                    <option value="Bonos">🎁 Bonos</option>
                    <option value="Otros">📌 Otros</option>
                `}
            </select>
        </div>
        
        <div class="form-group">
            <label>Fecha</label>
            <input 
                type="date" 
                id="modal-date" 
                class="form-input" 
                value="${new Date().toISOString().split('T')[0]}"
                required
            >
        </div>
        
        ${isExpense ? `
            <!-- ✨ NUEVO: Checkbox para marcar como recurrente -->
            <div class="form-group" style="margin-top: 1.5rem; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid rgba(168, 85, 247, 0.3);">
                <label style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    <input 
                        type="checkbox" 
                        id="modal-is-recurring" 
                        onchange="toggleRecurringOptions()"
                        style="width: 20px; height: 20px; cursor: pointer;"
                    >
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">🔄</span>
                        <span>Este gasto es recurrente</span>
                    </span>
                </label>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem; margin-left: 2.5rem;">
                    El gasto se repetirá automáticamente según la frecuencia que elijas
                </div>
            </div>
            
            <!-- ✨ NUEVO: Opciones de recurrencia (inicialmente ocultas) -->
            <div id="recurring-options" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(168, 85, 247, 0.05); border-radius: 0.75rem; border-left: 4px solid var(--color-secondary);">
                <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--color-secondary);">
                    <span style="font-size: 1.2rem;">⚙️</span>
                    <span>Configuración de Recurrencia</span>
                </h4>
                
                <div class="form-group">
                    <label>Frecuencia</label>
                    <select id="modal-frequency" class="form-input" onchange="updateRecurringPreview()">
                        <option value="daily">📅 Diario</option>
                        <option value="weekly">📆 Semanal</option>
                        <option value="monthly" selected>🗓️ Mensual</option>
                        <option value="yearly">📋 Anual</option>
                    </select>
                </div>
                
                <div class="form-group" id="day-of-month-group">
                    <label>Día del mes</label>
                    <select id="modal-day-of-month" class="form-input" onchange="updateRecurringPreview()">
                        ${Array.from({length: 31}, (_, i) => i + 1).map(day => `
                            <option value="${day}" ${day === new Date().getDate() ? 'selected' : ''}>
                                Día ${day}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group" id="day-of-week-group" style="display: none;">
                    <label>Día de la semana</label>
                    <select id="modal-day-of-week" class="form-input" onchange="updateRecurringPreview()">
                        <option value="0">Domingo</option>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miércoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábado</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Fecha de inicio</label>
                    <input 
                        type="date" 
                        id="modal-start-date" 
                        class="form-input" 
                        value="${new Date().toISOString().split('T')[0]}"
                        onchange="updateRecurringPreview()"
                    >
                </div>
                
                <!-- Vista previa -->
                <div id="recurring-preview" style="margin-top: 1rem; padding: 0.75rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem; border-left: 3px solid var(--color-primary);">
                    <div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--color-primary);">
                        📅 Vista Previa
                    </div>
                    <div id="recurring-preview-text" style="font-size: 0.85rem; color: rgba(255,255,255,0.9);">
                        Este gasto se repetirá cada mes
                    </div>
                </div>
                
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.5rem; display: flex; align-items: start; gap: 0.5rem;">
                    <span style="font-size: 1.2rem;">💡</span>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                        El primer gasto se creará hoy. Los siguientes se generarán automáticamente según la frecuencia elegida.
                    </div>
                </div>
            </div>
        ` : ''}
        
        <div class="modal-buttons" style="margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">
                ❌ Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
                💾 Guardar
            </button>
        </div>
    `;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Manejar submit
    modalForm.onsubmit = async (e) => {
        e.preventDefault();
        await handleModalSubmit(type);
    };
    
    // Focus en primer campo
    setTimeout(() => {
        document.getElementById('modal-description').focus();
    }, 100);
}

/**
 * 🔄 Toggle opciones de recurrencia
 */
function toggleRecurringOptions() {
    const checkbox = document.getElementById('modal-is-recurring');
    const options = document.getElementById('recurring-options');
    const frequencySelect = document.getElementById('modal-frequency');
    
    if (checkbox.checked) {
        options.style.display = 'block';
        updateRecurringPreview();
        
        // Animar entrada
        options.style.opacity = '0';
        options.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            options.style.transition = 'all 0.3s ease';
            options.style.opacity = '1';
            options.style.transform = 'translateY(0)';
        }, 10);
    } else {
        options.style.display = 'none';
    }
}

/**
 * 📅 Actualizar vista previa de recurrencia
 */
function updateRecurringPreview() {
    const frequency = document.getElementById('modal-frequency')?.value;
    const dayOfMonth = document.getElementById('modal-day-of-month')?.value;
    const dayOfWeek = document.getElementById('modal-day-of-week')?.value;
    const amount = document.getElementById('modal-amount')?.value || 0;
    
    const previewText = document.getElementById('recurring-preview-text');
    
    // Mostrar/ocultar campos según frecuencia
    const dayOfMonthGroup = document.getElementById('day-of-month-group');
    const dayOfWeekGroup = document.getElementById('day-of-week-group');
    
    if (frequency === 'weekly') {
        dayOfMonthGroup.style.display = 'none';
        dayOfWeekGroup.style.display = 'block';
    } else if (frequency === 'monthly') {
        dayOfMonthGroup.style.display = 'block';
        dayOfWeekGroup.style.display = 'none';
    } else {
        dayOfMonthGroup.style.display = 'none';
        dayOfWeekGroup.style.display = 'none';
    }
    
    // Generar texto de vista previa
    let previewMsg = '';
    let monthlyEstimate = 0;
    
    switch(frequency) {
        case 'daily':
            previewMsg = `Este gasto se repetirá <strong>todos los días</strong>`;
            monthlyEstimate = parseFloat(amount) * 30;
            break;
        case 'weekly':
            const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            previewMsg = `Este gasto se repetirá <strong>cada ${days[dayOfWeek]}</strong>`;
            monthlyEstimate = parseFloat(amount) * 4;
            break;
        case 'monthly':
            previewMsg = `Este gasto se repetirá <strong>el día ${dayOfMonth} de cada mes</strong>`;
            monthlyEstimate = parseFloat(amount);
            break;
        case 'yearly':
            previewMsg = `Este gasto se repetirá <strong>una vez al año</strong>`;
            monthlyEstimate = parseFloat(amount) / 12;
            break;
    }
    
    previewMsg += `<br><span style="color: var(--color-primary); font-weight: 600;">Impacto mensual aproximado: $${monthlyEstimate.toFixed(2)}</span>`;
    
    if (previewText) {
        previewText.innerHTML = previewMsg;
    }
}

/**
 * 💾 Manejar submit del modal (gastos e ingresos)
 */
async function handleModalSubmit(type) {
    const description = document.getElementById('modal-description').value.trim();
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const category = document.getElementById('modal-category').value;
    const date = document.getElementById('modal-date').value;
    
    // Validaciones
    if (!description || !amount || !category || !date) {
        showNotification('⚠️ Por favor completa todos los campos', 'warning');
        return;
    }
    
    if (amount <= 0) {
        showNotification('⚠️ El monto debe ser mayor a 0', 'warning');
        return;
    }
    
    const isExpense = type === 'expense';
    const isRecurring = isExpense && document.getElementById('modal-is-recurring')?.checked;
    
    if (isRecurring) {
        // ✨ CREAR GASTO RECURRENTE
        const frequency = document.getElementById('modal-frequency').value;
        const dayOfMonth = parseInt(document.getElementById('modal-day-of-month')?.value || 1);
        const dayOfWeek = parseInt(document.getElementById('modal-day-of-week')?.value || 0);
        const startDate = document.getElementById('modal-start-date').value;
        
        const recurringData = {
            description,
            amount,
            category,
            frequency,
            dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
            dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
            startDate,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        try {
            // Crear gasto recurrente
            await recurringModule.addRecurringExpense(recurringData);
            
            // Generar el primer gasto
            await recurringModule.generateExpensesForToday();
            
            showNotification('✅ Gasto recurrente creado exitosamente', 'success');
            closeModal();
            await loadUserData();
            render();
        } catch (error) {
            console.error('Error al crear gasto recurrente:', error);
            showNotification('❌ Error al crear gasto recurrente', 'error');
        }
    } else if (isExpense) {
        // GASTO NORMAL
        await addExpense(description, amount, category, date);
    } else {
        // INGRESO
        await addIncome(description, amount, category, date);
    }
}

// Exportar funciones
window.toggleRecurringOptions = toggleRecurringOptions;
window.updateRecurringPreview = updateRecurringPreview;
window.handleModalSubmit = handleModalSubmit;



function closeModal() {
    document.getElementById('modal').classList.remove('active');
    
    // Cerrar menú FAB si está abierto
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

async function saveExpense() {
    const expense = {
        amount: parseFloat(document.getElementById('expense-amount').value),
        description: document.getElementById('expense-description').value,
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value
    };
    
    await addExpense(expense);
    closeModal();
    
    // Cerrar menú FAB si está abierto
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

// ========================================
// FUNCIONES DE VALIDACIÓN Y ALERTAS
// ========================================

/**
 * Verificar si un gasto es inusual
 */
function checkUnusualExpense(amount) {
    try {
        const avgExpense = expenses.length > 0 
            ? expenses.reduce((sum, e) => sum + (e.amount || 0), 0) / expenses.length 
            : 0;
        
        if (amount > avgExpense * 2 && avgExpense > 0) {
            if (typeof Toastify !== 'undefined') {
                Toastify({
                    text: `⚠️ Gasto inusual: $${amount.toFixed(2)} (promedio: $${avgExpense.toFixed(2)})`,
                    duration: 5000,
                    gravity: "top",
                    position: "right",
                    style: {
                        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                    }
                }).showToast();
            }
        }
    } catch (error) {
        console.warn('Error al verificar gasto inusual:', error);
    }
}

/**
 * Verificar alertas de presupuesto
 */
async function checkBudgetAlerts() {
    try {
        if (!currentUser) return;
        
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const monthlyExpenses = expenses.filter(e => e.date && e.date.startsWith(currentMonth));
        
        const categoryTotals = {};
        monthlyExpenses.forEach(e => {
            const category = e.category || 'Gastos Discrecionales';
            categoryTotals[category] = (categoryTotals[category] || 0) + (e.amount || 0);
        });
        
        Object.keys(categoryTotals).forEach(category => {
            const spent = categoryTotals[category];
            const budget = budgets[category] || 0;
            
            if (budget > 0) {
                const percentage = (spent / budget) * 100;
                
                if (percentage >= 80 && percentage < 100) {
                    if (typeof Toastify !== 'undefined') {
                        Toastify({
                            text: `⚡ ${category}: ${percentage.toFixed(0)}% del presupuesto`,
                            duration: 5000,
                            gravity: "top",
                            position: "right",
                            style: {
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            }
                        }).showToast();
                    }
                }
                
                if (percentage >= 100) {
                    if (typeof Toastify !== 'undefined') {
                        Toastify({
                            text: `🚨 ${category}: Presupuesto excedido (${percentage.toFixed(0)}%)`,
                            duration: 7000,
                            gravity: "top",
                            position: "right",
                            style: {
                                background: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)",
                            }
                        }).showToast();
                    }
                }
            }
        });
        
    } catch (error) {
        console.warn('Error al verificar alertas:', error);
    }
}

async function saveGoal() {
    const goal = {
        name: document.getElementById('goal-name').value,
        target: parseFloat(document.getElementById('goal-target').value),
        current: parseFloat(document.getElementById('goal-current').value) || 0,
        type: document.getElementById('goal-type').value
    };
    
    await addGoal(goal);
    closeModal();
}

async function saveIncome() {
    const incomeEntry = {
        amount: parseFloat(document.getElementById('income-amount').value),
        description: document.getElementById('income-description').value,
        type: document.getElementById('income-type').value,
        date: document.getElementById('income-date').value
    };
    
    await addIncome(incomeEntry);
    closeModal();
    
    // ✅ CORRECCIÓN: Forzar actualización de dashboard
    // Guardar pestaña actual
    const previousTab = activeTab;
    
    // Cambiar temporalmente a dashboard para actualizar
    activeTab = 'dashboard';
    render();
    
    // Si estábamos en otra pestaña, volver después de 200ms
    if (previousTab !== 'dashboard') {
        setTimeout(() => {
            activeTab = previousTab;
            render();
        }, 200);
    }
    
    // Cerrar menú FAB si está abierto
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

function toggleFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) {
        fabMenu.style.display = fabMenu.style.display === 'none' ? 'flex' : 'none';
    }
}

async function saveBudget() {
    const newBudgets = {};
    Object.keys(budgets).forEach(cat => {
        const inputId = `budget-${cat.replace(/\s+/g, '-')}`;
        newBudgets[cat] = parseFloat(document.getElementById(inputId).value);
    });
    
    try {
        budgets = newBudgets;
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        closeModal();
        render();
    } catch (error) {
        alert('Error al actualizar presupuesto: ' + error.message);
    }
}

// ✅ FUNCIONES WRAPPER para compatibilidad con onclick
function openAddExpenseModal() {
    openModal('expense');
}

function openAddIncomeModal() {
    openModal('income');
}

function openAddGoalModal() {
    openModal('goal');
}

function openAddBudgetModal() {
    openModal('budget');
}

// ✅ FUNCIONES HANDLER para compatibilidad con onsubmit
async function handleExpenseSubmit() {
    await saveExpense();
}

async function handleIncomeSubmit() {
    await saveIncome();
}

async function handleGoalSubmit() {
    await saveGoal();
}

async function handleBudgetSubmit() {
    await saveBudget();
}

// Modal para agregar dinero a una meta
function openAddMoneyModal(goalId, goalName) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `💵 Agregar Dinero a: ${goalName}`;
    modalBody.innerHTML = `
        <form onsubmit="event.preventDefault(); saveMoneyToGoal('${goalId}');">
            <div class="input-group">
                <label>💰 Monto a agregar</label>
                <input type="number" id="money-amount" placeholder="100" step="0.01" required autofocus>
            </div>
            <button type="submit" class="btn btn-primary">Agregar Dinero 💸</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        </form>
    `;
    
    modal.classList.add('active');
}

async function saveMoneyToGoal(goalId) {
    const amount = parseFloat(document.getElementById('money-amount').value);
    if (amount > 0) {
        await addMoneyToGoal(goalId, amount);
        closeModal();
    }
}

// Modal para detalles financieros al hacer clic en las tarjetas del dashboard
function openFinancialDetailModal(type) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const { totalIncome, totalExpenses, balance } = calculateTotals();
    const monthlyData = calculateMonthlyTotals();
    const monthKeys = Object.keys(monthlyData).sort().reverse().slice(0, 6);
    
    let title = '';
    let description = '';
    let actionButtons = '';
    
    if (type === 'income') {
        title = '💰 Detalle de Ingresos';
        description = `Total: $${totalIncome.toLocaleString()}`;
        actionButtons = `
            <button class="btn btn-primary" onclick="closeModal(); openModal('income');" style="width: 100%; margin-top: 1rem;">
                ➕ Agregar Ingreso
            </button>
        `;
    } else if (type === 'expenses') {
        title = '💸 Detalle de Gastos';
        description = `Total: $${totalExpenses.toLocaleString()}`;
        actionButtons = `
            <button class="btn btn-primary" onclick="closeModal(); openModal('expense');" style="width: 100%; margin-top: 1rem;">
                ➕ Agregar Gasto
            </button>
        `;
    } else if (type === 'balance') {
        title = '💵 Detalle de Balance';
        description = `${balance >= 0 ? '+' : ''}$${balance.toLocaleString()}`;
        actionButtons = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem;">
                <button class="btn btn-primary" onclick="closeModal(); openModal('income');">
                    💰 Ingreso
                </button>
                <button class="btn btn-secondary" onclick="closeModal(); openModal('expense');">
                    💸 Gasto
                </button>
            </div>
        `;
    }
    
    modalTitle.textContent = title;
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="text-align: center; font-size: 2rem; font-weight: bold; color: var(--color-primary); margin-bottom: 1rem;">
                ${description}
            </div>
            
            ${monthKeys.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📊 Comparativo Mensual</h4>
                    <div style="background: rgba(0, 11, 46, 0.6); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2);">
                        <canvas id="financialComparisonChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>
            ` : ''}
            
            ${actionButtons}
            
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="width: 100%; margin-top: 0.5rem;">
                Cerrar
            </button>
        </div>
    `;
    
    modal.classList.add('active');
    
    if (monthKeys.length > 0) {
        setTimeout(() => renderFinancialComparisonChart(type, monthKeys, monthlyData), 100);
    }
}

// Renderizar gráfico de comparación financiera
function renderFinancialComparisonChart(type, monthKeys, monthlyData) {
    const canvas = document.getElementById('financialComparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = monthKeys.map(m => {
        const [year, month] = m.split('-');
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }).reverse();
    
    let datasets = [];
    
    if (type === 'income') {
        const incomeData = monthKeys.map(m => monthlyData[m].income).reverse();
        datasets = [{
            label: '💰 Ingresos',
            data: incomeData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2
        }];
    } else if (type === 'expenses') {
        const expensesData = monthKeys.map(m => monthlyData[m].expenses).reverse();
        datasets = [{
            label: '💸 Gastos',
            data: expensesData,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2
        }];
    } else if (type === 'balance') {
        const incomeData = monthKeys.map(m => monthlyData[m].income).reverse();
        const expensesData = monthKeys.map(m => monthlyData[m].expenses).reverse();
        const balanceData = incomeData.map((inc, i) => inc - expensesData[i]);
        
        datasets = [
            {
                label: '💰 Ingresos',
                data: incomeData,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2
            },
            {
                label: '💸 Gastos',
                data: expensesData,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2
            },
            {
                label: '💵 Balance',
                data: balanceData,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }
        ];
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// ✨ NUEVA: Modal para mostrar vista previa de presupuesto automático
function showAutoBudgetModal(suggestedBudgets, monthsAnalyzed, source = 'historial') {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const { expensesByCategory } = calculateTotals();
    const sourceText = source === 'historial' 
        ? `Basado en el promedio de tus últimos <strong>${monthsAnalyzed} meses</strong> de gastos + 10% de margen`
        : `Basado en tus ingresos totales usando la regla <strong>50/30/20</strong> mejorada`;
    
    modalTitle.textContent = '🤖 Presupuesto Automático Sugerido';
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                    <span style="font-size: 2rem;">📊</span>
                    <div>
                        <div style="font-weight: bold; font-size: 1.1rem;">Análisis Completado</div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                            ${sourceText}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2); margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: var(--color-primary); font-size: 1.1rem;">💡 Presupuestos Sugeridos:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(5, 191, 219, 0.3);">
                            <th style="padding: 0.75rem; text-align: left; color: var(--color-primary);">Categoría</th>
                            <th style="padding: 0.75rem; text-align: center; color: var(--color-primary);">Actual</th>
                            <th style="padding: 0.75rem; text-align: center; color: var(--color-primary);">Sugerido</th>
                            <th style="padding: 0.75rem; text-align: center; color: var(--color-primary);">Cambio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(suggestedBudgets).map(([category, suggested]) => {
                            const current = budgets[category] || 0;
                            const diff = suggested - current;
                            const diffIcon = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️';
                            const diffColor = diff > 0 ? 'var(--color-primary)' : diff < 0 ? '#f59e0b' : 'rgba(255,255,255,0.6)';
                            
                            return `
                                <tr style="border-bottom: 1px solid rgba(5, 191, 219, 0.1);">
                                    <td style="padding: 0.75rem; font-weight: 600;">${category}</td>
                                    <td style="padding: 0.75rem; text-align: center; color: rgba(255,255,255,0.7);">$${current.toLocaleString()}</td>
                                    <td style="padding: 0.75rem; text-align: center; color: var(--color-success); font-weight: bold;">$${suggested.toLocaleString()}</td>
                                    <td style="padding: 0.75rem; text-align: center; color: ${diffColor}; font-weight: bold;">
                                        ${diffIcon} ${diff > 0 ? '+' : ''}$${diff.toLocaleString()}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background: rgba(212, 175, 55, 0.15); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(212, 175, 55, 0.3); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                        <div style="font-weight: bold; margin-bottom: 0.5rem;">Recomendación:</div>
                        <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                            ${source === 'historial' 
                                ? '<li>Los presupuestos sugeridos incluyen un 10% extra como margen de seguridad</li>'
                                : '<li>Distribución basada en la regla 50/30/20: 50% necesidades, 30% gustos, 20% futuro</li>'}
                            <li>Revisa cada categoría y ajusta según tus necesidades</li>
                            <li>Puedes modificar los presupuestos manualmente después de aplicarlos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">
                ❌ Cancelar
            </button>
            <button type="button" class="btn btn-primary" onclick="applyAutoBudget(${JSON.stringify(suggestedBudgets).replace(/"/g, '&quot;')})" style="flex: 1;">
                ✅ Aplicar Presupuestos
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ✨ NUEVA: Modal para presupuesto basado en ingresos con opción de edición
function showIncomeBudgetModal(suggestedBudgets, totalIncome) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const totalSuggested = Object.values(suggestedBudgets).reduce((sum, val) => sum + val, 0);
    const remainder = totalIncome - totalSuggested;
    
    modalTitle.textContent = '💰 Presupuesto desde Ingresos';
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <!-- Resumen de Ingresos -->
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(5, 191, 219, 0.2)); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(34, 197, 94, 0.3); margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">💰 Tus Ingresos Totales</div>
                <div style="font-size: 2.5rem; font-weight: bold; color: var(--color-success); margin-bottom: 0.5rem;">
                    $${totalIncome.toLocaleString()}
                </div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">
                    Vamos a distribuir este monto en categorías
                </div>
            </div>
            
            <!-- Distribución Sugerida -->
            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2); margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 1rem; color: var(--color-primary); font-size: 1.1rem;">📊 Distribución Sugerida (50/30/20):</h4>
                <div id="budget-inputs">
                    ${Object.entries(suggestedBudgets).map(([category, amount]) => {
                        const percentage = ((amount / totalIncome) * 100).toFixed(0);
                        return `
                            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <label style="font-weight: 600; flex: 1;">${category}</label>
                                    <span style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-right: 0.5rem;">${percentage}%</span>
                                </div>
                                <input type="number" 
                                       id="budget-${category.replace(/\s+/g, '-')}" 
                                       value="${amount}"
                                       min="0"
                                       step="10"
                                       onchange="updateRemainderCalculation()"
                                       style="width: 100%; padding: 0.75rem; background: rgba(0, 11, 46, 0.8); border: 2px solid rgba(5, 191, 219, 0.3); border-radius: 0.5rem; color: white; font-size: 1.1rem; font-weight: bold;">
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Remanente Calculado -->
            <div id="remainder-display" style="background: ${remainder >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; padding: 1.5rem; border-radius: 0.75rem; border: 2px solid ${remainder >= 0 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}; margin-bottom: 1.5rem; text-align: center;">
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">
                    💵 Remanente Disponible
                </div>
                <div style="font-size: 2rem; font-weight: bold; color: ${remainder >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; margin-bottom: 0.5rem;">
                    ${remainder >= 0 ? '+' : ''}$<span id="remainder-amount">${remainder.toLocaleString()}</span>
                </div>
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">
                    ${remainder >= 0 
                        ? '✅ Puedes ajustar las cantidades o dejar este dinero disponible'
                        : '⚠️ Has asignado más de tus ingresos, ajusta las cantidades'}
                </div>
            </div>
            
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1.5rem;">
                <div style="display: flex; align-items: start; gap: 0.75rem;">
                    <span style="font-size: 1.5rem;">💡</span>
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                        <div style="font-weight: bold; margin-bottom: 0.5rem;">Puedes ajustar:</div>
                        <ul style="margin: 0; padding-left: 1.2rem; line-height: 1.6;">
                            <li>Modifica cualquier monto según tus necesidades</li>
                            <li>El remanente se actualiza automáticamente</li>
                            <li>Ideal mantener algo de remanente para imprevistos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 1rem;">
            <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">
                ❌ Cancelar
            </button>
            <button type="button" class="btn btn-primary" onclick="applyIncomeBudget(${totalIncome})" style="flex: 1;">
                ✅ Aplicar y Ver Remanente
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ✨ NUEVA: Aplicar presupuesto automático
async function applyAutoBudget(suggestedBudgets) {
    try {
        // Actualizar presupuestos
        Object.assign(budgets, suggestedBudgets);
        
        // Guardar en Firebase
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        
        closeModal();
        
        // Mostrar notificación de éxito
        alert('✅ ¡Presupuestos aplicados exitosamente!\n\n' + 
              'Los nuevos presupuestos han sido configurados.\n\n' +
              'Revisa el Dashboard para ver tu remanente disponible.\n\n' +
              'Puedes modificarlos individualmente haciendo clic en cada categoría.');
        
        render();
    } catch (error) {
        alert('❌ Error al aplicar presupuestos: ' + error.message);
    }
}

// ✨ NUEVA: Actualizar cálculo de remanente en tiempo real
function updateRemainderCalculation() {
    const categories = Object.keys(budgets);
    let total = 0;
    
    categories.forEach(category => {
        const inputId = `budget-${category.replace(/\s+/g, '-')}`;
        const input = document.getElementById(inputId);
        if (input) {
            total += parseFloat(input.value) || 0;
        }
    });
    
    const { totalIncome } = calculateTotals();
    const remainder = totalIncome - total;
    
    // Actualizar display
    const remainderAmount = document.getElementById('remainder-amount');
    const remainderDisplay = document.getElementById('remainder-display');
    
    if (remainderAmount) {
        remainderAmount.textContent = Math.abs(remainder).toLocaleString();
    }
    
    if (remainderDisplay) {
        // Actualizar colores según el remanente
        if (remainder >= 0) {
            remainderDisplay.style.background = 'rgba(34, 197, 94, 0.2)';
            remainderDisplay.style.borderColor = 'rgba(34, 197, 94, 0.4)';
            remainderDisplay.querySelector('div:last-child').innerHTML = '✅ Puedes ajustar las cantidades o dejar este dinero disponible';
            remainderDisplay.querySelector('div:nth-child(2)').style.color = 'var(--color-success)';
            remainderDisplay.querySelector('div:nth-child(2)').innerHTML = `+$${remainder.toLocaleString()}`;
        } else {
            remainderDisplay.style.background = 'rgba(239, 68, 68, 0.2)';
            remainderDisplay.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            remainderDisplay.querySelector('div:last-child').innerHTML = '⚠️ Has asignado más de tus ingresos, ajusta las cantidades';
            remainderDisplay.querySelector('div:nth-child(2)').style.color = 'var(--color-danger)';
            remainderDisplay.querySelector('div:nth-child(2)').innerHTML = `$${remainder.toLocaleString()}`;
        }
    }
}

// ✨ NUEVA: Aplicar presupuesto basado en ingresos
async function applyIncomeBudget(totalIncome) {
    try {
        const categories = Object.keys(budgets);
        const newBudgets = {};
        
        // Obtener valores de los inputs
        categories.forEach(category => {
            const inputId = `budget-${category.replace(/\s+/g, '-')}`;
            const input = document.getElementById(inputId);
            if (input) {
                newBudgets[category] = parseFloat(input.value) || 0;
            }
        });
        
        // Calcular total asignado
        const totalAssigned = Object.values(newBudgets).reduce((sum, val) => sum + val, 0);
        
        // Validar que no exceda los ingresos significativamente
        if (totalAssigned > totalIncome * 1.2) {
            const confirmOverbudget = confirm(
                '⚠️ Advertencia\n\n' +
                `Has asignado $${totalAssigned.toLocaleString()} pero tus ingresos son $${totalIncome.toLocaleString()}.\n\n` +
                `Esto significa que estás planeando gastar $${(totalAssigned - totalIncome).toLocaleString()} más de lo que ganas.\n\n` +
                '¿Estás seguro de querer continuar?'
            );
            
            if (!confirmOverbudget) {
                return;
            }
        }
        
        // Actualizar presupuestos
        Object.assign(budgets, newBudgets);
        
        // Guardar en Firebase
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('budgets').set(budgets);
        
        closeModal();
        
        // Calcular remanente
        const remainder = totalIncome - totalAssigned;
        
        // Mostrar notificación con remanente
        alert('✅ ¡Presupuesto Creado!\n\n' +
              `📊 Total asignado: $${totalAssigned.toLocaleString()}\n` +
              `💰 Tus ingresos: $${totalIncome.toLocaleString()}\n` +
              `💵 Remanente: ${remainder >= 0 ? '+' : ''}$${remainder.toLocaleString()}\n\n` +
              `${remainder >= 0 
                ? '✅ Tienes dinero disponible para imprevistos o ahorro adicional.' 
                : '⚠️ Has asignado más de tus ingresos. Considera ajustar tu presupuesto.'}\n\n` +
              'Revisa el Dashboard para ver todos los detalles.');
        
        render();
    } catch (error) {
        alert('❌ Error al aplicar presupuesto: ' + error.message);
    }
}

// Modal mejorado para detalles de categoría del presupuesto
function showCategoryDetailsBudget(category) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const categoryExpenses = expenses.filter(e => e.category === category);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = budgets[category] || 0;
    const percentage = budget > 0 ? ((total / budget) * 100).toFixed(1) : 0;
    const remaining = budget - total;
    const count = categoryExpenses.length;
    
    // Calcular gastos mensuales para esta categoría
    const monthlyData = {};
    categoryExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += expense.amount;
    });
    
    // ✅ NUEVO: Calcular gastos semanales para esta categoría
    const weeklyData = {};
    categoryExpenses.forEach(expense => {
        const date = new Date(expense.date);
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const weekKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += expense.amount;
    });
    
    const monthKeys = Object.keys(monthlyData).sort().reverse().slice(0, 6);
    const weekKeys = Object.keys(weeklyData).sort().reverse().slice(0, 8);
    
    modalTitle.textContent = `📊 ${category}`;
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            ${percentage >= 80 ? `
                <div style="background: rgba(245, 158, 11, 0.2); border: 2px solid ${percentage >= 100 ? 'var(--color-danger)' : '#f59e0b'}; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; animation: slideInDown 0.3s ease;">
                    <div style="font-size: 2rem; animation: shake 0.5s ease-in-out infinite;">⚠️</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 1.05rem; color: ${percentage >= 100 ? 'var(--color-danger)' : '#f59e0b'}; margin-bottom: 0.25rem;">
                            ${percentage >= 100 ? '🚫 Presupuesto Excedido' : '⚠️ Alerta de Presupuesto'}
                        </div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                            Has alcanzado el <strong style="color: ${percentage >= 100 ? 'var(--color-danger)' : '#f59e0b'};">${percentage}%</strong> de tu presupuesto asignado
                        </div>
                    </div>
                </div>
            ` : ''}
            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">Presupuesto:</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-primary);">$${budget.toLocaleString()}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">Gastado:</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: ${percentage > 100 ? 'var(--color-danger)' : 'var(--color-primary)'};">$${total.toLocaleString()}</div>
                    </div>
                </div>
                
                <div style="background: rgba(5, 191, 219, 0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">${remaining >= 0 ? '✅ Disponible' : '🚫 Excedido'}:</div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: ${remaining >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                                $${Math.abs(remaining).toLocaleString()}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.8);">Progreso:</div>
                            <div style="font-size: 1.8rem; font-weight: bold; color: ${percentage >= 100 ? 'var(--color-danger)' : percentage >= 80 ? '#f59e0b' : 'var(--color-success)'};">
                                ${percentage}%
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); text-align: center;">
                    📝 ${count} ${count === 1 ? 'transacción' : 'transacciones'} registradas
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="editBudgetForCategory('${category}', ${budget})" style="width: 100%; margin-bottom: 1rem;">
                ✏️ Modificar Presupuesto
            </button>
            
            ${categoryExpenses.length > 0 ? `
                ${monthKeys.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📊 Comparativo Mensual</h4>
                        <div style="background: rgba(0, 11, 46, 0.6); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2);">
                            <canvas id="categoryMonthlyChart" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                ` : ''}
                
                ${weekKeys.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📅 Comparativo Semanal (Últimas 8 semanas)</h4>
                        <div style="background: rgba(0, 11, 46, 0.6); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2);">
                            <canvas id="categoryWeeklyChart" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📈 Historial de Gastos (Últimos 10)</h4>
                    <div style="background: rgba(0, 11, 46, 0.6); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2); max-height: 250px; overflow-y: auto;">
                        ${categoryExpenses.slice(0, 10).map(exp => `
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; margin-bottom: 0.5rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${exp.description}</div>
                                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${exp.date}</div>
                                </div>
                                <div style="font-weight: bold; color: var(--color-danger);">$${exp.amount.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📉 Gráfico de Tendencia</h4>
                    <div class="chart-container" style="height: 250px;">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            ` : `
                <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
                    <p>No hay gastos en esta categoría</p>
                </div>
            `}
        </div>
        <button type="button" class="btn btn-secondary" onclick="closeModal()" style="width: 100%;">Cerrar</button>
    `;
    
    modal.classList.add('active');
    
    if (categoryExpenses.length > 0) {
        setTimeout(() => {
            if (monthKeys.length > 0) {
                renderCategoryMonthlyChart(monthKeys, monthlyData, budget);
            }
            if (weekKeys.length > 0) {
                renderCategoryWeeklyChart(weekKeys, weeklyData, budget);
            }
            renderCategoryChart(category);
        }, 100);
    }
}

// ✨ MEJORADO: Gráfico comparativo mensual con barras lado a lado
function renderCategoryMonthlyChart(monthKeys, monthlyData, budget) {
    const canvas = document.getElementById('categoryMonthlyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = monthKeys.map(m => {
        const [year, month] = m.split('-');
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }).reverse();
    
    const realData = monthKeys.map(m => monthlyData[m] || 0).reverse();
    const budgetData = new Array(monthKeys.length).fill(budget);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '📋 Planeado (Presupuesto)',
                    data: budgetData,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                },
                {
                    label: '💸 Real (Gastado)',
                    data: realData,
                    backgroundColor: realData.map((value, idx) => 
                        value > budget ? 'rgba(239, 68, 68, 0.8)' : 
                        value > budget * 0.85 ? 'rgba(249, 115, 22, 0.8)' : 
                        value > budget * 0.70 ? 'rgba(245, 158, 11, 0.8)' : 
                        'rgba(5, 191, 219, 0.8)'
                    ),
                    borderColor: realData.map((value, idx) => 
                        value > budget ? 'rgba(239, 68, 68, 1)' : 
                        value > budget * 0.85 ? 'rgba(249, 115, 22, 1)' : 
                        value > budget * 0.70 ? 'rgba(245, 158, 11, 1)' : 
                        'rgba(5, 191, 219, 1)'
                    ),
                    borderWidth: 2,
                    borderRadius: 6,
                    barPercentage: 0.8,
                    categoryPercentage: 0.9
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 13,
                            weight: 'bold'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'rectRounded'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 15,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            const label = context.dataset.label;
                            
                            if (label.includes('Planeado')) {
                                return `${label}: $${value.toLocaleString()}`;
                            }
                            
                            const percentage = budget > 0 ? ((value / budget) * 100).toFixed(1) : 0;
                            const diff = value - budget;
                            const diffText = diff >= 0 ? `Excedido $${diff.toLocaleString()}` : `Dentro del presupuesto`;
                            
                            return [
                                `${label}: $${value.toLocaleString()}`,
                                `Porcentaje: ${percentage}%`,
                                `${diffText}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF',
                        font: {
                            size: 11,
                            weight: '600'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ✅ NUEVO: Gráfico comparativo semanal para categoría
function renderCategoryWeeklyChart(weekKeys, weeklyData, budget) {
    const canvas = document.getElementById('categoryWeeklyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Formatear fechas de semanas
    const labels = weekKeys.map(weekKey => {
        const date = new Date(weekKey);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}/${month}`;
    }).reverse();
    
    const data = weekKeys.map(w => weeklyData[w] || 0).reverse();
    const weeklyBudget = budget / 4.33; // Presupuesto semanal aproximado (mes / 4.33 semanas)
    const budgetLine = new Array(weekKeys.length).fill(weeklyBudget);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '💸 Gastado',
                    data: data,
                    backgroundColor: 'rgba(5, 191, 219, 0.2)',
                    borderColor: 'rgba(5, 191, 219, 1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: data.map(value => 
                        value > weeklyBudget ? 'rgba(239, 68, 68, 1)' : 
                        value > weeklyBudget * 0.8 ? 'rgba(245, 158, 11, 1)' : 
                        'rgba(5, 191, 219, 1)'
                    ),
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2
                },
                {
                    label: '📋 Prom. Semanal',
                    data: budgetLine,
                    type: 'line',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#FFFFFF',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: '#05BFDB',
                    bodyColor: '#FFFFFF',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label.includes('Prom')) {
                                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
                            }
                            const percentage = weeklyBudget > 0 ? ((context.parsed.y / weeklyBudget) * 100).toFixed(1) : 0;
                            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()} (${percentage}% del prom.)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFFFFF',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFFFFF',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Función para editar presupuesto de una categoría específica
function editBudgetForCategory(category, currentBudget) {
    closeModal();
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `✏️ Modificar Presupuesto: ${category}`;
    modalBody.innerHTML = `
        <form onsubmit="event.preventDefault(); saveSingleBudget('${category}');">
            <div class="input-group">
                <label>💰 Nuevo Presupuesto</label>
                <input type="number" id="budget-amount" value="${currentBudget}" step="0.01" required autofocus>
            </div>
            <div style="background: rgba(5, 191, 219, 0.15); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                💡 <strong>Tip:</strong> Establece un presupuesto realista basado en tus gastos promedio mensuales.
            </div>
            <button type="submit" class="btn btn-primary">Guardar Presupuesto 💾</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal(); setTimeout(() => showCategoryDetailsBudget('${category}'), 300);">Cancelar</button>
        </form>
    `;
    
    modal.classList.add('active');
}

// Guardar presupuesto individual
async function saveSingleBudget(category) {
    const amount = parseFloat(document.getElementById('budget-amount').value);
    
    if (amount >= 0) {
        try {
            budgets[category] = amount;
            await db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('budgets').set(budgets);
            closeModal();
            render();
        } catch (error) {
            alert('Error al actualizar presupuesto: ' + error.message);
        }
    }
}

// Modal para mostrar detalles de categoría
// Modal para mostrar detalles de categoría
function showCategoryDetails(category) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    const categoryExpenses = expenses.filter(e => e.category === category);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = budgets[category] || 0;
    
    modalTitle.textContent = `📊 ${category}`;
    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <div style="background: rgba(0, 11, 46, 0.6); padding: 1.2rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.3); margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: rgba(255,255,255,0.8);">Presupuesto:</span>
                    <span style="font-weight: bold; color: var(--color-primary);">$${budget.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: rgba(255,255,255,0.8);">Gastado:</span>
                    <span style="font-weight: bold; color: var(--color-danger);">$${total.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid rgba(5, 191, 219, 0.2);">
                    <span style="color: rgba(255,255,255,0.8);">Disponible:</span>
                    <span style="font-weight: bold; color: ${budget - total >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">
                        $${(budget - total).toLocaleString()}
                    </span>
                </div>
            </div>
            
            ${categoryExpenses.length > 0 ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📈 Historial de Gastos</h4>
                    <div style="background: rgba(0, 11, 46, 0.6); padding: 1rem; border-radius: 0.75rem; border: 2px solid rgba(5, 191, 219, 0.2); max-height: 200px; overflow-y: auto;">
                        ${categoryExpenses.map(exp => `
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; margin-bottom: 0.5rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem;">
                                <div>
                                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${exp.description}</div>
                                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${exp.date}</div>
                                </div>
                                <div style="font-weight: bold; color: var(--color-danger);">$${exp.amount.toLocaleString()}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div>
                    <h4 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--color-primary);">📊 Gráfico de Tendencia</h4>
                    <div class="chart-container" style="height: 250px;">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            ` : `
                <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📭</div>
                    <p>No hay gastos en esta categoría</p>
                </div>
            `}
        </div>
        <button type="button" class="btn btn-secondary" onclick="closeModal()" style="width: 100%;">Cerrar</button>
    `;
    
    modal.classList.add('active');
    
    if (categoryExpenses.length > 0) {
        setTimeout(() => renderCategoryChart(category), 100);
    }
}

// ========================================
// FUNCIONES DE FORMULARIOS
// ========================================
function loginSubmit() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    handleLogin(email, password);
}

function registerSubmit() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        alert('❌ Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        alert('❌ La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    handleRegister(email, password);
}

function switchTab(tab) {
    activeTab = tab;
    render();
}

// ✅ Función para cambiar entre pestañas de Gastos e Ingresos
// ========================================
// 🔄 FUNCIÓN ACTUALIZADA: switchTransactionTab
// ========================================
// REEMPLAZAR la función switchTransactionTab existente con esta versión

function switchTransactionTab(tab) {
    window.activeExpensesTab = tab;
    
    const expensesContent = document.getElementById('expenses-content');
    const incomesContent = document.getElementById('incomes-content');
    const recurringContent = document.getElementById('recurring-content');
    const expensesTab = document.getElementById('tab-expenses');
    const incomesTab = document.getElementById('tab-incomes');
    const recurringTab = document.getElementById('tab-recurring');
    
    // Ocultar todos
    if (expensesContent) expensesContent.style.display = 'none';
    if (incomesContent) incomesContent.style.display = 'none';
    if (recurringContent) recurringContent.style.display = 'none';
    
    // Resetear estilos de todos los tabs
    if (expensesTab) {
        expensesTab.style.background = 'rgba(255,255,255,0.1)';
        expensesTab.style.borderColor = 'rgba(255,255,255,0.2)';
        expensesTab.style.color = 'rgba(255,255,255,0.7)';
        expensesTab.style.fontWeight = 'normal';
    }
    if (incomesTab) {
        incomesTab.style.background = 'rgba(255,255,255,0.1)';
        incomesTab.style.borderColor = 'rgba(255,255,255,0.2)';
        incomesTab.style.color = 'rgba(255,255,255,0.7)';
        incomesTab.style.fontWeight = 'normal';
    }
    if (recurringTab) {
        recurringTab.style.background = 'rgba(255,255,255,0.1)';
        recurringTab.style.borderColor = 'rgba(255,255,255,0.2)';
        recurringTab.style.color = 'rgba(255,255,255,0.7)';
        recurringTab.style.fontWeight = 'normal';
    }
    
    // Mostrar y estilizar el tab seleccionado
    if (tab === 'expenses') {
        if (expensesContent) expensesContent.style.display = 'block';
        if (expensesTab) {
            expensesTab.style.background = 'rgba(5, 191, 219, 0.2)';
            expensesTab.style.borderColor = 'var(--color-primary)';
            expensesTab.style.color = 'white';
            expensesTab.style.fontWeight = 'bold';
        }
    } else if (tab === 'incomes') {
        if (incomesContent) incomesContent.style.display = 'block';
        if (incomesTab) {
            incomesTab.style.background = 'rgba(34, 197, 94, 0.2)';
            incomesTab.style.borderColor = 'var(--color-success)';
            incomesTab.style.color = 'white';
            incomesTab.style.fontWeight = 'bold';
        }
    } else if (tab === 'recurring') {
        if (recurringContent) recurringContent.style.display = 'block';
        if (recurringTab) {
            recurringTab.style.background = 'rgba(168, 85, 247, 0.2)';
            recurringTab.style.borderColor = 'var(--color-secondary)';
            recurringTab.style.color = 'white';
            recurringTab.style.fontWeight = 'bold';
        }
        
        // ✨ NUEVO: Renderizar gráficos cuando se muestra el tab de recurrentes
        setTimeout(() => {
            if (typeof renderRecurringCharts === 'function') {
                renderRecurringCharts();
            }
        }, 100);
    }
}

// Exportar
window.switchTransactionTab = switchTransactionTab;




// ========================================
// INICIAR APP
// ========================================

// ========================================
// 🔄 VISTA DE GASTOS RECURRENTES - CÓDIGO COMPLETO
// ========================================
// Este código va DESPUÉS de la función renderMoreSection() en app.js

/**
 * 🔄 Renderizar vista completa de gastos recurrentes
 */
function renderRecurringExpensesView() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Módulo de Gastos Recurrentes no disponible</h3>
                <p style="color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
                    Por favor, recarga la página
                </p>
            </div>
        `;
    }

    const stats = recurringModule.getStatistics();
    const upcoming = recurringModule.getUpcomingExpenses(30);
    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    const pausedRecurring = recurringModule.recurringExpenses.filter(r => !r.active);

    return `
        <div style="padding: 1rem;">
            <!-- Header con botón volver -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
                <button onclick="switchTab('more')" class="btn-back" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 0.5rem; color: white; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
                    ← Volver
                </button>
                <h2 style="margin: 0; flex: 1; text-align: center;">🔄 Gastos Recurrentes</h2>
                <div style="width: 80px;"></div>
            </div>

            <!-- Estadísticas rápidas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-success);">${stats.active}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Activos</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-warning);">${stats.paused}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Pausados</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Mensual estimado</div>
                </div>
                <div class="card" style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-info);">${stats.totalGenerated}</div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">Generados (30d)</div>
                </div>
            </div>

            <!-- Botón para agregar nuevo -->
            <button 
                onclick="openRecurringModal()" 
                class="add-recurring-btn"
                style="width: 100%; padding: 1rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border: none; border-radius: 0.85rem; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(5, 191, 219, 0.3);">
                <span style="font-size: 1.5rem;">+</span>
                Agregar Gasto Recurrente
            </button>

            <!-- Tabs: Activos / Pausados / Próximos / Gráficas -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem;">
                <button onclick="switchRecurringTab('active')" id="recurring-tab-active" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(5, 191, 219, 0.2); border: 1px solid var(--color-primary); border-radius: 0.5rem; color: white; cursor: pointer; white-space: nowrap; font-weight: 600;">
                    ✅ Activos (${stats.active})
                </button>
                <button onclick="switchRecurringTab('paused')" id="recurring-tab-paused" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    ⏸️ Pausados (${stats.paused})
                </button>
                <button onclick="switchRecurringTab('upcoming')" id="recurring-tab-upcoming" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    📅 Próximos (${upcoming.length})
                </button>
                <button onclick="switchRecurringTab('charts')" id="recurring-tab-charts" class="recurring-tab" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: rgba(255,255,255,0.7); cursor: pointer; white-space: nowrap;">
                    📊 Gráficas
                </button>
            </div>

            <!-- Contenido de tabs -->
            <div id="recurring-content-active" class="recurring-content">
                ${renderRecurringList(activeRecurring, 'active')}
            </div>

            <div id="recurring-content-paused" class="recurring-content" style="display: none;">
                ${renderRecurringList(pausedRecurring, 'paused')}
            </div>

            <div id="recurring-content-upcoming" class="recurring-content" style="display: none;">
                ${renderUpcomingExpenses(upcoming)}
            </div>

            <div id="recurring-content-charts" class="recurring-content" style="display: none;">
                ${renderRecurringCharts(stats)}
            </div>
        </div>
    `;
}

/**
 * 📋 Renderizar lista de gastos recurrentes
 */
function renderRecurringList(recurringList, type) {
    if (recurringList.length === 0) {
        const messages = {
            active: { icon: '✅', text: 'No hay gastos recurrentes activos', subtext: 'Agrega uno para automatizar tus gastos' },
            paused: { icon: '⏸️', text: 'No hay gastos pausados', subtext: 'Los gastos pausados aparecerán aquí' }
        };
        const msg = messages[type];
        
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${msg.icon}</div>
                <h3>${msg.text}</h3>
                <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem;">${msg.subtext}</p>
            </div>
        `;
    }

    return recurringList.map(recurring => {
        const freqInfo = recurringModule.frequencies[recurring.frequency];
        const nextDate = new Date(recurring.nextDate);
        const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0;
        const category = categorias.find(c => c.nombre === recurring.category);
        
        return `
            <div class="card" style="margin-bottom: 1rem; position: relative; border-left: 4px solid ${category ? category.color : 'var(--color-primary)'};">
                <!-- Badge de estado -->
                ${isOverdue ? `
                    <div style="position: absolute; top: 0.75rem; right: 0.75rem; background: var(--color-danger); color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                        ⚠️ Vencido
                    </div>
                ` : ''}
                
                <!-- Contenido principal -->
                <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
                    <!-- Icono de frecuencia -->
                    <div style="font-size: 2.5rem; flex-shrink: 0;">${freqInfo.icon}</div>
                    
                    <!-- Información -->
                    <div style="flex: 1; min-width: 0;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${recurring.description}</h3>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <!-- Monto -->
                            <div style="background: rgba(239, 68, 68, 0.2); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-weight: 600; color: var(--color-danger);">
                                $${recurring.amount.toFixed(2)}
                            </div>
                            
                            <!-- Frecuencia -->
                            <div style="background: rgba(5, 191, 219, 0.2); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; color: var(--color-primary);">
                                ${freqInfo.label}
                            </div>
                            
                            <!-- Categoría -->
                            <div style="background: rgba(255,255,255,0.1); padding: 0.35rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                                ${category ? category.emoji : '📌'} ${recurring.category}
                            </div>
                        </div>
                        
                        <!-- Próxima fecha -->
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                            ${type === 'active' ? `
                                📅 Próximo: ${nextDate.toLocaleDateString('es-ES')}
                                ${!isOverdue ? `<span style="color: var(--color-info);">(en ${daysUntil} día${daysUntil !== 1 ? 's' : ''})</span>` : ''}
                            ` : `
                                🗓️ Desde: ${new Date(recurring.startDate).toLocaleDateString('es-ES')}
                            `}
                        </div>
                        
                        <!-- Estadísticas -->
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                            📊 Generado ${recurring.timesGenerated || 0} veces
                            ${recurring.lastGenerated ? ` · Último: ${new Date(recurring.lastGenerated.seconds * 1000).toLocaleDateString('es-ES')}` : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Botones de acción -->
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${type === 'active' ? `
                        <button onclick="pauseRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(251, 191, 36, 0.2); border: 1px solid var(--color-warning); border-radius: 0.5rem; color: var(--color-warning); cursor: pointer; font-weight: 600;">
                            ⏸️ Pausar
                        </button>
                    ` : `
                        <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(34, 197, 94, 0.2); border: 1px solid var(--color-success); border-radius: 0.5rem; color: var(--color-success); cursor: pointer; font-weight: 600;">
                            ▶️ Activar
                        </button>
                    `}
                    
                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(5, 191, 219, 0.2); border: 1px solid var(--color-primary); border-radius: 0.5rem; color: var(--color-primary); cursor: pointer; font-weight: 600;">
                        ✏️ Editar
                    </button>
                    
                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 120px; padding: 0.65rem; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--color-danger); border-radius: 0.5rem; color: var(--color-danger); cursor: pointer; font-weight: 600;">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 📅 Renderizar próximos gastos (calendario)
 */
function renderUpcomingExpenses(upcoming) {
    if (upcoming.length === 0) {
        return `
            <div class="card" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📅</div>
                <h3>No hay gastos próximos</h3>
                <p style="color: rgba(255,255,255,0.6); margin-top: 0.5rem;">Los próximos 30 días están libres</p>
            </div>
        `;
    }

    // Agrupar por semana
    const byWeek = {};
    upcoming.forEach(item => {
        const weekStart = new Date(item.dueDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!byWeek[weekKey]) {
            byWeek[weekKey] = [];
        }
        byWeek[weekKey].push(item);
    });

    return Object.entries(byWeek).map(([weekKey, items]) => {
        const weekStart = new Date(weekKey);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const totalWeek = items.reduce((sum, item) => sum + item.amount, 0);
        
        return `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h3 style="margin: 0;">
                        📅 ${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </h3>
                    <div style="font-weight: 600; color: var(--color-danger);">
                        $${totalWeek.toFixed(2)}
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${items.map(item => {
                        const category = categorias.find(c => c.nombre === item.category);
                        const isToday = item.daysUntil === 0;
                        const isTomorrow = item.daysUntil === 1;
                        
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; ${isToday ? 'border: 2px solid var(--color-warning);' : ''}">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="font-size: 1.5rem;">${category ? category.emoji : '📌'}</div>
                                    <div>
                                        <div style="font-weight: 600;">${item.description}</div>
                                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                            ${item.dueDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                                            ${isToday ? '<span style="color: var(--color-warning); font-weight: 600;"> · HOY</span>' : ''}
                                            ${isTomorrow ? '<span style="color: var(--color-info); font-weight: 600;"> · MAÑANA</span>' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div style="font-weight: 600; color: var(--color-danger);">
                                    $${item.amount.toFixed(2)}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 📊 Renderizar gráficas
 */
function renderRecurringCharts(stats) {
    return `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Gráfica: Distribución por categoría -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📊 Distribución por Categoría</h3>
                <canvas id="recurring-category-chart" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Gráfica: Distribución por frecuencia -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">🔄 Distribución por Frecuencia</h3>
                <canvas id="recurring-frequency-chart" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Comparativo: Gastos totales vs recurrentes -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">💰 Impacto en el Presupuesto</h3>
                <div style="padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255,255,255,0.7);">Gastos totales este mes:</span>
                        <span style="font-weight: 600;">$${calculateMonthlyTotal().toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: rgba(255,255,255,0.7);">Recurrentes estimados:</span>
                        <span style="font-weight: 600; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                        <span style="color: rgba(255,255,255,0.9); font-weight: 600;">% del presupuesto:</span>
                        <span style="font-weight: 700; color: var(--color-warning);">
                            ${calculateMonthlyTotal() > 0 ? ((stats.monthlyEstimate / calculateMonthlyTotal()) * 100).toFixed(1) : 0}%
                        </span>
                    </div>
                </div>
                <canvas id="recurring-impact-chart" style="max-height: 250px;"></canvas>
            </div>
            
            <!-- Timeline de generación -->
            <div class="card">
                <h3 style="margin-bottom: 1rem;">📈 Historial de Generación (últimos 30 días)</h3>
                ${renderGenerationTimeline()}
            </div>
        </div>
    `;
}

/**
 * 📈 Renderizar timeline de generación
 */
function renderGenerationTimeline() {
    const history = recurringModule.generatedHistory;
    
    if (history.length === 0) {
        return `
            <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.6);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                <div>No hay gastos generados en los últimos 30 días</div>
            </div>
        `;
    }

    // Agrupar por día
    const byDay = {};
    history.forEach(expense => {
        const day = expense.date;
        if (!byDay[day]) {
            byDay[day] = [];
        }
        byDay[day].push(expense);
    });

    return `
        <div style="max-height: 400px; overflow-y: auto;">
            ${Object.entries(byDay)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .map(([day, expenses]) => {
                    const totalDay = expenses.reduce((sum, e) => sum + e.amount, 0);
                    const date = new Date(day);
                    
                    return `
                        <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600;">
                                    ${date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                                <span style="font-weight: 600; color: var(--color-danger);">
                                    $${totalDay.toFixed(2)}
                                </span>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem;">
                                ${expenses.map(expense => {
                                    const category = categorias.find(c => c.nombre === expense.category);
                                    return `
                                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem;">
                                            <span style="color: rgba(255,255,255,0.8);">
                                                ${category ? category.emoji : '📌'} ${expense.description}
                                            </span>
                                            <span style="color: rgba(255,255,255,0.9);">
                                                $${expense.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
        </div>
    `;
}

/**
 * 🎯 Cambiar entre tabs de recurrentes
 */
function switchRecurringTab(tab) {
    // Actualizar tabs
    ['active', 'paused', 'upcoming', 'charts'].forEach(t => {
        const tabButton = document.getElementById(`recurring-tab-${t}`);
        const content = document.getElementById(`recurring-content-${t}`);
        
        if (t === tab) {
            tabButton.style.background = 'rgba(5, 191, 219, 0.2)';
            tabButton.style.borderColor = 'var(--color-primary)';
            tabButton.style.color = 'white';
            tabButton.style.fontWeight = '600';
            content.style.display = 'block';
        } else {
            tabButton.style.background = 'rgba(255,255,255,0.1)';
            tabButton.style.borderColor = 'rgba(255,255,255,0.2)';
            tabButton.style.color = 'rgba(255,255,255,0.7)';
            tabButton.style.fontWeight = '400';
            content.style.display = 'none';
        }
    });

    // Renderizar gráficos si es necesario
    if (tab === 'charts') {
        setTimeout(() => {
            renderRecurringChartsCanvas();
        }, 100);
    }
}

/**
 * 📊 Renderizar gráficos con Chart.js
 */
function renderRecurringChartsCanvas() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js no está cargado');
        return;
    }

    const stats = recurringModule.getStatistics();

    // Gráfico de categorías
    const categoryCanvas = document.getElementById('recurring-category-chart');
    if (categoryCanvas && stats.byCategory) {
        const categories = Object.keys(stats.byCategory);
        const amounts = Object.values(stats.byCategory);
        const colors = categories.map(cat => {
            const category = categorias.find(c => c.nombre === cat);
            return category ? category.color : 'rgba(5, 191, 219, 0.7)';
        });

        new Chart(categoryCanvas, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#000b2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white', padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de frecuencias
    const frequencyCanvas = document.getElementById('recurring-frequency-chart');
    if (frequencyCanvas && stats.byFrequency) {
        const frequencies = Object.keys(stats.byFrequency);
        const counts = Object.values(stats.byFrequency);
        const labels = frequencies.map(f => recurringModule.frequencies[f]?.label || f);

        new Chart(frequencyCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad',
                    data: counts,
                    backgroundColor: 'rgba(5, 191, 219, 0.7)',
                    borderColor: 'var(--color-primary)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: 'white',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Gráfico de impacto
    const impactCanvas = document.getElementById('recurring-impact-chart');
    if (impactCanvas) {
        const totalExpenses = calculateMonthlyTotal();
        const recurring = stats.monthlyEstimate;
        const other = Math.max(0, totalExpenses - recurring);

        new Chart(impactCanvas, {
            type: 'pie',
            data: {
                labels: ['Gastos Recurrentes', 'Otros Gastos'],
                datasets: [{
                    data: [recurring, other],
                    backgroundColor: [
                        'rgba(5, 191, 219, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderWidth: 2,
                    borderColor: '#000b2e'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white', padding: 15 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed || 0;
                                const total = totalExpenses;
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * 💰 Calcular total de gastos del mes
 */
function calculateMonthlyTotal() {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    
    return expenses
        .filter(e => {
            const expenseDate = new Date(e.date);
            return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
        })
        .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * ➕ Abrir modal para crear/editar gasto recurrente
 */
function openRecurringModal(recurringId = null) {
    const isEdit = recurringId !== null;
    const recurring = isEdit ? recurringModule.recurringExpenses.find(r => r.id === recurringId) : null;

    const modalHTML = `
        <div class="modal-backdrop" onclick="closeRecurringModal()"></div>
        <div class="modal-content" style="max-width: 500px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h2>${isEdit ? '✏️ Editar' : '➕ Agregar'} Gasto Recurrente</h2>
                <button onclick="closeRecurringModal()" class="modal-close">×</button>
            </div>
            
            <form id="recurring-form" onsubmit="handleRecurringSubmit(event, ${isEdit ? `'${recurringId}'` : 'null'})" style="padding: 1.5rem;">
                <!-- Descripción -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Descripción *
                    </label>
                    <input 
                        type="text" 
                        id="recurring-description" 
                        value="${isEdit ? recurring.description : ''}"
                        placeholder="Ej: Netflix, Renta, Gym"
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                </div>

                <!-- Monto -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Monto ($) *
                    </label>
                    <input 
                        type="number" 
                        id="recurring-amount" 
                        value="${isEdit ? recurring.amount : ''}"
                        step="0.01" 
                        min="0.01" 
                        placeholder="0.00"
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                </div>

                <!-- Categoría -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Categoría *
                    </label>
                    <select 
                        id="recurring-category" 
                        required
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    >
                        <option value="" ${!isEdit ? 'selected' : ''}>Selecciona una categoría</option>
                        ${categorias.filter(c => c.tipo === 'gasto').map(cat => `
                            <option value="${cat.nombre}" ${isEdit && recurring.category === cat.nombre ? 'selected' : ''}>
                                ${cat.emoji} ${cat.nombre}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Frecuencia -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Frecuencia *
                    </label>
                    <select 
                        id="recurring-frequency" 
                        required
                        onchange="toggleDayOfMonth()"
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    >
                        ${Object.entries(recurringModule.frequencies).map(([key, freq]) => `
                            <option value="${key}" ${isEdit && recurring.frequency === key ? 'selected' : ''}>
                                ${freq.icon} ${freq.label}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Día del mes (solo para mensual) -->
                <div id="day-of-month-container" style="margin-bottom: 1.5rem; display: ${isEdit && recurring.frequency === 'monthly' ? 'block' : 'none'};">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Día del mes (opcional)
                    </label>
                    <input 
                        type="number" 
                        id="recurring-day-of-month" 
                        value="${isEdit && recurring.dayOfMonth ? recurring.dayOfMonth : ''}"
                        min="1" 
                        max="31"
                        placeholder="Ej: 15 (día 15 de cada mes)"
                        style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                    />
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                        Si no especificas, se usará el día de la fecha de inicio
                    </div>
                </div>

                <!-- Fecha de inicio -->
                ${!isEdit ? `
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                            Fecha de inicio *
                        </label>
                        <input 
                            type="date" 
                            id="recurring-start-date" 
                            value="${new Date().toISOString().split('T')[0]}"
                            required
                            style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;"
                        />
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                            Primera vez que se generará este gasto
                        </div>
                    </div>
                ` : `
                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem;">
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.25rem;">
                            Fecha de inicio:
                        </div>
                        <div style="font-weight: 600;">
                            ${new Date(recurring.startDate).toLocaleDateString('es-ES')}
                        </div>
                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 0.75rem; margin-bottom: 0.25rem;">
                            Próxima ejecución:
                        </div>
                        <div style="font-weight: 600; color: var(--color-primary);">
                            ${new Date(recurring.nextDate).toLocaleDateString('es-ES')}
                        </div>
                    </div>
                `}

                <!-- Botones -->
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button 
                        type="button" 
                        onclick="closeRecurringModal()"
                        style="flex: 1; padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border: none; border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;"
                    >
                        ${isEdit ? '💾 Guardar Cambios' : '➕ Crear Recurrente'}
                    </button>
                </div>
            </form>
        </div>
    `;

    // Insertar modal
    const modalContainer = document.createElement('div');
    modalContainer.id = 'recurring-modal';
    modalContainer.className = 'modal';
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
}

/**
 * 🔧 Toggle día del mes
 */
function toggleDayOfMonth() {
    const frequency = document.getElementById('recurring-frequency').value;
    const container = document.getElementById('day-of-month-container');
    
    if (frequency === 'monthly') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        document.getElementById('recurring-day-of-month').value = '';
    }
}

/**
 * ❌ Cerrar modal de recurrentes
 */
function closeRecurringModal() {
    const modal = document.getElementById('recurring-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * 💾 Manejar submit del formulario de recurrentes
 */
async function handleRecurringSubmit(event, recurringId = null) {
    event.preventDefault();
    
    const description = document.getElementById('recurring-description').value.trim();
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const category = document.getElementById('recurring-category').value;
    const frequency = document.getElementById('recurring-frequency').value;
    const dayOfMonth = document.getElementById('recurring-day-of-month')?.value || null;
    const startDate = document.getElementById('recurring-start-date')?.value || null;

    const isEdit = recurringId !== null;

    try {
        let result;
        
        if (isEdit) {
            // Actualizar
            result = await recurringModule.updateRecurringExpense(recurringId, {
                description,
                amount,
                category,
                frequency,
                dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null
            });
        } else {
            // Crear nuevo
            result = await recurringModule.createRecurringExpense({
                description,
                amount,
                category,
                frequency,
                startDate,
                dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null
            });
        }

        if (result.success) {
            closeRecurringModal();
            // Recargar vista
            switchTab('more-recurring');
        }
    } catch (error) {
        console.error('Error en formulario de recurrentes:', error);
        alert('Error: ' + error.message);
    }
}

/**
 * ⏸️ Pausar gasto recurrente
 */
async function pauseRecurring(id) {
    if (confirm('¿Pausar este gasto recurrente?\n\nNo se generarán nuevos gastos hasta que lo reactives.')) {
        const result = await recurringModule.toggleActive(id);
        if (result.success) {
            switchTab('more-recurring');
        }
    }
}

/**
 * ▶️ Activar gasto recurrente
 */
async function activateRecurring(id) {
    const result = await recurringModule.toggleActive(id);
    if (result.success) {
        switchTab('more-recurring');
    }
}

/**
 * ✏️ Editar gasto recurrente
 */
function editRecurring(id) {
    openRecurringModal(id);
}

/**
 * 🗑️ Eliminar gasto recurrente
 */
async function deleteRecurring(id) {
    const recurring = recurringModule.recurringExpenses.find(r => r.id === id);
    
    if (!recurring) return;
    
    if (confirm(`¿Eliminar "${recurring.description}"?\n\nEsta acción no se puede deshacer. Los gastos ya generados NO serán eliminados.`)) {
        const result = await recurringModule.deleteRecurringExpense(id);
        if (result.success) {
            switchTab('more-recurring');
        }
    }
}


// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 */
// ========================================
// 🔄 VISTA COMPLETA DE RECURRENTES (Una sola página)
// ========================================
// Esta función REEMPLAZA renderRecurringExpensesViewIntegrated()

/**
 * 🔄 Renderizar vista COMPLETA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Módulo de Gastos Recurrentes no disponible</h3>
                <p style="color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
                    Por favor, recarga la página
                </p>
            </div>
        `;
    }

    const stats = recurringModule.getStatistics();
    const upcoming = recurringModule.getUpcomingExpenses(30);
    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    const pausedRecurring = recurringModule.recurringExpenses.filter(r => !r.active);
    const allRecurring = [...activeRecurring, ...pausedRecurring];

    return `
        <div style="padding: 0;">
            <!-- 📊 ESTADÍSTICAS -->
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
                    <span style="font-size: 1.5rem;">📊</span>
                    <span>Resumen General</span>
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);">${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);">${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);">${stats.totalGenerated}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Generados</div>
                    </div>
                </div>
            </div>

            <!-- 📈 GRÁFICOS COMPARATIVOS -->
            ${allRecurring.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
                        <span style="font-size: 1.5rem;">📈</span>
                        <span>Análisis Comparativo</span>
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                        <!-- Gráfico de barras: Recurrentes vs Únicos -->
                        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
                            <h4 style="margin-bottom: 1rem; font-size: 1rem; color: rgba(255,255,255,0.9);">
                                📊 Gastos Recurrentes vs Únicos
                            </h4>
                            <canvas id="recurring-vs-unique-chart" style="max-height: 250px;"></canvas>
                        </div>
                        
                        <!-- Gráfico circular: Distribución por categoría -->
                        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
                            <h4 style="margin-bottom: 1rem; font-size: 1rem; color: rgba(255,255,255,0.9);">
                                🎯 Distribución por Categoría
                            </h4>
                            <canvas id="recurring-categories-chart" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- 📋 LISTA DE GASTOS RECURRENTES -->
            <div style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
                    <span style="font-size: 1.5rem;">📋</span>
                    <span>Mis Gastos Recurrentes</span>
                </h3>
                
                ${activeRecurring.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-success); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">✅</span>
                            <span>ACTIVOS (${activeRecurring.length})</span>
                        </div>
                        ${activeRecurring.map(recurring => {
                            const nextDate = recurringModule.calculateNextOccurrence(recurring);
                            const daysUntil = Math.ceil((new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24));
                            
                            return `
                                <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border-left: 4px solid var(--color-success);">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                        <div style="flex: 1;">
                                            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.25rem;">
                                                ${getFrequencyEmoji(recurring.frequency)} ${recurring.description}
                                            </div>
                                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                                                ${recurring.category} • ${getFrequencyText(recurring)}
                                            </div>
                                        </div>
                                        <div style="text-align: right;">
                                            <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-primary);">
                                                $${recurring.amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="padding: 0.5rem; background: rgba(5, 191, 219, 0.15); border-radius: 0.5rem; margin-bottom: 0.75rem;">
                                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9);">
                                            📅 Próximo: <strong>${formatDate(nextDate)}</strong>
                                            ${daysUntil === 0 ? '<span style="color: var(--color-warning); font-weight: bold;"> (¡HOY!)</span>' : 
                                              daysUntil === 1 ? '<span style="color: var(--color-warning);"> (Mañana)</span>' :
                                              ` (en ${daysUntil} días)`}
                                        </div>
                                    </div>
                                    
                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                        <button onclick="pauseRecurring('${recurring.id}')" class="btn-secondary" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                            ⏸️ Pausar
                                        </button>
                                        <button onclick="editRecurring('${recurring.id}')" class="btn-secondary" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                            ✏️ Editar
                                        </button>
                                        <button onclick="deleteRecurring('${recurring.id}')" class="btn-danger" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
                
                ${pausedRecurring.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <div style="font-size: 0.95rem; font-weight: 600; color: var(--color-warning); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">⏸️</span>
                            <span>PAUSADOS (${pausedRecurring.length})</span>
                        </div>
                        ${pausedRecurring.map(recurring => `
                            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border-left: 4px solid var(--color-warning); opacity: 0.7;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                    <div style="flex: 1;">
                                        <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.25rem;">
                                            ${getFrequencyEmoji(recurring.frequency)} ${recurring.description}
                                        </div>
                                        <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                                            ${recurring.category} • ${getFrequencyText(recurring)}
                                        </div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-warning);">
                                            $${recurring.amount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="padding: 0.5rem; background: rgba(251, 191, 36, 0.2); border-radius: 0.5rem; margin-bottom: 0.75rem;">
                                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9);">
                                        ⏸️ Este gasto está pausado y no se generará automáticamente
                                    </div>
                                </div>
                                
                                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                    <button onclick="activateRecurring('${recurring.id}')" class="btn-primary" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" class="btn-secondary" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" class="btn-danger" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${allRecurring.length === 0 ? `
                    <div style="text-align: center; padding: 3rem 1rem; background: rgba(255,255,255,0.05); border-radius: 0.75rem; border: 2px dashed rgba(255,255,255,0.2);">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
                        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem;">
                            No tienes gastos recurrentes
                        </div>
                        <div style="font-size: 0.95rem; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">
                            Crea tu primer gasto recurrente usando el botón + abajo
                        </div>
                        <div style="padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.5rem; border-left: 3px solid var(--color-primary);">
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9); text-align: left;">
                                💡 <strong>Tip:</strong> Al agregar un gasto normal, marca la casilla "Este gasto es recurrente" para que se repita automáticamente cada mes.
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- 📅 CALENDARIO DE PRÓXIMOS 30 DÍAS -->
            ${upcoming.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
                        <span style="font-size: 1.5rem;">📅</span>
                        <span>Próximos 30 Días</span>
                    </h3>
                    ${renderUpcomingTimeline(upcoming)}
                </div>
            ` : ''}

            <!-- 📊 IMPACTO MENSUAL -->
            ${allRecurring.length > 0 ? `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 1.2rem;">
                        <span style="font-size: 1.5rem;">📊</span>
                        <span>Proyección de Impacto</span>
                    </h3>
                    ${renderMonthlyImpact(stats)}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * 📅 Renderizar timeline de próximos gastos
 */
function renderUpcomingTimeline(upcoming) {
    const grouped = {};
    
    upcoming.forEach(item => {
        const date = item.date.split('T')[0];
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const totalDay = items.reduce((sum, item) => sum + item.amount, 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1.5rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1.5rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                            <div>
                                <div style="font-size: 1rem; font-weight: bold; color: var(--color-primary);">
                                    📅 ${formatDate(date)}
                                </div>
                                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">
                                    ${daysUntil === 0 ? '¡HOY!' : daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
                                </div>
                            </div>
                            <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-danger);">
                                $${totalDay.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${getFrequencyEmoji(item.recurring.frequency)} ${item.recurring.description}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${item.amount.toFixed(2)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * 📊 Renderizar proyección de impacto mensual
 */
function renderMonthlyImpact(stats) {
    const monthlyTotal = stats.monthlyEstimate;
    const yearlyTotal = monthlyTotal * 12;
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.15); border-radius: 0.75rem;">
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem;">
                        Impacto Mensual
                    </div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary);">
                        $${monthlyTotal.toFixed(2)}
                    </div>
                </div>
                <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.15); border-radius: 0.75rem;">
                    <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem;">
                        Proyección Anual
                    </div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--color-secondary);">
                        $${yearlyTotal.toFixed(2)}
                    </div>
                </div>
            </div>
            
            <div style="padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.5rem; border-left: 3px solid var(--color-warning);">
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
                    💡 <strong>Consejo:</strong> Tus gastos recurrentes representan aproximadamente 
                    <strong>${((monthlyTotal / (income.salary + income.freelance + income.investments || 1)) * 100).toFixed(1)}%</strong> 
                    de tus ingresos mensuales.
                </div>
            </div>
        </div>
    `;
}

/**
 * 🎨 Helper: Obtener emoji según frecuencia
 */
function getFrequencyEmoji(frequency) {
    const emojis = {
        'daily': '📅',
        'weekly': '📆',
        'monthly': '🗓️',
        'yearly': '📋'
    };
    return emojis[frequency] || '🔄';
}

/**
 * 📝 Helper: Obtener texto de frecuencia
 */
function getFrequencyText(recurring) {
    const texts = {
        'daily': 'Todos los días',
        'weekly': `Cada ${['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][recurring.dayOfWeek || 0]}`,
        'monthly': `Día ${recurring.dayOfMonth || 1} de cada mes`,
        'yearly': 'Una vez al año'
    };
    return texts[recurring.frequency] || 'Recurrente';
}

/**
 * 📅 Helper: Formatear fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-ES', options);
}




/**
 * ➕ Abrir modal para crear/editar gasto recurrente desde FAB
 */
function openRecurringFromFAB() {
    window.activeExpensesTab = 'recurring';
    switchTransactionTab('recurring');
    
    // Cerrar el menú FAB
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) {
        fabMenu.style.display = 'none';
    }
    
    // Scroll al inicio y resaltar botón
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const addButton = document.querySelector('.add-recurring-btn');
        if (addButton) {
            addButton.style.animation = 'pulse 1s ease 3';
        }
    }, 300);
}



// ✅ CRÍTICO: Exponer funciones al scope global para onclick
window.deleteIncome = deleteIncome;
window.deleteExpense = deleteExpense;
window.deleteGoal = deleteGoal;
window.addMoneyToGoal = addMoneyToGoal;
window.openAddExpenseModal = openAddExpenseModal;
window.openAddIncomeModal = openAddIncomeModal;
window.openAddGoalModal = openAddGoalModal;
window.openAddBudgetModal = openAddBudgetModal;
window.handleExpenseSubmit = handleExpenseSubmit;
window.handleIncomeSubmit = handleIncomeSubmit;
window.handleGoalSubmit = handleGoalSubmit;
window.handleBudgetSubmit = handleBudgetSubmit;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.switchTransactionTab = switchTransactionTab;
window.loginSubmit = loginSubmit;
window.registerSubmit = registerSubmit;
window.handleLogout = handleLogout;
window.openCategoryDetails = openCategoryDetails;
window.showCategoryDetailsBudget = showCategoryDetailsBudget;
window.openFinancialDetailModal = openFinancialDetailModal;
window.editBudgetForCategory = editBudgetForCategory;
window.saveSingleBudget = saveSingleBudget;
window.generateAutoBudget = generateAutoBudget;
window.applyAutoBudget = applyAutoBudget;
window.generateFromIncome = generateFromIncome;
window.generateFromHistory = generateFromHistory;
window.showHistoricalDataNeeded = showHistoricalDataNeeded;
window.updateRemainderCalculation = updateRemainderCalculation;
window.applyIncomeBudget = applyIncomeBudget;
window.generateBudgetFromExpenses = generateBudgetFromExpenses; // ✨ NUEVA - Flujo principal
window.confirmBudgetFromExpenses = confirmBudgetFromExpenses; // ✨ NUEVA
window.startTutorial = startTutorial; // ✨ TUTORIAL
window.nextTutorialStep = nextTutorialStep; // ✨ TUTORIAL
window.previousTutorialStep = previousTutorialStep; // ✨ TUTORIAL
window.skipTutorial = skipTutorial; // ✨ TUTORIAL
// 🔐 NUEVAS - Recuperación de contraseña
window.showPasswordResetModal = showPasswordResetModal;
window.handlePasswordReset = handlePasswordReset;
window.handlePasswordResetSubmit = handlePasswordResetSubmit;
// 💰💸 NUEVAS - Modales de flujo de presupuesto
window.showNeedIncomesModal = showNeedIncomesModal;
window.showNeedExpensesModal = showNeedExpensesModal;
// 🤖 NUEVAS - Asistente Virtual
window.showAssistant = showAssistant;
window.sendAssistantMessage = sendAssistantMessage;
window.quickAssistantAction = quickAssistantAction;
// 🔄 Funciones de gastos recurrentes
window.switchRecurringTab = switchRecurringTab;
window.openRecurringModal = openRecurringModal;
window.closeRecurringModal = closeRecurringModal;
window.handleRecurringSubmit = handleRecurringSubmit;
window.toggleDayOfMonth = toggleDayOfMonth;
window.pauseRecurring = pauseRecurring;
window.activateRecurring = activateRecurring;
window.editRecurring = editRecurring;
window.deleteRecurring = deleteRecurring;

// 🔄 Funciones de gastos recurrentes
window.switchRecurringTab = switchRecurringTab;
window.openRecurringModal = openRecurringModal;
window.closeRecurringModal = closeRecurringModal;
window.handleRecurringSubmit = handleRecurringSubmit;
window.toggleDayOfMonth = toggleDayOfMonth;
window.pauseRecurring = pauseRecurring;
window.activateRecurring = activateRecurring;
window.editRecurring = editRecurring;
window.deleteRecurring = deleteRecurring;
window.openRecurringFromFAB = openRecurringFromFAB;

// ========================================
// 📊 GRÁFICOS COMPARATIVOS PARA RECURRENTES
// ========================================
// Funciones para renderizar gráficos con Chart.js

/**
 * 📊 Renderizar todos los gráficos de recurrentes
 * Llamar después de que el DOM esté listo
 */
function renderRecurringCharts() {
    // Esperar a que los canvas estén en el DOM
    setTimeout(() => {
        renderRecurringVsUniqueChart();
        renderRecurringCategoriesChart();
    }, 100);
}

/**
 * 📊 Gráfico: Recurrentes vs Gastos Únicos
 */
function renderRecurringVsUniqueChart() {
    const canvas = document.getElementById('recurring-vs-unique-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.recurringVsUniqueChart) {
        window.recurringVsUniqueChart.destroy();
    }
    
    // Calcular datos
    const recurringExpenses = expenses.filter(exp => exp.isRecurring);
    const uniqueExpenses = expenses.filter(exp => !exp.isRecurring);
    
    const recurringTotal = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const uniqueTotal = uniqueExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const recurringCount = recurringExpenses.length;
    const uniqueCount = uniqueExpenses.length;
    
    // Crear gráfico
    window.recurringVsUniqueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Cantidad de Gastos', 'Monto Total'],
            datasets: [
                {
                    label: '🔄 Recurrentes',
                    data: [recurringCount, recurringTotal],
                    backgroundColor: 'rgba(168, 85, 247, 0.7)',
                    borderColor: 'rgba(168, 85, 247, 1)',
                    borderWidth: 2
                },
                {
                    label: '💸 Únicos',
                    data: [uniqueCount, uniqueTotal],
                    backgroundColor: 'rgba(5, 191, 219, 0.7)',
                    borderColor: 'rgba(5, 191, 219, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: 'rgba(255, 255, 255, 1)',
                    bodyColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(5, 191, 219, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.dataIndex === 1) {
                                label += '$' + context.parsed.y.toFixed(2);
                            } else {
                                label += context.parsed.y;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * 🎯 Gráfico: Distribución por Categoría
 */
function renderRecurringCategoriesChart() {
    const canvas = document.getElementById('recurring-categories-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (window.recurringCategoriesChart) {
        window.recurringCategoriesChart.destroy();
    }
    
    if (!recurringModule || !recurringModule.recurringExpenses) {
        return;
    }
    
    // Agrupar por categoría
    const categoryTotals = {};
    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    
    activeRecurring.forEach(recurring => {
        const category = recurring.category;
        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }
        
        // Calcular impacto mensual según frecuencia
        let monthlyAmount = recurring.amount;
        switch(recurring.frequency) {
            case 'daily':
                monthlyAmount = recurring.amount * 30;
                break;
            case 'weekly':
                monthlyAmount = recurring.amount * 4;
                break;
            case 'yearly':
                monthlyAmount = recurring.amount / 12;
                break;
        }
        
        categoryTotals[category] += monthlyAmount;
    });
    
    // Preparar datos para el gráfico
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Colores por categoría
    const colors = labels.map(label => {
        const cat = categorias.find(c => c.nombre === label);
        return cat ? cat.color : '#64748b';
    });
    
    if (labels.length === 0) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos suficientes', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Crear gráfico
    window.recurringCategoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: colors,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                            size: 11
                        },
                        padding: 10,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label}: $${value.toFixed(0)} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 11, 46, 0.95)',
                    titleColor: 'rgba(255, 255, 255, 1)',
                    bodyColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(5, 191, 219, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 🔄 Actualizar gráficos cuando cambian los datos
 */
function updateRecurringChartsData() {
    if (window.activeExpensesTab === 'recurring') {
        renderRecurringCharts();
    }
}

// Exportar funciones
window.renderRecurringCharts = renderRecurringCharts;
window.updateRecurringChartsData = updateRecurringChartsData;
window.renderRecurringVsUniqueChart = renderRecurringVsUniqueChart;
window.renderRecurringCategoriesChart = renderRecurringCategoriesChart;


window.renderRecurringExpensesViewIntegrated = renderRecurringExpensesViewIntegrated;

render();

// ========================================
// 🤖 FUNCIONES DEL ASISTENTE AI
// ========================================

async function sendAssistantMessage() {
    if (!assistantModule) return;
    
    const input = document.getElementById('assistant-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    input.disabled = true;
    
    try {
        const response = await assistantModule.sendMessage(message);
        render();
        
        // Scroll al final
        setTimeout(() => {
            const chatArea = document.getElementById('assistant-chat');
            if (chatArea) {
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        }, 100);
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error al enviar mensaje');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

async function sendQuickAction(actionId, message) {
    if (!assistantModule) return;
    
    document.getElementById('assistant-input').value = message;
    await sendAssistantMessage();
}

async function toggleAssistantMode() {
    if (!assistantModule) return;
    
    const newMode = await assistantModule.toggleMode();
    
    if (window.Toastify) {
        Toastify({
            text: newMode ? '✅ Modo Online activado' : '📴 Modo Offline activado',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: 'linear-gradient(to right, #10b981, #059669)'
            }
        }).showToast();
    }
    
    render();
}

function configureAssistantAPIKey() {
    const apiKey = prompt('Ingresa tu API Key de Claude:\n\nPuedes obtenerla en console.anthropic.com');
    
    if (apiKey && apiKey.trim()) {
        assistantModule.setAPIKey(apiKey.trim());
        
        if (window.Toastify) {
            Toastify({
                text: '✅ API Key configurada correctamente',
                duration: 3000,
                gravity: 'top',
                position: 'center',
                style: {
                    background: 'linear-gradient(to right, #10b981, #059669)'
                }
            }).showToast();
        }
        
        render();
    }
}

function startNewAssistantConversation() {
    if (!assistantModule) return;
    
    if (confirm('¿Iniciar una nueva conversación? Se guardará la actual.')) {
        assistantModule.startNewConversation();
        render();
    }
}

// ========================================
// 🔄 FUNCIONES DE GASTOS RECURRENTES
// ========================================

function openCreateRecurringExpenseModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '🔄 Crear Gasto Recurrente';
    modalBody.innerHTML = `
        <form onsubmit="event.preventDefault(); createRecurringExpense();">
            <div class="input-group">
                <label>📝 Descripción</label>
                <input type="text" id="recurring-description" placeholder="Netflix, Renta, etc." required autofocus>
            </div>
            
            <div class="input-group">
                <label>💰 Monto</label>
                <input type="number" id="recurring-amount" placeholder="199.00" step="0.01" required>
            </div>
            
            <div class="input-group">
                <label>📂 Categoría</label>
                <select id="recurring-category" required>
                    <option value="">Seleccionar...</option>
                    <option value="Gastos Esenciales">Gastos Esenciales</option>
                    <option value="Gastos Discrecionales">Gastos Discrecionales</option>
                    <option value="Pago Deudas">Pago Deudas</option>
                    <option value="Ahorros">Ahorros</option>
                    <option value="Inversiones">Inversiones</option>
                </select>
            </div>
            
            <div class="input-group">
                <label>🔄 Frecuencia</label>
                <select id="recurring-frequency" onchange="updateFrequencyOptions()" required>
                    <option value="">Seleccionar...</option>
                    <option value="daily">📅 Diaria</option>
                    <option value="weekly">📆 Semanal</option>
                    <option value="biweekly">🗓️ Quincenal</option>
                    <option value="monthly">📋 Mensual</option>
                    <option value="annual">🎂 Anual</option>
                </select>
            </div>
            
            <div class="input-group">
                <label>📅 Fecha de inicio</label>
                <input type="date" id="recurring-start-date" required>
            </div>
            
            <div class="input-group" id="day-of-month-group" style="display: none;">
                <label>📆 Día del mes (para frecuencia mensual)</label>
                <input type="number" id="recurring-day-of-month" min="1" max="31" placeholder="15">
            </div>
            
            <button type="submit" class="btn btn-primary">✅ Crear Gasto Recurrente</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        </form>
    `;
    
    // Set default date to today
    document.getElementById('recurring-start-date').valueAsDate = new Date();
    
    modal.classList.add('active');
}

function updateFrequencyOptions() {
    const frequency = document.getElementById('recurring-frequency').value;
    const dayOfMonthGroup = document.getElementById('day-of-month-group');
    
    if (frequency === 'monthly') {
        dayOfMonthGroup.style.display = 'block';
    } else {
        dayOfMonthGroup.style.display = 'none';
    }
}

async function createRecurringExpense() {
    if (!recurringModule) return;
    
    const expenseData = {
        description: document.getElementById('recurring-description').value,
        amount: parseFloat(document.getElementById('recurring-amount').value),
        category: document.getElementById('recurring-category').value,
        frequency: document.getElementById('recurring-frequency').value,
        startDate: document.getElementById('recurring-start-date').value,
        dayOfMonth: document.getElementById('recurring-day-of-month').value || null
    };
    
    const result = await recurringModule.createRecurringExpense(expenseData);
    
    if (result.success) {
        closeModal();
        render();
    }
}

async function pauseRecurringExpense(id) {
    if (!recurringModule) return;
    
    if (confirm('¿Pausar este gasto recurrente? Dejará de generarse automáticamente.')) {
        await recurringModule.pauseRecurringExpense(id);
        render();
    }
}

async function resumeRecurringExpense(id) {
    if (!recurringModule) return;
    
    await recurringModule.resumeRecurringExpense(id);
    render();
}

async function editRecurringExpense(id) {
    if (!recurringModule) return;
    
    const recurring = recurringModule.recurringExpenses.find(r => r.id === id);
    if (!recurring) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = '✏️ Editar Gasto Recurrente';
    modalBody.innerHTML = `
        <form onsubmit="event.preventDefault(); saveRecurringExpenseEdit('${id}');">
            <div class="input-group">
                <label>📝 Descripción</label>
                <input type="text" id="edit-recurring-description" value="${recurring.description}" required>
            </div>
            
            <div class="input-group">
                <label>💰 Monto</label>
                <input type="number" id="edit-recurring-amount" value="${recurring.amount}" step="0.01" required>
            </div>
            
            <div class="input-group">
                <label>📂 Categoría</label>
                <select id="edit-recurring-category" required>
                    <option value="Gastos Esenciales" ${recurring.category === 'Gastos Esenciales' ? 'selected' : ''}>Gastos Esenciales</option>
                    <option value="Gastos Discrecionales" ${recurring.category === 'Gastos Discrecionales' ? 'selected' : ''}>Gastos Discrecionales</option>
                    <option value="Pago Deudas" ${recurring.category === 'Pago Deudas' ? 'selected' : ''}>Pago Deudas</option>
                    <option value="Ahorros" ${recurring.category === 'Ahorros' ? 'selected' : ''}>Ahorros</option>
                    <option value="Inversiones" ${recurring.category === 'Inversiones' ? 'selected' : ''}>Inversiones</option>
                </select>
            </div>
            
            <button type="submit" class="btn btn-primary">💾 Guardar Cambios</button>
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        </form>
    `;
    
    modal.classList.add('active');
}

async function saveRecurringExpenseEdit(id) {
    if (!recurringModule) return;
    
    const updates = {
        description: document.getElementById('edit-recurring-description').value,
        amount: parseFloat(document.getElementById('edit-recurring-amount').value),
        category: document.getElementById('edit-recurring-category').value
    };
    
    const result = await recurringModule.updateRecurringExpense(id, updates);
    
    if (result.success) {
        closeModal();
        render();
    }
}

async function deleteRecurringExpense(id) {
    if (!recurringModule) return;
    
    if (confirm('¿Eliminar este gasto recurrente permanentemente?')) {
        await recurringModule.deleteRecurringExpense(id);
        render();
    }
}

// ========================================
// 📊 FUNCIONES DE REPORTES
// ========================================

function changeReportPeriod(period) {
    if (!reportsModule) return;
    
    reportsModule.currentPeriod = period;
    render();
    
    // Renderizar gráficos después de que se actualice el DOM
    setTimeout(() => {
        renderReportCharts();
    }, 100);
}

function renderReportCharts() {
    if (!reportsModule) return;
    
    try {
        // Destruir gráficos anteriores
        reportsModule.destroyAllCharts();
        
        // Crear gráfico de tendencias
        reportsModule.createMonthlyComparisonChart('trends-chart', 6);
        
        // Crear gráfico de categorías con click habilitado
        reportsModule.createCategoryChart('categories-chart', true);
        
        console.log('✅ Gráficos de reportes renderizados');
    } catch (error) {
        console.error('Error renderizando gráficos:', error);
    }
}

function showCategoryDetails(categoryName) {
    if (!reportsModule) return;
    
    const details = reportsModule.getCategoryDetails(categoryName);
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = `📂 ${categoryName}`;
    modalBody.innerHTML = `
        <div class="category-details-modal">
            <div class="category-stats-grid">
                <div class="stat-item">
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">Total</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
                        $${details.total.toFixed(2)}
                    </div>
                </div>
                <div class="stat-item">
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">Transacciones</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
                        ${details.count}
                    </div>
                </div>
                <div class="stat-item">
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">Promedio</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
                        $${details.statistics.average.toFixed(2)}
                    </div>
                </div>
                <div class="stat-item">
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">Máximo</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">
                        $${details.statistics.max.toFixed(2)}
                    </div>
                </div>
            </div>
            
            <h4 style="margin: 1.5rem 0 1rem;">📊 Top 10 Transacciones</h4>
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Descripción</th>
                            <th style="text-align: right;">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${details.topTransactions.map(t => `
                            <tr>
                                <td>${formatDate(new Date(t.date))}</td>
                                <td>${t.description}</td>
                                <td style="text-align: right;">
                                    <span class="transaction-amount expense">$${t.amount.toFixed(2)}</span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <button class="btn btn-secondary" onclick="closeModal()" style="width: 100%; margin-top: 1.5rem;">
                Cerrar
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

function exportReportToCSV() {
    if (!reportsModule) return;
    
    const now = new Date();
    const filename = `reporte-financiero-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.csv`;
    
    reportsModule.exportToCSV(filename);
}

// Callback para cuando se hace click en una categoría del gráfico
window.onCategoryDetailRequest = function(categoryName) {
    showCategoryDetails(categoryName);
};

// ========================================
// HELPER FUNCTION
// ========================================

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// ========================================
// FUNCIONES PARA GASTOS RECURRENTES (COMPATIBILIDAD)
// ========================================

/**
 * 🔄 Cargar gastos recurrentes desde el módulo
 */
async function loadRecurringExpenses() {
    try {
        if (!recurringModule) {
            console.warn('⚠️ RecurringModule no está inicializado');
            return;
        }
        
        // El módulo ya carga los datos en su initialize()
        // Esta función es solo para compatibilidad
        console.log('✅ Gastos recurrentes cargados desde el módulo');
    } catch (error) {
        console.error('Error cargando gastos recurrentes:', error);
    }
}

/**
 * 🔄 Verificar y generar gastos recurrentes pendientes
 */
async function checkAndGenerateRecurringExpenses() {
    try {
        if (!recurringModule) {
            console.warn('⚠️ RecurringModule no está inicializado');
            return;
        }
        
        // El módulo ya hace esto en su initialize()
        await recurringModule.checkAndGenerateRecurring();
        console.log('✅ Verificación de gastos recurrentes completada');
    } catch (error) {
        console.error('Error verificando gastos recurrentes:', error);
    }
}

/**
 * 🔄 Abrir modal para agregar gasto recurrente
 */
function openAddRecurringExpenseModal() {
    // Cambiar a la pestaña de gastos recurrentes
    switchTab('more-recurring');
    
    // Hacer scroll al inicio para ver el botón de agregar
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Resaltar el botón de agregar
        const addButton = document.querySelector('.add-recurring-btn');
        if (addButton) {
            addButton.style.animation = 'pulse 1s ease 3';
        }
    }, 300);
}

// ========================================
// FUNCIONES PARA REPORTES (DETALLES DE CATEGORÍA)
// ========================================

/**
 * 📊 Abrir detalles de una categoría desde gráficos
 */
function openCategoryDetails(category) {
    try {
        if (!category) {
            console.error('❌ Categoría no especificada');
            return;
        }
        
        console.log('📊 Abriendo detalles de categoría:', category);
        
        // Cambiar a la pestaña de reportes
        switchTab('more-reports');
        
        // Esperar a que se renderice y buscar la sección de detalles
        setTimeout(() => {
            // Buscar en los gastos de esa categoría
            const categoryExpenses = expenses.filter(e => e.category === category);
            
            if (categoryExpenses.length === 0) {
                showToast(`No hay gastos en la categoría: ${category}`, 'info');
                return;
            }
            
            // Crear un modal con los detalles
            const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            const avgAmount = total / categoryExpenses.length;
            
            const modalHTML = `
                <div class="modal" onclick="closeModal()">
                    <div class="modal-content" onclick="event.stopPropagation()">
                        <div class="modal-header">
                            <h2>📊 Detalles: ${category}</h2>
                            <button class="close-btn" onclick="closeModal()">✖</button>
                        </div>
                        <div class="modal-body">
                            <div class="category-stats">
                                <div class="stat-card">
                                    <div class="stat-label">Total Gastado</div>
                                    <div class="stat-value" style="color: var(--color-danger);">
                                        $${total.toFixed(2)}
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-label">Número de Gastos</div>
                                    <div class="stat-value">${categoryExpenses.length}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-label">Promedio por Gasto</div>
                                    <div class="stat-value">$${avgAmount.toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <h3 style="margin-top: 1.5rem; margin-bottom: 1rem;">📋 Lista de Gastos</h3>
                            <div class="transactions-list" style="max-height: 400px; overflow-y: auto;">
                                ${categoryExpenses.map(expense => `
                                    <div class="transaction-item expense">
                                        <div class="transaction-info">
                                            <div class="transaction-icon">💸</div>
                                            <div class="transaction-details">
                                                <div class="transaction-desc">${expense.description}</div>
                                                <div class="transaction-date">${formatDate(expense.date)}</div>
                                            </div>
                                        </div>
                                        <div class="transaction-amount expense">-$${expense.amount.toFixed(2)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Insertar modal
            const existingModal = document.querySelector('.modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
        }, 300);
        
    } catch (error) {
        console.error('Error abriendo detalles de categoría:', error);
        showToast('Error al abrir detalles de categoría', 'error');
    }
}

/**
 * 📊 Renderizar configuración de presupuestos
 * Función auxiliar para mostrar settings de presupuesto
 */
function renderBudgetSettings() {
    try {
        return `
            <div class="budget-settings-info">
                <p>Configura tus presupuestos mensuales para cada categoría</p>
            </div>
        `;
    } catch (error) {
        console.error('Error en renderBudgetSettings:', error);
        return '';
    }
}

/**
 * 🔔 Renderizar configuración de notificaciones
 */
function renderNotificationSettings() {
    try {
        if (!notificationsModule) {
            return `
                <div class="card">
                    <h3>🔔 Notificaciones</h3>
                    <p style="color: rgba(255, 255, 255, 0.6);">
                        Sistema de notificaciones no disponible
                    </p>
                </div>
            `;
        }

        const prefs = notificationsModule.preferences || {};
        
        return `
            <div class="card">
                <h3>🔔 Configuración de Notificaciones</h3>
                <div class="notifications-settings">
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" 
                                   ${prefs.enabled !== false ? 'checked' : ''} 
                                   onchange="toggleNotifications(this.checked)">
                            Activar notificaciones
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" 
                                   ${prefs.budgetAlerts !== false ? 'checked' : ''} 
                                   onchange="toggleBudgetAlerts(this.checked)">
                            Alertas de presupuesto
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" 
                                   ${prefs.weeklyReport !== false ? 'checked' : ''} 
                                   onchange="toggleWeeklyReport(this.checked)">
                            Reporte semanal
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" 
                                   ${prefs.unusualExpenses !== false ? 'checked' : ''} 
                                   onchange="toggleUnusualExpenses(this.checked)">
                            Alertas de gastos inusuales
                        </label>
                    </div>
                </div>
                
                ${renderNotificationStats()}
            </div>
        `;
    } catch (error) {
        console.error('Error en renderNotificationSettings:', error);
        return '';
    }
}

/**
 * 📊 Renderizar estadísticas de notificaciones
 */
function renderNotificationStats() {
    try {
        if (!notificationsModule) {
            return '';
        }

        const history = notificationsModule.history || [];
        const recent = history.slice(0, 5);
        
        if (recent.length === 0) {
            return `
                <div class="notification-stats">
                    <p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 1rem;">
                        No hay notificaciones recientes
                    </p>
                </div>
            `;
        }

        return `
            <div class="notification-stats">
                <h4 style="margin-top: 1.5rem; margin-bottom: 1rem;">Notificaciones Recientes</h4>
                <div class="notifications-list">
                    ${recent.map(notif => `
                        <div class="notification-item">
                            <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
                            <div class="notification-content">
                                <div class="notification-title">${notif.title}</div>
                                <div class="notification-message">${notif.message}</div>
                                <div class="notification-date">${formatNotificationDate(notif.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error en renderNotificationStats:', error);
        return '';
    }
}

/**
 * 🔔 Obtener icono según tipo de notificación
 */
function getNotificationIcon(type) {
    const icons = {
        'budget_warning': '⚠️',
        'budget_exceeded': '🚨',
        'unusual_expense': '👀',
        'weekly_report': '📊',
        'goal_progress': '🎯',
        'recurring_reminder': '🔄'
    };
    return icons[type] || '🔔';
}

/**
 * 📅 Formatear fecha de notificación
 */
function formatNotificationDate(timestamp) {
    try {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hace un momento';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} h`;
        if (days < 7) return `Hace ${days} días`;
        
        return date.toLocaleDateString();
    } catch (error) {
        return '';
    }
}

/**
 * ⚙️ Funciones de configuración de notificaciones
 */
async function toggleNotifications(enabled) {
    if (!notificationsModule) return;
    await notificationsModule.updatePreferences({ enabled });
    showToast(enabled ? 'Notificaciones activadas' : 'Notificaciones desactivadas', 'success');
}

async function toggleBudgetAlerts(enabled) {
    if (!notificationsModule) return;
    await notificationsModule.updatePreferences({ budgetAlerts: enabled });
    showToast(enabled ? 'Alertas de presupuesto activadas' : 'Alertas de presupuesto desactivadas', 'success');
}

async function toggleWeeklyReport(enabled) {
    if (!notificationsModule) return;
    await notificationsModule.updatePreferences({ weeklyReport: enabled });
    showToast(enabled ? 'Reporte semanal activado' : 'Reporte semanal desactivado', 'success');
}

async function toggleUnusualExpenses(enabled) {
    if (!notificationsModule) return;
    await notificationsModule.updatePreferences({ unusualExpenses: enabled });
    showToast(enabled ? 'Alertas de gastos inusuales activadas' : 'Alertas de gastos inusuales desactivadas', 'success');
}

// ========================================
// EXPORTAR FUNCIONES AL SCOPE GLOBAL
// ========================================

// Asistente AI
window.sendAssistantMessage = sendAssistantMessage;
window.sendQuickAction = sendQuickAction;
window.toggleAssistantMode = toggleAssistantMode;
window.configureAssistantAPIKey = configureAssistantAPIKey;
window.startNewAssistantConversation = startNewAssistantConversation;

// Gastos Recurrentes
window.openCreateRecurringExpenseModal = openCreateRecurringExpenseModal;
window.updateFrequencyOptions = updateFrequencyOptions;
window.createRecurringExpense = createRecurringExpense;
window.pauseRecurringExpense = pauseRecurringExpense;
window.resumeRecurringExpense = resumeRecurringExpense;
window.editRecurringExpense = editRecurringExpense;
window.saveRecurringExpenseEdit = saveRecurringExpenseEdit;
window.deleteRecurringExpense = deleteRecurringExpense;

// Reportes
window.changeReportPeriod = changeReportPeriod;
window.renderReportCharts = renderReportCharts;
window.showCategoryDetails = showCategoryDetails;
window.exportReportToCSV = exportReportToCSV;

// ✅ NUEVAS - Funciones de compatibilidad
window.loadRecurringExpenses = loadRecurringExpenses;
window.checkAndGenerateRecurringExpenses = checkAndGenerateRecurringExpenses;
window.openAddRecurringExpenseModal = openAddRecurringExpenseModal;
window.openCategoryDetails = openCategoryDetails;
window.renderBudgetSettings = renderBudgetSettings;

// ✅ NUEVAS - Funciones de notificaciones
window.renderNotificationSettings = renderNotificationSettings;
window.renderNotificationStats = renderNotificationStats;
window.getNotificationIcon = getNotificationIcon;
window.formatNotificationDate = formatNotificationDate;
window.toggleNotifications = toggleNotifications;
window.toggleBudgetAlerts = toggleBudgetAlerts;
window.toggleWeeklyReport = toggleWeeklyReport;
window.toggleUnusualExpenses = toggleUnusualExpenses;

console.log('✅ Todas las funciones exportadas correctamente');

// Función para verificar módulos cargados
function checkLoadedModules() {
    const modules = {
        'NotificationsModule': typeof NotificationsModule !== 'undefined',
        'RecurringExpensesModule': typeof RecurringExpensesModule !== 'undefined',
        'ComparisonModule': typeof ComparisonModule !== 'undefined',
        'ReportsModule': typeof ReportsModule !== 'undefined',
        'VirtualAssistantModule': typeof VirtualAssistantModule !== 'undefined'
    };
    
    console.log('📋 Estado de módulos:');
    Object.entries(modules).forEach(([name, loaded]) => {
        console.log(`${loaded ? '✅' : '❌'} ${name}: ${loaded ? 'Cargado' : 'No encontrado'}`);
    });
    
    return modules;
}

// ========================================
// INICIALIZACIÓN DE MÓDULOS
// ========================================
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando módulos...');
    
    // Esperar a que Chart.js esté disponible
    const initializeApp = () => {
        if (typeof Chart === 'undefined') {
            console.log('⏳ Esperando a que Chart.js se cargue...');
            setTimeout(initializeApp, 100);
            return;
        }
        
        console.log('✅ Chart.js está disponible');
        
        // Inicializar módulo de notificaciones
        if (typeof NotificationsModule !== 'undefined') {
            try {
                notificationsModule = new NotificationsModule(db);
                console.log('✅ Módulo de notificaciones inicializado');
            } catch (error) {
                console.warn('⚠️ Error al inicializar notificaciones:', error);
            }
        } else {
            console.warn('⚠️ NotificationsModule no está disponible');
        }
        
        // Inicializar módulo de gastos recurrentes
        if (typeof RecurringExpensesModule !== 'undefined') {
            try {
                recurringModule = new RecurringExpensesModule(db, null);
                recurringModule.isInitialized = true;
                console.log('✅ Módulo de gastos recurrentes inicializado');
            } catch (error) {
                console.warn('⚠️ Error al inicializar gastos recurrentes:', error);
            }
        } else {
            console.warn('⚠️ RecurringExpensesModule no está disponible');
        }
        
        // Inicializar módulo de comparación
        if (typeof ComparisonModule !== 'undefined') {
            try {
                comparisonModule = new ComparisonModule(db, null);
                comparisonModule.isInitialized = true;
                console.log('✅ Módulo de comparación inicializado');
            } catch (error) {
                console.warn('⚠️ Error al inicializar comparación:', error);
            }
        } else {
            console.warn('⚠️ ComparisonModule no está disponible');
        }
        
        // Inicializar módulo de reportes
        if (typeof ReportsModule !== 'undefined') {
            try {
                reportsModule = new ReportsModule(db);
                console.log('✅ Módulo de reportes inicializado');
            } catch (error) {
                console.warn('⚠️ Error al inicializar reportes:', error);
            }
        } else {
            console.warn('⚠️ ReportsModule no está disponible');
        }
        
        // Inicializar asistente AI
        if (typeof VirtualAssistantModule !== 'undefined') {
            try {
                assistantModule = new VirtualAssistantModule(db, currentUser ? currentUser.uid : null);
                console.log('✅ Módulo de asistente AI inicializado');
            } catch (error) {
                console.warn('⚠️ Error al inicializar asistente AI:', error);
            }
        } else {
            console.warn('⚠️ VirtualAssistantModule no está disponible');
        }
        
        console.log('🎉 Todos los módulos disponibles han sido inicializados');
    };
    
    // Iniciar la aplicación
    initializeApp();
});

// ========================================
// FUNCIÓN GLOBAL PARA RENDERIZAR COMPARACIÓN
// ========================================
window.renderComparisonView = function(expenses, currentMonth, previousMonth) {
    if (comparisonModule && comparisonModule.isInitialized) {
        return comparisonModule.renderComparisonView(expenses, currentMonth, previousMonth);
    } else {
        console.warn('⚠️ ComparisonModule no está inicializado');
        return `
            <div class="comparison-placeholder">
                <p>📊 Módulo de comparación no disponible</p>
                <p style="font-size: 0.9em; opacity: 0.7;">Recarga la página para intentar de nuevo</p>
            </div>
        `;
    }
};
