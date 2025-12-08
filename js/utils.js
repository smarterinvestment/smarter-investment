// ========================================
// 🛠️ UTILS.JS - Funciones de Utilidad
// ========================================

// Mostrar toast notification
function showToast(message, type = 'info') {
    if (typeof Toastify !== 'undefined') {
        const colors = {
            success: 'linear-gradient(135deg, #22c55e, #16a34a)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f97316, #ea580c)',
            info: 'linear-gradient(135deg, #05BFDB, #088395)'
        };
        
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'center',
            style: {
                background: colors[type] || colors.info,
                borderRadius: '10px',
                padding: '12px 20px',
                fontWeight: '500'
            }
        }).showToast();
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Formatear moneda
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Formatear fecha
function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = format === 'long' 
        ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        : { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('es-MX', options);
}

// Formatear fecha relativa
function formatRelativeDate(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`;
    return formatDate(date);
}

// Toggle FAB menu
function toggleFabMenu() {
    const menu = document.getElementById('fab-menu');
    if (menu) {
        const isVisible = menu.style.display === 'flex';
        menu.style.display = isVisible ? 'none' : 'flex';
    }
}

// Ocultar botón flotante del asistente
function hideFloatingAssistant() {
    const selectors = [
        '.assistant-float-btn', 
        '.floating-assistant-button', 
        '#assistantFloatBtn',
        '#floating-assistant', 
        '.ai-assistant-float', 
        '.assistant-fab'
    ];
    
    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.remove();
        });
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Validar email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Capitalizar primera letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Truncar texto
function truncate(str, length = 50) {
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Obtener color por porcentaje
function getColorByPercentage(percentage) {
    if (percentage < 50) return '#22c55e';      // Verde
    if (percentage < 75) return '#f97316';      // Naranja
    if (percentage < 100) return '#eab308';     // Amarillo
    return '#ef4444';                           // Rojo
}

// Scroll suave a elemento
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado al portapapeles', 'success');
    } catch (err) {
        console.error('Error copiando:', err);
        showToast('Error al copiar', 'error');
    }
}

// Verificar si es móvil
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Obtener parámetros de URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Local storage helpers
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    },
    clear: () => {
        localStorage.clear();
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    hideFloatingAssistant();
    
    // Observer para ocultar botón flotante si aparece después
    const observer = new MutationObserver(hideFloatingAssistant);
    observer.observe(document.body, { childList: true, subtree: true });
});

console.log('✅ utils.js cargado');
