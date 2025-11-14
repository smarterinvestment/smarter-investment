/**
 * ✅ FORM VALIDATOR - Sistema de Validación de Formularios
 * =========================================================
 * Sistema robusto y flexible para validar datos de formularios
 */

class FormValidator {
    constructor() {
        this.rules = {
            // Reglas básicas
            required: (value, params, fieldName) => {
                if (value === null || value === undefined || value === '' || 
                    (Array.isArray(value) && value.length === 0)) {
                    return `${fieldName} es requerido`;
                }
                return null;
            },
            
            email: (value, params, fieldName) => {
                if (!value) return null;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return `${fieldName} debe ser un email válido`;
                }
                return null;
            },
            
            min: (value, params, fieldName) => {
                if (!value) return null;
                const min = params[0];
                if (typeof value === 'number' && value < min) {
                    return `${fieldName} debe ser mayor o igual a ${min}`;
                }
                if (typeof value === 'string' && value.length < min) {
                    return `${fieldName} debe tener al menos ${min} caracteres`;
                }
                return null;
            },
            
            max: (value, params, fieldName) => {
                if (!value) return null;
                const max = params[0];
                if (typeof value === 'number' && value > max) {
                    return `${fieldName} debe ser menor o igual a ${max}`;
                }
                if (typeof value === 'string' && value.length > max) {
                    return `${fieldName} debe tener máximo ${max} caracteres`;
                }
                return null;
            },
            
            minLength: (value, params, fieldName) => {
                if (!value) return null;
                const min = params[0];
                if (value.length < min) {
                    return `${fieldName} debe tener al menos ${min} caracteres`;
                }
                return null;
            },
            
            maxLength: (value, params, fieldName) => {
                if (!value) return null;
                const max = params[0];
                if (value.length > max) {
                    return `${fieldName} debe tener máximo ${max} caracteres`;
                }
                return null;
            },
            
            numeric: (value, params, fieldName) => {
                if (!value && value !== 0) return null;
                if (isNaN(Number(value))) {
                    return `${fieldName} debe ser un número`;
                }
                return null;
            },
            
            positive: (value, params, fieldName) => {
                if (!value && value !== 0) return null;
                if (Number(value) <= 0) {
                    return `${fieldName} debe ser un número positivo`;
                }
                return null;
            },
            
            integer: (value, params, fieldName) => {
                if (!value && value !== 0) return null;
                if (!Number.isInteger(Number(value))) {
                    return `${fieldName} debe ser un número entero`;
                }
                return null;
            },
            
            date: (value, params, fieldName) => {
                if (!value) return null;
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return `${fieldName} debe ser una fecha válida`;
                }
                return null;
            },
            
            futureDate: (value, params, fieldName) => {
                if (!value) return null;
                const date = new Date(value);
                if (date <= new Date()) {
                    return `${fieldName} debe ser una fecha futura`;
                }
                return null;
            },
            
            pastDate: (value, params, fieldName) => {
                if (!value) return null;
                const date = new Date(value);
                if (date >= new Date()) {
                    return `${fieldName} debe ser una fecha pasada`;
                }
                return null;
            },
            
            pattern: (value, params, fieldName) => {
                if (!value) return null;
                const regex = new RegExp(params[0]);
                if (!regex.test(value)) {
                    return `${fieldName} tiene un formato inválido`;
                }
                return null;
            },
            
            url: (value, params, fieldName) => {
                if (!value) return null;
                try {
                    new URL(value);
                    return null;
                } catch {
                    return `${fieldName} debe ser una URL válida`;
                }
            },
            
            in: (value, params, fieldName) => {
                if (!value) return null;
                if (!params.includes(value)) {
                    return `${fieldName} debe ser uno de: ${params.join(', ')}`;
                }
                return null;
            },
            
            // Validaciones financieras específicas
            amount: (value, params, fieldName) => {
                if (!value && value !== 0) return null;
                const amount = Number(value);
                if (isNaN(amount)) {
                    return `${fieldName} debe ser un número válido`;
                }
                if (amount < 0) {
                    return `${fieldName} debe ser positivo`;
                }
                if (amount > 1000000000) {
                    return `${fieldName} es demasiado grande`;
                }
                // Validar máximo 2 decimales
                const decimals = (value.toString().split('.')[1] || '').length;
                if (decimals > 2) {
                    return `${fieldName} debe tener máximo 2 decimales`;
                }
                return null;
            },
            
            category: (value, params, fieldName) => {
                if (!value) return null;
                const validCategories = params || [
                    'alimentación', 'transporte', 'vivienda', 'entretenimiento',
                    'salud', 'educación', 'ropa', 'otros'
                ];
                if (!validCategories.includes(value.toLowerCase())) {
                    return `${fieldName} debe ser una categoría válida`;
                }
                return null;
            },
            
            currency: (value, params, fieldName) => {
                if (!value) return null;
                const validCurrencies = params || ['USD', 'EUR', 'MXN', 'ARS', 'COP'];
                if (!validCurrencies.includes(value.toUpperCase())) {
                    return `${fieldName} debe ser una moneda válida`;
                }
                return null;
            }
        };
    }
    
    /**
     * Agregar regla personalizada
     */
    addRule(name, validator) {
        this.rules[name] = validator;
    }
    
    /**
     * Validar un campo individual
     */
    validateField(value, rules, fieldName = 'Campo') {
        const errors = [];
        
        // Parsear reglas (formato: "required|min:3|max:50")
        const rulesList = typeof rules === 'string' ? rules.split('|') : rules;
        
        for (const rule of rulesList) {
            const [ruleName, ...params] = rule.split(':');
            const ruleParams = params.length > 0 ? params[0].split(',') : [];
            
            if (this.rules[ruleName]) {
                const error = this.rules[ruleName](value, ruleParams, fieldName);
                if (error) {
                    errors.push(error);
                }
            } else {
                console.warn(`Regla de validación desconocida: ${ruleName}`);
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Validar múltiples campos (objeto completo)
     */
    validate(data, schema) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldName = this.humanizeFieldName(field);
            const result = this.validateField(value, rules, fieldName);
            
            if (!result.valid) {
                errors[field] = result.errors;
                isValid = false;
            }
        }
        
        return {
            valid: isValid,
            errors
        };
    }
    
    /**
     * Convertir nombre de campo a texto legible
     */
    humanizeFieldName(field) {
        const translations = {
            amount: 'Monto',
            description: 'Descripción',
            category: 'Categoría',
            date: 'Fecha',
            email: 'Email',
            password: 'Contraseña',
            name: 'Nombre',
            phone: 'Teléfono',
            address: 'Dirección'
        };
        
        return translations[field] || field.charAt(0).toUpperCase() + field.slice(1);
    }
    
    /**
     * Validaciones predefinidas para formularios comunes
     */
    schemas = {
        expense: {
            amount: 'required|numeric|positive|amount',
            description: 'required|minLength:3|maxLength:200',
            category: 'required|category',
            date: 'required|date|pastDate'
        },
        
        income: {
            amount: 'required|numeric|positive|amount',
            description: 'required|minLength:3|maxLength:200',
            source: 'required|minLength:2|maxLength:100',
            date: 'required|date'
        },
        
        budget: {
            category: 'required|category',
            amount: 'required|numeric|positive|amount',
            period: 'required|in:monthly,weekly,yearly',
            startDate: 'required|date'
        },
        
        user: {
            email: 'required|email',
            password: 'required|minLength:8|maxLength:100',
            displayName: 'minLength:2|maxLength:50'
        },
        
        recurringExpense: {
            amount: 'required|numeric|positive|amount',
            description: 'required|minLength:3|maxLength:200',
            category: 'required|category',
            frequency: 'required|in:daily,weekly,monthly,yearly',
            startDate: 'required|date',
            endDate: 'date|futureDate'
        }
    };
}

// ✅ Crear instancia global
const validator = new FormValidator();

// ✅ Helper para validar formularios HTML
function validateForm(formElement, schema) {
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    
    const result = validator.validate(data, schema);
    
    // Limpiar errores previos
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    formElement.querySelectorAll('.is-invalid').forEach(el => 
        el.classList.remove('is-invalid')
    );
    
    // Mostrar nuevos errores
    if (!result.valid) {
        Object.entries(result.errors).forEach(([field, errors]) => {
            const input = formElement.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('is-invalid');
                
                // Crear mensaje de error
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = 'var(--color-error, #ff4444)';
                errorDiv.style.fontSize = '0.875rem';
                errorDiv.style.marginTop = '0.25rem';
                errorDiv.textContent = errors[0]; // Mostrar primer error
                
                input.parentElement.appendChild(errorDiv);
            }
        });
    }
    
    return result;
}

// ✅ Validación en tiempo real
function setupLiveValidation(formElement, schema) {
    Object.keys(schema).forEach(field => {
        const input = formElement.querySelector(`[name="${field}"]`);
        if (!input) return;
        
        input.addEventListener('blur', () => {
            const value = input.value;
            const result = validator.validateField(
                value, 
                schema[field],
                validator.humanizeFieldName(field)
            );
            
            // Limpiar errores previos
            input.classList.remove('is-invalid', 'is-valid');
            const errorMsg = input.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
            
            // Mostrar resultado
            if (!result.valid) {
                input.classList.add('is-invalid');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = 'var(--color-error, #ff4444)';
                errorDiv.style.fontSize = '0.875rem';
                errorDiv.style.marginTop = '0.25rem';
                errorDiv.textContent = result.errors[0];
                
                input.parentElement.appendChild(errorDiv);
            } else if (value) {
                input.classList.add('is-valid');
            }
        });
    });
}

// Exportar globalmente
window.FormValidator = validator;
window.validateForm = validateForm;
window.setupLiveValidation = setupLiveValidation;

console.log('✅ Form Validator inicializado');
