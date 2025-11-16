/**
 * 📊 COMPARISON MODULE - Módulo de Comparación de Gastos
 * ========================================================
 * Sistema de comparación y análisis de gastos entre períodos
 * 
 * Características:
 * ✅ Comparar gastos entre meses
 * ✅ Gráficos de tendencias
 * ✅ Análisis de variaciones
 * ✅ Detección de patrones
 * ✅ Recomendaciones automáticas
 * 
 * 🔧 CORREGIDO: Validación de expenses para evitar errores de filter
 */

class ComparisonModule {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.isInitialized = false;
    }

    /**
     * Inicializar el módulo
     */
    async initialize(userId) {
        try {
            this.userId = userId;
            this.isInitialized = true;
            console.log('✅ Módulo de comparación inicializado');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar módulo de comparación:', error);
            return false;
        }
    }

    /**
     * Renderizar vista de comparación
     * 🔧 CORREGIDO: Validación de expenses
     */
    renderComparisonView(expenses, currentMonth, previousMonth) {
        if (!this.isInitialized) {
            console.warn('⚠️ Módulo de comparación no está inicializado');
            return '<div class="comparison-error">Módulo de comparación no disponible</div>';
        }

        // ✅ VALIDAR que expenses sea un array
        if (!expenses || !Array.isArray(expenses)) {
            console.warn('⚠️ No hay datos de gastos para comparar');
            return this.renderEmptyState();
        }

        try {
            // ✅ Validar fechas
            const current = currentMonth ? new Date(currentMonth) : new Date();
            const previous = previousMonth ? new Date(previousMonth) : new Date(current.getFullYear(), current.getMonth() - 1, 1);

            // Calcular totales
            const currentTotal = expenses
                .filter(e => e && e.date && this.isInMonth(e.date, current))
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

            const previousTotal = expenses
                .filter(e => e && e.date && this.isInMonth(e.date, previous))
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

            const difference = currentTotal - previousTotal;
            const percentChange = previousTotal > 0 
                ? ((difference / previousTotal) * 100).toFixed(1)
                : 0;

            const isIncrease = difference > 0;

            // Generar HTML
            return `
                <div class="comparison-container">
                    <div class="comparison-header">
                        <h3>📊 Comparación de Gastos</h3>
                        <p class="comparison-subtitle">
                            ${this.getMonthName(current)} vs ${this.getMonthName(previous)}
                        </p>
                    </div>

                    <div class="comparison-stats">
                        <div class="stat-card">
                            <div class="stat-label">Mes Anterior</div>
                            <div class="stat-value">$${previousTotal.toFixed(2)}</div>
                            <div class="stat-count">${this.countExpensesInMonth(expenses, previous)} gastos</div>
                        </div>

                        <div class="stat-card current">
                            <div class="stat-label">Mes Actual</div>
                            <div class="stat-value">$${currentTotal.toFixed(2)}</div>
                            <div class="stat-count">${this.countExpensesInMonth(expenses, current)} gastos</div>
                        </div>

                        <div class="stat-card ${isIncrease ? 'negative' : 'positive'}">
                            <div class="stat-label">Diferencia</div>
                            <div class="stat-value">
                                ${isIncrease ? '↑' : '↓'} $${Math.abs(difference).toFixed(2)}
                                <span class="percent">(${percentChange}%)</span>
                            </div>
                        </div>
                    </div>

                    <div class="comparison-analysis">
                        ${this.generateAnalysis(difference, percentChange, isIncrease)}
                    </div>

                    ${this.renderCategoryBreakdown(expenses, current, previous)}
                </div>
            `;
        } catch (error) {
            console.error('Error al renderizar comparación:', error);
            return `<div class="comparison-error">
                <p>⚠️ Error al cargar comparación</p>
                <small>${error.message}</small>
            </div>`;
        }
    }

    /**
     * Renderizar estado vacío
     */
    renderEmptyState() {
        return `
            <div class="comparison-empty">
                <div class="empty-icon">📊</div>
                <h3>No hay datos para comparar</h3>
                <p>Registra algunos gastos para ver la comparación entre meses</p>
            </div>
        `;
    }

    /**
     * Contar gastos en un mes
     */
    countExpensesInMonth(expenses, monthDate) {
        if (!expenses || !Array.isArray(expenses)) return 0;
        return expenses.filter(e => e && e.date && this.isInMonth(e.date, monthDate)).length;
    }

    /**
     * Renderizar desglose por categorías
     */
    renderCategoryBreakdown(expenses, currentMonth, previousMonth) {
        const categories = this.getCategoryComparison(expenses, currentMonth, previousMonth);
        
        if (Object.keys(categories).length === 0) {
            return '';
        }

        const categoriesHtml = Object.entries(categories)
            .sort((a, b) => b[1].current - a[1].current)
            .slice(0, 5) // Top 5 categorías
            .map(([cat, data]) => {
                const change = data.current - data.previous;
                const isIncrease = change > 0;
                const icon = isIncrease ? '↑' : '↓';
                const colorClass = isIncrease ? 'negative' : 'positive';
                
                return `
                    <div class="category-comparison-item">
                        <div class="category-name">${cat}</div>
                        <div class="category-values">
                            <span class="previous">$${data.previous.toFixed(2)}</span>
                            <span class="arrow ${colorClass}">${icon}</span>
                            <span class="current">$${data.current.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            })
            .join('');

        return `
            <div class="category-breakdown">
                <h4>📈 Top Categorías</h4>
                <div class="category-list">
                    ${categoriesHtml}
                </div>
            </div>
        `;
    }

    /**
     * Verificar si una fecha está en un mes específico
     * 🔧 CORREGIDO: Mejor manejo de fechas
     */
    isInMonth(dateString, monthDate) {
        try {
            if (!dateString || !monthDate) return false;
            
            const date = new Date(dateString);
            const month = new Date(monthDate);
            
            // Validar que las fechas sean válidas
            if (isNaN(date.getTime()) || isNaN(month.getTime())) {
                return false;
            }
            
            return date.getMonth() === month.getMonth() && 
                   date.getFullYear() === month.getFullYear();
        } catch (error) {
            console.error('Error al comparar fechas:', error);
            return false;
        }
    }

    /**
     * Obtener nombre del mes
     */
    getMonthName(date) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                return 'Mes desconocido';
            }
            return months[d.getMonth()] || 'Mes desconocido';
        } catch (error) {
            return 'Mes desconocido';
        }
    }

    /**
     * Generar análisis automático
     */
    generateAnalysis(difference, percentChange, isIncrease) {
        let message = '';
        let icon = '';
        let className = '';
        let tip = '';

        if (Math.abs(percentChange) < 5) {
            icon = '📊';
            className = 'neutral';
            message = 'Tus gastos se mantienen estables. Sigue así para mantener el control.';
            tip = 'Considera revisar tus presupuestos para optimizar aún más.';
        } else if (isIncrease) {
            if (percentChange > 20) {
                icon = '⚠️';
                className = 'warning';
                message = `Tus gastos aumentaron ${percentChange}%. Esto requiere atención inmediata.`;
                tip = 'Revisa tus gastos discrecionales y ajusta tu presupuesto.';
            } else {
                icon = '📈';
                className = 'caution';
                message = `Ligero aumento del ${percentChange}%. Mantén el control de tus gastos.`;
                tip = 'Identifica las categorías con mayor incremento y ajusta.';
            }
        } else {
            icon = '✅';
            className = 'success';
            message = `¡Excelente! Redujiste tus gastos en ${Math.abs(percentChange)}%.`;
            tip = 'Mantén estos buenos hábitos y considera invertir los ahorros.';
        }

        return `
            <div class="analysis-message ${className}">
                <div class="analysis-header">
                    <span class="analysis-icon">${icon}</span>
                    <p class="analysis-text">${message}</p>
                </div>
                <div class="analysis-tip">
                    <strong>💡 Consejo:</strong> ${tip}
                </div>
            </div>
        `;
    }

    /**
     * Obtener comparación por categorías
     * 🔧 CORREGIDO: Mejor validación de datos
     */
    getCategoryComparison(expenses, currentMonth, previousMonth) {
        const categories = {};
        
        if (!expenses || !Array.isArray(expenses)) {
            return categories;
        }
        
        // Procesar gastos actuales
        expenses
            .filter(e => e && e.date && this.isInMonth(e.date, currentMonth))
            .forEach(expense => {
                const cat = expense.category || 'Sin categoría';
                if (!categories[cat]) {
                    categories[cat] = { current: 0, previous: 0 };
                }
                categories[cat].current += parseFloat(expense.amount) || 0;
            });

        // Procesar gastos previos
        expenses
            .filter(e => e && e.date && this.isInMonth(e.date, previousMonth))
            .forEach(expense => {
                const cat = expense.category || 'Sin categoría';
                if (!categories[cat]) {
                    categories[cat] = { current: 0, previous: 0 };
                }
                categories[cat].previous += parseFloat(expense.amount) || 0;
            });

        return categories;
    }

    /**
     * Obtener tendencia de gastos (últimos 6 meses)
     */
    getExpenseTrend(expenses, months = 6) {
        if (!expenses || !Array.isArray(expenses)) {
            return [];
        }

        const trend = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthExpenses = expenses
                .filter(e => e && e.date && this.isInMonth(e.date, monthDate))
                .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            
            trend.push({
                month: this.getMonthName(monthDate),
                amount: monthExpenses
            });
        }

        return trend;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ComparisonModule = ComparisonModule;
}

console.log('✅ Módulo de comparación cargado (versión corregida)');
