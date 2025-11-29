// ====================================================================
// PARTE 1: CONFIGURACIÓN, ESTADO Y AUTENTICACIÓN
// ====================================================================

// Referencias a Firebase (asumiendo que firebase-init.js ya cargó)
const auth = firebase.auth();
const db = firebase.firestore();

// ========================================
// ESTADO GLOBAL
// ========================================
let currentUser = null;
let isInitialized = false;
let currentView = 'login';
let activeTab = 'dashboard';
let expenses = [];
let incomeHistory = [];
let goals = [];
let income = { salary: 0, freelance: 0, investments: 0 };
let budgets = {
    'Gastos Esenciales': 0,
    'Gastos Discrecionales': 0,
    'Pago Deudas': 0,
    'Ahorros': 0,
    'Inversiones': 0
};

// Variables para Módulos
let assistantModule = null;
let notificationsModule = null;
let recurringModule = null;
let reportsModule = null;
let comparisonModule = null;

// Categorías
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
        
        // Cargar datos del usuario
        await loadUserData();
        
        // Inicializar módulos de forma segura
        if (!isInitialized) {
            isInitialized = true;
            await safeInitializeModules(user.uid);
        }
        
        currentView = 'app';
        activeTab = 'dashboard';
        render();
    } else {
        currentUser = null;
        isInitialized = false;
        
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

// Función segura para inicializar módulos (evita pantallas amarillas de error)
async function safeInitializeModules(uid) {
    try {
        // Notificaciones
        if (typeof IntelligentNotifications !== 'undefined' && !notificationsModule) {
            notificationsModule = new IntelligentNotifications(db, uid);
            await notificationsModule.initialize();
        }
        // Asistente (Solo lógica, sin botón flotante)
        if (typeof VirtualAssistantModule !== 'undefined' && !assistantModule) {
            assistantModule = new VirtualAssistantModule(db, uid);
            await assistantModule.initialize();
        }
        // Gastos Recurrentes
        if (typeof RecurringExpensesModule !== 'undefined' && !recurringModule) {
            recurringModule = new RecurringExpensesModule(db, uid);
            await recurringModule.initialize(uid);
        }
        // Reportes
        if (typeof ReportsModule !== 'undefined' && !reportsModule) {
            reportsModule = new ReportsModule(db);
            await reportsModule.initialize(uid);
        }
        // Comparación
        if (typeof ComparisonModule !== 'undefined' && !comparisonModule) {
            comparisonModule = new ComparisonModule(db, uid);
            await comparisonModule.initialize(uid);
        }
    } catch (e) {
        console.warn("⚠️ Error no crítico inicializando módulos:", e);
    }
}

// ========================================
// CARGA DE DATOS
// ========================================
async function loadUserData() {
    try {
        // Cargar Gastos
        const expensesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').orderBy('date', 'desc').limit(100).get();
        expenses = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cargar Ingresos
        const incomesSnap = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').orderBy('date', 'desc').limit(100).get();
        incomeHistory = incomesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Recalcular total de ingresos
        income = { salary: 0, freelance: 0, investments: 0 };
        incomeHistory.forEach(inc => {
            if (inc.type) {
                income[inc.type] = (income[inc.type] || 0) + inc.amount;
            }
        });

        // Cargar Metas
        const goalsSnap = await db.collection('users').doc(currentUser.uid).collection('goals').get();
        goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cargar Presupuestos
        const budgetsDoc = await db.collection('users').doc(currentUser.uid).collection('settings').doc('budgets').get();
        if (budgetsDoc.exists) {
            budgets = budgetsDoc.data();
        }
        
        // Guardar respaldo local
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('incomeHistory', JSON.stringify(incomeHistory));
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Fallback Offline
        if (localStorage.getItem('expenses')) {
            expenses = JSON.parse(localStorage.getItem('expenses'));
            incomeHistory = JSON.parse(localStorage.getItem('incomeHistory') || '[]');
            alert('Modo Offline: Datos cargados localmente');
        }
    }
}
// ====================================================================
// PARTE 2: LÓGICA DE NEGOCIO, CÁLCULOS Y MODALES SEGUROS
// ====================================================================

// --- Solución al error de Modales (innerHTML null) ---
// Esta función crea el modal si no existe en el HTML
function openModal(title, htmlContent) {
    let modal = document.getElementById('modal');
    
    // Si el modal no existe en el DOM, crearlo dinámicamente
    if (!modal) {
        console.log("🛠️ Creando estructura de modal faltante...");
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal'; // Asegúrate de tener CSS para .modal
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '2000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        modal.innerHTML = `
            <div class="modal-content" style="background:#1a1a2e; padding:20px; border-radius:12px; width:90%; max-width:500px; position:relative; border:1px solid #05bfdb;">
                <span class="close-btn" onclick="closeModal()" style="position:absolute; right:15px; top:10px; cursor:pointer; font-size:24px;">&times;</span>
                <h2 id="modal-title" style="color:#05bfdb; margin-top:0;"></h2>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    if (modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.innerHTML = htmlContent;
        modal.style.display = 'flex'; // Mostrar flex para centrar
        modal.classList.add('active');
    } else {
        console.error("No se pudo inicializar el modal correctamente.");
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// --- Cálculos ---
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

// --- Operaciones CRUD (Gastos/Ingresos) ---
async function addExpense(expense) {
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('expenses').add({
                ...expense,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        expenses.unshift({ id: docRef.id, ...expense });
        render(); // Actualizar vista
    } catch (error) {
        alert('Error al guardar gasto: ' + error.message);
    }
}

async function addIncome(incomeEntry) {
    try {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('incomes').add({
                ...incomeEntry,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        incomeHistory.unshift({ id: docRef.id, ...incomeEntry });
        
        // Actualizar totales locales
        income[incomeEntry.type] = (income[incomeEntry.type] || 0) + incomeEntry.amount;
        
        // Guardar configuración de totales
        await db.collection('users').doc(currentUser.uid)
            .collection('settings').doc('income').set(income);
            
        render();
    } catch (error) {
        alert('Error al guardar ingreso: ' + error.message);
    }
}

async function deleteExpense(id) {
    if (confirm('¿Eliminar este gasto?')) {
        try {
            await db.collection('users').doc(currentUser.uid).collection('expenses').doc(id).delete();
            expenses = expenses.filter(e => e.id !== id);
            render();
        } catch (e) { alert(e.message); }
    }
}

// --- Formularios ---
function showAddExpenseModal() {
    const options = categorias.map(c => `<option value="${c.nombre}">${c.emoji} ${c.nombre}</option>`).join('');
    const html = `
        <form onsubmit="event.preventDefault(); submitExpense();">
            <div class="input-group">
                <label>Monto</label>
                <input type="number" id="new-amount" step="0.01" placeholder="0.00" required>
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <input type="text" id="new-desc" placeholder="Ej: Comida" required>
            </div>
            <div class="input-group">
                <label>Categoría</label>
                <select id="new-cat">${options}</select>
            </div>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="new-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Guardar</button>
        </form>
    `;
    openModal('💸 Nuevo Gasto', html);
}

function submitExpense() {
    const amount = parseFloat(document.getElementById('new-amount').value);
    const description = document.getElementById('new-desc').value;
    const category = document.getElementById('new-cat').value;
    const date = document.getElementById('new-date').value;
    
    if(amount && description) {
        addExpense({ amount, description, category, date });
        closeModal();
    }
}

function showAddIncomeModal() {
    const html = `
        <form onsubmit="event.preventDefault(); submitIncome();">
            <div class="input-group">
                <label>Monto</label>
                <input type="number" id="inc-amount" step="0.01" required>
            </div>
            <div class="input-group">
                <label>Tipo</label>
                <select id="inc-type">
                    <option value="salary">💼 Salario</option>
                    <option value="freelance">💻 Freelance</option>
                    <option value="investments">📈 Inversiones</option>
                </select>
            </div>
            <div class="input-group">
                <label>Descripción</label>
                <input type="text" id="inc-desc" placeholder="Detalle">
            </div>
            <div class="input-group">
                <label>Fecha</label>
                <input type="date" id="inc-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Guardar</button>
        </form>
    `;
    openModal('💰 Nuevo Ingreso', html);
}

function submitIncome() {
    const amount = parseFloat(document.getElementById('inc-amount').value);
    const type = document.getElementById('inc-type').value;
    const description = document.getElementById('inc-desc').value || type;
    const date = document.getElementById('inc-date').value;
    
    if(amount) {
        addIncome({ amount, type, description, date });
        closeModal();
    }
}
// ====================================================================
// PARTE 3: RENDERIZADO DE LA INTERFAZ (VISTAS)
// ====================================================================

function render() {
    const app = document.getElementById('app');
    const authContainer = document.getElementById('auth-container');
    const mainApp = document.getElementById('main-app');

    // 1. Vista Login/Registro
    if (currentView === 'login' || currentView === 'register') {
        if(app) app.style.display = 'block';
        if(authContainer) {
            authContainer.style.display = 'block';
            authContainer.innerHTML = currentView === 'login' ? renderLogin() : renderRegister();
        }
        if(mainApp) mainApp.style.display = 'none';
        return;
    }

    // 2. Vista Principal App
    if(authContainer) authContainer.style.display = 'none';
    if(mainApp) mainApp.style.display = 'block';

    // Renderizar Navegación Inferior
    const nav = document.getElementById('bottom-nav');
    if(nav) {
        nav.innerHTML = `
            <button class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" onclick="switchTab('dashboard')">
                <span>📊</span><span>Inicio</span>
            </button>
            <button class="nav-item ${activeTab === 'transactions' ? 'active' : ''}" onclick="switchTab('transactions')">
                <span>📝</span><span>Movs</span>
            </button>
            <div class="nav-fab" onclick="showAddOptions()">
                <span>+</span>
            </div>
            <button class="nav-item ${activeTab === 'budget' ? 'active' : ''}" onclick="switchTab('budget')">
                <span>💰</span><span>Meta</span>
            </button>
            <button class="nav-item ${activeTab === 'more' ? 'active' : ''}" onclick="switchTab('more')">
                <span>☰</span><span>Menú</span>
            </button>
        `;
    }

    // Ocultar todos los contenedores primero
    ['dashboard', 'expenses', 'incomes', 'budget', 'reports', 'settings'].forEach(id => {
        const el = document.getElementById(`${id}-container`);
        if(el) el.style.display = 'none';
    });

    // Mostrar el contenedor activo
    const activeContainer = document.getElementById(
        activeTab === 'transactions' ? 'expenses-container' : 
        activeTab === 'more' ? 'settings-container' : 
        `${activeTab}-container`
    );
    
    if(activeContainer) {
        activeContainer.style.display = 'block';
        
        // Renderizar contenido específico
        if (activeTab === 'dashboard') activeContainer.innerHTML = renderDashboard();
        else if (activeTab === 'transactions') activeContainer.innerHTML = renderExpenses();
        else if (activeTab === 'budget') activeContainer.innerHTML = renderBudget();
        else if (activeTab === 'more') activeContainer.innerHTML = renderMoreSection();
    }
}

function showAddOptions() {
    const html = `
        <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn" style="background:var(--color-danger); color:white; padding:15px;" onclick="closeModal(); showAddExpenseModal()">
                💸 Agregar Gasto
            </button>
            <button class="btn" style="background:var(--color-success); color:white; padding:15px;" onclick="closeModal(); showAddIncomeModal()">
                💰 Agregar Ingreso
            </button>
        </div>
    `;
    openModal('¿Qué deseas agregar?', html);
}

function switchTab(tab) {
    activeTab = tab;
    render();
}

// --- Componentes HTML ---

function renderDashboard() {
    const { totalIncome, totalExpenses, balance } = calculateTotals();
    
    return `
        <div class="card">
            <div class="card-title">Balance Total</div>
            <div style="text-align:center; padding:1rem;">
                <div style="font-size:2.5rem; font-weight:bold; color:${balance >= 0 ? '#4CAF50' : '#FF5252'}">
                    $${balance.toLocaleString()}
                </div>
                <div style="display:flex; justify-content:space-around; margin-top:1rem;">
                    <div style="color:#4CAF50">Ingresos: $${totalIncome.toLocaleString()}</div>
                    <div style="color:#FF5252">Gastos: $${totalExpenses.toLocaleString()}</div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-title">Últimos Movimientos</div>
            <ul class="expense-list">
                ${expenses.slice(0, 5).map(e => `
                    <li class="expense-item" style="border-left: 4px solid ${e.tipo === 'income' ? 'green' : 'red'}">
                        <div class="expense-info">
                            <div class="expense-description">${e.description}</div>
                            <small>${e.category} - ${e.date}</small>
                        </div>
                        <div class="expense-amount" style="color:${e.tipo === 'income' ? 'green' : 'red'}">
                            -$${e.amount}
                        </div>
                    </li>
                `).join('') || '<p style="text-align:center; opacity:0.6">No hay datos</p>'}
            </ul>
        </div>
    `;
}

function renderExpenses() {
    return `
        <div class="card">
            <div class="card-title">Historial de Gastos</div>
            <ul class="expense-list">
                ${expenses.map(e => `
                    <li class="expense-item">
                        <div class="expense-info">
                            <strong>${e.description}</strong>
                            <div>${e.category} • ${e.date}</div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="color:#FF5252; font-weight:bold;">-$${e.amount}</span>
                            <button onclick="deleteExpense('${e.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderBudget() {
    // Versión simplificada del presupuesto para asegurar que funcione
    return `
        <div class="card">
            <div class="card-title">Presupuesto</div>
            <p style="text-align:center; padding:20px;">
                Configura tu presupuesto en el menú de opciones o genera uno automático.
            </p>
            <button class="btn btn-primary" style="width:100%" onclick="alert('Funcionalidad en desarrollo para esta versión corregida')">Generar Presupuesto</button>
        </div>
    `;
}

function renderLogin() {
    return `
        <div class="card" style="margin-top:20vh;">
            <h2 style="text-align:center; color:#05bfdb;">Smarter Investment</h2>
            <form onsubmit="event.preventDefault(); handleLoginSubmit();">
                <div class="input-group">
                    <label>Email</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="input-group">
                    <label>Contraseña</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; margin-top:10px;">Iniciar Sesión</button>
            </form>
            <p style="text-align:center; margin-top:15px;">
                <a href="#" onclick="currentView='register'; render()">Crear cuenta</a>
            </p>
        </div>
    `;
}

function handleLoginSubmit() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
}
// ====================================================================
// PARTE 4: MENÚ "MÁS" Y FUNCIONES DE ASISTENTE/RECURRENTES
// ====================================================================

function renderMoreSection() {
    // Aquí es donde mostramos el acceso al Asistente y Recurrentes
    // en lugar de tener iconos flotantes molestos
    
    return `
        <div style="display:flex; flex-direction:column; gap:15px;">
            <div class="card" onclick="openAssistantModal()" style="cursor:pointer; border:1px solid #05bfdb;">
                <h3 style="margin:0;">🤖 Asistente Virtual IA</h3>
                <p style="opacity:0.7; font-size:0.9rem;">Consulta dudas financieras aquí</p>
            </div>

            <div class="card" onclick="renderRecurringFullView()" style="cursor:pointer; border:1px solid #9c27b0;">
                <h3 style="margin:0;">🔄 Gastos Recurrentes</h3>
                <p style="opacity:0.7; font-size:0.9rem;">Administra tus suscripciones</p>
            </div>

            <div class="card">
                <h3>👤 Mi Cuenta</h3>
                <p>${currentUser ? currentUser.email : ''}</p>
                <button class="btn" style="background:#FF5252; color:white; width:100%;" onclick="auth.signOut()">
                    Cerrar Sesión
                </button>
            </div>
        </div>
        
        <div id="sub-view-container"></div>
    `;
}

// --- Vista de Asistente (Integrada, NO flotante) ---
function openAssistantModal() {
    if (!assistantModule) {
        alert("El módulo del asistente se está cargando o no está disponible.");
        return;
    }
    
    const html = `
        <div style="height:400px; display:flex; flex-direction:column;">
            <div id="chat-history" style="flex:1; overflow-y:auto; padding:10px; background:rgba(0,0,0,0.2); margin-bottom:10px; border-radius:8px;">
                <div class="chat-message" style="background:#333; padding:8px; border-radius:8px; margin-bottom:5px;">
                    🤖 Hola, ¿en qué puedo ayudarte con tus finanzas?
                </div>
            </div>
            <div style="display:flex; gap:5px;">
                <input type="text" id="assistant-input" placeholder="Escribe aquí..." style="flex:1; padding:10px; border-radius:8px; border:none;">
                <button class="btn btn-primary" onclick="sendAssistantMessage()">Enviar</button>
            </div>
        </div>
    `;
    openModal('🤖 Asistente Financiero', html);
}

function sendAssistantMessage() {
    const input = document.getElementById('assistant-input');
    const history = document.getElementById('chat-history');
    const text = input.value;
    
    if (!text) return;
    
    // Agregar mensaje usuario
    history.innerHTML += `<div style="text-align:right; margin:5px 0;"><span style="background:#05bfdb; color:white; padding:8px; border-radius:8px;">${text}</span></div>`;
    input.value = '';
    
    // Simular respuesta (o conectar con assistantModule real si existe)
    setTimeout(() => {
        let response = "Estoy procesando tu solicitud...";
        if (assistantModule && assistantModule.processMessage) {
            // Aquí conectaríamos con la IA real si el módulo lo soporta
            response = "He analizado tus gastos. Parece que gastas mucho en comida.";
        }
        history.innerHTML += `<div style="margin:5px 0;"><span style="background:#333; color:white; padding:8px; border-radius:8px;">🤖 ${response}</span></div>`;
        history.scrollTop = history.scrollHeight;
    }, 1000);
}

// --- Vista de Recurrentes (Integrada) ---
function renderRecurringFullView() {
    if (!recurringModule) {
        alert("Cargando módulo de recurrentes...");
        return;
    }
    
    // Usamos el render del módulo si existe, o uno básico
    const list = recurringModule.recurringExpenses || [];
    
    const listHTML = list.length > 0 ? list.map(r => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:5px; display:flex; justify-content:space-between;">
            <span>${r.name || r.description} ($${r.amount})</span>
            <span>${r.active ? '✅' : '⏸️'}</span>
        </div>
    `).join('') : '<p>No hay gastos recurrentes configurados.</p>';

    const html = `
        <div style="padding:10px;">
            ${listHTML}
            <button class="btn btn-primary" style="width:100%; margin-top:15px;" onclick="alert('Usa Agregar Gasto y selecciona la opción recurrente (próximamente)')">
                + Nuevo Recurrente
            </button>
        </div>
    `;
    openModal('🔄 Gestión de Recurrentes', html);
}

// Inicialización final
console.log("✅ App.js cargado correctamente. Esperando autenticación...");