// ---------------------------------------------------------------
// Service Worker
// Zweck hier: die App auf dem Handy installierbar machen.
//
// Bewusst KEIN aggressives Zwischenspeichern: die App holt sich
// immer die aktuelle Fassung aus dem Netz. Dadurch siehst du
// Änderungen sofort und musst nie den Zwischenspeicher leeren.
// Offline-Betrieb ist nicht nötig, weil im Betrieb überall WLAN ist.
// ---------------------------------------------------------------

const VERSION = "v1.0.3";
const SCHALE = "schale-" + VERSION;

const GRUNDDATEIEN = [
  "./",
  "./index.html",
  "./app.css",
  "./app.webmanifest",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(SCHALE).then((c) => c.addAll(GRUNDDATEIEN)).catch(() => {}));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== SCHALE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Datenbankanfragen niemals zwischenspeichern.
  if (url.hostname.endsWith("supabase.co")) return;
  if (e.request.method !== "GET") return;

  // Zuerst Netz, nur bei Ausfall der Zwischenspeicher.
  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        if (antwort.ok && url.origin === location.origin) {
          const kopie = antwort.clone();
          caches.open(SCHALE).then((c) => c.put(e.request, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(e.request).then((t) => t || caches.match("./index.html")))
  );
});
