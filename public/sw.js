/**
 * IIE Platform — Service Worker (Cache-First)
 * --------------------------------------------
 * Intercepts /api/oracle and /scenarios/ requests.
 * On install: pre-caches all 3 scenario JSONs.
 * On fetch:
 *   • Network-first with 800ms timeout for /api/oracle
 *   • Cache-first for /scenarios/*.json
 *   • Passes through everything else unchanged.
 */

const CACHE_NAME   = 'iie-oracle-v1';
const TIMEOUT_MS   = 800;
const PRECACHE_URLS = [
  '/scenarios/drought.json',
  '/scenarios/flood.json',
  '/scenarios/normal.json',
];

// ── Install: pre-cache scenario baselines ─────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: wipe old caches ──────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * networkWithTimeout — race the real fetch against a hard deadline.
 * Throws if the network doesn't respond within `ms` milliseconds.
 */
function networkWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal })
    .then((res) => { clearTimeout(timer); return res; })
    .catch((err) => { clearTimeout(timer); throw err; });
}

/**
 * districtToScenario — mirrors the server-side map in /api/oracle/route.ts
 * so the SW always serves the right cached scenario.
 */
function districtToScenario(url) {
  const params   = new URL(url).searchParams;
  const scenario = params.get('scenario');
  if (scenario) return scenario;
  const district = (params.get('district') ?? 'barmer').toLowerCase();
  const FLOOD_DISTRICTS   = ['khammam', 'puri'];
  const NORMAL_DISTRICTS  = ['ludhiana'];
  if (FLOOD_DISTRICTS.includes(district))  return 'flood';
  if (NORMAL_DISTRICTS.includes(district)) return 'normal';
  return 'drought';
}

// ── Fetch strategy ────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // 1. /api/oracle — network-first with 800ms timeout, SW-level fallback
  if (url.includes('/api/oracle')) {
    event.respondWith(
      networkWithTimeout(request, TIMEOUT_MS)
        .then(async (res) => {
          // Cache a fresh copy of a successful live response
          if (res.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, res.clone());
          }
          return res;
        })
        .catch(async () => {
          // Network failed or timed out — serve matching scenario JSON
          const scenario   = districtToScenario(url);
          const cacheUrl   = `/scenarios/${scenario}.json`;
          const cached     = await caches.match(cacheUrl);

          if (cached) {
            const data = await cached.json();
            const payload = JSON.stringify({
              ...data,
              source:        'cache',
              cacheReason:   'Live data delayed; showing recent valid baseline',
              fallbackDetail: 'Service Worker: network timed out or offline',
              servedAt:       new Date().toISOString(),
            });
            return new Response(payload, {
              status:  200,
              headers: {
                'Content-Type':    'application/json',
                'X-Oracle-Source': 'sw-cache',
              },
            });
          }

          // Absolute last resort — shouldn't happen after install
          return new Response(JSON.stringify({ error: 'Offline and no cache available' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // 2. /scenarios/*.json — cache-first (static baselines never change mid-demo)
  if (url.includes('/scenarios/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached ?? fetch(request))
    );
    return;
  }

  // 3. Everything else — pass through to network unmodified
});
