// ========================================
// ⚙️ CONFIG.JS - Variables de Estado Global
// ========================================
// NOTA: auth y db se declaran en app.js, no aquí para evitar duplicación

// Estado del Usuario
var currentUser = null;
var isInitialized = false;
var currentView = 'login';
var activeTab = 'dashboard';

// Datos Financieros
var expenses = [];
var incomeHistory = [];
var goals = [];
var income = { salary: 0, freelance: 0, investments: 0 };
var budgets = {
    'Gastos Esenciales': 0,
    'Gastos Discrecionales': 0,
    'Deudas': 0,
    'Ahorros': 0,
    'Inversiones': 0
};

// Referencias de Charts
var expenseChart = null;
var categoryChart = null;
var descriptionChart = null;
var incomeChart = null;
var savingsRateChart = null;

// Estado del Tutorial
var tutorialActive = false;
var tutorialStep = 0;
var tutorialCompleted = false;

// Módulos externos
var assistantModule = null;
var notificationsModule = null;
var recurringModule = null;
var reportsModule = null;
var comparisonModule = null;

// Constantes - usar var para evitar redeclaración
if (typeof monthNames === 'undefined') {
    var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
}

if (typeof categorias === 'undefined') {
    var categorias = [
        { name: 'Gastos Esenciales', emoji: '🏠', color: '#ef4444', subcats: ['Vivienda', 'Alimentación', 'Transporte', 'Servicios', 'Salud', 'Seguros'] },
        { name: 'Gastos Discrecionales', emoji: '🎮', color: '#f97316', subcats: ['Entretenimiento', 'Restaurantes', 'Compras', 'Viajes', 'Suscripciones', 'Hobbies'] },
        { name: 'Deudas', emoji: '💳', color: '#eab308', subcats: ['Tarjetas de crédito', 'Préstamos', 'Hipoteca', 'Auto', 'Estudios', 'Otros'] },
        { name: 'Ahorros', emoji: '🐷', color: '#22c55e', subcats: ['Emergencia', 'Vacaciones', 'Compra grande', 'Retiro', 'Educación', 'Otros'] },
        { name: 'Inversiones', emoji: '📈', color: '#3b82f6', subcats: ['Acciones', 'Fondos', 'Cripto', 'Bienes raíces', 'Negocio', 'Otros'] }
    ];
}

console.log('✅ config.js cargado');
