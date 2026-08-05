// Service worker do Estudo Organizado
// Estratégia simples: cache-first para os arquivos estáticos do build,
// com atualização em segundo plano (stale-while-revalidate).

const CACHE_NAME = "estudo-organizado-v1";

self.addEventListener("install", (event) => {
  // Usa o escopo real do service worker, então funciona tanto em
  // "usuario.github.io/" quanto em "usuario.github.io/nome-do-repo/".
  const scope = self.registration.scope;
  const CORE_ASSETS = [scope, scope + "manifest.json"];
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
