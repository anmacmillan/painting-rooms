// The family score board, kept in the Firebase Realtime Database the other family games use (Wizard Chess, Owl Quest).
// One record per nickname per game, holding that player's best. Nicknames only: this site is public.
export const DB = 'https://wizard-chess-manon-default-rtdb.europe-west1.firebasedatabase.app/owlq/ARCADE2026';
const KEY = 'arcade.name';
export const getName = () => { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } };
export const setName = n => { n = String(n).replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 16); try { localStorage.setItem(KEY, n); } catch (e) { /* private window */ } return n; };
const slug = n => n.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'player';
const get = async path => (await fetch(`${DB}/${path}.json`, { cache: 'no-store' })).json();
export async function postScore(game, points, secs) {
  const n = getName(); if (!n) return null; const path = `scores/${game}/${slug(n)}`, was = await get(path); if (was && was.p >= points) return was;
  const rec = { n, p: points, s: secs, t: Date.now() }; await fetch(`${DB}/${path}.json`, { method: 'PUT', body: JSON.stringify(rec) }); return rec;
}
export async function topScores(game, k = 5) { const all = (await get(`scores/${game}`)) || {}; return Object.values(all).filter(r => r && typeof r.n === 'string' && typeof r.p === 'number').sort((a, b) => b.p - a.p).slice(0, k); }
export async function allScores() { return (await get('scores')) || {}; }
