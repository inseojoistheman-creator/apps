const CACHE='salkka-v1';
const CORE=["./index.html", "./manifest.json", "./icon-180.png", "./icon-512.png"];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(async c=>{ for(const u of CORE){ try{ await c.add(u); }catch(err){} } self.skipWaiting(); })); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host)){
    e.respondWith(caches.open(CACHE).then(async c=>{ const hit=await c.match(req); if(hit) return hit; try{ const res=await fetch(req); if(res&&(res.ok||res.type==='opaque')) c.put(req,res.clone()); return res; }catch(err){ return hit||Response.error(); } }));
    return;
  }
  if (url.origin===location.origin){
    e.respondWith(fetch(req).then(res=>{ if(res&&res.ok){ caches.open(CACHE).then(c=>c.put(req,res.clone())); } return res; }).catch(()=>caches.match(req)));
  }
});
