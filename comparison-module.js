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
     */
    renderComparisonView(expenses, currentMonth, previousMonth) {
        if (!this.isInitialized) {
            console.warn('⚠️ Módulo de comparación no está inicializado');
            return '<div class="comparison-error">Módulo de comparación no disponible</div>';
        }

        try {
            // Calcular totales
            const currentTotal = expenses
                .filter(e => this.isInMonth(e.date, currentMonth))
                .reduce((sum, e) => sum + (e.amount || 0), 0);

            const previousTotal = expenses
                .filter(e => this.isInMonth(e.date, previousMonth))
                .reduce((sum, e) => sum + (e.amount || 0), 0);

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
                            ${this.getMonthName(currentMonth)} vs ${this.getMonthName(previousMonth)}
                        </p>
                    </div>

                    <div class="comparison-stats">
                        <div class="stat-card">
                            <div class="stat-label">Mes Anterior</div>
                            <div class="stat-value">$${previousTotal.toFixed(2)}</div>
                        </div>

                        <div class="stat-card current">
                            <div class="stat-label">Mes Actual</div>
                            <div class="stat-value">$${currentTotal.toFixed(2)}</div>
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
                </div>
            `;
        } catch (error) {
            console.error('Error al renderizar comparación:', error);
            return '<div class="comparison-error">Error al cargar comparación</div>';
        }
    }

    /**
     * Verificar si una fecha está en un mes específico
     */
    isInMonth(dateString, monthDate) {
        try {
            const date = new Date(dateString);
            const month = new Date(monthDate);
            return date.getMonth() === month.getMonth() && 
                   date.getFullYear() === month.getFullYear();
        } catch (error) {
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
        const d = new Date(date);
        return months[d.getMonth()];
    }

    /**
     * Generar análisis automático
     */
    generateAnalysis(difference, percentChange, isIncrease) {
        let message = '';
        let icon = '';
        let className = '';

        if (Math.abs(percentChange) < 5) {
            icon = '📊';
            className = 'neutral';
            message = 'Tus gastos se mantienen estables. Sigue así para mantener el control.';
        } else if (isIncrease) {
            if (percentChange > 20) {
                icon = '⚠️';
                className = 'warning';
                message = `Tus gastos aumentaron ${percentChange}%. Revisa tus gastos discrecionales.`;
            } else {
                icon = '📈';
                className = 'caution';
                message = `Ligero aumento del ${percentChange}%. Mantén el control de tus gastos.`;
            }
        } else {
            icon = '✅';
            className = 'success';
            message = `¡Excelente! Redujiste tus gastos en ${Math.abs(percentChange)}%. Sigue así.`;
        }

        return `
            <div class="analysis-message ${className}">
                <span class="analysis-icon">${icon}</span>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Obtener comparación por categorías
     */
    getCategoryComparison(expenses, currentMonth, previousMonth) {
        const categories = {};
        
        // Procesar gastos actuales
        expenses
            .filter(e => this.isInMonth(e.date, currentMonth))
            .forEach(expense => {
                const cat = expense.category || 'Sin categoría';
                if (!categories[cat]) {
                    categories[cat] = { current: 0, previous: 0 };
                }
                categories[cat].current += expense.amount || 0;
            });

        // Procesar gastos previos
        expenses
            .filter(e => this.isInMonth(e.date, previousMonth))
            .forEach(expense => {
                const cat = expense.category || 'Sin categoría';
                if (!categories[cat]) {
                    categories[cat] = { current: 0, previous: 0 };
                }
                categories[cat].previous += expense.amount || 0;
            });

        return categories;
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ComparisonModule = ComparisonModule;
}

console.log('✅ Módulo de comparación cargado');
