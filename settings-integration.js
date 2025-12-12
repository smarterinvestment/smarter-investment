// ========================================
// 🔧 SETTINGS-INTEGRATION.JS v3.0
// Integración AGRESIVA de Temas, Idiomas y Monedas
// ========================================

(function() {
    'use strict';
    
    console.log('🔧 Settings Integration v3.0 iniciando...');
    
    // ========================================
    // 1. COLORES DE TEMAS
    // ========================================
    
    const THEMES = {
        dark: {
            name: 'Oscuro', nameEn: 'Dark', nameFr: 'Sombre',
            primary: '#05BFDB',
            secondary: '#088395',
            accent: '#00D9FF',
            bg: '#000B2E',
            bgSecondary: '#001845',
            card: 'rgba(0, 24, 69, 0.6)',
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            glow: 'rgba(5, 191, 219, 0.4)',
            success: '#22c55e',
            danger: '#ef4444',
            warning: '#f59e0b',
            gradient: 'linear-gradient(135deg, #05BFDB, #088395)'
        },
        pink: {
            name: 'Rosa', nameEn: 'Pink', nameFr: 'Rose',
            primary: '#EC4899',
            secondary: '#DB2777',
            accent: '#F472B6',
            bg: '#1F0A1B',
            bgSecondary: '#2D1128',
            card: 'rgba(45, 17, 40, 0.6)',
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            glow: 'rgba(236, 72, 153, 0.4)',
            success: '#22c55e',
            danger: '#ef4444',
            warning: '#f59e0b',
            gradient: 'linear-gradient(135deg, #EC4899, #DB2777)'
        },
        turquoise: {
            name: 'Turquesa', nameEn: 'Turquoise', nameFr: 'Turquoise',
            primary: '#06B6D4',
            secondary: '#0891B2',
            accent: '#22D3EE',
            bg: '#001138',
            bgSecondary: '#0D264F',
            card: 'rgba(13, 38, 79, 0.6)',
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            glow: 'rgba(6, 182, 212, 0.4)',
            success: '#22c55e',
            danger: '#ef4444',
            warning: '#f59e0b',
            gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)'
        },
        purple: {
            name: 'Morado', nameEn: 'Purple', nameFr: 'Violet',
            primary: '#8B5CF6',
            secondary: '#7C3AED',
            accent: '#A78BFA',
            bg: '#0F0A1E',
            bgSecondary: '#1A1333',
            card: 'rgba(26, 19, 51, 0.6)',
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            glow: 'rgba(139, 92, 246, 0.4)',
            success: '#22c55e',
            danger: '#ef4444',
            warning: '#f59e0b',
            gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
        }
    };
    
    // ========================================
    // 2. APLICAR TEMA - CSS INLINE AGRESIVO
    // ========================================
    
    window.applyTheme = function(themeName) {
        const theme = THEMES[themeName] || THEMES.dark;
        const root = document.documentElement;
        
        // Aplicar todas las variables CSS
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
        root.style.setProperty('--color-accent', theme.accent);
        root.style.setProperty('--color-bg', theme.bg);
        root.style.setProperty('--color-bg-secondary', theme.bgSecondary);
        root.style.setProperty('--color-card', theme.card);
        root.style.setProperty('--color-text', theme.text);
        root.style.setProperty('--color-text-secondary', theme.textSecondary);
        root.style.setProperty('--color-glow', theme.glow);
        root.style.setProperty('--color-success', theme.success);
        root.style.setProperty('--color-danger', theme.danger);
        root.style.setProperty('--color-warning', theme.warning);
        root.style.setProperty('--gradient-primary', theme.gradient);
        
        // Data attribute
        root.setAttribute('data-theme', themeName);
        
        // Aplicar estilos directamente al body
        document.body.style.background = `linear-gradient(180deg, ${theme.bg} 0%, ${theme.bgSecondary} 100%)`;
        document.body.style.minHeight = '100vh';
        
        // Actualizar meta theme-color
        let meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme.primary);
        
        // Guardar
        localStorage.setItem('theme', themeName);
        
        // Forzar repintado de cards
        document.querySelectorAll('.card').forEach(card => {
            card.style.background = theme.card;
            card.style.backdropFilter = 'blur(20px)';
            card.style.border = `1px solid rgba(255,255,255,0.1)`;
        });
        
        console.log('🎨 Tema aplicado:', themeName);
    };
    
    // ========================================
    // 3. DESTRUIR Y RECREAR GRÁFICOS
    // ========================================
    
    window.destroyAllCharts = function() {
        const chartNames = ['expenseChart', 'categoryChart', 'descriptionChart', 'incomeChart', 'savingsRateChart'];
        
        chartNames.forEach(name => {
            if (window[name] && typeof window[name].destroy === 'function') {
                try {
                    window[name].destroy();
                    window[name] = null;
                    console.log(`📊 ${name} destruido`);
                } catch (e) {
                    console.warn(`Error destruyendo ${name}:`, e);
                }
            }
        });
    };
    
    window.recreateCharts = function() {
        // Esperar un poco y luego reinicializar
        setTimeout(() => {
            if (typeof initializeCharts === 'function') {
                try {
                    initializeCharts();
                    console.log('📊 Gráficos recreados');
                } catch (e) {
                    console.warn('Error recreando gráficos:', e);
                }
            }
        }, 300);
    };
    
    // ========================================
    // 4. SISTEMA DE MONEDA - SOBREESCRIBIR
    // ========================================
    
    const CURRENCIES = {
        USD: { symbol: '$', code: 'USD', locale: 'en-US', name: 'US Dollar' },
        EUR: { symbol: '€', code: 'EUR', locale: 'de-DE', name: 'Euro' },
        COP: { symbol: '$', code: 'COP', locale: 'es-CO', name: 'Peso Colombiano' },
        MXN: { symbol: '$', code: 'MXN', locale: 'es-MX', name: 'Peso Mexicano' }
    };
    
    // SOBREESCRIBIR formatCurrency global
    const originalFormatCurrency = window.formatCurrency;
    
    window.formatCurrency = function(amount) {
        const code = localStorage.getItem('currency') || 'USD';
        const config = CURRENCIES[code] || CURRENCIES.USD;
        
        try {
            return new Intl.NumberFormat(config.locale, {
                style: 'currency',
                currency: config.code,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(amount || 0);
        } catch (e) {
            return config.symbol + ' ' + (amount || 0).toLocaleString();
        }
    };
    
    // Alias
    window.formatMoney = window.formatCurrency;
    
    window.getCurrencySymbol = function() {
        const code = localStorage.getItem('currency') || 'USD';
        return CURRENCIES[code]?.symbol || '$';
    };
    
    // ========================================
    // 5. SISTEMA DE IDIOMAS
    // ========================================
    
    const TRANSLATIONS = {
        es: {
            // Navegación
            home: 'Inicio', expenses: 'Gastos', budget: 'Presupuesto', 
            goals: 'Metas', assistant: 'Asistente', more: 'Más',
            // Settings
            settings: 'Configuración', settingsDesc: 'Temas, idiomas, moneda y API',
            theme: 'Tema', language: 'Idioma', currency: 'Moneda',
            dark: 'Oscuro', pink: 'Rosa', turquoise: 'Turquesa', purple: 'Morado',
            // More menu
            recurring: 'Gastos Recurrentes', recurringDesc: 'Gastos automáticos mensuales',
            incomeRec: 'Ingresos Recurrentes', incomeRecDesc: 'Ingresos automáticos',
            reports: 'Reportes', reportsDesc: 'Análisis visual de finanzas',
            comparison: 'Comparación', comparisonDesc: 'Semanal, quincenal, mensual',
            notifications: 'Notificaciones', notificationsDesc: 'Alertas y recordatorios',
            // Account
            account: 'Cuenta', connectedAs: 'Conectado como:', logout: 'Cerrar Sesión',
            save: 'Guardar', apiKey: 'API Key de Claude',
            // Messages
            themeChanged: 'Tema cambiado a',
            langChanged: 'Idioma cambiado a',
            currencyChanged: 'Moneda cambiada a',
            saved: 'Guardado correctamente'
        },
        en: {
            home: 'Home', expenses: 'Expenses', budget: 'Budget',
            goals: 'Goals', assistant: 'Assistant', more: 'More',
            settings: 'Settings', settingsDesc: 'Themes, languages, currency and API',
            theme: 'Theme', language: 'Language', currency: 'Currency',
            dark: 'Dark', pink: 'Pink', turquoise: 'Turquoise', purple: 'Purple',
            recurring: 'Recurring Expenses', recurringDesc: 'Automatic monthly expenses',
            incomeRec: 'Recurring Income', incomeRecDesc: 'Automatic income',
            reports: 'Reports', reportsDesc: 'Visual finance analysis',
            comparison: 'Comparison', comparisonDesc: 'Weekly, biweekly, monthly',
            notifications: 'Notifications', notificationsDesc: 'Alerts and reminders',
            account: 'Account', connectedAs: 'Connected as:', logout: 'Logout',
            save: 'Save', apiKey: 'Claude API Key',
            themeChanged: 'Theme changed to',
            langChanged: 'Language changed to',
            currencyChanged: 'Currency changed to',
            saved: 'Saved successfully'
        },
        fr: {
            home: 'Accueil', expenses: 'Dépenses', budget: 'Budget',
            goals: 'Objectifs', assistant: 'Assistant', more: 'Plus',
            settings: 'Paramètres', settingsDesc: 'Thèmes, langues, devise et API',
            theme: 'Thème', language: 'Langue', currency: 'Devise',
            dark: 'Sombre', pink: 'Rose', turquoise: 'Turquoise', purple: 'Violet',
            recurring: 'Dépenses Récurrentes', recurringDesc: 'Dépenses automatiques',
            incomeRec: 'Revenus Récurrents', incomeRecDesc: 'Revenus automatiques',
            reports: 'Rapports', reportsDesc: 'Analyse visuelle',
            comparison: 'Comparaison', comparisonDesc: 'Hebdo, bimensuel, mensuel',
            notifications: 'Notifications', notificationsDesc: 'Alertes et rappels',
            account: 'Compte', connectedAs: 'Connecté:', logout: 'Déconnexion',
            save: 'Enregistrer', apiKey: 'Clé API Claude',
            themeChanged: 'Thème changé en',
            langChanged: 'Langue changée en',
            currencyChanged: 'Devise changée en',
            saved: 'Enregistré'
        }
    };
    
    window.t = function(key) {
        const lang = localStorage.getItem('language') || 'es';
        return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.es[key] || key;
    };
    
    window.getCurrentLanguage = () => localStorage.getItem('language') || 'es';
    window.getCurrentCurrency = () => localStorage.getItem('currency') || 'USD';
    window.getCurrentTheme = () => localStorage.getItem('theme') || 'dark';
    
    // ========================================
    // 6. FUNCIONES DE CAMBIO
    // ========================================
    
    window.changeTheme = function(themeName) {
        console.log('🎨 Cambiando tema a:', themeName);
        
        // 1. Aplicar tema
        applyTheme(themeName);
        
        // 2. Destruir gráficos
        destroyAllCharts();
        
        // 3. Forzar re-render completo
        setTimeout(() => {
            if (typeof render === 'function') {
                render();
            }
        }, 100);
        
        // 4. Recrear gráficos
        setTimeout(() => {
            recreateCharts();
        }, 400);
        
        // 5. Volver a settings
        setTimeout(() => {
            switchTab('more-settings');
        }, 500);
        
        // Toast
        if (typeof showToast === 'function') {
            const theme = THEMES[themeName];
            showToast(`🎨 ${t('themeChanged')} ${theme.name}`, 'success');
        }
    };
    
    window.changeLanguage = function(lang) {
        console.log('🌍 Cambiando idioma a:', lang);
        
        localStorage.setItem('language', lang);
        
        // Re-render
        setTimeout(() => {
            if (typeof render === 'function') render();
        }, 50);
        
        // Volver a settings
        setTimeout(() => {
            switchTab('more-settings');
        }, 150);
        
        // Toast
        if (typeof showToast === 'function') {
            const names = { es: 'Español', en: 'English', fr: 'Français' };
            showToast(`🌍 ${TRANSLATIONS[lang]?.langChanged || 'Language:'} ${names[lang]}`, 'success');
        }
    };
    
    window.changeCurrency = function(curr) {
        console.log('💰 Cambiando moneda a:', curr);
        
        localStorage.setItem('currency', curr);
        
        // Re-render para actualizar todos los montos
        setTimeout(() => {
            if (typeof render === 'function') render();
        }, 50);
        
        // Volver a settings
        setTimeout(() => {
            switchTab('more-settings');
        }, 150);
        
        // Toast
        if (typeof showToast === 'function') {
            showToast(`💰 ${t('currencyChanged')} ${curr}`, 'success');
        }
    };
    
    window.saveClaudeAPIKey = function() {
        const input = document.getElementById('claude-api-key');
        const apiKey = input?.value?.trim();
        
        if (!apiKey) {
            if (typeof showToast === 'function') showToast('❌ Ingresa una API Key', 'error');
            return;
        }
        
        localStorage.setItem('claudeAPIKey', apiKey);
        
        // Firebase
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('assistant')
                .set({ apiKey, onlineMode: true }, { merge: true })
                .catch(e => console.warn('Firebase:', e));
        }
        
        if (typeof showToast === 'function') showToast(`✅ ${t('saved')}`, 'success');
    };
    
    // ========================================
    // 7. RENDER MORE SECTION
    // ========================================
    
    window.renderMoreSection = function() {
        return `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; padding-bottom: 120px;">
                
                <!-- Configuración -->
                <div class="card" onclick="switchTab('more-settings')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.1)) !important; border: 1px solid rgba(139, 92, 246, 0.4) !important;">
                    <span style="font-size: 1.5rem;">⚙️</span>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('settings')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('settingsDesc')}</p>
                    </div>
                    <span style="font-size: 1.2rem; opacity: 0.5;">→</span>
                </div>
                
                <!-- Gastos Recurrentes -->
                <div class="card" onclick="switchTab('more-recurring')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">🔄</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('recurring')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('recurringDesc')}</p>
                    </div>
                </div>
                
                <!-- Ingresos Recurrentes -->
                <div class="card" onclick="switchTab('more-recurring-income')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">💰</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('incomeRec')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('incomeRecDesc')}</p>
                    </div>
                </div>
                
                <!-- Reportes -->
                <div class="card" onclick="switchTab('more-reports')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📊</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('reports')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('reportsDesc')}</p>
                    </div>
                </div>
                
                <!-- Comparación -->
                <div class="card" onclick="switchTab('more-comparison')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📈</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('comparison')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('comparisonDesc')}</p>
                    </div>
                </div>
                
                <!-- Notificaciones -->
                <div class="card" onclick="switchTab('more-notifications')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">🔔</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0; color: white;">${t('notifications')}</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">${t('notificationsDesc')}</p>
                    </div>
                </div>
            </div>
        `;
    };
    
    // ========================================
    // 8. RENDER SETTINGS VIEW
    // ========================================
    
    window.renderSettingsView = function() {
        const currentTheme = getCurrentTheme();
        const currentLang = getCurrentLanguage();
        const currentCurr = getCurrentCurrency();
        const apiKey = localStorage.getItem('claudeAPIKey') || '';
        
        const themeBtn = (id, emoji) => {
            const isActive = currentTheme === id;
            const color = THEMES[id].primary;
            return `
                <button onclick="changeTheme('${id}')" style="
                    padding: 0.875rem 0.5rem;
                    border-radius: 12px;
                    border: 3px solid ${isActive ? color : 'rgba(255,255,255,0.15)'};
                    background: ${color}${isActive ? '40' : '20'};
                    cursor: pointer;
                    transition: all 0.3s ease;
                    ${isActive ? `transform: scale(1.05); box-shadow: 0 0 20px ${color}50;` : ''}
                ">
                    <div style="font-size: 1.4rem;">${emoji}</div>
                    <div style="font-size: 0.7rem; color: white; margin-top: 0.3rem;">${t(id)}</div>
                </button>
            `;
        };
        
        const langBtn = (code, flag, name) => {
            const isActive = currentLang === code;
            return `
                <button onclick="changeLanguage('${code}')" style="
                    padding: 0.875rem;
                    border-radius: 12px;
                    border: 3px solid ${isActive ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.15)'};
                    background: ${isActive ? 'rgba(5,191,219,0.25)' : 'rgba(255,255,255,0.05)'};
                    cursor: pointer;
                    transition: all 0.3s ease;
                    ${isActive ? 'transform: scale(1.05);' : ''}
                ">
                    <div style="font-size: 1.4rem;">${flag}</div>
                    <div style="font-size: 0.75rem; color: white; margin-top: 0.3rem;">${name}</div>
                </button>
            `;
        };
        
        const currBtn = (code, symbol, name) => {
            const isActive = currentCurr === code;
            return `
                <button onclick="changeCurrency('${code}')" style="
                    padding: 0.875rem;
                    border-radius: 12px;
                    border: 3px solid ${isActive ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.15)'};
                    background: ${isActive ? 'rgba(5,191,219,0.25)' : 'rgba(255,255,255,0.05)'};
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.3s ease;
                    ${isActive ? 'transform: scale(1.02);' : ''}
                ">
                    <div style="font-size: 1.1rem; font-weight: bold; color: white;">${symbol} ${code}</div>
                    <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); margin-top: 0.2rem;">${name}</div>
                </button>
            `;
        };
        
        return `
            <div style="padding: 1rem; padding-bottom: 120px;">
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <button onclick="switchTab('more')" style="background: none; border: none; color: white; font-size: 1.3rem; cursor: pointer; padding: 0.5rem;">←</button>
                    <h2 style="margin: 0; color: var(--color-primary, #05BFDB); font-size: 1.3rem;">⚙️ ${t('settings')}</h2>
                </div>
                
                <!-- Tema -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: white;">🎨 ${t('theme')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem;">
                        ${themeBtn('dark', '🌙')}
                        ${themeBtn('pink', '💖')}
                        ${themeBtn('turquoise', '💎')}
                        ${themeBtn('purple', '💜')}
                    </div>
                </div>
                
                <!-- Idioma -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: white;">🌍 ${t('language')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem;">
                        ${langBtn('es', '🇪🇸', 'Español')}
                        ${langBtn('en', '🇺🇸', 'English')}
                        ${langBtn('fr', '🇫🇷', 'Français')}
                    </div>
                </div>
                
                <!-- Moneda -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: white;">💰 ${t('currency')}</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;">
                        ${currBtn('USD', '$', 'US Dollar')}
                        ${currBtn('EUR', '€', 'Euro')}
                        ${currBtn('COP', '$', 'Peso CO')}
                        ${currBtn('MXN', '$', 'Peso MX')}
                    </div>
                </div>
                
                <!-- API Claude -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: white;">🤖 ${t('apiKey')}</h3>
                    <input type="password" id="claude-api-key" placeholder="sk-ant-api03-..." value="${apiKey}" 
                        style="width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.4); color: white; font-size: 14px; box-sizing: border-box; margin-bottom: 0.75rem;">
                    <button onclick="saveClaudeAPIKey()" style="width: 100%; padding: 0.8rem; border-radius: 10px; background: var(--gradient-primary, linear-gradient(135deg, #05BFDB, #088395)); color: white; border: none; cursor: pointer; font-weight: bold; font-size: 0.95rem;">
                        💾 ${t('save')}
                    </button>
                    <p style="font-size: 0.75rem; color: rgba(255,255,255,0.5); margin-top: 0.75rem; text-align: center;">
                        <a href="https://console.anthropic.com" target="_blank" style="color: var(--color-primary, #05BFDB);">console.anthropic.com</a>
                    </p>
                </div>
                
                <!-- Cuenta -->
                <div class="card" style="padding: 1.25rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: white;">👤 ${t('account')}</h3>
                    <div style="padding: 0.75rem; background: rgba(255,255,255,0.08); border-radius: 10px; margin-bottom: 1rem;">
                        <div style="font-size: 0.8rem; color: rgba(255,255,255,0.6);">${t('connectedAs')}</div>
                        <div style="font-weight: bold; color: white; margin-top: 0.25rem;">${(typeof currentUser !== 'undefined' && currentUser) ? currentUser.email : 'Usuario'}</div>
                    </div>
                    <button onclick="handleLogout()" style="width: 100%; padding: 0.875rem; border-radius: 10px; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer; font-weight: bold; font-size: 0.95rem;">
                        🚪 ${t('logout')}
                    </button>
                </div>
            </div>
        `;
    };
    
    // ========================================
    // 9. INTERCEPTAR switchTab
    // ========================================
    
    const originalSwitchTab = window.switchTab;
    
    window.switchTab = function(tab) {
        if (tab === 'more-settings') {
            if (typeof activeTab !== 'undefined') activeTab = 'more-settings';
            
            const tabContent = document.getElementById('tab-content');
            if (tabContent) {
                tabContent.innerHTML = renderSettingsView();
                console.log('✅ Vista de Configuración mostrada');
            }
            return;
        }
        
        // Llamar a la función original
        if (typeof originalSwitchTab === 'function') {
            originalSwitchTab(tab);
        }
    };
    
    // ========================================
    // 10. INICIALIZACIÓN
    // ========================================
    
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyTheme(savedTheme));
    } else {
        applyTheme(savedTheme);
    }
    
    console.log('✅ Settings Integration v3.0 CARGADO');
    console.log(`   🎨 Tema: ${savedTheme}`);
    console.log(`   🌍 Idioma: ${localStorage.getItem('language') || 'es'}`);
    console.log(`   💰 Moneda: ${localStorage.getItem('currency') || 'USD'}`);
    
})();
