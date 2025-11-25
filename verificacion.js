// 🔍 SCRIPT DE VERIFICACIÓN - Ejecutar en la consola del navegador

console.log('=== VERIFICACIÓN DE FIREBASE ===');

// 1. Verificar si Firebase está cargado
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase SDK está cargado');
    console.log('   Versión:', firebase.SDK_VERSION || 'No disponible');
} else {
    console.error('❌ Firebase SDK NO está cargado');
}

// 2. Verificar configuración
if (typeof firebaseConfig !== 'undefined') {
    console.log('✅ firebaseConfig está definido');
    console.log('   Proyecto:', firebaseConfig.projectId);
    console.log('   API Key:', firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'NO DEFINIDA');
} else {
    console.error('❌ firebaseConfig NO está definido');
}

// 3. Verificar inicialización
try {
    const app = firebase.app();
    console.log('✅ Firebase App inicializada');
    console.log('   Nombre:', app.name);
} catch (error) {
    console.error('❌ Firebase App NO inicializada:', error.message);
}

// 4. Verificar Auth
try {
    const auth = firebase.auth();
    console.log('✅ Firebase Auth disponible');
} catch (error) {
    console.error('❌ Firebase Auth NO disponible:', error.message);
}

// 5. Verificar Firestore
try {
    const db = firebase.firestore();
    console.log('✅ Firebase Firestore disponible');
} catch (error) {
    console.error('❌ Firebase Firestore NO disponible:', error.message);
}

// 6. Verificar variables globales
console.log('\n=== VARIABLES GLOBALES ===');
console.log('auth:', typeof auth !== 'undefined' ? '✅ Definida' : '❌ No definida');
console.log('db:', typeof db !== 'undefined' ? '✅ Definida' : '❌ No definida');
console.log('currentUser:', typeof currentUser !== 'undefined' ? '✅ Definida' : '❌ No definida');

// 7. Verificar módulos
console.log('\n=== MÓDULOS ===');
const modules = [
    'VirtualAssistantModule',
    'RecurringExpensesModule',
    'NotificationsModule',
    'ReportsModule',
    'ComparisonModule'
];

modules.forEach(module => {
    console.log(`${module}:`, typeof window[module] !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
});

console.log('\n=== FIN DE VERIFICACIÓN ===');
