// ========================================
// 🪟 MODALS.JS - Funciones de Modales
// ========================================

// Crear estructura del modal principal
function createModalStructure() {
    if (document.getElementById('modal')) return;
    
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
                background: linear-gradient(135deg, rgba(5, 191, 219, 0.1) 0%, rgba(13, 38, 79, 0.95) 50%, rgba(0, 17, 56, 0.98) 100%);
                padding: 0;
                border-radius: 16px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(5, 191, 219, 0.2);
                border: 1px solid rgba(5, 191, 219, 0.3);
                backdrop-filter: blur(20px);
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
    
    // Añadir estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        #modal.active { display: flex !important; }
        #modal input, #modal select {
            width: 100%;
            padding: 12px;
            background: rgba(5, 191, 219, 0.08);
            border: 1px solid rgba(5, 191, 219, 0.3);
            border-radius: 8px;
            color: white;
            font-size: 16px;
            box-sizing: border-box;
            margin-bottom: 0.5rem;
        }
        #modal input:focus, #modal select:focus {
            outline: none;
            border-color: #05BFDB;
            box-shadow: 0 0 15px rgba(5, 191, 219, 0.3);
        }
        #modal select option { background: #0D264F; color: white; }
        #modal label {
            display: block;
            margin-bottom: 0.5rem;
            color: rgba(255,255,255,0.8);
            font-size: 0.9rem;
        }
        #modal .input-group { margin-bottom: 1rem; }
    `;
    document.head.appendChild(style);
}

// Cerrar modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Abrir modal de transacciones
function openModal(type) {
    createModalStructure();
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) {
        alert('Error al abrir el formulario. Recarga la página.');
        return;
    }

    const isExpense = type === 'expense';
    const isIncome = type === 'income';
    
    if (isExpense || isIncome) {
        modalTitle.textContent = isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso';
        modalBody.innerHTML = generateTransactionFormHTML(isExpense);
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    
    setTimeout(() => {
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 100);
}

// Generar HTML del formulario de transacción
function generateTransactionFormHTML(isExpense) {
    const categoryOptions = isExpense ? `
        <optgroup label="🏠 Gastos Esenciales">
            <option value="Gastos Esenciales">Gastos Esenciales</option>
        </optgroup>
        <optgroup label="🎮 Gastos Discrecionales">
            <option value="Gastos Discrecionales">Gastos Discrecionales</option>
        </optgroup>
        <optgroup label="💳 Deudas">
            <option value="Deudas">Deudas</option>
        </optgroup>
        <optgroup label="🐷 Ahorros">
            <option value="Ahorros">Ahorros</option>
        </optgroup>
        <optgroup label="📈 Inversiones">
            <option value="Inversiones">Inversiones</option>
        </optgroup>
    ` : `
        <option value="Salario">💼 Salario</option>
        <option value="Freelance">💻 Freelance</option>
        <option value="Inversiones">📈 Inversiones</option>
        <option value="Renta">🏠 Renta</option>
        <option value="Otros">📦 Otros</option>
    `;
    
    const today = new Date().toISOString().split('T')[0];
    
    return `
        <form onsubmit="handleTransactionSubmit(event, '${isExpense ? 'expense' : 'income'}')">
            <div class="input-group">
                <label>📝 Descripción</label>
                <input type="text" id="tx-description" placeholder="Ej: ${isExpense ? 'Supermercado' : 'Pago quincenal'}" required>
            </div>
            
            <div class="input-group">
                <label>💵 Monto</label>
                <input type="number" id="tx-amount" placeholder="0.00" step="0.01" min="0.01" required>
            </div>
            
            <div class="input-group">
                <label>📁 Categoría</label>
                <select id="tx-category" required>
                    ${categoryOptions}
                </select>
            </div>
            
            <div class="input-group">
                <label>📅 Fecha</label>
                <input type="date" id="tx-date" value="${today}" required>
            </div>
            
            <div class="input-group" style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="checkbox" id="tx-recurring" onchange="toggleRecurringOptions()" style="width: auto;">
                <label for="tx-recurring" style="margin: 0;">🔄 Es recurrente</label>
            </div>
            
            <div id="recurring-options" style="display: none; margin-bottom: 1rem;">
                <label>Frecuencia</label>
                <select id="tx-frequency">
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly" selected>Mensual</option>
                    <option value="yearly">Anual</option>
                </select>
            </div>
            
            <button type="submit" style="
                width: 100%;
                padding: 1rem;
                background: linear-gradient(135deg, ${isExpense ? '#ef4444, #dc2626' : '#22c55e, #16a34a'});
                color: white;
                border: none;
                border-radius: 10px;
                font-weight: bold;
                font-size: 1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            ">
                ${isExpense ? '💸 Agregar Gasto' : '💰 Agregar Ingreso'}
            </button>
        </form>
    `;
}

// Toggle opciones recurrentes
function toggleRecurringOptions() {
    const checkbox = document.getElementById('tx-recurring');
    const options = document.getElementById('recurring-options');
    if (options) {
        options.style.display = checkbox?.checked ? 'block' : 'none';
    }
}

// Manejar submit de transacción
async function handleTransactionSubmit(event, type) {
    event.preventDefault();
    
    const description = document.getElementById('tx-description')?.value.trim();
    const amount = parseFloat(document.getElementById('tx-amount')?.value);
    const category = document.getElementById('tx-category')?.value;
    const date = document.getElementById('tx-date')?.value;
    const isRecurring = document.getElementById('tx-recurring')?.checked;
    const frequency = document.getElementById('tx-frequency')?.value;
    
    if (!description || !amount || !category || !date) {
        showToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-small"></span> Guardando...';
    submitBtn.disabled = true;
    
    try {
        const isExpense = type === 'expense';
        const data = {
            description,
            amount,
            category,
            date,
            isRecurring: isRecurring || false,
            frequency: isRecurring ? frequency : null
        };
        
        if (isExpense) {
            await addExpense(data);
            checkUnusualExpense(data);
        } else {
            await addIncome(data);
        }
        
        closeModal();
    } catch (error) {
        console.error('Error guardando transacción:', error);
        showToast('Error al guardar', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Modal de detalles de categoría
function showCategoryDetailsBudget(category) {
    createModalStructure();
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    const categoryExpenses = expenses.filter(e => e.category === category);
    const totalSpent = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const budget = budgets[category] || 0;
    const percentage = budget > 0 ? (totalSpent / budget * 100) : 0;
    
    // Agrupar por mes
    const monthlyData = {};
    categoryExpenses.forEach(e => {
        const date = new Date(e.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (e.amount || 0);
    });
    
    let statusText, statusColor;
    if (percentage < 80) {
        statusText = '✅ Bajo control';
        statusColor = '#22c55e';
    } else if (percentage < 100) {
        statusText = '⚡ Cerca del límite';
        statusColor = '#f97316';
    } else {
        statusText = '⚠️ Excedido';
        statusColor = '#ef4444';
    }
    
    const catInfo = categorias.find(c => c.name === category) || { emoji: '📁', color: '#05BFDB' };
    
    modalTitle.textContent = `${catInfo.emoji} ${category}`;
    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div style="text-align: center; padding: 1rem; background: rgba(239,68,68,0.1); border-radius: 12px; border: 1px solid rgba(239,68,68,0.3);">
                <div style="font-size: 0.8rem; opacity: 0.7;">Total Gastado</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #ef4444;">$${totalSpent.toFixed(2)}</div>
            </div>
            <div style="text-align: center; padding: 1rem; background: rgba(5,191,219,0.1); border-radius: 12px; border: 1px solid rgba(5,191,219,0.3);">
                <div style="font-size: 0.8rem; opacity: 0.7;">Presupuesto</div>
                <div style="font-size: 1.5rem; font-weight: bold; color: #05BFDB;">$${budget.toFixed(2)}</div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
            <span style="font-weight: bold;">${percentage.toFixed(1)}%</span>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 1.5rem;">
            <div style="height: 100%; width: ${Math.min(percentage, 100)}%; background: linear-gradient(90deg, ${statusColor}, ${statusColor}aa); border-radius: 8px; transition: width 0.5s;"></div>
        </div>
        
        <h4 style="margin: 0 0 1rem 0;">📊 Gastos por Mes</h4>
        <div style="height: 200px; margin-bottom: 1.5rem;">
            <canvas id="categoryMonthlyChart"></canvas>
        </div>
        
        <h4 style="margin: 0 0 1rem 0;">📋 Historial de Transacciones (${categoryExpenses.length})</h4>
        <div style="max-height: 200px; overflow-y: auto;">
            ${categoryExpenses.length > 0 ? categoryExpenses
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 20)
                .map(e => `
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div>
                            <div style="font-size: 0.9rem;">${e.description || 'Sin descripción'}</div>
                            <div style="font-size: 0.75rem; opacity: 0.6;">${new Date(e.date).toLocaleDateString()}</div>
                        </div>
                        <div style="color: #ef4444; font-weight: bold;">$${(e.amount || 0).toFixed(2)}</div>
                    </div>
                `).join('')
                : '<p style="text-align: center; opacity: 0.6;">Sin transacciones</p>'
            }
        </div>
        
        <button onclick="closeModal()" style="width: 100%; margin-top: 1.5rem; padding: 1rem; border-radius: 10px; background: linear-gradient(135deg, #05BFDB, #088395); color: white; border: none; cursor: pointer; font-weight: bold;">
            Cerrar
        </button>
    `;
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    // Inicializar gráfico
    setTimeout(() => initCategoryMonthlyChart(monthlyData, budget), 100);
}

// Inicializar gráfico mensual de categoría
function initCategoryMonthlyChart(monthlyData, budget) {
    const ctx = document.getElementById('categoryMonthlyChart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    const months = Object.keys(monthlyData).sort();
    const values = months.map(m => monthlyData[m]);
    const budgetLine = months.map(() => budget || 0);
    const monthLabels = months.map(m => {
        const parts = m.split('-');
        const monthNamesShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
        return monthNamesShort[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2);
    });
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: monthLabels.length > 0 ? monthLabels : ['Sin datos'],
            datasets: [
                {
                    label: 'Gastos',
                    data: values.length > 0 ? values : [0],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    borderRadius: 6,
                    order: 2
                },
                {
                    label: 'Presupuesto',
                    data: budgetLine.length > 0 ? budgetLine : [0],
                    type: 'line',
                    borderColor: '#05BFDB',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#05BFDB',
                    pointRadius: 4,
                    fill: false,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: 'white' } } },
            scales: {
                y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } }
            }
        }
    });
}

// Abrir modal de gasto recurrente
function openRecurringModal() {
    toggleFabMenu();
    showRecurringForm();
}

// Abrir modal de ingreso recurrente
function openRecurringIncomeModal() {
    toggleFabMenu();
    showRecurringIncomeFormNew();
}

console.log('✅ modals.js cargado');
