/* World builders for La Grenouillère (Croissy, 1869):
   river channel, lush painted banks, Impressionist brushstroke-tuft trees & overhanging willows,
   solid-floor skiffs, La Grenouillère islet/gangplanks/café, river traffic, and sun-glints. */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTex, strokes, rnd, clamp, sstep, mix } from '../common/world.js';

export const V3 = THREE.Vector3;
export const WY = 0, HW = 34, ZP = -376, BANKY = 1.0, ISY = 0.55, DECKY = 1.9;
export const cx = z => 16 * Math.sin((z + 8) / 84) * sstep(ZP + 52, ZP + 112, z);
export const cxSlope = z => (cx(z - 1) - cx(z + 1)) * 0.5; /* dx/dz pointing downstream */
/* narrows gently to 22m through the willow reach, widening back to 34m at Chatou and La Grenouillère */
export const hw = z => HW - 11.5 * sstep(-18, -68, z) * sstep(ZP + 48, ZP + 108, z);
export const bankR = z => cx(z) + hw(z);
export const bankL = z => cx(z) - hw(z);
export const ISL = { x: 13, z: ZP + 1.7, r: 4.0 };
export const IP = (u, v) => [ISL.x - v, ISL.z - u];
export const BARGE = { x0: 13, x1: 21.5, z0: ZP - 4.3, z1: ZP - 28 };
export const PL_A = [34.7, ZP + 15], PL_B = IP(-3.6, -1.1), PR_A = IP(3.6, 1.4), PR_B = [13.75, BARGE.z0 - 0.7], GW_A = [18.6, ZP - 15], GW_B = [34.7, ZP - 15];
export const START = { x: 20, z: -8 };
export const ARRIVE_Z = ZP + 19; /* where the skiff glides beside the café & Camembert */

export const lam = o => new THREE.MeshLambertMaterial(o);
export const bx = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
export const cyl = (r0, r1, h, seg, x, y, z, axis) => {
  const g = new THREE.CylinderGeometry(r0, r1, h, seg);
  if (axis === 'z') g.rotateX(Math.PI / 2); else if (axis === 'x') g.rotateZ(Math.PI / 2);
  return g.translate(x, y, z);
};
export const merged = (geos, mat) => new THREE.Mesh(mergeGeometries(geos.map(g => g.index ? g.toNonIndexed() : g)), mat);
export const beam = (a, b, w, h) => {
  const d = new V3().subVectors(b, a), g = new THREE.BoxGeometry(w, h, d.length());
  g.lookAt(d.normalize()); return g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
};
export const pick = a => a[Math.floor(Math.random() * a.length)];

/* bold unmixed flat-brush touch textures */
export const daub = (base, cols, n = 180, wid = 10, size = 256) => canvasTex(size, size, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); strokes(g, w, h, cols, n, wid, 8);
}, true);

export const touchTex = (base, cols, n, len, wid, size = 512) => canvasTex(size, size, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    g.fillStyle = cols[i % cols.length]; g.globalAlpha = rnd(0.72, 1.0);
    const x = rnd(0, w), y = rnd(0, h), a = rnd(-0.55, 0.55), l = rnd(len * 0.55, len * 1.45), bw = rnd(wid * 0.65, wid * 1.35);
    for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
      g.save(); g.translate(x + ox, y + oy); g.rotate(a); g.fillRect(-l / 2, -bw / 2, l, bw); g.restore();
    }
  }
  g.globalAlpha = 1;
}, true);

/* alpha-tested Impressionist foliage tuft texture: crisp separate brushstrokes with sky gaps */
export function makeFoliageTex(pal, size = 256) {
  return canvasTex(size, size, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 165; i++) {
      const ang = rnd(0, 6.283), rad = Math.pow(Math.random(), 0.68) * w * 0.42;
      const x = w * 0.5 + Math.cos(ang) * rad, y = h * 0.5 + Math.sin(ang) * rad * 0.92;
      const l = rnd(14, 34), bw = rnd(7, 16), rot = rnd(-0.85, 0.85);
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = pal[i % pal.length]; g.globalAlpha = rnd(0.85, 1.0);
      g.fillRect(-l / 2, -bw / 2, l, bw);
      g.restore();
    }
    g.globalAlpha = 1;
  }, false);
}

/* cascading weeping-willow curtain texture: hanging vertical-diagonal paint dabs */
export function makeWillowTex(size = 256) {
  const cols = ['#c8cc5a', '#a8bc4e', '#e0d872', '#6a8a44', '#405e3a', '#8aa64a', '#2e4a34', '#d6d468'];
  return canvasTex(size, size * 2, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let s = 0; s < 14; s++) {
      const sx = w * (0.08 + 0.84 * (s / 13)) + rnd(-6, 6);
      const len = h * rnd(0.62, 0.96);
      for (let y = 10; y < len; y += rnd(9, 16)) {
        const sway = Math.sin(y * 0.022 + s) * 7;
        g.save(); g.translate(sx + sway, y); g.rotate(rnd(-0.22, 0.22));
        g.fillStyle = cols[(s * 3 + Math.floor(y / 14)) % cols.length];
        g.fillRect(-rnd(4, 8), -rnd(8, 16), rnd(8, 15), rnd(16, 30));
        g.restore();
      }
    }
  }, false);
}

export const greyTex = touchTex('#c8c8c4', ['#f0eee6', '#9e9f9a', '#dad8cf', '#828680', '#f8f6ec', '#b4b6b0'], 520, 26, 10);
export const woodT = touchTex('#b6844c', ['#cc9c5e', '#9a6a38', '#deb472', '#7e522a', '#c29054'], 260, 32, 9, 256);
export const plankT = touchTex('#8e785a', ['#a89270', '#746046', '#bca684', '#5c4a36', '#988264'], 240, 34, 9, 256);

/* 3D crossed-card Impressionist foliage tuft geometry (no smooth lollipop spheres!) */
export function makeTuftGeo() {
  const gs = [];
  for (let i = 0; i < 3; i++) {
    const p = new THREE.PlaneGeometry(2.2, 2.0);
    p.rotateY(i * Math.PI / 3);
    p.rotateX(rnd(-0.24, 0.24));
    gs.push(p);
  }
  const top = new THREE.PlaneGeometry(2.1, 2.1);
  top.rotateX(-Math.PI / 2 + 0.2); top.translate(0, 0.25, 0);
  gs.push(top);
  return mergeGeometries(gs.map(g => g.toNonIndexed()));
}

/* ================= solid-floor skiffs & sailboats ================= */
function hullGeo(L, B, D) {
  const N = 16, M = 8, pos = [], idx = [], gun = [[], []];
  for (let i = 0; i <= N; i++) {
    const t = i / N * 2 - 1, z = t * L / 2;
    const b = B * (t < 0 ? Math.pow(1 - Math.pow(-t, 2.2), 0.6) : Math.pow(1 - Math.pow(t, 3.4), 0.55)) + 0.014;
    const gy = D + (t < 0 ? 0.16 : 0.08) * t * t, ky = 0.06 + 0.09 * Math.pow(Math.abs(t), 3);
    for (let j = 0; j <= M; j++) {
      const a = j / M * Math.PI;
      pos.push(-b * Math.cos(a), gy - (gy - ky) * Math.pow(Math.sin(a), 0.72), z);
    }
    gun[0].push(new V3(-b, gy, z)); gun[1].push(new V3(b, gy, z));
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * (M + 1) + j, b = a + 1, c = a + M + 1, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return { g, gun };
}
const HULL = hullGeo(4.5, 0.66, 0.46);
const gunGeo = mergeGeometries(HULL.gun.map(l => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(l), 26, 0.032, 5)));
/* solid watertight bilge pan sitting cleanly above waterline, plus 5 slatted cedar duckboards, ribs & 3 thwarts */
function makeBilgeGeo() {
  const sh = new THREE.Shape();
  for (let i = 0; i <= 24; i++) {
    const t = i / 24 * 2 - 1, z = t * 2.16;
    const b = 0.635 * (t < 0 ? Math.pow(1 - Math.pow(-t, 2.2), 0.6) : Math.pow(1 - Math.pow(t, 3.4), 0.55));
    if (i === 0) sh.moveTo(b, z); else sh.lineTo(b, z);
  }
  for (let i = 24; i >= 0; i--) {
    const t = i / 24 * 2 - 1, z = t * 2.16;
    const b = 0.635 * (t < 0 ? Math.pow(1 - Math.pow(-t, 2.2), 0.6) : Math.pow(1 - Math.pow(t, 3.4), 0.55));
    sh.lineTo(-b, z);
  }
  const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); g.translate(0, 0.165, 0); return g;
}
const bilgeGeo = makeBilgeGeo();
const slatParts = [];
for (const [sx, sl] of [[-0.34, 2.6], [-0.17, 3.2], [0, 3.55], [0.17, 3.2], [0.34, 2.6]]) {
  slatParts.push(bx(0.135, 0.03, sl, sx, 0.198, 0.04));
}
for (const rz of [-1.25, -0.55, 0.25, 0.95]) slatParts.push(bx(0.98, 0.036, 0.055, 0, 0.182, rz));
const deckGeo = mergeGeometries(slatParts.map(g => g.toNonIndexed()));
const thwartGeo = mergeGeometries([
  bx(1.2, 0.05, 0.26, 0, 0.36, 0.02),
  bx(1.0, 0.05, 0.24, 0, 0.36, -1.08),
  bx(0.98, 0.05, 0.42, 0, 0.36, 1.32)
].map(g => g.toNonIndexed()));
const oarGeo = sg => mergeGeometries([cyl(0.024, 0.02, 2.5, 6, sg * 0.65, 0, 0, 'x'), bx(0.6, 0.022, 0.15, sg * 2.1, 0, 0)].map(g => g.toNonIndexed()));
const OARG = { 1: oarGeo(1), '-1': oarGeo(-1) };
const oarM = lam({ color: '#d4bd90', map: greyTex });
const bilgeM = lam({ color: '#4c3a28', map: greyTex, side: THREE.DoubleSide });

export function makeBoat(o = {}) {
  const g = new THREE.Group();
  const inner = lam({ map: o.inside ? greyTex : woodT, color: o.inside || '#e2c496' });
  const floorM = lam({ map: woodT, color: o.floor || '#c89b62' });
  g.add(
    new THREE.Mesh(HULL.g, inner),
    new THREE.Mesh(HULL.g, lam({ color: o.hull || '#366448', map: greyTex, side: THREE.BackSide })),
    new THREE.Mesh(gunGeo, lam({ color: o.stripe || '#ce5d36' })),
    new THREE.Mesh(bilgeGeo, bilgeM),
    new THREE.Mesh(deckGeo, floorM),
    new THREE.Mesh(thwartGeo, inner)
  );
  const oars = [1, -1].map(sg => {
    const m = new THREE.Mesh(OARG[sg], oarM);
    m.position.set(sg * 0.65, 0.51, 0.36); m.rotation.order = 'YZX';
    m.visible = o.oars !== false; g.add(m); return m;
  });
  g.userData = { oars, draft: -0.072 };
  g.position.y = -0.072;
  return g;
}

export function setOars(b, a, dip, aL = a, dipL = dip) {
  const [R, Lf] = b.userData.oars;
  R.rotation.y = a; R.rotation.z = -dip; Lf.rotation.y = -aL; Lf.rotation.z = dipL;
}

export function makeSail() {
  const g = new THREE.Group(), h = makeBoat({ hull: '#f0e9d8', stripe: '#38342e', oars: false });
  h.scale.set(1.5, 1.4, 1.5); h.position.y = -0.15; g.add(h);
  g.add(merged([cyl(0.05, 0.07, 6.8, 6, 0, 3.7, -0.5), beam(new V3(0, 0.95, -0.5), new V3(0, 1.15, 2.7), 0.06, 0.06)], lam({ color: '#6a5236' })));
  const tri = (a, b, c) => {
    const t = new THREE.BufferGeometry();
    t.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
    t.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
    t.computeVertexNormals(); return t;
  };
  const sailT = touchTex('#fbf7ec', ['#ffffff', '#efe8d4', '#dfe7ee', '#f6efd8'], 180, 34, 14, 256);
  const sail = new THREE.Mesh(
    mergeGeometries([tri([0.06, 1.2, -0.42], [0.3, 1.25, 2.6], [0.06, 6.9, -0.42]), tri([0, 0.75, -3.1], [0.16, 1.0, -0.62], [0, 6.1, -0.56])]),
    new THREE.MeshLambertMaterial({ color: '#fffcf4', side: THREE.DoubleSide, emissive: '#58544c', map: sailT })
  );
  g.add(sail); return g;
}

/* ================= painted riverbanks, brushstroke-tuft woods & overhanging willows ================= */
export function buildBanksAndTrees(scene) {
  const bankTex = touchTex('#98ac4e', ['#cad05e', '#749240', '#dfcf6a', '#4a6a38', '#b2c254', '#e8df8a', '#3a5634', '#c0a862'], 920, 26, 11);
  /* undulating riverbanks with trodden earth at the landings */
  {
    const pos = [], col = [], uv = [], idx = [], c = new THREE.Color(), c2 = new THREE.Color();
    const SEC = [[-1.5, -1.5], [-0.3, -0.12], [0.3, 0.58], [1.4, BANKY], [8, BANKY + 0.28], [46, BANKY + 1.2], [320, BANKY + 5.2]], NS = SEC.length;
    const zs = []; for (let z = 120; z >= -860; z -= 5) zs.push(z);
    for (const side of [1, -1]) {
      const base = pos.length / 3;
      for (const z of zs) {
        const e = side > 0 ? bankR(z) : bankL(z);
        const undul = Math.sin(z * 0.055 + side) * 0.28 + Math.cos(z * 0.13) * 0.16;
        SEC.forEach(([d, y], k) => {
          const x = e + side * d;
          const yy = k >= 4 ? y + undul : y;
          pos.push(x, yy, z); uv.push(x / 8.5, z / 8.5);
          const worn = side > 0 && k >= 3 && k <= 4 && ((z < ZP + 36 && z > ZP - 30) || (z < 24 && z > -20)) ? 1 : 0;
          c.set('#ffffff')
            .lerp(c2.set('#4c6444'), k <= 2 ? 0.68 : 0)
            .lerp(c2.set('#e2cfa2'), worn * 0.72)
            .lerp(c2.set('#ecea9e'), k >= 5 ? 0.28 : 0);
          col.push(c.r, c.g, c.b);
        });
      }
      for (let j = 0; j < zs.length - 1; j++) for (let k = 0; k < NS - 1; k++) {
        const a = base + j * NS + k, b = a + 1, d = a + NS, e = d + 1;
        side > 0 ? idx.push(a, b, d, b, e, d) : idx.push(a, d, b, b, d, e);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, lam({ map: bankTex, vertexColors: true })));
  }

  /* Impressionist foliage tufts (alpha-tested brushstroke cards, never smooth lollipop spheres!) */
  const sunTex = makeFoliageTex(['#e0da74', '#cad058', '#b2be4e', '#eee48c', '#8ea648', '#d6c862', '#6c8840']);
  const shdTex = makeFoliageTex(['#2d4a3a', '#3d5e42', '#223a30', '#4f7246', '#6b8848', '#1d322a', '#8ea250']);
  const tuftGeo = makeTuftGeo();
  const sunM = new THREE.MeshLambertMaterial({ map: sunTex, alphaTest: 0.42, side: THREE.DoubleSide });
  const shdM = new THREE.MeshLambertMaterial({ map: shdTex, alphaTest: 0.42, side: THREE.DoubleSide });
  const tufts = { sun: [], shd: [] }, trunks = [], willowFronds = [], shades = [];
  const SUNLIT = ['#f6f2a6', '#e8e48c', '#dce07e', '#fff6b2', '#cdd674', '#e4d87c'];
  const MIDG = ['#b4cc6c', '#98b860', '#c8d676', '#84a658'];
  const SHADE = ['#5a7a5c', '#4a6a54', '#6c8a60', '#3d5a4a', '#7c9666'];

  const addTuft = (kind, x, y, z, sx, sy, sz, col) => tufts[kind].push({ x, y, z, sx, sy, sz, ry: rnd(0, 6.28), rx: rnd(-0.22, 0.22), col });

  function addTree(x, z, k, kind, pal, bucket = 'sun') {
    const y = BANKY;
    if (kind === 'poplar') {
      trunks.push({ x, y, z, r: 0.2 * k, h: 5.5 * k, leanX: 0, leanZ: 0 });
      for (const [dy, s, sy] of [[5.2, 1.5, 2.2], [8.0, 1.7, 2.8], [11.2, 1.4, 2.5], [13.8, 1.0, 2.0]]) {
        addTuft(bucket, x + rnd(-0.3, 0.3) * k, y + dy * k, z + rnd(-0.3, 0.3) * k, s * k, sy * k, s * k, pick(pal));
      }
    } else if (kind === 'willow') {
      trunks.push({ x, y, z, r: 0.34 * k, h: 3.8 * k, leanX: 0, leanZ: 0 });
      for (const [dx, dy, dz, s, sy] of [[0, 5.2, 0, 2.7, 2.0], [2.4, 4.1, 0.8, 2.2, 1.9], [-2.3, 4.2, -0.7, 2.2, 1.9], [0.5, 3.8, 2.3, 2.1, 1.8], [-0.4, 3.9, -2.2, 2.1, 1.8], [0, 7.0, 0, 2.1, 1.6]]) {
        addTuft(bucket, x + dx * k, y + dy * k, z + dz * k, s * k, sy * k, s * k, pick(pal));
      }
    } else {
      trunks.push({ x, y, z, r: 0.28 * k, h: 4.4 * k, leanX: 0, leanZ: 0 });
      for (const [dx, dy, dz, s] of [[0, 6.2, 0, 2.8], [2.0, 7.4, 1.0, 2.2], [-1.9, 5.8, -0.9, 2.3], [0.4, 8.8, -0.6, 2.0], [-0.5, 6.6, 2.1, 2.1]]) {
        addTuft(bucket, x + dx * k, y + dy * k, z + dz * k, s * k, s * k * 0.9, s * k, pick(pal));
      }
    }
  }

  /* overhanging weeping willows arching right over the river channel so fronds pass overhead */
  const boughGeos = [];
  const willowSpots = [
    [-44, 1, 17], [-74, -1, 18], [-104, 1, 19], [-136, -1, 18], [-168, 1, 20],
    [-198, -1, 19], [-228, 1, 18], [-258, -1, 19], [-288, 1, 17], [-318, -1, 16]
  ];
  for (const [wz, side, reach] of willowSpots) {
    const edge = side > 0 ? bankR(wz) : bankL(wz);
    const tx = edge + side * 2.0;
    const tipX = edge - side * reach;
    const p0 = new V3(tx, BANKY - 0.1, wz);
    const p1 = new V3(edge - side * 2.0, 5.4, wz + rnd(-1, 1));
    const p2 = new V3(tipX + side * 4.5, 7.2, wz + rnd(-1.5, 1.5));
    const p3 = new V3(tipX, 5.8, wz + rnd(-2, 2));
    boughGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2, p3]), 10, 0.3, 6, false));
    const p2b = new V3(tipX + side * 6.5, 8.4, wz - 3.2);
    const p3b = new V3(tipX + side * 2.2, 6.6, wz - 5.2);
    boughGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p1, p2b, p3b]), 8, 0.2, 5, false));
    for (let u = 0.15; u <= 1.0; u += 0.17) {
      const mx = mix(edge, tipX, u), my = 6.0 + Math.sin(u * Math.PI) * 2.4;
      addTuft(u > 0.65 ? 'shd' : 'sun', mx, my + 0.9, wz + rnd(-2.6, 2.6), rnd(2.4, 3.6), rnd(1.8, 2.5), rnd(2.4, 3.6), pick(u > 0.65 ? MIDG : SUNLIT));
    }
    /* lush cascading willow frond curtains hanging overhead (bottom edge stays >= 3.5m above water) */
    for (let k = 0; k < 9; k++) {
      const u = 0.16 + (k / 8) * 0.84;
      const fx = mix(edge - side * 0.8, tipX, u) + rnd(-1.3, 1.3);
      const fz = wz + rnd(-4.2, 3.8);
      const fh = rnd(2.8, 3.9);
      const topY = 6.8 + Math.sin(u * Math.PI) * 1.5;
      willowFronds.push({ x: fx, y: topY - fh * 0.5, z: fz, w: rnd(2.5, 3.6), h: fh, ry: rnd(-0.7, 0.7), ph: rnd(0, 6.28) });
    }
    shades.push(new THREE.Vector4(edge - side * (reach * 0.55), wz, reach * 0.65, 8.2));
  }
  while (shades.length < 14) shades.push(new THREE.Vector4(9999, 9999, 1, 1));
  scene.add(merged(boughGeos, lam({ color: '#584a3c', map: greyTex })));

  /* shimmering willow frond curtains (animated gently in update loop) */
  const willowM = new THREE.MeshLambertMaterial({ map: makeWillowTex(256), alphaTest: 0.36, side: THREE.DoubleSide });
  const frondMeshes = willowFronds.map(f => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), willowM);
    m.position.set(f.x, f.y, f.z); m.rotation.y = f.ry; m.userData = f; scene.add(m); return m;
  });

  /* bank woods: sunlit golden-chartreuse wall on far bank (Monet Met backdrop), lush right bank with openings at landings */
  for (let z = 95; z > -760; z -= 4.8) {
    const e = bankL(z), nearG = Math.abs(z - ZP) < 75;
    addTree(e - rnd(2.8, 7.5), z + rnd(-2, 2), rnd(0.88, 1.28), Math.random() < 0.45 ? 'willow' : 'round', Math.random() < 0.82 ? SUNLIT : MIDG, 'sun');
    addTree(e - rnd(10, 22), z + rnd(-2, 2), rnd(1.08, 1.58), Math.random() < 0.42 ? 'poplar' : 'round', SUNLIT, 'sun');
    if (Math.random() < 0.6) addTree(e - rnd(25, 52), z + rnd(-2, 2), rnd(1.3, 1.9), Math.random() < 0.5 ? 'poplar' : 'round', SUNLIT, 'sun');
    addTuft('sun', e - rnd(0.5, 2.6), BANKY + rnd(1.0, 2.2), z + rnd(-1.5, 1.5), rnd(2.5, 3.8), rnd(1.8, 2.8), rnd(2.5, 3.6), pick(Math.random() < 0.7 ? SUNLIT : MIDG));
    /* unbroken wall of sunlit chartreuse-ochre foliage opposite La Grenouillère, matching both paintings */
    if (nearG) {
      addTuft('sun', e - rnd(3.5, 9.0), BANKY + rnd(2.2, 4.4), z + rnd(-1.8, 1.8), rnd(3.4, 4.8), rnd(2.6, 3.8), rnd(3.4, 4.8), pick(SUNLIT));
      addTuft('sun', e - rnd(8.5, 16.0), BANKY + rnd(4.5, 7.8), z + rnd(-2.0, 2.0), rnd(3.8, 5.4), rnd(3.0, 4.5), rnd(3.8, 5.4), pick(SUNLIT));
    }

    const f = bankR(z), open = (z < 26 && z > -22) || (z < ZP + 36 && z > ZP - 34);
    if (!open && Math.random() < 0.88) addTree(f + rnd(2.8, 7.5), z + rnd(-2, 2), rnd(0.85, 1.25), Math.random() < 0.5 ? 'willow' : 'round', Math.random() < 0.55 ? SUNLIT : MIDG, 'sun');
    if (!open || Math.random() < 0.55) addTree(f + rnd(open ? 15 : 10, 28), z + rnd(-2, 2), rnd(1.0, 1.6), Math.random() < 0.35 ? 'poplar' : 'round', Math.random() < 0.65 ? SUNLIT : MIDG, 'sun');
  }

  /* hero trees of the two paintings: Camembert islet tree & left-hand overhanging bough by the painters */
  const [tx, tz] = IP(0.2, 0.35);
  trunks.push({ x: tx, y: ISY, z: tz, r: 0.21, h: 6.3, leanX: 0.05, leanZ: 0.03, hero: true });
  for (const [u, v, y, s, sy] of [
    [0.2, 0.3, 8.2, 2.8, 2.2], [-2.5, 0.7, 7.9, 2.5, 2.0], [2.6, 0.2, 8.4, 2.4, 1.9],
    [0.5, 2.4, 9.2, 2.6, 2.2], [-0.8, -2.0, 8.6, 2.3, 1.8], [-4.3, 0.0, 7.3, 1.8, 1.5],
    [4.4, 1.3, 9.0, 1.9, 1.6], [0.0, 0.6, 10.8, 2.5, 2.0], [-2.3, 0.4, 6.2, 1.4, 1.2],
    [-3.3, 1.0, 5.4, 1.1, 1.0], [-1.5, 1.2, 6.7, 1.2, 0.9], [1.6, 0.9, 6.8, 1.3, 0.9],
    [-2.9, 0.2, 4.6, 0.95, 0.85], [-2.0, 1.3, 5.2, 1.0, 0.85]
  ]) { const [x, z] = IP(u, v); addTuft('shd', x, y, z, s, sy, s, pick(SHADE)); }

  trunks.push({ x: 36.6, y: BANKY, z: ZP + 8.2, r: 0.42, h: 5.2, leanX: -0.1, leanZ: -0.04, hero: true });
  for (const [x, y, z, s, sy] of [
    [35.5, 7.2, ZP + 8.0, 3.0, 2.1], [32.4, 6.5, ZP + 6.4, 2.2, 1.6], [30.4, 5.8, ZP + 5.2, 1.7, 1.15],
    [33.0, 7.5, ZP + 2.6, 2.3, 1.5], [36.4, 8.1, ZP + 1.5, 2.7, 1.8], [36.8, 8.3, ZP - 4.5, 2.8, 1.8],
    [29.6, 5.3, ZP + 7.6, 1.4, 1.0], [31.6, 5.2, ZP + 9.2, 1.2, 0.9],
    [34.4, 2.4, ZP + 9.0, 1.7, 1.4], [35.4, 2.2, ZP + 6.2, 1.5, 1.2], [36.8, 2.3, ZP + 11.0, 1.8, 1.4]
  ]) addTuft('shd', x, y, z, s, sy, s, pick(SHADE));

  const D = new THREE.Object3D(), col = new THREE.Color();
  for (const [kind, mat] of [['sun', sunM], ['shd', shdM]]) {
    const arr = tufts[kind];
    const m = new THREE.InstancedMesh(tuftGeo, mat, arr.length);
    arr.forEach((f, i) => {
      D.position.set(f.x, f.y, f.z); D.scale.set(f.sx, f.sy, f.sz); D.rotation.set(f.rx, f.ry, 0);
      D.updateMatrix(); m.setMatrixAt(i, D.matrix); m.setColorAt(i, col.set(f.col).multiplyScalar(rnd(0.92, 1.1)));
    });
    m.frustumCulled = false; scene.add(m);
  }
  const tm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.7, 1.0, 1, 7).translate(0, 0.5, 0), lam({ map: greyTex }), trunks.length);
  trunks.forEach((t, i) => {
    D.position.set(t.x, t.y - 0.2, t.z); D.scale.set(t.r, t.h + 0.2, t.r); D.rotation.set(t.leanX || 0, 0, t.leanZ || 0);
    D.updateMatrix(); tm.setMatrixAt(i, D.matrix); tm.setColorAt(i, col.set(t.hero ? '#4c4942' : '#6c5a46'));
  });
  tm.frustumCulled = false; scene.add(tm);

  /* riverside rushes & bright Impressionist meadow wildflower dabs */
  const reed = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.7, 1.6).translate(0, 0.8, 0), lam({ map: sunTex, alphaTest: 0.42, side: THREE.DoubleSide }), 650);
  let rn = 0;
  for (let z = 80; z > -640 && rn < 650; z -= rnd(0.9, 3.0)) for (const side of [1, -1]) {
    if (side > 0 && ((z < 24 && z > -20) || (z < ZP + 38 && z > ZP - 34)) || rn >= 650 || Math.random() < 0.28) continue;
    const e = side > 0 ? bankR(z) : bankL(z);
    D.position.set(e - side * rnd(0.0, 1.2), -0.1, z); D.scale.set(rnd(0.7, 1.3), rnd(0.8, 1.7), 1);
    D.rotation.set(rnd(-0.1, 0.1), rnd(0, 3.14), rnd(-0.14, 0.14)); D.updateMatrix();
    reed.setMatrixAt(rn, D.matrix); reed.setColorAt(rn++, col.set(pick(['#a2b850', '#c4ca5e', '#7c9a44', '#d8d46e'])));
  }
  reed.count = rn; reed.frustumCulled = false; scene.add(reed);

  const flw = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.45, 0.35), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), 360);
  const fcols = ['#e65238', '#f6dc58', '#f8f5e6', '#5684cc', '#f09448', '#e8788a'];
  let fn = 0;
  for (let z = 40; z > ZP - 30 && fn < 360; z -= rnd(1.2, 3.2)) for (const side of [1, -1]) {
    if (fn >= 360 || Math.random() < 0.35) continue;
    const e = side > 0 ? bankR(z) : bankL(z);
    D.position.set(e + side * rnd(1.8, 8.5), BANKY + rnd(0.18, 0.48), z + rnd(-1, 1));
    D.scale.setScalar(rnd(0.7, 1.5)); D.rotation.set(rnd(-0.3, 0.3), rnd(0, 6.28), rnd(-0.3, 0.3));
    D.updateMatrix(); flw.setMatrixAt(fn, D.matrix); flw.setColorAt(fn++, col.set(pick(fcols)));
  }
  flw.count = fn; flw.frustumCulled = false; scene.add(flw);

  return { frondMeshes, shades };
}

/* ================= La Grenouillère & boat-hire landing ================= */
export function buildLandmarks(scene) {
  const gren = new THREE.Group(); scene.add(gren);
  const postM = lam({ color: '#4a4034', map: greyTex });
  const moored = [];

  /* Le Camembert: round timber-ringed islet, sandy earth top, green bench under the tree */
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(ISL.r, ISL.r, 0.12, 40),
    lam({ map: touchTex('#bba482', ['#d0b892', '#a48e6e', '#dec8a4', '#8e7a60', '#c4ae8c', '#ecdab8'], 420, 30, 12) })
  );
  top.position.set(ISL.x, ISY - 0.05, ISL.z); gren.add(top);

  const wallT = canvasTex(512, 64, (g, w, h) => {
    for (let x = 0; x < w; x += 16) {
      g.fillStyle = ['#5e4e3e', '#4c3e30', '#6c5a48', '#56483a'][(x / 16 * 7) % 4 | 0];
      g.fillRect(x, 0, 15, h); g.fillStyle = '#2a2420'; g.fillRect(x + 15, 0, 1, h);
    }
    g.globalAlpha = 0.3; strokes(g, w, h, ['#8a7a66', '#3a3028'], 30, 8, 3); g.globalAlpha = 1;
  }, true);
  wallT.repeat.set(5, 1);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(ISL.r + 0.05, ISL.r + 0.02, 1.5, 40, 1, true), lam({ map: wallT }));
  wall.position.set(ISL.x, ISY - 0.8, ISL.z); gren.add(wall);

  const [bx0, bz0] = IP(0.2, -0.5);
  const bench = merged([
    bx(0.42, 0.06, 2.6, 0, 0.45, 0),
    ...[-1.1, 0, 1.1].flatMap(z => [bx(0.06, 0.45, 0.06, -0.16, 0.225, z), bx(0.06, 0.45, 0.06, 0.16, 0.225, z)])
  ], lam({ color: '#3f7a4e', map: greyTex }));
  bench.position.set(bx0, ISY, bz0); gren.add(bench);

  /* narrow wooden gangplanks on trestles */
  const walk = (A, B, ya, yb, w, legs) => {
    const a = new V3(A[0], ya - 0.05, A[1]), b = new V3(B[0], yb - 0.05, B[1]);
    const gs = [beam(a, b, w, 0.09)], d = new V3().subVectors(b, a);
    const n = Math.max(1, Math.round(d.length() / legs)), side = new V3(-d.z, 0, d.x).normalize();
    for (let k = 0; k <= n; k++) {
      const p = a.clone().addScaledVector(d, k / n);
      for (const s of [-1, 1]) gs.push(cyl(0.05, 0.06, p.y + 1.4, 5, p.x + side.x * s * (w / 2 - 0.08), (p.y - 1.4) / 2, p.z + side.z * s * (w / 2 - 0.08)));
    }
    gren.add(merged(gs, lam({ map: plankT, color: '#b9aa94' })));
  };
  walk(PL_A, PL_B, BANKY, ISY, 1.15, 3.4);
  walk(PR_A, PR_B, ISY, DECKY, 1.0, 1.4);
  walk([BARGE.x1 - 0.2, GW_A[1]], GW_B, DECKY, BANKY, 1.2, 3.4);
  gren.add(merged([
    cyl(0.09, 0.1, 2.4, 6, PR_A[0] + 0.75, 0.4, PR_A[1] - 0.55),
    cyl(0.08, 0.09, 2.0, 6, PL_B[0] + 0.3, 0.2, PL_B[1] + 1.0)
  ], postM));

  /* floating café barge: dark hull, lettered pale timber wall, draped white cloth, scalloped roof */
  {
    const B = BARGE, L = B.z0 - B.z1, W = B.x1 - B.x0, zc = (B.z0 + B.z1) / 2, xc = (B.x0 + B.x1) / 2;
    gren.add(merged([bx(W, 2.3, L, xc, 0.55, zc), bx(W + 0.3, 0.12, L + 0.3, xc, 1.7, zc)], lam({ color: '#39423c', map: greyTex })));
    gren.add(merged([bx(W - 0.3, 0.1, L - 0.3, xc, DECKY - 0.05, zc)], lam({ map: plankT })));
    const sign = canvasTex(2048, 250, (g, w, h) => {
      g.fillStyle = '#dddad0'; g.fillRect(0, 0, w, h);
      strokes(g, w, h, ['#e8e5da', '#c6c4ba', '#f0eee1', '#b8b8b0', '#cfd4d2'], 160, 16, 6);
      g.fillStyle = '#1c2430'; g.font = '900 148px Georgia, "Times New Roman", serif';
      g.textBaseline = 'middle'; g.fillText('LOCATION  DE  CANOTS', 46, h / 2 + 6);
      g.globalAlpha = 0.16; strokes(g, w, h, ['#e4e1d6', '#d6d3c8'], 36, 9, 4); g.globalAlpha = 1;
    });
    const wallM = lam({ color: '#c4c4bc', map: greyTex }), wy = 1.72, wh = DECKY + 0.74 - wy;
    gren.add(merged([
      bx(0.1, wh, L, B.x0 + 0.05, wy + wh / 2, zc),
      bx(W, wh, 0.1, xc, wy + wh / 2, B.z1 + 0.05),
      bx(W - 2.2, wh, 0.1, xc + 1.1, wy + wh / 2, B.z0 - 0.05)
    ], wallM));
    const front = new THREE.Mesh(new THREE.PlaneGeometry(7.6, wh), lam({ map: sign }));
    front.rotation.y = Math.PI / 2; front.position.set(B.x1 + 0.02, wy + wh / 2, B.z0 - 3.8); gren.add(front);
    gren.add(merged([
      bx(0.1, wh, B.z0 - GW_A[1] - 0.75, B.x1 - 0.05, wy + wh / 2, (B.z0 + GW_A[1] + 0.75) / 2),
      bx(0.1, wh, GW_A[1] - 0.75 - B.z1, B.x1 - 0.05, wy + wh / 2, (GW_A[1] - 0.75 + B.z1) / 2),
      bx(0.12, 0.08, L, B.x1, wy + wh + 0.04, zc), bx(0.12, 0.08, L, B.x0, wy + wh + 0.04, zc)
    ], wallM));
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.2), new THREE.MeshLambertMaterial({ color: '#fbf9f2', emissive: '#4a4844', map: greyTex, side: THREE.DoubleSide }));
    cloth.rotation.y = Math.PI / 2; cloth.position.set(B.x1 + 0.07, wy + wh - 0.42, B.z0 - 3.5); gren.add(cloth);

    const eave = 4.3, ridge = 5.5, posts = [];
    for (let z = B.z0 - 0.25; z > B.z1; z -= 3.3) for (const x of [B.x0 + 0.2, B.x1 - 0.2]) posts.push(bx(0.13, eave - DECKY, 0.13, x, (eave + DECKY) / 2, z));
    gren.add(merged(posts, lam({ color: '#7a4a38', map: greyTex })));
    const roofT = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#7f8c98'; g.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 32) {
        g.fillStyle = ['#8a97a2', '#74828e', '#93a0aa', '#6c7a88'][(x / 32) % 4];
        g.fillRect(x, 0, 27, h); g.fillStyle = '#3c4650'; g.fillRect(x + 27, 0, 5, h);
      }
      g.globalAlpha = 0.3; strokes(g, w, h, ['#b4c0c8', '#56626e'], 40, 9, 5, true); g.globalAlpha = 1;
    }, true);
    roofT.repeat.set(7, 1);
    const roofM = lam({ map: roofT, side: THREE.DoubleSide });
    const x0 = B.x0 - 0.7, x1 = B.x1 + 0.7, za = B.z0 + 0.7, zb = B.z1 - 0.7, rg = new THREE.BufferGeometry();
    rg.setAttribute('position', new THREE.Float32BufferAttribute([x1, eave, za, x1, eave, zb, xc, ridge, zb, xc, ridge, za, x0, eave, za, x0, eave, zb, xc, ridge, zb, xc, ridge, za], 3));
    rg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1], 2));
    rg.setIndex([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6]); rg.computeVertexNormals(); gren.add(new THREE.Mesh(rg, roofM));

    const scal = canvasTex(512, 64, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = '#8a4a34'; g.fillRect(0, 0, w, 26);
      for (let x = 16; x < w; x += 32) { g.beginPath(); g.arc(x, 26, 16, 0, Math.PI); g.fill(); }
      g.fillStyle = '#5c2e22'; g.fillRect(0, 0, w, 7);
    }, true);
    scal.repeat.set(9, 1);
    const scalM = new THREE.MeshLambertMaterial({ map: scal, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
    for (const x of [B.x1 + 0.72, B.x0 - 0.72]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(L + 1.4, 0.55), scalM); v.rotation.y = Math.PI / 2; v.position.set(x, eave - 0.2, zc); gren.add(v); }
    for (const z of [B.z0 + 0.7, B.z1 - 0.7]) {
      const sh = new THREE.Shape([new THREE.Vector2(-W / 2 - 0.7, 0), new THREE.Vector2(W / 2 + 0.7, 0), new THREE.Vector2(0, ridge - eave)]);
      const gb = new THREE.Mesh(new THREE.ShapeGeometry(sh), lam({ color: '#8a4a34', map: greyTex, side: THREE.DoubleSide }));
      gb.position.set(xc, eave, z); gren.add(gb);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(W + 1.4, 0.55), scalM); v.position.set(xc, eave - 0.2, z); gren.add(v);
    }
    gren.add(merged([cyl(0.03, 0.05, 1.3, 5, xc, ridge + 0.6, B.z0 + 0.7), cyl(0.03, 0.05, 1.3, 5, xc, ridge + 0.6, B.z1 - 0.7)], lam({ color: '#3a342c' })));
    const fur = [];
    for (let z = B.z0 - 4; z > B.z1 + 2; z -= 3.6) {
      if (Math.abs(z - GW_A[1]) < 1.7) continue;
      fur.push(cyl(0.45, 0.45, 0.04, 12, B.x1 - 1.3, DECKY + 0.72, z), cyl(0.04, 0.05, 0.72, 6, B.x1 - 1.3, DECKY + 0.36, z));
    }
    gren.add(merged(fur, lam({ color: '#5a7a5a', map: greyTex })));
  }

  /* moored foreground boats for Monet and Renoir views */
  function moor(x, z, ry, o) {
    const b = makeBoat(o); b.position.x = x; b.position.z = z; b.rotation.y = ry;
    setOars(b, -1.45, -0.12);
    for (const m of b.userData.oars) { m.position.x *= 0.5; m.position.y = 0.42; }
    gren.add(b); moored.push({ b, ph: rnd(0, 6), ry }); return b;
  }
  const fgA = [
    [25.2, ZP + 5.2, 1.12, { hull: '#386446', stripe: '#ce5d36', inside: '#8a9a7a', floor: '#8c9472' }],
    [26.6, ZP - 1.0, 1.5, { hull: '#2c3a34', stripe: '#3a5a48', inside: '#5a6a5a', floor: '#6a7462' }],
    [19.4, ZP - 7.6, 2.75, { hull: '#35523f', stripe: '#ce5d36', inside: '#6a7a5c', floor: '#7a8468' }]
  ].map(a => moor(...a));
  const fgB = [
    [20.6, ZP + 1.9, 1.45, { hull: '#b0783c', stripe: '#6a4a2a', floor: '#c89252' }],
    [23.4, ZP - 0.1, 1.15, { hull: '#2f4a38', stripe: '#1c2c22', inside: '#7a8a6a', floor: '#84906e' }],
    [23.8, ZP - 2.0, 1.95, { hull: '#33503c', stripe: '#1c2c22', inside: '#6a7a5c', floor: '#748066' }],
    [22.6, ZP - 5.4, 1.62, { hull: '#3f7a4c', stripe: '#ce5d36', inside: '#c87a5a', floor: '#b87654' }]
  ].map(a => moor(...a));

  /* two easels side by side on the bank */
  const easels = [];
  {
    const tl = new THREE.TextureLoader(), legM = lam({ color: '#6a5236' });
    for (const [z, img, w, h] of [[ZP + 0.75, 'images/grenouillere.jpg', 1.0, 0.75], [ZP - 0.95, 'images/renoir_grenouillere.jpg', 0.81, 0.66]]) {
      const g = new THREE.Group(), t = tl.load(img); t.colorSpace = THREE.SRGBColorSpace;
      g.add(merged([
        beam(new V3(0.12, 0, -0.42), new V3(0.0, 1.75, -0.1), 0.045, 0.045),
        beam(new V3(0.12, 0, 0.42), new V3(0.0, 1.75, 0.1), 0.045, 0.045),
        beam(new V3(-0.75, 0, 0), new V3(0.0, 1.7, 0), 0.045, 0.045),
        bx(0.07, 0.04, 0.9, 0.09, 0.82, 0)
      ], legM));
      const cv = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: t, emissive: '#3a3a3a', emissiveMap: t }));
      cv.rotation.y = Math.PI / 2; cv.position.set(0.1, 0.86 + h / 2, 0);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam({ color: '#b9a888' }));
      back.rotation.y = -Math.PI / 2; back.position.copy(cv.position).x -= 0.012;
      g.add(cv, back); g.position.set(35.15, BANKY, z); gren.add(g); easels.push(g);
    }
  }

  /* start landing upstream (Chatou / Maison Fournaise impression) */
  const startG = new THREE.Group(); scene.add(startG);
  {
    const wallM = lam({ color: '#ece0c4', map: greyTex }), tileM = lam({ color: '#b25a3a', map: greyTex }), hx = 43, hz = 4;
    startG.add(merged([bx(9, 6.4, 13, hx, BANKY + 3.2, hz)], wallM));
    const sh = new THREE.Shape([new THREE.Vector2(-5, 0), new THREE.Vector2(5, 0), new THREE.Vector2(0, 2.6)]);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }), tileM);
    roof.position.set(hx, BANKY + 6.4, hz - 7); startG.add(roof);
    const win = [];
    for (const z of [-4, 0, 4]) for (const y of [1.9, 4.7]) win.push(bx(0.06, 1.5, 1.0, hx - 4.52, BANKY + y, hz + z));
    startG.add(merged(win, lam({ color: '#586a76' })));
    const awnT = canvasTex(256, 64, (g, w, h) => {
      for (let x = 0; x < w; x += 32) { g.fillStyle = x / 32 % 2 ? '#f7efda' : '#de7436'; g.fillRect(x, 0, 32, h); }
      g.globalAlpha = 0.25; strokes(g, w, h, ['#fff6e0', '#b85a2a'], 24, 7, 3, true); g.globalAlpha = 1;
    }, true);
    awnT.repeat.set(4, 1);
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.4), new THREE.MeshLambertMaterial({ map: awnT, side: THREE.DoubleSide, emissive: '#3a2a1a' }));
    awn.rotation.order = 'YXZ'; awn.rotation.y = -Math.PI / 2; awn.rotation.x = -Math.PI / 2 + 0.32;
    awn.position.set(hx - 6.0, BANKY + 6.0, hz); startG.add(awn);
    const bal = [bx(3.2, 0.14, 12.4, hx - 6.0, BANKY + 3.0, hz), bx(0.06, 0.9, 12.4, hx - 7.55, BANKY + 3.5, hz)];
    for (let z = -6; z <= 6; z += 3) bal.push(bx(0.12, 6.4, 0.12, hx - 7.5, BANKY + 3.2, hz + z));
    startG.add(merged(bal, lam({ color: '#7a8a8a', map: greyTex })));
    const gs = [bx(4.4, 0.1, 15, 33.7, BANKY - 0.05, 0)];
    for (let z = -7; z <= 7; z += 2.3) gs.push(cyl(0.09, 0.1, 2.6, 6, 31.6, -0.1, z));
    startG.add(merged(gs, lam({ map: plankT, color: '#c4b69e' })));
    for (const [z, o] of [[3.5, { hull: '#7a3a2c', stripe: '#e6d6b0' }], [8.2, { hull: '#2f4a5a', stripe: '#d9c07a' }], [-2.5, { hull: '#386446', stripe: '#ce5d36' }]]) {
      const b = makeBoat(o); b.position.x = 30.4; b.position.z = z; b.rotation.y = 0.08;
      setOars(b, -1.45, -0.12); for (const m of b.userData.oars) { m.position.x *= 0.5; m.position.y = 0.42; }
      startG.add(b); moored.push({ b, ph: rnd(0, 6), ry: 0.08 });
    }
  }

  return { gren, startG, moored, fgA, fgB, easels };
}

/* ================= people, river traffic & shimmering sun-glints ================= */
export function buildPeopleTrafficAndGlints(scene, FIG, gren, startG) {
  function sit(g, seatY, legs = 84) {
    const u = g.userData, k = g.scale.y;
    for (const S of ['L', 'R']) {
      FIG.turn(u, 'thigh' + S, -legs, 0, 0); FIG.turn(u, 'shin' + S, legs, 0, 0);
      FIG.turn(u, 'upperarm' + S, -24, 0, 0); FIG.turn(u, 'forearm' + S, -50, 0, 0);
    }
    g.position.y = seatY - 0.77 * k; u.sh.visible = false; return g;
  }
  const person = (name, par, o = {}) => {
    const g = FIG.spawn(name, { size: o.size || 1.1, adult: true, tint: o.tint });
    FIG.pose(g, 0, 0); par.add(g); return g;
  };
  function place(g, p) {
    if (!p) { g.visible = false; return; }
    const [x, y, z, face, pose] = p, u = g.userData;
    g.visible = true; FIG.pose(g, 0, 0); u.sh.visible = true;
    g.position.set(x, y, z); g.rotation.set(0, face * Math.PI / 180, 0);
    if (pose === 'sit') sit(g, y + 0.47);
    else if (pose === 'bend') FIG.turn(u, 'spine', 42, 0, 0);
    else if (pose === 'lean') FIG.turn(u, 'spine', 14, 0, 0);
    else if (pose === 'parasol') { u.aR.rotation.x = -1.5; u.aR.rotation.z = 0.2; }
  }
  const I = (u, v, face, pose) => { const [x, z] = IP(u, v); return [x, ISY, z, face, pose]; };
  const onPlank = (t, face, pose) => [mix(PR_A[0], PR_B[0], t), mix(ISY, DECKY, t), mix(PR_A[1], PR_B[1], t), face, pose];

  const cast = [
    ['bather_w', { A: I(-2.9, 0.4, 170, 'lean'), B: null }],
    ['bather_w', { A: I(-2.0, 0.6, 20), B: null, tint: '#3a3a44' }],
    ['gent_blue', { A: I(-0.45, -0.5, 150, 'sit'), B: I(-2.2, 0.5, 60) }],
    ['lady_dark', { A: I(0.75, -0.5, -70, 'sit'), B: I(-1.5, 1.3, 100) }],
    ['lady_dark', { A: I(-1.3, 0.6, 80), B: I(-0.5, 1.2, 60), tint: '#4a4038' }],
    ['lady_dark', { A: I(1.45, 0.75, -90), B: I(-2.9, 1.4, 120), tint: '#30302e' }],
    ['gent_dark', { A: I(2.05, 0.5, 10), B: I(-2.7, -0.1, 130) }],
    ['gent_dark', { A: I(2.6, 0.15, 100), B: I(2.35, -1.05, 30), tint: '#2a3a34' }],
    ['gent_dark', { A: I(2.25, 1.0, -20), B: I(-1.9, -0.5, 100), tint: '#1c1c22' }],
    ['rower', { A: I(3.05, 0.3, 60, 'bend'), B: I(0.25, -0.5, 170, 'sit') }],
    ['lady_ochre', { A: null, B: I(1.0, -0.35, 100, 'sit') }],
    ['lady_white', { A: null, B: I(1.55, -1.35, -30) }],
    ['lady_white', { A: null, B: I(-3.3, 0.3, 90), tint: '#d8d4c8' }],
    ['gent_dark', { A: onPlank(0.55, 185), B: null }],
    ['lady_pink', { A: null, B: onPlank(0.35, 150, 'parasol'), parasol: true }],
    ['bather_m', { A: null, B: onPlank(1.0, 100), size: 0.8 }]
  ].map(([name, o]) => {
    const g = person(name, gren, o);
    if (o.parasol) {
      const p = merged([cyl(0.012, 0.012, 1.0, 5, 0, 0.3, 0), new THREE.ConeGeometry(0.62, 0.22, 12, 1, true).translate(0, 0.86, 0)],
        new THREE.MeshLambertMaterial({ color: '#f6f2e8', emissive: '#4a4844', side: THREE.DoubleSide }));
      g.userData.aR.add(p);
    }
    return { g, ...o };
  });

  /* guests at the café rail & start landing */
  {
    const B = BARGE;
    for (const [n, z, face, tint] of [
      ['lady_white', -2.4, 80, null], ['gent_dark', -4.0, 110, null], ['lady_white', -6.3, 60, '#e6e2d8'],
      ['lady_dark', -8.4, 100, '#3f6a9a'], ['gent_dark', -12.9, 70, '#2a2a30'], ['lady_ochre', -15.9, 100, null], ['gent_blue', -18.2, 90, null]
    ]) place(person(n, gren, { tint }), [B.x1 - 0.75, DECKY, B.z0 + z, face, z > -9 ? 'lean' : 'sit']);
    for (const [n, x, z, face] of [['gent_blue', 34.0, 5.5, -80], ['lady_white', 34.4, 7.0, -100]]) place(person(n, startG), [x, BANKY, z, face]);
  }
  const monet = person('monet', gren), renoir = person('renoir', gren);
  place(monet, [35.95, BANKY, ZP + 0.75, -90]); place(renoir, [35.95, BANKY, ZP - 0.95, -90]);
  for (const g of [monet, renoir]) g.userData.aR.add(merged([cyl(0.008, 0.012, 0.34, 5, 0, 0.17, 0)], lam({ color: '#3a2a1a' })));

  /* swimmers & dog & far boats */
  const sph = new THREE.SphereGeometry(1, 12, 8);
  const skinM = lam({ color: '#e8c4a0' }), suitM = lam({ color: '#242a36' });
  const hairMs = ['#4a3424', '#2a2018', '#8a5a34', '#c9a86a'].map(c => lam({ color: c }));
  function swimmer() {
    const g = new THREE.Group();
    const h = new THREE.Mesh(sph, skinM); h.scale.set(0.11, 0.13, 0.12); h.position.y = 0.2;
    const hr = new THREE.Mesh(sph, pick(hairMs)); hr.scale.set(0.118, 0.1, 0.128); hr.position.set(0, 0.25, -0.015);
    const b = new THREE.Mesh(sph, suitM); b.scale.set(0.2, 0.12, 0.17); b.position.y = 0.02;
    const arms = [-1, 1].map(s => { const a = new THREE.Mesh(cyl(0.035, 0.03, 0.5, 5, 0, 0.25, 0), skinM); a.position.set(s * 0.2, 0.04, 0); g.add(a); return a; });
    g.add(h, hr, b); g.userData = { arms, ph: rnd(0, 6) }; return g;
  }
  const bathers = [...Array(8)].map((_, i) => {
    const g = swimmer(); gren.add(g);
    const [x, z] = IP(-5.2 - (i % 4) * 0.95 - rnd(0, 0.5), 0.6 + Math.floor(i / 4) * 1.5 + rnd(-0.4, 0.6));
    g.position.set(x, 0, z); g.rotation.y = rnd(0, 6); g.userData.B = i >= 4; return g;
  });
  const dog = new THREE.Group();
  {
    const m = lam({ color: '#efe9da', map: greyTex });
    for (const [sx, sy, sz, x, y, z] of [[0.3, 0.13, 0.16, 0, 0.1, 0], [0.11, 0.09, 0.1, 0.34, 0.1, 0.05], [0.16, 0.04, 0.05, -0.3, 0.05, 0.1]]) {
      const p = new THREE.Mesh(sph, m); p.scale.set(sx, sy, sz); p.position.set(x, y, z); dog.add(p);
    }
    const [x, z] = IP(0.1, -2.75); dog.position.set(x, ISY, z); dog.rotation.y = 1.3; gren.add(dog);
  }
  const farBoats = [];
  for (const [u, v, ry, o, rider] of [
    [-9, 26, 0.4, { hull: '#b8643a', stripe: '#f1e6c8' }, 'rower'],
    [5, 34, -0.5, { hull: '#f1ecde', stripe: '#b8432b' }, 'gent_blue'],
    [10, 19, 2.6, { hull: '#c8643a', stripe: '#f1e6c8' }, 'rower']
  ]) {
    const b = makeBoat(o), [x, z] = IP(u, v); b.position.x = x; b.position.z = z; b.rotation.y = ry;
    sit(person(rider, b, { size: 1.05 }), 0.36); setOars(b, 0.2, 0.1); gren.add(b);
    farBoats.push({ b, ph: rnd(0, 6), ry, x, z });
  }
  const sailB = makeSail(); { const [x, z] = IP(-12.5, 7.5); sailB.position.set(x, 0, z); sailB.rotation.y = 2.0; gren.add(sailB); }

  /* river traffic: skiffs, white sailboats & bathers to steer playfully among (bumping costs nothing!) */
  const traffic = [];
  function addSkiff(z, off, rx, rz, T, o, passenger) {
    const b = makeBoat(o), r = person('rower', b, { size: 1.05 }); sit(r, 0.36, 70); r.position.z = 0;
    if (passenger) {
      const p = person(passenger, b, { size: 1.0 }); sit(p, 0.36); p.position.z = 1.3; p.rotation.y = Math.PI;
      if (passenger === 'lady_pink' || passenger === 'lady_white') {
        const para = merged([cyl(0.012, 0.012, 1.0, 5, 0, 0.3, 0), new THREE.ConeGeometry(0.6, 0.2, 12, 1, true).translate(0, 0.85, 0)],
          new THREE.MeshLambertMaterial({ color: passenger === 'lady_pink' ? '#f6ded8' : '#faf6ec', emissive: '#484440', side: THREE.DoubleSide }));
        p.userData.aR.rotation.x = -1.35; p.userData.aR.add(para);
      }
    }
    scene.add(b);
    traffic.push({ kind: 'skiff', g: b, x0: cx(z) + off, z0: z, rx, rz, T, ph: rnd(0, 6), r: 1.85, rower: r, cool: 0, x: 0, z: 0 });
  }
  function addSwim(z, off, n) {
    for (let i = 0; i < n; i++) {
      const g = swimmer(); scene.add(g);
      traffic.push({ kind: 'swim', g, x0: cx(z) + off + i * 2.2, z0: z + (i % 2) * 2.4, rx: 1.8, rz: 1.3, T: rnd(15, 22), ph: rnd(0, 6), r: 0.72, cool: 0, x: 0, z: 0 });
    }
  }
  function addSail(z, off, rx, rz, T, ph) {
    const s = makeSail(), m = person('gent_blue', s, { size: 1.0 }); sit(m, 0.5); m.position.z = 1.5; scene.add(s);
    traffic.push({ kind: 'sail', g: s, x0: cx(z) + off, z0: z, rx, rz, T, ph, r: 2.8, cool: 0, x: 0, z: 0 });
  }
  addSkiff(-52, 7, 4, 8, 44, { hull: '#b8643a', stripe: '#f1e6c8' }, 'lady_white');
  addSwim(-84, -10, 3);
  addSail(-118, -5, 8, 5, 58, 0.9);
  addSkiff(-148, 8, 4, 9, 42, { hull: '#2f4a5a', stripe: '#d9c07a' }, 'lady_pink');
  addSwim(-178, 10, 3);
  addSkiff(-206, -7, 5, 8, 40, { hull: '#f1ecde', stripe: '#b8432b' });
  addSail(-238, 5, 8, 5, 54, 3.6);
  addSkiff(-266, -8, 5, 8, 44, { hull: '#7a3a2c', stripe: '#e6d6b0' }, 'lady_dark');
  addSwim(-294, -10, 3);
  addSkiff(-322, 8, 5, 7, 46, { hull: '#386446', stripe: '#ce5d36' }, 'lady_white');

  /* 16 shimmering sun-glint pools along the sunlit river: steering through them lays living paint dabs! */
  const glintTex = canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const cols = ['#fffbe0', '#f6dc62', '#82bce0', '#f8f5e2', '#e8c44a'];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + rnd(-0.15, 0.15), r = rnd(18, 50);
      g.fillStyle = cols[i % cols.length]; g.globalAlpha = rnd(0.75, 1.0);
      g.fillRect(w / 2 + Math.cos(a) * r - 11, h / 2 + Math.sin(a) * r - 3.5, 22, 7);
    }
    const rad = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, 34);
    rad.addColorStop(0, 'rgba(255,252,220,.95)'); rad.addColorStop(0.5, 'rgba(248,218,110,.55)'); rad.addColorStop(1, 'rgba(248,218,110,0)');
    g.fillStyle = rad; g.fillRect(0, 0, w, h); g.globalAlpha = 1;
  }, false);
  const glintMat = new THREE.MeshBasicMaterial({ map: glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const moteCols = ['#fff8d2', '#f2cf52', '#64a2d8', '#44825a'];
  const riverGlints = [];
  /* gentle weaving ribbon of light; alternate ones sit close to center so even hands-off drift catches plenty */
  const glintOffsets = [3, -1, -7, 0, 7, 1, -6, -1, 6, 0, -7, 1, 6, -2, 2, 0];
  for (let i = 0; i < glintOffsets.length; i++) {
    const z = mix(-32, ARRIVE_Z + 14, i / (glintOffsets.length - 1));
    const x = cx(z) + glintOffsets[i];
    const grp = new THREE.Group(); grp.position.set(x, 0.08, z);
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 5.6), glintMat.clone());
    disc.rotation.x = -Math.PI / 2; grp.add(disc);
    const motes = [];
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.24), new THREE.MeshBasicMaterial({ color: moteCols[(i + k) % 4], transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
      grp.add(m); motes.push(m);
    }
    scene.add(grp);
    riverGlints.push({ grp, disc, motes, x, z, ph: i * 1.15, caught: false, pop: 0 });
  }

  return { cast, place, sit, monet, renoir, bathers, dog, farBoats, sailB, traffic, riverGlints };
}



