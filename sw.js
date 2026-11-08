// Grocery Receipt PWA — Service Worker
// Cache names are scoped to this app's registration path so sibling apps
// hosted on the same origin keep their own Cache Storage entries.
const scopePath = new URL(self.registration.scope).pathname.replace(/^\/+|\/+$/g, "");
const scopeKey = scopePath ? encodeURIComponent(scopePath).replace(/%/g, "_") : "root";
const APP_CACHE_PREFIX = "grocery-receipt-" + scopeKey + "-";
const CACHE_NAME = APP_CACHE_PREFIX + "v10.1";
const LEGACY_CACHE_NAME = "grocery-receipt-v9";
const APP_SHELL_URL = new URL("./index.html", self.registration.scope).href;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({ type: "VERSION", version: CACHE_NAME });
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
      self.skipWaiting()
    ])
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.indexOf(APP_CACHE_PREFIX) === 0 || key === LEGACY_CACHE_NAME)
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function matchAppShell() {
  return caches.open(CACHE_NAME).then((cache) => cache.match(APP_SHELL_URL));
}

// Network-first for the HTML shell; cache writes are part of the response
// promise so the fetch event remains alive until the write finishes.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res || res.status >= 500) {
            return matchAppShell().then((cached) => cached || res).catch(() => res);
          }
          if (res.status === 200) {
            const copy = res.clone();
            return caches.open(CACHE_NAME)
              .then((cache) => cache.put(req, copy))
              .then(() => res)
              .catch(() => res);
          }
          return res;
        })
        .catch(() => matchAppShell())
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => cache.match(req))
      .catch(() => null)
      .then((cached) => cached || fetch(req))
      .catch(() => new Response("", { status: 408, statusText: "Offline" }))
  );
});
