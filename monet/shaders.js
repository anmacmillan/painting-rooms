/* Impressionist shaders for La Grenouillère (Croissy, 1869):
   broken-touch painted sky, Monet/Renoir Morse-code water with wake-fractured reflections
   and boat-floor cutout, and a fast whole-frame impasto dab post-process. */
import * as THREE from 'three';

export const GLSL_NOISE = `
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
vec2 hash2(vec2 p){ return vec2(hash(p), hash(p + vec2(37.2, 17.9))); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.04 + vec2(7.1, 3.3); a *= 0.5; }
  return s;
}
vec3 lin(vec3 c){ return pow(max(c, 0.0), vec3(2.2)); }
`;

export function makeSkyMat(uni) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: uni,
    vertexShader: `varying vec3 vDir;
      void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float uTime; uniform vec3 uFog, uSun; varying vec3 vDir; ${GLSL_NOISE}
      void main(){
        vec3 d = normalize(vDir);
        float el = max(d.y, 0.0);
        float t = uTime * 0.007;
        /* seamless projected sky plane (zero azimuth wrap seam!) broken into loose painterly strokes */
        vec2 dome = d.xz / (el * 0.85 + 0.32);
        vec2 sc = dome * 5.8;
        float row = floor(sc.y * 1.9);
        float ox = hash(vec2(row, 3.1)) * 1.7;
        vec2 cid = vec2(floor(sc.x + ox), row);
        vec2 rnd = hash2(cid);
        vec2 u = fract(vec2(sc.x + ox, sc.y * 1.9)) - 0.5;
        vec2 cellDome = (vec2(cid.x + 0.5 - ox, (cid.y + 0.5) / 1.9)) / 5.8;
        /* gently warp dome sample per stroke so clouds sit in overlapping organic oil patches */
        vec2 cp = mix(dome, cellDome, 0.72) * 1.35;

        /* Monet 1869 summer sky palette: powdery cerulean, pale azure, warm cream cumulus */
        vec3 zen = lin(vec3(0.38, 0.62, 0.85));
        vec3 mid = lin(vec3(0.64, 0.80, 0.90));
        vec3 hor = lin(vec3(0.88, 0.91, 0.87));
        vec3 base = mix(hor, mid, smoothstep(0.0, 0.28, el));
        base = mix(base, zen, smoothstep(0.24, 0.86, el));

        float n1 = fbm(cp + vec2(t * 2.2, t * 0.7));
        float n2 = fbm(cp * 2.3 + vec2(4.2 - t * 2.8, 1.7));
        float cloud = smoothstep(0.45, 0.65, n1 + n2 * 0.24);
        vec3 clLit = lin(vec3(0.97, 0.96, 0.89));
        vec3 clShd = lin(vec3(0.77, 0.82, 0.86));
        vec3 clCol = mix(clShd, clLit, smoothstep(0.30, 0.72, n2 + rnd.x * 0.16));
        base = mix(base, clCol, cloud * 0.92 * smoothstep(0.01, 0.16, el));

        /* subtle unmixed warm-cream / cool-blue broken-colour touch per sky dab */
        vec3 shift = mix(lin(vec3(0.94, 0.97, 1.04)), lin(vec3(1.04, 1.02, 0.94)), rnd.y);
        float dabMask = 1.0 - smoothstep(0.36, 0.54, length(u / vec2(0.56, 0.52)));
        base *= mix(vec3(1.0), shift * (0.96 + 0.08 * rnd.x), dabMask * 0.85);

        /* warm afternoon sun glow */
        float sd = max(dot(d, uSun), 0.0);
        base += lin(vec3(1.0, 0.95, 0.80)) * (pow(sd, 7.0) * 0.14 + pow(sd, 190.0) * 1.15);

        base = mix(uFog, base, smoothstep(-0.02, 0.08, d.y));
        gl_FragColor = vec4(base, 1.0);
      }`
  });
}

export const WAKE_N = 20;
export const BLOOM_N = 10;
export const SHADE_N = 14;

export function makeWaterMat({ uni, reflRT, reflM, ZP, wake, blooms, shades }) {
  return new THREE.ShaderMaterial({
    fog: false,
    uniforms: {
      uTime: uni.uTime, uFog: uni.uFog, uSun: uni.uSun, uDen: uni.uDen,
      tRefl: { value: reflRT.texture }, uReflM: { value: reflM },
      uG: { value: new THREE.Vector3(10, ZP, 0) },
      uWake: { value: wake }, uBlooms: { value: blooms }, uShades: { value: shades },
      uBoatPos: { value: new THREE.Vector2(30, -8) },
      uBoatDir: { value: new THREE.Vector2(0, -1) },
      uBoatCut: { value: 1.0 },
      uAx: { value: 1.0 },
      uLiveliness: { value: 0.0 }
    },
    vertexShader: `varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uTime, uDen, uAx, uBoatCut, uLiveliness;
      uniform vec3 uFog, uSun, uG;
      uniform vec2 uBoatPos, uBoatDir;
      uniform sampler2D tRefl; uniform mat4 uReflM;
      uniform vec4 uWake[${WAKE_N}]; uniform vec4 uBlooms[${BLOOM_N}]; uniform vec4 uShades[${SHADE_N}];
      varying vec3 vW; ${GLSL_NOISE}

      void main(){
        /* keep the player skiff interior completely dry at any lean angle */
        if (uBoatCut > 0.5) {
          vec2 rel = vW.xz - uBoatPos;
          float fwd = dot(rel, uBoatDir);
          float side = rel.x * (-uBoatDir.y) + rel.y * uBoatDir.x;
          float hull = (side * side) / (0.55 * 0.55) + (fwd * fwd) / (1.95 * 1.95);
          if (hull < 1.0) discard;
        }

        vec2 p = vW.xz;
        /* world-anchored horizontal dashes across the line of sight; only crossfades on final turn */
        bool alongX = uAx + (noise(p * 0.19) - 0.5) * 0.75 > 0.5;
        vec2 q = alongX ? p : vec2(p.y, -p.x);
        float fx = length(vec2(dFdx(q.x), dFdy(q.x))), fy = length(vec2(dFdx(q.y), dFdy(q.y)));
        float lx = log2(max(fx * 30.0 / 1.05, 0.5)), ly = log2(max(fy * 7.2 / 0.24, 0.5));
        float sx0 = exp2(floor(lx)), sy0 = exp2(floor(ly));
        vec2 coarse = floor(q / (vec2(1.05, 0.24) * vec2(sx0, sy0) * 2.0));
        float sx = hash(coarse + 11.0) < fract(lx) ? sx0 * 2.0 : sx0;
        float sy = hash(coarse + 37.0) < fract(ly) ? sy0 * 2.0 : sy0;
        vec2 cell = vec2(1.05 * sx, 0.24 * sy);

        float r = floor(q.y / cell.y), ox = hash(vec2(r, sy * 3.7)) * cell.x;
        float c = floor((q.x + ox) / cell.x);
        vec2 id = vec2(c, r) + vec2(sx * 13.0, sy * 7.0);
        vec2 ctr = vec2((c + 0.5) * cell.x - ox, (r + 0.5) * cell.y);
        vec2 u = (q - ctr) / cell - (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * vec2(0.18, 0.16);
        /* crisp square-ended flat-ferrule brush stroke mask (Monet 1869) */
        vec2 b = abs(u) / vec2(0.45 + 0.08 * hash(id + 1.3), 0.41 + 0.08 * hash(id + 5.9));
        float boxD = length(max(b - vec2(0.55, 0.35), 0.0)) + min(max(b.x - 0.55, b.y - 0.35), 0.0);
        float mask = 1.0 - smoothstep(0.32, 0.48, boxD);
        vec2 Wc = alongX ? ctr : vec2(-ctr.y, ctr.x);

        /* wake turbulence: shatters reflections into jumping horizontal dabs, then re-forms */
        float wakeStir = 0.0, wakeFoam = 0.0;
        for (int i = 0; i < ${WAKE_N}; i++) {
          vec4 wk = uWake[i];
          float age = uTime - wk.z;
          if (age > 0.0 && age < 4.8) {
            float fade = 1.0 - age / 4.8;
            float dist = distance(Wc, wk.xy);
            float spread = 0.6 + age * 1.55 * wk.w;
            float crest = smoothstep(0.95, 0.0, abs(dist - spread));
            float inner = smoothstep(spread + 0.4, 0.0, dist);
            wakeStir += (crest * 1.85 + inner * 0.9) * fade * fade;
            wakeFoam += crest * fade * (0.55 + 0.45 * step(0.32, hash(id + floor(uTime * 3.5) * 0.19)));
          }
        }
        wakeStir = min(wakeStir, 2.6);

        /* crossing summer ripples + wake disturbance */
        float w1 = sin(dot(Wc, vec2(0.85, 1.55)) * 0.55 + uTime * 1.7 + 4.5 * noise(Wc * 0.12 + vec2(uTime * 0.08, 0.0)));
        float w2 = noise(Wc * 0.44 + vec2(-uTime * 0.28, uTime * 0.34)) * 2.0 - 1.0;
        float wakeWave = sin(wakeStir * 7.5 + hash(id + 2.7) * 6.28) * wakeStir * 0.95;
        float sl = 0.52 * w1 + 0.52 * w2 + (hash(id) - 0.5) * 0.65 + wakeWave;

        /* fetch mirrored reflection, fractured horizontally & vertically by wave + wake */
        vec3 P = vec3(Wc.x, 0.0, Wc.y), toC = cameraPosition - P;
        float dC = length(toC); vec3 Vc = toC / max(dC, 0.001);
        vec2 away = -normalize(toC.xz + 1e-4);
        vec2 sideA = vec2(-away.y, away.x);
        float fracShift = sl * (0.55 + dC * 0.16 + wakeStir * 1.35);
        float sideShift = (hash(id + 4.9) - 0.5) * wakeStir * 1.4;
        vec3 Pr = P + vec3(away.x * fracShift + sideA.x * sideShift, 0.0, away.y * fracShift + sideA.y * sideShift);
        vec4 cl = uReflM * vec4(Pr, 1.0);
        vec3 refl = texture2D(tRefl, clamp(cl.xy / max(cl.w, 0.001), 0.004, 0.996)).rgb;

        /* Monet's unmixed water palette: cerulean, deep Prussian pine, sunlit ochre-gold, cream */
        vec3 deep = lin(vec3(0.06, 0.16, 0.17));
        vec3 pruss = lin(vec3(0.08, 0.17, 0.24));
        vec3 skyB = lin(vec3(0.32, 0.56, 0.85));
        vec3 skyPale = lin(vec3(0.62, 0.78, 0.89));
        vec3 skyW = lin(vec3(0.95, 0.94, 0.88));
        vec3 gold = lin(vec3(0.86, 0.74, 0.34));
        vec3 emrld = lin(vec3(0.24, 0.42, 0.28));

        /* dappled willow shade pools along the river + under the island bank at La Grenouillere */
        float sh = smoothstep(13.0, 24.0, Wc.x) * (1.0 - smoothstep(26.0, 44.0, abs(Wc.y - uG.y)));
        for (int i = 0; i < ${SHADE_N}; i++) {
          vec4 sd = uShades[i];
          vec2 dd = (Wc - sd.xy) / sd.zw;
          sh = max(sh, (1.0 - smoothstep(0.45, 1.05, length(dd))) * 0.78);
        }
        float shDab = sh * (0.45 + 0.55 * step(0.38, hash(id + 12.4)));
        refl = mix(refl, mix(deep * 0.9, emrld, step(0.55, hash(id + 6.6))), shDab * 0.72);
        sl -= sh * 0.24;

        float fres = pow(1.0 - max(Vc.y, 0.0), 2.1);
        vec3 col = mix(deep, refl * vec3(0.94, 0.99, 1.04), 0.48 + 0.52 * fres);

        /* Morse-code horizontal dashes of unmixed pigment */
        float open = smoothstep(0.22, 0.68, dot(refl, vec3(0.22, 0.5, 0.28)));
        col = mix(col, mix(skyB, skyPale, hash(id + 1.9)), open * 0.48 * (1.0 - sh * 0.65));
        col = mix(col, skyB, smoothstep(0.32, 0.64, sl) * 0.88);
        col = mix(col, skyW, smoothstep(0.84, 1.06, sl));
        col = mix(col, pruss * 0.75, smoothstep(-0.42, -0.82, sl) * 0.88);
        /* golden reflection dashes scattered in sunlit stretches */
        float goldMask = step(0.76, hash(id + 8.3)) * (1.0 - sh * 0.7) * smoothstep(0.05, 0.5, sl + 0.3);
        col = mix(col, gold, goldMask * (0.48 + 0.22 * uLiveliness));

        /* specular sun-glitter dabs in Monet's warm ochre-gold & cream (never neon lemon) */
        vec3 n = normalize(vec3(w2 * 0.22 + (hash(id + 2.2) - 0.5) * 0.18, 1.0, w1 * 0.22 + (hash(id + 8.8) - 0.5) * 0.18));
        vec3 rr = reflect(-Vc, n);
        float g = pow(max(dot(rr, uSun), 0.0), 62.0);
        col = mix(col, lin(vec3(0.90, 0.80, 0.46)) * 1.18, smoothstep(0.14, 0.45, g));
        col = mix(col, lin(vec3(0.99, 0.96, 0.86)) * 1.28, smoothstep(0.55, 0.86, g));

        /* wake foam & broken reflection flashes */
        col = mix(col, mix(skyW, skyPale, hash(id + 5.1)), clamp(wakeFoam * 0.75, 0.0, 0.88));

        /* living paint-dab blooms where she steered through sun-glints! */
        for (int i = 0; i < ${BLOOM_N}; i++) {
          vec4 bl = uBlooms[i];
          float age = uTime - bl.z;
          if (age > 0.0 && age < 6.5) {
            float d = distance(Wc, bl.xy);
            float rad = 0.8 + age * 2.1;
            float ring = smoothstep(2.4, 0.0, abs(d - rad * 0.55)) * smoothstep(rad + 2.5, 0.0, d);
            float fade = (1.0 - smoothstep(3.5, 6.5, age)) * smoothstep(0.0, 0.18, age);
            float h = hash(id + bl.w * 19.0);
            vec3 dabC = h < 0.24 ? lin(vec3(0.96, 0.84, 0.34)) :
                        h < 0.48 ? lin(vec3(0.28, 0.56, 0.88)) :
                        h < 0.72 ? lin(vec3(0.98, 0.96, 0.86)) :
                        h < 0.88 ? lin(vec3(0.26, 0.58, 0.42)) : lin(vec3(0.10, 0.20, 0.30));
            col = mix(col, dabC * 1.2, ring * fade * (0.62 + 0.35 * step(0.3, h)));
          }
        }

        /* crisp contrast between unmixed dabs and the canvas/underpaint between them */
        col *= 0.88 + 0.24 * hash(id + 9.1);
        vec3 gap = mix(deep, col * 0.78, 0.52);
        col = mix(gap, col, mask);

        float dist = distance(vW, cameraPosition);
        float f = 1.0 - exp(-uDen * uDen * dist * dist);
        gl_FragColor = vec4(mix(col, uFog, f), 1.0);
      }`
  });
}

export function makePostMat(targetTex) {
  return new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: targetTex },
      uPx: { value: new THREE.Vector2(1 / 1133, 1 / 744) },
      uTime: { value: 0 },
      uDab: { value: 0.84 },
      uShimmer: { value: 0.35 }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: `uniform sampler2D tScene; uniform vec2 uPx; uniform float uTime, uDab, uShimmer; varying vec2 vUv;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

      /* sample a flat square-ended brush dab layer at given cell size and orientation */
      vec4 sampleDab(vec2 px, vec2 cell, float ang, float seed) {
        vec2 ca = vec2(cos(ang), sin(ang));
        vec2 q = vec2(ca.x * px.x + ca.y * px.y, -ca.y * px.x + ca.x * px.y);
        float r = floor(q.y / cell.y);
        float ox = hash(vec2(r, seed)) * cell.x;
        float c = floor((q.x + ox) / cell.x);
        vec2 id = vec2(c, r) + seed * 13.7;
        vec2 jit = (vec2(hash(id + 1.7), hash(id + 9.2)) - 0.5) * vec2(0.32, 0.24) * cell;
        vec2 ctr = vec2((c + 0.5) * cell.x - ox, (r + 0.5) * cell.y) + jit;
        vec2 u = (q - ctr) / cell;
        /* organic flat-bristle oil brush stroke profile (rounded ends, never hard digital tiles) */
        vec2 b = abs(u) / vec2(0.56, 0.46);
        float ell = length(b);
        float sq = max(b.x, b.y);
        float strokeD = mix(ell, sq, 0.35);
        float mask = 1.0 - smoothstep(0.72, 1.08, strokeD);
        vec2 cpx = vec2(ca.x * ctr.x - ca.y * ctr.y, ca.y * ctr.x + ca.x * ctr.y);
        vec2 suv = clamp(cpx * uPx, uPx * 2.0, 1.0 - uPx * 2.0);
        return vec4(suv, mask, hash(id + 4.4));
      }

      void main(){
        vec2 px = vUv / uPx;
        vec3 base = texture2D(tScene, vUv).rgb;

        /* horizontal dashes across the water, livelier organic brushwork in trees, banks and sky */
        float isUpper = smoothstep(0.36, 0.56, vUv.y);
        float patchH = hash(floor(px / 78.0));
        float ang1 = mix(-0.04, -0.45 + 0.92 * patchH, isUpper);
        float ang2 = mix(0.06, 0.48 - 0.94 * hash(floor(px / 52.0 + 3.1)), isUpper);

        vec4 d1 = sampleDab(px, mix(vec2(18.0, 6.8), vec2(15.5, 8.2), isUpper), ang1, 7.0);
        vec4 d2 = sampleDab(px + vec2(7.5, 3.8), vec2(11.5, 5.8), ang2, 19.3);

        vec3 c1 = texture2D(tScene, d1.xy).rgb;
        vec3 c2 = texture2D(tScene, d2.xy).rgb;
        vec3 c1b = (texture2D(tScene, d1.xy + uPx * vec2(2.2, 0.0)).rgb +
                    texture2D(tScene, d1.xy - uPx * vec2(2.2, 0.0)).rgb +
                    texture2D(tScene, d1.xy + uPx * vec2(0.0, 1.8)).rgb +
                    texture2D(tScene, d1.xy - uPx * vec2(0.0, 1.8)).rgb) * 0.25;
        c1 = mix(c1, c1b, 0.30);

        /* edge-preserving stroke lock: keeps figures, boats and LOCATION DE CANOTS sharp */
        float diff1 = length(c1 - base);
        float diff2 = length(c2 - base);
        float w1 = d1.z * (1.0 - smoothstep(0.22, 0.58, diff1));
        float w2 = d2.z * (1.0 - smoothstep(0.18, 0.48, diff2));

        vec3 painted = mix(base, c2, w2 * uDab * 0.62);
        painted = mix(painted, c1, w1 * uDab * 0.82);

        /* unmixed colour vibration + gentle Impressionist light shimmer */
        float h1 = d1.w, h2 = d2.w;
        float sh = sin(uTime * 1.5 + h1 * 6.283 + h2 * 3.14) * 0.5 + 0.5;
        vec3 warmShift = vec3(1.055, 1.025, 0.93);
        vec3 coolShift = vec3(0.93, 0.985, 1.07);
        float split = smoothstep(0.2, 0.8, h1) * (0.65 + 0.35 * sh * uShimmer);
        painted *= mix(vec3(1.0), mix(coolShift, warmShift, split), uDab * (0.32 + 0.24 * isUpper));

        /* subtle per-dab tonal variation + fine brush edge */
        painted *= 1.0 + (h1 - 0.5) * 0.09 * uDab - (1.0 - d1.z) * 0.045 * uDab;

        /* boost Impressionist chroma & crispness (warm sunlight, cool shadows) */
        float l2 = dot(painted, vec3(0.299, 0.587, 0.114));
        painted = mix(vec3(l2), painted, 1.18 + 0.07 * uShimmer);
        painted += vec3(0.012, 0.010, 0.002) * smoothstep(0.45, 0.95, l2);
        painted = mix(painted, painted * vec3(0.92, 0.97, 1.06), (1.0 - smoothstep(0.05, 0.32, l2)) * 0.32);

        /* fine linen canvas weave and gentle warm framing */
        float weave = (sin(px.x * 1.85) * sin(px.y * 1.85)) * 0.018;
        float grain = (hash(floor(px * 0.5)) - 0.5) * 0.032;
        painted *= 1.0 + weave + grain;
        painted *= 1.0 - 0.16 * pow(length(vUv - 0.5) * 1.22, 2.5);

        gl_FragColor = vec4(max(painted, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false
  });
}


