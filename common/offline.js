// Offline play: registers the service worker (sw.js at the site root) and lets a page ask what is stored and store more.
const ROOT = new URL('../', import.meta.url).href;
export const ready = ('serviceWorker' in navigator) ? navigator.serviceWorker.register(ROOT + 'sw.js', { scope: ROOT }).then(() => navigator.serviceWorker.ready).catch(() => null) : Promise.resolve(null);
const subs = new Set();
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.offline) subs.forEach(f => f(e.data)); });
export const onOffline = f => { subs.add(f); return () => subs.delete(f); };
export async function ask(msg) { const reg = await ready; if (reg && reg.active) reg.active.postMessage(msg); return !!(reg && reg.active); }
export const saveLevel = key => ask({ offline: 'save', key });
export const state = () => ask({ offline: 'state' });
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});      /* ask the browser not to clear the stored levels */
