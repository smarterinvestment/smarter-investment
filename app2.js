
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

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBT3UJTHLuBQaB9kK0539-acw8ertf__vY",
  authDomain: "smarter-investment.firebaseapp.com",
  projectId: "smarter-investment",
  storageBucket: "smarter-investment.firebasestorage.app",
  messagingSenderId: "1037439323005",
  appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
  measurementId: "G-DQKR8KNV2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
    createModalStructure();
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
    createModalStructure();
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
    createModalStructure();
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
    createModalStructure();
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
    createModalStructure();
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
// 📊 REPORTS MODULE - Módulo de Reportes Interactivos
// ========================================
class ReportsModule {
    constructor(db) {
        this.db = db;
        this.isInitialized = false;
        this.currentReport = null;
    }

    /**
     * Inicializar módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar reportes:', error);
            return false;
        }
    }

    /**
     * Renderizar sección de reportes
     */
    renderReportsSection(expenses = [], incomeHistory = []) {
        if (!this.isInitialized) {
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>📊 Módulo de reportes no disponible</p>
                    </div>
                </div>
            `;
        }

        try {
            // Calcular estadísticas básicas
            const stats = this.calculateStats(expenses, incomeHistory);
            
            return `
                <div class="reports-container">
                    <div class="reports-header">
                        <h2>📊 Reportes Financieros</h2>
                        <div class="report-actions">
                            <button class="report-btn" onclick="reportsModule.generateMonthlyReport()">
                                📅 Reporte Mensual
                            </button>
                            <button class="report-btn" onclick="reportsModule.generateAnnualReport()">
                                📆 Reporte Anual
                            </button>
                            <button class="report-btn" onclick="reportsModule.exportReport()">
                                💾 Exportar
                            </button>
                        </div>
                    </div>

                    <!-- Resumen Rápido -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <h4>Total Gastos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyExpenses.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Total Ingresos (Mes)</h4>
                            <p class="stat-value">$${stats.monthlyIncome.toFixed(2)}</p>
                        </div>
                        <div class="stat-card">
                            <h4>Balance</h4>
                            <p class="stat-value ${stats.balance >= 0 ? 'positive' : 'negative'}">
                                $${stats.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="stat-card">
                            <h4>Tasa de Ahorro</h4>
                            <p class="stat-value">${stats.savingsRate.toFixed(1)}%</p>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="charts-grid">
                        <div class="chart-container">
                            <h3>📈 Tendencia de Gastos</h3>
                            <canvas id="expense-trend-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>🍰 Distribución por Categorías</h3>
                            <canvas id="category-distribution-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>💰 Flujo de Efectivo</h3>
                            <canvas id="cashflow-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h3>📊 Comparación Presupuesto</h3>
                            <canvas id="budget-comparison-chart"></canvas>
                        </div>
                    </div>

                    <!-- Insights -->
                    <div class="insights-section">
                        <h3>💡 Insights y Recomendaciones</h3>
                        ${this.generateInsights(stats)}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error renderizando reportes:', error);
            return `
                <div class="reports-container">
                    <div class="error-message">
                        <p>Error al cargar reportes</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Calcular estadísticas
     */
    calculateStats(expenses, incomeHistory) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filtrar transacciones del mes actual
        const monthlyExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const monthlyIncome = incomeHistory.filter(i => {
            const date = new Date(i.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const totalIncome = monthlyIncome.reduce((sum, i) => sum + (i.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        return {
            monthlyExpenses: totalExpenses,
            monthlyIncome: totalIncome,
            balance: balance,
            savingsRate: savingsRate,
            transactionCount: monthlyExpenses.length,
            avgTransaction: monthlyExpenses.length > 0 ? totalExpenses / monthlyExpenses.length : 0
        };
    }

    /**
     * Generar insights automáticos
     */
    generateInsights(stats) {
        const insights = [];

        // Análisis de tasa de ahorro
        if (stats.savingsRate < 10) {
            insights.push({
                type: 'warning',
                icon: '⚠️',
                message: 'Tu tasa de ahorro es baja. Intenta reducir gastos no esenciales.'
            });
        } else if (stats.savingsRate > 30) {
            insights.push({
                type: 'success',
                icon: '🎉',
                message: '¡Excelente tasa de ahorro! Considera invertir el excedente.'
            });
        }

        // Análisis de balance
        if (stats.balance < 0) {
            insights.push({
                type: 'danger',
                icon: '🚨',
                message: 'Gastas más de lo que ganas. Revisa tus gastos urgentemente.'
            });
        }

        // Análisis de transacciones
        if (stats.avgTransaction > 100) {
            insights.push({
                type: 'info',
                icon: '💡',
                message: 'Tus transacciones promedio son altas. Verifica si son necesarias.'
            });
        }

        if (insights.length === 0) {
            insights.push({
                type: 'success',
                icon: '✅',
                message: 'Tus finanzas se ven saludables. ¡Sigue así!'
            });
        }

        return insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <span class="insight-icon">${insight.icon}</span>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    /**
     * Generar reporte mensual
     */
    async generateMonthlyReport() {
        try {
            showToast('📊 Generando reporte mensual...');
            // Aquí iría la lógica para generar el reporte
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('monthly');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Generar reporte anual
     */
    async generateAnnualReport() {
        try {
            showToast('📊 Generando reporte anual...');
            setTimeout(() => {
                showToast('✅ Reporte generado exitosamente');
                this.showReportModal('annual');
            }, 1500);
        } catch (error) {
            console.error('Error generando reporte:', error);
            showToast('❌ Error al generar reporte');
        }
    }

    /**
     * Mostrar modal de reporte
     */
    showReportModal(type) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content report-modal">
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
                <h2>📊 Reporte ${type === 'monthly' ? 'Mensual' : 'Anual'}</h2>
                <div class="report-preview">
                    <p>Vista previa del reporte ${type === 'monthly' ? 'mensual' : 'anual'}</p>
                    <!-- Aquí iría el contenido del reporte -->
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="reportsModule.downloadReport('${type}')">
                        💾 Descargar PDF
                    </button>
                    <button class="btn btn-secondary" onclick="reportsModule.shareReport('${type}')">
                        📤 Compartir
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Exportar reporte
     */
    async exportReport() {
        try {
            showToast('📄 Preparando exportación...');
            // Lógica de exportación
            setTimeout(() => {
                showToast('✅ Datos exportados exitosamente');
            }, 1000);
        } catch (error) {
            console.error('Error exportando:', error);
            showToast('❌ Error al exportar datos');
        }
    }

    /**
     * Descargar reporte
     */
    downloadReport(type) {
        showToast('📥 Descargando reporte...');
        // Aquí iría la lógica de descarga
        this.parentElement.parentElement.parentElement.remove();
    }

    /**
     * Compartir reporte
     */
    shareReport(type) {
        showToast('📤 Compartiendo reporte...');
        // Aquí iría la lógica para compartir
        this.parentElement.parentElement.parentElement.remove();
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
    console.log('📊 Módulo de reportes cargado correctamente');
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
/**
 * 📊 Renderizar vista INTEGRADA de gastos recurrentes
 * (Usa esta en lugar de la versión anterior con tabs)
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
    const upcoming = recurringModule.getUpcomingExpenses(30);
    const activeRecurring = recurringModule.recurringExpenses.filter(r => r.active);
    const pausedRecurring = recurringModule.recurringExpenses.filter(r => !r.active);
    
    return `
        <div class="recurring-container">
            <!-- Resumen -->
            <div class="recurring-summary">
                <h2>🔄 Gastos Recurrentes</h2>
                <p class="subtitle">Gestiona tus pagos automáticos</p>
            </div>
            
            <!-- Estadísticas -->
            <div class="recurring-stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${recurringModule.recurringExpenses.length}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.active}</div>
                    <div class="stat-label">Activos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$${stats.monthlyEstimate.toFixed(2)}</div>
                    <div class="stat-label">Mensual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${stats.totalGenerated}</div>
                    <div class="stat-label">Generados</div>
                </div>
            </div>
            
            <!-- Lista de Recurrentes -->
            <div class="recurring-list-section">
                <h3>📋 Tus Recurrentes</h3>
                ${activeRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
                ${pausedRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
            </div>
            
            <!-- Próximos -->
            <div class="upcoming-section">
                <h3>📆 Próximos</h3>
                ${upcoming.map(u => `
                    <div class="upcoming-item">
                        <div class="upcoming-date">${u.nextDate.toLocaleDateString()}</div>
                        <div class="upcoming-description">${u.name}</div>
                        <div class="upcoming-amount">$${u.amount.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Gráficas -->
            <div class="charts-section">
                <h3>📊 Análisis</h3>
                <canvas id="recurring-chart"></canvas>
            </div>
        </div>
    `;
}

// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                        <button onclick="pauseRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                            ⏸️ Pausar
                                        </button>
                                        <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                            ✏️ Editar
                                        </button>
                                        <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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
            <div class="recurring-summary">
                <h2>🔄 Gastos Recurrentes</h2>
                <p class="subtitle">Gestiona tus pagos automáticos</p>
            </div>
            
            <!-- Estadísticas -->
            <div class="recurring-stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${recurringModule.recurringExpenses.length}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.active}</div>
                    <div class="stat-label">Activos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$${stats.monthlyEstimate.toFixed(2)}</div>
                    <div class="stat-label">Mensual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${stats.totalGenerated}</div>
                    <div class="stat-label">Generados</div>
                </div>
            </div>
            
            <!-- Lista de Recurrentes -->
            <div class="recurring-list-section">
                <h3>📋 Tus Recurrentes</h3>
                ${activeRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
                ${pausedRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
            </div>
            
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
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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
            <div class="recurring-summary">
                <h2>🔄 Gastos Recurrentes</h2>
                <p class="subtitle">Gestiona tus pagos automáticos</p>
            </div>
            
            <!-- Estadísticas -->
            <div class="recurring-stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${recurringModule.recurringExpenses.length}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${stats.active}</div>
                    <div class="stat-label">Activos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$${stats.monthlyEstimate.toFixed(2)}</div>
                    <div class="stat-label">Mensual</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${stats.totalGenerated}</div>
                    <div class="stat-label">Generados</div>
                </div>
            </div>
            
            <!-- Lista de Recurrentes -->
            <div class="recurring-list-section">
                <h3>📋 Tus Recurrentes</h3>
                ${activeRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
                ${pausedRecurring.map(r => recurringModule.renderRecurringItem(r)).join('')}
            </div>
            
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
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                    <button onclick="activateRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ▶️ Reactivar
                                    </button>
                                    <button onclick="editRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
                                        ✏️ Editar
                                    </button>
                                    <button onclick="deleteRecurring('${recurring.id}')" style="flex: 1; min-width: 100px; padding: 0.5rem; font-size: 0.85rem;">
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
        // FIX: Usar nextDate en lugar de date
        const dateObj = item.nextDate || item.date || new Date();
        const dateStr = dateObj instanceof Date ? 
            dateObj.toISOString().split('T')[0] : 
            (typeof dateObj === 'string' ? dateObj.split('T')[0] : new Date().toISOString().split('T')[0]);
        
        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(item);
    });
    
    return `
        <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 0.75rem;">
            ${Object.entries(grouped).map(([date, items], index) => {
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                const daysUntil = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
                
                return `
                    <div style="margin-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; padding-bottom: ${index < Object.entries(grouped).length - 1 ? '1rem' : '0'}; border-bottom: ${index < Object.entries(grouped).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'};">
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
                                $${total.toFixed(2)}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${items.map(item => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.03); border-radius: 0.5rem;">
                                    <div style="font-size: 0.9rem;">
                                        ${item.name || item.description || 'Gasto recurrente'}
                                    </div>
                                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--color-danger);">
                                        $${(item.amount || 0).toFixed(2)}
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
    return emojis[frequency] || '🗓️';
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



// ========================================
// 🔄 FUNCIONES DE RECURRENTES INTEGRADAS
// ========================================

/**
 * 🔄 Renderizar vista INTEGRADA de gastos recurrentes
 * TODO EN UNA SOLA PÁGINA - Sin sub-tabs
 */
function renderRecurringExpensesViewIntegrated() {
    if (!recurringModule || !recurringModule.isInitialized) {
        return `
            <div class="recurring-container">
                <div class="recurring-error">
                    <p>Módulo de recurrentes no disponible</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            </div>
        `;
    }

    const stats = recurringModule.getStats();
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
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: rgba(34, 197, 94, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-success);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-success);"> ${stats.active}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Activos</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(251, 191, 36, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-warning);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏸️</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-warning);"> ${stats.paused}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Pausados</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(5, 191, 219, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-primary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-primary);">$${stats.monthlyEstimate.toFixed(0)}</div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-top: 0.25rem;">Mensual</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: rgba(168, 85, 247, 0.1); border-radius: 0.75rem; border: 2px solid var(--color-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--color-secondary);"> ${stats.totalGenerated}</div>
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
                                            <div style="font-size: 1.3rem; font-weight: bold; color: var(--color-primary);
