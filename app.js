// ========================================
// SMARTER INVESTMENT - APP.JS COMPLETO
// PARTE 1 DE 3
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

// ========================================
// VARIABLES GLOBALES
// ========================================

let currentUser = null;
let expenses = [];
let income = [];
let goals = [];
let budgetLimits = {};
let currentView = 'dashboard';
let recurringExpenses = [];

// ========================================
// GESTIÓN DE AUTENTICACIÓN
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
    
    // Mostrar email del usuario
    const userEmailElement = document.getElementById('user-email');
    if (userEmailElement && currentUser) {
        userEmailElement.textContent = currentUser.email;
    }
    
    // Inicializar vista del dashboard
    handleTabChange('dashboard');
}

// ========================================
// FUNCIONES DE AUTENTICACIÓN
// ========================================

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login exitoso');
    } catch (error) {
        console.error('❌ Error en login:', error);
        alert('Error al iniciar sesión: ' + error.message);
    }
}

async function handleRegister(event) {
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
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ Registro exitoso');
    } catch (error) {
        console.error('❌ Error en registro:', error);
        alert('Error al registrar: ' + error.message);
    }
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
// CARGA DE DATOS DEL USUARIO
// ========================================

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Cargar gastos
        const expensesSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .orderBy('date', 'desc')
            .get();
        
        expenses = expensesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Cargar ingresos
        const incomeSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('income')
            .orderBy('date', 'desc')
            .get();
        
        income = incomeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Cargar metas
        const goalsSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('goals')
            .get();
        
        goals = goalsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Cargar límites de presupuesto
        const budgetDoc = await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('budget')
            .get();
        
        if (budgetDoc.exists) {
            budgetLimits = budgetDoc.data().limits || {};
        }
        
        // Cargar gastos recurrentes
        const recurringSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('recurringExpenses')
            .get();
        
        recurringExpenses = recurringSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('✅ Datos cargados:', {
            expenses: expenses.length,
            income: income.length,
            goals: goals.length,
            recurring: recurringExpenses.length
        });
        
        // Inicializar módulos con datos
        if (typeof NotificationsModule !== 'undefined') {
            NotificationsModule.initialize();
        }
        
        if (typeof RecurringModule !== 'undefined') {
            RecurringModule.initialize(recurringExpenses);
        }
        
        if (typeof ComparisonModule !== 'undefined') {
            ComparisonModule.initialize(expenses, recurringExpenses);
        }
        
        // Renderizar vista actual
        renderCurrentView();
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
    }
}

// ========================================
// NAVEGACIÓN Y VISTAS
// ========================================

function handleTabChange(tab) {
    currentView = tab;
    
    // Actualizar navegación activa
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    renderCurrentView();
}

function renderCurrentView() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    switch (currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'expenses':
            renderExpenses();
            break;
        case 'budget':
            renderBudget();
            break;
        case 'recurring':
            renderRecurring();
            break;
        case 'goals':
            renderGoals();
            break;
        case 'more':
            renderMore();
            break;
        default:
            renderDashboard();
    }
}

// ========================================
// RENDERIZADO DEL DASHBOARD
// ========================================

function renderDashboard() {
    const mainContent = document.getElementById('main-content');
    
    // Calcular estadísticas
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalIncome = income.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    
    // Gastos por categoría
    const expensesByCategory = {};
    expenses.forEach(exp => {
        const category = exp.category || 'Otros';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + exp.amount;
    });
    
    // Gastos recientes (últimos 5)
    const recentExpenses = expenses.slice(0, 5);
    
    mainContent.innerHTML = `
        <div class="dashboard-container">
            <!-- Header -->
            <div class="dashboard-header">
                <h1>💰 Resumen Financiero</h1>
                <p class="dashboard-subtitle">Tu situación financiera actual</p>
            </div>
            
            <!-- Tarjetas de resumen -->
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
            
            <!-- Gráfico de gastos por categoría -->
            <div class="dashboard-section">
                <h2><span>📊</span> Gastos por Categoría</h2>
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            
            <!-- Gastos recientes -->
            <div class="dashboard-section">
                <h2><span>📝</span> Gastos Recientes</h2>
                <div class="expenses-list">
                    ${recentExpenses.length > 0 ? recentExpenses.map(exp => `
                        <div class="expense-item">
                            <div class="expense-icon">${getCategoryIcon(exp.category)}</div>
                            <div class="expense-details">
                                <div class="expense-description">${exp.description || 'Sin descripción'}</div>
                                <div class="expense-date">${formatDate(exp.date)}</div>
                            </div>
                            <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
                        </div>
                    `).join('') : '<p class="empty-state">No hay gastos registrados</p>'}
                </div>
            </div>
            
            <!-- Alertas de presupuesto -->
            ${renderBudgetAlerts()}
        </div>
    `;
    
    // Renderizar gráfico
    setTimeout(() => {
        renderCategoryChart(expensesByCategory);
    }, 100);
}

function renderCategoryChart(expensesByCategory) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    // Colores para cada categoría
    const colors = [
        '#05bfdb', '#00d9ff', '#0abeff', '#00bcd4',
        '#4dd0e1', '#80deea', '#26c6da', '#00acc1'
    ];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: '#000b2e',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
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

function renderBudgetAlerts() {
    const alerts = [];
    
    // Verificar límites de presupuesto
    Object.keys(budgetLimits).forEach(category => {
        const limit = budgetLimits[category];
        const spent = expenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.amount, 0);
        
        const percentage = (spent / limit) * 100;
        
        if (percentage >= 100) {
            alerts.push({
                type: 'danger',
                message: `⚠️ ¡Has excedido el presupuesto de ${category}! (${percentage.toFixed(0)}%)`
            });
        } else if (percentage >= 80) {
            alerts.push({
                type: 'warning',
                message: `⚡ Estás cerca del límite en ${category} (${percentage.toFixed(0)}%)`
            });
        }
    });
    
    if (alerts.length === 0) return '';
    
    return `
        <div class="dashboard-section">
            <h2><span>🔔</span> Alertas</h2>
            <div class="alerts-container">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        ${alert.message}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDERIZADO DE GASTOS
// ========================================

function renderExpenses() {
    const mainContent = document.getElementById('main-content');
    
    // Agrupar gastos por mes
    const expensesByMonth = {};
    expenses.forEach(exp => {
        const month = exp.date.substring(0, 7); // YYYY-MM
        if (!expensesByMonth[month]) {
            expensesByMonth[month] = [];
        }
        expensesByMonth[month].push(exp);
    });
    
    const months = Object.keys(expensesByMonth).sort().reverse();
    
    mainContent.innerHTML = `
        <div class="expenses-container">
            <div class="section-header">
                <h1>💸 Mis Gastos</h1>
                <button class="btn btn-primary" onclick="openExpenseModal()">
                    ➕ Agregar Gasto
                </button>
            </div>
            
            <div class="expenses-timeline">
                ${months.map(month => `
                    <div class="month-group">
                        <h3 class="month-title">${formatMonth(month)}</h3>
                        <div class="month-summary">
                            Total: $${expensesByMonth[month].reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                        </div>
                        <div class="expenses-list">
                            ${expensesByMonth[month].map(exp => `
                                <div class="expense-item" data-id="${exp.id}">
                                    <div class="expense-icon">${getCategoryIcon(exp.category)}</div>
                                    <div class="expense-details">
                                        <div class="expense-description">${exp.description || 'Sin descripción'}</div>
                                        <div class="expense-category">${exp.category || 'Sin categoría'}</div>
                                        <div class="expense-date">${formatDate(exp.date)}</div>
                                    </div>
                                    <div class="expense-actions">
                                        <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
                                        <button class="btn-icon" onclick="deleteExpense('${exp.id}')">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
                
                ${months.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No hay gastos registrados</p>
                        <button class="btn btn-primary" onclick="openExpenseModal()">
                            Agregar primer gasto
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========================================
// RENDERIZADO DEL PRESUPUESTO
// ========================================

function renderBudget() {
    const mainContent = document.getElementById('main-content');
    
    // Categorías disponibles
    const categories = [
        'Alimentación', 'Transporte', 'Vivienda', 'Servicios',
        'Entretenimiento', 'Salud', 'Educación', 'Compras', 'Otros'
    ];
    
    mainContent.innerHTML = `
        <div class="budget-container">
            <div class="section-header">
                <h1>📊 Presupuesto</h1>
                <p class="section-subtitle">Gestiona tus límites de gasto por categoría</p>
            </div>
            
            <div class="budget-categories">
                ${categories.map(category => {
                    const limit = budgetLimits[category] || 0;
                    const spent = expenses
                        .filter(exp => exp.category === category)
                        .reduce((sum, exp) => sum + exp.amount, 0);
                    
                    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
                    const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe';
                    
                    return `
                        <div class="budget-category-card ${status}">
                            <div class="category-header">
                                <div class="category-info">
                                    <span class="category-icon">${getCategoryIcon(category)}</span>
                                    <span class="category-name">${category}</span>
                                </div>
                                <button class="btn-icon" onclick="editBudgetLimit('${category}', ${limit})">
                                    ✏️
                                </button>
                            </div>
                            
                            <div class="budget-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span>$${spent.toFixed(2)} / $${limit.toFixed(2)}</span>
                                    <span>${percentage.toFixed(0)}%</span>
                                </div>
                            </div>
                            
                            ${percentage >= 100 ? `
                                <div class="budget-alert danger">
                                    ⚠️ ¡Presupuesto excedido!
                                </div>
                            ` : percentage >= 80 ? `
                                <div class="budget-alert warning">
                                    ⚡ Cerca del límite
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// ========================================
// RENDERIZADO DE RECURRENTES
// ========================================

function renderRecurring() {
    const mainContent = document.getElementById('main-content');
    
    if (typeof RecurringModule !== 'undefined' && RecurringModule.render) {
        mainContent.innerHTML = RecurringModule.render();
    } else {
        mainContent.innerHTML = `
            <div class="recurring-container">
                <div class="section-header">
                    <h1>🔄 Gastos Recurrentes</h1>
                    <button class="btn btn-primary" onclick="openRecurringModal()">
                        ➕ Nuevo Recurrente
                    </button>
                </div>
                
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <p>Módulo de gastos recurrentes en desarrollo</p>
                </div>
            </div>
        `;
    }
}

// ========================================
// RENDERIZADO DE METAS
// ========================================

function renderGoals() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="goals-container">
            <div class="section-header">
                <h1>🎯 Mis Metas</h1>
                <button class="btn btn-primary" onclick="openGoalModal()">
                    ➕ Nueva Meta
                </button>
            </div>
            
            <div class="goals-grid">
                ${goals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const remaining = goal.targetAmount - goal.currentAmount;
                    
                    return `
                        <div class="goal-card">
                            <div class="goal-header">
                                <h3>${goal.name}</h3>
                                <button class="btn-icon" onclick="deleteGoal('${goal.id}')">
                                    🗑️
                                </button>
                            </div>
                            
                            <div class="goal-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span>$${goal.currentAmount.toFixed(2)} / $${goal.targetAmount.toFixed(2)}</span>
                                    <span>${progress.toFixed(0)}%</span>
                                </div>
                            </div>
                            
                            <div class="goal-details">
                                <div class="detail-item">
                                    <span class="detail-label">Faltante:</span>
                                    <span class="detail-value">$${remaining.toFixed(2)}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-label">Fecha límite:</span>
                                    <span class="detail-value">${formatDate(goal.deadline)}</span>
                                </div>
                            </div>
                            
                            <button class="btn btn-secondary btn-block" onclick="addToGoal('${goal.id}')">
                                ➕ Agregar Ahorro
                            </button>
                        </div>
                    `;
                }).join('')}
                
                ${goals.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🎯</div>
                        <p>No tienes metas financieras aún</p>
                        <button class="btn btn-primary" onclick="openGoalModal()">
                            Crear primera meta
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ========================================
// RENDERIZADO DE MÁS OPCIONES
// ========================================

function renderMore() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="more-container">
            <div class="section-header">
                <h1>⚙️ Más Opciones</h1>
            </div>
            
            <div class="menu-options">
                <div class="menu-option" onclick="openAssistant()">
                    <div class="option-icon">🤖</div>
                    <div class="option-content">
                        <h3>Asistente Financiero</h3>
                        <p>Chatea con nuestro AI para consejos financieros</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
                
                <div class="menu-option" onclick="openReports()">
                    <div class="option-icon">📊</div>
                    <div class="option-content">
                        <h3>Reportes</h3>
                        <p>Visualiza tus estadísticas detalladas</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
                
                <div class="menu-option" onclick="openComparison()">
                    <div class="option-icon">📈</div>
                    <div class="option-content">
                        <h3>Comparación</h3>
                        <p>Compara tus gastos totales vs recurrentes</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
                
                <div class="menu-option" onclick="openNotifications()">
                    <div class="option-icon">🔔</div>
                    <div class="option-content">
                        <h3>Notificaciones</h3>
                        <p>Configura tus recordatorios financieros</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
                
                <div class="menu-option" onclick="openSettings()">
                    <div class="option-icon">⚙️</div>
                    <div class="option-content">
                        <h3>Configuración</h3>
                        <p>Ajustes de la aplicación</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
                
                <div class="menu-option danger" onclick="handleLogout()">
                    <div class="option-icon">🚪</div>
                    <div class="option-content">
                        <h3>Cerrar Sesión</h3>
                        <p>Salir de tu cuenta</p>
                    </div>
                    <div class="option-arrow">›</div>
                </div>
            </div>
            
            <div class="app-info">
                <p>Smarter Investment v2.0</p>
                <p>© 2024 - Gestión Financiera Inteligente</p>
            </div>
        </div>
    `;
}
// ========================================
// SMARTER INVESTMENT - APP.JS COMPLETO
// PARTE 2 DE 3
// ========================================
// ⬆️ VIENE DE PARTE 1 DE 3
// ========================================

// ========================================
// MODALES Y FORMULARIOS
// ========================================

function openExpenseModal() {
    const modal = document.getElementById('expense-modal');
    if (!modal) {
        createExpenseModal();
    }
    
    const expenseModal = document.getElementById('expense-modal');
    if (expenseModal) {
        expenseModal.style.display = 'flex';
        
        // Resetear formulario
        document.getElementById('expense-amount').value = '';
        document.getElementById('expense-description').value = '';
        document.getElementById('expense-category').value = 'Alimentación';
        document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
    }
}

function createExpenseModal() {
    const modalHTML = `
        <div id="expense-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💸 Nuevo Gasto</h2>
                    <button class="btn-close" onclick="closeModal()">✕</button>
                </div>
                
                <form id="expense-form" onsubmit="saveExpense(event)">
                    <div class="form-group">
                        <label for="expense-amount">Monto</label>
                        <input type="number" id="expense-amount" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="expense-description">Descripción</label>
                        <input type="text" id="expense-description" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="expense-category">Categoría</label>
                        <select id="expense-category" required>
                            <option value="Alimentación">🍔 Alimentación</option>
                            <option value="Transporte">🚗 Transporte</option>
                            <option value="Vivienda">🏠 Vivienda</option>
                            <option value="Servicios">💡 Servicios</option>
                            <option value="Entretenimiento">🎮 Entretenimiento</option>
                            <option value="Salud">🏥 Salud</option>
                            <option value="Educación">📚 Educación</option>
                            <option value="Compras">🛍️ Compras</option>
                            <option value="Otros">📦 Otros</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="expense-date">Fecha</label>
                        <input type="date" id="expense-date" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            💾 Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openIncomeModal() {
    const modal = document.getElementById('income-modal');
    if (!modal) {
        createIncomeModal();
    }
    
    const incomeModal = document.getElementById('income-modal');
    if (incomeModal) {
        incomeModal.style.display = 'flex';
        
        // Resetear formulario
        document.getElementById('income-amount').value = '';
        document.getElementById('income-description').value = '';
        document.getElementById('income-type').value = 'Salario';
        document.getElementById('income-date').value = new Date().toISOString().split('T')[0];
    }
}

function createIncomeModal() {
    const modalHTML = `
        <div id="income-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📈 Nuevo Ingreso</h2>
                    <button class="btn-close" onclick="closeModal()">✕</button>
                </div>
                
                <form id="income-form" onsubmit="saveIncome(event)">
                    <div class="form-group">
                        <label for="income-amount">Monto</label>
                        <input type="number" id="income-amount" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="income-description">Descripción</label>
                        <input type="text" id="income-description" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="income-type">Tipo</label>
                        <select id="income-type" required>
                            <option value="Salario">💼 Salario</option>
                            <option value="Freelance">💻 Freelance</option>
                            <option value="Inversión">📊 Inversión</option>
                            <option value="Regalo">🎁 Regalo</option>
                            <option value="Otro">💰 Otro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="income-date">Fecha</label>
                        <input type="date" id="income-date" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            💾 Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openGoalModal() {
    const modal = document.getElementById('goal-modal');
    if (!modal) {
        createGoalModal();
    }
    
    const goalModal = document.getElementById('goal-modal');
    if (goalModal) {
        goalModal.style.display = 'flex';
        
        // Resetear formulario
        document.getElementById('goal-name').value = '';
        document.getElementById('goal-target').value = '';
        document.getElementById('goal-current').value = '0';
        document.getElementById('goal-deadline').value = '';
    }
}

function createGoalModal() {
    const modalHTML = `
        <div id="goal-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🎯 Nueva Meta</h2>
                    <button class="btn-close" onclick="closeModal()">✕</button>
                </div>
                
                <form id="goal-form" onsubmit="saveGoal(event)">
                    <div class="form-group">
                        <label for="goal-name">Nombre de la meta</label>
                        <input type="text" id="goal-name" required placeholder="Ej: Vacaciones, Auto nuevo">
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-target">Monto objetivo</label>
                        <input type="number" id="goal-target" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-current">Monto actual</label>
                        <input type="number" id="goal-current" step="0.01" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="goal-deadline">Fecha límite</label>
                        <input type="date" id="goal-deadline" required>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            💾 Crear Meta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

// ========================================
// FUNCIONES CRUD - GASTOS
// ========================================

async function saveExpense(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    
    const expense = {
        amount,
        description,
        category,
        date,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .add(expense);
        
        console.log('✅ Gasto guardado');
        closeModal();
        
        // Cerrar menú FAB si está abierto
        const fabMenu = document.getElementById('fab-menu');
        if (fabMenu) fabMenu.style.display = 'none';
        
        // Recargar datos
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al guardar gasto:', error);
        alert('Error al guardar el gasto');
    }
}

async function deleteExpense(expenseId) {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .doc(expenseId)
            .delete();
        
        console.log('✅ Gasto eliminado');
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al eliminar gasto:', error);
        alert('Error al eliminar el gasto');
    }
}

// ========================================
// FUNCIONES CRUD - INGRESOS
// ========================================

async function saveIncome(event) {
    event.preventDefault();
    
    const amount = parseFloat(document.getElementById('income-amount').value);
    const description = document.getElementById('income-description').value);
    const type = document.getElementById('income-type').value;
    const date = document.getElementById('income-date').value;
    
    const incomeEntry = {
        amount,
        description,
        type,
        date,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('income')
            .add(incomeEntry);
        
        console.log('✅ Ingreso guardado');
        closeModal();
        
        // Cerrar menú FAB si está abierto
        const fabMenu = document.getElementById('fab-menu');
        if (fabMenu) fabMenu.style.display = 'none';
        
        // Recargar datos
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al guardar ingreso:', error);
        alert('Error al guardar el ingreso');
    }
}

// ========================================
// FUNCIONES CRUD - METAS
// ========================================

async function saveGoal(event) {
    event.preventDefault();
    
    const name = document.getElementById('goal-name').value;
    const targetAmount = parseFloat(document.getElementById('goal-target').value);
    const currentAmount = parseFloat(document.getElementById('goal-current').value) || 0;
    const deadline = document.getElementById('goal-deadline').value;
    
    const goal = {
        name,
        targetAmount,
        currentAmount,
        deadline,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('goals')
            .add(goal);
        
        console.log('✅ Meta guardada');
        closeModal();
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al guardar meta:', error);
        alert('Error al guardar la meta');
    }
}

async function addToGoal(goalId) {
    const amount = prompt('¿Cuánto deseas agregar a esta meta?');
    if (!amount || isNaN(amount)) return;
    
    const amountFloat = parseFloat(amount);
    if (amountFloat <= 0) {
        alert('El monto debe ser mayor a 0');
        return;
    }
    
    try {
        const goalRef = db.collection('users')
            .doc(currentUser.uid)
            .collection('goals')
            .doc(goalId);
        
        const goalDoc = await goalRef.get();
        const goalData = goalDoc.data();
        
        await goalRef.update({
            currentAmount: goalData.currentAmount + amountFloat
        });
        
        console.log('✅ Ahorro agregado a la meta');
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al agregar ahorro:', error);
        alert('Error al agregar el ahorro');
    }
}

async function deleteGoal(goalId) {
    if (!confirm('¿Estás seguro de eliminar esta meta?')) return;
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('goals')
            .doc(goalId)
            .delete();
        
        console.log('✅ Meta eliminada');
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al eliminar meta:', error);
        alert('Error al eliminar la meta');
    }
}

// ========================================
// FUNCIONES CRUD - PRESUPUESTO
// ========================================

async function editBudgetLimit(category, currentLimit) {
    const newLimit = prompt(`Ingresa el nuevo límite para ${category}:`, currentLimit);
    if (newLimit === null || newLimit === '') return;
    
    const limitFloat = parseFloat(newLimit);
    if (isNaN(limitFloat) || limitFloat < 0) {
        alert('Por favor ingresa un monto válido');
        return;
    }
    
    try {
        budgetLimits[category] = limitFloat;
        
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .doc('budget')
            .set({
                limits: budgetLimits
            }, { merge: true });
        
        console.log('✅ Límite de presupuesto actualizado');
        renderBudget();
        
    } catch (error) {
        console.error('❌ Error al actualizar límite:', error);
        alert('Error al actualizar el límite');
    }
}

// ========================================
// MENÚ FAB (Floating Action Button)
// ========================================

function toggleFabMenu() {
    const fabMenu = document.getElementById('fab-menu');
    if (!fabMenu) return;
    
    if (fabMenu.style.display === 'flex') {
        fabMenu.style.display = 'none';
    } else {
        fabMenu.style.display = 'flex';
    }
}

function openComparison() {
    const mainContent = document.getElementById('main-content');
    
    if (typeof ComparisonModule !== 'undefined' && ComparisonModule.render) {
        mainContent.innerHTML = ComparisonModule.render();
        ComparisonModule.initialize(expenses, recurringExpenses);
    } else {
        // Vista de comparación manual
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const recurringTotal = recurringExpenses
            .filter(rec => rec.active)
            .reduce((sum, rec) => {
                // Calcular total según frecuencia
                const monthlyAmount = rec.frequency === 'monthly' ? rec.amount :
                                    rec.frequency === 'biweekly' ? rec.amount * 2 :
                                    rec.frequency === 'weekly' ? rec.amount * 4 : 0;
                return sum + monthlyAmount;
            }, 0);
        
        const uniqueExpenses = totalExpenses - recurringTotal;
        const recurringPercentage = totalExpenses > 0 ? (recurringTotal / totalExpenses) * 100 : 0;
        
        mainContent.innerHTML = `
            <div class="comparison-container">
                <div class="section-header">
                    <h1>📈 Comparación de Gastos</h1>
                    <button class="btn btn-secondary" onclick="handleTabChange('more')">
                        ← Volver
                    </button>
                </div>
                
                <div class="comparison-summary">
                    <div class="summary-card">
                        <h3>💰 Gastos Totales</h3>
                        <p class="amount">$${totalExpenses.toFixed(2)}</p>
                    </div>
                    
                    <div class="summary-card recurring">
                        <h3>🔄 Gastos Recurrentes</h3>
                        <p class="amount">$${recurringTotal.toFixed(2)}</p>
                        <p class="percentage">${recurringPercentage.toFixed(1)}% del total</p>
                    </div>
                    
                    <div class="summary-card unique">
                        <h3>🎯 Gastos Únicos</h3>
                        <p class="amount">$${uniqueExpenses.toFixed(2)}</p>
                        <p class="percentage">${(100 - recurringPercentage).toFixed(1)}% del total</p>
                    </div>
                </div>
                
                <div class="chart-section">
                    <canvas id="comparisonChart"></canvas>
                </div>
                
                <div class="analysis-section">
                    <h3>📊 Análisis</h3>
                    <div class="analysis-card">
                        ${recurringPercentage > 70 ? `
                            <p>⚠️ Tus gastos recurrentes representan más del 70% de tus gastos totales. 
                            Considera revisar tus suscripciones y servicios para optimizar costos.</p>
                        ` : recurringPercentage > 50 ? `
                            <p>✅ Tus gastos recurrentes están en un nivel moderado. 
                            Mantén un buen control sobre ellos.</p>
                        ` : `
                            <p>🎯 Tus gastos recurrentes están bajo control. 
                            La mayoría de tus gastos son flexibles y variables.</p>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        // Renderizar gráfico
        setTimeout(() => {
            const canvas = document.getElementById('comparisonChart');
            if (canvas && typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Recurrentes', 'Únicos'],
                        datasets: [{
                            label: 'Gastos ($)',
                            data: [recurringTotal, uniqueExpenses],
                            backgroundColor: ['#05bfdb', '#00d9ff'],
                            borderColor: ['#05bfdb', '#00d9ff'],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toFixed(2);
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    }
    
    // Cerrar menú FAB
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

function openAssistant() {
    const mainContent = document.getElementById('main-content');
    
    if (typeof AssistantModule !== 'undefined' && AssistantModule.render) {
        mainContent.innerHTML = AssistantModule.render();
        AssistantModule.initialize();
    } else {
        mainContent.innerHTML = `
            <div class="assistant-container">
                <div class="section-header">
                    <h1>🤖 Asistente Financiero</h1>
                    <button class="btn btn-secondary" onclick="handleTabChange('more')">
                        ← Volver
                    </button>
                </div>
                
                <div class="assistant-chat">
                    <div class="chat-messages" id="chat-messages">
                        <div class="message assistant">
                            <p>¡Hola! Soy tu asistente financiero virtual. ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    </div>
                    
                    <div class="chat-input-container">
                        <input type="text" id="chat-input" placeholder="Escribe tu pregunta...">
                        <button class="btn btn-primary" onclick="sendChatMessage()">
                            Enviar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Cerrar menú FAB
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

function openReports() {
    const mainContent = document.getElementById('main-content');
    
    if (typeof ReportsModule !== 'undefined' && ReportsModule.render) {
        mainContent.innerHTML = ReportsModule.render();
        ReportsModule.initialize();
    } else {
        mainContent.innerHTML = `
            <div class="reports-container">
                <div class="section-header">
                    <h1>📊 Reportes</h1>
                    <button class="btn btn-secondary" onclick="handleTabChange('more')">
                        ← Volver
                    </button>
                </div>
                
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <p>Módulo de reportes en desarrollo</p>
                </div>
            </div>
        `;
    }
    
    // Cerrar menú FAB
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

function openNotifications() {
    const mainContent = document.getElementById('main-content');
    
    if (typeof NotificationsModule !== 'undefined' && NotificationsModule.render) {
        mainContent.innerHTML = NotificationsModule.render();
    } else {
        mainContent.innerHTML = `
            <div class="notifications-container">
                <div class="section-header">
                    <h1>🔔 Notificaciones</h1>
                    <button class="btn btn-secondary" onclick="handleTabChange('more')">
                        ← Volver
                    </button>
                </div>
                
                <div class="empty-state">
                    <div class="empty-icon">🔔</div>
                    <p>No tienes notificaciones pendientes</p>
                </div>
            </div>
        `;
    }
    
    // Cerrar menú FAB
    const fabMenu = document.getElementById('fab-menu');
    if (fabMenu) fabMenu.style.display = 'none';
}

function openSettings() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
        <div class="settings-container">
            <div class="section-header">
                <h1>⚙️ Configuración</h1>
                <button class="btn btn-secondary" onclick="handleTabChange('more')">
                    ← Volver
                </button>
            </div>
            
            <div class="settings-groups">
                <div class="settings-group">
                    <h3>👤 Cuenta</h3>
                    <div class="setting-item">
                        <span>Email</span>
                        <span>${currentUser?.email || 'No disponible'}</span>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>🔔 Notificaciones</h3>
                    <div class="setting-item">
                        <span>Recordatorios de gastos</span>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <span>Alertas de presupuesto</span>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-group">
                    <h3>🎨 Apariencia</h3>
                    <div class="setting-item">
                        <span>Tema oscuro</span>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-group danger">
                    <button class="btn btn-danger btn-block" onclick="handleDeleteAccount()">
                        🗑️ Eliminar Cuenta
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function handleDeleteAccount() {
    if (!confirm('⚠️ ¿Estás seguro? Esta acción eliminará TODOS tus datos de forma permanente.')) return;
    if (!confirm('Esta es tu última oportunidad. ¿Realmente deseas eliminar tu cuenta?')) return;
    
    try {
        // Eliminar todos los datos del usuario
        const batch = db.batch();
        
        // Eliminar gastos
        const expensesSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('expenses')
            .get();
        expensesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Eliminar ingresos
        const incomeSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('income')
            .get();
        incomeSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Eliminar metas
        const goalsSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('goals')
            .get();
        goalsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Eliminar gastos recurrentes
        const recurringSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('recurringExpenses')
            .get();
        recurringSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Eliminar configuraciones
        const settingsSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('settings')
            .get();
        settingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        await batch.commit();
        
        // Eliminar cuenta de autenticación
        await currentUser.delete();
        
        console.log('✅ Cuenta eliminada');
        alert('Tu cuenta ha sido eliminada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al eliminar cuenta:', error);
        alert('Error al eliminar la cuenta: ' + error.message);
    }
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function formatDate(dateString) {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function formatMonth(monthString) {
    if (!monthString) return '';
    
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
}

function getCategoryIcon(category) {
    const icons = {
        'Alimentación': '🍔',
        'Transporte': '🚗',
        'Vivienda': '🏠',
        'Servicios': '💡',
        'Entretenimiento': '🎮',
        'Salud': '🏥',
        'Educación': '📚',
        'Compras': '🛍️',
        'Otros': '📦'
    };
    return icons[category] || '📦';
}

function handleBackFromMoreDetails() {
    handleTabChange('more');
}
// ========================================
// SMARTER INVESTMENT - APP.JS COMPLETO
// PARTE 3 DE 3 (FINAL)
// ========================================
// ⬆️ VIENE DE PARTE 2 DE 3
// ========================================

// ========================================
// FUNCIONES DE INICIALIZACIÓN
// ========================================

async function initializeApp() {
    console.log('🚀 Inicializando Smarter Investment...');
    
    // Verificar que Firebase esté inicializado
    if (!firebase.apps.length) {
        console.error('❌ Firebase no está inicializado');
        return;
    }
    
    console.log('✅ Firebase inicializado correctamente');
    
    // Configurar event listeners para formularios de autenticación
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Configurar botón FAB
    const fabButton = document.getElementById('fab-button');
    if (fabButton) {
        fabButton.addEventListener('click', toggleFabMenu);
    }
    
    // Configurar navegación inferior
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            if (tab) {
                handleTabChange(tab);
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Inicializar módulos externos si están disponibles
    if (typeof NotificationsModule !== 'undefined' && NotificationsModule.initialize) {
        console.log('✅ Inicializando NotificationsModule...');
        NotificationsModule.initialize();
    }
    
    if (typeof RecurringModule !== 'undefined' && RecurringModule.initialize) {
        console.log('✅ Inicializando RecurringModule...');
    }
    
    if (typeof ComparisonModule !== 'undefined' && ComparisonModule.initialize) {
        console.log('✅ Inicializando ComparisonModule...');
    }
    
    if (typeof AssistantModule !== 'undefined' && AssistantModule.initialize) {
        console.log('✅ Inicializando AssistantModule...');
    }
    
    if (typeof ReportsModule !== 'undefined' && ReportsModule.initialize) {
        console.log('✅ Inicializando ReportsModule...');
    }
    
    // Cargar Chart.js si no está disponible
    if (typeof Chart === 'undefined') {
        console.log('📊 Cargando Chart.js...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
        script.onload = () => {
            console.log('✅ Chart.js cargado correctamente');
        };
        script.onerror = () => {
            console.error('❌ Error al cargar Chart.js');
        };
        document.head.appendChild(script);
    }
    
    console.log('✅ Aplicación inicializada correctamente');
}

// ========================================
// FUNCIONES PARA GASTOS RECURRENTES
// ========================================

async function generateRecurringExpenses() {
    if (!currentUser) return;
    
    console.log('🔄 Generando gastos recurrentes automáticos...');
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    try {
        const recurringSnapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('recurringExpenses')
            .where('active', '==', true)
            .get();
        
        for (const doc of recurringSnapshot.docs) {
            const recurring = { id: doc.id, ...doc.data() };
            const lastGenerated = recurring.lastGenerated ? new Date(recurring.lastGenerated) : new Date(recurring.startDate);
            
            let shouldGenerate = false;
            let nextDate = new Date(lastGenerated);
            
            // Determinar si debe generar según la frecuencia
            switch (recurring.frequency) {
                case 'daily':
                    nextDate.setDate(nextDate.getDate() + 1);
                    shouldGenerate = nextDate <= today;
                    break;
                case 'weekly':
                    nextDate.setDate(nextDate.getDate() + 7);
                    shouldGenerate = nextDate <= today;
                    break;
                case 'biweekly':
                    nextDate.setDate(nextDate.getDate() + 14);
                    shouldGenerate = nextDate <= today;
                    break;
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    shouldGenerate = nextDate <= today;
                    break;
            }
            
            if (shouldGenerate) {
                // Crear el gasto automático
                const expense = {
                    amount: recurring.amount,
                    description: `${recurring.description} (Recurrente)`,
                    category: recurring.category,
                    date: todayString,
                    isRecurring: true,
                    recurringId: recurring.id,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                await db.collection('users')
                    .doc(currentUser.uid)
                    .collection('expenses')
                    .add(expense);
                
                // Actualizar fecha de última generación
                await db.collection('users')
                    .doc(currentUser.uid)
                    .collection('recurringExpenses')
                    .doc(recurring.id)
                    .update({
                        lastGenerated: todayString
                    });
                
                console.log(`✅ Gasto recurrente generado: ${recurring.description}`);
            }
        }
        
        // Recargar gastos
        await loadUserData();
        
    } catch (error) {
        console.error('❌ Error al generar gastos recurrentes:', error);
    }
}

// ========================================
// FUNCIONES PARA EL ASISTENTE AI
// ========================================

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario al chat
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(userMessage);
        
        // Limpiar input
        input.value = '';
        
        // Scroll al final
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simular respuesta del asistente
        setTimeout(() => {
            const assistantMessage = document.createElement('div');
            assistantMessage.className = 'message assistant';
            assistantMessage.innerHTML = `<p>Gracias por tu mensaje. Esta funcionalidad está en desarrollo. Pronto podrás chatear con nuestro asistente AI financiero.</p>`;
            chatMessages.appendChild(assistantMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
}

// ========================================
// FUNCIONES PARA REPORTES
// ========================================

function generateMonthlyReport() {
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    
    const monthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
    const monthIncome = income.filter(inc => inc.date.startsWith(currentMonth));
    
    const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);
    
    return {
        month: currentMonth,
        expenses: monthExpenses,
        income: monthIncome,
        totalExpenses,
        totalIncome,
        balance: totalIncome - totalExpenses
    };
}

// ========================================
// MANEJO DE CLICKS EN CATEGORÍAS
// ========================================

function handleCategoryClick(category) {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    
    if (categoryExpenses.length === 0) {
        alert('No hay gastos en esta categoría');
        return;
    }
    
    // Agrupar por mes
    const expensesByMonth = {};
    categoryExpenses.forEach(exp => {
        const month = exp.date.substring(0, 7);
        if (!expensesByMonth[month]) {
            expensesByMonth[month] = [];
        }
        expensesByMonth[month].push(exp);
    });
    
    const monthKeys = Object.keys(expensesByMonth).sort().reverse();
    
    // Crear modal con detalles
    const modalHTML = `
        <div id="category-detail-modal" class="modal" style="display: flex;">
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>${getCategoryIcon(category)} ${category}</h2>
                    <button class="btn-close" onclick="closeModal()">✕</button>
                </div>
                
                <div class="category-detail-body">
                    <div class="category-summary">
                        <div class="summary-item">
                            <span class="summary-label">Total gastado:</span>
                            <span class="summary-value">$${categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Número de transacciones:</span>
                            <span class="summary-value">${categoryExpenses.length}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Promedio por transacción:</span>
                            <span class="summary-value">$${(categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0) / categoryExpenses.length).toFixed(2)}</span>
                        </div>
                    </div>
                    
                    ${monthKeys.length > 0 ? `
                        <div class="monthly-comparison">
                            <h3>📊 Comparativo Mensual</h3>
                            <div class="chart-container">
                                <canvas id="categoryMonthlyChart"></canvas>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="expense-history">
                        <h3>📝 Historial de Gastos</h3>
                        <div class="expenses-list">
                            ${categoryExpenses.map(exp => `
                                <div class="expense-item">
                                    <div class="expense-details">
                                        <div class="expense-description">${exp.description || 'Sin descripción'}</div>
                                        <div class="expense-date">${formatDate(exp.date)}</div>
                                    </div>
                                    <div class="expense-amount">$${exp.amount.toFixed(2)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal anterior si existe
    const oldModal = document.getElementById('category-detail-modal');
    if (oldModal) {
        oldModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Renderizar gráfico mensual
    if (monthKeys.length > 0) {
        setTimeout(() => {
            const canvas = document.getElementById('categoryMonthlyChart');
            if (canvas && typeof Chart !== 'undefined') {
                const ctx = canvas.getContext('2d');
                
                const monthlyTotals = monthKeys.map(month => {
                    return expensesByMonth[month].reduce((sum, exp) => sum + exp.amount, 0);
                });
                
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: monthKeys.map(month => formatMonth(month)),
                        datasets: [{
                            label: 'Gastos',
                            data: monthlyTotals,
                            backgroundColor: 'rgba(5, 191, 219, 0.2)',
                            borderColor: '#05bfdb',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return '$' + context.parsed.y.toFixed(2);
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + value.toFixed(2);
                                    }
                                }
                            }
                        }
                    }
                });
            } else {
                console.log('❌ Chart.js no disponible - mostrando solo estadísticas');
            }
        }, 100);
    }
}

// ========================================
// LOGOUT
// ========================================

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        auth.signOut()
            .then(() => {
                console.log('✅ Sesión cerrada exitosamente');
                window.location.reload();
            })
            .catch((error) => {
                console.error('❌ Error al cerrar sesión:', error);
                alert('Error al cerrar sesión. Por favor, intenta de nuevo.');
            });
    }
}

// ========================================
// CHEQUEO AUTOMÁTICO DE GASTOS RECURRENTES
// ========================================

// Verificar gastos recurrentes cada hora
setInterval(() => {
    if (currentUser) {
        generateRecurringExpenses();
    }
}, 60 * 60 * 1000); // 1 hora

// Verificar al cargar la app
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (currentUser) {
            generateRecurringExpenses();
        }
    }, 5000); // 5 segundos después de cargar
});

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ========================================
// EXPONER FUNCIONES GLOBALES
// ========================================

// Funciones para modales
window.openExpenseModal = openExpenseModal;
window.openIncomeModal = openIncomeModal;
window.openGoalModal = openGoalModal;
window.closeModal = closeModal;

// Funciones para navegación
window.handleTabChange = handleTabChange;
window.handleBackFromMoreDetails = handleBackFromMoreDetails;

// Funciones CRUD
window.saveExpense = saveExpense;
window.deleteExpense = deleteExpense;
window.saveIncome = saveIncome;
window.saveGoal = saveGoal;
window.addToGoal = addToGoal;
window.deleteGoal = deleteGoal;
window.editBudgetLimit = editBudgetLimit;

// Funciones del menú FAB
window.toggleFabMenu = toggleFabMenu;
window.openComparison = openComparison;
window.openAssistant = openAssistant;
window.openReports = openReports;
window.openNotifications = openNotifications;
window.openSettings = openSettings;

// Funciones de autenticación
window.switchAuthMode = switchAuthMode;
window.handleLogout = handleLogout;
window.handleDeleteAccount = handleDeleteAccount;

// Funciones auxiliares
window.handleCategoryClick = handleCategoryClick;
window.sendChatMessage = sendChatMessage;

// ========================================
// 🏁 FIN DEL ARCHIVO APP.JS
// ========================================

console.log('✅ app.js cargado completamente - Smarter Investment v2.0');
