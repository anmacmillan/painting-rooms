/* Painting Rooms: offline play. The shell is stored on install; each level is stored in full the first time it is opened (or when the map asks). */
const VERSION = 'pr-5', SHELL = 'shell-' + VERSION, LEVELS = 'levels-' + VERSION;
const ROOT = new URL('./', self.location).href;
let LIST = null;
const list = async () => LIST || (LIST = await (await fetch(ROOT + 'offline.json', { cache: 'no-cache' }).catch(() => caches.match(ROOT + 'offline.json'))).json());
async function putAll(cacheName, paths, tell) {
  const c = await caches.open(cacheName); let done = 0, failed = 0;
  for (let i = 0; i < paths.length; i += 6) {
    await Promise.all(paths.slice(i, i + 6).map(async p => { const url = ROOT + p; try { if (!(await c.match(url))) { const r = await fetch(url, { cache: 'no-cache' }); if (r.ok) await c.put(url, r); else failed++; } } catch (e) { failed++; } done++; }));
    if (tell) tell(done, paths.length, failed);
  }
  return failed;
}
async function saveLevel(key, client) {
  const L = await list(), files = L.levels[key]; if (!files) return;
  const failed = await putAll(LEVELS, files, (d, n, f) => client && client.postMessage({ offline: 'progress', key, done: d, of: n, failed: f }));
  if (!failed) { const c = await caches.open(SHELL); await c.put(ROOT + '__saved/' + key, new Response('1')); }
  if (client) client.postMessage({ offline: 'saved', key, ok: !failed });
}
self.addEventListener('install', e => e.waitUntil((async () => { const L = await list(); const c = await caches.open(SHELL); await c.put(ROOT + 'offline.json', new Response(JSON.stringify(L), { headers: { 'Content-Type': 'application/json' } })); await putAll(SHELL, L.shell); await self.skipWaiting(); })()));
self.addEventListener('activate', e => e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== SHELL && k !== LEVELS) await caches.delete(k); await self.clients.claim(); })()));
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.offline === 'save') e.waitUntil(saveLevel(m.key, e.source));
  if (m.offline === 'state') e.waitUntil((async () => { const L = await list(), c = await caches.open(SHELL), saved = []; for (const k of Object.keys(L.levels)) if (await c.match(ROOT + '__saved/' + k)) saved.push(k); e.source.postMessage({ offline: 'state', saved, sizes: L.sizes }); })());
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || !url.href.startsWith(ROOT)) return;      /* the score board and anything else off-site goes straight to the network */
  const path = url.pathname.slice(new URL(ROOT).pathname.length), code = /\.(html|js|css|json|webmanifest)$/.test(path) || path === '' || path.endsWith('/');
  const m = path.match(/^([a-z]+)\/(?:street|index)\.html$/) || path.match(/^([a-z]+)\/$/); if (m) e.waitUntil(saveLevel(m[1], null));      /* opening a level stores the whole of it */
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (code) {      /* pages and scripts: the newest when there is a network, the stored copy when there is not */
      try { const r = await Promise.race([fetch(req), new Promise((_, no) => setTimeout(no, hit ? 3500 : 30000))]); if (r && r.ok) { const c = await caches.open(SHELL); c.put(url.origin + url.pathname, r.clone()); } return r; } catch (err) { if (hit) return hit; throw err; }
    }
    if (hit) return hit;      /* pictures, models, sound: stored copy first */
    const r = await fetch(req); if (r.ok && r.status === 200) { const c = await caches.open(LEVELS); c.put(url.origin + url.pathname, r.clone()); } return r;
  })());
});
