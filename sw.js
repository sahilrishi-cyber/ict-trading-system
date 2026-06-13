const CACHE_NAME = 'market-pulse-v1';
const ASSETS = [
  '/ict-trading-system/market-pulse-live.html',
  '/ict-trading-system/manifest.json'
];

// Install — cache files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // API calls — always network
  if (e.request.url.includes('newsapi') ||
      e.request.url.includes('coingecko') ||
      e.request.url.includes('fcsapi')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // App files — network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notifications (future use)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || 'Market Alert', {
    body: data.body || 'Check latest market news',
    icon: '/ict-trading-system/icon-192.png',
    badge: '/ict-trading-system/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'market-alert'
  });
});
