/* GYMER service worker: offline shell + notifiche timer */
const CACHE = "gymer-v6";
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Stale-while-revalidate per le richieste GET della stessa origine
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached || caches.match("/"));
      return cached || net;
    })
  );
});

// Notifica "recupero finito": la pagina programma l'orario di fine; se la pagina viene
// sospesa in background, il service worker mostra comunque la notifica (con vibrazione).
let pend = null, shownAt = 0;
function show(at, o) {
  if (at && shownAt === at) return Promise.resolve();
  shownAt = at || Date.now();
  return self.registration.showNotification("GYMER", Object.assign({
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "gymer-timer",
    renotify: true,
  }, o || { body: "Recupero finito: tocca a te!" }));
}
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "TIMER_SET") {
    if (pend) clearTimeout(pend.t);
    const wait = Math.max(0, d.at - Date.now());
    e.waitUntil(new Promise((res) => {
      pend = { at: d.at, res, t: setTimeout(() => { pend = null; show(d.at, d.o).then(res, res); }, wait) };
    }));
  } else if (d.type === "TIMER_CANCEL") {
    if (pend) { clearTimeout(pend.t); pend.res(); pend = null; }
  } else if (d.type === "TIMER_DONE") {
    if (pend) { clearTimeout(pend.t); pend.res(); pend = null; }
    e.waitUntil(show(d.at, d.o));
  }
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const c = list.find((x) => "focus" in x);
      return c ? c.focus() : self.clients.openWindow("/");
    })
  );
});
