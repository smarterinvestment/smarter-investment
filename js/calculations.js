// ========================================
// 🧮 CALCULATIONS.JS - Cálculos Financieros
// ========================================

// Calcular totales generales
function calculateTotals() {
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = incomeHistory.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + (b || 0), 0);
    const balance = totalIncome - totalExpenses;
    
    return { totalExpenses, totalIncome, totalBudget, balance };
}

// Calcular totales mensuales
function calculateMonthlyTotals() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const monthlyIncomes = incomeHistory.filter(i => {
        const date = new Date(i.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncome = monthlyIncomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    
    // Por categoría
    const byCategory = {};
    categorias.forEach(cat => {
        byCategory[cat.name] = monthlyExpenses
            .filter(e => e.category === cat.name)
            .reduce((sum, e) => sum + (e.amount || 0), 0);
    });
    
    return { totalExpenses, totalIncome, byCategory, monthlyExpenses, monthlyIncomes };
}

// Calcular gastos por descripción
function calculateExpensesByDescription() {
    const descriptionTotals = {};
    
    expenses.forEach(expense => {
        const desc = expense.description || 'Sin descripción';
        if (!descriptionTotals[desc]) {
            descriptionTotals[desc] = 0;
        }
        descriptionTotals[desc] += expense.amount || 0;
    });
    
    // Ordenar por monto descendente
    const sorted = Object.entries(descriptionTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Top 10
    
    return sorted;
}

// Calcular distribución de ingresos
function calculateIncomeDistribution() {
    const total = income.salary + income.freelance + income.investments;
    
    return {
        salary: { amount: income.salary, percentage: total > 0 ? (income.salary / total * 100) : 0 },
        freelance: { amount: income.freelance, percentage: total > 0 ? (income.freelance / total * 100) : 0 },
        investments: { amount: income.investments, percentage: total > 0 ? (income.investments / total * 100) : 0 },
        total
    };
}

// Calcular balance restante
function calculateRemainder() {
    const totals = calculateTotals();
    const monthlyData = calculateMonthlyTotals();
    
    return {
        monthly: monthlyData.totalIncome - monthlyData.totalExpenses,
        total: totals.totalIncome - totals.totalExpenses,
        savingsRate: monthlyData.totalIncome > 0 
            ? ((monthlyData.totalIncome - monthlyData.totalExpenses) / monthlyData.totalIncome * 100) 
            : 0
    };
}

// Calcular tasa de ahorro mensual
function calculateMonthlySavingsRate() {
    const now = new Date();
    const results = [];
    
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthNum = month.getMonth();
        const year = month.getFullYear();
        
        const monthExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === monthNum && d.getFullYear() === year;
        }).reduce((sum, e) => sum + (e.amount || 0), 0);
        
        const monthIncome = incomeHistory.filter(i => {
            const d = new Date(i.date);
            return d.getMonth() === monthNum && d.getFullYear() === year;
        }).reduce((sum, i) => sum + (i.amount || 0), 0);
        
        const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpenses) / monthIncome * 100) : 0;
        
        results.push({
            month: monthNames[monthNum].substring(0, 3),
            year,
            income: monthIncome,
            expenses: monthExpenses,
            savings: monthIncome - monthExpenses,
            rate: savingsRate
        });
    }
    
    return results;
}

// Calcular análisis semanal
function calculateWeeklyAnalysis() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    const currentWeekExpenses = expenses.filter(e => new Date(e.date) >= startOfWeek)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const lastWeekExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= startOfLastWeek && d < startOfWeek;
    }).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const difference = currentWeekExpenses - lastWeekExpenses;
    const percentChange = lastWeekExpenses > 0 
        ? ((difference / lastWeekExpenses) * 100) 
        : 0;
    
    return {
        currentWeek: currentWeekExpenses,
        lastWeek: lastWeekExpenses,
        difference,
        percentChange
    };
}

// Calcular análisis de períodos
function calculatePeriodAnalysis() {
    const now = new Date();
    const type = window.comparisonType || 'weekly';
    
    let currentStart, previousStart, previousEnd;
    let currentDateRange, previousDateRange;
    
    if (type === 'weekly') {
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 7);
        previousStart = new Date(now);
        previousStart.setDate(now.getDate() - 14);
        previousEnd = currentStart;
        
        currentDateRange = formatDateShort(currentStart) + ' - ' + formatDateShort(now);
        previousDateRange = formatDateShort(previousStart) + ' - ' + formatDateShort(previousEnd);
    } else if (type === 'biweekly') {
        currentStart = new Date(now);
        currentStart.setDate(now.getDate() - 15);
        previousStart = new Date(now);
        previousStart.setDate(now.getDate() - 30);
        previousEnd = currentStart;
        
        currentDateRange = formatDateShort(currentStart) + ' - ' + formatDateShort(now);
        previousDateRange = formatDateShort(previousStart) + ' - ' + formatDateShort(previousEnd);
    } else {
        // Mensual - empieza desde el día 1
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        currentDateRange = '1 ' + monthNamesShort[currentStart.getMonth()] + ' - ' + now.getDate() + ' ' + monthNamesShort[now.getMonth()];
        previousDateRange = '1 ' + monthNamesShort[previousStart.getMonth()] + ' - ' + previousEnd.getDate() + ' ' + monthNamesShort[previousEnd.getMonth()];
    }
    
    const currentExpenses = expenses.filter(e => new Date(e.date) >= currentStart)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const previousExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d >= previousStart && d < currentStart;
    }).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const currentIncome = incomeHistory.filter(i => new Date(i.date) >= currentStart)
        .reduce((sum, i) => sum + (i.amount || 0), 0);
    
    const previousIncome = incomeHistory.filter(i => {
        const d = new Date(i.date);
        return d >= previousStart && d < currentStart;
    }).reduce((sum, i) => sum + (i.amount || 0), 0);
    
    const trend = previousExpenses > 0 
        ? ((currentExpenses - previousExpenses) / previousExpenses * 100) 
        : 0;
    
    // Por categoría
    const categories = {};
    expenses.forEach(e => {
        const cat = e.category || 'Otros';
        if (!categories[cat]) categories[cat] = { current: 0, previous: 0 };
        
        const d = new Date(e.date);
        if (d >= currentStart) categories[cat].current += e.amount || 0;
        else if (d >= previousStart && d < currentStart) categories[cat].previous += e.amount || 0;
    });
    
    return {
        current: { expenses: currentExpenses, income: currentIncome },
        previous: { expenses: previousExpenses, income: previousIncome },
        trend,
        categories,
        currentDateRange,
        previousDateRange,
        currentStart,
        previousStart
    };
}

// Calcular días hasta el próximo pago
function calculateDaysUntilPayment(dayOfMonth, frequency) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const targetDay = parseInt(dayOfMonth) || 1;
    let days = 0;
    
    if (frequency === 'weekly') {
        days = 7 - today.getDay();
        if (days === 0) days = 7;
        return { days, text: days + ' días para próximo pago' };
    }
    
    if (frequency === 'biweekly') {
        days = currentDay <= 15 ? (15 - currentDay) : (new Date(currentYear, currentMonth + 1, 0).getDate() - currentDay + 1);
        return { days, text: days + ' días para próximo pago' };
    }
    
    if (frequency === 'yearly') {
        const nextYear = new Date(currentYear + 1, 0, targetDay);
        days = Math.ceil((nextYear - today) / (1000 * 60 * 60 * 24));
        return { days, text: days + ' días para próximo pago' };
    }
    
    // Monthly
    if (targetDay > currentDay) {
        days = targetDay - currentDay;
    } else {
        const lastDayNextMonth = new Date(currentYear, currentMonth + 2, 0).getDate();
        const nextTargetDay = Math.min(targetDay, lastDayNextMonth);
        const nextPayDate = new Date(currentYear, currentMonth + 1, nextTargetDay);
        days = Math.ceil((nextPayDate - today) / (1000 * 60 * 60 * 24));
    }
    
    if (days === 0) return { days: 0, text: '¡Hoy es día de pago!' };
    if (days === 1) return { days: 1, text: 'Mañana es día de pago' };
    return { days, text: days + ' días para próximo pago' };
}

// Formatear fecha corta
function formatDateShort(date) {
    const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return date.getDate() + ' ' + monthNamesShort[date.getMonth()];
}

// Obtener emoji de meta
function getGoalEmoji(type) {
    const emojis = {
        'emergency': '🆘',
        'vacation': '🏖️',
        'purchase': '🛍️',
        'retirement': '👴',
        'education': '📚',
        'car': '🚗',
        'home': '🏠',
        'other': '🎯'
    };
    return emojis[type] || '🎯';
}

// Verificar gasto inusual
function checkUnusualExpense(expense) {
    const categoryExpenses = expenses.filter(e => e.category === expense.category);
    const avgAmount = categoryExpenses.length > 0
        ? categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length
        : 0;
    
    if (avgAmount > 0 && expense.amount > avgAmount * 3) {
        showToast(`⚠️ Este gasto es ${Math.round(expense.amount / avgAmount)}x mayor que tu promedio en ${expense.category}`, 'warning');
    }
}

// Verificar alertas de presupuesto
function checkBudgetAlerts(category) {
    if (!category || !budgets[category]) return;
    
    const spent = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const budget = budgets[category];
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 100) {
        showToast(`🚨 ¡Excediste tu presupuesto de ${category}!`, 'error');
    } else if (percentage >= 80) {
        showToast(`⚠️ Has usado el ${percentage.toFixed(0)}% de tu presupuesto de ${category}`, 'warning');
    }
}

console.log('✅ calculations.js cargado');
