// Service Worker para PWA
// Se recomienda cambiar el nombre/versión al actualizar archivos estáticos
const CACHE_NAME = 'camara-pwa-v3'; 
const urlsToCache = [ 
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json'
];

// Instalar Service Worker: Almacenamiento Inicial (Precache)
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto, precacheando recursos.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar peticiones (Estrategia Cache First)
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Si se encuentra una respuesta en caché, la devuelve inmediatamente
                if (response) {
                    return response; 
                }
                // Si no, va a la red
                return fetch(event.request); 
            })
    );
});

// Activar Service Worker: Limpieza de Cachés Antiguos
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    // Elimina cualquier caché que no coincida con la versión actual (CACHE_NAME)
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); 
                    }
                })
            );
        })
    );
});