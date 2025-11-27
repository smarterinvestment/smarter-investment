/**
 * 🔧 SOLUCIÓN PARA ERROR DE MODAL
 * ================================
 * Reemplazar la función openModal en app.js (aproximadamente línea 4500)
 */

function openModal(type) {
    // Primero verificar si el modal existe, si no, crearlo
    let modal = document.getElementById('modal');
    
    if (!modal) {
        // Crear estructura del modal si no existe
        const modalHTML = `
            <div id="modal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title" class="modal-title"></h3>
                        <button class="btn-close" onclick="closeModal()">×</button>
                    </div>
                    <div id="modal-body" class="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('modal');
    }
    
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    // Verificar que los elementos existen
    if (!modal || !modalTitle || !modalBody) {
        console.error('❌ Error: No se pudieron encontrar los elementos del modal');
        return;
    }
    
    // Determinar si es gasto o ingreso
    const isExpense = type === 'expense';
    
    // Establecer título
    modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
    
    // Crear formulario
    modalBody.innerHTML = `
        <form id="transaction-form" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
                <label for="modal-description">Descripción</label>
                <input 
                    type="text" 
                    id="modal-description" 
                    class="form-input" 
                    placeholder="${isExpense ? 'Ej: Supermercado' : 'Ej: Salario'}"
                    required
                    style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white;"
                >
            </div>
            
            <div class="form-group">
                <label for="modal-amount">Monto</label>
                <input 
                    type="number" 
                    id="modal-amount" 
                    class="form-input" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0"
                    required
                    style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white;"
                >
            </div>
            
            <div class="form-group">
                <label for="modal-category">${isExpense ? 'Categoría' : 'Tipo de ingreso'}</label>
                <select 
                    id="modal-category" 
                    class="form-input" 
                    required
                    style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white;"
                >
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
                        <option value="Bonos">🎁 Bonos</option>
                        <option value="Regalo">🎁 Regalo</option>
                        <option value="Otros">📌 Otros</option>
                    `}
                </select>
            </div>
            
            <div class="form-group">
                <label for="modal-date">Fecha</label>
                <input 
                    type="date" 
                    id="modal-date" 
                    class="form-input" 
                    value="${new Date().toISOString().split('T')[0]}"
                    required
                    style="width: 100%; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); border-radius: 0.5rem; color: white;"
                >
            </div>
            
            <div class="modal-footer" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                <button 
                    type="button" 
                    class="btn btn-secondary" 
                    onclick="closeModal()"
                    style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white; cursor: pointer;"
                >
                    Cancelar
                </button>
                <button 
                    type="submit" 
                    class="btn btn-primary"
                    style="padding: 0.75rem 1.5rem; background: var(--color-primary, #05BFDB); border: none; border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;"
                >
                    ${isExpense ? 'Agregar Gasto' : 'Agregar Ingreso'}
                </button>
            </div>
        </form>
    `;
    
    // Agregar event listener al formulario
    const form = document.getElementById('transaction-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveTransaction(type);
    };
    
    // Mostrar el modal
    modal.style.display = 'block';
    
    // Enfocar en el primer campo
    setTimeout(() => {
        document.getElementById('modal-description').focus();
    }, 100);
}

/**
 * Función para cerrar el modal
 */
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        
        // Limpiar formulario
        const form = document.getElementById('transaction-form');
        if (form) {
            form.reset();
        }
    }
}

/**
 * Función para guardar la transacción
 */
async function saveTransaction(type) {
    try {
        // Obtener valores del formulario
        const description = document.getElementById('modal-description').value.trim();
        const amount = parseFloat(document.getElementById('modal-amount').value);
        const category = document.getElementById('modal-category').value;
        const date = document.getElementById('modal-date').value;
        
        // Validaciones
        if (!description || !amount || !category || !date) {
            showToast('❌ Por favor completa todos los campos', 'error');
            return;
        }
        
        if (amount <= 0) {
            showToast('❌ El monto debe ser mayor a 0', 'error');
            return;
        }
        
        // Preparar datos
        const transactionData = {
            description,
            amount,
            category,
            date,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Guardar en Firestore
        const collection = type === 'expense' ? 'expenses' : 'income';
        await db
            .collection('users')
            .doc(currentUser.uid)
            .collection(collection)
            .add(transactionData);
        
        // Actualizar datos locales
        if (type === 'expense') {
            expenses.push({
                ...transactionData,
                id: Date.now().toString(),
                createdAt: new Date()
            });
        } else {
            incomeHistory.push({
                ...transactionData,
                id: Date.now().toString(),
                createdAt: new Date()
            });
        }
        
        // Cerrar modal
        closeModal();
        
        // Mostrar mensaje de éxito
        showToast(`✅ ${type === 'expense' ? 'Gasto' : 'Ingreso'} agregado correctamente`, 'success');
        
        // Recargar vista
        render();
        
    } catch (error) {
        console.error('Error guardando transacción:', error);
        showToast('❌ Error al guardar. Intenta de nuevo.', 'error');
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
};

console.log('✅ Funciones de modal cargadas correctamente');
