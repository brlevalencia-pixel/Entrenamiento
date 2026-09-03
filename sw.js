/* Service worker: guarda la app en el celular para que abra sin internet. */
const CACHE = "entreno-v1";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

/* Primero la red, y si no hay, lo guardado. Así la app se actualiza sola
   cuando subes una versión nueva, pero sigue abriendo sin señal. */
self.addEventListener("fetch", e=>{
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r=>{
        const copia = r.clone();
        caches.open(CACHE).then(c=>c.put(e.request, copia)).catch(()=>{});
        return r;
      })
      .catch(()=>caches.match(e.request).then(r=>r || caches.match("./index.html")))
  );
});
