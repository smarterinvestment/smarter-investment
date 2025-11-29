/**
 * 🔧 FUNCIÓN openModal CORREGIDA - VERSIÓN COMPLETA
 * =================================================
 * Reemplaza la función openModal en tu app.js (aproximadamente línea 4500)
 * Esta versión crea el modal si no existe y maneja todos los casos de error
 */

function openModal(type) {
    // Primero verificar si el modal existe, si no, crearlo
    let modal = document.getElementById('modal');
    
    if (!modal) {
        // Crear el modal completo
        const modalContainer = document.getElementById('modal-container') || document.body;
        const modalHTML = `
            <div id="modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title" class="modal-title"></h3>
                        <button class="btn-close" onclick="closeModal()">×</button>
                    </div>
                    <div id="modal-form" class="modal-body"></div>
                </div>
            </div>
        `;
        modalContainer.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('modal');
    }
    
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    
    if (!modalTitle || !modalForm) {
        console.error('Error: No se pudieron crear los elementos del modal');
        return;
    }
    
    // Determinar si es gasto o ingreso
    const isExpense = type === 'expense';
    
    modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
    
    // ✨ NUEVO: Formulario con opción de recurrente
    modalForm.innerHTML = `
        <div class="form-group">
            <label>Descripción</label>
            <input 
                type="text" 
                id="modal-description" 
                class="form-input" 
                placeholder="${isExpense ? 'Ej: Supermercado' : 'Ej: Salario'}"
                required
            >
        </div>
        
        <div class="form-group">
            <label>Monto</label>
            <input 
                type="number" 
                id="modal-amount" 
                class="form-input" 
                placeholder="0.00" 
                step="0.01" 
                required
            >
        </div>
        
        <div class="form-group">
            <label>${isExpense ? 'Categoría' : 'Tipo de ingreso'}</label>
            <select id="modal-category" class="form-input" required>
                ${isExpense ? `
                    <option value="">Selecciona una categoría</option>
                    <option value="Alimentación">🍕 Alimentación</option>
                    <option value="Transporte">🚗 Transporte</option>
                    <option value="Entretenimiento">🎮 Entretenimiento</option>
                    <option value="Salud">🏥 Salud</option>
                    <option value="Educación">📚 Educación</option>
                    <option value="Ropa">👕 Ropa</option>
                    <option value="Hogar">🏠 Hogar</option>
                    <option value="Servicios">💡 Servicios</option>
                    <option value="Otros">📌 Otros</option>
                ` : `
                    <option value="">Selecciona un tipo</option>
                    <option value="Salario">💼 Salario</option>
                    <option value="Freelance">💻 Freelance</option>
                    <option value="Inversiones">📈 Inversiones</option>
                    <option value="Regalo">🎁 Regalo</option>
                    <option value="Bonos">💰 Bonos</option>
                    <option value="Otros">📌 Otros</option>
                `}
            </select>
        </div>
        
        <div class="form-group">
            <label>Fecha</label>
            <input 
                type="date" 
                id="modal-date" 
                class="form-input" 
                value="${new Date().toISOString().split('T')[0]}"
                required
            >
        </div>
        
        <!-- ✨ NUEVO: Opción de gasto recurrente -->
        ${isExpense ? `
            <div class="form-group">
                <div class="checkbox-group">
                    <input 
                        type="checkbox" 
                        id="modal-recurring" 
                        onchange="toggleRecurringOptions()"
                    >
                    <label for="modal-recurring" class="checkbox-label">
                        🔄 Hacer este gasto recurrente
                    </label>
                </div>
                
                <div id="recurring-options" style="display: none; margin-top: 1rem;">
                    <label>Frecuencia</label>
                    <select id="modal-frequency" class="form-input">
                        <option value="monthly">Mensual</option>
                        <option value="weekly">Semanal</option>
                        <option value="biweekly">Quincenal</option>
                        <option value="daily">Diario</option>
                        <option value="yearly">Anual</option>
                    </select>
                </div>
            </div>
        ` : ''}
        
        <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button class="btn btn-secondary" onclick="closeModal()">
                Cancelar
            </button>
            <button class="btn btn-primary" onclick="handleModalSubmit('${type}')">
                ${isExpense ? 'Agregar Gasto' : 'Agregar Ingreso'}
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Enfocar en el primer campo
    setTimeout(() => {
        const firstInput = document.getElementById('modal-description');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Función para cerrar el modal (si no existe)
if (typeof closeModal === 'undefined') {
    window.closeModal = function() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
}

// Función para toggle de opciones recurrentes (si no existe)
if (typeof toggleRecurringOptions === 'undefined') {
    window.toggleRecurringOptions = function() {
        const checkbox = document.getElementById('modal-recurring');
        const options = document.getElementById('recurring-options');
        if (checkbox && options) {
            options.style.display = checkbox.checked ? 'block' : 'none';
        }
    };
}

// Función mejorada para manejar el submit del modal
if (typeof handleModalSubmit === 'undefined') {
    window.handleModalSubmit = async function(type) {
        try {
            const description = document.getElementById('modal-description')?.value.trim();
            const amount = parseFloat(document.getElementById('modal-amount')?.value);
            const category = document.getElementById('modal-category')?.value;
            const date = document.getElementById('modal-date')?.value;
            
            // Validaciones extras
            if (!description || isNaN(amount) || !category || !date) {
                showToast('❌ Por favor completa todos los campos correctamente', 'error');
                return;
            }
            
            if (amount <= 0) {
                showToast('❌ El monto debe ser mayor a 0', 'error');
                return;
            }
            
            const isExpense = type === 'expense';
            const isRecurring = isExpense && document.getElementById('modal-recurring')?.checked;
            
            if (isRecurring && recurringModule) {
                // Crear gasto recurrente
                const frequency = document.getElementById('modal-frequency')?.value;
                if (!frequency) {
                    showToast('❌ Selecciona una frecuencia', 'error');
                    return;
                }
                const result = await recurringModule.createRecurringExpense({
                    name: description,
                    amount: amount,
                    category: category,
                    frequency: frequency
                });
                
                if (result.success) {
                    showToast('✅ Gasto recurrente creado correctamente', 'success');
                    closeModal();
                    render();
                } else {
                    showToast('❌ Error al crear gasto recurrente', 'error');
                }
            } else {
                // Transacción normal
                const collection = isExpense ? 'expenses' : 'income';
                await db.collection('users')
                    .doc(currentUser.uid)
                    .collection(collection)
                    .add({
                        description,
                        amount,
                        category,
                        date,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                
                showToast(`✅ ${isExpense ? 'Gasto' : 'Ingreso'} agregado correctamente`, 'success');
                closeModal();
                
                // Recargar datos
                if (isExpense) {
                    await loadExpenses();
                } else {
                    await loadIncome();
                }
                
                render();
            }
        } catch (error) {
            console.error('Error guardando:', error);
            showToast('❌ Error al guardar. Intenta de nuevo.', 'error');
        }
    };
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});

console.log('✅ Función openModal corregida y cargada');