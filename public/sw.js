/*
 * Service worker del portal.
 *
 * Objetivo: que la app abra siempre, incluso sin señal — en una audiencia
 * la conexión puede fallar y la consulta no puede depender de eso.
 *
 * Navegaciones: red primero, y si no hay, la última versión guardada.
 * Recursos (JS, CSS, fuentes, PDF): caché primero y actualización en
 * segundo plano, así la apertura es inmediata.
 */

const CACHE = "jurisprudencia-v1";
const BASE = "/index.html";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([BASE, "/"])).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const peticion = evento.request;
  if (peticion.method !== "GET") return;

  const url = new URL(peticion.url);
  if (url.origin !== self.location.origin) return;

  if (peticion.mode === "navigate") {
    evento.respondWith(
      fetch(peticion)
        .then((respuesta) => {
          const copia = respuesta.clone();
          caches.open(CACHE).then((c) => c.put(BASE, copia)).catch(() => {});
          return respuesta;
        })
        .catch(() => caches.match(BASE).then((r) => r || Response.error()))
    );
    return;
  }

  evento.respondWith(
    caches.match(peticion).then((guardada) => {
      const red = fetch(peticion)
        .then((respuesta) => {
          if (respuesta && respuesta.status === 200) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((c) => c.put(peticion, copia)).catch(() => {});
          }
          return respuesta;
        })
        .catch(() => guardada);
      return guardada || red;
    })
  );
});
