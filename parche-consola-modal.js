/**
 * 🚨 PARCHE TEMPORAL - EJECUTAR EN CONSOLA
 * =========================================
 * Copia y pega TODO este código en la consola del navegador
 * para solucionar el error del modal INMEDIATAMENTE
 */

// PASO 1: Sobrescribir la función openModal con una versión que funciona
window.openModal = function(type) {
    // Crear modal si no existe
    let modal = document.getElementById('modal');
    
    if (!modal) {
        const modalHTML = `
            <div id="modal" class="modal" style="display: none; position: fixed; z-index: 10000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8);">
                <div class="modal-content" style="background: #1a2332; margin: 5% auto; padding: 0; border: 1px solid #05BFDB; width: 90%; max-width: 500px; border-radius: 1rem; color: white;">
                    <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                        <h3 id="modal-title" style="margin: 0;"></h3>
                        <button onclick="closeModal()" style="background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">×</button>
                    </div>
                    <div id="modal-form" style="padding: 1.5rem;"></div>
                </div>
            </div>
        `;
        
        const container = document.getElementById('modal-container') || document.body;
        container.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('modal');
    }
    
    const isExpense = type === 'expense';
    document.getElementById('modal-title').textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
    
    document.getElementById('modal-form').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <input type="text" id="modal-description" placeholder="${isExpense ? 'Ej: Supermercado' : 'Ej: Salario'}" 
                   style="padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
            
            <input type="number" id="modal-amount" step="0.01" placeholder="0.00" 
                   style="padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
            
            <select id="modal-category" style="padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
                ${isExpense ? 
                    '<option value="">Selecciona categoría</option><option value="Alimentación">🍕 Alimentación</option><option value="Transporte">🚗 Transporte</option><option value="Entretenimiento">🎮 Entretenimiento</option><option value="Otros">📌 Otros</option>' : 
                    '<option value="">Selecciona tipo</option><option value="Salario">💼 Salario</option><option value="Freelance">💻 Freelance</option><option value="Otros">📌 Otros</option>'}
            </select>
            
            <input type="date" id="modal-date" value="${new Date().toISOString().split('T')[0]}" 
                   style="padding: 0.75rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
            
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white; cursor: pointer;">
                    Cancelar
                </button>
                <button onclick="quickSave('${type}')" style="padding: 0.75rem 1.5rem; background: #05BFDB; border: none; border-radius: 0.5rem; color: white; cursor: pointer;">
                    Guardar
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
};

// PASO 2: Función para cerrar el modal
window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
};

// PASO 3: Función para guardar rápidamente
window.quickSave = async function(type) {
    const description = document.getElementById('modal-description').value;
    const amount = parseFloat(document.getElementById('modal-amount').value);
    const category = document.getElementById('modal-category').value;
    const date = document.getElementById('modal-date').value;
    
    if (!description || !amount || !category) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    try {
        const collection = type === 'expense' ? 'expenses' : 'income';
        await db.collection('users').doc(currentUser.uid).collection(collection).add({
            description,
            amount,
            category,
            date,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        closeModal();
        
        // Mostrar mensaje de éxito
        if (typeof showToast === 'function') {
            showToast('✅ Guardado correctamente', 'success');
        } else {
            alert('✅ Guardado correctamente');
        }
        
        // Recargar la página después de 1 segundo
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar. Intenta de nuevo.');
    }
};

// PASO 4: Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
});

console.log('✅ PARCHE APLICADO - Ya puedes usar el modal');
console.log('🎯 Haz clic en el botón + para probar');
