// ========================================
// 🔥 FIREBASE REFERENCES  
// ========================================
const auth = firebase.auth();
const db = firebase.firestore();

// ========================================
// 🔧 MODAL FIX - SOLUCIÓN INTEGRADA
// ========================================
// Este código crea la estructura del modal y las funciones necesarias

// Crear estructura del modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    createModalStructure();
    hideFloatingAssistant();
    
    // Observer para ocultar botón flotante si aparece después
    const observer = new MutationObserver(hideFloatingAssistant);
    observer.observe(document.body, { childList: true, subtree: true });
});

// Función para crear la estructura del modal
function createModalStructure() {
    if (document.getElementById('modal')) return;
    
    const modalHTML = `
        <div id="modal" class="modal" style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 99999;
            align-items: center;
            justify-content: center;
        ">
            <div class="modal-content" style="
                background: linear-gradient(135deg, #1a2332 0%, #0d1520 100%);
                padding: 0;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 80px rgba(0,0,0,0.8);
                border: 1px solid #05BFDB;
            ">
                <div class="modal-header" style="
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(5,191,219,0.1);
                ">
                    <h3 id="modal-title" style="margin: 0; color: white; font-size: 1.3rem;"></h3>
                    <button onclick="closeModal()" style="
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                    ">×</button>
                </div>
                <div id="modal-body" style="padding: 1.5rem;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Añadir estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        #modal.active { display: flex !important; }
        #modal input, #modal select {
            width: 100%;
            padding: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            box-sizing: border-box;
            margin-bottom: 0.5rem;
        }
        #modal input:focus, #modal select:focus {
            outline: none;
            border-color: #05BFDB;
        }
        #modal select option { background: #1a2332; color: white; }
        #modal label {
            display: block;
            margin-bottom: 0.5rem;
            color: rgba(255,255,255,0.8);
            font-size: 0.9rem;
        }
        #modal .input-group { margin-bottom: 1rem; }
        .assistant-float-btn, .floating-assistant-button, .assistant-floating-btn,
        #assistantFloatBtn, #floating-assistant, .ai-assistant-float, .assistant-fab {
            display: none !important;
            visibility: hidden !important;
        }
    `;
    document.head.appendChild(style);
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Función para abrir el modal de transacciones (gastos/ingresos)
function openModal(type) {
    createModalStructure();
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) {
        alert('Error al abrir el formulario. Recarga la página.');
        return;
    }

    const isExpense = type === 'expense';
    const isIncome = type === 'income';
    
    if (isExpense || isIncome) {
        modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
        modalBody.innerHTML = generateTransactionFormHTML(isExpense);
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Generar HTML del formulario de transacción
function generateTransactionFormHTML(isExpense) {
    const categories = isExpense ? `
        <option value="">Selecciona categoría...</option>
        <option value="Alimentación">🍔 Alimentación</option>
        <option value="Transporte">🚗 Transporte</option>
        <option value="Entretenimiento">🎬 Entretenimiento</option>
        <option value="Salud">💊 Salud</option>
        <option value="Educación">📚 Educación</option>
        <option value="Vivienda">🏠 Vivienda</option>
        <option value="Servicios">💡 Servicios</option>
        <option value="Ropa">👕 Ropa</option>
        <option value="Tecnología">💻 Tecnología</option>
        <option value="Mascotas">🐕 Mascotas</option>
        <option value="Gastos Esenciales">🏠 Gastos Esenciales</option>
        <option value="Gastos Discrecionales">🎭 Gastos Discrecionales</option>
        <option value="Pago Deudas">💳 Pago Deudas</option>
        <option value="Otros">📌 Otros</option>
    ` : `
        <option value="">Selecciona tipo...</option>
        <option value="salary">💼 Salario</option>
        <option value="freelance">💻 Freelance</option>
        <option value="investments">📈 Inversiones</option>
        <option value="bonus">🎁 Bonos</option>
        <option value="other">📌 Otros</option>
    `;
    
    return `
        <form onsubmit="return handleTransactionSubmit(event, '${isExpense ? 'expense' : 'income'}')">
            <div class="input-group">
                <label>📝 Descripción</label>
                <input type="text" id="tx-description" placeholder="${isExpense ? 'Ej: Supermercado...' : 'Ej: Pago mensual...'}" required>
            </div>
            <div class="input-group">
                <label>💵 Monto</label>
                <input type="number" id="tx-amount" step="0.01" min="0.01" placeholder="0.00" required>
            </div>
            <div class="input-group">
                <label>${isExpense ? '📂 Categoría' : '📂 Tipo'}</label>
                <select id="tx-category" required>${categories}</select>
            </div>
            <div class="input-group">
                <label>📅 Fecha</label>
                <input type="date" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            ${isExpense ? `
            <div class="input-group">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="tx-recurring" style="width: auto;" onchange="toggleRecurringOptions()">
                    <span>🔄 Hacer recurrente</span>
                </label>
                <div id="recurring-options" style="display: none; margin-top: 10px;">
                    <select id="tx-frequency">
                        <option value="monthly">📅 Mensual</option>
                        <option value="weekly">📆 Semanal</option>
                        <option value="biweekly">📆 Quincenal</option>
                        <option value="yearly">📋 Anual</option>
                    </select>
                </div>
            </div>
            ` : ''}
            <button type="submit" style="
                width: 100%;
                padding: 12px;
                background: ${isExpense ? '#ef4444' : '#10b981'};
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                margin-top: 1rem;
            ">${isExpense ? '💸 Guardar Gasto' : '💰 Guardar Ingreso'}</button>
            <button type="button" onclick="closeModal()" style="
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                margin-top: 0.5rem;
            ">Cancelar</button>
        </form>
    `;
}

// Toggle para opciones recurrentes
function toggleRecurringOptions() {
    const checkbox = document.getElementById('tx-recurring');
    const options = document.getElementById('recurring-options');
    if (checkbox && options) {
        options.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// Handler para submit del formulario
async function handleTransactionSubmit(event, type) {
    event.preventDefault();
    
    const description = document.getElementById('tx-description')?.value.trim();
    const amount = parseFloat(document.getElementById('tx-amount')?.value);
    const category = document.getElementById('tx-category')?.value;
    const date = document.getElementById('tx-date')?.value;
    const isRecurring = document.getElementById('tx-recurring')?.checked;
    const frequency = document.getElementById('tx-frequency')?.value;
    
    if (!description || !amount || !category || !date) {
        showToast('❌ Completa todos los campos', 'error');
        return false;
    }
    
    if (amount <= 0) {
        showToast('❌ El monto debe ser mayor a 0', 'error');
        return false;
    }

    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Guardando...';
    submitBtn.disabled = true;
    
    try {
        if (!currentUser) {
            throw new Error('No hay usuario autenticado');
        }
        
        const isExpense = type === 'expense';
        
        if (isExpense && isRecurring && recurringModule) {
            await recurringModule.createRecurringExpense({
                name: description,
                description: description,
                amount: amount,
                category: category,
                frequency: frequency || 'monthly'
            });
            showToast('✅ Gasto recurrente creado', 'success');
        } else {
            const collectionName = isExpense ? 'expenses' : 'incomes';
            const data = {
                description,
                amount,
                category,
                date,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (!isExpense) data.type = category;
            
            await db.collection('users').doc(currentUser.uid).collection(collectionName).add(data);
            
            if (isExpense) {
                expenses.unshift({ ...data, id: 'temp-' + Date.now() });
            } else {
                incomeHistory.unshift({ ...data, id: 'temp-' + Date.now() });
                income[category] = (income[category] || 0) + amount;
            }
            
            showToast('✅ ' + (isExpense ? 'Gasto' : 'Ingreso') + ' guardado', 'success');
        }
        
        closeModal();
        
        if (typeof loadUserData === 'function') await loadUserData();
        if (typeof render === 'function') render();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('❌ ' + error.message, 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
    
    return false;
}

// Función showToast si no existe
if (typeof showToast === 'undefined') {
    window.showToast = function(message, type) {
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
                    borderRadius: '8px',
                    padding: '12px 24px'
                }
            }).showToast();
        } else {
            alert(message);
        }
    };
}

// Ocultar botón flotante del asistente
function hideFloatingAssistant() {
    const selectors = ['.assistant-float-btn', '.floating-assistant-button', '#assistantFloatBtn', 
                       '#floating-assistant', '.ai-assistant-float', '.assistant-fab'];
    selectors.forEach(s => {
        document.querySelectorAll(s).forEach(el => {
            el.style.display = 'none';
            el.remove();
        });
    });
}

console.log('✅ Modal Fix integrado cargado correctamente');

// ========================================
// FIN DEL MODAL FIX
// ========================================


// ========================================
// ESTADO GLOBAL
// ========================================
let currentUser = null;
let isInitialized = false;  // Flag para evitar inicializaciones múltiples
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
let descriptionChart = null;
let incomeChart = null;
let savingsRateChart = null;

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

// 📅 Nombres de meses en español
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

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
        
        // Cargar datos del usuario primero
        await loadUserData();
        await loadTutorialStatus();
        
        // Inicializar módulos SOLO si no están inicializados
        if (!isInitialized) {
            isInitialized = true;
            
            // Inicializar notificaciones
            try {
                if (typeof initializeNotifications === 'function') {
                    await initializeNotifications();
                    console.log('✅ Notificaciones inicializadas');
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando notificaciones:', error);
            }
            
            // Inicializar Asistente Virtual
            try {
                if (window.VirtualAssistantModule && !assistantModule) {
                    assistantModule = new VirtualAssistantModule(db, user.uid);
                    await assistantModule.initialize();
                    console.log('✅ Asistente Virtual AI inicializado');
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando asistente:', error);
                assistantModule = null;
            }
            
            // Inicializar Gastos Recurrentes
            try {
                if (window.RecurringExpensesModule && !recurringModule) {
                    recurringModule = new RecurringExpensesModule(db, user.uid);
                    await recurringModule.initialize(user.uid);
                    console.log('✅ Gastos Recurrentes inicializados');
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando gastos recurrentes:', error);
                recurringModule = null;
            }
            
            // Inicializar Reportes
            try {
                if (window.ReportsModule && !reportsModule) {
                    reportsModule = new ReportsModule(db);
                    await reportsModule.initialize(user.uid);
                    console.log('✅ Reportes Interactivos inicializados');
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando reportes:', error);
                reportsModule = null;
            }
            
            // Inicializar Comparación
            try {
                if (window.ComparisonModule && !comparisonModule) {
                    comparisonModule = new ComparisonModule(db, user.uid);
                    await comparisonModule.initialize(user.uid);
                    console.log('✅ Módulo de comparación inicializado');
                }
            } catch (error) {
                console.warn('⚠️ Error inicializando comparación:', error);
                comparisonModule = null;
            }
        }
        
        // Iniciar tutorial si es necesario
        if (!tutorialCompleted && expenses.length === 0 && incomeHistory.length === 0) {
            setTimeout(() => {
                tutorialActive = true;
                tutorialStep = 0;
                render();
            }, 1000);
        }
        
        currentView = 'app';
        activeTab = 'dashboard';
        render();
    } else {
        // Usuario no autenticado
        currentUser = null;
        isInitialized = false;  // Reset flag
        
        // Limpiar módulos
        assistantModule = null;
        recurringModule = null;
        reportsModule = null;
        comparisonModule = null;
        notificationsModule = null;
        
        currentView = 'login';
        render();
    }
});

// NUEVO: Función para abrir asistente desde menú
window.openAssistant = function() {
    if (assistantModule) {
        assistantModule.openChat(); // Asumiendo que tiene este método, si no, agrégalo en assistant-module.js
    } else {
        showToast('Asistente no disponible', 'error');
    }
};

// ========================================
// FUNCIONES DE CARGA DE DATOS (CON RETRIES Y OFFLINE FALLBACK)
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
        
        localStorage.setItem('expenses', JSON.stringify(expenses)); // Guardar local para offline
        localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('budgets', JSON.stringify(budgets));
    } catch (error) {
        console.error('Error cargando datos:', error);
        if (!navigator.onLine) {
            // Fallback offline: Cargar desde localStorage
            expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
            incomeHistory = JSON.parse(localStorage.getItem('incomeHistory') || '[]');
            goals = JSON.parse(localStorage.getItem('goals') || '[]');
            budgets = JSON.parse(localStorage.getItem('budgets') || '{}');
            showToast('Modo offline: Datos cargados localmente', 'warning');
        } else {
            // Retry una vez
            setTimeout(loadUserData, 2000);
        }
    }
}

// Ejemplo para loadExpenses (agrega similar para otros)
async function loadExpenses() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('expenses').get();
    expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem('expenses', JSON.stringify(expenses)); // Guardar local para offline
}

// Similar para loadIncome, loadGoals, loadBudgets...
async function loadIncome() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('incomes').get();
    incomeHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));
}

async function loadGoals() {
    const snapshot = await db.collection('users').doc(currentUser.uid).collection('goals').get();
    goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem('goals', JSON.stringify(goals));
}

async function loadBudgets() {
    const doc = await db.collection('users').doc(currentUser.uid).collection('settings').doc('budgets').get();
    if (doc.exists) {
        budgets = doc.data();
    }
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

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
                            $${Math.abs(remainder).toLocaleString()}
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
                <h4 style="margin-bottom: 1rem; color: var(--color-primary); font-size: 1.1rem;">📊 Distribución por Categorías</h4>
                <div style="margin-bottom: 1rem;">
                    ${sortedCategories.map(([category, data]) => `
                        <div style="margin-bottom: 1.25rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 600; font-size: 0.95rem;">${category}</span>
                                <div style="text-align: right;">
                                    <div style="font-weight: bold; color: ${data.percentage > 50 ? 'var(--color-danger)' : data.percentage > 30 ? '#f59e0b' : 'var(--color-primary)'};">$${data.amount.toLocaleString()}</div>
                                    <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${data.count} ${data.count === 1 ? 'gasto' : 'gastos'}</div>
                                </div>
                            </div>
                            <div style="position: relative; height: 30px; background: rgba(255,255,255,0.1); border-radius: 15px; overflow: hidden;">
                                <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${Math.min(data.percentage, 100)}%; background: ${data.percentage > 50 ? 'var(--color-danger)' : data.percentage > 30 ? '#f59e0b' : 'var(--color-primary)'}; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem; transition: width 0.5s ease;">
                                    ${data.percentage}%
                                </div>
                            </div>
                        </div>
                    `).join('')}
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
            <button type="button" class="btn btn-primary" onclick="confirmBudgetFromExpenses(${JSON.stringify(expensesByCategory).replace(/\"/g, '&quot;')})" style="flex: 2;">
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
// ✨ MEJORADO: ALERTAS CON 3 NIVELES

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
            <div class="chart-container" style="height: 250px; position: relative;">
                <canvas id="expenseChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${Object.keys(expensesByDescription).length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>💸</span> ¿Dónde va mi dinero?
            </div>
            <div class="chart-container" style="height: 300px; position: relative;">
                <canvas id="descriptionChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${Object.keys(incomeDistribution).length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>💰</span> Distribución de Ingresos
            </div>
            <div class="chart-container" style="height: 250px; position: relative;">
                <canvas id="incomeChart"></canvas>
            </div>
        </div>
        ` : ''}

        ${expenses.length > 0 ? `
        <div class="card">
            <div class="card-title">
                <span>📊</span> Tasa de Ahorro e Inversión Mensual
            </div>
            <div class="chart-container" style="height: 250px; position: relative;">
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
                                        <div class="expense-description">
                                            ${icon} ${trans.description}
                                        </div>
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
                            Tienes <strong>${expenses.length} ${expenses.length === 1 ? 'gasto registrado' : 'gastos registrados'}</strong> por un total de <strong>$${totalExpenses.toLocaleString()}</strong>
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
                        CRÍTICO - Presupuesto Excedido (${alertsDanger.length})
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
                        ALERTA ALTA - Muy cerca del límite (${alertsCritical.length})
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
                        ATENCIÓN - Acercándose al límite (${alertsWarning.length})
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
                        <span>Balance Final:</span>
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
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; padding-bottom: 120px;">
            <!-- Gastos Recurrentes -->
            <div class="card" onclick="switchTab('more-recurring')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 1.5rem;">🔄</span>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Gastos Recurrentes</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Configura gastos automáticos mensuales</p>
                </div>
            </div>
            
            <!-- Ingresos Recurrentes -->
            <div class="card" onclick="switchTab('more-recurring-income')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 1.5rem;">💰</span>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Ingresos Recurrentes</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Configura ingresos automáticos (salario, rentas)</p>
                </div>
            </div>
            
            <!-- Reportes -->
            <div class="card" onclick="switchTab('more-reports')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 1.5rem;">📊</span>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Reportes y Gráficos</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Análisis visual de tus finanzas</p>
                </div>
            </div>
            
            <!-- Comparación -->
            <div class="card" onclick="switchTab('more-comparison')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 1.5rem;">📈</span>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Comparación de Periodos</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Semanal, quincenal y mensual</p>
                </div>
            </div>
            
            <!-- Notificaciones -->
            <div class="card" onclick="switchTab('more-notifications')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 1.5rem;">🔔</span>
                <div>
                    <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Notificaciones</h3>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Alertas semanales y recordatorios</p>
                </div>
            </div>
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
            <div class="recurring-expenses">
                <div class="empty-state">
                    <p>Módulo de gastos recurrentes no inicializado</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        🔄 Recargar Página
                    </button>
                </div>
            </div>
        `;
    }

    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    const pausedRecurring = recurringModule.recurringExpenses.filter(r => !r.active);

    return `
        <div class="recurring-expenses-container">
            <div class="recurring-header">
                <h3>🔄 Gastos Recurrentes</h3>
                <p class="recurring-subtitle">Gestiona tus pagos automáticos</p>
            </div>

            <div class="recurring-stats">
                <div class="stat-card">
                    <span class="stat-value">${recurringModule.recurringExpenses.length}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${activeRecurring.length}</span>
                    <span class="stat-label">Activos</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">$${recurringModule.calculateMonthlyTotal().toFixed(2)}</span>
                    <span class="stat-label">Total Mensual</span>
                </div>
            </div>

            <div class="recurring-list">
                <h4>💚 Activos</h4>
                ${activeRecurring.length > 0 ? 
                    activeRecurring.map(r => recurringModule.renderRecurringItem(r)).join('') : 
                    '<p class="empty-message">No hay gastos recurrentes activos</p>'
                }

                ${pausedRecurring.length > 0 ? `
                    <h4 style="margin-top: 2rem;">⏸️ Pausados</h4>
                    ${pausedRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
                ` : ''}
            </div>

            <button class="fab-option add-recurring" onclick="openRecurringModal()" 
                    style="position: fixed; bottom: 100px; right: 20px; background: linear-gradient(135deg, #667EEA, #764BA2);">
                ➕
            </button>
        </div>
    `;
}

/**
 * Renderizar item individual
 */
function renderRecurringItem(recurring) {
    let nextDate = new Date();
    
    try {
        if (recurring.nextDate) {
            nextDate = recurring.nextDate.toDate ? recurring.nextDate.toDate() : new Date(recurring.nextDate);
        }
    } catch (e) {
        console.warn('Error procesando fecha:', e);
    }

    return `
        <div class="recurring-item ${!recurring.active ? 'paused' : ''}">
            <div class="recurring-info">
                <h5>${recurring.name || 'Sin nombre'}</h5>
                <p>$${(recurring.amount || 0).toFixed(2)} - ${recurringModule.frequencies[recurring.frequency]?.label || recurring.frequency}</p>
                <small>Próximo: ${nextDate.toLocaleDateString()}</small>
            </div>
            <div class="recurring-actions">
                <button class="btn-icon" onclick="recurringModule.toggleRecurring('${recurring.id}')" 
                        title="${recurring.active ? 'Pausar' : 'Activar'}">
                    ${recurring.active ? '⏸️' : '▶️'}
                </button>
                <button class="btn-icon" onclick="recurringModule.deleteRecurring('${recurring.id}')"

title="Eliminar">
                    🗑️
                </button>
            </div>
        </div>
    `;
}


// ========================================
// 🔧 FUNCIONES AUXILIARES COMPLETAS
// ========================================

// Función para verificar y generar gastos recurrentes
async function checkAndGenerateRecurringExpenses() {
    try {
        if (typeof recurringModule !== 'undefined' && recurringModule && recurringModule.isInitialized) {
            if (typeof recurringModule.checkAndGenerate === 'function') {
                await recurringModule.checkAndGenerate();
            } else if (typeof recurringModule.processRecurringExpenses === 'function') {
                await recurringModule.processRecurringExpenses();
            }
            console.log('✅ Gastos recurrentes procesados');
        }
    } catch (error) {
        console.warn('⚠️ Error procesando gastos recurrentes:', error);
    }
}

// Función para cambiar de tab
function switchTab(tab) {
    activeTab = tab;
    const tabContent = document.getElementById('tab-content');
    if (tabContent) {
        switch(tab) {
            case 'dashboard':
                tabContent.innerHTML = typeof renderDashboard === 'function' ? renderDashboard() : '<p>Dashboard</p>';
                setTimeout(initCharts, 100);
                break;
            case 'expenses':
                tabContent.innerHTML = typeof renderExpenses === 'function' ? renderExpenses() : '<p>Expenses</p>';
                break;
            case 'budget':
                tabContent.innerHTML = typeof renderBudget === 'function' ? renderBudget() : '<p>Budget</p>';
                break;
            case 'goals':
                tabContent.innerHTML = typeof renderGoals === 'function' ? renderGoals() : '<p>Goals</p>';
                break;
            case 'assistant':
                tabContent.innerHTML = typeof renderAssistantTab === 'function' ? renderAssistantTab() : '<p>Asistente</p>';
                break;
            case 'more':
                tabContent.innerHTML = typeof renderMoreSection === 'function' ? renderMoreSection() : '<p>More</p>';
                break;
            case 'more-recurring':
                tabContent.innerHTML = typeof renderRecurringExpensesViewIntegrated === 'function' 
                    ? renderRecurringExpensesViewIntegrated() 
                    : '<p>Recurring</p>';
                break;
            case 'more-recurring-income':
                tabContent.innerHTML = typeof renderRecurringIncomeViewComplete === 'function' 
                    ? renderRecurringIncomeViewComplete() 
                    : '<p>Ingresos Recurrentes</p>';
                break;
            case 'more-reports':
                tabContent.innerHTML = typeof renderPeriodComparison === 'function' 
                    ? renderPeriodComparison() 
                    : '<p>Reportes</p>';
                break;
            case 'more-comparison':
                tabContent.innerHTML = typeof renderPeriodComparison === 'function' 
                    ? renderPeriodComparison() 
                    : '<p>Comparación</p>';
                break;
            case 'more-notifications':
                tabContent.innerHTML = typeof renderNotificationSettings === 'function' 
                    ? renderNotificationSettings() 
                    : '<p>Notificaciones</p>';
                break;
            default:
                tabContent.innerHTML = typeof renderDashboard === 'function' ? renderDashboard() : '<p>Dashboard</p>';
        }
    }
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
}

// Función wrapper para login
function loginSubmit() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    if (email && password) {
        handleLogin(email, password);
    }
}

// Función wrapper para registro
function registerSubmit() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (password !== confirm) {
        alert('❌ Las contraseñas no coinciden');
        return;
    }
    if (email && password) {
        handleRegister(email, password);
    }
}

// Función para inicializar gráficos
function initCharts() {
    try {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js no está cargado');
            return;
        }
        
        // Destroy existing charts
        if (typeof expenseChart !== 'undefined' && expenseChart) expenseChart.destroy();
        if (typeof categoryChart !== 'undefined' && categoryChart) categoryChart.destroy();
        if (typeof descriptionChart !== 'undefined' && descriptionChart) descriptionChart.destroy();
        if (typeof incomeChart !== 'undefined' && incomeChart) incomeChart.destroy();
        if (typeof savingsRateChart !== 'undefined' && savingsRateChart) savingsRateChart.destroy();
        
        const totals = typeof calculateTotals === 'function' ? calculateTotals() : { expensesByCategory: {} };
        const expensesByDescription = typeof calculateExpensesByDescription === 'function' ? calculateExpensesByDescription() : {};
        const incomeDistribution = typeof calculateIncomeDistribution === 'function' ? calculateIncomeDistribution() : {};
        
        // Expense by Category chart (expenseChart) - Colores vibrantes
        const expenseCtx = document.getElementById('expenseChart');
        if (expenseCtx && totals.expensesByCategory && Object.keys(totals.expensesByCategory).length > 0) {
            expenseChart = new Chart(expenseCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: Object.keys(totals.expensesByCategory),
                    datasets: [{
                        data: Object.values(totals.expensesByCategory),
                        backgroundColor: [
                            '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', 
                            '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
                            '#FF9FF3', '#54A0FF'
                        ],
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderWidth: 2,
                        hoverOffset: 15
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { 
                            position: 'bottom', 
                            labels: { 
                                color: 'white',
                                padding: 15,
                                font: { size: 11 }
                            } 
                        }
                    }
                }
            });
        }
        
        // Description chart (descriptionChart) - "¿Dónde va mi dinero?" - Colores vibrantes
        const descCtx = document.getElementById('descriptionChart');
        if (descCtx && Object.keys(expensesByDescription).length > 0) {
            const gradientColors = [
                'rgba(255, 107, 107, 0.8)',
                'rgba(78, 205, 196, 0.8)',
                'rgba(255, 230, 109, 0.8)',
                'rgba(149, 225, 211, 0.8)',
                'rgba(243, 129, 129, 0.8)',
                'rgba(170, 150, 218, 0.8)',
                'rgba(252, 186, 211, 0.8)',
                'rgba(168, 216, 234, 0.8)',
                'rgba(255, 159, 243, 0.8)',
                'rgba(84, 160, 255, 0.8)'
            ];
            
            descriptionChart = new Chart(descCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: Object.keys(expensesByDescription).slice(0, 10),
                    datasets: [{
                        label: 'Gastos',
                        data: Object.values(expensesByDescription).slice(0, 10),
                        backgroundColor: gradientColors,
                        borderColor: gradientColors.map(c => c.replace('0.8', '1')),
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { 
                            ticks: { color: 'rgba(255,255,255,0.7)' }, 
                            grid: { color: 'rgba(255,255,255,0.1)' } 
                        },
                        y: { 
                            ticks: { color: 'rgba(255,255,255,0.8)', font: { size: 11 } }, 
                            grid: { display: false } 
                        }
                    }
                }
            });
        }
        
        // Income distribution chart (incomeChart) - Colores vibrantes
        const incomeCtx = document.getElementById('incomeChart');
        if (incomeCtx && Object.keys(incomeDistribution).length > 0) {
            incomeChart = new Chart(incomeCtx.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: Object.keys(incomeDistribution),
                    datasets: [{
                        data: Object.values(incomeDistribution),
                        backgroundColor: [
                            '#00D9FF', '#00FF88', '#FFD93D', '#FF6B9D', '#C9B1FF'
                        ],
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderWidth: 2,
                        hoverOffset: 10
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    plugins: {
                        legend: { 
                            position: 'bottom', 
                            labels: { 
                                color: 'white',
                                padding: 15,
                                font: { size: 11 }
                            } 
                        }
                    }
                }
            });
        }
        
        // Savings Rate Chart (Tasa de Ahorro e Inversión Mensual)
        const savingsCtx = document.getElementById('savingsRateChart');
        if (savingsCtx) {
            // Calcular datos de ahorro mensual
            const monthlyData = {};
            const expensesList = typeof expenses !== 'undefined' ? expenses : [];
            const incomeList = typeof incomeHistory !== 'undefined' ? incomeHistory : [];
            
            // Agrupar gastos por mes
            expensesList.forEach(exp => {
                const date = new Date(exp.date);
                const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
                if (!monthlyData[monthKey]) monthlyData[monthKey] = { expenses: 0, income: 0 };
                monthlyData[monthKey].expenses += exp.amount || 0;
            });
            
            // Agrupar ingresos por mes
            incomeList.forEach(inc => {
                const date = new Date(inc.date);
                const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
                if (!monthlyData[monthKey]) monthlyData[monthKey] = { expenses: 0, income: 0 };
                monthlyData[monthKey].income += inc.amount || 0;
            });
            
            const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
            const savingsRates = sortedMonths.map(month => {
                const data = monthlyData[month];
                return data.income > 0 ? Math.max(0, ((data.income - data.expenses) / data.income) * 100) : 0;
            });
            
            const monthLabels = sortedMonths.map(m => {
                const [year, month] = m.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return monthNames[parseInt(month) - 1] + ' ' + year.slice(2);
            });
            
            if (sortedMonths.length > 0) {
                savingsRateChart = new Chart(savingsCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: monthLabels,
                        datasets: [{
                            label: 'Tasa de Ahorro %',
                            data: savingsRates,
                            backgroundColor: savingsRates.map(rate => 
                                rate >= 20 ? 'rgba(34, 197, 94, 0.8)' : 
                                rate >= 10 ? 'rgba(234, 179, 8, 0.8)' : 
                                'rgba(239, 68, 68, 0.8)'
                            ),
                            borderColor: savingsRates.map(rate => 
                                rate >= 20 ? '#22c55e' : 
                                rate >= 10 ? '#eab308' : 
                                '#ef4444'
                            ),
                            borderWidth: 2,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1500,
                            easing: 'easeOutBounce'
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Tasa de Ahorro: ' + context.raw.toFixed(1) + '%';
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: { 
                                    color: 'rgba(255,255,255,0.7)',
                                    callback: function(value) { return value + '%'; }
                                },
                                grid: { color: 'rgba(255,255,255,0.1)' }
                            },
                            x: {
                                ticks: { color: 'rgba(255,255,255,0.7)' },
                                grid: { display: false }
                            }
                        }
                    }
                });
            }
        }
        
        console.log('✅ Gráficos inicializados');
    } catch (error) {
        console.warn('Error inicializando gráficos:', error);
    }
}

// Helpers para gráficos
function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('es', { weekday: 'short' }));
    }
    return days;
}

function getExpensesLast7Days() {
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayExpenses = (typeof expenses !== 'undefined' ? expenses : []).filter(e => {
            const expDate = new Date(e.date);
            return expDate.toDateString() === date.toDateString();
        });
        data.push(dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0));
    }
    return data;
}

// Función para cargar gastos recurrentes
async function loadRecurringExpenses() {
    try {
        if (typeof recurringModule !== 'undefined' && recurringModule && typeof recurringModule.loadRecurringExpenses === 'function') {
            await recurringModule.loadRecurringExpenses();
        }
    } catch (error) {
        console.warn('Error cargando gastos recurrentes:', error);
    }
}

// Función para renderizar vista de comparación
function renderComparisonView() {
    if (typeof comparisonModule !== 'undefined' && comparisonModule && typeof comparisonModule.renderComparisonCard === 'function') {
        return comparisonModule.renderComparisonCard();
    }
    return '<div class="card"><h3>📈 Comparación de Periodos</h3><p style="color: rgba(255,255,255,0.7);">Compara tus gastos entre diferentes periodos</p></div>';
}

// Función para renderizar configuración de notificaciones
// Vista integrada de gastos recurrentes
function renderRecurringExpensesViewIntegrated() {
    // Obtener datos del módulo o de la lista local
    var recurring = [];
    var stats = { active: 0, monthlyEstimate: 0 };
    
    if (typeof recurringModule !== 'undefined' && recurringModule) {
        recurring = recurringModule.recurringExpenses || [];
        stats = typeof recurringModule.getStats === 'function' ? recurringModule.getStats() : stats;
    }
    
    var activeRecurring = recurring.filter(function(r) { return r.active; });
    stats.active = activeRecurring.length;
    stats.monthlyEstimate = activeRecurring.reduce(function(sum, r) {
        var amount = r.amount || 0;
        if (r.frequency === 'weekly') return sum + (amount * 4);
        if (r.frequency === 'biweekly') return sum + (amount * 2);
        if (r.frequency === 'yearly') return sum + (amount / 12);
        return sum + amount; // monthly
    }, 0);
    
    return '<div class="recurring-container" style="padding: 0.5rem;">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">' +
            '<div><h2 style="margin: 0; color: var(--color-primary);">🔄 Gastos Recurrentes</h2><p style="margin: 0.25rem 0 0 0; opacity: 0.7; font-size: 0.9rem;">Gestiona tus pagos automáticos</p></div>' +
            '<button onclick="showRecurringForm()" style="padding: 0.5rem 1rem; border-radius: 20px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; cursor: pointer; font-weight: 500;">+ Añadir</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin:1rem 0;">' +
            '<div style="text-align:center;padding:1rem;background:rgba(255,255,255,0.05);border-radius:0.75rem;border:1px solid rgba(139,92,246,0.2);"><div style="font-size:1.5rem;font-weight:bold;color:#a855f7;">' + recurring.length + '</div><div style="font-size:0.75rem;opacity:0.7;">Total</div></div>' +
            '<div style="text-align:center;padding:1rem;background:rgba(255,255,255,0.05);border-radius:0.75rem;border:1px solid rgba(34,197,94,0.2);"><div style="font-size:1.5rem;font-weight:bold;color:#22c55e;">' + stats.active + '</div><div style="font-size:0.75rem;opacity:0.7;">Activos</div></div>' +
            '<div style="text-align:center;padding:1rem;background:rgba(255,255,255,0.05);border-radius:0.75rem;border:1px solid rgba(239,68,68,0.2);"><div style="font-size:1.5rem;font-weight:bold;color:#ef4444;">$' + stats.monthlyEstimate.toFixed(0) + '</div><div style="font-size:0.75rem;opacity:0.7;">Mensual</div></div>' +
        '</div>' +
        '<div style="margin-top:1rem;"><h3 style="margin-bottom: 0.75rem;">📋 Tus Recurrentes</h3>' +
        (activeRecurring.length > 0 
            ? activeRecurring.map(function(r) { 
                var freqLabels = { weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' };
                return '<div class="card" style="padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid #8b5cf6;">' +
                    '<div>' +
                        '<div style="font-weight: bold; color: white;">' + (r.name || r.description || 'Sin nombre') + '</div>' +
                        '<div style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">' + (r.category || 'Sin categoría') + ' • ' + (freqLabels[r.frequency] || r.frequency) + '</div>' +
                    '</div>' +
                    '<div style="display: flex; align-items: center; gap: 0.75rem;">' +
                        '<span style="font-weight: bold; color: #ef4444;">-$' + (r.amount || 0).toFixed(2) + '</span>' +
                        '<button onclick="toggleRecurring(\'' + r.id + '\')" style="background: rgba(255,255,255,0.1); border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; color: white;" title="' + (r.active ? 'Pausar' : 'Activar') + '">' + (r.active ? '⏸️' : '▶️') + '</button>' +
                        '<button onclick="deleteRecurring(\'' + r.id + '\')" style="background: rgba(239,68,68,0.2); border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; color: #ef4444;" title="Eliminar">🗑️</button>' +
                    '</div>' +
                '</div>'; 
            }).join('') 
            : '<div class="card" style="text-align: center; padding: 2rem;"><div style="font-size: 3rem; margin-bottom: 1rem;">🔄</div><p style="opacity:0.7; margin-bottom: 1rem;">No hay gastos recurrentes activos</p><button onclick="showRecurringForm()" style="padding: 0.75rem 1.5rem; border-radius: 25px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; cursor: pointer;">+ Añadir Recurrente</button></div>') +
        '</div></div>';
}

// ========================================
// 🎨 FUNCIÓN PRINCIPAL DE RENDERIZADO
// ========================================
function render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    let content = '';
    
    if (currentView === 'login') {
        content = typeof renderLogin === 'function' ? renderLogin() : '<h1>Login</h1>';
    } else if (currentView === 'register') {
        content = typeof renderRegister === 'function' ? renderRegister() : '<h1>Register</h1>';
    } else if (currentView === 'app') {
        content = renderMainApp();
    } else {
        content = typeof renderLogin === 'function' ? renderLogin() : '<h1>Login</h1>';
    }
    
    app.innerHTML = content;
    
    if (currentView === 'app' && activeTab === 'dashboard') {
        setTimeout(initCharts, 100);
    }
}

// Función para renderizar la app principal
function renderMainApp() {
    const header = typeof renderHeader === 'function' ? renderHeader() : '';
    let tabContent = '';
    
    switch(activeTab) {
        case 'dashboard': tabContent = typeof renderDashboard === 'function' ? renderDashboard() : '<p>Dashboard</p>'; break;
        case 'expenses': tabContent = typeof renderExpenses === 'function' ? renderExpenses() : '<p>Expenses</p>'; break;
        case 'budget': tabContent = typeof renderBudget === 'function' ? renderBudget() : '<p>Budget</p>'; break;
        case 'goals': tabContent = typeof renderGoals === 'function' ? renderGoals() : '<p>Goals</p>'; break;
        case 'more': tabContent = typeof renderMoreSection === 'function' ? renderMoreSection() : '<p>More</p>'; break;
        case 'more-recurring': tabContent = renderRecurringExpensesViewIntegrated(); break;
        case 'more-reports': tabContent = typeof renderReports === 'function' ? renderReports() : '<p>Reports</p>'; break;
        default: tabContent = typeof renderDashboard === 'function' ? renderDashboard() : '<p>Dashboard</p>';
    }
    
    const tutorial = (typeof tutorialActive !== 'undefined' && tutorialActive && typeof renderTutorialOverlay === 'function') ? renderTutorialOverlay() : '';
    
    return header + 
        '<div class="tab-content" id="tab-content">' + tabContent + '</div>' +
        '<nav class="bottom-nav" style="position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-around;background:linear-gradient(135deg,rgba(26,35,50,0.98),rgba(13,21,32,0.98));padding:0.5rem 0;border-top:1px solid rgba(5,191,219,0.3);z-index:1000;">' +
            '<button class="nav-item' + (activeTab === 'dashboard' ? ' active' : '') + '" onclick="switchTab(\'dashboard\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'dashboard' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">🏠</span><span>Inicio</span></button>' +
            '<button class="nav-item' + (activeTab === 'expenses' ? ' active' : '') + '" onclick="switchTab(\'expenses\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'expenses' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">💰</span><span>Gastos</span></button>' +
            '<button class="nav-item' + (activeTab === 'budget' ? ' active' : '') + '" onclick="switchTab(\'budget\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'budget' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">📊</span><span>Presupuesto</span></button>' +
            '<button class="nav-item' + (activeTab === 'goals' ? ' active' : '') + '" onclick="switchTab(\'goals\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'goals' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">🎯</span><span>Metas</span></button>' +
            '<button class="nav-item' + (activeTab === 'assistant' ? ' active' : '') + '" onclick="switchTab(\'assistant\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'assistant' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">🤖</span><span>Asistente</span></button>' +
            '<button class="nav-item' + (activeTab === 'more' ? ' active' : '') + '" onclick="switchTab(\'more\')" style="display:flex;flex-direction:column;align-items:center;gap:0.15rem;background:none;border:none;color:' + (activeTab === 'more' ? '#05BFDB' : 'rgba(255,255,255,0.6)') + ';cursor:pointer;padding:0.25rem 0.5rem;font-size:0.65rem;"><span style="font-size:1.1rem;">⚙️</span><span>Más</span></button>' +
        '</nav>' +
        '<button class="fab" onclick="toggleFabMenu()" style="position:fixed;bottom:90px;right:20px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#05BFDB,#088395);color:white;font-size:24px;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(5,191,219,0.4);z-index:1001;">+</button>' +
        '<div id="fab-menu" style="display:none;position:fixed;bottom:160px;right:20px;flex-direction:column;gap:0.5rem;z-index:1001;">' +
            '<button onclick="openModal(\'expense\')" style="padding: 0.6rem 1rem; border-radius: 25px; background: linear-gradient(135deg,#ef4444,#dc2626); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(239,68,68,0.4); font-weight: 500; font-size: 0.85rem; white-space: nowrap;">💸 Gasto</button>' +
            '<button onclick="openModal(\'income\')" style="padding: 0.6rem 1rem; border-radius: 25px; background: linear-gradient(135deg,#22c55e,#16a34a); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(34,197,94,0.4); font-weight: 500; font-size: 0.85rem; white-space: nowrap;">💵 Ingreso</button>' +
            '<button onclick="openRecurringModal()" style="padding: 0.6rem 1rem; border-radius: 25px; background: linear-gradient(135deg,#8b5cf6,#7c3aed); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(139,92,246,0.4); font-weight: 500; font-size: 0.85rem; white-space: nowrap;">🔄 Gasto Rec.</button>' +
            '<button onclick="openRecurringIncomeModal()" style="padding: 0.6rem 1rem; border-radius: 25px; background: linear-gradient(135deg,#06b6d4,#0891b2); color: white; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(6,182,212,0.4); font-weight: 500; font-size: 0.85rem; white-space: nowrap;">💰 Ingreso Rec.</button>' +
        '</div>' +
        tutorial;
}

// Toggle FAB menu
function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
    }
}

// Abrir asistente virtual
function openAssistant() {
    toggleFabMenu(); // Cerrar menú FAB
    if (typeof assistantModule !== 'undefined' && assistantModule) {
        if (typeof assistantModule.openChat === 'function') {
            assistantModule.openChat();
        } else if (typeof assistantModule.toggle === 'function') {
            assistantModule.toggle();
        } else {
            // Mostrar el contenedor del asistente
            const assistantContainer = document.getElementById('assistant-container') || document.querySelector('.assistant-container');
            if (assistantContainer) {
                assistantContainer.style.display = 'block';
            } else if (typeof showToast === 'function') {
                showToast('Asistente virtual iniciándose...', 'info');
            }
        }
    } else if (typeof showToast === 'function') {
        showToast('Asistente no disponible en este momento', 'warning');
    }
}

console.log('✅ App.js cargado correctamente - versión limpia final');

// ========================================
// 🔧 FUNCIONES FALTANTES
// ========================================

// Función para verificar y generar gastos recurrentes
async function checkAndGenerateRecurringExpenses() {
    try {
        if (typeof recurringModule !== 'undefined' && recurringModule && typeof recurringModule.checkAndGenerate === 'function') {
            await recurringModule.checkAndGenerate();
        } else if (typeof recurringModule !== 'undefined' && recurringModule && typeof recurringModule.processRecurringExpenses === 'function') {
            await recurringModule.processRecurringExpenses();
        }
        console.log('✅ Gastos recurrentes verificados');
    } catch (error) {
        console.warn('⚠️ Error verificando gastos recurrentes:', error);
    }
}

// monthNames ya está declarado en línea 416

console.log('✅ Funciones faltantes cargadas');

// ========================================
// 🤖 ASISTENTE VIRTUAL - TAB
// ========================================
function renderAssistantTab() {
    return '<div style="padding: 1rem; padding-bottom: 100px;">' +
        '<div class="card" style="text-align: center; padding: 2rem;">' +
            '<div style="font-size: 4rem; margin-bottom: 1rem;">🤖</div>' +
            '<h2 style="color: var(--color-primary); margin-bottom: 1rem;">Asistente Financiero AI</h2>' +
            '<p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">Tu asesor personal para tomar mejores decisiones financieras</p>' +
            '<div id="assistant-chat-container" style="background: rgba(0,0,0,0.3); border-radius: 1rem; padding: 1rem; min-height: 300px; max-height: 400px; overflow-y: auto; margin-bottom: 1rem; text-align: left;">' +
                '<div id="assistant-messages">' +
                    '<div style="background: rgba(5,191,219,0.2); padding: 0.75rem 1rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 85%;">' +
                        '<strong style="color: #05BFDB;">🤖 Asistente:</strong><br>' +
                        '<span style="color: rgba(255,255,255,0.9);">¡Hola! Soy tu asistente financiero personal. Puedo ayudarte con:</span><br><br>' +
                        '<span style="color: rgba(255,255,255,0.8);">• Análisis de tus gastos e ingresos<br>' +
                        '• Consejos para ahorrar más<br>' +
                        '• Proyecciones financieras<br>' +
                        '• Planificación de presupuesto<br>' +
                        '• Tips de inversión básicos</span><br><br>' +
                        '<span style="color: rgba(255,255,255,0.9);">¿En qué puedo ayudarte hoy?</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div style="display: flex; gap: 0.5rem;">' +
                '<input type="text" id="assistant-input" placeholder="Escribe tu pregunta..." style="flex: 1; padding: 0.75rem 1rem; border-radius: 25px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white; font-size: 0.9rem;" onkeypress="if(event.key===\'Enter\')sendAssistantMessage()">' +
                '<button onclick="sendAssistantMessage()" style="padding: 0.75rem 1.25rem; border-radius: 25px; background: linear-gradient(135deg, #05BFDB, #088395); color: white; border: none; cursor: pointer; font-weight: 500;">Enviar</button>' +
            '</div>' +
            '<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; justify-content: center;">' +
                '<button onclick="askAssistant(\'¿Cómo van mis finanzas este mes?\')" style="padding: 0.5rem 1rem; border-radius: 20px; background: rgba(5,191,219,0.2); color: #05BFDB; border: 1px solid rgba(5,191,219,0.3); cursor: pointer; font-size: 0.8rem;">💰 ¿Cómo van mis finanzas?</button>' +
                '<button onclick="askAssistant(\'Dame consejos para ahorrar\')" style="padding: 0.5rem 1rem; border-radius: 20px; background: rgba(34,197,94,0.2); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); cursor: pointer; font-size: 0.8rem;">💡 Consejos de ahorro</button>' +
                '<button onclick="askAssistant(\'Analiza mis gastos\')" style="padding: 0.5rem 1rem; border-radius: 20px; background: rgba(239,68,68,0.2); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); cursor: pointer; font-size: 0.8rem;">📊 Analizar gastos</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

// Enviar mensaje al asistente
function sendAssistantMessage() {
    const input = document.getElementById('assistant-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    input.value = '';
    
    askAssistant(message);
}

// Preguntar al asistente
function askAssistant(question) {
    const messagesContainer = document.getElementById('assistant-messages');
    if (!messagesContainer) return;
    
    // Agregar mensaje del usuario
    messagesContainer.innerHTML += '<div style="background: rgba(139,92,246,0.2); padding: 0.75rem 1rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 85%; margin-left: auto; text-align: right;">' +
        '<strong style="color: #8b5cf6;">Tú:</strong><br>' +
        '<span style="color: rgba(255,255,255,0.9);">' + question + '</span>' +
    '</div>';
    
    // Scroll al final
    const chatContainer = document.getElementById('assistant-chat-container');
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Generar respuesta basada en datos
    setTimeout(function() {
        const response = generateAssistantResponse(question);
        messagesContainer.innerHTML += '<div style="background: rgba(5,191,219,0.2); padding: 0.75rem 1rem; border-radius: 1rem; margin-bottom: 0.5rem; max-width: 85%;">' +
            '<strong style="color: #05BFDB;">🤖 Asistente:</strong><br>' +
            '<span style="color: rgba(255,255,255,0.9);">' + response + '</span>' +
        '</div>';
        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 500);
}

// Generar respuesta del asistente basada en datos reales
function generateAssistantResponse(question) {
    const totals = typeof calculateTotals === 'function' ? calculateTotals() : { totalIncome: 0, totalExpenses: 0, balance: 0 };
    const expensesList = typeof expenses !== 'undefined' ? expenses : [];
    const incomeList = typeof incomeHistory !== 'undefined' ? incomeHistory : [];
    
    const totalIncome = totals.totalIncome || 0;
    const totalExpenses = totals.totalExpenses || 0;
    const balance = totals.balance || (totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;
    
    const q = question.toLowerCase();
    
    if (q.includes('finanzas') || q.includes('resumen') || q.includes('cómo van')) {
        return '📊 <strong>Resumen de tus finanzas:</strong><br><br>' +
            '💵 Ingresos: <span style="color:#22c55e;">$' + totalIncome.toFixed(2) + '</span><br>' +
            '💸 Gastos: <span style="color:#ef4444;">$' + totalExpenses.toFixed(2) + '</span><br>' +
            '💰 Balance: <span style="color:' + (balance >= 0 ? '#22c55e' : '#ef4444') + ';">$' + balance.toFixed(2) + '</span><br>' +
            '📈 Tasa de ahorro: ' + savingsRate + '%<br><br>' +
            (balance >= 0 ? '✅ ¡Vas bien! Estás ahorrando dinero.' : '⚠️ Cuidado, estás gastando más de lo que ganas.');
    }
    
    if (q.includes('ahorro') || q.includes('ahorrar') || q.includes('consejos')) {
        let tips = '💡 <strong>Consejos para ahorrar:</strong><br><br>';
        if (savingsRate < 10) {
            tips += '⚠️ Tu tasa de ahorro es baja (' + savingsRate + '%). Te recomiendo:<br>';
            tips += '• Revisar gastos no esenciales<br>';
            tips += '• Establecer un presupuesto mensual<br>';
            tips += '• Usar la regla 50/30/20<br>';
        } else if (savingsRate < 20) {
            tips += '👍 Tu tasa de ahorro es aceptable (' + savingsRate + '%). Para mejorar:<br>';
            tips += '• Automatiza tus ahorros<br>';
            tips += '• Busca reducir gastos fijos<br>';
        } else {
            tips += '🎉 ¡Excelente! Tu tasa de ahorro es muy buena (' + savingsRate + '%).<br>';
            tips += '• Considera invertir el excedente<br>';
            tips += '• Mantén un fondo de emergencia<br>';
        }
        return tips;
    }
    
    if (q.includes('gastos') || q.includes('analiza') || q.includes('análisis')) {
        const categories = totals.expensesByCategory || {};
        let analysis = '📊 <strong>Análisis de gastos:</strong><br><br>';
        analysis += 'Total de gastos: <span style="color:#ef4444;">$' + totalExpenses.toFixed(2) + '</span><br>';
        analysis += 'Número de transacciones: ' + expensesList.length + '<br><br>';
        
        if (Object.keys(categories).length > 0) {
            analysis += '<strong>Por categoría:</strong><br>';
            for (const [cat, amount] of Object.entries(categories)) {
                const percent = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
                analysis += '• ' + cat + ': $' + amount.toFixed(2) + ' (' + percent + '%)<br>';
            }
        }
        return analysis;
    }
    
    return '🤔 Entiendo tu pregunta. Basándome en tus datos:<br><br>' +
        '• Tienes ' + expensesList.length + ' gastos registrados<br>' +
        '• Tienes ' + incomeList.length + ' ingresos registrados<br>' +
        '• Tu balance actual es de $' + balance.toFixed(2) + '<br><br>' +
        '¿Hay algo específico que te gustaría saber sobre tus finanzas?';
}

// ========================================
// 🔧 FUNCIONES FALTANTES
// ========================================

// Verificar gastos inusuales
function checkUnusualExpense(amount) {
    if (!amount || typeof expenses === 'undefined') return;
    
    const expensesList = expenses || [];
    if (expensesList.length < 3) return; // Necesitamos al menos 3 gastos para comparar
    
    const avgExpense = expensesList.reduce(function(sum, e) { return sum + (e.amount || 0); }, 0) / expensesList.length;
    
    if (avgExpense > 0 && amount > avgExpense * 3) {
        console.log('⚠️ Gasto inusualmente alto detectado:', amount);
        if (typeof showToast === 'function') {
            showToast('¡Este gasto es inusualmente alto!', 'warning');
        }
    }
}

// Mostrar detalles de categoría en presupuesto
function showCategoryDetailsBudget(category) {
    if (!category) return;
    
    var expensesList = typeof expenses !== 'undefined' ? expenses : [];
    var categoryExpenses = expensesList.filter(function(e) { return e.category === category; });
    var total = categoryExpenses.reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    var budget = typeof budgets !== 'undefined' && budgets[category] ? budgets[category] : 0;
    var percentage = budget > 0 ? (total / budget * 100) : 0;
    
    // Agrupar por mes para gráfica
    var monthlyData = {};
    categoryExpenses.forEach(function(e) {
        var date = new Date(e.date);
        var monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
        monthlyData[monthKey] += e.amount || 0;
    });
    
    // Crear modal
    var modal = document.getElementById('category-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'category-detail-modal';
        document.body.appendChild(modal);
    }
    
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem;overflow-y:auto;';
    
    var statusColor = percentage >= 100 ? '#ef4444' : (percentage >= 80 ? '#f97316' : '#22c55e');
    var statusText = percentage >= 100 ? '⚠️ Excedido' : (percentage >= 80 ? '⚡ Cerca del límite' : '✅ Bajo control');
    
    modal.innerHTML = '<div style="background:linear-gradient(135deg,rgba(26,35,50,0.98),rgba(13,21,32,0.98));border-radius:1rem;padding:1.5rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;border:1px solid rgba(5,191,219,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
            '<h2 style="color:var(--color-primary);margin:0;font-size:1.2rem;">📂 ' + category + '</h2>' +
            '<button onclick="closeCategoryModal()" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">&times;</button>' +
        '</div>' +
        
        // Resumen
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;margin-bottom:1.5rem;">' +
            '<div style="padding:1rem;background:rgba(239,68,68,0.1);border-radius:10px;text-align:center;border-left:4px solid #ef4444;">' +
                '<div style="font-size:0.75rem;opacity:0.7;">Total Gastado</div>' +
                '<div style="font-size:1.5rem;font-weight:bold;color:#ef4444;">$' + total.toFixed(0) + '</div>' +
            '</div>' +
            '<div style="padding:1rem;background:rgba(5,191,219,0.1);border-radius:10px;text-align:center;border-left:4px solid #05BFDB;">' +
                '<div style="font-size:0.75rem;opacity:0.7;">Presupuesto</div>' +
                '<div style="font-size:1.5rem;font-weight:bold;color:#05BFDB;">$' + budget.toFixed(0) + '</div>' +
            '</div>' +
        '</div>' +
        
        // Barra de progreso
        '<div style="margin-bottom:1.5rem;">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">' +
                '<span style="color:' + statusColor + ';font-weight:500;">' + statusText + '</span>' +
                '<span style="font-weight:bold;">' + percentage.toFixed(1) + '%</span>' +
            '</div>' +
            '<div style="height:12px;background:rgba(255,255,255,0.1);border-radius:6px;overflow:hidden;">' +
                '<div style="height:100%;width:' + Math.min(percentage, 100) + '%;background:linear-gradient(90deg,' + statusColor + ',' + statusColor + 'aa);border-radius:6px;transition:width 0.5s;"></div>' +
            '</div>' +
        '</div>' +
        
        // Gráfica mensual
        '<div style="margin-bottom:1.5rem;">' +
            '<h3 style="margin:0 0 1rem 0;font-size:1rem;">📈 Gastos por Mes</h3>' +
            '<div style="height:180px;position:relative;"><canvas id="categoryMonthlyChart"></canvas></div>' +
        '</div>' +
        
        // Historial de transacciones
        '<div>' +
            '<h3 style="margin:0 0 1rem 0;font-size:1rem;">📋 Historial de Transacciones (' + categoryExpenses.length + ')</h3>' +
            '<div style="max-height:200px;overflow-y:auto;">' +
                (categoryExpenses.length > 0 
                    ? categoryExpenses.sort(function(a,b) { return new Date(b.date) - new Date(a.date); }).map(function(e) {
                        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem;margin-bottom:0.5rem;background:rgba(255,255,255,0.05);border-radius:8px;border-left:3px solid #ef4444;">' +
                            '<div>' +
                                '<div style="font-weight:500;">' + (e.description || 'Sin descripción') + '</div>' +
                                '<div style="font-size:0.75rem;opacity:0.6;">' + (e.date || 'Sin fecha') + '</div>' +
                            '</div>' +
                            '<div style="font-weight:bold;color:#ef4444;">-$' + (e.amount || 0).toFixed(2) + '</div>' +
                        '</div>';
                    }).join('')
                    : '<p style="text-align:center;opacity:0.6;">No hay gastos en esta categoría</p>'
                ) +
            '</div>' +
        '</div>' +
        
        '<button onclick="closeCategoryModal()" style="width:100%;margin-top:1.5rem;padding:1rem;border-radius:10px;background:linear-gradient(135deg,#05BFDB,#088395);color:white;border:none;cursor:pointer;font-weight:bold;">Cerrar</button>' +
    '</div>';
    
    // Inicializar gráfica después de renderizar
    setTimeout(function() {
        initCategoryMonthlyChart(monthlyData);
    }, 100);
}

function closeCategoryModal() {
    var modal = document.getElementById('category-detail-modal');
    if (modal) modal.style.display = 'none';
}

function initCategoryMonthlyChart(monthlyData) {
    var ctx = document.getElementById('categoryMonthlyChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    var months = Object.keys(monthlyData).sort();
    var values = months.map(function(m) { return monthlyData[m]; });
    var monthLabels = months.map(function(m) {
        var parts = m.split('-');
        var monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        return monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2);
    });
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: monthLabels.length > 0 ? monthLabels : ['Sin datos'],
            datasets: [{
                label: 'Gastos',
                data: values.length > 0 ? values : [0],
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#ef4444',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } }
            }
        }
    });
}

// Abrir modal de gastos recurrentes
function openRecurringModal() {
    toggleFabMenu(); // Cerrar menú FAB
    
    // Verificar si el módulo existe y tiene el método
    if (typeof recurringModule !== 'undefined' && recurringModule) {
        if (typeof recurringModule.openAddModal === 'function') {
            recurringModule.openAddModal();
            return;
        }
        if (typeof recurringModule.showAddForm === 'function') {
            recurringModule.showAddForm();
            return;
        }
    }
    
    // Si no hay módulo, mostrar formulario propio
    showRecurringForm();
}

// Mostrar formulario de gasto recurrente
function showRecurringForm() {
    // Crear modal propio para recurrentes
    let recModal = document.getElementById('recurring-modal');
    if (!recModal) {
        recModal = document.createElement('div');
        recModal.id = 'recurring-modal';
        document.body.appendChild(recModal);
    }
    
    recModal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem;';
    
    recModal.innerHTML = '<div style="background:linear-gradient(135deg,rgba(26,35,50,0.98),rgba(13,21,32,0.98));border-radius:1rem;padding:1.5rem;width:100%;max-width:400px;max-height:90vh;overflow-y:auto;border:1px solid rgba(139,92,246,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
            '<h3 style="color:#8b5cf6;margin:0;font-size:1.2rem;">🔄 Nuevo Gasto Recurrente</h3>' +
            '<button onclick="closeRecurringForm()" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;padding:0;">&times;</button>' +
        '</div>' +
        '<form id="recurring-form" onsubmit="event.preventDefault(); saveRecurringExpense();">' +
        '<div class="input-group" style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">📝 Descripción</label>' +
            '<input type="text" id="recurring-name" placeholder="Ej: Netflix, Gym, Alquiler..." required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white;">' +
        '</div>' +
        '<div class="input-group" style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">💵 Monto</label>' +
            '<input type="number" id="recurring-amount" placeholder="0.00" step="0.01" min="0" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white;">' +
        '</div>' +
        '<div class="input-group" style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">📁 Categoría</label>' +
            '<select id="recurring-category" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white;">' +
                '<option value="Gastos Esenciales">🏠 Gastos Esenciales</option>' +
                '<option value="Gastos Discrecionales">🎭 Gastos Discrecionales</option>' +
                '<option value="Pago Deudas">💳 Pago Deudas</option>' +
                '<option value="Ahorros">💰 Ahorros</option>' +
                '<option value="Inversiones">📈 Inversiones</option>' +
            '</select>' +
        '</div>' +
        '<div class="input-group" style="margin-bottom: 1rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">🔄 Frecuencia</label>' +
            '<select id="recurring-frequency" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white;">' +
                '<option value="monthly">📅 Mensual</option>' +
                '<option value="weekly">📆 Semanal</option>' +
                '<option value="biweekly">📅 Quincenal</option>' +
                '<option value="yearly">📋 Anual</option>' +
            '</select>' +
        '</div>' +
        '<div class="input-group" style="margin-bottom: 1.5rem;">' +
            '<label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">📆 Día del mes (1-31)</label>' +
            '<input type="number" id="recurring-day" value="1" min="1" max="31" required style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(5,191,219,0.3); background: rgba(0,0,0,0.3); color: white; font-size: 16px;">' +
        '</div>' +
        '<div style="display: flex; gap: 0.75rem;">' +
            '<button type="button" onclick="closeRecurringForm()" style="flex: 1; padding: 1rem; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; font-size: 1rem;">Cancelar</button>' +
            '<button type="submit" style="flex: 1; padding: 1rem; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; cursor: pointer; font-weight: bold; font-size: 1rem;">✅ Guardar</button>' +
        '</div>' +
    '</form></div>';
}

// Cerrar modal de recurrentes
function closeRecurringForm() {
    var modal = document.getElementById('recurring-modal');
    if (modal) modal.style.display = 'none';
}

// Guardar gasto recurrente
async function saveRecurringExpense() {
    const name = document.getElementById('recurring-name').value;
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const category = document.getElementById('recurring-category').value;
    const frequency = document.getElementById('recurring-frequency').value;
    const dayOfMonth = parseInt(document.getElementById('recurring-day').value);
    
    if (!name || !amount || amount <= 0) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    try {
        var saved = false;
        var newRecurringId = null;
        
        // Guardar en Firebase directamente
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            var docRef = await db.collection('users').doc(currentUser.uid).collection('recurring').add({
                name: name,
                description: name,
                amount: amount,
                category: category,
                frequency: frequency,
                dayOfMonth: dayOfMonth,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            newRecurringId = docRef.id;
            saved = true;
            console.log('✅ Recurrente guardado en Firebase con ID:', newRecurringId);
        }
        
        // Agregar al módulo de recurrentes manualmente
        if (typeof recurringModule !== 'undefined' && recurringModule) {
            // Agregar directamente a la lista
            if (!recurringModule.recurringExpenses) {
                recurringModule.recurringExpenses = [];
            }
            recurringModule.recurringExpenses.push({
                id: newRecurringId || Date.now().toString(),
                name: name,
                description: name,
                amount: amount,
                category: category,
                frequency: frequency,
                dayOfMonth: dayOfMonth,
                active: true,
                createdAt: new Date().toISOString()
            });
            console.log('✅ Agregado al módulo, total:', recurringModule.recurringExpenses.length);
            
            // Recargar la lista del módulo desde Firebase
            if (typeof recurringModule.loadRecurringExpenses === 'function') {
                await recurringModule.loadRecurringExpenses();
                console.log('✅ Lista recargada, total:', recurringModule.recurringExpenses.length);
            }
        }
        
        closeRecurringForm();
        
        if (saved) {
            if (typeof showToast === 'function') {
                showToast('✅ Gasto recurrente guardado', 'success');
            } else {
                alert('✅ Gasto recurrente guardado correctamente');
            }
            
            // Forzar actualización de la vista - cargar desde Firebase
            setTimeout(async function() {
                // Recargar lista desde Firebase
                await loadRecurringFromFirebase();
                
                // Refrescar la vista
                refreshRecurringView();
                
                // Si estamos viendo recurrentes, actualizar la vista
                if (window.activeExpensesTab === 'recurring') {
                    switchTransactionTab('recurring');
                }
                // También actualizar la pestaña si estamos en more-recurring
                if (typeof activeTab !== 'undefined' && activeTab === 'more-recurring') {
                    switchTab('more-recurring');
                }
                // Re-renderizar la vista de gastos si estamos ahí
                if (typeof activeTab !== 'undefined' && activeTab === 'expenses') {
                    switchTab('expenses');
                }
            }, 500);
        } else {
            alert('⚠️ No se pudo guardar. Verifica tu conexión.');
        }
        
    } catch (error) {
        console.error('Error guardando recurrente:', error);
        alert('Error: ' + error.message);
    }
}

console.log('✅ Funciones adicionales cargadas');

// ========================================
// 🔔 ALERTAS DE PRESUPUESTO
// ========================================
async function checkBudgetAlerts() {
    try {
        if (typeof budgets === 'undefined' || !budgets) return;
        if (typeof expenses === 'undefined' || !expenses) return;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyExpenses = {};
        expenses.forEach(function(exp) {
            const expDate = new Date(exp.date);
            if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
                const cat = exp.category || 'Otros';
                monthlyExpenses[cat] = (monthlyExpenses[cat] || 0) + (exp.amount || 0);
            }
        });
        
        Object.keys(budgets).forEach(function(category) {
            const budget = budgets[category] || 0;
            const spent = monthlyExpenses[category] || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            if (percentage >= 100) {
                console.warn('🚨 Presupuesto excedido en ' + category);
            } else if (percentage >= 80) {
                console.warn('⚠️ Presupuesto al ' + percentage.toFixed(1) + '% en ' + category);
            }
        });
        
        console.log('✅ Alertas de presupuesto verificadas');
    } catch (error) {
        console.warn('Error verificando alertas:', error);
    }
}

console.log('✅ checkBudgetAlerts cargada');

// ========================================
// 💰 INGRESOS RECURRENTES
// ========================================
function renderRecurringIncomeView() {
    const recurringIncomes = typeof recurringIncomeList !== 'undefined' ? recurringIncomeList : [];
    
    return '<div style="padding: 0.5rem; padding-bottom: 100px;">' +
        '<div class="card" style="margin-bottom: 1rem;">' +
            '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">' +
                '<h2 style="font-size: 1.2rem; color: var(--color-primary);">💰 Ingresos Recurrentes</h2>' +
                '<button onclick="openRecurringIncomeModal()" style="padding: 0.5rem 1rem; border-radius: 20px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; cursor: pointer; font-size: 0.85rem;">+ Agregar</button>' +
            '</div>' +
            '<p style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">Configura tus ingresos automáticos como salario, rentas, dividendos, etc.</p>' +
        '</div>' +
        
        '<div id="recurring-income-list">' +
            (recurringIncomes.length > 0 
                ? recurringIncomes.map(function(inc) {
                    return '<div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">' +
                        '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                            '<div>' +
                                '<strong style="color: #22c55e;">' + (inc.name || 'Sin nombre') + '</strong>' +
                                '<p style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">' + (inc.frequency || 'Mensual') + '</p>' +
                            '</div>' +
                            '<div style="text-align: right;">' +
                                '<div style="font-size: 1.1rem; color: #22c55e;">+$' + (inc.amount || 0).toFixed(2) + '</div>' +
                                '<button onclick="deleteRecurringIncome(\'' + inc.id + '\')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem;">🗑️ Eliminar</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                }).join('')
                : '<div class="card" style="text-align: center; padding: 2rem;">' +
                    '<div style="font-size: 3rem; margin-bottom: 1rem;">💰</div>' +
                    '<p style="color: rgba(255,255,255,0.6);">No tienes ingresos recurrentes configurados</p>' +
                    '<button onclick="openRecurringIncomeModal()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; border-radius: 25px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; cursor: pointer;">+ Agregar Ingreso Recurrente</button>' +
                '</div>'
            ) +
        '</div>' +
        
        '<button onclick="switchTab(\'more\')" style="display: block; margin: 1rem auto; padding: 0.5rem 1rem; background: none; border: 1px solid rgba(255,255,255,0.3); color: rgba(255,255,255,0.7); border-radius: 20px; cursor: pointer;">← Volver</button>' +
    '</div>';
}

// Modal para ingreso recurrente
function openRecurringIncomeModal() {
    // Cerrar FAB menu si está abierto
    var fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
    
    // Usar el nuevo formulario
    showRecurringIncomeFormNew();
}

// Guardar ingreso recurrente
async function saveRecurringIncome() {
    const name = document.getElementById('rec-income-name').value;
    const amount = parseFloat(document.getElementById('rec-income-amount').value);
    const frequency = document.getElementById('rec-income-frequency').value;
    const dayOfMonth = parseInt(document.getElementById('rec-income-day').value);
    
    if (!name || !amount || amount <= 0) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    try {
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            await db.collection('users').doc(currentUser.uid).collection('recurringIncome').add({
                name: name,
                amount: amount,
                frequency: frequency,
                dayOfMonth: dayOfMonth,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            closeModal();
            if (typeof showToast === 'function') {
                showToast('✅ Ingreso recurrente guardado', 'success');
            } else {
                alert('✅ Ingreso recurrente guardado');
            }
            switchTab('more-recurring-income');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar: ' + error.message);
    }
}

// Eliminar ingreso recurrente
async function deleteRecurringIncome(id) {
    if (!confirm('¿Eliminar este ingreso recurrente?')) return;
    try {
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            await db.collection('users').doc(currentUser.uid).collection('recurringIncome').doc(id).delete();
            switchTab('more-recurring-income');
        }
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
}

// ========================================
// 📊 GRÁFICOS COMPARATIVOS
// ========================================
function renderComparisonChartsView() {
    const expensesList = typeof expenses !== 'undefined' ? expenses : [];
    const incomeList = typeof incomeHistory !== 'undefined' ? incomeHistory : [];
    
    // Calcular datos por periodo
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Gastos por periodo
    const weekExpenses = expensesList.filter(function(e) { return new Date(e.date) >= weekAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    const biweekExpenses = expensesList.filter(function(e) { return new Date(e.date) >= twoWeeksAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    const monthExpenses = expensesList.filter(function(e) { return new Date(e.date) >= monthAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    
    // Ingresos por periodo
    const weekIncome = incomeList.filter(function(e) { return new Date(e.date) >= weekAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    const biweekIncome = incomeList.filter(function(e) { return new Date(e.date) >= twoWeeksAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    const monthIncome = incomeList.filter(function(e) { return new Date(e.date) >= monthAgo; }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    
    // Inicializar gráfico después de renderizar
    setTimeout(function() {
        initVisualComparisonChart(weekExpenses, weekIncome, biweekExpenses, biweekIncome, monthExpenses, monthIncome);
    }, 100);
    
    return '<div style="padding: 0.5rem; padding-bottom: 100px;">' +
        '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">' +
            '<button onclick="switchTab(\'more\')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>' +
            '<h2 style="margin: 0; color: var(--color-primary);">📊 Comparativas Financieras</h2>' +
        '</div>' +
        
        // Semanal
        '<div class="card" style="margin-bottom: 1rem; padding: 1rem;">' +
            '<h3 style="font-size: 1rem; margin-bottom: 1rem; color: #06b6d4;">📅 Última Semana</h3>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(34,197,94,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Ingresos</div>' +
                    '<div style="font-size: 1.25rem; color: #22c55e; font-weight: bold;">$' + weekIncome.toFixed(2) + '</div>' +
                '</div>' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Gastos</div>' +
                    '<div style="font-size: 1.25rem; color: #ef4444; font-weight: bold;">$' + weekExpenses.toFixed(2) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="text-align: center; margin-top: 0.75rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
                '<span style="color: rgba(255,255,255,0.6);">Balance: </span>' +
                '<span style="color: ' + (weekIncome - weekExpenses >= 0 ? '#22c55e' : '#ef4444') + '; font-weight: bold;">$' + (weekIncome - weekExpenses).toFixed(2) + '</span>' +
            '</div>' +
        '</div>' +
        
        // Quincenal
        '<div class="card" style="margin-bottom: 1rem; padding: 1rem;">' +
            '<h3 style="font-size: 1rem; margin-bottom: 1rem; color: #8b5cf6;">📆 Últimas 2 Semanas</h3>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(34,197,94,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Ingresos</div>' +
                    '<div style="font-size: 1.25rem; color: #22c55e; font-weight: bold;">$' + biweekIncome.toFixed(2) + '</div>' +
                '</div>' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Gastos</div>' +
                    '<div style="font-size: 1.25rem; color: #ef4444; font-weight: bold;">$' + biweekExpenses.toFixed(2) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="text-align: center; margin-top: 0.75rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
                '<span style="color: rgba(255,255,255,0.6);">Balance: </span>' +
                '<span style="color: ' + (biweekIncome - biweekExpenses >= 0 ? '#22c55e' : '#ef4444') + '; font-weight: bold;">$' + (biweekIncome - biweekExpenses).toFixed(2) + '</span>' +
            '</div>' +
        '</div>' +
        
        // Mensual
        '<div class="card" style="margin-bottom: 1rem; padding: 1rem;">' +
            '<h3 style="font-size: 1rem; margin-bottom: 1rem; color: #f97316;">📋 Último Mes</h3>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(34,197,94,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Ingresos</div>' +
                    '<div style="font-size: 1.25rem; color: #22c55e; font-weight: bold;">$' + monthIncome.toFixed(2) + '</div>' +
                '</div>' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(239,68,68,0.1); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">Gastos</div>' +
                    '<div style="font-size: 1.25rem; color: #ef4444; font-weight: bold;">$' + monthExpenses.toFixed(2) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="text-align: center; margin-top: 0.75rem; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 8px;">' +
                '<span style="color: rgba(255,255,255,0.6);">Balance: </span>' +
                '<span style="color: ' + (monthIncome - monthExpenses >= 0 ? '#22c55e' : '#ef4444') + '; font-weight: bold;">$' + (monthIncome - monthExpenses).toFixed(2) + '</span>' +
            '</div>' +
        '</div>' +
        
        // Gráfico de barras visual
        '<div class="card" style="padding: 1rem;">' +
            '<h3 style="font-size: 1rem; margin-bottom: 1rem;">📈 Comparativa Visual</h3>' +
            '<div style="height: 220px; position: relative;">' +
                '<canvas id="visualComparisonChart"></canvas>' +
            '</div>' +
        '</div>' +
        
        '<button onclick="switchTab(\'more\')" style="display: block; margin: 1rem auto; padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 25px; cursor: pointer;">← Volver al Menú</button>' +
    '</div>';
}

// Inicializar gráfico de comparativa visual
function initVisualComparisonChart(weekExp, weekInc, biweekExp, biweekInc, monthExp, monthInc) {
    var ctx = document.getElementById('visualComparisonChart');
    if (!ctx || typeof Chart === 'undefined') {
        console.log('Chart.js o canvas no disponible');
        return;
    }
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Semanal', 'Quincenal', 'Mensual'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [weekInc, biweekInc, monthInc],
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: '#22c55e',
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Gastos',
                    data: [weekExp, biweekExp, monthExp],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: 'white', padding: 10 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255,255,255,0.7)' },
                    grid: { display: false }
                }
            }
        }
    });
    console.log('✅ Gráfico de comparativa visual inicializado');
}

// Cargar ingresos recurrentes
var recurringIncomeList = [];
async function loadRecurringIncomeList() {
    try {
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            const snapshot = await db.collection('users').doc(currentUser.uid).collection('recurringIncome').get();
            recurringIncomeList = snapshot.docs.map(function(doc) {
                return { id: doc.id, ...doc.data() };
            });
        }
    } catch (error) {
        console.warn('Error cargando ingresos recurrentes:', error);
    }
}

console.log('✅ Vistas de ingresos recurrentes y comparativas cargadas');

// ========================================
// 📱 ESTILOS RESPONSIVE
// ========================================
function injectResponsiveStyles() {
    const styleId = 'responsive-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Base responsive */
        * { box-sizing: border-box; }
        
        /* Cards responsive */
        .card {
            padding: 1rem !important;
            margin-bottom: 0.75rem !important;
            border-radius: 12px !important;
        }
        
        /* Tab content spacing */
        .tab-content {
            padding: 0.5rem !important;
            padding-bottom: 100px !important;
        }
        
        /* Charts responsive */
        .chart-container {
            height: 200px !important;
            min-height: 180px !important;
            position: relative !important;
        }
        
        /* Grid responsive */
        .responsive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 0.75rem;
        }
        
        /* Mobile - Pantallas pequeñas */
        @media (max-width: 480px) {
            .card {
                padding: 0.75rem !important;
                margin-bottom: 0.5rem !important;
            }
            
            .card h2, .card h3 {
                font-size: 1rem !important;
            }
            
            .card p {
                font-size: 0.8rem !important;
            }
            
            .chart-container {
                height: 180px !important;
            }
            
            /* Navigation móvil */
            .bottom-nav {
                padding: 0.4rem 0 !important;
            }
            
            .nav-item {
                font-size: 0.6rem !important;
                padding: 0.2rem !important;
            }
            
            .nav-item span:first-child {
                font-size: 1rem !important;
            }
            
            /* FAB móvil */
            .fab {
                width: 48px !important;
                height: 48px !important;
                font-size: 20px !important;
                bottom: 75px !important;
            }
            
            #fab-menu {
                bottom: 130px !important;
                right: 15px !important;
            }
            
            #fab-menu button {
                padding: 0.5rem 0.75rem !important;
                font-size: 0.75rem !important;
            }
        }
        
        /* Tablet */
        @media (min-width: 481px) and (max-width: 768px) {
            .card {
                padding: 1rem !important;
            }
            
            .chart-container {
                height: 220px !important;
            }
        }
        
        /* Desktop */
        @media (min-width: 769px) {
            .tab-content {
                max-width: 800px;
                margin: 0 auto;
                padding: 1rem !important;
            }
            
            .card {
                padding: 1.25rem !important;
            }
            
            .chart-container {
                height: 280px !important;
            }
            
            /* Navigation desktop */
            .bottom-nav {
                max-width: 600px;
                margin: 0 auto;
                border-radius: 20px 20px 0 0;
            }
        }
        
        /* Modal responsive */
        #modal .modal-content,
        .modal-content {
            width: 95% !important;
            max-width: 450px !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            margin: auto !important;
        }
        
        /* Input responsive */
        input, select, textarea {
            font-size: 16px !important; /* Previene zoom en iOS */
        }
        
        /* Botones responsive */
        button {
            min-height: 44px;
            cursor: pointer;
        }
        
        /* Scrollbar estilizado */
        ::-webkit-scrollbar {
            width: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.1);
        }
        
        ::-webkit-scrollbar-thumb {
            background: rgba(5,191,219,0.5);
            border-radius: 3px;
        }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Estilos responsive inyectados');
}

// Inyectar estilos al cargar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectResponsiveStyles);
} else {
    injectResponsiveStyles();
}

console.log('✅ Módulo responsive cargado');

// ========================================
// 🔔 FUNCIÓN CHECKBUDGETALERTS
// ========================================

// Mostrar gráfico comparativo por período
var comparisonChartInstance = null;

function showComparisonChart(period) {
    // Actualizar botones activos
    document.querySelectorAll('[id^="btn-"]').forEach(function(btn) {
        if (btn.id.startsWith('btn-weekly') || btn.id.startsWith('btn-biweekly') || btn.id.startsWith('btn-monthly')) {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
        }
    });
    var activeBtn = document.getElementById('btn-' + period);
    if (activeBtn) {
        activeBtn.style.background = 'linear-gradient(135deg, #05BFDB, #088395)';
        activeBtn.style.border = 'none';
    }
    
    var expensesList = typeof expenses !== 'undefined' ? expenses : [];
    var incomeList = typeof incomeHistory !== 'undefined' ? incomeHistory : [];
    var labels = [], expenseData = [], incomeData = [], periodLabel = '';
    var now = new Date();
    
    if (period === 'weekly') {
        periodLabel = 'Últimas 4 semanas';
        for (var i = 3; i >= 0; i--) {
            var weekStart = new Date(now); weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
            var weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
            labels.push('Sem ' + (4 - i));
            expenseData.push(expensesList.filter(function(e) { var d = new Date(e.date); return d >= weekStart && d <= weekEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
            incomeData.push(incomeList.filter(function(e) { var d = new Date(e.date); return d >= weekStart && d <= weekEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
        }
    } else if (period === 'biweekly') {
        periodLabel = 'Últimas 4 quincenas';
        for (var i = 3; i >= 0; i--) {
            var start = new Date(now); start.setDate(now.getDate() - (i * 15));
            var end = new Date(start); end.setDate(start.getDate() + 14);
            labels.push('Q' + (4 - i));
            expenseData.push(expensesList.filter(function(e) { var d = new Date(e.date); return d >= start && d <= end; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
            incomeData.push(incomeList.filter(function(e) { var d = new Date(e.date); return d >= start && d <= end; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
        }
    } else {
        periodLabel = 'Últimos 6 meses';
        var mNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for (var i = 5; i >= 0; i--) {
            var month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            var monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            labels.push(mNames[month.getMonth()]);
            expenseData.push(expensesList.filter(function(e) { var d = new Date(e.date); return d >= month && d <= monthEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
            incomeData.push(incomeList.filter(function(e) { var d = new Date(e.date); return d >= month && d <= monthEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0));
        }
    }
    
    var ctx = document.getElementById('comparisonChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (comparisonChartInstance) comparisonChartInstance.destroy();
    
    comparisonChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Ingresos', data: incomeData, backgroundColor: 'rgba(34, 197, 94, 0.7)', borderColor: '#22c55e', borderWidth: 2, borderRadius: 6 },
                { label: 'Gastos', data: expenseData, backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 6 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            plugins: { legend: { position: 'top', labels: { color: 'white', padding: 15 } }, title: { display: true, text: periodLabel, color: 'white' } },
            scales: { y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } } }
        }
    });
    
    // Actualizar resumen
    var totalExp = expenseData.reduce(function(a,b){return a+b;}, 0);
    var totalInc = incomeData.reduce(function(a,b){return a+b;}, 0);
    var balance = totalInc - totalExp;
    var summary = document.getElementById('comparison-summary');
    if (summary) {
        summary.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem;">' +
            '<div class="card" style="padding: 0.75rem; text-align: center;"><div style="font-size: 0.75rem; opacity: 0.7;">Ingresos</div><div style="font-size: 1.1rem; font-weight: bold; color: #22c55e;">$' + totalInc.toFixed(0) + '</div></div>' +
            '<div class="card" style="padding: 0.75rem; text-align: center;"><div style="font-size: 0.75rem; opacity: 0.7;">Gastos</div><div style="font-size: 1.1rem; font-weight: bold; color: #ef4444;">$' + totalExp.toFixed(0) + '</div></div>' +
            '<div class="card" style="padding: 0.75rem; text-align: center;"><div style="font-size: 0.75rem; opacity: 0.7;">Balance</div><div style="font-size: 1.1rem; font-weight: bold; color: ' + (balance >= 0 ? '#22c55e' : '#ef4444') + ';">$' + balance.toFixed(0) + '</div></div>' +
        '</div>';
    }
}

console.log('✅ App.js FINAL completo - Versión limpia sin duplicados');

// ========================================
// 📑 FUNCIÓN PARA CAMBIAR PESTAÑAS DE TRANSACCIONES
// ========================================
function switchTransactionTab(tab) {
    // Guardar pestaña activa
    window.activeExpensesTab = tab;
    
    // Ocultar todos los contenidos
    var expensesContent = document.getElementById('expenses-content');
    var incomesContent = document.getElementById('incomes-content');
    var recurringContent = document.getElementById('recurring-content');
    
    if (expensesContent) expensesContent.style.display = 'none';
    if (incomesContent) incomesContent.style.display = 'none';
    if (recurringContent) recurringContent.style.display = 'none';
    
    // Mostrar el contenido seleccionado
    var activeContent = document.getElementById(tab + '-content');
    if (activeContent) activeContent.style.display = 'block';
    
    // Actualizar estilos de botones
    var tabExpenses = document.getElementById('tab-expenses');
    var tabIncomes = document.getElementById('tab-incomes');
    var tabRecurring = document.getElementById('tab-recurring');
    
    // Resetear todos los botones
    [tabExpenses, tabIncomes, tabRecurring].forEach(function(btn) {
        if (btn) {
            btn.style.background = 'rgba(255,255,255,0.1)';
            btn.style.border = '2px solid rgba(255,255,255,0.2)';
            btn.style.fontWeight = 'normal';
            btn.style.color = 'rgba(255,255,255,0.7)';
        }
    });
    
    // Activar el botón seleccionado
    if (tab === 'expenses' && tabExpenses) {
        tabExpenses.style.background = 'rgba(5, 191, 219, 0.2)';
        tabExpenses.style.border = '2px solid #05BFDB';
        tabExpenses.style.fontWeight = 'bold';
        tabExpenses.style.color = 'white';
    } else if (tab === 'incomes' && tabIncomes) {
        tabIncomes.style.background = 'rgba(34, 197, 94, 0.2)';
        tabIncomes.style.border = '2px solid #22c55e';
        tabIncomes.style.fontWeight = 'bold';
        tabIncomes.style.color = 'white';
    } else if (tab === 'recurring' && tabRecurring) {
        tabRecurring.style.background = 'rgba(168, 85, 247, 0.2)';
        tabRecurring.style.border = '2px solid #a855f7';
        tabRecurring.style.fontWeight = 'bold';
        tabRecurring.style.color = 'white';
    }
}

// Inicializar pestaña por defecto
if (typeof window.activeExpensesTab === 'undefined') {
    window.activeExpensesTab = 'expenses';
}

console.log('✅ switchTransactionTab cargada');

// ========================================
// 🔄 FUNCIONES DE GESTIÓN DE RECURRENTES
// ========================================

// Cargar recurrentes desde Firebase directamente
async function loadRecurringFromFirebase() {
    try {
        if (typeof db === 'undefined' || typeof currentUser === 'undefined' || !currentUser) {
            console.log('⚠️ No hay usuario o DB para cargar recurrentes');
            return [];
        }
        
        var snapshot = await db.collection('users').doc(currentUser.uid).collection('recurring').get();
        var list = [];
        
        snapshot.forEach(function(doc) {
            list.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log('✅ Recurrentes cargados desde Firebase:', list.length);
        
        // Sincronizar con recurringModule si existe
        if (typeof recurringModule !== 'undefined' && recurringModule) {
            recurringModule.recurringExpenses = list;
        }
        
        return list;
    } catch (error) {
        console.error('Error cargando recurrentes:', error);
        return [];
    }
}

// Alternar estado activo/pausado
async function toggleRecurring(id) {
    try {
        if (typeof db === 'undefined' || typeof currentUser === 'undefined' || !currentUser) {
            alert('Error: No hay sesión activa');
            return;
        }
        
        var docRef = db.collection('users').doc(currentUser.uid).collection('recurring').doc(id);
        var doc = await docRef.get();
        
        if (doc.exists) {
            var currentActive = doc.data().active;
            await docRef.update({ active: !currentActive });
            console.log('✅ Recurrente actualizado:', id, 'activo:', !currentActive);
            
            // Recargar y actualizar vista
            await loadRecurringFromFirebase();
            refreshRecurringView();
            
            if (typeof showToast === 'function') {
                showToast(currentActive ? '⏸️ Recurrente pausado' : '▶️ Recurrente activado', 'success');
            }
        }
    } catch (error) {
        console.error('Error al alternar recurrente:', error);
        alert('Error: ' + error.message);
    }
}

// Eliminar recurrente
async function deleteRecurring(id) {
    if (!confirm('¿Eliminar este gasto recurrente?')) return;
    
    try {
        if (typeof db === 'undefined' || typeof currentUser === 'undefined' || !currentUser) {
            alert('Error: No hay sesión activa');
            return;
        }
        
        await db.collection('users').doc(currentUser.uid).collection('recurring').doc(id).delete();
        console.log('✅ Recurrente eliminado:', id);
        
        // Recargar y actualizar vista
        await loadRecurringFromFirebase();
        refreshRecurringView();
        
        if (typeof showToast === 'function') {
            showToast('🗑️ Recurrente eliminado', 'success');
        } else {
            alert('✅ Recurrente eliminado');
        }
    } catch (error) {
        console.error('Error al eliminar recurrente:', error);
        alert('Error: ' + error.message);
    }
}

// Refrescar la vista de recurrentes
function refreshRecurringView() {
    // Actualizar contenido de recurrentes en la pestaña de transacciones
    var recurringContent = document.getElementById('recurring-content');
    if (recurringContent) {
        recurringContent.innerHTML = renderRecurringExpensesViewIntegrated();
    }
    
    // Si estamos en more-recurring, actualizar esa vista también
    if (typeof activeTab !== 'undefined' && activeTab === 'more-recurring') {
        var tabContent = document.getElementById('tab-content');
        if (tabContent) {
            tabContent.innerHTML = renderRecurringExpensesViewIntegrated();
        }
    }
    
    // Actualizar el contador en el botón de pestañas
    var tabRecurring = document.getElementById('tab-recurring');
    if (tabRecurring && typeof recurringModule !== 'undefined' && recurringModule) {
        var activeCount = (recurringModule.recurringExpenses || []).filter(function(r) { return r.active; }).length;
        tabRecurring.innerHTML = '🔄 Recurrentes (' + activeCount + ')';
    }
}

// Cargar recurrentes al iniciar la app
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté listo
    setTimeout(function() {
        if (typeof currentUser !== 'undefined' && currentUser) {
            loadRecurringFromFirebase().then(function() {
                console.log('✅ Recurrentes inicializados');
            });
        }
    }, 2000);
});

// También cargar cuando el usuario inicie sesión
if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            setTimeout(function() {
                loadRecurringFromFirebase().then(function() {
                    refreshRecurringView();
                });
            }, 1000);
        }
    });
}

console.log('✅ Funciones de gestión de recurrentes cargadas');

// ========================================
// 🔔 NOTIFICACIONES Y ALERTAS SEMANALES
// ========================================
function renderNotificationSettings() {
    // Obtener configuración guardada
    var notifSettings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    var weeklyReport = notifSettings.weeklyReport !== false;
    var budgetAlerts = notifSettings.budgetAlerts !== false;
    var goalReminders = notifSettings.goalReminders !== false;
    var unusualSpending = notifSettings.unusualSpending !== false;
    
    // Calcular resumen semanal
    var weeklyAnalysis = calculateWeeklyAnalysis();
    
    return '<div style="padding: 0.5rem; padding-bottom: 120px;">' +
        '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">' +
            '<button onclick="switchTab(\'more\')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>' +
            '<h2 style="margin: 0; color: var(--color-primary);">🔔 Notificaciones</h2>' +
        '</div>' +
        
        // Resumen semanal actual
        '<div class="card" style="padding: 1rem; margin-bottom: 1rem; background: linear-gradient(135deg, rgba(5,191,219,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(5,191,219,0.3);">' +
            '<h3 style="margin: 0 0 1rem 0; color: #05BFDB;">📊 Tu Resumen Semanal</h3>' +
            '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; opacity: 0.7;">Gastos esta semana</div>' +
                    '<div style="font-size: 1.3rem; font-weight: bold; color: #ef4444;">$' + weeklyAnalysis.currentWeek.toFixed(0) + '</div>' +
                '</div>' +
                '<div style="text-align: center; padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 8px;">' +
                    '<div style="font-size: 0.75rem; opacity: 0.7;">Semana pasada</div>' +
                    '<div style="font-size: 1.3rem; font-weight: bold; color: #f97316;">$' + weeklyAnalysis.lastWeek.toFixed(0) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.2); border-radius: 8px; text-align: center;">' +
                '<div style="font-size: 0.85rem; color: ' + (weeklyAnalysis.difference <= 0 ? '#22c55e' : '#ef4444') + ';">' +
                    (weeklyAnalysis.difference <= 0 
                        ? '✅ ¡Vas ' + Math.abs(weeklyAnalysis.percentChange).toFixed(0) + '% mejor que la semana pasada!' 
                        : '⚠️ Has gastado ' + weeklyAnalysis.percentChange.toFixed(0) + '% más que la semana pasada') +
                '</div>' +
            '</div>' +
        '</div>' +
        
        // Configuración de alertas
        '<div class="card" style="padding: 1rem; margin-bottom: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">⚙️ Configurar Alertas</h3>' +
            
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">' +
                '<div><div style="font-weight: 500;">📊 Reporte Semanal</div><div style="font-size: 0.8rem; opacity: 0.6;">Resumen de gastos cada lunes</div></div>' +
                '<label style="position: relative; width: 50px; height: 26px;">' +
                    '<input type="checkbox" id="notif-weekly" ' + (weeklyReport ? 'checked' : '') + ' onchange="saveNotificationSetting(\'weeklyReport\', this.checked)" style="opacity: 0; width: 0; height: 0;">' +
                    '<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ' + (weeklyReport ? '#22c55e' : 'rgba(255,255,255,0.2)') + '; border-radius: 26px; transition: 0.3s;"></span>' +
                    '<span style="position: absolute; height: 20px; width: 20px; left: ' + (weeklyReport ? '26px' : '4px') + '; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>' +
                '</label>' +
            '</div>' +
            
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">' +
                '<div><div style="font-weight: 500;">💰 Alertas de Presupuesto</div><div style="font-size: 0.8rem; opacity: 0.6;">Aviso al 80% y 100% del límite</div></div>' +
                '<label style="position: relative; width: 50px; height: 26px;">' +
                    '<input type="checkbox" id="notif-budget" ' + (budgetAlerts ? 'checked' : '') + ' onchange="saveNotificationSetting(\'budgetAlerts\', this.checked)" style="opacity: 0; width: 0; height: 0;">' +
                    '<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ' + (budgetAlerts ? '#22c55e' : 'rgba(255,255,255,0.2)') + '; border-radius: 26px; transition: 0.3s;"></span>' +
                    '<span style="position: absolute; height: 20px; width: 20px; left: ' + (budgetAlerts ? '26px' : '4px') + '; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>' +
                '</label>' +
            '</div>' +
            
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">' +
                '<div><div style="font-weight: 500;">🎯 Recordatorios de Metas</div><div style="font-size: 0.8rem; opacity: 0.6;">Seguimiento de progreso semanal</div></div>' +
                '<label style="position: relative; width: 50px; height: 26px;">' +
                    '<input type="checkbox" id="notif-goals" ' + (goalReminders ? 'checked' : '') + ' onchange="saveNotificationSetting(\'goalReminders\', this.checked)" style="opacity: 0; width: 0; height: 0;">' +
                    '<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ' + (goalReminders ? '#22c55e' : 'rgba(255,255,255,0.2)') + '; border-radius: 26px; transition: 0.3s;"></span>' +
                    '<span style="position: absolute; height: 20px; width: 20px; left: ' + (goalReminders ? '26px' : '4px') + '; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>' +
                '</label>' +
            '</div>' +
            
            '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0;">' +
                '<div><div style="font-weight: 500;">⚠️ Gastos Inusuales</div><div style="font-size: 0.8rem; opacity: 0.6;">Alerta si un gasto es 3x mayor al promedio</div></div>' +
                '<label style="position: relative; width: 50px; height: 26px;">' +
                    '<input type="checkbox" id="notif-unusual" ' + (unusualSpending ? 'checked' : '') + ' onchange="saveNotificationSetting(\'unusualSpending\', this.checked)" style="opacity: 0; width: 0; height: 0;">' +
                    '<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: ' + (unusualSpending ? '#22c55e' : 'rgba(255,255,255,0.2)') + '; border-radius: 26px; transition: 0.3s;"></span>' +
                    '<span style="position: absolute; height: 20px; width: 20px; left: ' + (unusualSpending ? '26px' : '4px') + '; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s;"></span>' +
                '</label>' +
            '</div>' +
        '</div>' +
        
        // Historial de alertas
        '<div class="card" style="padding: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">📋 Alertas Recientes</h3>' +
            renderRecentAlerts() +
        '</div>' +
    '</div>';
}

function calculateWeeklyAnalysis() {
    var expensesList = typeof expenses !== 'undefined' ? expenses : [];
    var now = new Date();
    var startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    var startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    var currentWeek = expensesList.filter(function(e) {
        var d = new Date(e.date);
        return d >= startOfWeek;
    }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    
    var lastWeek = expensesList.filter(function(e) {
        var d = new Date(e.date);
        return d >= startOfLastWeek && d < startOfWeek;
    }).reduce(function(sum, e) { return sum + (e.amount || 0); }, 0);
    
    var difference = currentWeek - lastWeek;
    var percentChange = lastWeek > 0 ? ((difference / lastWeek) * 100) : 0;
    
    return { currentWeek: currentWeek, lastWeek: lastWeek, difference: difference, percentChange: percentChange };
}

function renderRecentAlerts() {
    var alerts = JSON.parse(localStorage.getItem('recentAlerts') || '[]');
    
    if (alerts.length === 0) {
        // Generar alertas basadas en datos actuales
        var analysis = calculateWeeklyAnalysis();
        var generatedAlerts = [];
        
        if (analysis.percentChange > 20) {
            generatedAlerts.push({ type: 'warning', message: 'Gastos aumentaron ' + analysis.percentChange.toFixed(0) + '% esta semana', time: 'Hoy' });
        }
        if (analysis.currentWeek > 0) {
            generatedAlerts.push({ type: 'info', message: 'Total gastado esta semana: $' + analysis.currentWeek.toFixed(0), time: 'Hoy' });
        }
        
        if (generatedAlerts.length === 0) {
            return '<p style="opacity: 0.6; text-align: center;">No hay alertas recientes</p>';
        }
        alerts = generatedAlerts;
    }
    
    return alerts.slice(0, 5).map(function(alert) {
        var icon = alert.type === 'warning' ? '⚠️' : (alert.type === 'success' ? '✅' : 'ℹ️');
        var color = alert.type === 'warning' ? '#f97316' : (alert.type === 'success' ? '#22c55e' : '#05BFDB');
        return '<div style="display: flex; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">' +
            '<span style="font-size: 1.2rem;">' + icon + '</span>' +
            '<div style="flex: 1;"><div style="color: ' + color + ';">' + alert.message + '</div><div style="font-size: 0.75rem; opacity: 0.5;">' + alert.time + '</div></div>' +
        '</div>';
    }).join('');
}

function saveNotificationSetting(key, value) {
    var settings = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
    settings[key] = value;
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    // Recargar vista para actualizar toggles
    switchTab('more-notifications');
}

// ========================================
// 📈 COMPARACIÓN DE PERIODOS PROFESIONAL
// ========================================
function renderPeriodComparison() {
    setTimeout(function() { initComparisonCharts(); }, 100);
    
    var analysis = calculatePeriodAnalysis();
    
    return '<div style="padding: 0.5rem; padding-bottom: 120px;">' +
        '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">' +
            '<button onclick="switchTab(\'more\')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>' +
            '<h2 style="margin: 0; color: var(--color-primary);">📈 Comparación de Periodos</h2>' +
        '</div>' +
        
        // Selector de tipo de comparación
        '<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">' +
            '<button onclick="setComparisonType(\'weekly\')" id="cmp-weekly" class="cmp-btn" style="flex: 1; padding: 0.6rem; border-radius: 8px; background: linear-gradient(135deg, #05BFDB, #088395); color: white; border: none; cursor: pointer; font-weight: 500;">Semanal</button>' +
            '<button onclick="setComparisonType(\'biweekly\')" id="cmp-biweekly" class="cmp-btn" style="flex: 1; padding: 0.6rem; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">Quincenal</button>' +
            '<button onclick="setComparisonType(\'monthly\')" id="cmp-monthly" class="cmp-btn" style="flex: 1; padding: 0.6rem; border-radius: 8px; background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">Mensual</button>' +
        '</div>' +
        
        // Resumen de comparación
        '<div class="card" style="padding: 1rem; margin-bottom: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">📊 Resumen Comparativo</h3>' +
            '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">' +
                '<div style="padding: 1rem; background: rgba(239,68,68,0.1); border-radius: 8px; border-left: 4px solid #ef4444;">' +
                    '<div style="font-size: 0.75rem; opacity: 0.7;">Periodo Actual</div>' +
                    '<div style="font-size: 1.4rem; font-weight: bold; color: #ef4444;">$' + analysis.current.expenses.toFixed(0) + '</div>' +
                    '<div style="font-size: 0.8rem; color: #22c55e;">Ing: $' + analysis.current.income.toFixed(0) + '</div>' +
                '</div>' +
                '<div style="padding: 1rem; background: rgba(139,92,246,0.1); border-radius: 8px; border-left: 4px solid #8b5cf6;">' +
                    '<div style="font-size: 0.75rem; opacity: 0.7;">Periodo Anterior</div>' +
                    '<div style="font-size: 1.4rem; font-weight: bold; color: #8b5cf6;">$' + analysis.previous.expenses.toFixed(0) + '</div>' +
                    '<div style="font-size: 0.8rem; color: #22c55e;">Ing: $' + analysis.previous.income.toFixed(0) + '</div>' +
                '</div>' +
            '</div>' +
            '<div style="margin-top: 1rem; padding: 1rem; background: ' + (analysis.trend <= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') + '; border-radius: 8px; text-align: center;">' +
                '<div style="font-size: 1.5rem;">' + (analysis.trend <= 0 ? '📉' : '📈') + '</div>' +
                '<div style="font-weight: bold; color: ' + (analysis.trend <= 0 ? '#22c55e' : '#ef4444') + ';">' +
                    (analysis.trend <= 0 ? 'Redujiste gastos un ' + Math.abs(analysis.trend).toFixed(0) + '%' : 'Aumentaste gastos un ' + analysis.trend.toFixed(0) + '%') +
                '</div>' +
            '</div>' +
        '</div>' +
        
        // Gráfico de comparación
        '<div class="card" style="padding: 1rem; margin-bottom: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">📈 Gráfico Comparativo</h3>' +
            '<div style="height: 250px; position: relative;"><canvas id="periodComparisonChart"></canvas></div>' +
        '</div>' +
        
        // Análisis por categoría
        '<div class="card" style="padding: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">📂 Por Categoría</h3>' +
            renderCategoryComparison(analysis) +
        '</div>' +
    '</div>';
}

function calculatePeriodAnalysis() {
    var expensesList = typeof expenses !== 'undefined' ? expenses : [];
    var incomeList = typeof incomeHistory !== 'undefined' ? incomeHistory : [];
    var now = new Date();
    var type = window.comparisonType || 'weekly';
    
    var currentStart, previousStart, previousEnd;
    
    if (type === 'weekly') {
        currentStart = new Date(now); currentStart.setDate(now.getDate() - 7);
        previousStart = new Date(now); previousStart.setDate(now.getDate() - 14);
        previousEnd = currentStart;
    } else if (type === 'biweekly') {
        currentStart = new Date(now); currentStart.setDate(now.getDate() - 15);
        previousStart = new Date(now); previousStart.setDate(now.getDate() - 30);
        previousEnd = currentStart;
    } else {
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = currentStart;
    }
    
    var currentExpenses = expensesList.filter(function(e) { return new Date(e.date) >= currentStart; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    var previousExpenses = expensesList.filter(function(e) { var d = new Date(e.date); return d >= previousStart && d < previousEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    var currentIncome = incomeList.filter(function(e) { return new Date(e.date) >= currentStart; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    var previousIncome = incomeList.filter(function(e) { var d = new Date(e.date); return d >= previousStart && d < previousEnd; }).reduce(function(s, e) { return s + (e.amount || 0); }, 0);
    
    var trend = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses * 100) : 0;
    
    // Por categoría
    var categories = {};
    expensesList.forEach(function(e) {
        var cat = e.category || 'Otros';
        if (!categories[cat]) categories[cat] = { current: 0, previous: 0 };
        var d = new Date(e.date);
        if (d >= currentStart) categories[cat].current += e.amount || 0;
        else if (d >= previousStart && d < previousEnd) categories[cat].previous += e.amount || 0;
    });
    
    return {
        current: { expenses: currentExpenses, income: currentIncome },
        previous: { expenses: previousExpenses, income: previousIncome },
        trend: trend,
        categories: categories
    };
}

function renderCategoryComparison(analysis) {
    var cats = Object.keys(analysis.categories);
    if (cats.length === 0) return '<p style="opacity: 0.6; text-align: center;">No hay datos suficientes</p>';
    
    return cats.map(function(cat) {
        var data = analysis.categories[cat];
        var diff = data.current - data.previous;
        var icon = diff <= 0 ? '📉' : '📈';
        var color = diff <= 0 ? '#22c55e' : '#ef4444';
        return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">' +
            '<div style="font-size: 0.9rem;">' + cat + '</div>' +
            '<div style="display: flex; align-items: center; gap: 1rem;">' +
                '<span style="color: #8b5cf6;">$' + data.previous.toFixed(0) + '</span>' +
                '<span>→</span>' +
                '<span style="color: #ef4444;">$' + data.current.toFixed(0) + '</span>' +
                '<span style="color: ' + color + ';">' + icon + '</span>' +
            '</div>' +
        '</div>';
    }).join('');
}

function setComparisonType(type) {
    window.comparisonType = type;
    document.querySelectorAll('.cmp-btn').forEach(function(btn) {
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.border = '1px solid rgba(255,255,255,0.2)';
    });
    var btn = document.getElementById('cmp-' + type);
    if (btn) {
        btn.style.background = 'linear-gradient(135deg, #05BFDB, #088395)';
        btn.style.border = 'none';
    }
    switchTab('more-comparison');
}

function initComparisonCharts() {
    var ctx = document.getElementById('periodComparisonChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    var analysis = calculatePeriodAnalysis();
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Periodo Anterior', 'Periodo Actual'],
            datasets: [
                { label: 'Gastos', data: [analysis.previous.expenses, analysis.current.expenses], backgroundColor: ['rgba(139,92,246,0.7)', 'rgba(239,68,68,0.7)'], borderColor: ['#8b5cf6', '#ef4444'], borderWidth: 2, borderRadius: 8 },
                { label: 'Ingresos', data: [analysis.previous.income, analysis.current.income], backgroundColor: ['rgba(34,197,94,0.5)', 'rgba(34,197,94,0.7)'], borderColor: ['#22c55e', '#22c55e'], borderWidth: 2, borderRadius: 8 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { color: 'white' } } },
            scales: { y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' } } }
        }
    });
}

// ========================================
// 💰 INGRESOS RECURRENTES COMPLETO
// ========================================
function renderRecurringIncomeViewComplete() {
    // Cargar ingresos recurrentes
    var recurringIncome = JSON.parse(localStorage.getItem('recurringIncome') || '[]');
    
    // Calcular totales
    var totalMonthly = recurringIncome.filter(function(i) { return i.active !== false; }).reduce(function(sum, i) {
        var amount = i.amount || 0;
        if (i.frequency === 'weekly') return sum + (amount * 4);
        if (i.frequency === 'biweekly') return sum + (amount * 2);
        if (i.frequency === 'yearly') return sum + (amount / 12);
        return sum + amount;
    }, 0);
    
    return '<div style="padding: 0.5rem; padding-bottom: 120px;">' +
        '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">' +
            '<button onclick="switchTab(\'more\')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>' +
            '<h2 style="margin: 0; color: #22c55e;">💰 Ingresos Recurrentes</h2>' +
        '</div>' +
        
        // Estadísticas
        '<div class="card" style="padding: 1rem; margin-bottom: 1rem; background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.1)); border: 1px solid rgba(34,197,94,0.3);">' +
            '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; text-align: center;">' +
                '<div><div style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">' + recurringIncome.length + '</div><div style="font-size: 0.75rem; opacity: 0.7;">Total</div></div>' +
                '<div><div style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">' + recurringIncome.filter(function(i) { return i.active !== false; }).length + '</div><div style="font-size: 0.75rem; opacity: 0.7;">Activos</div></div>' +
                '<div><div style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">$' + totalMonthly.toFixed(0) + '</div><div style="font-size: 0.75rem; opacity: 0.7;">Mensual Est.</div></div>' +
            '</div>' +
        '</div>' +
        
        // Botón añadir
        '<button onclick="showRecurringIncomeFormNew()" style="width: 100%; padding: 1rem; margin-bottom: 1rem; border-radius: 12px; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; cursor: pointer; font-weight: bold; font-size: 1rem;">+ Añadir Ingreso Recurrente</button>' +
        
        // Lista de ingresos
        '<div class="card" style="padding: 1rem;">' +
            '<h3 style="margin: 0 0 1rem 0;">📋 Tus Ingresos Recurrentes</h3>' +
            (recurringIncome.length > 0 
                ? recurringIncome.map(function(inc, idx) {
                    var freqLabels = { weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' };
                    return '<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; margin-bottom: 0.5rem; background: rgba(34,197,94,0.1); border-radius: 8px; border-left: 4px solid #22c55e;">' +
                        '<div>' +
                            '<div style="font-weight: bold; color: white;">' + (inc.name || 'Sin nombre') + '</div>' +
                            '<div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">' + (inc.source || 'Otros') + ' • ' + (freqLabels[inc.frequency] || 'Mensual') + '</div>' +
                        '</div>' +
                        '<div style="display: flex; align-items: center; gap: 0.5rem;">' +
                            '<span style="font-weight: bold; color: #22c55e;">+$' + (inc.amount || 0).toFixed(2) + '</span>' +
                            '<button onclick="deleteRecurringIncomeItem(' + idx + ')" style="background: rgba(239,68,68,0.2); border: none; padding: 0.4rem; border-radius: 6px; cursor: pointer; color: #ef4444;">🗑️</button>' +
                        '</div>' +
                    '</div>';
                }).join('')
                : '<div style="text-align: center; padding: 2rem;"><div style="font-size: 3rem; margin-bottom: 1rem;">💸</div><p style="opacity: 0.6;">No tienes ingresos recurrentes</p></div>'
            ) +
        '</div>' +
    '</div>';
}

function showRecurringIncomeFormNew() {
    var modal = document.getElementById('recurring-income-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recurring-income-modal';
        document.body.appendChild(modal);
    }
    
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;padding:1rem;';
    
    modal.innerHTML = '<div style="background:linear-gradient(135deg,rgba(26,35,50,0.98),rgba(13,21,32,0.98));border-radius:1rem;padding:1.5rem;width:100%;max-width:400px;max-height:90vh;overflow-y:auto;border:1px solid rgba(34,197,94,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">' +
            '<h3 style="color:#22c55e;margin:0;">💰 Nuevo Ingreso Recurrente</h3>' +
            '<button onclick="closeRecurringIncomeForm()" style="background:none;border:none;color:white;font-size:1.5rem;cursor:pointer;">&times;</button>' +
        '</div>' +
        '<form onsubmit="event.preventDefault();saveNewRecurringIncome();">' +
            '<div style="margin-bottom:1rem;"><label style="display:block;margin-bottom:0.5rem;color:rgba(255,255,255,0.8);">📝 Nombre</label>' +
            '<input type="text" id="ri-name" placeholder="Ej: Salario, Renta..." required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid rgba(34,197,94,0.3);background:rgba(0,0,0,0.3);color:white;font-size:16px;"></div>' +
            '<div style="margin-bottom:1rem;"><label style="display:block;margin-bottom:0.5rem;color:rgba(255,255,255,0.8);">💵 Monto</label>' +
            '<input type="number" id="ri-amount" placeholder="0.00" step="0.01" min="0.01" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid rgba(34,197,94,0.3);background:rgba(0,0,0,0.3);color:white;font-size:16px;"></div>' +
            '<div style="margin-bottom:1rem;"><label style="display:block;margin-bottom:0.5rem;color:rgba(255,255,255,0.8);">📁 Fuente</label>' +
            '<select id="ri-source" style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid rgba(34,197,94,0.3);background:rgba(0,0,0,0.3);color:white;font-size:16px;">' +
                '<option value="Salario">💼 Salario</option><option value="Freelance">💻 Freelance</option><option value="Renta">🏠 Renta</option><option value="Inversiones">📈 Inversiones</option><option value="Otros">📦 Otros</option></select></div>' +
            '<div style="margin-bottom:1.5rem;"><label style="display:block;margin-bottom:0.5rem;color:rgba(255,255,255,0.8);">🔄 Frecuencia</label>' +
            '<select id="ri-frequency" style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid rgba(34,197,94,0.3);background:rgba(0,0,0,0.3);color:white;font-size:16px;">' +
                '<option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly" selected>Mensual</option><option value="yearly">Anual</option></select></div>' +
            '<div style="display:flex;gap:0.75rem;">' +
                '<button type="button" onclick="closeRecurringIncomeForm()" style="flex:1;padding:0.875rem;border-radius:8px;background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);cursor:pointer;">Cancelar</button>' +
                '<button type="submit" style="flex:1;padding:0.875rem;border-radius:8px;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;cursor:pointer;font-weight:bold;">✅ Guardar</button>' +
            '</div></form></div>';
}

function closeRecurringIncomeForm() {
    var modal = document.getElementById('recurring-income-modal');
    if (modal) modal.style.display = 'none';
}

function saveNewRecurringIncome() {
    var name = document.getElementById('ri-name').value.trim();
    var amount = parseFloat(document.getElementById('ri-amount').value);
    var source = document.getElementById('ri-source').value;
    var frequency = document.getElementById('ri-frequency').value;
    
    if (!name || !amount || amount <= 0) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    var list = JSON.parse(localStorage.getItem('recurringIncome') || '[]');
    list.push({
        id: Date.now().toString(),
        name: name,
        amount: amount,
        source: source,
        frequency: frequency,
        active: true,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('recurringIncome', JSON.stringify(list));
    
    // También guardar en Firebase si está disponible
    if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
        db.collection('users').doc(currentUser.uid).collection('recurringIncome').add({
            name: name, amount: amount, source: source, frequency: frequency, active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(function(e) { console.warn('Error Firebase:', e); });
    }
    
    closeRecurringIncomeForm();
    alert('✅ Ingreso recurrente guardado');
    switchTab('more-recurring-income');
}

function deleteRecurringIncomeItem(index) {
    if (!confirm('¿Eliminar este ingreso recurrente?')) return;
    var list = JSON.parse(localStorage.getItem('recurringIncome') || '[]');
    list.splice(index, 1);
    localStorage.setItem('recurringIncome', JSON.stringify(list));
    switchTab('more-recurring-income');
}

console.log('✅ Vistas completas de Más cargadas: Notificaciones, Comparación, Ingresos Recurrentes');
