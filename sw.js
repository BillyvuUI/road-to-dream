const CACHE_NAME = 'road-to-dream-v3-20260903';
const OLD_CACHES = ['road-to-dream-v1'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Always prefer the network. For navigations, bypass the HTTP cache as well,
// so a newly deployed index.html is picked up as quickly as possible.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isNavigation = e.request.mode === 'navigate';
  const networkRequest = isNavigation ? new Request(e.request, { cache: 'no-store' }) : e.request;
  e.respondWith(
    fetch(networkRequest)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
