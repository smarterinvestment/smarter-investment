// ========================================
// 🔐 AUTH.JS - Autenticación
// ========================================

// Registro de usuario
async function handleRegister(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;
        
        // Crear documento inicial del usuario
        await db.collection('users').doc(uid).set({
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            tutorialCompleted: false
        });
        
        currentUser = userCredential.user;
        currentView = 'app';
        render();
        showToast('¡Cuenta creada exitosamente!', 'success');
    } catch (error) {
        console.error('Error en registro:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
    }
}

// Login de usuario
async function handleLogin(email, password) {
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('¡Bienvenido de nuevo!', 'success');
    } catch (error) {
        console.error('Error en login:', error);
        showToast(getAuthErrorMessage(error.code), 'error');
    }
}

// Logout
async function handleLogout() {
    try {
        await auth.signOut();
        currentUser = null;
        currentView = 'login';
        expenses = [];
        incomeHistory = [];
        goals = [];
        render();
        showToast('Sesión cerrada', 'info');
    } catch (error) {
        console.error('Error en logout:', error);
    }
}

// Reset de contraseña
async function handlePasswordReset(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showToast('Correo de recuperación enviado', 'success');
        closeModal();
    } catch (error) {
        console.error('Error en reset:', error);
        let errorMessage = 'Error al enviar correo de recuperación';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No existe una cuenta con este correo';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Correo electrónico inválido';
        }
        showToast(errorMessage, 'error');
    }
}

// Modal de recuperación de contraseña
function showPasswordResetModal() {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = '🔑 Recuperar Contraseña';
    modalBody.innerHTML = `
        <div class="input-group">
            <label>Correo electrónico</label>
            <input type="email" id="reset-email" placeholder="tu@correo.com" required>
        </div>
        <button onclick="handlePasswordResetSubmit()" style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #05BFDB, #088395); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Enviar Correo de Recuperación
        </button>
    `;
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function handlePasswordResetSubmit() {
    const email = document.getElementById('reset-email').value;
    if (email) {
        handlePasswordReset(email);
    }
}

// Obtener mensaje de error legible
function getAuthErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/invalid-email': 'Correo electrónico inválido',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'No existe una cuenta con este correo',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
    };
    return messages[code] || 'Error de autenticación';
}

// Observer de estado de autenticación
function initAuthObserver() {
    auth.onAuthStateChanged(async (user) => {
        if (user && !isInitialized) {
            isInitialized = true;
            currentUser = user;
            currentView = 'app';
            
            try {
                await loadUserData();
                await loadTutorialStatus();
                initializeModules();
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
            
            render();
        } else if (!user) {
            isInitialized = false;
            currentUser = null;
            currentView = 'login';
            render();
        }
    });
}

console.log('✅ auth.js cargado');
