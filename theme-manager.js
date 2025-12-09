// ========================================
// 🎨 THEME-MANAGER.JS - Gestor de Temas
// ========================================

const ThemeManager = {
    currentTheme: localStorage.getItem('theme') || 'dark',
    
    themes: {
        dark: {
            name: 'Oscuro',
            nameEn: 'Dark',
            nameFr: 'Sombre',
            icon: '🌙',
            primary: '#05BFDB'
        },
        pink: {
            name: 'Rosa',
            nameEn: 'Pink',
            nameFr: 'Rose',
            icon: '💖',
            primary: '#EC4899'
        },
        turquoise: {
            name: 'Turquesa',
            nameEn: 'Turquoise',
            nameFr: 'Turquoise',
            icon: '💎',
            primary: '#06B6D4'
        },
        purple: {
            name: 'Morado',
            nameEn: 'Purple',
            nameFr: 'Violet',
            icon: '💜',
            primary: '#8B5CF6'
        }
    },
    
    // Inicializar tema
    init() {
        this.applyTheme(this.currentTheme);
        console.log(`✅ Tema inicializado: ${this.currentTheme}`);
    },
    
    // Aplicar tema
    applyTheme(themeName) {
        if (!this.themes[themeName]) {
            console.warn(`Tema "${themeName}" no existe, usando "dark"`);
            themeName = 'dark';
        }
        
        // Agregar clase de transición
        document.body.classList.add('theme-transitioning');
        
        // Aplicar tema
        document.documentElement.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        // Actualizar meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', this.themes[themeName].primary);
        }
        
        // Remover clase de transición después de la animación
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeName, ...this.themes[themeName] }
        }));
        
        // Actualizar selectores de tema si existen
        this.updateThemeSelectors();
    },
    
    // Cambiar tema
    setTheme(themeName) {
        this.applyTheme(themeName);
        
        // Guardar en Firebase si está disponible
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            db.collection('users').doc(currentUser.uid)
                .collection('settings').doc('preferences')
                .set({ theme: themeName }, { merge: true })
                .catch(err => console.warn('Error guardando tema:', err));
        }
    },
    
    // Obtener tema actual
    getTheme() {
        return this.currentTheme;
    },
    
    // Obtener lista de temas
    getThemes() {
        return Object.entries(this.themes).map(([id, data]) => ({
            id,
            ...data
        }));
    },
    
    // Actualizar selectores visuales
    updateThemeSelectors() {
        document.querySelectorAll('.theme-option').forEach(el => {
            const theme = el.getAttribute('data-theme');
            if (theme === this.currentTheme) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    },
    
    // Renderizar selector de tema
    renderThemeSelector() {
        const themes = this.getThemes();
        return `
            <div class="theme-selector">
                ${themes.map(theme => `
                    <button 
                        class="theme-option ${theme.id === this.currentTheme ? 'active' : ''}" 
                        data-theme="${theme.id}"
                        onclick="ThemeManager.setTheme('${theme.id}')"
                        title="${theme.name}"
                        style="background: linear-gradient(135deg, ${theme.primary}, ${theme.primary}aa);"
                    >
                        <span style="font-size: 1.2rem;">${theme.icon}</span>
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    // Cargar preferencias desde Firebase
    async loadFromFirebase() {
        if (typeof db !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
            try {
                const doc = await db.collection('users').doc(currentUser.uid)
                    .collection('settings').doc('preferences').get();
                
                if (doc.exists && doc.data().theme) {
                    this.applyTheme(doc.data().theme);
                }
            } catch (err) {
                console.warn('Error cargando tema desde Firebase:', err);
            }
        }
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});

// Exportar globalmente
window.ThemeManager = ThemeManager;

console.log('✅ Theme Manager cargado');
