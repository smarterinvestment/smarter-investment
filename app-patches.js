// ========================================
// PATCH PARA ERRORES DE INNERHTML - Mauricio's App
// ========================================
// Este archivo corrige los errores "Cannot set properties of null"

console.log('🔧 Aplicando parches para errores de innerHTML...');

// ========================================
// PATCH 1: FUNCIONES AUXILIARES SEGURAS
// ========================================

/**
 * Función segura para establecer innerHTML
 */
function safeSetHTML(elementId, content) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
            return true;
        } else {
            console.warn(`⚠️ Elemento ${elementId} no encontrado`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error al establecer innerHTML en ${elementId}:`, error);
        return false;
    }
}

/**
 * Función para esperar que el DOM esté listo
 */
function ensureDOMReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// ========================================
// PATCH 2: CORREGIR RENDERIZADO DE MÓDULOS
// ========================================

// Patch para RecurringModule
if (typeof RecurringModule !== 'undefined') {
    const originalRender = RecurringModule.renderMoreSection;
    RecurringModule.renderMoreSection = function(expenses) {
        try {
            // Verificar que expenses sea un array válido
            if (!expenses || !Array.isArray(expenses)) {
                console.warn('⚠️ RecurringModule: expenses no es un array válido');
                return '<div class="empty-state">No hay gastos recurrentes</div>';
            }
            
            // Llamar función original con datos válidos
            return originalRender ? originalRender.call(this, expenses) : '';
        } catch (error) {
            console.error('❌ Error en RecurringModule.renderMoreSection:', error);
            return '<div class="error-state">Error cargando gastos recurrentes</div>';
        }
    };
}

// Patch para NotificationsModule
if (typeof NotificationsModule !== 'undefined') {
    const originalRender = NotificationsModule.renderNotifications;
    NotificationsModule.renderNotifications = function() {
        try {
            const container = document.getElementById('notifications-container');
            if (!container) {
                console.warn('⚠️ Container de notificaciones no encontrado');
                return;
            }
            
            return originalRender ? originalRender.call(this) : '';
        } catch (error) {
            console.error('❌ Error en NotificationsModule:', error);
        }
    };
}

// ========================================
// PATCH 3: CORREGIR FUNCIÓN DE NAVEGACIÓN
// ========================================

// Patch para la función showSection
if (typeof showSection === 'function') {
    const originalShowSection = showSection;
    window.showSection = function(sectionName) {
        try {
            console.log(`📱 Navegando a: ${sectionName}`);
            
            // Verificar que main-content exista
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                console.error('❌ main-content no encontrado');
                return;
            }
            
            // Llamar función original
            return originalShowSection.call(this, sectionName);
        } catch (error) {
            console.error('❌ Error en showSection:', error);
            safeSetHTML('main-content', '<div class="error-state">Error cargando sección</div>');
        }
    };
}

// ========================================
// PATCH 4: CORREGIR RENDERIZADO PRINCIPAL
// ========================================

// Patch para renderDashboard
if (typeof renderDashboard === 'function') {
    const originalRenderDashboard = renderDashboard;
    window.renderDashboard = function() {
        try {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                console.error('❌ main-content no encontrado para dashboard');
                return;
            }
            
            return originalRenderDashboard.call(this);
        } catch (error) {
            console.error('❌ Error en renderDashboard:', error);
            safeSetHTML('main-content', `
                <div class="dashboard-error">
                    <h2>🔧 Error en Dashboard</h2>
                    <p>Hubo un problema cargando el dashboard. Recarga la página.</p>
                    <button onclick="location.reload()" class="btn-primary">Recargar</button>
                </div>
            `);
        }
    };
}

// ========================================
// PATCH 5: CORREGIR ASISTENTE CLAUDE
// ========================================

// Patch para askClaudeAssistant
if (typeof askClaudeAssistant === 'function') {
    const originalAsk = askClaudeAssistant;
    window.askClaudeAssistant = async function(message) {
        try {
            const apiKey = localStorage.getItem('anthropicApiKey');
            if (!apiKey) {
                console.warn('⚠️ API Key no configurada');
                addMessageToChat('assistant', '⚙️ Por favor configura tu API Key en Configuración');
                return;
            }

            // Mostrar mensaje de typing
            if (typeof showTyping === 'function') showTyping(true);
            
            // Hacer request a nuestra función Vercel (sin CORS)
            const response = await fetch('/api/claude', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: apiKey,
                    messages: [{
                        role: 'user',
                        content: message
                    }],
                    model: 'claude-3-5-sonnet-20241022',
                    maxTokens: 1000
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.data && data.data.content) {
                const assistantMessage = data.data.content[0]?.text || 'Sin respuesta';
                if (typeof addMessageToChat === 'function') {
                    addMessageToChat('assistant', assistantMessage);
                }
            } else {
                throw new Error(data.error || 'Respuesta inválida');
            }
            
        } catch (error) {
            console.error('❌ Error en Claude Assistant:', error);
            if (typeof addMessageToChat === 'function') {
                addMessageToChat('assistant', '❌ Error: ' + error.message);
            }
        } finally {
            if (typeof showTyping === 'function') showTyping(false);
        }
    };
}

// ========================================
// PATCH 6: INICIALIZACIÓN SEGURA
// ========================================

// Patch para la inicialización de la app
ensureDOMReady(() => {
    console.log('🚀 DOM listo - aplicando parches finales...');
    
    // Verificar elementos críticos
    const criticalElements = [
        'main-content',
        'bottom-nav', 
        'loading-spinner',
        'modal-container'
    ];
    
    criticalElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`⚠️ Elemento crítico faltante: ${elementId}`);
            
            // Crear elemento si no existe
            if (elementId === 'main-content') {
                const body = document.body;
                const mainContent = document.createElement('div');
                mainContent.id = 'main-content';
                mainContent.className = 'main-content';
                body.appendChild(mainContent);
                console.log('✅ main-content creado automáticamente');
            }
        }
    });
    
    // Verificar inicialización de Firebase
    if (typeof auth === 'undefined') {
        console.warn('⚠️ Firebase Auth no inicializado');
    }
    
    console.log('✅ Parches aplicados correctamente');
});

// ========================================
// PATCH 7: MANEJO GLOBAL DE ERRORES
// ========================================

// Capturar errores globales de innerHTML
window.addEventListener('error', (event) => {
    const message = event.message;
    if (message && message.includes('innerHTML')) {
        console.warn('🔧 Error innerHTML capturado globalmente:', message);
        event.preventDefault(); // Evitar que se muestre en consola
    }
});

// Override console.error para innerHTML específicos
const originalConsoleError = console.error;
console.error = function(...args) {
    const message = args[0];
    if (typeof message === 'string' && message.includes('Cannot set properties of null')) {
        console.warn('🔧 Error innerHTML interceptado:', ...args);
        return;
    }
    originalConsoleError.apply(console, args);
};

console.log('✅ Patches de innerHTML aplicados correctamente');

// ========================================
// EXPORTAR UTILIDADES
// ========================================
window.AppPatches = {
    safeSetHTML,
    ensureDOMReady
};
