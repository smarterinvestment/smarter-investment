/**
 * 📊 RECURRING CHARTS MODULE
 * ==========================
 * Gráficos para visualizar gastos recurrentes
 */

class RecurringChartsModule {
    constructor() {
        this.charts = {
            distribution: null,
            trend: null,
            comparison: null
        };
    }

    /**
     * 🎨 Renderizar todos los gráficos
     */
    renderAllCharts(recurringExpenses, realExpenses) {
        return `
            <div class="recurring-charts">
                <!-- Gráfico 1: Distribución por categoría -->
                <div class="chart-container">
                    <div class="chart-title">📊 Distribución por Categoría</div>
                    <canvas id="recurring-distribution-chart" class="chart-canvas"></canvas>
                </div>
                
                <!-- Gráfico 2: Tendencia mensual -->
                <div class="chart-container">
                    <div class="chart-title">📈 Tendencia Mensual Estimada</div>
                    <canvas id="recurring-trend-chart" class="chart-canvas"></canvas>
                </div>
                
                <!-- Gráfico 3: Recurrentes vs Reales -->
                <div class="chart-container">
                    <div class="chart-title">📊 Recurrentes vs Gastos Reales</div>
                    <canvas id="recurring-comparison-chart" class="chart-canvas"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * 🎨 Inicializar gráficos después de renderizar
     */
    initializeCharts(recurringExpenses, realExpenses) {
        // Esperar a que Chart.js esté disponible
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.initializeCharts(recurringExpenses, realExpenses), 100);
            return;
        }

        this.renderDistributionChart(recurringExpenses);
        this.renderTrendChart(recurringExpenses);
        this.renderComparisonChart(recurringExpenses, realExpenses);
    }

    /**
     * 📊 Gráfico de distribución por categoría
     */
    renderDistributionChart(recurringExpenses) {
        const canvas = document.getElementById('recurring-distribution-chart');
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.charts.distribution) {
            this.charts.distribution.destroy();
        }

        // Agrupar por categoría
        const categoryData = {};
        recurringExpenses.filter(e => e.active).forEach(expense => {
            const category = expense.category || 'Sin categoría';
            categoryData[category] = (categoryData[category] || 0) + expense.amount;
        });

        const categories = Object.keys(categoryData);
        const amounts = Object.values(categoryData);

        // Colores para cada categoría
        const colors = [
            'rgba(5, 191, 219, 0.8)',
            'rgba(8, 131, 149, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(244, 67, 54, 0.8)'
        ];

        const ctx = canvas.getContext('2d');
        this.charts.distribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: amounts,
                    backgroundColor: colors,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 15,
                            font: {
                                size: 12
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
                }
            }
        });
    }

    /**
     * 📈 Gráfico de tendencia mensual
     */
    renderTrendChart(recurringExpenses) {
        const canvas = document.getElementById('recurring-trend-chart');
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }

        // Calcular estimados mensuales de los próximos 6 meses
        const months = [];
        const amounts = [];
        const today = new Date();

        for (let i = 0; i < 6; i++) {
            const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const monthName = month.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            months.push(monthName);

            // Calcular total estimado para ese mes
            let monthlyTotal = 0;
            recurringExpenses.filter(e => e.active).forEach(expense => {
                // Calcular cuántas veces ocurre en el mes según la frecuencia
                const occurrences = this.calculateMonthlyOccurrences(expense.frequency);
                monthlyTotal += expense.amount * occurrences;
            });
            amounts.push(monthlyTotal);
        }

        const ctx = canvas.getContext('2d');
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gasto Recurrente Estimado',
                    data: amounts,
                    borderColor: 'rgba(5, 191, 219, 1)',
                    backgroundColor: 'rgba(5, 191, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(5, 191, 219, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * 📊 Gráfico de comparación: Recurrentes vs Reales
     */
    renderComparisonChart(recurringExpenses, realExpenses) {
        const canvas = document.getElementById('recurring-comparison-chart');
        if (!canvas) return;

        // Destruir gráfico anterior si existe
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }

        // Calcular total estimado mensual
        let recurringMonthly = 0;
        recurringExpenses.filter(e => e.active).forEach(expense => {
            const occurrences = this.calculateMonthlyOccurrences(expense.frequency);
            recurringMonthly += expense.amount * occurrences;
        });

        // Calcular gastos reales del mes actual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const realMonthly = realExpenses
            .filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + (e.amount || 0), 0);

        const ctx = canvas.getContext('2d');
        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Este Mes'],
                datasets: [
                    {
                        label: 'Gastos Recurrentes (Estimado)',
                        data: [recurringMonthly],
                        backgroundColor: 'rgba(5, 191, 219, 0.8)',
                        borderColor: 'rgba(5, 191, 219, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Gastos Reales',
                        data: [realMonthly],
                        backgroundColor: 'rgba(8, 131, 149, 0.8)',
                        borderColor: 'rgba(8, 131, 149, 1)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    /**
     * 🔢 Calcular ocurrencias mensuales según frecuencia
     */
    calculateMonthlyOccurrences(frequency) {
        const frequencies = {
            'daily': 30,
            'weekly': 4,
            'biweekly': 2,
            'monthly': 1,
            'annual': 1/12
        };
        return frequencies[frequency] || 1;
    }

    /**
     * 🗑️ Destruir todos los gráficos
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {
            distribution: null,
            trend: null,
            comparison: null
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.RecurringChartsModule = RecurringChartsModule;
}

console.log('✅ Módulo de gráficos de gastos recurrentes cargado');
