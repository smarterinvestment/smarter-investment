/**
 * 📊 REPORTS MODULE - PARTE 3: REPORTES INTERACTIVOS (NUEVO)
 * ============================================================
 * Sistema completo de reportes y análisis financieros
 * 
 * Características:
 * ✅ Click en categorías para ver detalles completos
 * ✅ Gráficos comparativos mensuales (Chart.js)
 * ✅ Historial completo de transacciones con filtros
 * ✅ Estadísticas detalladas por período
 * ✅ Comparación mes a mes
 * ✅ Análisis de tendencias
 * ✅ Exportar a CSV
 * ✅ Resumen ejecutivo
 * ✅ Top gastos y categorías
 */

class ReportsModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.expenses = [];
        this.incomes = [];
        this.budgets = {};
        this.currentPeriod = 'month'; // month, quarter, year
        this.selectedCategory = null;
        this.chartInstances = {};
    }

    /**
     * 🚀 Inicializar módulo
     */
    async initialize() {
        try {
            console.log('📊 Inicializando módulo de reportes...');
            
            // Cargar datos
            await this.loadAllData();
            
            console.log('✅ Módulo de reportes inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando reportes:', error);
            return false;
        }
    }

    /**
     * 📥 Cargar todos los datos
     */
    async loadAllData() {
        try {
            // Cargar últimos 12 meses de gastos
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
            
            const expensesSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('expenses')
                .where('date', '>=', this.formatDate(twelveMonthsAgo))
                .get();
            
            this.expenses = expensesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar ingresos
            const incomesSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('incomes')
                .where('date', '>=', this.formatDate(twelveMonthsAgo))
                .get();
            
            this.incomes = incomesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Cargar presupuestos
            const budgetsSnap = await this.db
                .collection('users')
                .doc(this.userId)
                .collection('settings')
                .doc('budgets')
                .get();
            
            if (budgetsSnap.exists) {
                this.budgets = budgetsSnap.data();
            }
            
            console.log(`✅ Datos cargados: ${this.expenses.length} gastos, ${this.incomes.length} ingresos`);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }

    /**
     * 📊 Generar reporte del período actual
     */
    generateReport(period = 'month') {
        const { startDate, endDate } = this.getPeriodDates(period);
        
        // Filtrar datos del período
        const periodExpenses = this.filterByDateRange(this.expenses, startDate, endDate);
        const periodIncomes = this.filterByDateRange(this.incomes, startDate, endDate);
        
        // Calcular totales
        const totalExpenses = this.calculateTotal(periodExpenses);
        const totalIncome = this.calculateTotal(periodIncomes);
        const balance = totalIncome - totalExpenses;
        
        // Análisis por categoría
        const categoryAnalysis = this.analyzeBycategory(periodExpenses);
        
        // Top gastos
        const topExpenses = [...periodExpenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);
        
        // Comparación con período anterior
        const previousPeriod = this.getPreviousPeriod(period);
        const comparison = this.compareWithPrevious(period, previousPeriod);
        
        // Tendencias
        const trends = this.analyzeTrends(period);
        
        return {
            period: {
                type: period,
                startDate,
                endDate,
                label: this.getPeriodLabel(period)
            },
            summary: {
                totalIncome,
                totalExpenses,
                balance,
                savingsRate: totalIncome > 0 ? (balance / totalIncome) * 100 : 0,
                transactionCount: periodExpenses.length + periodIncomes.length
            },
            expenses: {
                total: totalExpenses,
                count: periodExpenses.length,
                average: periodExpenses.length > 0 ? totalExpenses / periodExpenses.length : 0,
                byCategory: categoryAnalysis,
                top: topExpenses
            },
            incomes: {
                total: totalIncome,
                count: periodIncomes.length,
                average: periodIncomes.length > 0 ? totalIncome / periodIncomes.length : 0,
                byType: this.analyzeByType(periodIncomes)
            },
            comparison,
            trends,
            budgetCompliance: this.analyzeBudgetCompliance(categoryAnalysis)
        };
    }

    /**
     * 📈 Analizar por categoría
     */
    analyzeBycategory(expenses) {
        const categories = {};
        
        expenses.forEach(expense => {
            const category = expense.category || 'Sin categoría';
            if (!categories[category]) {
                categories[category] = {
                    name: category,
                    total: 0,
                    count: 0,
                    transactions: [],
                    percentage: 0,
                    budget: this.budgets[category] || 0,
                    budgetUsed: 0
                };
            }
            
            categories[category].total += parseFloat(expense.amount || 0);
            categories[category].count += 1;
            categories[category].transactions.push(expense);
        });
        
        // Calcular porcentajes y uso de presupuesto
        const totalExpenses = Object.values(categories).reduce((sum, cat) => sum + cat.total, 0);
        
        Object.values(categories).forEach(category => {
            category.percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;
            if (category.budget > 0) {
                category.budgetUsed = (category.total / category.budget) * 100;
            }
        });
        
        return categories;
    }

    /**
     * 📊 Analizar por tipo (ingresos)
     */
    analyzeByType(incomes) {
        const types = {};
        
        incomes.forEach(income => {
            const type = income.type || 'Otro';
            if (!types[type]) {
                types[type] = {
                    name: type,
                    total: 0,
                    count: 0,
                    percentage: 0
                };
            }
            
            types[type].total += parseFloat(income.amount || 0);
            types[type].count += 1;
        });
        
        // Calcular porcentajes
        const totalIncome = Object.values(types).reduce((sum, type) => sum + type.total, 0);
        Object.values(types).forEach(type => {
            type.percentage = totalIncome > 0 ? (type.total / totalIncome) * 100 : 0;
        });
        
        return types;
    }

    /**
     * 📉 Comparar con período anterior
     */
    compareWithPrevious(currentPeriod, previousPeriod) {
        const current = this.generateReport(currentPeriod);
        const previous = this.generateReport(previousPeriod);
        
        const expenseDiff = current.summary.totalExpenses - previous.summary.totalExpenses;
        const incomeDiff = current.summary.totalIncome - previous.summary.totalIncome;
        const balanceDiff = current.summary.balance - previous.summary.balance;
        
        return {
            expenses: {
                current: current.summary.totalExpenses,
                previous: previous.summary.totalExpenses,
                difference: expenseDiff,
                percentageChange: previous.summary.totalExpenses > 0 
                    ? (expenseDiff / previous.summary.totalExpenses) * 100 
                    : 0,
                trend: expenseDiff > 0 ? 'up' : expenseDiff < 0 ? 'down' : 'stable'
            },
            income: {
                current: current.summary.totalIncome,
                previous: previous.summary.totalIncome,
                difference: incomeDiff,
                percentageChange: previous.summary.totalIncome > 0 
                    ? (incomeDiff / previous.summary.totalIncome) * 100 
                    : 0,
                trend: incomeDiff > 0 ? 'up' : incomeDiff < 0 ? 'down' : 'stable'
            },
            balance: {
                current: current.summary.balance,
                previous: previous.summary.balance,
                difference: balanceDiff,
                trend: balanceDiff > 0 ? 'up' : balanceDiff < 0 ? 'down' : 'stable'
            }
        };
    }

    /**
     * 📊 Analizar tendencias (últimos 6 meses)
     */
    analyzeTrends(period = 'month') {
        const months = [];
        const currentDate = new Date();
        
        // Obtener últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const monthExpenses = this.filterByDateRange(this.expenses, monthStart, monthEnd);
            const monthIncomes = this.filterByDateRange(this.incomes, monthStart, monthEnd);
            
            months.push({
                label: this.getMonthLabel(date),
                expenses: this.calculateTotal(monthExpenses),
                income: this.calculateTotal(monthIncomes),
                balance: this.calculateTotal(monthIncomes) - this.calculateTotal(monthExpenses),
                transactions: monthExpenses.length + monthIncomes.length
            });
        }
        
        // Calcular promedios
        const avgExpenses = months.reduce((sum, m) => sum + m.expenses, 0) / months.length;
        const avgIncome = months.reduce((sum, m) => sum + m.income, 0) / months.length;
        const avgBalance = months.reduce((sum, m) => sum + m.balance, 0) / months.length;
        
        return {
            months,
            averages: {
                expenses: avgExpenses,
                income: avgIncome,
                balance: avgBalance
            },
            trend: this.calculateTrendDirection(months)
        };
    }

    /**
     * 📐 Calcular dirección de tendencia
     */
    calculateTrendDirection(data) {
        if (data.length < 2) return 'stable';
        
        const recent = data.slice(-3);
        const older = data.slice(0, 3);
        
        const recentAvg = recent.reduce((sum, d) => sum + d.balance, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d.balance, 0) / older.length;
        
        const diff = recentAvg - olderAvg;
        
        if (diff > 100) return 'improving';
        if (diff < -100) return 'declining';
        return 'stable';
    }

    /**
     * 💰 Analizar cumplimiento de presupuesto
     */
    analyzeBudgetCompliance(categoryAnalysis) {
        const compliance = {
            total: 0,
            onTrack: 0,
            warning: 0,
            exceeded: 0,
            categories: []
        };
        
        Object.values(categoryAnalysis).forEach(category => {
            if (category.budget > 0) {
                compliance.total++;
                
                let status = 'on-track';
                if (category.budgetUsed >= 100) {
                    status = 'exceeded';
                    compliance.exceeded++;
                } else if (category.budgetUsed >= 80) {
                    status = 'warning';
                    compliance.warning++;
                } else {
                    compliance.onTrack++;
                }
                
                compliance.categories.push({
                    name: category.name,
                    spent: category.total,
                    budget: category.budget,
                    used: category.budgetUsed,
                    status
                });
            }
        });
        
        return compliance;
    }

    /**
     * 🔍 Obtener detalles de categoría
     */
    getCategoryDetails(categoryName) {
        const categoryExpenses = this.expenses.filter(e => e.category === categoryName);
        
        // Análisis por mes
        const byMonth = {};
        categoryExpenses.forEach(expense => {
            const month = expense.date.substring(0, 7); // YYYY-MM
            if (!byMonth[month]) {
                byMonth[month] = {
                    total: 0,
                    count: 0,
                    transactions: []
                };
            }
            byMonth[month].total += parseFloat(expense.amount || 0);
            byMonth[month].count += 1;
            byMonth[month].transactions.push(expense);
        });
        
        // Top transacciones
        const topTransactions = [...categoryExpenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 20);
        
        // Estadísticas
        const total = categoryExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const average = categoryExpenses.length > 0 ? total / categoryExpenses.length : 0;
        const max = categoryExpenses.length > 0 
            ? Math.max(...categoryExpenses.map(e => parseFloat(e.amount || 0))) 
            : 0;
        const min = categoryExpenses.length > 0 
            ? Math.min(...categoryExpenses.map(e => parseFloat(e.amount || 0))) 
            : 0;
        
        return {
            category: categoryName,
            total,
            count: categoryExpenses.length,
            statistics: {
                average,
                max,
                min,
                median: this.calculateMedian(categoryExpenses.map(e => parseFloat(e.amount || 0)))
            },
            byMonth,
            topTransactions,
            allTransactions: categoryExpenses.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            )
        };
    }

    /**
     * 📊 Crear gráfico comparativo mensual
     */
    createMonthlyComparisonChart(canvasId, months = 6) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior si existe
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }
        
        // Obtener datos de últimos meses
        const data = this.getMonthlyData(months);
        
        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: data.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Gastos',
                        data: data.expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Balance',
                        data: data.balance,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#9ca3af',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
        
        return this.chartInstances[canvasId];
    }

    /**
     * 📊 Crear gráfico de categorías
     */
    createCategoryChart(canvasId, interactive = true) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }
        
        const report = this.generateReport('month');
        const categories = Object.values(report.expenses.byCategory)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(c => c.name),
                datasets: [{
                    data: categories.map(c => c.total),
                    backgroundColor: [
                        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
                        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#e5e7eb',
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                return data.labels.map((label, i) => ({
                                    text: `${label}: $${data.datasets[0].data[i].toFixed(0)}`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                }));
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                },
                onClick: interactive ? (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const categoryName = categories[index].name;
                        this.onCategoryClick(categoryName);
                    }
                } : undefined
            }
        });
        
        this.chartInstances[canvasId] = chart;
        return chart;
    }

    /**
     * 🖱️ Evento click en categoría
     */
    onCategoryClick(categoryName) {
        this.selectedCategory = categoryName;
        
        // Callback para app.js
        if (window.onCategoryDetailRequest) {
            window.onCategoryDetailRequest(categoryName);
        }
        
        console.log('📊 Categoría seleccionada:', categoryName);
    }

    /**
     * 📤 Exportar a CSV
     */
    exportToCSV(filename = 'reporte-financiero.csv') {
        const report = this.generateReport('month');
        
        let csv = 'Tipo,Categoría/Tipo,Fecha,Descripción,Monto\n';
        
        // Agregar gastos
        this.expenses.forEach(expense => {
            csv += `Gasto,"${expense.category}","${expense.date}","${expense.description}",${expense.amount}\n`;
        });
        
        // Agregar ingresos
        this.incomes.forEach(income => {
            csv += `Ingreso,"${income.type}","${income.date}","${income.description}",${income.amount}\n`;
        });
        
        // Crear archivo y descargar
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        this.showNotification('✅ Archivo CSV descargado', 'success');
    }

    /**
     * 🔧 Utilidades
     */
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getPeriodDates(period) {
        const now = new Date();
        let startDate, endDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                endDate = now;
                break;
                
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
                
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
                
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
                
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }
        
        return { startDate, endDate };
    }

    getPreviousPeriod(period) {
        // Devuelve el periodo anterior al dado
        return period; // Placeholder - implementar lógica completa
    }

    getPeriodLabel(period) {
        const labels = {
            week: 'Esta Semana',
            month: 'Este Mes',
            quarter: 'Este Trimestre',
            year: 'Este Año'
        };
        return labels[period] || 'Período';
    }

    getMonthLabel(date) {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    filterByDateRange(items, startDate, endDate) {
        return items.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    }

    calculateTotal(items) {
        return items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    }

    calculateMedian(numbers) {
        if (numbers.length === 0) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }

    getMonthlyData(months) {
        const data = {
            labels: [],
            income: [],
            expenses: [],
            balance: []
        };
        
        const currentDate = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setMonth(date.getMonth() - i);
            
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const monthExpenses = this.filterByDateRange(this.expenses, monthStart, monthEnd);
            const monthIncomes = this.filterByDateRange(this.incomes, monthStart, monthEnd);
            
            const expenseTotal = this.calculateTotal(monthExpenses);
            const incomeTotal = this.calculateTotal(monthIncomes);
            
            data.labels.push(this.getMonthLabel(date));
            data.income.push(incomeTotal);
            data.expenses.push(expenseTotal);
            data.balance.push(incomeTotal - expenseTotal);
        }
        
        return data;
    }

    showNotification(message, type = 'info') {
        if (window.Toastify) {
            const backgrounds = {
                success: 'linear-gradient(to right, #10b981, #059669)',
                error: 'linear-gradient(to right, #ef4444, #dc2626)',
                info: 'linear-gradient(to right, #3b82f6, #2563eb)'
            };
            
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'top',
                position: 'right',
                style: {
                    background: backgrounds[type] || backgrounds.info
                }
            }).showToast();
        }
    }

    /**
     * 🧹 Limpiar gráficos
     */
    destroyAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.chartInstances = {};
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReportsModule = ReportsModule;
}

console.log('✅ Módulo de Reportes Interactivos cargado');
