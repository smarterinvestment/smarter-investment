// ========================================
// DOM UTILITIES - Mauricio's Financial App
// ========================================
// Utilidades para prevenir errores de DOM

/**
 * Función segura para establecer innerHTML
 * @param {string} elementId - ID del elemento
 * @param {string} content - Contenido HTML a insertar
 * @returns {boolean} - true si se estableció correctamente
 */
function safeSetInnerHTML(elementId, content) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = content;
            return true;
        } else {
            console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error al establecer innerHTML para ${elementId}:`, error);
        return false;
    }
}

/**
 * Función segura para obtener elementos por ID
 * @param {string} elementId - ID del elemento
 * @returns {HTMLElement|null} - Elemento o null si no existe
 */
function safeGetElement(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`⚠️ Elemento no encontrado: ${elementId}`);
        }
        return element;
    } catch (error) {
        console.error(`❌ Error al obtener elemento ${elementId}:`, error);
        return null;
    }
}

/**
 * Función para esperar a que un elemento esté disponible
 * @param {string} elementId - ID del elemento
 * @param {number} timeout - Tiempo máximo de espera en ms
 * @returns {Promise<HTMLElement>} - Promesa que resuelve cuando el elemento está disponible
 */
function waitForElement(elementId, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkElement() {
            const element = document.getElementById(elementId);
            if (element) {
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`Timeout esperando elemento: ${elementId}`));
                return;
            }
            
            setTimeout(checkElement, 100);
        }
        
        checkElement();
    });
}

/**
 * Función para verificar si el DOM está listo
 * @returns {Promise<void>} - Promesa que resuelve cuando el DOM está listo
 */
function waitForDOM() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * Wrapper seguro para addEventListener
 * @param {string} elementId - ID del elemento
 * @param {string} event - Tipo de evento
 * @param {Function} handler - Manejador del evento
 * @returns {boolean} - true si se agregó correctamente
 */
function safeAddEventListener(elementId, event, handler) {
    try {
        const element = safeGetElement(elementId);
        if (element) {
            element.addEventListener(event, handler);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error al agregar event listener a ${elementId}:`, error);
        return false;
    }
}

/**
 * Función para mostrar/ocultar elementos de forma segura
 * @param {string} elementId - ID del elemento
 * @param {boolean} show - true para mostrar, false para ocultar
 */
function safeToggleDisplay(elementId, show) {
    const element = safeGetElement(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

/**
 * Función para agregar clases CSS de forma segura
 * @param {string} elementId - ID del elemento
 * @param {string} className - Clase a agregar
 */
function safeAddClass(elementId, className) {
    const element = safeGetElement(elementId);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Función para remover clases CSS de forma segura
 * @param {string} elementId - ID del elemento
 * @param {string} className - Clase a remover
 */
function safeRemoveClass(elementId, className) {
    const element = safeGetElement(elementId);
    if (element) {
        element.classList.remove(className);
    }
}

// ========================================
// PARCHES PARA ERRORES COMUNES
// ========================================

/**
 * Patch para prevenir errores de innerHTML
 */
function applyDOMPatches() {
    // Override console.error para capturar errores específicos
    const originalError = console.error;
    console.error = function(...args) {
        const message = args[0];
        if (typeof message === 'string' && message.includes('innerHTML')) {
            console.warn('🔧 Error de innerHTML interceptado:', ...args);
            // No propagar el error pero sí loguearlo como warning
            return;
        }
        originalError.apply(console, args);
    };

    // Verificar elementos críticos al cargar
    waitForDOM().then(() => {
        const criticalElements = [
            'main-content',
            'bottom-nav',
            'modal-container',
            'chat-messages',
            'expenses-container',
            'incomes-container'
        ];

        criticalElements.forEach(elementId => {
            const element = safeGetElement(elementId);
            if (!element) {
                console.warn(`🏗️ Elemento crítico faltante: ${elementId}`);
            }
        });
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Aplicar parches al cargar el script
applyDOMPatches();

// Exportar funciones para uso global
window.DOMUtils = {
    safeSetInnerHTML,
    safeGetElement,
    waitForElement,
    waitForDOM,
    safeAddEventListener,
    safeToggleDisplay,
    safeAddClass,
    safeRemoveClass
};

console.log('✅ DOM Utils cargadas correctamente');
