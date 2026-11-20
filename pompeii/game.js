/* While the Plaster Is Wet: Pompeii on the day of the eruption, AD 79.
   One story: you are the painters' girl, bringing home three colours (red, blue, black) before the wet plaster dries.
   The eruption of Vesuvius arrives as part of her race home, told truly from Pliny (Letters 6.16 and 6.20, Firth 1900).
   The entire frame is rendered in the manner of Pompeian Fourth-Style wall painting (fresco_fx.js + fresco_tex.js).
   Sources for every fact are in research/FINDINGS.md; words.js marks what is the game's own. */
import * as THREE from 'three';
import { rnd, clamp, sstep, mix } from '../common/world.js';
import { makeGuide } from '../common/guide.js';
import { makeScore } from '../common/score.js';
import { makeFigures } from '../common/figure.js';
import { makeTown } from './town.js';
import { makeVesuvius } from './vesuvius.js';
import { makeFrescoFX } from './fresco_fx.js';
import { makeFrescoTextures } from './fresco_tex.js';
import { BOX, classOf, makeRoute, PLACES } from './plan.js';
import { makeLife } from './life.js';
import { makeHouse, makeProps } from './fresco.js';
import { W } from './words.js';

const $ = id => document.getElementById(id), SND = window.Sound, V3 = THREE.Vector3, C = c => new THREE.Color(c), D2R = Math.PI / 180;
const map = await (await fetch('map.json')).json();
$('endText').innerHTML = W.end;

/* ================= the shortened real route (360 m, one turn at Holconius crossroads) ================= */
const RT = makeRoute(map, clamp, mix), { at, LEN, S_NEO, S_CROSS } = RT;
let progS = 0;
const E = { e: 0, on: false, t: 0, beats: 0, hold: null, liveT: 0 };
const nearest = (x, z, hint, afterNeo) => RT.nearest(x, z, hint === undefined ? progS : hint, afterNeo === undefined ? E.on : afterNeo);
const side = (p, u, v) => [p.x + p.dx * u - p.dz * v, p.z + p.dz * u + p.dx * v];
const sBack = p => RT.sOf(p, true);

/* ================= renderer + Roman wall-painting single-pass post filter (fresco_fx.js) ================= */
let renderer; try { renderer = new THREE.WebGLRenderer({ canvas: $('cv'), antialias: false }); } catch (e) { $('err').style.display = 'flex'; throw e; }
const PR = Math.min(devicePixelRatio || 1, 1.5); renderer.setPixelRatio(PR); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.autoClear = false;
const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
rt.depthTexture = new THREE.DepthTexture(4, 4, THREE.FloatType);
const FX = makeFrescoFX(THREE, { scene: rt.texture, depth: rt.depthTexture });
const postScene = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), FX.material));

const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xe3d7be, 240, 1400);
const camera = new THREE.PerspectiveCamera(60, 1, 0.2, 1200);
const VES = makeVesuvius({ THREE }), SUNP = VES.SUNP;
const hemi = new THREE.HemisphereLight(C('#f3e8d2'), C('#cca77c'), 1.55), sun = new THREE.DirectionalLight(C('#fff0cf'), 2.05); scene.add(hemi, sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); { const c = sun.shadow.camera; c.left = c.bottom = -38; c.right = c.top = 38; c.near = 10; c.far = 380; } sun.shadow.bias = -0.0007; sun.shadow.normalBias = 0.06;
const aimSun = (x, y, z) => { sun.target.position.set(x, y, z); sun.position.set(x + SUNP.x * 180, y + SUNP.y * 180, z + SUNP.z * 180); };
const lamp = new THREE.PointLight(C('#ffb460'), 0, 18, 1.45); scene.add(lamp);

/* ================= Fourth-Style fresco textures and the town ================= */
const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
const T = makeFrescoTextures(THREE);
const PL = PLACES, sDog = sBack(PL.dog.door), pNeo = at(S_NEO - 0.5), pDog = at(sDog), pHome = at(LEN - 0.5), pCross = at(S_CROSS);
const OWN = [];
for (const [p, sg, hw, w] of [[pNeo, -1, RT.half(S_NEO - 1), 6.6], [pDog, 1, RT.half(sDog), 6.6], [pHome, -1, RT.half(LEN - 1), 6.6], ...W.picks.map(k => { const s = sBack(k.p); return [at(s), k.side, RT.half(s), 5.6]; })]) {
  const [x, z] = side(p, 0, sg * hw); OWN.push({ x, z, r: w / 2 + 0.35 });
}
const TOWN = makeTown({ THREE, scene, map, T, plane: map.plane, box: BOX, classOf, noBay: (x, z) => OWN.some(o => Math.hypot(x - o.x, z - o.z) < o.r) });
const hAt = TOWN.hAt, h0 = TOWN.h0, kind = TOWN.kind, M = TOWN.M;
const on = (o, cast = true, recv = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
const shadowM = basic({ color: 0x3a261c, transparent: true, opacity: 0.24, depthWrite: false });

/* ---- stepping stones, fountains, and painted garden tops ---- */
const STONES = [];
for (const [p, af] of W.stones) { const s = RT.sOf(p, af), q = at(s); TOWN.steppingStones(q.x, q.z, q.dx, q.dz, RT.half(s) > 4 ? 2.1 : 2.0, 3); STONES.push({ s, x: q.x, z: q.z }); }
const FOUNT = W.fountains.map(f => { const s = sBack(f.p), q = at(s), [x, z] = side(q, 0, f.side * (RT.half(s) - 1.45)); return { ...TOWN.fountain(x, z, Math.atan2(-q.dz * f.side * -1, q.dx * f.side * -1) + Math.PI / 2), x, z, s, n: f.n }; });
TOWN.gardenTops((x, z) => RT.nearest(x, z, null, null).d);

/* ================= people (Blender figures, contact shadows for steady 60 fps on iPad) ================= */
const FIG = makeFigures({ THREE, scene, shadowM, castShadow: false });
await FIG.load('models/', ['girl', 'pictor', 'tector', 'man', 'man_beard', 'youth', 'citizen', 'woman', 'woman2', 'neo', 'wife']);
const Tn = (g, bone, x, y, z) => FIG.turn(g.userData, bone, x || 0, y || 0, z || 0);
const arms = (g, S, ux, uy, fx) => { Tn(g, 'upperarm' + S, ux, uy || 0, 0); Tn(g, 'forearm' + S, fx == null ? -20 : fx); };
const onBone = (g, bone, obj, x, y, z) => { const b = g.userData.B[bone]; g.updateWorldMatrix(true, true); const p = new V3(x, y, z).applyMatrix4(g.matrixWorld); b.worldToLocal(p); obj.position.copy(p); const q = b.getWorldQuaternion(new THREE.Quaternion()).invert(), gq = g.getWorldQuaternion(new THREE.Quaternion()); obj.quaternion.copy(q.multiply(gq)); const sc = b.getWorldScale(new V3()); obj.scale.set(1 / sc.x, 1 / sc.y, 1 / sc.z).multiplyScalar(g.scale.x); b.add(obj); on(obj); return obj; };
const meG = FIG.spawn('girl', { size: 0.9 }); FIG.pose(meG, 0, 0);
const PROPS = makeProps({ THREE });
const tray = onBone(meG, 'spine', PROPS.tray(), 0, 0.98, 0.3);
const cushion = onBone(meG, 'head', PROPS.cushion(), 0, 1.47, 0); cushion.visible = false;

/* ================= set pieces, life, notices, pumice fall & sound ================= */
const HOUSE = makeHouse({ THREE, scene, TOWN, T, FIG, Tn, arms, onBone, PROPS, at, side, hAt, h0, OWN, pHome, pDog, pNeo, half: RT.half, S_NEO, S_CROSS, LEN, sDog, sBackF: sBack, W });
const LIFE = makeLife({ THREE, scene, TOWN, FIG, Tn, onBone, PROPS, at, side, hAt, h0, RT, S_NEO, S_CROSS, LEN, W, clamp, sstep, mix, on, VES });
HOUSE.notices(TOWN.bays, (x, z) => RT.nearest(x, z, null, null).d);
const MESH = TOWN.flush();

const blanketM = lam({ map: T.pumice, transparent: true, opacity: 0, depthWrite: false });
const blanket = new THREE.Group(); for (const k of ['basalt', 'walk']) if (MESH[k]) { const m = new THREE.Mesh(MESH[k].geometry, blanketM); m.receiveShadow = true; blanket.add(m); } blanket.visible = false; blanket.renderOrder = 1; scene.add(blanket);
const NP = matchMedia('(pointer: coarse)').matches ? 1200 : 2200, fallU = { uT: { value: 0 }, uAmt: { value: 0 }, uCam: { value: new V3() }, uDark: { value: 0 }, uPR: { value: PR } };
{ const g = new THREE.BufferGeometry(), a = new Float32Array(NP * 3); for (let i = 0; i < a.length; i++) a[i] = Math.random(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: fallU, transparent: true, depthWrite: false,
    vertexShader: `uniform float uT, uAmt, uPR; uniform vec3 uCam; varying float vK; void main(){ vec3 s = position; float sp = 5.0 + 7.0 * fract(s.x * 7.31); vec3 p = vec3(s.x * 44.0, mod(s.y * 24.0 - uT * sp, 24.0), s.z * 44.0);
      p.xz = mod(p.xz - uCam.xz + 22.0, 44.0) - 22.0 + uCam.xz; p.y += uCam.y - 5.0; p.x += sin(uT * 0.9 + s.z * 40.0) * 0.25; vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
      float onK = step(fract(s.y * 13.7 + s.x * 3.1), uAmt); vK = fract(s.z * 9.13); gl_PointSize = onK * uPR * (1.5 + 4.5 * vK) * clamp(26.0 / -mv.z, 0.25, 3.0); }`,
    fragmentShader: `uniform float uDark; varying float vK; void main(){ vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard; vec3 col = mix(vec3(0.88, 0.84, 0.76), vec3(0.30, 0.26, 0.22), step(0.72, vK)); col *= mix(1.0, 0.52, uDark); gl_FragColor = vec4(col, 0.95);
      #include <colorspace_fragment>
      }` }));
  m.frustumCulled = false; m.renderOrder = 5; scene.add(m); }

const AUD = { ac: null, roar: null, patter: null, muted: false };
function audStart() { if (AUD.ac) return; try { const ac = new (window.AudioContext || window.webkitAudioContext)(), buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const mk = (type, f, q) => { const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; const flt = ac.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q; const g = ac.createGain(); g.gain.value = 0; src.connect(flt).connect(g).connect(ac.destination); src.start(); return { g, flt }; };
    AUD.ac = ac; AUD.roar = mk('lowpass', 70, 0.6); AUD.patter = mk('bandpass', 3400, 0.8); } catch (e) { /* no sound */ } }
const audSet = (roar, patter) => { if (!AUD.ac) return; const t = AUD.ac.currentTime, k = AUD.muted ? 0 : 1; AUD.roar.g.gain.setTargetAtTime(roar * 0.9 * k, t, 0.3); AUD.patter.g.gain.setTargetAtTime(patter * 0.05 * k, t, 0.3); };
const boom = v => { if (!AUD.ac || AUD.muted) return; const ac = AUD.ac, o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = 'sine'; o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(22, t + 1.6); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 2.2); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 2.3); };

/* ================= play state, guide, score & HUD ================= */
const PICKS = W.picks.map(p => ({ ...p, s: sBack(p.p) }));
const sBlue = PICKS.find(p => p.id === 'blue').s, sBlack = PICKS.find(p => p.id === 'black').s;
const guide = makeGuide({ posts: false, THREE, scene, map: { streets: map.streets.filter(s => classOf(s.n)), buildings: map.buildings.filter(b => b.n && !/Insula|Regio/.test(b.n)) }, nearest: (x, z) => RT.nearest(x, z, null, null), at, LEN, blocked: (x, z) => TOWN.wall(x, z), groundY: hAt, bounds: BOX,
  places: [{ n: 'Terentius Neo’s door (Red)', x: pNeo.x, z: pNeo.z, s: S_NEO }, ...PICKS.map(p => ({ n: p.shop, x: p.p[0], z: p.p[1], s: p.s })), { n: 'Paquius Proculus’ door', x: pDog.x, z: pDog.z, s: sDog }, { n: 'The painters’ house', x: pHome.x, z: pHome.z, s: LEN }],
  style: { board: '#efe6d2', ink: '#8f3326', post: '#6a5a4a', land: '#d8cab0', water: '#5c94a8', house: '#b89472', street: '#8e867c', route: '#b63a28' } });

let state = 'title', time = 0, muted = false, wpT = 0, wp = null, bubbleG = null, bubbleT = 0, warnT = 0, quake = 0, lookT = 0, look = null, introT = 0;
const me = { x: 0, z: 0, y: 0, vy: 0, yaw: 0, air: false, ph: 0, speed: 0, lean: 0 }, keys = new Set(), stick = { id: null, x0: 0, y0: 0, dx: 0, dy: 0 }, held = { jump: false };
const G = { got: new Set(), cushion: false, wet: 1, hits: 0, stage: 0 };
const bubble = $('bubble');
function say(g, text, secs) { bubble.textContent = text; bubble.classList.add('show'); bubbleG = g; bubbleT = time + (secs || 3.5); }
const warn = (t, secs = 2.4) => { $('warn').textContent = t; $('warn').classList.add('show'); warnT = time + secs; };
const plate = (title, line, quote) => { $('plate').innerHTML = (title ? `<i>${title}</i>` : '') + (line ? `<span>${line}</span>` : '') + (quote ? `<em>${quote}</em>` : ''); $('plate').classList.add('show'); };
const blocked = (x, z) => { if (TOWN.wall(x, z)) return true; const n = nearest(x, z); if (n.d > RT.half(n.s) + 8.5) return true; return LIFE.blocked(x, z); };
const SC = makeScore({ THREE, scene, key: 'pompeii', at, nearest: (x, z) => RT.nearest(x, z, null, null), LEN, groundY: hAt, blocked, isHouse: (x, z) => TOWN.wall(x, z), walkers: [], slops: false, washing: false, hurdles: [], ditches: [], paintings: 3, thing: 'sestertius', things: 'sesterces',
  avoid: [0, S_NEO, sBlue, S_CROSS, sDog, sBlack, LEN - 4, ...STONES.map(s => s.s)], half: 1.05, par: 150 });
const STAGES = HOUSE.stages;      /* neo, dog, wall */
function syncPips() {
  $('pRed').classList.toggle('got', G.got.has('red'));
  $('pBlue').classList.toggle('got', G.got.has('blue'));
  $('pBlack').classList.toggle('got', G.got.has('black'));
  $('pCnt').textContent = `${G.got.size}/3`;
}
function reset() {
  const p = at(0.5), [x, z] = side(p, 0, -0.4);
  Object.assign(me, { x, z, yaw: Math.atan2(p.dx, -p.dz), vy: 0, air: false, speed: 0, y: hAt(x, z) }); progS = 0.5;
  Object.assign(E, { e: 0, on: false, t: 0, beats: 0, hold: null, liveT: 0 });
  Object.assign(G, { got: new Set(), cushion: false, wet: 1, hits: 0, stage: 0 }); wp = null; look = null; quake = 0; cushion.visible = false;
  for (const st of STAGES) st.reset(); HOUSE.reset(); LIFE.reset(); PROPS.setTray(tray, []); syncPips();
  camera.position.set(me.x - p.dx * 5.5, me.y + 2.8, me.z - p.dz * 5.5);
  $('plate').classList.remove('show'); $('melt').classList.remove('show', 'stones'); $('tess').style.display = 'none';
  document.body.classList.remove('melting'); $('goal').style.display = 'none'; $('wet').style.display = 'none';
}
function begin() {
  SND.start({ chords: [[38, 50, 57, 62], [36, 48, 55, 64], [41, 48, 57, 60], [38, 45, 57, 62]], scale: [62, 64, 65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82, 84] }); SND.setMuted(muted); audStart(); reset(); SC.start(); state = 'intro'; introT = 0;
  $('title').classList.add('hidden'); $('end').classList.add('hidden'); $('skip').style.display = 'block';
}
function startPlay() {
  state = 'play'; $('skip').style.display = 'none'; $('plate').classList.remove('show'); bubble.classList.remove('show');
  const p = at(0.5); camera.position.set(me.x - p.dx * 5.2, me.y + 2.5, me.z - p.dz * 5.2);
  const t = $('tip'); t.textContent = matchMedia('(pointer: coarse)').matches ? 'drag to run and turn · second finger to leap' : 'arrow keys to run and turn · space to leap';
  t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 6500);
}
function nextTarget() {
  if (!E.on) return { p: pNeo, s: S_NEO };
  if (!G.got.has('blue')) return { p: at(sBlue), s: sBlue };
  if (progS < S_CROSS - 3) return { p: pCross, s: S_CROSS };
  if (!G.got.has('black')) return { p: at(sBlack), s: sBlack };
  return { p: pHome, s: LEN };
}
function goal() {
  if (state !== 'play') return null;
  const cnt = `${G.got.size} of 3 colours`, dTo = s => Math.max(5, Math.round(Math.abs(s - progS) / 5) * 5);
  if (!E.on) return `${cnt} · Follow the boy to Terentius Neo for red (${dTo(S_NEO)} m)`;
  if (!G.got.has('blue')) return `${cnt} · Follow him down Via Stabiana for blue (${dTo(sBlue)} m)`;
  if (progS < S_CROSS - 4) return `${cnt} · Turn left at the crossroads ahead (${dTo(S_CROSS)} m)`;
  if (E.e > 1.9 && !G.cushion && LIFE.cushionS > progS - 4 && LIFE.cushionS - progS < 35) return `${cnt} · Take the cushion ahead, then straight on for black`;
  if (!G.got.has('black')) return `${cnt} · Straight on to Asellina’s bar for black (${dTo(sBlack)} m)`;
  return G.wet > 0 ? `${cnt} · Straight home before the plaster dries! (${dTo(LEN)} m)` : `${cnt} · Straight home to the painters’ house! (${dTo(LEN)} m)`;
}
const camTo = (pos, lookAt, fov, k, near = 0.2) => { camera.position.lerp(pos, k); camT.lerp(lookAt, k); camera.lookAt(camT); camera.fov += (fov - camera.fov) * k; camNear = near; }, camT = new V3(); let camNear = 0.2;

function update(dt) {
  time += dt;
  /* ---- the eruption's clock, tied cleanly to her run home ---- */
  if (E.on && E.hold == null) { E.t += dt; const cap = state === 'done' ? 3.8 : 1.05 + 2.45 * sstep(S_NEO + 10, LEN - 14, progS); E.e = Math.min(cap, E.e + dt * (E.e < 0.9 ? 1 / 9 : 0.095)); }
  const S = VES.update(dt, E.e, time), e = E.e, ashK = sstep(1.5, 3.3, e), nightK = Math.max(S.shade * 0.65, sstep(2.45, 3.65, e));
  sun.intensity = 2.05 * (1 - 0.92 * Math.max(S.shade, sstep(2.0, 3.1, e)));
  hemi.intensity = mix(1.55, 0.44, nightK) + S.flash * 1.15 * sstep(1.3, 2.5, e);
  hemi.color.set('#f3e8d2').lerp(C('#bfa580'), S.haze).lerp(C('#524438'), sstep(2.6, 3.6, e));
  hemi.groundColor.set('#cca77c').lerp(C('#5e4d3e'), nightK);
  scene.fog.color.copy(VES.sky.material.uniforms.uLow.value); scene.fog.near = mix(240, 14, ashK); scene.fog.far = mix(1400, 120, ashK);
  fallU.uT.value = time; fallU.uAmt.value = sstep(1.65, 2.95, e); fallU.uDark.value = nightK; fallU.uCam.value.copy(camera.position);
  const depth = 0.22 * sstep(2.0, 3.6, e); blanket.visible = depth > 0.004; blanket.position.y = depth * 0.5 + 0.012; blanketM.opacity = Math.min(1, depth / 0.05); blanketM.depthWrite = blanketM.opacity > 0.98; M.tile.color.set('#ffffff').lerp(C('#cec5b6'), sstep(2.0, 3.2, e));
  lamp.intensity = 42 * sstep(2.3, 3.3, e); lamp.position.set(me.x, me.y + 1.9, me.z);
  FX.uniforms.uAsh.value = ashK; FX.uniforms.uNight.value = nightK; FX.uniforms.uWet.value = G.wet;
  FX.uniforms.uFrame.value = (state === 'way' && wpT > (wp ? wp.tMelt - 0.4 : 99)) || state === 'done' ? 0 : 1;
  if (S.struck) { S.struck = false; if (e > 1.6 && Math.random() < 0.55) boom(0.22); }
  quake = Math.max(0, quake - dt * 0.9); audSet(sstep(0.02, 1, e) * (0.5 + 0.5 * sstep(1, 3, e)) + quake * 0.6, fallU.uAmt.value);

  if (state === 'title') { meG.visible = false; const p = at(10); camera.position.set(p.x + 14, h0(p.x, p.z) + 9, p.z + 16); camera.lookAt(p.x - 40, h0(p.x, p.z) + 8, p.z - 50); camera.fov = 55; aimSun(p.x, 0, p.z); }
  else {
    meG.visible = state !== 'intro' && !(state === 'way' && wp.hideMe);
    let turn = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('KeyQ') ? 1 : 0) + stick.dx;
    let go = (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('KeyZ') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 0.5 : 0) - stick.dy;
    turn = clamp(turn, -1, 1); go = clamp(go, -0.5, 1); if (state !== 'play') { turn = 0; go = 0; }
    me.yaw += turn * 2.4 * dt * (me.air ? 0.6 : 1); const fx = Math.sin(me.yaw), fz = -Math.cos(me.yaw);
    const top = 8.8 * (1 - 0.16 * sstep(0.05, 0.22, depth));
    me.speed += (go * top - me.speed) * Math.min(1, dt * (me.air ? 0.8 : 3.8));
    let nx = me.x + fx * me.speed * dt, nz = me.z + fz * me.speed * dt;
    if (blocked(nx, nz)) { const mx = nx - me.x, mz = nz - me.z; let ok = false;
      for (const a of [0.45, -0.45, 0.9, -0.9, 1.3, -1.3, 1.52, -1.52]) { const cs = Math.cos(a), sn = Math.sin(a), k = Math.max(0.3, cs), tx = me.x + (mx * cs - mz * sn) * k, tz = me.z + (mx * sn + mz * cs) * k; if (!blocked(tx, tz)) { nx = tx; nz = tz; ok = true; break; } }
      if (!ok) { nx = me.x; nz = me.z; me.speed *= 0.5; } }
    for (const o of TOWN.solids) { const d = Math.hypot(nx - o.x, nz - o.z); if (d < o.r && d > 0.001) { const px = o.x + (nx - o.x) / d * o.r, pz = o.z + (nz - o.z) / d * o.r; if (!TOWN.wall(px, pz)) { nx = px; nz = pz; } } }
    const f = hAt(nx, nz) + (kind(nx, nz) === 2 ? depth : depth * 0.5); me.x = nx; me.z = nz; const jump = (keys.has('Space') || held.jump) && state === 'play';
    if (jump && !me.air) { me.vy = 5.8 + Math.abs(me.speed) * 0.2; me.air = true; SND.whoosh(0.04); }
    if (me.air) { me.vy -= (jump && me.vy < 0 ? 6 : 15) * dt; me.y += me.vy * dt; if (me.y <= f) { me.y = f; me.air = false; SND.puff(0.06); } } else me.y += (f - me.y) * Math.min(1, dt * 16);
    const pace = Math.abs(me.speed) / 5.5, before = Math.floor(me.ph / Math.PI); me.ph += dt * (2 + Math.abs(me.speed) * 1.05); if (!me.air && pace > 0.2 && Math.floor(me.ph / Math.PI) !== before) SND.puff(0.02 + 0.03 * sstep(0.02, 0.2, depth));
    me.lean += (turn * 0.2 * Math.min(1, pace) - me.lean) * Math.min(1, dt * 6);
    if (state === 'play' || state === 'look') { meG.position.set(me.x, me.y, me.z); meG.rotation.y = Math.PI - me.yaw; meG.rotation.z = -me.lean; FIG.pose(meG, me.ph, me.air ? 0.4 : pace, me.air, 0.06 * Math.min(1, pace)); arms(meG, 'L', -52, 8, -62); arms(meG, 'R', -52, -8, -62); }
    if (SC.update(dt, me, state === 'play', time)) me.speed *= 0.3;
    const prog = nearest(me.x, me.z); if (state === 'play') progS = prog.s; const alt = me.y - f;

    /* ---- the plaster dries while she runs ---- */
    if (state === 'play') { G.wet = Math.max(0, G.wet - dt / W.dryTime); }
    { const el = $('wet'), showW = state === 'play' || state === 'look'; el.style.display = showW ? 'flex' : 'none'; if (showW) { el.querySelector('b').style.width = (G.wet * 100).toFixed(1) + '%'; const wd = G.wet > 0.66 ? 'wet' : G.wet > 0.33 ? 'firming' : G.wet > 0 ? 'nearly dry' : 'dry'; if ($('wetW').textContent !== wd) $('wetW').textContent = wd; el.classList.toggle('dry', G.wet <= 0); } }

    /* ---- the colour pickups (blue at Attii, black at Asellina; generous 4.4 m radius so nobody misses them) ---- */
    if (state === 'play' && E.on) for (const p of PICKS) if (!G.got.has(p.id)) { const m = HOUSE.pickAt[p.id]; if (Math.hypot(m.x - me.x, m.z - me.z) < 4.4) { G.got.add(p.id); syncPips(); SC.keep(p.id, { title: p.title, emoji: p.emoji }); SC.gain(40, `${p.title} (${G.got.size} of 3)`, 2); PROPS.setTray(tray, [...G.got]); HOUSE.took(p.id); say(m.g, p.line, 4.8); SND.bell(6, 0.07); } }

    /* ---- the three stagings (Neo -> Dog -> Painters' Room) ---- */
    const next = STAGES[G.stage];
    if (next && state === 'play' && next.ready(progS, me, E)) { state = 'way'; wp = next; wpT = 0; me.speed = 0; $('melt').src = wp.img; bubble.classList.remove('show'); $('warn').classList.remove('show'); $('plate').classList.remove('show'); E.liveT = 0; SND.whoosh(0.07); wp.enter(me); }
    if (state === 'way') { wpT += dt; if (window.__road.holdStage) wpT = Math.min(wpT, wp.holdAt); wp.update(wpT, dt, me);
      if (wpT > wp.tPlate && !wp.plated) { wp.plated = true; SC.award(wp.title, null, wp.title); plate(wp.title, wp.line, wp.quote); }
      if (wp.stones) wp.stones(wpT); else if (wpT > wp.tMelt && wpT < wp.tEnd - 1.4) { $('melt').classList.add('show'); document.body.classList.add('melting'); }
      if (wpT > wp.tEnd - 1.4) { $('melt').classList.remove('show', 'stones'); $('melt').style.opacity = ''; $('tess').style.display = 'none'; document.body.classList.remove('melting'); $('plate').classList.remove('show'); }
      if (wpT > wp.tEnd) { wp.exit(me); G.stage++; const was = wp; wp = null; state = 'play';
        if (was.key === 'neo') { G.got.add('red'); syncPips(); SC.keep('red', { title: 'Red: cinnabar, paid for by the owner', emoji: '🔴' }); SC.gain(40, 'Red: cinnabar (1 of 3)', 2); PROPS.setTray(tray, [...G.got]); progS = S_NEO + 1.5; const p = at(S_NEO + 3.5); me.yaw = Math.atan2(p.dx, -p.dz); E.on = true; E.e = 0.01; quake = 1.5; boom(0.55); LIFE.flee(); look = W.beats[0]; lookT = 0; state = 'look'; E.beats = 1; }
        if (was.key === 'wall') { state = 'done'; $('goal').style.display = 'none'; $('wet').style.display = 'none'; SC.finish(); $('end').classList.remove('hidden'); } } }

    /* ---- Pliny eruption beats: Beat 0 frames Vesuvius's pine cloud; Beats 1-3 show live while running home ---- */
    if (state === 'play' && E.on && E.beats < W.beats.length && e > W.beats[E.beats].e) {
      const b = W.beats[E.beats++]; quake = Math.max(quake, 0.65); boom(0.24);
      if (b.live) { plate(b.title, b.line, b.quote); E.liveT = time + b.secs; }
      else { look = b; lookT = 0; state = 'look'; me.speed = 0; }
    }
    if (state === 'play' && E.liveT > 0 && time > E.liveT) { E.liveT = 0; $('plate').classList.remove('show'); }
    if (state === 'look') { lookT += dt; if (window.__road.holdLook) lookT = Math.min(lookT, 2.5); if (lookT > 0.6 && lookT < 0.7 + dt) plate(look.title, look.line, look.quote); if (lookT > look.secs) { $('plate').classList.remove('show'); state = 'play'; look = null; const p = at(S_NEO + 3.5); me.yaw = Math.atan2(p.dx, -p.dz); camera.position.set(me.x - p.dx * 5.2, me.y + 2.5, me.z - p.dz * 5.2); } }

    LIFE.update(dt, { me, state, progS, e, depth, time, alt, say, warn, SC, G, E, sBlue, sBlack, sDog, cushion });
    HOUSE.update(dt, { time, state, progS, e, E, G, me, say, depth, intro: introT, quake: v => { quake = Math.max(quake, v); boom(0.65); }, paid: (n, of) => { if (n) SC.gain(60 * n, n === 1 ? 'One colour, on wet plaster' : n + ' colours, on wet plaster', 2); else if (of) warn('The plaster had dried', 3); } });

    /* ---- camera ---- */
    if (state === 'intro') { introT += dt; const c = HOUSE.introCam(introT); camTo(c.pos, c.look, c.fov, c.cut ? 1 : Math.min(1, dt * 2.2)); aimSun(c.look.x, c.look.y, c.look.z); const L = W.intro.find(l => introT > l.t && !l.done); if (L) { L.done = true; say(HOUSE.speaker(L.who), L.text, L.secs); } if (introT > W.introSecs) { for (const l of W.intro) l.done = false; startPlay(); } }
    else if (state === 'way') { const c = wp.cam(wpT); camTo(c.pos, c.look, c.fov, Math.min(1, dt * (c.k || 2.2)), c.near || 0.2); aimSun(c.look.x, c.look.y, c.look.z); }
    else if (state === 'done') { /* camera holds on Room u */ }
    else if (state === 'look') { const d = VES.dir, k = Math.min(1, dt * 2.0); camTo(new V3(me.x - d.x * 5.5, me.y + 2.4, me.z - d.z * 5.5), new V3(me.x + d.x * 60, me.y + 2.4 + (look.tilt || 24), me.z + d.z * 60), look.fov || 70, k); aimSun(me.x, me.y, me.z); }
    else { let dist = 5.0 + Math.abs(me.speed) * 0.14 + Math.max(0, alt) * 0.45, cx, cz; for (let k = 0; k < 5; k++) { cx = me.x - fx * dist; cz = me.z - fz * dist; if (!TOWN.wall(cx, cz)) break; dist *= 0.64; }
      const k = Math.min(1, dt * 5.5), cyT = me.y + 2.45 + Math.max(0, alt) * 0.25; camera.position.x += (cx - camera.position.x) * k; camera.position.z += (cz - camera.position.z) * k; camera.position.y += (cyT - camera.position.y) * k;
      camT.set(me.x + fx * 6, me.y + 1.85, me.z + fz * 6); camera.lookAt(camT); camera.rotation.z += -me.lean * 0.25; camera.fov += (60 + Math.abs(me.speed) * 1.1 - camera.fov) * k; camNear = 0.2; aimSun(me.x + fx * 12, me.y, me.z + fz * 12); }
    if (quake > 0.01) { const a = quake * 0.09; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; camera.rotation.z += (Math.random() - 0.5) * a * 0.12; }
  }
  if (time > warnT) $('warn').classList.remove('show');
  if (bubbleG) { if (time > bubbleT) { bubble.classList.remove('show'); bubbleG = null; } else { const v = new V3(); bubbleG.getWorldPosition(v); v.y += 2.2; v.project(camera); const vis = v.z < 1 && Math.abs(v.x) < 0.95 && v.y < 0.9; bubble.style.left = vis ? clamp((v.x * 0.5 + 0.5) * innerWidth, 150, innerWidth - 150) + 'px' : innerWidth / 2 + 'px'; bubble.style.top = vis ? Math.max(96, (-v.y * 0.5 + 0.5) * innerHeight) + 'px' : innerHeight * 0.24 + 'px'; bubble.classList.add('show'); } }
  { const g = goal(), el = $('goal'); el.style.display = g ? 'block' : 'none'; if (g && el.textContent !== '➜ ' + g) el.textContent = '➜ ' + g; }
  const tgt = state === 'play' ? nextTarget().p : pHome; guide.update(me, { x: tgt.x, z: tgt.z }, state === 'play');
  SND.update(0.3 + 0.4 * Math.min(1, Math.abs(me.speed) / 9), clamp((me.air ? 0.2 : 0) + sstep(1, 3, E.e) * 0.5, 0, 1));
}
function draw() {
  const w = innerWidth, h = innerHeight, rw = Math.max(4, Math.round(w * PR)), rh = Math.max(4, Math.round(h * PR));
  if (renderer.domElement.width !== rw || renderer.domElement.height !== rh) { renderer.setSize(w, h, false); rt.setSize(rw, rh); camera.aspect = w / h; }
  if (camHold) camHold();
  renderer.setRenderTarget(rt);
  renderer.clear(); camera.near = 80; camera.far = 250000; camera.updateProjectionMatrix(); renderer.render(VES.far, camera);
  renderer.clearDepth(); camera.near = camNear; camera.far = 1300; camera.updateProjectionMatrix(); renderer.render(scene, camera);
  FX.setSize(rw, rh, camera);
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
}
let camHold = null, last = 0;
function loop(ms) { const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms; update(dt); draw(); requestAnimationFrame(loop); }
reset(); requestAnimationFrame(loop);

/* ================= input (keys + touch for iPad mini) ================= */
addEventListener('keydown', ev => { if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(ev.code)) ev.preventDefault(); keys.add(ev.code); if (ev.code === 'Enter' && (state === 'title' || state === 'done')) begin(); else if ((ev.code === 'Enter' || ev.code === 'Space') && state === 'intro' && introT > 0.8) introT = W.introSecs; });
addEventListener('keyup', ev => keys.delete(ev.code)); addEventListener('blur', () => { keys.clear(); stick.id = null; stick.dx = stick.dy = 0; held.jump = false; });
const cv = $('cv'), sk = $('stick');
cv.addEventListener('pointerdown', ev => { if (state !== 'play') return; if (stick.id !== null) { held.jump = true; held.id = ev.pointerId; return; } stick.id = ev.pointerId; stick.x0 = ev.clientX; stick.y0 = ev.clientY; stick.dx = stick.dy = 0; try { cv.setPointerCapture(ev.pointerId); } catch (_) { /* older Safari */ } sk.style.display = 'block'; sk.style.left = ev.clientX + 'px'; sk.style.top = ev.clientY + 'px'; sk.firstElementChild.style.transform = ''; });
cv.addEventListener('pointermove', ev => { if (ev.pointerId !== stick.id) return; let dx = (ev.clientX - stick.x0) / 48, dy = (ev.clientY - stick.y0) / 48; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.dx = dx; stick.dy = dy; sk.firstElementChild.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; });
const lift = ev => { if (ev.pointerId === stick.id) { stick.id = null; stick.dx = stick.dy = 0; sk.style.display = 'none'; } if (ev.pointerId === held.id) held.jump = false; };
cv.addEventListener('pointerup', lift); cv.addEventListener('pointercancel', lift);
$('bMute').addEventListener('click', () => { muted = !muted; AUD.muted = muted; $('waves').style.display = muted ? 'none' : ''; SND.setMuted(muted); });
$('skip').addEventListener('click', () => { if (state === 'intro') introT = W.introSecs; });
$('start').addEventListener('click', begin); $('again').addEventListener('click', begin); document.addEventListener('gesturestart', ev => ev.preventDefault());
window.__road = { get state() { return state; }, me, begin, freeze(f) { camHold = f; }, hAt, kind, world: { found: new Set() }, E, G, RT, VES, TOWN, LIFE, HOUSE, STAGES, PICKS, LEN, S_NEO, S_CROSS, S_FAR: S_NEO, sBlue, sBlack, sDog, holdStage: false, holdLook: false,
  go(s, lat = 0) { const p = at(s), [x, z] = side(p, 0, lat); me.x = x; me.z = z; me.speed = 0; progS = s; me.y = hAt(x, z); me.yaw = Math.atan2(p.dx, -p.dz); meG.position.set(x, me.y, z); }, face(a) { me.yaw = a; }, setE(v, hold) { E.on = v > 0; E.e = v; E.hold = hold ? v : null; }, skipIntro() { introT = W.introSecs; }, stage(i) { G.stage = i; },
  route: s => at(s), get wpT() { return wpT; }, get time() { return time; }, get progS() { return progS; }, get introT() { return introT; }, dbg: { camera, meG, THREE, scene, sun, hemi, blocked, nearest, lamp, MESH, FX },
  probe: (x, z) => ({ kind: kind(x, z), wall: TOWN.wall(x, z), blocked: blocked(x, z), y: +hAt(x, z).toFixed(2), d: +nearest(x, z).d.toFixed(1), s: +nearest(x, z).s.toFixed(0) }) };
