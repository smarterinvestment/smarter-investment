/**
 * ============================================================
 * 🔧 MODAL-FIX.JS - PARCHE DEFINITIVO v3.0
 * ============================================================
 * Soluciona el error "Cannot set properties of null (innerHTML)"
 * Crea la estructura del modal que falta en el HTML
 * ============================================================
 */

(function() {
    'use strict';
    
    console.log('🔧 Modal-Fix v3.0 iniciando...');

    // ========================================
    // 1. CREAR ESTRUCTURA DEL MODAL
    // ========================================
    function createModalStructure() {
        if (document.getElementById('modal')) {
            return; // Ya existe
        }

        const modalHTML = `
            <div id="modal" class="modal" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 99999;
                align-items: center;
                justify-content: center;
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
                ">
                    <div class="modal-header" style="
                        padding: 1.25rem 1.5rem;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(5,191,219,0.1);
                    ">
                        <h3 id="modal-title" style="margin: 0; color: white; font-size: 1.3rem;"></h3>
                        <button onclick="closeModal()" style="
                            background: rgba(255,255,255,0.1);
                            border: none;
                            color: white;
                            font-size: 1.5rem;
                            cursor: pointer;
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                        ">×</button>
                    </div>
                    <div id="modal-body" style="padding: 1.5rem;"></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Añadir estilos
        const style = document.createElement('style');
        style.textContent = `
            #modal.active { display: flex !important; }
            #modal input, #modal select {
                width: 100%;
                padding: 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: white;
                font-size: 16px;
                box-sizing: border-box;
                margin-bottom: 0.5rem;
            }
            #modal input:focus, #modal select:focus {
                outline: none;
                border-color: #05BFDB;
            }
            #modal select option { background: #1a2332; color: white; }
            #modal label {
                display: block;
                margin-bottom: 0.5rem;
                color: rgba(255,255,255,0.8);
                font-size: 0.9rem;
            }
            #modal .input-group { margin-bottom: 1rem; }
            #modal .btn {
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                border: none;
                width: 100%;
                margin-top: 0.5rem;
            }
            #modal .btn-primary { background: #05BFDB; color: white; }
            #modal .btn-secondary {
                background: rgba(255,255,255,0.1);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Estructura del modal creada');
    }

    // ========================================
    // 2. FUNCIÓN closeModal
    // ========================================
    window.closeModal = function() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    };

    // ========================================
    // 3. FUNCIÓN openModal UNIVERSAL
    // ========================================
    window.openModal = function(type) {
        createModalStructure();
        
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        if (!modal || !modalTitle || !modalBody) {
            console.error('❌ No se pudo crear el modal');
            alert('Error al abrir el formulario. Recarga la página.');
            return;
        }

        const isExpense = type === 'expense';
        const isIncome = type === 'income';
        
        if (isExpense || isIncome) {
            modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
            modalBody.innerHTML = generateTransactionForm(isExpense);
        } else {
            modalTitle.textContent = type || 'Modal';
        }
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        modal.onclick = (e) => { if (e.target === modal) closeModal(); };
        
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    };

    // ========================================
    // 4. GENERAR FORMULARIO
    // ========================================
    function generateTransactionForm(isExpense) {
        const categories = isExpense ? `
            <option value="">Selecciona categoría...</option>
            <option value="Alimentación">🍔 Alimentación</option>
            <option value="Transporte">🚗 Transporte</option>
            <option value="Entretenimiento">🎬 Entretenimiento</option>
            <option value="Salud">💊 Salud</option>
            <option value="Educación">📚 Educación</option>
            <option value="Vivienda">🏠 Vivienda</option>
            <option value="Servicios">💡 Servicios</option>
            <option value="Ropa">👕 Ropa</option>
            <option value="Tecnología">💻 Tecnología</option>
            <option value="Mascotas">🐕 Mascotas</option>
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
                <div class="input-group">
                    <label>📝 Descripción</label>
                    <input type="text" id="tx-description" placeholder="${isExpense ? 'Ej: Supermercado...' : 'Ej: Pago mensual...'}" required>
                </div>
                <div class="input-group">
                    <label>💵 Monto</label>
                    <input type="number" id="tx-amount" step="0.01" min="0.01" placeholder="0.00" required>
                </div>
                <div class="input-group">
                    <label>${isExpense ? '📂 Categoría' : '📂 Tipo'}</label>
                    <select id="tx-category" required>${categories}</select>
                </div>
                <div class="input-group">
                    <label>📅 Fecha</label>
                    <input type="date" id="tx-date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                ${isExpense ? `
                <div class="input-group">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="tx-recurring" style="width: auto;">
                        <span>🔄 Hacer recurrente</span>
                    </label>
                    <div id="recurring-options" style="display: none; margin-top: 10px;">
                        <select id="tx-frequency">
                            <option value="monthly">📅 Mensual</option>
                            <option value="weekly">📆 Semanal</option>
                            <option value="biweekly">📆 Quincenal</option>
                            <option value="yearly">📋 Anual</option>
                        </select>
                    </div>
                </div>
                ` : ''}
                <button type="submit" class="btn btn-primary" style="background: ${isExpense ? '#ef4444' : '#10b981'}; margin-top: 1rem;">
                    ${isExpense ? '💸 Guardar Gasto' : '💰 Guardar Ingreso'}
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            </form>
        `;
    }

    // ========================================
    // 5. HANDLER DE SUBMIT
    // ========================================
    window.handleTransactionSubmit = async function(event, type) {
        event.preventDefault();
        
        const description = document.getElementById('tx-description')?.value.trim();
        const amount = parseFloat(document.getElementById('tx-amount')?.value);
        const category = document.getElementById('tx-category')?.value;
        const date = document.getElementById('tx-date')?.value;
        const isRecurring = document.getElementById('tx-recurring')?.checked;
        const frequency = document.getElementById('tx-frequency')?.value;
        
        if (!description || !amount || !category || !date) {
            showToast('❌ Completa todos los campos', 'error');
            return false;
        }
        
        if (amount <= 0) {
            showToast('❌ El monto debe ser mayor a 0', 'error');
            return false;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Guardando...';
        submitBtn.disabled = true;
        
        try {
            if (typeof currentUser === 'undefined' || !currentUser) {
                throw new Error('No hay usuario autenticado');
            }
            if (typeof db === 'undefined' || !db) {
                throw new Error('Error de conexión');
            }
            
            const isExpense = type === 'expense';
            
            if (isExpense && isRecurring && typeof recurringModule !== 'undefined' && recurringModule) {
                await recurringModule.createRecurringExpense({
                    name: description,
                    description: description,
                    amount: amount,
                    category: category,
                    frequency: frequency || 'monthly'
                });
                showToast('✅ Gasto recurrente creado', 'success');
            } else {
                const collectionName = isExpense ? 'expenses' : 'incomes';
                const data = {
                    description,
                    amount,
                    category,
                    date,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if (!isExpense) data.type = category;
                
                await db.collection('users').doc(currentUser.uid).collection(collectionName).add(data);
                
                if (isExpense && typeof expenses !== 'undefined') {
                    expenses.unshift({ ...data, id: 'temp-' + Date.now() });
                } else if (!isExpense && typeof incomeHistory !== 'undefined') {
                    incomeHistory.unshift({ ...data, id: 'temp-' + Date.now() });
                    if (typeof income !== 'undefined') {
                        income[category] = (income[category] || 0) + amount;
                    }
                }
                
                showToast(`✅ ${isExpense ? 'Gasto' : 'Ingreso'} guardado`, 'success');
            }
            
            closeModal();
            
            if (typeof loadUserData === 'function') await loadUserData();
            if (typeof render === 'function') render();
            
        } catch (error) {
            console.error('Error:', error);
            showToast('❌ ' + error.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        return false;
    };

    // ========================================
    // 6. TOGGLE OPCIONES RECURRENTES
    // ========================================
    document.addEventListener('change', (e) => {
        if (e.target.id === 'tx-recurring') {
            const options = document.getElementById('recurring-options');
            if (options) options.style.display = e.target.checked ? 'block' : 'none';
        }
    });

    // ========================================
    // 7. FUNCIÓN showToast
    // ========================================
    if (typeof window.showToast === 'undefined') {
        window.showToast = function(message, type = 'info') {
            if (typeof Toastify !== 'undefined') {
                Toastify({
                    text: message,
                    duration: 3000,
                    gravity: "top",
                    position: "center",
                    style: {
                        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
                        borderRadius: '8px',
                        padding: '12px 24px'
                    }
                }).showToast();
            } else {
                alert(message);
            }
        };
    }

    // ========================================
    // 8. OCULTAR BOTÓN FLOTANTE ASISTENTE
    // ========================================
    function hideFloatingAssistant() {
        ['.assistant-float-btn', '.floating-assistant-button', '#assistantFloatBtn', '#floating-assistant', '.ai-assistant-float', '.assistant-fab']
            .forEach(s => document.querySelectorAll(s).forEach(el => { el.style.display = 'none'; el.remove(); }));
    }

    // ========================================
    // 9. INICIALIZACIÓN
    // ========================================
    function init() {
        createModalStructure();
        hideFloatingAssistant();
        
        new MutationObserver(hideFloatingAssistant).observe(document.body, { childList: true, subtree: true });
        
        setTimeout(hideFloatingAssistant, 1000);
        setTimeout(hideFloatingAssistant, 3000);
        
        console.log('✅ Modal-Fix v3.0 cargado correctamente');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
