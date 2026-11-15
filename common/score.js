// Points, things to pick up along the road, ditches to leap, a clock, and the way on to the next level. Shared by every street.
// The paintings are the main score: each tableau she reaches is worth far more than anything on the ground.
import { getName, setName, postScore, topScores } from './board.js';
export const LEVELS = [
  { key: 'florence', href: 'florence/street.html', name: 'Florence, about 1283', place: 'Florence', year: '1283', title: 'The New Life', by: 'Rossetti and Holiday', img: 'florence/images/holiday.jpg', paintings: 3, coin: 'florins' },
  { key: 'caravaggio', href: 'caravaggio/street.html', name: 'Rome, about 1600', place: 'Rome', year: '1600', title: "The Painter's Light", by: 'Caravaggio', img: 'caravaggio/images/calling.jpg', paintings: 3, coin: 'scudi' },
  { key: 'vermeer', href: 'vermeer/street.html', name: 'Delft, about 1665', place: 'Delft', year: '1665', title: 'The Girl in Delft', by: 'Vermeer', img: 'vermeer/images/pearl.jpg', paintings: 3, coin: 'ducats' },
  { key: 'munch', href: 'munch/street.html', name: 'Åsgårdstrand, 1901', place: 'Åsgårdstrand', year: '1901', title: 'The Night Road', by: 'Munch', img: 'munch/paintings/girls_bridge.jpg', paintings: 2, coin: 'kroner' },
];
const STORE = 'paintingRooms.v1';
export function loadScores() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
function saveScores(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* private window: the run still counts on screen */ } }
const PTS = { pick: 10, leap: 25, painting: 150, finish: 300 };

// o: THREE, scene, key, at(s), nearest(x, z), LEN, groundY(x, z), blocked(x, z), paintings (how many tableaux the level has),
//    thing ('strawberry' | 'tile' | 'florin'), ditch (its name here: 'ditch', 'gutter', 'drain'), avoid (route distances to keep clear: the stagings), half (half-width of the road)
export function makeScore(o) {
  const { THREE, scene, at, LEN } = o, SND = window.Sound, half = o.half || 3.2, lvl = LEVELS.findIndex(l => l.key === o.key);
  const css = document.createElement('style'); css.textContent = `
    #scHud { position:fixed; top:12px; right:66px; z-index:6; font:italic 600 clamp(14px,1.7vw,17px) "Iowan Old Style",Palatino,Georgia,serif; color:#f4efe2; background:rgba(30,28,34,.72); border:1px solid rgba(242,200,101,.55); border-radius:999px; padding:.3em 1em .3em .5em; pointer-events:none; letter-spacing:.02em; display:flex; align-items:center; gap:.55em; transform-origin:100% 50%; }
    #scHud .coin { width:1.7em; height:1.7em; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff3b8, #f0c13a 55%, #b8861c); box-shadow:0 0 10px rgba(242,200,101,.7); flex:none; }
    #scHud .n { font-size:clamp(24px,3.4vw,38px); line-height:1; font-style:normal; color:#f2c865; min-width:1.6em; text-align:right; font-variant-numeric:tabular-nums; }
    #scHud small { display:block; font-size:.86em; opacity:.85; line-height:1.25; }
    #scHud.hurt { animation:scHurt .4s ease-out; } @keyframes scHurt { 0%, 100% { transform:translateX(0); } 20% { transform:translateX(-7px); background:rgba(150,30,30,.85); } 60% { transform:translateX(6px); } }
    #scHud .x { color:#ffe9a0; font-weight:700; }
    #scHud.bump { animation:scBump .34s ease-out; } #scHud.bump .coin { animation:scSpin .34s linear; }
    @keyframes scBump { 0% { transform:scale(1); } 35% { transform:scale(1.22); } 100% { transform:scale(1); } } @keyframes scSpin { to { transform:rotateY(360deg); } }
    .scFly { position:fixed; z-index:7; font:600 clamp(18px,2.6vw,26px) "Iowan Old Style",Palatino,Georgia,serif; color:#ffe9a0; text-shadow:0 2px 8px rgba(0,0,0,.8); pointer-events:none; animation:scFly .9s ease-out forwards; }
    @keyframes scFly { 0% { opacity:0; transform:translate(-50%, 20px) scale(.7); } 20% { opacity:1; transform:translate(-50%, 0) scale(1.15); } 100% { opacity:0; transform:translate(-50%, -46px) scale(1); } }
    
    #scToast { position:fixed; top:62px; left:50%; transform:translate(-50%,-8px); z-index:6; font:italic clamp(15px,2.2vw,20px) "Iowan Old Style",Palatino,Georgia,serif; color:#fff3c8; text-shadow:0 2px 8px rgba(0,0,0,.75); opacity:0; transition:opacity .25s, transform .25s; pointer-events:none; white-space:nowrap; }
    #scToast.show { opacity:1; transform:translate(-50%,0); }
    #scCard { font-size:clamp(14px,1.9vw,17px); line-height:1.5; margin:0; order:-1; } #scCard b { color:#f2c865; font-size:2.1em; font-weight:600; } #scCard i { opacity:.7; }
    a.go { display:inline-block; text-decoration:none; margin-top:.6em; font:inherit; font-size:clamp(17px,2.4vw,22px); color:var(--paper,#f4efe2); background:var(--go,#a8552e); border-radius:999px; padding:.6em 1.7em; box-shadow:0 6px 18px rgba(0,0,0,.4); }
    #end #again.second { background:transparent; box-shadow:none; border:1px solid rgba(244,239,226,.45); font-size:clamp(14px,1.8vw,17px); margin-top:.6em; }
    #scCard small { display:block; opacity:.75; font-size:.86em; }
    #scBoard { font-size:clamp(13px,1.7vw,16px); margin:.4em 0 0; min-height:1.2em; } #scBoard i { opacity:.7; } #scBoard ol { margin:.2em auto 0; padding:0; list-style:none; display:inline-block; text-align:left; } #scBoard li { display:flex; gap:1.2em; justify-content:space-between; } #scBoard li.me { color:#f2c865; }
    #scBoard input { font:inherit; padding:.3em .6em; border-radius:8px; border:0; width:9em; } #scBoard button { font:inherit; padding:.3em .9em; border-radius:999px; border:0; background:#f2c865; color:#2c2f36; cursor:pointer; }
    @media (max-width:620px) { #scHud { top:54px; right:14px; } #scToast { top:96px; } }`; document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'scHud'; hud.style.display = 'none'; document.body.appendChild(hud);
  const toast = document.createElement('div'); toast.id = 'scToast'; document.body.appendChild(toast);
  const say = (t) => { toast.textContent = t; toast.classList.add('show'); toastT = 1.9; };

  // --- what lies on the road
  const lam = c => new THREE.MeshLambertMaterial(c), glow = c => new THREE.MeshBasicMaterial({ color: c });
  // the coin of the place and time: Florence's gold florin, Rome's silver scudo, the Dutch gold ducat, the Norwegian silver krone
  const COINS = { florin: ['#f0c13a', '#b8861c'], scudo: ['#d4d8de', '#8a9098'], ducat: ['#f3cf4a', '#a8781a'], krone: ['#dfe3e8', '#7f8894'] };
  function thing() {
    const g = new THREE.Group(), [face, rim] = COINS[o.thing] || COINS.florin, mats = [new THREE.MeshBasicMaterial({ color: face, transparent: true }), new THREE.MeshBasicMaterial({ color: rim, transparent: true })];
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 22), mats[0]); c.rotation.x = Math.PI / 2; g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.024, 6, 24), mats[1]); g.add(r);
    for (const z of [0.022, -0.022]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.11, 5), mats[1]); d.position.z = z; if (z < 0) d.rotation.y = Math.PI; g.add(d); }      // a stamped device on each face
    g.userData.mats = mats; return g;
  }
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), r = g.createRadialGradient(48, 48, 2, 48, 48, 48); r.addColorStop(0, 'rgba(255,236,170,.85)'); r.addColorStop(0.35, 'rgba(255,214,120,.35)'); r.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 96, 96); return new THREE.CanvasTexture(c); })();
  const haloM = new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const clear = s => !(o.avoid || []).some(a => Math.abs(a - s) < 16) && s > 14 && s < LEN - 16;
  const spot = (s, off) => { const p = at(s); return [p.x - p.dz * off, p.z + p.dx * off, p]; };
  const picks = [], ditches = [];
  const addPick = (x, z, y, i) => { const g = thing(), mats = g.userData.mats, h = new THREE.Sprite(haloM.clone()); h.scale.setScalar(1.5); g.add(h); mats.push(h.material); g.userData = { x, z, y, ph: i * 1.7, mats, pop: 0 }; g.position.set(x, y, z); scene.add(g); picks.push(g); };
  for (let s = 22, i = 0; s < LEN - 18; s += 19, i++) {
    if (!clear(s)) continue; const off = [-1.5, 0, 1.5, 0.8, -0.8][i % 5], [x, z] = spot(s, off); if (o.blocked(x, z)) continue;
    addPick(x, z, o.groundY(x, z) + (i % 4 === 3 ? 2.0 : 0.85), i);
  }
  const ditchTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = o.ditchColor || '#16263c'; g.fillRect(0, 0, 256, 64);
    for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(${150 + Math.random() * 90},${190 + Math.random() * 50},255,${0.12 + Math.random() * 0.3})`; g.lineWidth = 1 + Math.random() * 2; const y = Math.random() * 64, x = Math.random() * 256; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 14, y - 3, x + 26, y + 3, x + 40 + Math.random() * 30, y); g.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const ditchM = new THREE.MeshBasicMaterial({ map: ditchTex }), lipM = lam({ color: o.lipColor || '#6a5a48' }), darkM = new THREE.MeshBasicMaterial({ color: '#07090d' });
  for (const f of o.ditches || [0.22, 0.48, 0.7]) {
    let s = f * LEN; for (let k = 0; k < 6 && !clear(s); k++) s += 12; if (!clear(s)) continue;
    const [x, z, p] = spot(s, 0), y = o.groundY(x, z), g = new THREE.Group(), w = 1.7;
    const water = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.06, w), ditchM); g.add(water);
    for (const e of [-1, 1]) { const lip = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.26, 0.24), lipM); lip.position.set(0, 0.1, e * (w / 2 + 0.1)); g.add(lip); const sh = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.07, 0.3), darkM); sh.position.set(0, 0.0, e * (w / 2 - 0.16)); g.add(sh); }
    g.position.set(x, y + 0.035, z); g.rotation.y = Math.atan2(p.dx, p.dz); scene.add(g); ditches.push({ s, w, x, z, wet: false, leapt: false, inside: false });
    // three coins in an arc over it: the reward for leaping is in the air
    [[-1.9, 1.25], [0, 2.05], [1.9, 1.25]].forEach(([u, h], k) => { const q = at(s + u); if (!o.blocked(q.x, q.z)) addPick(q.x, q.z, o.groundY(q.x, q.z) + h, 100 + k); });
  }

  const hurdles = [], barrelM = lam({ color: o.barrelColor || '#7a5632' }), hoopM = lam({ color: '#2a2622' });
  (o.hurdles || [0.13, 0.36, 0.58, 0.85]).forEach((f, k) => { let s = f * LEN; for (let n = 0; n < 6 && (!clear(s) || ditches.some(d => Math.abs(d.s - s) < 10)); n++) s += 9; if (!clear(s)) return;
    const [x, z, p] = spot(s, k % 2 ? 1.0 : -1.0); if (o.blocked(x, z)) return; const g = new THREE.Group();
    for (const e of [-0.42, 0.42]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.31, 0.86, 14), barrelM); b.position.set(e, 0.43, 0); b.castShadow = true; g.add(b); for (const hy of [0.2, 0.66]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.022, 5, 16), hoopM); h.rotation.x = Math.PI / 2; h.position.set(e, hy, 0); g.add(h); } }
    g.position.set(x, o.groundY(x, z), z); g.rotation.y = Math.atan2(p.dx, p.dz) + Math.PI / 2; scene.add(g); hurdles.push({ x, z, hit: false, over: false, vaulted: false }); });
  let pts = 0, got = 0, leaps = 0, seen = new Set(), clock = 0, running = false, toastT = 0, lastS = 0, streak = 0, lastGain = -9, mult = 1;
  const flow = n => { streak = clock - lastGain < 3.2 ? streak + n : n; lastGain = clock; const m = 1 + Math.min(3, Math.floor(streak / 4)); if (m > mult) say(`×${m}  keep it flowing!`); mult = m; };
  const lose = (n, msg) => { pts = Math.max(0, pts - n); streak = 0; mult = 1; say(msg); show(); hud.classList.remove('hurt'); void hud.offsetWidth; hud.classList.add('hurt'); if (SND && SND.puff) SND.puff(0.12); };
  hud.innerHTML = '<span class="coin"></span><span class="n">0</span><span><small class="p"></small><small class="c"></small></span>'; const hN = hud.querySelector('.n'), hP = hud.querySelector('.p'), hC = hud.querySelector('.c');
  const show = () => { hN.textContent = pts; hP.textContent = `${seen.size} of ${o.paintings} paintings`; hC.innerHTML = `${got} ${o.things || 'coins'}` + (mult > 1 ? ` <span class="x">×${mult}</span>` : ''); };
  const bump = gain => { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); const r = hud.getBoundingClientRect(), f = document.createElement('div'); f.className = 'scFly'; f.textContent = '+' + gain; f.style.left = (r.left + 40) + 'px'; f.style.top = (r.bottom + 4) + 'px'; document.body.appendChild(f); setTimeout(() => f.remove(), 950); };
  const chime = () => { if (!SND || !SND.bell) return; const k = Math.min(6, Math.floor(streak / 2)); SND.bell(5 + k, 0.075); SND.bell(7 + k, 0.07, 0.07); SND.bell(9 + k, 0.05, 0.15); };      // three quick rising notes, higher as the run of coins grows      // three quick rising notes: a coin taken
  function start() { pts = 0; got = 0; leaps = 0; seen = new Set(); clock = 0; running = true; lastS = 0; for (const g of picks) { g.visible = true; g.userData.pop = 0; g.scale.setScalar(1); for (const m of g.userData.mats) m.opacity = 1; } for (const d of ditches) d.wet = d.leapt = d.inside = false; for (const h of hurdles) h.hit = h.over = h.vaulted = false; streak = 0; mult = 1; lastGain = -9; hud.style.display = ''; show(); const c = document.getElementById('scCard'); if (c) c.remove(); }
  function award(id, n, label) { if (!running || seen.has(id)) return; seen.add(id); pts += n ?? PTS.painting; say(`+${n ?? PTS.painting}  ${label || id}`); show(); bump(n ?? PTS.painting); if (SND && SND.bell) [4, 6, 8, 11].forEach((k, i) => SND.bell(k, 0.07, i * 0.09)); }
  // returns true on the frame she blunders into a ditch, so the game can check her speed
  function update(dt, me, playing, time = performance.now() / 1000) {
    if (toastT > 0 && (toastT -= dt) <= 0) toast.classList.remove('show');
    ditchTex.offset.x = time * 0.12;
    for (const g of picks) if (g.visible) { const u = g.userData;
      if (u.pop > 0) { u.pop -= dt; const k = 1 - Math.max(0, u.pop) / 0.45; g.rotation.y += dt * 18; g.position.y = u.y + k * 1.5; g.scale.setScalar(1 + k * 1.3); for (const m of u.mats) m.opacity = 1 - k * k; if (u.pop <= 0) g.visible = false; }
      else { g.rotation.y += dt * 2.2; g.position.y = u.y + Math.sin(time * 2.4 + u.ph) * 0.09; } }
    if (!running || !playing) return false; clock += dt; let stumble = false;
    for (const g of picks) if (g.visible && !g.userData.pop) { const u = g.userData; if (Math.abs(me.x - u.x) < 1.1 && Math.abs(me.z - u.z) < 1.1 && Math.abs(me.y + 0.9 - u.y) < 1.3) { u.pop = 0.45; got++; flow(1); const gain = PTS.pick * mult; pts += gain; show(); bump(gain); chime(); } }
    const s = o.nearest(me.x, me.z).s;
    for (const d of ditches) { const inside = Math.abs(s - d.s) < d.w / 2 - 0.3 && Math.hypot(me.x - d.x, me.z - d.z) < half + 0.5;
      if (inside && !me.air && !d.wet) { d.wet = true; stumble = true; lose(15, `${o.wet === false ? 'Oof!' : 'Splash!'} −15. Leap the ${o.ditch || 'ditch'}!`); }
      if (d.inside && !inside && !d.wet && !d.leapt && s > d.s) { d.leapt = true; leaps++; flow(2); const gain = PTS.leap * mult; pts += gain; say(`+${gain}  Leapt the ${o.ditch || 'ditch'}!`); show(); bump(gain); if (SND && SND.bell) { SND.bell(9, 0.07); SND.bell(12, 0.06, 0.1); } }
      if (!inside && d.wet && Math.abs(s - d.s) > 6) d.wet = false;      // she may come back and try it again, but the leap only pays once
      d.inside = inside; }
    const alt = me.y - o.groundY(me.x, me.z);
    for (const h of hurdles) { const d = Math.hypot(me.x - h.x, me.z - h.z);
      if (d < 0.95) { if (alt < 0.7 && !h.hit) { h.hit = true; h.over = false; stumble = true; lose(10, 'Oof! −10. Leap the barrels!'); } else if (alt >= 0.7 && !h.hit) h.over = true; }
      else { if (h.over && !h.vaulted && d > 1.2) { h.vaulted = true; leaps++; flow(2); const gain = 20 * mult; pts += gain; say(`+${gain}  Vaulted!`); show(); bump(gain); if (SND && SND.bell) { SND.bell(8, 0.07); SND.bell(11, 0.06, 0.1); } } if (d > 2.6) { h.hit = false; h.over = false; } } }
    if (mult > 1 && clock - lastGain > 3.2) { mult = 1; streak = 0; show(); }
    lastS = s; return stumble;
  }
  function finish() {
    if (!running) return; running = false; hud.style.display = 'none';
    const secs = Math.round(clock), bonus = Math.max(0, 5 * Math.round((300 - secs) / 5)); pts += PTS.finish + bonus;
    const all = loadScores(), was = all[o.key] || {}, best = Math.max(was.best || 0, pts); all[o.key] = { best, time: Math.min(was.time || 1e9, secs), paintings: Math.max(was.paintings || 0, seen.size), of: o.paintings, found: [...new Set([...(was.found || []), ...seen])], coins: Math.max(was.coins || 0, got), runs: (was.runs || 0) + 1, done: Date.now() }; saveScores(all);
    const total = LEVELS.reduce((t, l) => t + ((all[l.key] || {}).best || 0), 0), next = LEVELS[lvl + 1], mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
    const end = document.getElementById('end'), again = document.getElementById('again'), card = document.createElement('p'); card.id = 'scCard';
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    card.innerHTML = `<i>Level ${lvl + 1} of ${LEVELS.length}</i><br><b>${pts}</b> points${pts >= best && was.best ? ' · a new best!' : was.best ? ` · your best is ${best}` : ''}` +
      `<small>${seen.size} of ${o.paintings} paintings · ${got} ${o.things || 'found'} · ${plural(leaps, 'clean leap')} · ${mm}:${ss}` + (bonus ? ` · +${bonus} for speed` : '') + `</small>` +
      (total > pts ? `<small>All levels together: ${total}</small>` : '');
    end.insertBefore(card, end.firstChild); again.classList.add('second');
    let a = document.getElementById('scNext'); if (a) a.remove();
    a = document.createElement('a'); a.id = 'scNext'; a.className = 'go'; a.href = next ? '../' + next.href : '../index.html'; a.textContent = next ? `Next: ${next.name}` : 'Back to the gallery'; end.insertBefore(a, card.nextSibling); board(end, a, pts, secs);
  }
  // the family board: her best for this level, and the top five
  function board(end, after, points, secs) {
    const old = document.getElementById('scBoard'); if (old) old.remove(); const bd = document.createElement('div'); bd.id = 'scBoard'; end.insertBefore(bd, after.nextSibling);
    const draw = async () => { try {
      if (getName()) await postScore(o.key, points, secs); const top = await topScores(o.key); bd.textContent = '';
      if (!getName()) { const f = document.createElement('form'); f.innerHTML = '<label>Put your score on the family board: <input maxlength="16" placeholder="a nickname" autocomplete="off"></label> <button>Add</button>'; const inp = f.querySelector('input'); inp.addEventListener('keydown', e => e.stopPropagation()); inp.addEventListener('keyup', e => e.stopPropagation());
        f.onsubmit = e => { e.preventDefault(); if (setName(inp.value)) draw(); }; bd.appendChild(f); }
      if (top.length) { const h = document.createElement('i'); h.textContent = 'Family board'; bd.appendChild(h); bd.appendChild(document.createElement('br')); const ol = document.createElement('ol');
        top.forEach((r, k) => { const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('span'); a.textContent = `${k + 1}. ${r.n}`; b.textContent = r.p; li.append(a, b); if (r.n === getName()) li.className = 'me'; ol.appendChild(li); }); bd.appendChild(ol); }
    } catch (e) { bd.textContent = ''; } };      // no network: the card simply has no board
    draw();
  }
  const api = { start, award, update, finish, get points() { return pts; }, picks, ditches, hurdles }; window.__sc = api; return api;
}
