/* Pocket Tarot offline application shell.
 * All card interpretations are computed in-browser. No external API requests
 * are intercepted. Card assets are cached on demand, not all 22MB at install.
 */
const VERSION = "pocket-tarot-v3";
const SHELL = VERSION + "-shell";
const ASSETS = VERSION + "-assets";
const SHELL_ASSETS = ["/", "/manifest.webmanifest", "/tarot/card-placeholder.svg", "/icon.svg"];
const ASSET_LIMIT = 140;

async function prepareShell() {
  const cache = await caches.open(SHELL);
  const page = await fetch("/", {cache:"reload"});
  if (!page.ok) throw new Error("Unable to fetch offline shell");
  const html = await page.clone().text();
  await cache.put("/",page);
  const resources = [...html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"']+)["']/g)]
    .map(m=>m[1].replace(/&amp;/g,"&"))
    .filter((src,index,all)=>all.indexOf(src)===index);
  await Promise.allSettled([
    ...SHELL_ASSETS.slice(1).map(path=>cache.add(path)),
    ...resources.map(path=>cache.add(path))
  ]);
}
self.addEventListener("install", event=>{
  event.waitUntil(prepareShell().then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("pocket-tarot-")&&!k.startsWith(VERSION))
      .map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
async function cacheAsset(req) {
  const cache=await caches.open(ASSETS);
  const cached=await cache.match(req);
  if(cached)return cached;
  const response=await fetch(req);
  if(response.ok && response.type==="basic") {
    await cache.put(req,response.clone());
    const keys=await cache.keys();
    if(keys.length>ASSET_LIMIT){
      await cache.delete(keys[0]);
    }
  }
  return response;
}
self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET" || req.headers.has("range"))return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin || url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/auth-callback") || url.pathname==="/sw.js")return;
  if(req.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(req);
        if(response.ok){
          const cache=await caches.open(SHELL);
          await cache.put("/",response.clone());
        }
        return response;
      }catch{
        const cached=await (await caches.open(SHELL)).match("/");
        return cached || Response.error();
      }
    })());
    return;
  }
  if(url.pathname.startsWith("/_next/static/")){
    event.respondWith((async()=>{
      const cache=await caches.open(SHELL);
      const cached=await cache.match(req);
      if(cached)return cached;
      const response=await fetch(req);
      if(response.ok)await cache.put(req,response.clone());
      return response;
    })());
    return;
  }
  if(url.pathname.startsWith("/tarot/") || url.pathname==="/icon.svg" ||
      url.pathname==="/manifest.webmanifest" || url.pathname==="/favicon.ico"){
    event.respondWith(cacheAsset(req));
  }
});
self.addEventListener("message",event=>{
  if(event.data?.type==="SKIP_WAITING") self.skipWaiting();
  if(event.data?.type==="CLEAR_IMAGE_CACHE"){
    event.waitUntil(caches.delete(ASSETS));
  }
});
