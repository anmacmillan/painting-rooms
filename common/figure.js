// Figures modelled and skinned in Blender (tools/blender/figure.py), moved here by turning their bones.
// One body each: a gathered dress or coat, sleeves, hair or a cloth on its own bone, a painted face. One walk serves every pace.
// Turns are given about the figure's own axes (x across, y front to back, z up) and carried into each bone's frame:
// a positive x turn tips an upright bone (spine, head) forward and swings a hanging one (arm, leg, hair) back.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';

export function makeFigures({ THREE, scene, shadowM, castShadow = false }) {
  const V3 = THREE.Vector3, Q = THREE.Quaternion, D2R = Math.PI / 180, loader = new GLTFLoader(), templates = {};
  const AX = [new V3(1, 0, 0), new V3(0, 0, -1), new V3(0, 1, 0)], qT = [new Q(), new Q(), new Q()];
  async function load(dir, names) { for (const n of names) templates[n] = (await loader.loadAsync(dir + n + '.glb')).scene; }
  function turn(u, n, x, y, z) {
    const r = u.rest[n]; if (!r) return;
    qT[2].setFromAxisAngle(AX[2], z * D2R).multiply(qT[1].setFromAxisAngle(AX[1], y * D2R)).multiply(qT[0].setFromAxisAngle(AX[0], x * D2R));
    u.B[n].quaternion.copy(r.l).multiply(r.wi).multiply(qT[2]).multiply(r.w);
  }
  // o: size, tint (a colour multiplied into the clothes), hose (leg colour), glow (lift the face a little in shade), adult (a calmer, upright walk)
  function spawn(name, o = {}) {
    const model = cloneSkinned(templates[name]), g = new THREE.Group(), rig = new THREE.Group(); g.add(rig); rig.add(model);
    const B = {}, mats = {};
    model.traverse(m => {
      if (m.isBone) B[m.name.replace(/[._]/g, '')] = m;
      if (m.isMesh) { const t = m.material, k = t.name; m.material = mats[k] || (mats[k] = new THREE.MeshLambertMaterial({ map: t.map || null, color: t.map ? 0xffffff : t.color })); m.frustumCulled = false; m.castShadow = castShadow; }
    });
    if (o.tint && mats.dress) mats.dress.color.set(o.tint).lerp(new THREE.Color(0xffffff), 0.45);
    if (o.hose && mats.hose) mats.hose.color.set(o.hose);
    if (o.glow && mats.face) { mats.face.emissive = new THREE.Color(0xffffff); mats.face.emissiveMap = mats.face.map; mats.face.emissiveIntensity = o.glow; }
    model.updateMatrixWorld(true); const rest = {}; for (const n in B) { const w = B[n].getWorldQuaternion(new Q()); rest[n] = { l: B[n].quaternion.clone(), w, wi: w.clone().invert() }; }
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.4, 14), shadowM); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.03; g.add(sh);
    const u = g.userData = { rig, B, rest, sh, mats, glb: true, adult: !!o.adult, hx: 0, hy: 0, arm: { L: null, R: null }, base: { hx: 0 } };
    // the old jointed figures exposed a head and two arms that the games turn directly; these stand in for them
    const head = () => turn(u, 'head', u.base.hx + u.hx / D2R, 0, u.hy / D2R);
    u.hd = { rotation: { get x() { return u.hx; }, set x(v) { u.hx = v; head(); }, get y() { return u.hy; }, set y(v) { u.hy = v; head(); } },
      getWorldPosition(v) { B.head.getWorldPosition(v); v.y += 0.15 * g.scale.y; return v; } };
    const armProxy = (S, sg) => { const a = { x: 0, z: 0 }, set = () => { u.arm[S] = a; turn(u, 'upperarm' + S, a.x / D2R, a.z / D2R, 0); turn(u, 'forearm' + S, -14, 0, 0); };
      return { rotation: { get x() { return a.x; }, set x(v) { a.x = v; set(); }, get z() { return a.z; }, set z(v) { a.z = v; set(); } },
        add(obj) { const b = B['forearm' + S], h = new THREE.Group(); h.position.set(0, 0.22, 0); h.rotation.z = Math.PI; b.add(h); obj.position.set(0, -0.02, 0.05); h.add(obj); } }; };
    u.aL = armProxy('L', -1); u.aR = armProxy('R', 1);      // the games' convention: on the right arm a positive z lifts it out sideways
    u.body = { scale: { set() {} } };
    g.scale.setScalar(o.size || 1); scene.add(g); return g;
  }
  // something small fixed to the head (a pearl at the ear): x, y, z in the standing figure's own space, before scaling
  function onHead(g, obj, x, y, z) { const b = g.userData.B.head; g.updateMatrixWorld(true); const p = new V3(x, y, z).applyMatrix4(g.matrixWorld); b.worldToLocal(p); obj.position.copy(p); b.add(obj); return obj; }
  function pose(g, ph, pace, air, lean) {
    const u = g.userData, s = Math.sin(ph), c = Math.cos(ph), k = Math.min(1.25, pace), a = air ? 1 : 0, ad = u.adult, run = ad ? 0.55 : 1;
    u.rig.position.y = Math.abs(c) * 0.03 * k; u.rig.rotation.z = s * 0.025 * k; u.rig.rotation.x = (lean || 0) + (ad ? 0.03 : 0.13) * Math.min(1, pace); u.sh.visible = !air;
    turn(u, 'hips', 2 * k * run, 2.5 * s * k, 5 * s * k); turn(u, 'spine', 7 * k * run, -2 * s * k, -9 * s * k * run);
    u.base.hx = -5 * k * run + 6 * a; turn(u, 'head', u.base.hx + u.hx / D2R, 0, 4 * s * k * run + u.hy / D2R);
    turn(u, 'hair', 3 + (ad ? 10 : 26) * Math.min(1.3, pace) + 7 * Math.sin(2 * ph + 0.8) * k + 22 * a, 5 * Math.sin(ph + 0.5) * k, 0);
    for (const [S, p, sg] of [['L', ph, 1], ['R', ph + Math.PI, -1]]) {
      const sp = Math.sin(p);
      turn(u, 'thigh' + S, (-4 - (ad ? 20 : 30) * sp) * k + a * (sg > 0 ? -38 : 12), 0, 0);
      turn(u, 'shin' + S, (8 + (ad ? 30 : 54) * Math.pow(0.5 + 0.5 * Math.cos(p - 0.35), 1.6)) * k + a * (sg > 0 ? 55 : 20), 0, 0);
      turn(u, 'upperarm' + S, ((ad ? 20 : 34) * sp + 4) * k * (1 - a) - a * (sg > 0 ? 48 : -30), -sg * (5 + 20 * a), 0);
      turn(u, 'forearm' + S, (-(ad ? 14 : 38) - (ad ? 10 : 22) * (0.5 - 0.5 * sp)) * k * (1 - a) - 6 - 42 * a, 0, 0);
    }
    u.arm.L = u.arm.R = null;      // an arm the game has taken over (waving, pouring) is set again by the game after this
  }
  return { load, spawn, pose, turn, onHead };
}
