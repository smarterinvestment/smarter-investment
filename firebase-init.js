// ========================================
// 🔥 FIREBASE INITIALIZATION - SAFE VERSION
// ========================================

(function() {
    'use strict';
    
    // Evitar inicialización duplicada
    if (window.firebaseInitialized) {
        console.log('⚠️ Firebase ya inicializado, saltando...');
        return;
    }
    
    const firebaseConfig = {
        apiKey: "AIzaSyBT3UJTHLuBQaB9kK0539-acw8ertf__vY",
        authDomain: "smarter-investment.firebaseapp.com",
        projectId: "smarter-investment",
        storageBucket: "smarter-investment.firebasestorage.app",
        messagingSenderId: "1037439323005",
        appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
        measurementId: "G-DQKR8KNV2V"
    };

    try {
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK no está cargado');
        }

        // Verificar si ya está inicializado
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('✅ Firebase ya estaba inicializado');
            window.firebaseInitialized = true;
            return;
        }

        firebase.initializeApp(firebaseConfig);
        window.firebaseInitialized = true;
        
        console.log('✅ Firebase initialized successfully');
        console.log('📌 Project ID:', firebaseConfig.projectId);
        console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
    }
})();
