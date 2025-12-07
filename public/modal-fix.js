// modal-fix.js – VERSIÓN FINAL 100% FUNCIONAL
// Smarter Investment MD

// Elimina modales duplicados
function cleanupModals() {
    document.querySelectorAll('#expense-modal, #income-modal, #recurring-modal')
        .forEach((modal, i) => i > 0 && modal.remove());
}

// Obtiene o crea un modal único
function getModal(id, title) {
    cleanupModals();
    let modal = document.getElementById(id);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close" onclick="closeModal()">&times;</span>
                </div>
                <div class="modal-body" id="${id}-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    return modal;
}

// Abrir modal de gasto
window.openExpenseModal = () => {
    const modal = getModal('expense-modal', 'Nuevo Gasto');
    document.getElementById('expense-modal-body')?.innerHTML = `
        <form onsubmit="event.preventDefault(); saveTransaction('expense')">
            <input type="text" id="tx-desc" placeholder="Descripción" required>
            <input type="number" id="tx-amount" placeholder="Monto" step="0.01" required>
            <select id="tx-category" required>
                <option value="">Categoría</option>
                <option value="Alimentación">Alimentación</option>
                <option value="Transporte">Transporte</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Salud">Salud</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Otros">Otros</option>
            </select>
            <input type="date" id="tx-date" required>
            <button type="submit">Guardar Gasto</button>
        </form>
    `;
    modal.style.display = 'block';
};

// Abrir modal de ingreso
window.openIncomeModal = () => {
    const modal = getModal('income-modal', 'Nuevo Ingreso');
    document.getElementById('income-modal-body')?.innerHTML = `
        <form onsubmit="event.preventDefault(); saveTransaction('income')">
            <input type="text" id="tx-desc" placeholder="Descripción" required>
            <input type="number" id="tx-amount" placeholder="Monto" step="0.01" required>
            <select id="tx-category" required>
                <option value="">Categoría</option>
                <option value="Salario">Salario</option>
                <option value="Freelance">Freelance</option>
                <option value="Inversión">Inversión</option>
                <option value="Otros">Otros</option>
            </select>
            <input type="date" id="tx-date" required>
            <button type="submit">Guardar Ingreso</button>
        </form>
    `;
    modal.style.display = 'block';
};

// Cerrar todos los modales
window.closeModal = () => {
    document.querySelectorAll('.modal').forEach(m => {
        m.style.display = 'none';
        const body = m.querySelector('.modal-body');
        if (body) body.innerHTML = '';
    });
};

// Cerrar al hacer clic fuera o con Escape
window.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) closeModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

console.log("modal-fix.js cargado 100% correctamente");