// Who is playing, and her progress: kept on this device, and in the family database so that it follows her from the iPad to the Mac.
// One record per player name. Names and scores only: this site and that database are public.
import { DB, getName, setName } from './board.js';

const KEYS = ['paintingRooms.v1', 'paintingRooms.book', 'paintingRooms.at'], NAMES = 'paintingRooms.names', DIRTY = 'paintingRooms.dirty';
const slug = n => String(n).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'player';
const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const set = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* private window */ } };
const J = (s, d) => { try { const v = JSON.parse(s); return v == null ? d : v; } catch (e) { return d; } };
const timed = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('slow')), ms))]);

const local = () => ({ v1: J(get(KEYS[0]), {}), book: J(get(KEYS[1]), {}), at: +(get(KEYS[2]) || 0) });
const apply = s => { set(KEYS[0], JSON.stringify(s.v1 || {})); set(KEYS[1], JSON.stringify(s.book || {})); set(KEYS[2], String(s.at || 0)); };
const max = (a, b) => Math.max(a || 0, b || 0);
function merge(a, b) {      /* the better of each: nothing she has done on either device is lost */
  const v1 = { ...b.v1 };
  for (const k in a.v1) { const x = a.v1[k], y = b.v1[k]; v1[k] = !y ? x : { best: max(x.best, y.best), time: Math.min(x.time || 1e9, y.time || 1e9), paintings: max(x.paintings, y.paintings), of: x.of || y.of, found: [...new Set([...(x.found || []), ...(y.found || [])])], coins: max(x.coins, y.coins), runs: max(x.runs, y.runs), done: max(x.done, y.done) }; }
  const book = {}; for (const k of new Set([...Object.keys(a.book || {}), ...Object.keys(b.book || {})])) book[k] = { ...((b.book || {})[k] || {}), ...((a.book || {})[k] || {}) };
  return { v1, book, at: a.at || b.at || 0 };
}
const same = (a, b) => JSON.stringify([a.v1, a.book]) === JSON.stringify([b.v1, b.book]);

// names this device has seen, and names in the family database
const localNames = () => J(get(NAMES), []);
const remember = n => { const a = localNames().filter(x => slug(x) !== slug(n)); a.unshift(n); set(NAMES, JSON.stringify(a.slice(0, 8))); };
export async function names() {
  const seen = new Map(localNames().map(n => [slug(n), n]));
  try { const r = await timed(fetch(`${DB}/names.json`, { cache: 'no-store' }).then(x => x.json()), 2500); for (const k in (r || {})) if (typeof r[k] === 'string' && !seen.has(k)) seen.set(k, r[k].slice(0, 16)); } catch (e) { /* no network: only the names this device knows */ }
  return [...seen.values()];
}

// send her progress to the database (and keep a copy under her name on this device)
export async function push() {
  const n = getName(); if (!n) return false; const s = local(); set('paintingRooms.save.' + slug(n), JSON.stringify(s));
  try {
    const body = JSON.stringify({ n, t: Date.now(), d: JSON.stringify(s) });      /* one string: sketchbook keys may hold characters the database refuses as keys */
    const r = await timed(fetch(`${DB}/saves/${slug(n)}.json`, { method: 'PUT', body, keepalive: body.length < 60000 }), 6000); if (!r.ok) throw new Error('refused');
    fetch(`${DB}/names/${slug(n)}.json`, { method: 'PUT', body: JSON.stringify(n) }).catch(() => {});
    set(DIRTY, null); return true;
  } catch (e) { set(DIRTY, '1'); return false; }
}
// fetch her progress and fold it into what is on this device; true if this device learned something new
export async function pull() {
  const n = getName(); if (!n) return false;
  try {
    const r = await timed(fetch(`${DB}/saves/${slug(n)}.json`, { cache: 'no-store' }).then(x => x.json()), 5000); if (!r || typeof r.d !== 'string') return false;
    const mine = local(), both = merge(mine, J(r.d, {})); if (same(mine, both)) return false; apply(both); return true;
  } catch (e) { return false; }
}
export async function sync() { const changed = await pull(); const n = getName(); if (n && (changed || get(DIRTY) || !get('paintingRooms.save.' + slug(n)))) await push(); return changed; }

// change who is playing on this device: the last player's progress is put by under her name, and the new player's is taken out
export function switchTo(name) {
  name = String(name).replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 16); if (!name) return getName();
  const was = getName(); if (was && slug(was) === slug(name)) { setName(name); remember(name); return name; }
  if (was) { set('paintingRooms.save.' + slug(was), JSON.stringify(local())); const kept = J(get('paintingRooms.save.' + slug(name)), null); apply(kept || { v1: {}, book: {}, at: 0 }); }
  /* if nobody was named yet, what has been played on this device so far becomes hers */
  setName(name); remember(name); return name;
}

// the "who is playing?" card: the names the family has used, or a new one. Resolves to the name chosen, or null if closed.
export async function choose() {
  const list = await names(), cur = getName();
  return new Promise(done => {
    const back = document.createElement('div'); back.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(14,13,12,.72);display:grid;place-items:center;font:500 18px "Iowan Old Style",Palatino,Georgia,serif;color:#23262c';
    const card = document.createElement('div'); card.style.cssText = 'background:#f4efe2;border-radius:18px;padding:22px 24px;max-width:min(92vw,420px);box-shadow:0 18px 60px rgba(0,0,0,.5);text-align:center';
    const h = document.createElement('div'); h.textContent = 'Who is playing?'; h.style.cssText = 'font-size:1.5em;margin-bottom:.6em'; card.appendChild(h);
    const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:14px'; card.appendChild(row);
    const finish = n => { back.remove(); done(n); };
    const btn = (label, on, strong) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.style.cssText = `font:inherit;padding:.55em 1.1em;border-radius:999px;cursor:pointer;border:2px solid #c9a24a;background:${strong ? '#f2c865' : '#fffaf0'};color:#23262c`; b.addEventListener('click', on); return b; };
    for (const n of list) row.appendChild(btn(n, () => finish(n), cur && slug(cur) === slug(n)));
    const form = document.createElement('form'); form.style.cssText = 'display:flex;gap:8px;justify-content:center'; const inp = document.createElement('input'); inp.maxLength = 16; inp.placeholder = list.length ? 'someone else' : 'your name'; inp.autocomplete = 'off'; inp.style.cssText = 'font:inherit;padding:.5em .8em;border-radius:999px;border:2px solid #c9a24a;background:#fff;min-width:0;width:11em';
    form.appendChild(inp); form.appendChild(btn('OK', () => {}, true)); form.lastChild.type = 'submit'; form.addEventListener('submit', e => { e.preventDefault(); const v = inp.value.trim(); if (v) finish(v); }); card.appendChild(form);
    const note = document.createElement('div'); note.textContent = 'Your points and paintings are saved under this name.'; note.style.cssText = 'font-size:.8em;opacity:.7;margin-top:12px'; card.appendChild(note);
    back.addEventListener('click', e => { if (e.target === back) finish(null); }); for (const ev of ['keydown', 'keyup', 'pointerdown', 'touchstart']) back.addEventListener(ev, e => e.stopPropagation());
    back.appendChild(card); document.body.appendChild(back);
  });
}
// ask, switch, and bring her progress in. Resolves to { name, changed } where changed means the page should be redrawn.
export async function pick() { const was = getName(), n = await choose(); if (!n) return { name: was, changed: false }; const name = switchTo(n); const pulled = await pull(); push(); return { name, changed: pulled || slug(was || '') !== slug(name) }; }

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { if (get(DIRTY)) push(); });
  window.addEventListener('pagehide', () => { if (getName()) push(); });
}
