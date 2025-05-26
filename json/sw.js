const CACHE_NAME = 'mon-coeur-v1';
const urlsToCache = [
  './',
  './index.html',
  './ben-bot.html',
  './css/themes-settings.css',
  './images/ben_gêné2.png',
  './images/Ben-Bot.png',
  './images/ben-interested.png',
  './images/angry.png',
  './images/ben_colère.png',
  './images/ben_gêné.png',
  './images/ben_pensif.png',
  './images/ben_qui_fixe.png',
  './images/ben_triste.png',
  './images/kiss_cat.png',
  './images/la_mere.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
