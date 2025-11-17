// ========================================
// SMARTER INVESTMENT - APP.JS SIMPLIFICADO
// Versión Mínima Funcional
// ========================================

// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCuZAk-ZJiaxCtIKQqzz8Qp3SSIDrBLtQw",
    authDomain: "smarter-investment.firebaseapp.com",
    projectId: "smarter-investment",
    storageBucket: "smarter-investment.firebasestorage.app",
    messagingSenderId: "1037439323005",
    appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
    measurementId: "G-DQKRBKNV2V"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase inicializado correctamente');

// ========================================
// VARIABLES GLOBALES
// ========================================

let currentUser = null;
let expenses = [];
let income = [];

// ========================================
// AUTENTICACIÓN
// ========================================

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log('✅ Usuario autenticado:', user.email);
        showApp();
        loadUserData();
    } else {
        currentUser = null;
        console.log('❌ No hay usuario autenticado');
        showAuth();
    }
});

function showAuth() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function showApp() {
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement && currentUser) {
        userEmailElement.textContent = currentUser.email;
    }
    
    renderDashboard();
}

// ========================================
// FUNCIONES DE LOGIN/REGISTRO
// ========================================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log('✅ Login exitoso');
        })
        .catch((error) => {
            console.error('❌ Error en login:', error);
            alert('Error: ' + error.message);
        });
}

function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            console.log('✅ Registro exitoso');
        })
        .catch((error) => {
            console.error('❌ Error en registro:', error);
            alert('Error: ' + error.message);
        });
}

function switchAuthMode() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// ========================================
// CARGAR DATOS
// ========================================

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const expensesSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .orderBy('date', 'desc')
            .get();
        
        expenses = expensesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const incomeSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('income')
            .orderBy('date', 'desc')
            .get();
        
        income = incomeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('✅ Datos cargados:', { expenses: expenses.length, income: income.length });
        renderDashboard();
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
    }
}

// ========================================
// RENDERIZAR DASHBOARD
// ========================================

function renderDashboard() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalIncome = income.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    
    mainContent.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h1>💰 Resumen Financiero</h1>
            </div>
            
            <div class="summary-cards">
                <div class="summary-card income">
                    <div class="card-icon">📈</div>
                    <div class="card-content">
                        <span class="card-label">Ingresos</span>
                        <span class="card-amount">$${totalIncome.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="summary-card expense">
                    <div class="card-icon">📉</div>
                    <div class="card-content">
                        <span class="card-label">Gastos</span>
                        <span class="card-amount">$${totalExpenses.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="summary-card balance ${balance >= 0 ? 'positive' : 'negative'}">
                    <div class="card-icon">${balance >= 0 ? '✅' : '⚠️'}</div>
                    <div class="card-content">
                        <span class="card-label">Balance</span>
                        <span class="card-amount">$${balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-section">
                <h2>📝 Gastos Recientes</h2>
                <div class="expenses-list">
                    ${expenses.length > 0 ? expenses.slice(0, 5).map(exp => `
                        <div class="expense-item">
                            <div class="expense-details">
                                <div class="expense-description">${exp.description || 'Sin descripción'}</div>
                                <div class="expense-date">${exp.date || 'Sin fecha'}</div>
                            </div>
                            <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
                        </div>
                    `).join('') : '<p class="empty-state">No hay gastos registrados</p>'}
                </div>
            </div>
        </div>
    `;
}

// ========================================
// MODAL DE GASTOS
// ========================================

function openExpenseModal() {
    let modal = document.getElementById('expense-modal');
    
    if (!modal) {
        const modalHTML = `
            <div id="expense-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>💸 Nuevo Gasto</h2>
                        <button class="btn-close" onclick="closeModal()">✕</button>
                    </div>
                    
                    <form id="expense-form">
                        <div class="form-group">
                            <label>Monto</label>
                            <input type="number" id="expense-amount" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Descripción</label>
                            <input type="text" id="expense-description" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Categoría</label>
                            <select id="expense-category" required>
                                <option value="Alimentación">🍔 Alimentación</option>
                                <option value="Transporte">🚗 Transporte</option>
                                <option value="Vivienda">🏠 Vivienda</option>
                                <option value="Entretenimiento">🎮 Entretenimiento</option>
                                <option value="Otros">📦 Otros</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Fecha</label>
                            <input type="date" id="expense-date" required>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">💾 Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('expense-modal');
        
        document.getElementById('expense-form').addEventListener('submit', saveExpense);
    }
    
    modal.style.display = 'flex';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-description').value = '';
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
}

async function saveExpense(event) {
    event.preventDefault();
    
    const expense = {
        amount: parseFloat(document.getElementById('expense-amount').value),
        description: document.getElementById('expense-description').value,
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .add(expense);
        
        console.log('✅ Gasto guardado');
        closeModal();
        toggleFabMenu();
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al guardar:', error);
        alert('Error al guardar el gasto');
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

// ========================================
// MENÚ FAB
// ========================================

function toggleFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    if (!fabMenu) return;
    
    fabMenu.style.display = fabMenu.style.display === 'flex' ? 'none' : 'flex';
}

// ========================================
// LOGOUT
// ========================================

function handleLogout() {
    if (confirm('¿Cerrar sesión?')) {
        auth.signOut();
    }
}

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Smarter Investment...');
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const fabButton = document.getElementById('fab-button');
    if (fabButton) {
        fabButton.addEventListener('click', toggleFabMenu);
    }
    
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    console.log('✅ Aplicación inicializada');
});

// Exponer funciones globales
window.openExpenseModal = openExpenseModal;
window.closeModal = closeModal;
window.toggleFabMenu = toggleFabMenu;
window.switchAuthMode = switchAuthMode;
window.handleLogout = handleLogout;

console.log('✅ app.js cargado completamente - Smarter Investment Simple v1.0');