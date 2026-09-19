// 성벽 — 오프라인 지원. 같은 github.io 주소의 다른 앱 캐시는 건드리지 않는다.
const CACHE = "wall-v1";
const CORE = ["./", "index.html", "icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then(async (c) => { for (const u of CORE) { try { await c.add(u); } catch (err) {} } self.skipWaiting(); })); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("wall-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; });
    if (req.mode === "navigate") return net.catch(() => cached || cache.match("index.html"));
    if (cached) { net.catch(() => {}); return cached; }
    return net;
  }));
});
