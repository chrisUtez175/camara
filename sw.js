// Service Worker para PWA
const CACHE_NAME = 'camara-pwa-v2'; // Incrementado a v2 para incluir nuevos archivos si los hay
const urlsToCache = [ // Lista de archivos a guardar en caché
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    // Asegúrate de incluir tus archivos de iconos aquí
    '/icon-192.png',
    '/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar peticiones (estrategia Cache First)
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response; // Devolver la versión en caché
                }
                return fetch(event.request); // Si no está en caché, ir a la red
            })
    );
});

// Activar Service Worker (limpieza de cachés antiguos)
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Eliminar los cachés obsoletos
                    }
                })
            );
        })
    );
});