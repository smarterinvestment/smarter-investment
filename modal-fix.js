/**
 * 🚨 MODAL FIX - SOLUCIÓN DEFINITIVA v2.0
 * ========================================
 * Este archivo corrige TODOS los problemas del modal
 * sin importar la versión de app.js que tengas
 */

console.log('🔧 Cargando modal-fix.js v2.0...');

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalFix);
} else {
    initModalFix();
}

function initModalFix() {
    console.log('✅ Inicializando corrección del modal...');
    
    // ==========================================
    // 1. OCULTAR BOTÓN FLOTANTE DEL ASISTENTE
    // ==========================================
    const hideFloatingButton = () => {
        const selectors = [
            '.assistant-float-btn',
            '.floating-assistant-button', 
            '.assistant-floating-btn',
            '#assistantFloatBtn',
            '#floating-assistant',
            '.ai-assistant-float',
            '[class*="float"][class*="assistant"]',
            '[id*="float"][id*="assistant"]'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.remove();
            });
        });
    };
    
    // Ejecutar inmediatamente y observar cambios
    hideFloatingButton();
    
    // Observer para detectar si se añade el botón después
    const observer = new MutationObserver(() => {
        hideFloatingButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // También ejecutar después de un delay por si se carga tarde
    setTimeout(hideFloatingButton, 1000);
    setTimeout(hideFloatingButton, 3000);
    setTimeout(hideFloatingButton, 5000);
    
    // ==========================================
    // 2. FUNCIÓN OPENMODAL UNIVERSAL
    // ==========================================
    window.openModal = function(titleOrType, htmlContent) {
        console.log('📦 openModal llamada con:', titleOrType);
        
        // Limpiar modales anteriores
        document.querySelectorAll('#modal, .modal-overlay').forEach(m => m.remove());
        
        // Detectar si es tipo (expense/income) o título
        const isTypeCall = titleOrType === 'expense' || titleOrType === 'income';
        
        let title, content;
        
        if (isTypeCall) {
            // Llamada con tipo: openModal('expense') o openModal('income')
            const isExpense = titleOrType === 'expense';
            title = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
            content = generateTransactionForm(isExpense);
        } else {
            // Llamada con título y contenido: openModal('Título', '<html>')
            title = titleOrType;
            content = htmlContent || '';
        }
        
        // Crear el modal
        const modalHTML = `
            <div id="modal" class="modal" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.2s ease;
            ">
                <div class="modal-content" style="
                    background: linear-gradient(135deg, #1a2332 0%, #0d1520 100%);
                    padding: 0;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 25px 80px rgba(0,0,0,0.8);
                    border: 1px solid #05BFDB;
                    animation: slideUp 0.3s ease;
                ">
                    <div class="modal-header" style="
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(5,191,219,0.1);
                    ">
                        <h3 id="modal-title" style="margin: 0; color: white; font-size: 1.3rem;">${title}</h3>
                        <button onclick="closeModal()" style="
                            background: rgba(255,255,255,0.1);
                            border: none;
                            color: white;
                            font-size: 1.5rem;
                            cursor: pointer;
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='rgba(255,0,0,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">×</button>
                    </div>
                    <div id="modal-body" style="padding: 1.5rem;">
                        ${content}
                    </div>
                </div>
            </div>
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                #modal input, #modal select {
                    width: 100%;
                    padding: 12px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    color: white;
                    font-size: 16px;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                #modal input:focus, #modal select:focus {
                    outline: none;
                    border-color: #05BFDB;
                }
                #modal label {
                    display: block;
                    margin-bottom: 8px;
                    color: rgba(255,255,255,0.8);
                    font-size: 0.9rem;
                }
                #modal select option {
                    background: #1a2332;
                    color: white;
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Cerrar al hacer clic fuera
        const modal = document.getElementById('modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Cerrar con Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Enfocar primer input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    };
    
    // ==========================================
    // 3. FUNCIÓN PARA GENERAR FORMULARIO
    // ==========================================
    function generateTransactionForm(isExpense) {
        const categories = isExpense ? `
            <option value="">Selecciona categoría...</option>
            <option value="Alimentación">🍔 Alimentación</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Entretenimiento">🎮 Entretenimiento</option>
            <option value="Salud">💊 Salud</option>
            <option value="Educación">📚 Educación</option>
            <option value="Vivienda">🏠 Vivienda</option>
            <option value="Servicios">💡 Servicios</option>
            <option value="Ropa">👕 Ropa</option>
            <option value="Tecnología">💻 Tecnología</option>
            <option value="Gastos Esenciales">🏠 Gastos Esenciales</option>
            <option value="Gastos Discrecionales">🎭 Gastos Discrecionales</option>
            <option value="Pago Deudas">💳 Pago Deudas</option>
            <option value="Otros">📌 Otros</option>
        ` : `
            <option value="">Selecciona tipo...</option>
            <option value="salary">💼 Salario</option>
            <option value="freelance">💻 Freelance</option>
            <option value="investments">📈 Inversiones</option>
            <option value="bonus">🎁 Bonos</option>
            <option value="other">📌 Otros</option>
        `;
        
        return `
            <form id="transaction-form" onsubmit="return handleTransactionSubmit(event, '${isExpense ? 'expense' : 'income'}')">
                <div style="margin-bottom: 1rem;">
                    <label>Descripción</label>
                    <input type="text" id="tx-description" placeholder="${isExpense ? 'Ej: Supermercado' : 'Ej: Pago mensual'}" required>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label>Monto</label>
                    <input type="number" id="tx-amount" step="0.01" min="0.01" placeholder="0.00" required>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label>${isExpense ? 'Categoría' : 'Tipo de ingreso'}</label>
                    <select id="tx-category" required>
                        ${categories}
                    </select>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label>Fecha</label>
                    <input type="date" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                
                ${isExpense ? `
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="tx-recurring" style="width: auto; cursor: pointer;">
                        <span>🔄 Hacer recurrente</span>
                    </label>
                    <div id="recurring-options" style="display: none; margin-top: 10px;">
                        <select id="tx-frequency">
                            <option value="monthly">Mensual</option>
                            <option value="weekly">Semanal</option>
                            <option value="biweekly">Quincenal</option>
                            <option value="yearly">Anual</option>
                        </select>
                    </div>
                </div>
                ` : ''}
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="closeModal()" style="
                        padding: 12px 24px;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-size: 1rem;
                        transition: background 0.2s;
                    ">Cancelar</button>
                    <button type="submit" style="
                        padding: 12px 24px;
                        background: ${isExpense ? '#ef4444' : '#10b981'};
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        transition: opacity 0.2s;
                    ">${isExpense ? '💸 Guardar Gasto' : '💰 Guardar Ingreso'}</button>
                </div>
            </form>
        `;
    }
    
    // ==========================================
    // 4. FUNCIONES AUXILIARES
    // ==========================================
    window.closeModal = function() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => modal.remove(), 200);
        }
    };
    
    // Toggle para opciones recurrentes
    document.addEventListener('change', (e) => {
        if (e.target.id === 'tx-recurring') {
            const options = document.getElementById('recurring-options');
            if (options) {
                options.style.display = e.target.checked ? 'block' : 'none';
            }
        }
    });
    
    // ==========================================
    // 5. HANDLER DE SUBMIT
    // ==========================================
    window.handleTransactionSubmit = async function(event, type) {
        event.preventDefault();
        
        const description = document.getElementById('tx-description')?.value.trim();
        const amount = parseFloat(document.getElementById('tx-amount')?.value);
        const category = document.getElementById('tx-category')?.value;
        const date = document.getElementById('tx-date')?.value;
        const isRecurring = document.getElementById('tx-recurring')?.checked;
        const frequency = document.getElementById('tx-frequency')?.value;
        
        // Validaciones
        if (!description || !amount || !category || !date) {
            showNotification('❌ Por favor completa todos los campos', 'error');
            return false;
        }
        
        if (amount <= 0) {
            showNotification('❌ El monto debe ser mayor a 0', 'error');
            return false;
        }
        
        // Mostrar loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Guardando...';
        submitBtn.disabled = true;
        
        try {
            // Verificar que tenemos usuario y db
            if (typeof currentUser === 'undefined' || !currentUser) {
                throw new Error('No hay usuario autenticado');
            }
            if (typeof db === 'undefined' || !db) {
                throw new Error('Base de datos no disponible');
            }
            
            const isExpense = type === 'expense';
            
            if (isExpense && isRecurring && typeof recurringModule !== 'undefined' && recurringModule) {
                // Crear gasto recurrente
                await recurringModule.createRecurringExpense({
                    name: description,
                    amount: amount,
                    category: category,
                    frequency: frequency || 'monthly'
                });
                showNotification('✅ Gasto recurrente creado', 'success');
            } else {
                // Transacción normal
                const collection = isExpense ? 'expenses' : 'incomes';
                const data = {
                    description,
                    amount,
                    category,
                    date,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Para ingresos, añadir el tipo
                if (!isExpense) {
                    data.type = category;
                }
                
                await db.collection('users')
                    .doc(currentUser.uid)
                    .collection(collection)
                    .add(data);
                
                showNotification(`✅ ${isExpense ? 'Gasto' : 'Ingreso'} guardado correctamente`, 'success');
            }
            
            closeModal();
            
            // Recargar datos
            if (typeof loadUserData === 'function') {
                await loadUserData();
            }
            if (typeof render === 'function') {
                render();
            }
            
        } catch (error) {
            console.error('Error guardando transacción:', error);
            showNotification('❌ Error: ' + error.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        return false;
    };
    
    // ==========================================
    // 6. NOTIFICACIONES
    // ==========================================
    window.showNotification = function(message, type = 'info') {
        // Usar Toastify si existe
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "center",
                style: {
                    background: type === 'success' ? '#10b981' : 
                               type === 'error' ? '#ef4444' : '#3b82f6',
                    borderRadius: '8px',
                    padding: '12px 24px'
                }
            }).showToast();
        } else if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            alert(message);
        }
    };
    
    // Alias para compatibilidad
    if (typeof showToast === 'undefined') {
        window.showToast = showNotification;
    }
    
    // ==========================================
    // 7. FUNCIONES LEGACY (compatibilidad)
    // ==========================================
    window.showAddExpenseModal = function() {
        openModal('expense');
    };
    
    window.showAddIncomeModal = function() {
        openModal('income');
    };
    
    window.toggleRecurringOptions = function() {
        const checkbox = document.getElementById('tx-recurring') || document.getElementById('modal-recurring');
        const options = document.getElementById('recurring-options');
        if (checkbox && options) {
            options.style.display = checkbox.checked ? 'block' : 'none';
        }
    };
    
    // handleModalSubmit legacy
    window.handleModalSubmit = function(type) {
        const form = document.getElementById('transaction-form');
        if (form) {
            handleTransactionSubmit({ preventDefault: () => {}, target: form }, type);
        }
    };
    
    console.log('✅ Modal-fix.js v2.0 cargado correctamente');
    console.log('🎯 Funciones disponibles: openModal, closeModal, showAddExpenseModal, showAddIncomeModal');
}
