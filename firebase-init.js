// ========================================
// INICIALIZACIÓN DE FIREBASE
// ========================================
// Este archivo debe cargarse ANTES de app.js

const firebaseConfig = {
    apiKey: "AIzaSyDin7k-QD5GwLHtRyDkHkiC7rJECYKTRfA",
    authDomain: "smarter-investment-3f1b9.firebaseapp.com",
    projectId: "smarter-investment-3f1b9",
    storageBucket: "smarter-investment-3f1b9.firebasestorage.app",
    messagingSenderId: "844701782931",
    appId: "1:844701782931:web:1763197516a90e6fe67d"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    // Si ya está inicializado, solo mostrar mensaje
    if (error.code === 'app/duplicate-app') {
        console.log('⚠️ Firebase ya estaba inicializado');
    } else {
        console.error('❌ Error al inicializar Firebase:', error);
    }
}
