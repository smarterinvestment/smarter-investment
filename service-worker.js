/**
 * SERVICE WORKER - Smarter Investment PWA
 * Versión simplificada y corregida sin errores de clonación
 */

const VERSION = 'v2.0.2';
const CACHE_NAME = `smarter-v${VERSION}`;

// Recursos estáticos para cachear
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    './styles.css',
    './manifest.json',
    './logo-smarter.jpg',
    './state-manager.js',
    './form-validator.js',
    './error-handler.js',
    './analytics.js'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('🚀 SW: Instalando versión', VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Cacheando recursos estáticos...');
                return cache.addAll(STATIC_ASSETS).catch(err => {
                    console.warn('⚠️ Algunos recursos no se pudieron cachear:', err);
                    // No fallar si algunos recursos no se pueden cachear
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('✅ SW: Activando versión', VERSION);
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('smarter-') && name !== CACHE_NAME)
                        .map(name => {
                            console.log('🗑️ Eliminando cache antiguo:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo manejar GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // No cachear peticiones externas críticas
    if (
        url.origin !== location.origin ||
        url.pathname.includes('firebaseapp.com') ||
        url.pathname.includes('googleapis.com') ||
        url.pathname.includes('gstatic.com') ||
        url.pathname.includes('netlify') ||
        url.pathname.includes('anthropic.com')
    ) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                // Si está en cache, retornarlo
                if (cachedResponse) {
                    // Actualizar en background
                    fetch(request).then(response => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, response);
                            });
                        }
                    }).catch(() => {});
                    
                    return cachedResponse;
                }
                
                // Si no está en cache, hacer fetch
                return fetch(request)
                    .then(response => {
                        // Verificar que es una respuesta válida
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }
                        
                        // Solo cachear respuestas exitosas de nuestro dominio
                        if (response.type === 'basic') {
                            const responseToCache = response.clone();
                            
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                })
                                .catch(err => {
                                    console.warn('Error guardando en cache:', err);
                                });
                        }
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('Error en fetch:', error);
                        
                        // Si falla la red, intentar retornar del cache
                        return caches.match('./index.html')
                            .then(response => {
                                if (response) {
                                    return response;
                                }
                                // Si tampoco hay cache, retornar error
                                return new Response('Sin conexión', {
                                    status: 503,
                                    statusText: 'Service Unavailable',
                                    headers: new Headers({
                                        'Content-Type': 'text/plain'
                                    })
                                });
                            });
                    });
            })
    );
});

// Escuchar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: VERSION });
    }
});

console.log('✅ Service Worker cargado - Versión:', VERSION);
