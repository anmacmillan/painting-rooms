/* The Day's Patch: Pompeii on the day of the eruption, AD 79.
   You are the girl who fetches and carries for a team of wall painters. This morning's patch of plaster is laid, and a wall painting can only be made while its plaster
   is wet: she runs out for the colours they lack, and must be back before it dries. Half way, the mountain breaks open.
   Sources for everything stated as fact are in research/FINDINGS.md; words.js marks what is the game's own. */
import * as THREE from 'three';
import { rnd, clamp, sstep, mix } from '../common/world.js';
import { makeGuide } from '../common/guide.js';
import { makeScore } from '../common/score.js';
import { makeFigures } from '../common/figure.js';
import { makeTown } from './town.js';
import { makeVesuvius } from './vesuvius.js';
import { BOX, classOf, makeRoute, PLACES } from './plan.js';
import { makeLife } from './life.js';
import { makeHouse, makeProps } from './fresco.js';
import { W } from './words.js';

const $ = id => document.getElementById(id), SND = window.Sound, V3 = THREE.Vector3, C = c => new THREE.Color(c), D2R = Math.PI / 180;
const map = await (await fetch('map.json')).json();
$('endText').innerHTML = W.end;

/* ================= the route ================= */
const RT = makeRoute(map, clamp, mix), { at, LEN, S_FAR } = RT;
let progS = 0;
const nearest = (x, z, hint) => RT.nearest(x, z, hint === undefined ? progS : hint);
const side = (p, u, v) => [p.x + p.dx * u - p.dz * v, p.z + p.dz * u + p.dx * v];      /* u metres on, v metres to the right of the way */
const sOut = p => RT.sOf(p, 0.3 * S_FAR), sBack = p => RT.sOf(p, S_FAR + 0.6 * (LEN - S_FAR));

/* ================= renderer: the town in front, the mountain and its cloud behind at their true distance ================= */
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: $('cv'), antialias: true }); } catch (e) { $('err').style.display = 'flex'; throw e; }
const PR = Math.min(devicePixelRatio || 1, 1.5); renderer.setPixelRatio(PR); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.autoClear = false;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xcfe0f0, 260, 1500);
const camera = new THREE.PerspectiveCamera(60, 1, 0.2, 1200);
const VES = makeVesuvius({ THREE }), SUNP = VES.SUNP;
const hemi = new THREE.HemisphereLight(C('#9fc0ff'), C('#cdb892'), 1.15), sun = new THREE.DirectionalLight(C('#fff1d6'), 2.5); scene.add(hemi, sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); { const c = sun.shadow.camera; c.left = c.bottom = -42; c.right = c.top = 42; c.near = 10; c.far = 420; } sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.06;
const aimSun = (x, y, z) => { sun.target.position.set(x, y, z); sun.position.set(x + SUNP.x * 200, y + SUNP.y * 200, z + SUNP.z * 200); };
const lamp = new THREE.PointLight(C('#ffb060'), 0, 16, 1.6); scene.add(lamp);

/* ================= textures (painted by tools/blender/tex_pompeii.py) and the town ================= */
const TL = new THREE.TextureLoader(), lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
const tex = async f => { const t = await TL.loadAsync('tex/' + f); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
const [tWhite, tRed, tOchre, tRubble, tWood, tTile, tBasalt, tWalk, tPumice] = await Promise.all(['wall_white.jpg', 'wall_red.jpg', 'wall_ochre.jpg', 'rubble.jpg', 'wood.jpg', 'tile.jpg', 'basalt.jpg', 'walk.jpg', 'pumice.jpg'].map(tex));
const T = { white: tWhite, red: tRed, ochre: tOchre, rubble: tRubble, wood: tWood, tile: tTile, basalt: tBasalt, walk: tWalk, pumice: tPumice };
const PL = PLACES, pHome = at(0.01), pDog = at(sOut(PL.dog.door)), pNeo = at(S_FAR - 0.5);
/* fronts the level builds itself: no rule-made bay may stand there */
const OWN = [];      /* { x, z, r } */
for (const [p, sg, hw, w] of [[pDog, -1, RT.half(sOut(PL.dog.door)), 6.4], [pNeo, -1, RT.half(S_FAR - 1), 6.4], ...W.picks.map(k => { const s = sOut(k.p); return [at(s), k.side, RT.half(s), 5.2]; })]) { const [x, z] = side(p, 0, sg * hw); OWN.push({ x, z, r: w / 2 + 0.3 }); }
const TOWN = makeTown({ THREE, scene, map, T, plane: map.plane, box: BOX, classOf, noBay: (x, z) => OWN.some(o => Math.hypot(x - o.x, z - o.z) < o.r) });
const hAt = TOWN.hAt, h0 = TOWN.h0, kind = TOWN.kind, M = TOWN.M;
const on = (o, cast = true, recv = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
const shadowM = basic({ color: 0, transparent: true, opacity: 0.0, depthWrite: false });

/* ---- stepping stones where the side streets come in, and the fountains ---- */
const STONES = [];
for (const [p, hint] of W.stones) { const s = RT.sOf(p, hint === 'out' ? 0.3 * S_FAR : S_FAR + 0.6 * (LEN - S_FAR)), q = at(s); TOWN.steppingStones(q.x, q.z, q.dx, q.dz, RT.half(s) > 4 ? 2.1 : RT.half(s) > 3 ? 2.0 : 1.35, RT.half(s) > 3 ? 3 : 2); STONES.push({ s, x: q.x, z: q.z }); }
const FOUNT = W.fountains.map(f => { const s = sOut(f.p), q = at(s), [x, z] = side(q, 0, f.side * (RT.half(s) - 1.45)); return { ...TOWN.fountain(x, z, Math.atan2(-q.dz * f.side * -1, q.dx * f.side * -1) + Math.PI / 2), x, z, s, n: f.n }; });

/* ================= people (Blender figures) ================= */
const FIG = makeFigures({ THREE, scene, shadowM, castShadow: true });
await FIG.load('models/', ['girl', 'pictor', 'tector', 'man', 'man_beard', 'youth', 'citizen', 'woman', 'woman2', 'neo', 'wife']);
const Tn = (g, bone, x, y, z) => FIG.turn(g.userData, bone, x || 0, y || 0, z || 0);
const arms = (g, S, ux, uy, fx) => { Tn(g, 'upperarm' + S, ux, uy || 0, 0); Tn(g, 'forearm' + S, fx == null ? -20 : fx); };
const onBone = (g, bone, obj, x, y, z) => { const b = g.userData.B[bone]; g.updateWorldMatrix(true, true); const p = new V3(x, y, z).applyMatrix4(g.matrixWorld); b.worldToLocal(p); obj.position.copy(p); const q = b.getWorldQuaternion(new THREE.Quaternion()).invert(), gq = g.getWorldQuaternion(new THREE.Quaternion()); obj.quaternion.copy(q.multiply(gq)); const sc = b.getWorldScale(new V3()); obj.scale.set(1 / sc.x, 1 / sc.y, 1 / sc.z).multiplyScalar(g.scale.x); b.add(obj); on(obj); return obj; };
const meG = FIG.spawn('girl', { size: 0.9 }); FIG.pose(meG, 0, 0);
const PROPS = makeProps({ THREE });
const tray = onBone(meG, 'spine', PROPS.tray(), 0, 0.98, 0.3);      /* the board she carries the pots on */
const cushion = onBone(meG, 'head', PROPS.cushion(), 0, 1.47, 0); cushion.visible = false;

/* ================= the set pieces on the route ================= */
const HOUSE = makeHouse({ THREE, scene, TOWN, T, FIG, Tn, arms, onBone, PROPS, at, side, hAt, h0, OWN, pHome, pDog, pNeo, half: RT.half, S_FAR, LEN, sDog: sOut(PL.dog.door), sOutF: sOut, W });
const LIFE = makeLife({ THREE, scene, TOWN, FIG, Tn, arms, onBone, PROPS, at, side, hAt, h0, RT, S_FAR, LEN, OWN, W, rnd, clamp, sstep, mix, on, shadowM });
/* the notices painted on the walls: on free stretches of wall beside the route */
HOUSE.notices(TOWN.bays, (x, z) => nearest(x, z, null).d);
const MESH = TOWN.flush();

/* ---- the fall: pumice lying deeper and deeper on the street, and stones and ash in the air ---- */
const blanketM = lam({ map: tPumice, transparent: true, opacity: 0, depthWrite: false }); tPumice.repeat.set(1, 1);
const blanket = new THREE.Group(); for (const k of ['basalt', 'walk']) if (MESH[k]) { const m = new THREE.Mesh(MESH[k].geometry, blanketM); m.receiveShadow = true; blanket.add(m); } blanket.visible = false; blanket.renderOrder = 1; scene.add(blanket);
const NP = matchMedia('(pointer: coarse)').matches ? 1400 : 2600, fallU = { uT: { value: 0 }, uAmt: { value: 0 }, uCam: { value: new V3() }, uDark: { value: 0 }, uPR: { value: PR } };
{ const g = new THREE.BufferGeometry(), a = new Float32Array(NP * 3); for (let i = 0; i < a.length; i++) a[i] = Math.random(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: fallU, transparent: true, depthWrite: false,
    vertexShader: `uniform float uT, uAmt, uPR; uniform vec3 uCam; varying float vK; void main(){ vec3 s = position; float sp = 5.0 + 7.0 * fract(s.x * 7.31); vec3 p = vec3(s.x * 44.0, mod(s.y * 24.0 - uT * sp, 24.0), s.z * 44.0);
      p.xz = mod(p.xz - uCam.xz + 22.0, 44.0) - 22.0 + uCam.xz; p.y += uCam.y - 5.0; p.x += sin(uT * 0.9 + s.z * 40.0) * 0.25; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      float onK = step(fract(s.y * 13.7 + s.x * 3.1), uAmt); vK = fract(s.z * 9.13); gl_PointSize = onK * uPR * (1.5 + 4.5 * vK) * clamp(26.0 / -mv.z, 0.25, 3.0); }`,
    fragmentShader: `uniform float uDark; varying float vK; void main(){ vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard; vec3 col = mix(vec3(0.86, 0.84, 0.78), vec3(0.24, 0.22, 0.2), step(0.72, vK)); col *= mix(1.0, 0.45, uDark); gl_FragColor = vec4(col, 0.95);
      #include <colorspace_fragment>
      }` }));
  m.frustumCulled = false; m.renderOrder = 5; scene.add(m); }
/* sound of the mountain: nothing recorded. A low filtered noise for the roar, a crack for a shock, a rattle for stones on the roofs */
const AUD = { ac: null, roar: null, patter: null, muted: false };
function audStart() { if (AUD.ac) return; try { const ac = new (window.AudioContext || window.webkitAudioContext)(), buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const mk = (type, f, q) => { const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; const flt = ac.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q; const g = ac.createGain(); g.gain.value = 0; src.connect(flt).connect(g).connect(ac.destination); src.start(); return { g, flt }; };
    AUD.ac = ac; AUD.roar = mk('lowpass', 70, 0.6); AUD.patter = mk('bandpass', 3400, 0.8); } catch (e) { /* no sound: the level still runs */ } }
const audSet = (roar, patter) => { if (!AUD.ac) return; const t = AUD.ac.currentTime, k = AUD.muted ? 0 : 1; AUD.roar.g.gain.setTargetAtTime(roar * 0.9 * k, t, 0.3); AUD.patter.g.gain.setTargetAtTime(patter * 0.05 * k, t, 0.3); };
const boom = v => { if (!AUD.ac || AUD.muted) return; const ac = AUD.ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(22, t + 1.6); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 2.2); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 2.3); };

/* ================= play ================= */
const guide = makeGuide({ posts: false, THREE, scene, map: { streets: map.streets.filter(s => classOf(s.n)), buildings: map.buildings.filter(b => b.n && !/Insula|Regio/.test(b.n)) }, nearest: (x, z) => nearest(x, z, null), at, LEN, blocked: (x, z) => kind(x, z) === 0, groundY: hAt, bounds: BOX,
  places: [{ n: 'Paquius Proculus’ door', x: pDog.x, z: pDog.z, s: sOut(PL.dog.door) }, ...W.picks.map(p => ({ n: p.shop, x: p.p[0], z: p.p[1], s: sOut(p.p) })), { n: 'Terentius Neo’s door', x: pNeo.x, z: pNeo.z, s: S_FAR }, { n: 'The painters’ house', x: pHome.x, z: pHome.z, s: LEN }],
  style: { board: '#efe6d2', ink: '#8f3326', post: '#6a5a4a', land: '#cdbf9f', water: '#4f8aa0', house: '#b89a7a', street: '#8a8a90', route: '#b63a28' } });
let state = 'title', time = 0, muted = false, wpT = 0, wp = null, bubbleG = null, bubbleT = 0, warnT = 0, quake = 0, lookT = 0, look = null, introT = 0, paintT = 0;
const me = { x: 0, z: 0, y: 0, vy: 0, yaw: 0, air: false, ph: 0, speed: 0, lean: 0 }, keys = new Set(), stick = { id: null, x0: 0, y0: 0, dx: 0, dy: 0 }, held = { jump: false };
const E = { e: 0, on: false, t: 0, beats: 0 };      /* the eruption */
const G = { got: new Set(), cushion: false, wet: 1, relaid: 0, hits: 0, stage: 0 };      /* the errand */
const bubble = $('bubble'); function say(g, text, secs) { bubble.textContent = text; bubble.classList.add('show'); bubbleG = g; bubbleT = time + (secs || 3.5); }
const warn = (t, secs = 2.4) => { $('warn').textContent = t; $('warn').classList.add('show'); warnT = time + secs; };
const plate = (title, line, quote) => { $('plate').innerHTML = (title ? `<i>${title}</i>` : '') + (line ? `<span>${line}</span>` : '') + (quote ? `<em>${quote}</em>` : ''); $('plate').classList.add('show'); };
const blocked = (x, z) => { if (TOWN.wall(x, z)) return true; const n = nearest(x, z); if (n.d > RT.half(n.s) + 2.5) return true; return LIFE.blocked(x, z); };
const PICKS = W.picks.map(p => ({ ...p, s: sOut(p.p) }));
const SC = makeScore({ THREE, scene, key: 'pompeii', at, nearest: (x, z) => nearest(x, z), LEN, groundY: hAt, blocked, isHouse: (x, z) => kind(x, z) === 0, walkers: [], slops: false, washing: false, hurdles: [], ditches: [], paintings: 3, thing: 'sestertius', things: 'sesterces',
  avoid: [0, sOut(PL.dog.door), S_FAR, LEN - 4, ...PICKS.map(p => p.s), ...STONES.map(s => s.s)], half: 1.7, par: 215 });
const STAGES = HOUSE.stages;      /* dog, neo, wall */
function reset() {
  const p = at(0.5), [x, z] = side(p, 2, -(RT.half(0) - 1.2)); Object.assign(me, { x, z, yaw: Math.atan2(p.dx, -p.dz), vy: 0, air: false, speed: 0, y: hAt(x, z) }); progS = 0.5;
  Object.assign(E, { e: 0, on: false, t: 0, beats: 0, hold: null }); Object.assign(G, { got: new Set(), cushion: false, wet: 1, relaid: 0, hits: 0, stage: 0 }); wp = null; look = null; quake = 0; cushion.visible = false;
  for (const st of STAGES) st.reset(); HOUSE.reset(); LIFE.reset(); PROPS.setTray(tray, []);
  camera.position.set(me.x - p.dx * 6, me.y + 3, me.z - p.dz * 6); $('plate').classList.remove('show'); $('melt').classList.remove('show', 'stones'); $('tess').style.display = 'none'; document.body.classList.remove('melting'); $('goal').style.display = 'none'; $('wet').style.display = 'none';
}
function begin() {
  SND.start({ chords: [[38, 50, 57, 62], [36, 48, 55, 64], [41, 48, 57, 60], [38, 45, 57, 62]], scale: [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82, 84] }); SND.setMuted(muted); audStart(); reset(); SC.start(); state = 'intro'; introT = 0;
  $('title').classList.add('hidden'); $('end').classList.add('hidden'); $('skip').style.display = 'block';
}
function startPlay() { state = 'play'; $('skip').style.display = 'none'; $('plate').classList.remove('show'); bubble.classList.remove('show'); const t = $('tip'); t.textContent = matchMedia('(pointer: coarse)').matches ? 'drag to run and turn · second finger to leap' : 'arrow keys to run and turn · space to leap'; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 8000); }
/* what to do next, in plain words, always on screen */
function goal() {
  if (state !== 'play') return null; const need = PICKS.filter(p => !G.got.has(p.id));
  if (progS < S_FAR - 3 && !E.on) { const nx = need.find(p => p.s > progS - 6); if (nx) return `Fetch the ${nx.word} from ${nx.shop}: ${Math.max(5, Math.round((nx.s - progS) / 5) * 5)} m on`; return 'Now the red: on up the Via Stabiana to the door of Terentius Neo'; }
  if (!E.on) return 'Ask at Terentius Neo’s door for the red';
  if (E.e > 1.9 && !G.cushion && LIFE.cushionS > progS - 4) return 'Stones are falling. Take the cushion the woman is holding out, for your head';
  return G.wet > 0 ? 'Home with the colours before the plaster dries: follow the dotted way on the map' : 'Home to the painters: follow the dotted way on the map';
}
function fitFov(aspect, H, D) { const hp = Math.min(innerHeight, innerWidth / aspect); return 2 * Math.atan(H * innerHeight / hp / 2 / D) / D2R; }
const camTo = (pos, lookAt, fov, k, near = 0.2) => { camera.position.lerp(pos, k); camT.lerp(lookAt, k); camera.lookAt(camT); camera.fov += (fov - camera.fov) * k; camNear = near; }, camT = new V3(); let camNear = 0.2;

function update(dt) {
  time += dt;
  /* ---- the eruption's own clock ---- */
  if (E.on && E.hold == null) { E.t += dt; const cap = state === 'paint' || state === 'done' ? 3.9 : 1.2 + 2.3 * sstep(S_FAR + 20, LEN - 25, progS); E.e = Math.min(cap, E.e + dt * (E.e < 1 ? 1 / 13 : 0.07)); }
  const S = VES.update(dt, E.e, time), e = E.e, ashK = sstep(1.5, 3.3, e), nightK = Math.max(S.shade * 0.75, sstep(2.3, 3.6, e));
  sun.intensity = 2.5 * (1 - 0.96 * Math.max(S.shade, sstep(2.0, 3.0, e))); hemi.intensity = mix(1.15, 0.3, nightK) + S.flash * 1.2 * sstep(1.3, 2.5, e); hemi.color.set('#9fc0ff').lerp(C('#9a8a6a'), S.haze).lerp(C('#3a332c'), sstep(2.6, 3.6, e)); hemi.groundColor.set('#cdb892').lerp(C('#4a4036'), nightK);
  scene.fog.color.copy(VES.sky.material.uniforms.uLow.value); scene.fog.near = mix(260, 6, ashK); scene.fog.far = mix(1500, 95, ashK);
  fallU.uT.value = time; fallU.uAmt.value = sstep(1.55, 2.9, e); fallU.uDark.value = nightK; fallU.uCam.value.copy(camera.position);
  const depth = 0.24 * sstep(1.9, 3.6, e); blanket.visible = depth > 0.004; blanket.position.y = depth * 0.5 + 0.012; blanketM.opacity = Math.min(1, depth / 0.05); blanketM.depthWrite = blanketM.opacity > 0.98; M.tile.color.set('#ffffff').lerp(C('#c9c4b8'), sstep(2.0, 3.2, e));
  lamp.intensity = 46 * sstep(2.5, 3.3, e); lamp.position.set(me.x, me.y + 1.9, me.z);
  if (S.struck) { S.struck = false; if (e > 1.6 && Math.random() < 0.6) boom(0.25); }
  quake = Math.max(0, quake - dt * 0.9); audSet(sstep(0.02, 1, e) * (0.5 + 0.5 * sstep(1, 3, e)) + quake * 0.6, fallU.uAmt.value);

  if (state === 'title') { meG.visible = false; const p = at(40); camera.position.set(p.x + 30, h0(p.x, p.z) + 13, p.z + 26); camera.lookAt(p.x - 60, h0(p.x, p.z) + 16, p.z - 90); camera.fov = 55; aimSun(p.x, 0, p.z); }
  else {
    meG.visible = state !== 'intro' && !(state === 'paint') && !(state === 'way' && wp.hideMe);
    let turn = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('KeyQ') ? 1 : 0) + stick.dx, go = (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('KeyZ') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 0.5 : 0) - stick.dy;
    turn = clamp(turn, -1, 1); go = clamp(go, -0.5, 1); if (state !== 'play') { turn = 0; go = 0; }
    me.yaw += turn * 2.4 * dt * (me.air ? 0.6 : 1); const fx = Math.sin(me.yaw), fz = -Math.cos(me.yaw);
    const top = 7.6 * (1 - 0.22 * sstep(0.05, 0.24, depth)) * (SC.powers && SC.powers.some && false ? 1 : 1);
    me.speed += (go * top - me.speed) * Math.min(1, dt * (me.air ? 0.8 : 3.4)); let nx = me.x + fx * me.speed * dt, nz = me.z + fz * me.speed * dt;
    if (blocked(nx, nz)) { const mx = nx - me.x, mz = nz - me.z; let ok = false;
      for (const a of [0.45, -0.45, 0.9, -0.9, 1.3, -1.3, 1.52, -1.52]) { const c = Math.cos(a), sn = Math.sin(a), k = Math.max(0.28, c), tx = me.x + (mx * c - mz * sn) * k, tz = me.z + (mx * sn + mz * c) * k; if (!blocked(tx, tz)) { nx = tx; nz = tz; ok = true; break; } }
      if (!ok) { nx = me.x; nz = me.z; me.speed *= 0.5; } }
    for (const o of TOWN.solids) { const d = Math.hypot(nx - o.x, nz - o.z); if (d < o.r && d > 0.001) { const px = o.x + (nx - o.x) / d * o.r, pz = o.z + (nz - o.z) / d * o.r; if (kind(px, pz) !== 0) { nx = px; nz = pz; } } }      /* she slides round a fountain */
    const f = hAt(nx, nz) + (kind(nx, nz) === 2 ? depth : depth * 0.5); me.x = nx; me.z = nz; const jump = (keys.has('Space') || held.jump) && state === 'play';
    if (jump && !me.air) { me.vy = 5.6 + Math.abs(me.speed) * 0.2; me.air = true; SND.whoosh(0.04); }
    if (me.air) { me.vy -= (jump && me.vy < 0 ? 6 : 15) * dt; me.y += me.vy * dt; if (me.y <= f) { me.y = f; me.air = false; SND.puff(0.06); } } else me.y += (f - me.y) * Math.min(1, dt * 16);
    const pace = Math.abs(me.speed) / 5.5, before = Math.floor(me.ph / Math.PI); me.ph += dt * (2 + Math.abs(me.speed) * 1.05); if (!me.air && pace > 0.2 && Math.floor(me.ph / Math.PI) !== before) SND.puff(0.02 + 0.03 * sstep(0.02, 0.2, depth));
    me.lean += (turn * 0.2 * Math.min(1, pace) - me.lean) * Math.min(1, dt * 6);
    if (state === 'play' || state === 'look') { meG.position.set(me.x, me.y, me.z); meG.rotation.y = Math.PI - me.yaw; meG.rotation.z = -me.lean; FIG.pose(meG, me.ph, me.air ? 0.4 : pace, me.air, 0.06 * Math.min(1, pace)); arms(meG, 'L', -52, 8, -62); arms(meG, 'R', -52, -8, -62); }
    if (SC.update(dt, me, state === 'play', time)) me.speed *= 0.3;
    const prog = nearest(me.x, me.z); if (state === 'play') progS = Math.max(progS - 3, prog.s); const alt = me.y - f;

    /* ---- the plaster dries, whatever she does ---- */
    if (state === 'play') { G.wet = Math.max(0, G.wet - dt / W.dryTime); }
    { const el = $('wet'), showW = state === 'play' || state === 'look'; el.style.display = showW ? 'flex' : 'none'; if (showW) { el.querySelector('b').style.width = (G.wet * 100).toFixed(1) + '%'; const wd = G.wet > 0.66 ? 'wet' : G.wet > 0.33 ? 'firming' : G.wet > 0 ? 'nearly dry' : 'dry'; if ($('wetW').textContent !== wd) $('wetW').textContent = wd; el.classList.toggle('dry', G.wet <= 0); } }

    /* ---- the colours: each is taken at its seller's counter ---- */
    if (state === 'play' && !E.on) for (const p of PICKS) if (!G.got.has(p.id)) { const m = HOUSE.pickAt[p.id]; if (Math.hypot(m.x - me.x, m.z - me.z) < 2.3) { G.got.add(p.id); SC.keep(p.id, { title: p.title, emoji: p.emoji }); SC.gain(40, p.title, 2); PROPS.setTray(tray, [...G.got]); HOUSE.took(p.id); say(m.g, p.line, 5.5); SND.bell(6, 0.07); } else if (progS > p.s + 14 && !p.told) { p.told = true; warn(`You have run past the ${p.word}: it is behind you`, 3); } }
    /* ---- small tremors before: the ground had been shaking for days ---- */
    if (state === 'play' && !E.on) for (const q of W.tremors) if (!G['q' + q.s] && progS > q.s * S_FAR) { G['q' + q.s] = true; quake = 0.55; boom(0.12); LIFE.startle(); warn(q.line, 3.2); }

    /* ---- the stagings: three works, each where it was found ---- */
    const next = STAGES[G.stage];
    if (next && state === 'play' && next.ready(progS, me, E)) { state = 'way'; wp = next; wpT = 0; me.speed = 0; $('melt').src = wp.img; bubble.classList.remove('show'); $('warn').classList.remove('show'); SND.whoosh(0.07); wp.enter(me); }
    if (state === 'way') { wpT += dt; const hold = window.__road.holdStage; if (hold) wpT = Math.min(wpT, wp.holdAt); const r = wp.update(wpT, dt, me);
      if (wpT > wp.tPlate && !wp.plated) { wp.plated = true; SC.award(wp.title, null, wp.title); plate(wp.title, wp.line, wp.quote); }
      if (wp.stones) wp.stones(wpT); else if (wpT > wp.tMelt && wpT < wp.tEnd - 1.6) { $('melt').classList.add('show'); document.body.classList.add('melting'); }
      if (wpT > wp.tEnd - 1.6) { $('melt').classList.remove('show', 'stones'); $('melt').style.opacity = ''; $('tess').style.display = 'none'; document.body.classList.remove('melting'); $('plate').classList.remove('show'); }
      if (wpT > wp.tEnd) { wp.exit(me); G.stage++; const was = wp; wp = null; state = 'play';
        if (was.key === 'neo') { G.got.add('red'); SC.keep('red', { title: 'Red: cinnabar, paid for by the owner', emoji: '🔴' }); PROPS.setTray(tray, [...G.got]); progS = S_FAR + 1.5; const p = at(S_FAR + 3); me.yaw = Math.atan2(p.dx, -p.dz); E.on = true; E.e = 0.01; quake = 1.6; boom(0.6); LIFE.flee(); look = W.beats[0]; lookT = 0; state = 'look'; E.beats = 1; }
        if (was.key === 'wall') { state = 'done'; $('goal').style.display = 'none'; SC.finish(); $('end').classList.remove('hidden'); } } }
    /* ---- the mountain's own moments: the view turns to it, and Pliny speaks ---- */
    if (state === 'play' && E.on && E.beats < W.beats.length && e > W.beats[E.beats].e) { look = W.beats[E.beats++]; lookT = 0; state = 'look'; me.speed = 0; quake = Math.max(quake, 0.8); boom(0.3); }
    if (state === 'look') { lookT += dt; const hold = window.__road.holdLook; if (hold) lookT = Math.min(lookT, 3); if (lookT > 0.8 && lookT < 0.9 + dt) plate(look.title, look.line, look.quote); if (lookT > look.secs) { $('plate').classList.remove('show'); state = 'play'; look = null; } }
    /* ---- stones in the air: under a pent roof or with a cushion tied on she is safe ---- */
    LIFE.update(dt, { me, state, progS, e, depth, time, alt, say, warn, SC, G, quake: v => { quake = Math.max(quake, v); }, cushion, nearest, blocked: (x, z) => kind(x, z) === 0 });
    /* ---- home: the last staging takes over ---- */
    HOUSE.update(dt, { time, state, progS, e, G, me, say, intro: introT, quake: v => { quake = Math.max(quake, v); boom(0.7); }, paid: (n, of) => { if (n) SC.gain(60 * n, n === 1 ? 'One colour, on wet plaster' : n + ' colours, on wet plaster', 2); else if (of) warn('The plaster had dried', 3); } });

    /* ---- camera ---- */
    if (state === 'intro') { introT += dt; const c = HOUSE.introCam(introT); camTo(c.pos, c.look, c.fov, c.cut ? 1 : Math.min(1, dt * 2)); aimSun(c.look.x, c.look.y, c.look.z); const L = W.intro.find(l => introT > l.t && !l.done); if (L) { L.done = true; say(HOUSE.speaker(L.who), L.text, L.secs); } if (introT > W.introSecs) { for (const l of W.intro) l.done = false; startPlay(); } }
    else if (state === 'way') { const c = wp.cam(wpT); camTo(c.pos, c.look, c.fov, Math.min(1, dt * (c.k || 2.2)), c.near || 0.2); aimSun(c.look.x, c.look.y, c.look.z); }
    else if (state === 'done') { /* the camera stays where the last staging left it */ }
    else if (state === 'look') { const d = VES.dir, k = Math.min(1, dt * 1.8), up = look.high ? 9.5 : 2.2, back = look.high ? 9 : 5.5; camTo(new V3(me.x - d.x * back, me.y + up, me.z - d.z * back), new V3(me.x + d.x * 60, me.y + up + (look.tilt || 22), me.z + d.z * 60), look.fov || 66, k); aimSun(me.x, me.y, me.z); }
    else { let dist = 5.0 + Math.abs(me.speed) * 0.16 + Math.max(0, alt) * 0.5, cx, cz; for (let k = 0; k < 5; k++) { cx = me.x - fx * dist; cz = me.z - fz * dist; if (kind(cx, cz) !== 0) break; dist *= 0.62; }
      const k = Math.min(1, dt * 5.5), cyT = me.y + 2.45 + Math.max(0, alt) * 0.25; camera.position.x += (cx - camera.position.x) * k; camera.position.z += (cz - camera.position.z) * k; camera.position.y += (cyT - camera.position.y) * k;
      camT.set(me.x + fx * 6, me.y + 1.9, me.z + fz * 6); camera.lookAt(camT); camera.rotation.z += -me.lean * 0.25; camera.fov += (60 + Math.abs(me.speed) * 1.2 - camera.fov) * k; camNear = 0.2; aimSun(me.x + fx * 12, me.y, me.z + fz * 12); }
    if (quake > 0.01) { const a = quake * 0.09; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; camera.rotation.z += (Math.random() - 0.5) * a * 0.12; }
  }
  if (time > warnT) $('warn').classList.remove('show');
  if (bubbleG) { if (time > bubbleT) { bubble.classList.remove('show'); bubbleG = null; } else { const v = new V3(); bubbleG.getWorldPosition(v); v.y += 2.2; v.project(camera); const vis = v.z < 1 && Math.abs(v.x) < 0.95 && v.y < 0.9; bubble.style.left = vis ? clamp((v.x * 0.5 + 0.5) * innerWidth, 150, innerWidth - 150) + 'px' : innerWidth / 2 + 'px'; bubble.style.top = vis ? Math.max(90, (-v.y * 0.5 + 0.5) * innerHeight) + 'px' : innerHeight * 0.24 + 'px'; bubble.classList.add('show'); } }
  { const g = goal(), el = $('goal'); el.style.display = g ? 'block' : 'none'; if (g && el.textContent !== '➜ ' + g) el.textContent = '➜ ' + g; }
  const tgt = state === 'play' ? (E.on ? at(LEN - 1) : (PICKS.find(p => !G.got.has(p.id) && p.s > progS - 6) ? at(PICKS.find(p => !G.got.has(p.id) && p.s > progS - 6).s) : pNeo)) : pHome; guide.update(me, { x: tgt.x, z: tgt.z }, state === 'play');
  SND.update(0.3 + 0.4 * Math.min(1, Math.abs(me.speed) / 9), clamp((me.air ? 0.2 : 0) + sstep(1, 3, E.e) * 0.5, 0, 1));
}
function draw() {
  const w = innerWidth, h = innerHeight;
  if (renderer.domElement.width !== Math.round(w * PR) || renderer.domElement.height !== Math.round(h * PR)) { renderer.setSize(w, h, false); camera.aspect = w / h; }
  if (camHold) camHold();
  renderer.clear(); camera.near = 80; camera.far = 250000; camera.updateProjectionMatrix(); renderer.render(VES.far, camera);
  renderer.clearDepth(); camera.near = camNear; camera.far = 1300; camera.updateProjectionMatrix(); renderer.render(scene, camera);
}
let camHold = null;      /* a test hook: a still camera */
let last = 0; function loop(ms) { const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms; update(dt); draw(); requestAnimationFrame(loop); }
reset(); requestAnimationFrame(loop);

/* ================= input ================= */
addEventListener('keydown', ev => { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code)) ev.preventDefault(); keys.add(ev.code); if (ev.code === 'Enter' && (state === 'title' || state === 'done')) begin(); else if ((ev.code === 'Enter' || ev.code === 'Space') && state === 'intro' && introT > 1) introT = W.introSecs; });
addEventListener('keyup', ev => keys.delete(ev.code)); addEventListener('blur', () => { keys.clear(); stick.id = null; stick.dx = stick.dy = 0; held.jump = false; });
const cv = $('cv'), sk = $('stick');
cv.addEventListener('pointerdown', ev => { if (state !== 'play') return; if (stick.id !== null) { held.jump = true; held.id = ev.pointerId; return; } stick.id = ev.pointerId; stick.x0 = ev.clientX; stick.y0 = ev.clientY; stick.dx = stick.dy = 0; try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* older Safari */ } sk.style.display = 'block'; sk.style.left = ev.clientX + 'px'; sk.style.top = ev.clientY + 'px'; sk.firstElementChild.style.transform = ''; });
cv.addEventListener('pointermove', ev => { if (ev.pointerId !== stick.id) return; let dx = (ev.clientX - stick.x0) / 48, dy = (ev.clientY - stick.y0) / 48; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.dx = dx; stick.dy = dy; sk.firstElementChild.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; });
const lift = ev => { if (ev.pointerId === stick.id) { stick.id = null; stick.dx = stick.dy = 0; sk.style.display = 'none'; } if (ev.pointerId === held.id) held.jump = false; };
cv.addEventListener('pointerup', lift); cv.addEventListener('pointercancel', lift);
$('bMute').addEventListener('click', () => { muted = !muted; AUD.muted = muted; $('waves').style.display = muted ? 'none' : ''; SND.setMuted(muted); });
$('skip').addEventListener('click', () => { if (state === 'intro') introT = W.introSecs; });
$('start').addEventListener('click', begin); $('again').addEventListener('click', begin); document.addEventListener('gesturestart', ev => ev.preventDefault());
window.__road = { get state() { return state; }, me, begin, freeze(f) { camHold = f; }, hAt, kind, world: { found: new Set() }, E, G, RT, VES, TOWN, LIFE, HOUSE, STAGES, PICKS, LEN, S_FAR, holdStage: false, holdLook: false,
  go(s, lat = 0) { const p = at(s), [x, z] = side(p, 0, lat); me.x = x; me.z = z; me.speed = 0; progS = s; me.y = hAt(x, z); me.yaw = Math.atan2(p.dx, -p.dz); meG.position.set(x, me.y, z); }, face(a) { me.yaw = a; }, setE(v, hold) { E.on = v > 0; E.e = v; E.hold = hold ? v : null; }, skipIntro() { introT = W.introSecs; }, stage(i) { G.stage = i; },
  route: s => at(s), get wpT() { return wpT; }, get time() { return time; }, get progS() { return progS; }, get introT() { return introT; }, dbg: { camera, meG, THREE, scene, sun, hemi, blocked, nearest, lamp, MESH },
  probe: (x, z) => ({ kind: kind(x, z), blocked: blocked(x, z), y: +hAt(x, z).toFixed(2), d: +nearest(x, z).d.toFixed(1), s: +nearest(x, z).s.toFixed(0) }) };
