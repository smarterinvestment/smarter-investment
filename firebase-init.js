// ========================================
// 🔥 FIREBASE INITIALIZATION - SAFE VERSION
// ========================================
// Este archivo verifica si Firebase ya está configurado antes de inicializar

(function() {
    'use strict';
    
    // Verificar si ya existe firebaseConfig (evita error de duplicación)
    if (typeof window.firebaseConfigLoaded !== 'undefined' && window.firebaseConfigLoaded) {
        console.log('⚠️ Firebase ya fue inicializado, saltando...');
        return;
    }
    
    // Marcar como cargado
    window.firebaseConfigLoaded = true;
    
    // Configuración de Firebase
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
        // Verificar que Firebase SDK está disponible
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK no está cargado. Verifica los scripts en index.html.');
        }

        // Verificar si Firebase ya fue inicializado
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('✅ Firebase ya estaba inicializado');
            return;
        }

        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        
        console.log('✅ Firebase initialized successfully');
        console.log('📌 Project ID:', firebaseConfig.projectId);
        console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
        
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        
        // Mostrar error en la página solo si es crítico
        if (error.message.includes('SDK')) {
            document.addEventListener('DOMContentLoaded', () => {
                const appElement = document.getElementById('app');
                if (appElement) {
                    appElement.innerHTML = `
                        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; background: #0a0a0a;">
                            <h1 style="color: #ff6b6b; margin-bottom: 20px;">❌ Error de Firebase</h1>
                            <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 10px; max-width: 600px;">
                                <p style="color: white; margin-bottom: 20px;">${error.message}</p>
                                <button onclick="location.reload()" style="background: #05BFDB; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                                    🔄 Recargar página
                                </button>
                            </div>
                        </div>
                    `;
                }
            });
        }
    }
})();
