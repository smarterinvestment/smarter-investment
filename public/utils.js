// utils.js - CARGAR SIEMPRE PRIMERO
(() => {
    'use strict';

    // showToast global (el error más común)
    window.showToast = function(message, type = 'info') {
        if (typeof Toastify !== 'undefined' && Toastify) {
            Toastify({
                text: message,
                duration: 3500,
                gravity: "top",
                position: "center",
                style: {
                    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6',
                    borderRadius: "12px",
                    fontSize: "15px",
                    padding: "16px"
                }
            }).showToast();
        } else {
            alert(message);
        }
    };

    // Ocultar cualquier botón flotante de asistente (el que molesta)
    window.hideFloatingAssistant = function() {
        const selectors = [
            '.assistant-float-btn',
            '#assistantFloatBtn',
            '.floating-assistant',
            '.ai-assistant-float',
            '#floating-assistant',
            '.fab-assistant'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                el.style.display = 'none';
                el.remove();
            });
        });
    };

    console.log("utils.js cargado: showToast y hideFloatingAssistant disponibles");
})();