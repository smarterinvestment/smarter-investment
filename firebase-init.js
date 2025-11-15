// ========================================
// INICIALIZACIÓN DE FIREBASE
// ========================================
// Este archivo debe cargarse ANTES de app.js

const firebaseConfig = {
    apiKey: "AIzaSyBT3UJTHLuBQaB9kK0539-acw8ertf__vY",
    authDomain: "smarter-investment.firebaseapp.com",
    projectId: "smarter-investment",
    storageBucket: "smarter-investment.firebasestorage.app",
    messagingSenderId: "1037439323005",
    appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
    measurementId: "G-DQKR8KNV2V"
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
