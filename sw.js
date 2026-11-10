// Grocery Receipt PWA — Service Worker
// Cache names are scoped to this app's registration path so sibling apps
// hosted on the same origin keep their own Cache Storage entries.
const scopePath = new URL(self.registration.scope).pathname.replace(/^\/+|\/+$/g, "");
const scopeKey = scopePath ? encodeURIComponent(scopePath).replace(/%/g, "_") : "root";
const APP_CACHE_PREFIX = "grocery-receipt-" + scopeKey + "-";
const CACHE_NAME = APP_CACHE_PREFIX + "v10.4";
const APP_SHELL_URL = new URL("./index.html", self.registration.scope).href;

// Load-bearing shell entries. If either cannot be precached the install fails,
// because a worker with no offline shell provides no offline capability.
const CORE_ASSETS = [
  "./",
  "./index.html"
];

// Enhancement assets (the previous single ASSETS list minus CORE_ASSETS).
// A failure here is logged and tolerated so that a renamed icon can never
// abort an install and silently remove offline support.
const EXTRA_ASSETS = [
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GET_VERSION" && event.source) {
    // Diagnostic only: the page badge reports its own immutable page version.
    event.source.postMessage({ type: "VERSION", version: CACHE_NAME });
  }
});

// Two-phase precache. cache.addAll is all-or-nothing, which meant a single
// missing cosmetic asset discarded the entire install; the shell is now
// guaranteed first and everything else is best-effort.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => CORE_ASSETS.reduce(
        (chain, url) => chain.then(() => cache.add(url)),
        Promise.resolve()
      ))
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => Promise.all(
        EXTRA_ASSETS.map((url) => cache.add(url).catch((err) => {
          console.warn("[sw] Optional asset was not precached:", url, err && err.message);
        }))
      ))
      // Activate only after the shell is safely cached.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.indexOf(APP_CACHE_PREFIX) === 0)
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function matchAppShell() {
  return caches.open(CACHE_NAME).then((cache) => cache.match(APP_SHELL_URL));
}

// Opaque responses are rejected on purpose: they cannot be validated and are
// quota-padded. Google Fonts sends Access-Control-Allow-Origin: *, and the page
// requests its stylesheet with crossorigin, so the font CSS and the WOFF2 files
// arrive as ordinary CORS responses that can be checked and cached. These
// cross-origin entries live in this app's scoped cache, which keeps the
// isolation rule in AGENTS.md intact (the cache is scoped, its entries are not).
function isCacheableResponse(res) {
  return Boolean(res) && res.ok && res.status === 200 && res.type !== "opaque";
}

async function handleNavigation(req) {
  try {
    const res = await fetch(req);
    if (!res || res.status >= 500) {
      const cached = await matchAppShell().catch(() => null);
      return cached || res;
    }
    if (res.status === 200) {
      const copy = res.clone();
      try {
        const cache = await caches.open(CACHE_NAME);
        // One canonical key per cache version: keying by req would add a full
        // HTML copy for every distinct URL/query string navigation.
        await cache.put(APP_SHELL_URL, copy);
      } catch (cacheError) {
        // A failed cache write must not discard a valid network response.
      }
      return res;
    }
    // 4xx is returned unchanged by design: masking a genuine host error with
    // the shell would hide broken or stale deep links.
    return res;
  } catch (networkError) {
    const cached = await matchAppShell().catch(() => null);
    return cached || new Response("", { status: 503, statusText: "Offline" });
  }
}

async function handleAsset(req) {
  let cache = null;
  try {
    cache = await caches.open(CACHE_NAME);
  } catch (openError) {
    // Cache Storage unavailable: fall back to the network below.
    cache = null;
  }

  if (cache) {
    const cached = await cache.match(req).catch(() => null);
    if (cached) return cached;
  }

  let res;
  try {
    res = await fetch(req);
  } catch (networkError) {
    return new Response("", { status: 408, statusText: "Offline" });
  }

  if (cache && isCacheableResponse(res)) {
    try {
      const copy = res.clone();
      // Keep the write inside the response promise chain, never in a detached
      // waitUntil().
      await cache.put(req, copy);
    } catch (putError) {
      // Serving the network response is still correct.
    }
  }
  return res;
}

// Network-first for the HTML shell; cache-first for other GET assets.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only GET over http(s) is intercepted. Anything else passes through
  // untouched instead of receiving a synthetic offline response.
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch (parseError) {
    return;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (req.mode === "navigate") {
    event.respondWith(handleNavigation(req));
    return;
  }
  event.respondWith(handleAsset(req));
});
