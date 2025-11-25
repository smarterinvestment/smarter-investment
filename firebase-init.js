// Firebase Configuration
// IMPORTANTE: Reemplazar estos valores con los de tu proyecto real en Firebase Console

const firebaseConfig = {
    // ⚠️ ESTOS SON VALORES DE EJEMPLO - NO FUNCIONARÁN
    // Ve a https://console.firebase.google.com
    // Selecciona tu proyecto y copia la configuración real
    
    apiKey: "AIzaSyBxOHfgTdRfOU4i-D7aMnJ2cAk6LrT6Tbk",
    authDomain: "smarter-investment.firebaseapp.com",
    projectId: "smarter-investment",
    storageBucket: "smarter-investment.firebasestorage.app",
    messagingSenderId: "1037439323005",
    appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14"
};

// Verificar si la configuración está completa
if (firebaseConfig.apiKey === "    apiKey: "AIzaSyBxOHfgTdRfOU4i-D7aMnJ2cAk6LrT6Tbk",
") {
    console.error('❌ FIREBASE NO CONFIGURADO: Debes agregar las credenciales reales de Firebase');
    
    // Mostrar mensaje de error en la página
    document.addEventListener('DOMContentLoaded', () => {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                    <h1 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Configuración Pendiente</h1>
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 10px; max-width: 600px;">
                        <h2 style="color: white; margin-bottom: 20px;">Firebase no está configurado</h2>
                        <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px;">
                            Para usar esta aplicación, necesitas configurar Firebase con tus credenciales.
                        </p>
                        <ol style="text-align: left; color: rgba(255, 255, 255, 0.8); line-height: 1.8;">
                            <li>Ve a <a href="https://console.firebase.google.com" target="_blank" style="color: #05BFDB;">Firebase Console</a></li>
                            <li>Selecciona tu proyecto (o crea uno nuevo)</li>
                            <li>Ve a Configuración del proyecto > General</li>
                            <li>En "Tus aplicaciones", busca la configuración de tu app web</li>
                            <li>Copia toda la configuración</li>
                            <li>Reemplaza los valores en el archivo <code>firebase-init.js</code></li>
                        </ol>
                        <p style="color: #ffa500; margin-top: 20px;">
                            <strong>Nota:</strong> Sin estas credenciales, la aplicación no puede funcionar.
                        </p>
                    </div>
                </div>
            `;
        }
    });
} else {
    // Initialize Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
        console.log('📌 Project:', firebaseConfig.projectId);
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        
        // Si hay error, mostrar mensaje
        document.addEventListener('DOMContentLoaded', () => {
            const app = document.getElementById('app');
            if (app && error.code === 'auth/api-key-not-valid') {
                app.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
                        <h1 style="color: #ff6b6b;">❌ Error de Configuración</h1>
                        <p style="color: white; margin: 20px;">La API Key de Firebase no es válida</p>
                        <p style="color: rgba(255, 255, 255, 0.7);">Verifica que has copiado correctamente las credenciales de Firebase Console</p>
                    </div>
                `;
            }
        });
    }
}