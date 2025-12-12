// ========================================
// ⚙️ SETTINGS-MODULE.JS - Módulo de Configuración
// ========================================

const SettingsModule = {
    
    // Renderizar vista de configuración completa
    renderSettingsView() {
        const lang = typeof i18n !== 'undefined' ? i18n.currentLanguage : 'es';
        const currency = typeof i18n !== 'undefined' ? i18n.currentCurrency : 'USD';
        const theme = typeof ThemeManager !== 'undefined' ? ThemeManager.currentTheme : 'dark';
        
        return `
            <div style="padding: 1rem; padding-bottom: 120px;">
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <button onclick="switchTab('more')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>
                    <h2 style="margin: 0; color: var(--color-primary, #05BFDB);">⚙️ Configuración</h2>
                </div>
                
                <!-- Tema -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🎨 Tema</h3>
                    <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1rem;">Personaliza la apariencia de tu app</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                        <button onclick="SettingsModule.changeTheme('dark')" class="theme-btn ${theme === 'dark' ? 'active' : ''}" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${theme === 'dark' ? '#05BFDB' : 'rgba(255,255,255,0.1)'};
                            background: linear-gradient(135deg, #05BFDB33, #08839533);
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🌙</div>
                            <div style="font-size: 0.7rem; color: white;">Oscuro</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeTheme('pink')" class="theme-btn ${theme === 'pink' ? 'active' : ''}" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${theme === 'pink' ? '#EC4899' : 'rgba(255,255,255,0.1)'};
                            background: linear-gradient(135deg, #EC489933, #DB277733);
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">💖</div>
                            <div style="font-size: 0.7rem; color: white;">Rosa</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeTheme('turquoise')" class="theme-btn ${theme === 'turquoise' ? 'active' : ''}" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${theme === 'turquoise' ? '#06B6D4' : 'rgba(255,255,255,0.1)'};
                            background: linear-gradient(135deg, #06B6D433, #0891B233);
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">💎</div>
                            <div style="font-size: 0.7rem; color: white;">Turquesa</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeTheme('purple')" class="theme-btn ${theme === 'purple' ? 'active' : ''}" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${theme === 'purple' ? '#8B5CF6' : 'rgba(255,255,255,0.1)'};
                            background: linear-gradient(135deg, #8B5CF633, #7C3AED33);
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">💜</div>
                            <div style="font-size: 0.7rem; color: white;">Morado</div>
                        </button>
                    </div>
                </div>
                
                <!-- Idioma -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🌍 Idioma</h3>
                    <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1rem;">Selecciona tu idioma preferido</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        <button onclick="SettingsModule.changeLanguage('es')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${lang === 'es' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${lang === 'es' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🇪🇸</div>
                            <div style="font-size: 0.8rem; color: white;">Español</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeLanguage('en')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${lang === 'en' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${lang === 'en' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🇺🇸</div>
                            <div style="font-size: 0.8rem; color: white;">English</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeLanguage('fr')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${lang === 'fr' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${lang === 'fr' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                        ">
                            <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🇫🇷</div>
                            <div style="font-size: 0.8rem; color: white;">Français</div>
                        </button>
                    </div>
                </div>
                
                <!-- Moneda -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">💰 Moneda</h3>
                    <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1rem;">Selecciona tu moneda local</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                        <button onclick="SettingsModule.changeCurrency('USD')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${currency === 'USD' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${currency === 'USD' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: left;
                        ">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ USD</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Dólar Americano</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeCurrency('EUR')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${currency === 'EUR' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${currency === 'EUR' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: left;
                        ">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">€ EUR</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Euro</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeCurrency('COP')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${currency === 'COP' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${currency === 'COP' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: left;
                        ">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ COP</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Peso Colombiano</div>
                        </button>
                        
                        <button onclick="SettingsModule.changeCurrency('MXN')" style="
                            padding: 1rem;
                            border-radius: 12px;
                            border: 2px solid ${currency === 'MXN' ? 'var(--color-primary, #05BFDB)' : 'rgba(255,255,255,0.1)'};
                            background: ${currency === 'MXN' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'};
                            cursor: pointer;
                            transition: all 0.3s;
                            text-align: left;
                        ">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ MXN</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Peso Mexicano</div>
                        </button>
                    </div>
                </div>
                
                <!-- Asistente AI -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🤖 Asistente AI</h3>
                    <p style="font-size: 0.85rem; opacity: 0.7; margin-bottom: 1rem;">Configura el asistente financiero inteligente</p>
                    
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; opacity: 0.8;">API Key de Claude (Anthropic)</label>
                        <input 
                            type="password" 
                            id="claude-api-key" 
                            placeholder="sk-ant-api..."
                            value="${localStorage.getItem('claudeAPIKey') || ''}"
                            style="
                                width: 100%;
                                padding: 0.75rem;
                                border-radius: 8px;
                                border: 1px solid rgba(255,255,255,0.2);
                                background: rgba(0,0,0,0.3);
                                color: white;
                                font-size: 14px;
                            "
                        >
                    </div>
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="SettingsModule.saveAPIKey()" style="
                            flex: 1;
                            padding: 0.75rem;
                            border-radius: 8px;
                            background: linear-gradient(135deg, var(--color-primary, #05BFDB), var(--color-secondary, #088395));
                            color: white;
                            border: none;
                            cursor: pointer;
                            font-weight: bold;
                        ">
                            💾 Guardar API Key
                        </button>
                        <button onclick="SettingsModule.testAPIKey()" style="
                            padding: 0.75rem 1rem;
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            color: white;
                            border: 1px solid rgba(255,255,255,0.2);
                            cursor: pointer;
                        ">
                            🧪 Probar
                        </button>
                    </div>
                    
                    <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 0.75rem;">
                        Obtén tu API Key en: <a href="https://console.anthropic.com" target="_blank" style="color: var(--color-primary, #05BFDB);">console.anthropic.com</a>
                    </p>
                </div>
                
                <!-- Cuenta -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">👤 Cuenta</h3>
                    
                    <div style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1rem;">
                        <div style="font-size: 0.8rem; opacity: 0.6;">Conectado como:</div>
                        <div style="font-weight: bold;">${currentUser?.email || 'Usuario'}</div>
                    </div>
                    
                    <button onclick="handleLogout()" style="
                        width: 100%;
                        padding: 0.875rem;
                        border-radius: 8px;
                        background: rgba(239, 68, 68, 0.2);
                        color: #ef4444;
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        cursor: pointer;
                        font-weight: bold;
                    ">
                        🚪 Cerrar Sesión
                    </button>
                </div>
                
                <!-- Info App -->
                <div class="card" style="padding: 1.25rem; border-radius: 16px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰🧠</div>
                    <div style="font-weight: bold; margin-bottom: 0.25rem;">Smarter Investment</div>
                    <div style="font-size: 0.8rem; opacity: 0.6;">Versión 2.0.0</div>
                    <div style="font-size: 0.75rem; opacity: 0.5; margin-top: 0.5rem;">© 2024 - Tu Gestor Financiero Personal</div>
                </div>
            </div>
        `;
    },
    
    // Cambiar tema
    changeTheme(theme) {
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.setTheme(theme);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        // Re-renderizar la vista
        if (typeof switchTab === 'function') {
            switchTab('more-settings');
        }
        
        if (typeof showToast === 'function') {
            const names = { dark: 'Oscuro', pink: 'Rosa', turquoise: 'Turquesa', purple: 'Morado' };
            showToast(`🎨 Tema cambiado a ${names[theme] || theme}`, 'success');
        }
    },
    
    // Cambiar idioma
    changeLanguage(lang) {
        if (typeof i18n !== 'undefined') {
            i18n.setLanguage(lang);
        } else {
            localStorage.setItem('language', lang);
        }
        
        // Re-renderizar la vista
        if (typeof switchTab === 'function') {
            switchTab('more-settings');
        }
        
        if (typeof showToast === 'function') {
            const names = { es: 'Español', en: 'English', fr: 'Français' };
            showToast(`🌍 Idioma cambiado a ${names[lang] || lang}`, 'success');
        }
    },
    
    // Cambiar moneda
    changeCurrency(currency) {
        if (typeof i18n !== 'undefined') {
            i18n.setCurrency(currency);
        } else {
            localStorage.setItem('currency', currency);
        }
        
        // Re-renderizar la vista
        if (typeof switchTab === 'function') {
            switchTab('more-settings');
        }
        
        // Re-renderizar todo para actualizar montos
        if (typeof render === 'function') {
            setTimeout(() => render(), 100);
        }
        
        if (typeof showToast === 'function') {
            showToast(`💰 Moneda cambiada a ${currency}`, 'success');
        }
    },
    
    // Guardar API Key
    saveAPIKey() {
        const apiKey = document.getElementById('claude-api-key')?.value?.trim();
        
        if (!apiKey) {
            if (typeof showToast === 'function') {
                showToast('Por favor ingresa una API Key', 'error');
            }
            return;
        }
        
        // Validar formato básico
        if (!apiKey.startsWith('sk-ant-')) {
            if (typeof showToast === 'function') {
                showToast('La API Key debe comenzar con sk-ant-', 'error');
            }
            return;
        }
        
        localStorage.setItem('claudeAPIKey', apiKey);
        
        // Guardar en Firebase
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('assistant')
                .set({ apiKey: apiKey, onlineMode: true }, { merge: true })
                .then(() => {
                    if (typeof showToast === 'function') {
                        showToast('✅ API Key guardada correctamente', 'success');
                    }
                })
                .catch(err => {
                    console.error('Error guardando API Key:', err);
                    if (typeof showToast === 'function') {
                        showToast('API Key guardada localmente', 'info');
                    }
                });
        } else {
            if (typeof showToast === 'function') {
                showToast('✅ API Key guardada localmente', 'success');
            }
        }
    },
    
    // Probar API Key
    async testAPIKey() {
        const apiKey = document.getElementById('claude-api-key')?.value?.trim() || localStorage.getItem('claudeAPIKey');
        
        if (!apiKey) {
            if (typeof showToast === 'function') {
                showToast('No hay API Key configurada', 'error');
            }
            return;
        }
        
        if (typeof showToast === 'function') {
            showToast('🧪 Probando conexión...', 'info');
        }
        
        try {
            // La prueba real se haría a través de la API serverless
            // Por ahora solo validamos el formato
            if (apiKey.startsWith('sk-ant-') && apiKey.length > 20) {
                if (typeof showToast === 'function') {
                    showToast('✅ Formato de API Key válido', 'success');
                }
            } else {
                throw new Error('Formato inválido');
            }
        } catch (error) {
            if (typeof showToast === 'function') {
                showToast('❌ Error: ' + error.message, 'error');
            }
        }
    },
    
    // Cargar preferencias
    async loadPreferences() {
        // Tema
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.applyTheme(savedTheme);
        }
        
        // Idioma y moneda se cargan en i18n.init()
    }
};

// Exportar globalmente
window.SettingsModule = SettingsModule;

console.log('✅ Settings Module cargado');
