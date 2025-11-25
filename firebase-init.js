// Firebase Configuration
// Configuración de tu proyecto Smarter Investment
const firebaseConfig = {
    apiKey: "AIzaSyBxOHfgTdRfOU4i-D7aMnJ2cAk6LrT6Tbk",
    authDomain: "smarter-investment-777f5.firebaseapp.com",
    projectId: "smarter-investment-777f5",
    storageBucket: "smarter-investment-777f5.appspot.com",
    messagingSenderId: "562663698989",
    appId: "1:562663698989:web:a64e1e5a3f8e0c8e1f3e0c",
    measurementId: "G-YOUR_MEASUREMENT_ID"  // Opcional
};

// Initialize Firebase
try {
    // Verificar que Firebase está disponible
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK no está cargado. Verifica que index.html incluye los scripts de Firebase.');
        throw new Error('Firebase SDK not loaded');
    }

    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Verificar que se inicializó correctamente
    const app = firebase.app();
    console.log('✅ Firebase initialized successfully');
    console.log('📌 Project ID:', firebaseConfig.projectId);
    console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
    
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    
    // Mostrar error en la página
    document.addEventListener('DOMContentLoaded', () => {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                    <h1 style="color: #ff6b6b; margin-bottom: 20px;">❌ Error de Firebase</h1>
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 10px; max-width: 600px;">
                        <p style="color: white; margin-bottom: 20px;">
                            ${error.message}
                        </p>
                        <details style="text-align: left; margin-top: 20px;">
                            <summary style="cursor: pointer; color: #05BFDB;">Ver detalles del error</summary>
                            <pre style="color: rgba(255, 255, 255, 0.7); margin-top: 10px; overflow-x: auto;">${error.stack}</pre>
                        </details>
                    </div>
                </div>
            `;
        }
    });
}
