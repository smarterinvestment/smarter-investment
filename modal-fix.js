/**
 * 🚨 MODAL FIX - SOLUCIÓN DEFINITIVA
 * ==================================
 * Archivo: modal-fix.js
 * 
 * INSTRUCCIONES:
 * 1. Guarda este archivo como "modal-fix.js" en tu proyecto
 * 2. Agrégalo a tu index.html DESPUÉS de app.js:
 *    <script src="app.js"></script>
 *    <script src="modal-fix.js"></script>
 * 3. Sube ambos archivos a GitHub
 * 
 * Este archivo corrige el error del modal sin modificar tu app.js
 */

console.log('🔧 Cargando corrección del modal...');

// Esperar a que TODO esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyModalFix);
} else {
    // DOM ya está listo
    applyModalFix();
}

function applyModalFix() {
    console.log('✅ Aplicando corrección del modal...');
    
    // Sobrescribir la función openModal con una versión que funciona
    window.openModal = function(type) {
        console.log('🆕 openModal mejorada ejecutándose...');
        
        // Limpiar modales anteriores
        document.querySelectorAll('#modal').forEach(m => m.remove());
        
        // Crear TODO desde cero
        const modalHTML = `
            <div id="modal" class="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 99999; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: #1a2332; padding: 0; border-radius: 12px; width: 90%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.8); border: 1px solid #05BFDB; overflow: hidden;">
                    <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(5,191,219,0.1);">
                        <h3 style="margin: 0; color: white; font-size: 1.5rem;">${type === 'expense' ? '💸 Agregar Gasto' : '💰 Agregar Ingreso'}</h3>
                        <button onclick="document.getElementById('modal').remove()" style="background: none; border: none; color: white; font-size: 2rem; cursor: pointer; width: 40px; height: 40px;">×</button>
                    </div>
                    <div style="padding: 1.5rem;">
                        <form onsubmit="return handleModalSave(event, '${type}')" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: white;">Descripción</label>
                                <input type="text" id="m-desc" required placeholder="${type === 'expense' ? 'Ej: Supermercado' : 'Ej: Salario'}" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: white;">Monto</label>
                                <input type="number" id="m-amount" required step="0.01" min="0" placeholder="0.00" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: white;">${type === 'expense' ? 'Categoría' : 'Tipo'}</label>
                                <select id="m-category" required style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
                                    <option value="">Selecciona...</option>
                                    ${type === 'expense' ? 
                                        '<option value="Alimentación">🍕 Alimentación</option><option value="Transporte">🚗 Transporte</option><option value="Entretenimiento">🎮 Entretenimiento</option><option value="Otros">📌 Otros</option>' : 
                                        '<option value="Salario">💼 Salario</option><option value="Freelance">💻 Freelance</option><option value="Otros">📌 Otros</option>'
                                    }
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: white;">Fecha</label>
                                <input type="date" id="m-date" required value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white;">
                            </div>
                            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
                                <button type="button" onclick="document.getElementById('modal').remove()" style="padding: 0.75rem 1.5rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 0.5rem; color: white; cursor: pointer;">Cancelar</button>
                                <button type="submit" style="padding: 0.75rem 1.5rem; background: #05BFDB; border: none; border-radius: 0.5rem; color: white; cursor: pointer; font-weight: 600;">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Enfocar primer campo
        setTimeout(() => {
            const input = document.getElementById('m-desc');
            if (input) input.focus();
        }, 100);
        
        // Cerrar al hacer clic fuera
        const modal = document.getElementById('modal');
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };
    
    // Función para guardar
    window.handleModalSave = async function(event, type) {
        event.preventDefault();
        
        const description = document.getElementById('m-desc').value.trim();
        const amount = parseFloat(document.getElementById('m-amount').value);
        const category = document.getElementById('m-category').value;
        const date = document.getElementById('m-date').value;
        
        if (!description || !amount || !category || !date) {
            alert('Por favor completa todos los campos');
            return false;
        }
        
        try {
            const collection = type === 'expense' ? 'expenses' : 'income';
            
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
            
            document.getElementById('modal').remove();
            
            if (typeof showToast === 'function') {
                showToast('✅ Guardado correctamente', 'success');
            } else {
                alert('✅ Guardado correctamente');
            }
            
            setTimeout(() => location.reload(), 1000);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar. Por favor intenta de nuevo.');
        }
        
        return false;
    };
    
    // Función closeModal por si acaso
    window.closeModal = function() {
        const modal = document.getElementById('modal');
        if (modal) modal.remove();
    };
    
    console.log('✅ Corrección del modal aplicada exitosamente');
    console.log('🎯 Ya puedes usar el botón + para agregar gastos/ingresos');
}
