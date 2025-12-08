// ========================================
// ⚙️ CONFIG.JS - Variables de Estado Global
// ========================================

// Firebase References (se inicializan después de firebase-init.js)
let auth = null;
let db = null;

// Estado del Usuario
let currentUser = null;
let isInitialized = false;
let currentView = 'login';
let activeTab = 'dashboard';

// Datos Financieros
let expenses = [];
let incomeHistory = [];
let goals = [];
let income = { salary: 0, freelance: 0, investments: 0 };
let budgets = {
    'Gastos Esenciales': 0,
    'Gastos Discrecionales': 0,
    'Deudas': 0,
    'Ahorros': 0,
    'Inversiones': 0
};

// Referencias de Charts
let expenseChart = null;
let categoryChart = null;
let descriptionChart = null;
let incomeChart = null;
let savingsRateChart = null;

// Estado del Tutorial
let tutorialActive = false;
let tutorialStep = 0;
let tutorialCompleted = false;

// Módulos externos
let assistantModule = null;
let notificationsModule = null;
let recurringModule = null;
let reportsModule = null;
let comparisonModule = null;

// Constantes
const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const categorias = [
    { name: 'Gastos Esenciales', emoji: '🏠', color: '#ef4444', subcats: ['Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Salud', 'Seguros'] },
    { name: 'Gastos Discrecionales', emoji: '🎮', color: '#f97316', subcats: ['Entretenimiento', 'Restaurantes', 'Compras', 'Viajes', 'Suscripciones', 'Hobbies'] },
    { name: 'Deudas', emoji: '💳', color: '#eab308', subcats: ['Tarjetas de crédito', 'Préstamos', 'Hipoteca', 'Auto', 'Estudios', 'Otros'] },
    { name: 'Ahorros', emoji: '🐷', color: '#22c55e', subcats: ['Emergencia', 'Vacaciones', 'Compra grande', 'Retiro', 'Educación', 'Otros'] },
    { name: 'Inversiones', emoji: '📈', color: '#3b82f6', subcats: ['Acciones', 'Fondos', 'Cripto', 'Bienes raíces', 'Negocio', 'Otros'] }
];

// Función para inicializar Firebase refs
function initFirebaseRefs() {
    if (typeof firebase !== 'undefined') {
        auth = firebase.auth();
        db = firebase.firestore();
        console.log('✅ Firebase refs inicializados en config.js');
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initFirebaseRefs);

console.log('✅ config.js cargado');
