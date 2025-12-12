// ========================================
// ⚙️ SETTINGS-INTEGRATION.JS
// Integra Configuración (Temas, Idiomas, Monedas) en el menú Más
// ========================================

(function() {
    'use strict';
    
    // Guardar referencia a la función original
    const originalRenderMoreSection = window.renderMoreSection;
    
    // Sobrescribir renderMoreSection para agregar Configuración
    window.renderMoreSection = function() {
        return `
            <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; padding-bottom: 120px;">
                
                <!-- ⚙️ CONFIGURACIÓN (NUEVO) -->
                <div class="card" onclick="switchTab('more-settings')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1)); border: 1px solid rgba(139, 92, 246, 0.3);">
                    <span style="font-size: 1.5rem;">⚙️</span>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Configuración</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Temas, idiomas, moneda y API</p>
                    </div>
                    <span style="font-size: 1.2rem; opacity: 0.5;">→</span>
                </div>
                
                <!-- Gastos Recurrentes -->
                <div class="card" onclick="switchTab('more-recurring')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">🔄</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Gastos Recurrentes</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Configura gastos automáticos mensuales</p>
                    </div>
                </div>
                
                <!-- Ingresos Recurrentes -->
                <div class="card" onclick="switchTab('more-recurring-income')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">💰</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Ingresos Recurrentes</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Configura ingresos automáticos (salario, rentas)</p>
                    </div>
                </div>
                
                <!-- Reportes -->
                <div class="card" onclick="switchTab('more-reports')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📊</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Reportes y Gráficos</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Análisis visual de tus finanzas</p>
                    </div>
                </div>
                
                <!-- Comparación -->
                <div class="card" onclick="switchTab('more-comparison')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📈</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Comparación de Periodos</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Semanal, quincenal y mensual</p>
                    </div>
                </div>
                
                <!-- Notificaciones -->
                <div class="card" onclick="switchTab('more-notifications')" style="cursor: pointer; padding: 0.875rem; display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">🔔</span>
                    <div>
                        <h3 style="font-size: 1rem; margin: 0 0 0.25rem 0;">Notificaciones</h3>
                        <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin: 0;">Alertas semanales y recordatorios</p>
                    </div>
                </div>
            </div>
        `;
    };
    
    // Guardar referencia a switchTab original
    const originalSwitchTab = window.switchTab;
    
    // Sobrescribir switchTab para manejar 'more-settings'
    window.switchTab = function(tab) {
        if (tab === 'more-settings') {
            // Mostrar vista de configuración
            activeTab = 'more-settings';
            
            const tabContent = document.getElementById('tab-content');
            if (tabContent && typeof SettingsModule !== 'undefined') {
                tabContent.innerHTML = SettingsModule.renderSettingsView();
                console.log('✅ Vista de Configuración mostrada');
                return;
            } else {
                console.error('❌ SettingsModule no disponible');
                // Mostrar versión de respaldo
                tabContent.innerHTML = renderSettingsViewFallback();
                return;
            }
        }
        
        // Llamar a la función original para otras tabs
        if (typeof originalSwitchTab === 'function') {
            originalSwitchTab(tab);
        }
    };
    
    // Vista de respaldo si SettingsModule no está disponible
    function renderSettingsViewFallback() {
        const theme = localStorage.getItem('theme') || 'dark';
        const lang = localStorage.getItem('language') || 'es';
        const currency = localStorage.getItem('currency') || 'USD';
        
        return `
            <div style="padding: 1rem; padding-bottom: 120px;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <button onclick="switchTab('more')" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">←</button>
                    <h2 style="margin: 0; color: #05BFDB;">⚙️ Configuración</h2>
                </div>
                
                <!-- Tema -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🎨 Tema</h3>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;">
                        <button onclick="changeTheme('dark')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${theme === 'dark' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: linear-gradient(135deg, #05BFDB33, #08839533); cursor: pointer;">
                            <div style="font-size: 1.5rem;">🌙</div>
                            <div style="font-size: 0.7rem; color: white;">Oscuro</div>
                        </button>
                        <button onclick="changeTheme('pink')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${theme === 'pink' ? '#EC4899' : 'rgba(255,255,255,0.1)'}; background: linear-gradient(135deg, #EC489933, #DB277733); cursor: pointer;">
                            <div style="font-size: 1.5rem;">💖</div>
                            <div style="font-size: 0.7rem; color: white;">Rosa</div>
                        </button>
                        <button onclick="changeTheme('turquoise')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${theme === 'turquoise' ? '#06B6D4' : 'rgba(255,255,255,0.1)'}; background: linear-gradient(135deg, #06B6D433, #0891B233); cursor: pointer;">
                            <div style="font-size: 1.5rem;">💎</div>
                            <div style="font-size: 0.7rem; color: white;">Turquesa</div>
                        </button>
                        <button onclick="changeTheme('purple')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${theme === 'purple' ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}; background: linear-gradient(135deg, #8B5CF633, #7C3AED33); cursor: pointer;">
                            <div style="font-size: 1.5rem;">💜</div>
                            <div style="font-size: 0.7rem; color: white;">Morado</div>
                        </button>
                    </div>
                </div>
                
                <!-- Idioma -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🌍 Idioma</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                        <button onclick="changeLanguage('es')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${lang === 'es' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${lang === 'es' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer;">
                            <div style="font-size: 1.5rem;">🇪🇸</div>
                            <div style="font-size: 0.8rem; color: white;">Español</div>
                        </button>
                        <button onclick="changeLanguage('en')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${lang === 'en' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${lang === 'en' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer;">
                            <div style="font-size: 1.5rem;">🇺🇸</div>
                            <div style="font-size: 0.8rem; color: white;">English</div>
                        </button>
                        <button onclick="changeLanguage('fr')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${lang === 'fr' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${lang === 'fr' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer;">
                            <div style="font-size: 1.5rem;">🇫🇷</div>
                            <div style="font-size: 0.8rem; color: white;">Français</div>
                        </button>
                    </div>
                </div>
                
                <!-- Moneda -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">💰 Moneda</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">
                        <button onclick="changeCurrency('USD')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${currency === 'USD' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${currency === 'USD' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer; text-align: left;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ USD</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Dólar Americano</div>
                        </button>
                        <button onclick="changeCurrency('EUR')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${currency === 'EUR' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${currency === 'EUR' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer; text-align: left;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">€ EUR</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Euro</div>
                        </button>
                        <button onclick="changeCurrency('COP')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${currency === 'COP' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${currency === 'COP' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer; text-align: left;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ COP</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Peso Colombiano</div>
                        </button>
                        <button onclick="changeCurrency('MXN')" style="padding: 1rem; border-radius: 12px; border: 2px solid ${currency === 'MXN' ? '#05BFDB' : 'rgba(255,255,255,0.1)'}; background: ${currency === 'MXN' ? 'rgba(5,191,219,0.2)' : 'rgba(255,255,255,0.05)'}; cursor: pointer; text-align: left;">
                            <div style="font-size: 1.2rem; font-weight: bold; color: white;">$ MXN</div>
                            <div style="font-size: 0.75rem; opacity: 0.7; color: white;">Peso Mexicano</div>
                        </button>
                    </div>
                </div>
                
                <!-- API Claude -->
                <div class="card" style="padding: 1.25rem; margin-bottom: 1rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">🤖 Asistente AI (Claude)</h3>
                    <div style="margin-bottom: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; opacity: 0.8;">API Key de Anthropic</label>
                        <input type="password" id="claude-api-key" placeholder="sk-ant-api..." value="${localStorage.getItem('claudeAPIKey') || ''}" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white; font-size: 14px;">
                    </div>
                    <button onclick="saveClaudeAPIKey()" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #05BFDB, #088395); color: white; border: none; cursor: pointer; font-weight: bold;">
                        💾 Guardar API Key
                    </button>
                    <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 0.75rem;">
                        Obtén tu API Key en: <a href="https://console.anthropic.com" target="_blank" style="color: #05BFDB;">console.anthropic.com</a>
                    </p>
                </div>
                
                <!-- Cerrar Sesión -->
                <div class="card" style="padding: 1.25rem; border-radius: 16px;">
                    <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem;">👤 Cuenta</h3>
                    <div style="padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 1rem;">
                        <div style="font-size: 0.8rem; opacity: 0.6;">Conectado como:</div>
                        <div style="font-weight: bold;">${typeof currentUser !== 'undefined' && currentUser ? currentUser.email : 'Usuario'}</div>
                    </div>
                    <button onclick="handleLogout()" style="width: 100%; padding: 0.875rem; border-radius: 8px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer; font-weight: bold;">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
    }
    
    // Funciones globales para cambiar configuración
    window.changeTheme = function(theme) {
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.setTheme(theme);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        // Re-renderizar
        switchTab('more-settings');
        
        // Mostrar toast
        if (typeof showToast === 'function') {
            const names = { dark: 'Oscuro', pink: 'Rosa', turquoise: 'Turquesa', purple: 'Morado' };
            showToast(`🎨 Tema: ${names[theme] || theme}`, 'success');
        }
    };
    
    window.changeLanguage = function(lang) {
        if (typeof i18n !== 'undefined') {
            i18n.setLanguage(lang);
        } else {
            localStorage.setItem('language', lang);
        }
        
        // Re-renderizar
        switchTab('more-settings');
        
        if (typeof showToast === 'function') {
            const names = { es: 'Español', en: 'English', fr: 'Français' };
            showToast(`🌍 Idioma: ${names[lang] || lang}`, 'success');
        }
    };
    
    window.changeCurrency = function(currency) {
        if (typeof i18n !== 'undefined') {
            i18n.setCurrency(currency);
        } else {
            localStorage.setItem('currency', currency);
        }
        
        // Re-renderizar
        switchTab('more-settings');
        
        if (typeof showToast === 'function') {
            showToast(`💰 Moneda: ${currency}`, 'success');
        }
    };
    
    window.saveClaudeAPIKey = function() {
        const apiKey = document.getElementById('claude-api-key')?.value?.trim();
        
        if (!apiKey) {
            if (typeof showToast === 'function') {
                showToast('Ingresa una API Key', 'error');
            }
            return;
        }
        
        localStorage.setItem('claudeAPIKey', apiKey);
        
        // Guardar en Firebase si está disponible
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('assistant')
                .set({ apiKey: apiKey, onlineMode: true }, { merge: true })
                .catch(err => console.warn('Error guardando en Firebase:', err));
        }
        
        if (typeof showToast === 'function') {
            showToast('✅ API Key guardada', 'success');
        }
    };
    
    console.log('✅ Settings Integration cargado - Configuración disponible en Más → Configuración');
})();
