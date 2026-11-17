/* The etched line: a post filter that redraws a rendered three.js scene as an etching on warm paper, after Piranesi's Carceri.
   It began as a copy of alice/engrave.js (the wood-engraved line made for the Alice level) and was changed here for this level only; alice/engrave.js is untouched.
   What is different from the engraving, and why:
     - an etcher draws freely with a needle through wax, so the lines here swing and wander, break off in the lights, and vary in weight along their length;
     - shading is by long slanting strokes laid one set across another (no rings round columns); floors take strokes along the ground;
     - where the plate was bitten longest the lines run together into black: above a certain darkness the ink closes up, with only flecks of paper left in it;
     - a little ink is left on the whole plate ("plate tone"), so only the strongest lights are bare paper;
     - uState runs from 0 (the first state of about 1750: pale, sketch-like, one or two sets of strokes) to 1 (the reworked state of 1761: cross-hatched, deeply bitten, strong contrasts).
   Use, as engrave.js:
     const target = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType }); target.depthTexture = new THREE.DepthTexture(w, h, THREE.FloatType);
     const E = makeEtching(THREE, { scene: target.texture, depth: target.depthTexture });   quad material: E.material;   each frame after rendering the scene into target: E.update(camera, time, w, h)
   E.keepColour(material) leaves that material in colour (alpha 0.5 in the target); E.drawn(material) lets a material's own dark strokes be the drawing (alpha 0.75).
   Uniforms (E.uniforms.<name>.value): uState, uGain, uSpacing, uLine, uBoil, uShade (added darkness, 1 is a blackout), uFade (to bare paper), uFog (near, far of a white fog), uCrease, uDrawn. */
export function makeEtching(THREE, o = {}) {
  const uniforms = {
    tScene: { value: o.scene || null }, tDepth: { value: o.depth || null }, uPx: { value: new THREE.Vector2(1 / 1024, 1 / 768) }, uTime: { value: 0 },
    uInvProj: { value: new THREE.Matrix4() }, uInvView: { value: new THREE.Matrix4() }, uPxAngle: { value: 0.001 },
    uPaper: { value: new THREE.Color(o.paper ?? '#efe6d2').convertLinearToSRGB() }, uInk: { value: new THREE.Color(o.ink ?? '#1b1512').convertLinearToSRGB() },
    uGain: { value: o.gain ?? 1 }, uSpacing: { value: o.spacing ?? 4.6 }, uLine: { value: o.line ?? 1 }, uBoil: { value: o.boil ?? 0.12 }, uShade: { value: 0 }, uFade: { value: 0 }, uState: { value: o.state ?? 1 },
    uCrease: { value: o.crease ?? 1.1 }, uDrawn: { value: o.drawn ?? 0.5 }, uFog: { value: new THREE.Vector2(1e6, 2e6) },
  };
  const material = new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
    uniform sampler2D tScene, tDepth; uniform vec2 uPx; uniform float uTime, uPxAngle, uGain, uSpacing, uLine, uBoil, uShade, uFade, uCrease, uDrawn, uState;
    uniform mat4 uInvProj, uInvView; uniform vec3 uPaper, uInk; uniform vec2 uFog; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float noise3(vec3 p){ return mix(noise(p.xz + p.y * 1.7), noise(p.zx * 1.3 - p.y * 2.1 + 31.0), 0.5); }
    vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    /* one set of strokes: p the world position, a the direction the strokes are counted along, b the direction they run in, dk how dark this set should be (0 to 1) */
    float hatch(vec3 p, vec3 a, vec3 b, float dk, float seed){
      float ph = dot(p, a), f = max(length(vec2(dFdx(ph), dFdy(ph))), 1e-6), run = dot(p, b);
      float sp = mix(2.4, 0.95, sqrt(dk));
      float l = log2(uSpacing * sp * f / 0.02), k = floor(l), fr = l - k, P = 0.02 * exp2(k);
      ph += (noise3(p * 0.9 + seed) - 0.5) * P * 1.5 + (noise3(p * 4.3 + seed * 2.0) - 0.5) * f * 2.2;                 /* the needle swings: a slow drift between neighbours, and a quick tremble */
      float c1 = ph / P, c2 = ph / (2.0 * P);
      float d1 = 1.0 - abs(fract(c1) - 0.5) * 2.0, d2 = 1.0 - abs(fract(c2) - 0.5) * 2.0, v = mix(d1, d2, fr);
      float id = floor(mix(c1, c2, step(0.5, fr)));                                                                      /* which stroke this is: each has its own weight, and its own breaks */
      float press = 0.55 + 0.9 * noise(vec2(id * 7.31 + seed, run / (P * 26.0)));                                        /* pressure along the stroke */
      float brk = smoothstep(0.30, 0.42, noise(vec2(id * 3.17 + seed * 5.0, run / (P * 60.0))) + dk * 0.75);             /* in the lights a stroke stops and starts again */
      float w = mix(0.13, 0.60, dk) * press;
      float aa = 0.75 * (2.0 - fr) * f / P; return (1.0 - smoothstep(w - aa, w + aa, v)) * brk * smoothstep(0.0, 0.06, dk);
    }
    void main(){
      float boil = mod(floor(uTime * 5.0), 12.0);
      vec2 res = 1.0 / uPx;
      vec2 wander = (vec2(noise(vUv * res / 27.0 + boil * 1.7 * uBoil), noise(vUv * res / 27.0 + 19.0 - boil * 1.3 * uBoil)) - 0.5) * uPx * 3.4;      /* outlines are not ruled: they are read a little off their place */
      vec2 uv = vUv + wander * 0.6;
      vec4 sc = texture2D(tScene, vUv), sw = texture2D(tScene, uv);
      float keep = step(sc.a, 0.6), drawn = step(0.6, sc.a) * step(sc.a, 0.9);
      vec3 c = pow(max(mix(sw.rgb, sc.rgb, keep) * uGain, 0.0), vec3(1.0 / 2.2)); float lum = dot(c, vec3(0.299, 0.587, 0.114));
      vec2 ue = vUv + wander; float dc = texture2D(tDepth, ue).x, lw = max(1.0, floor(uLine + 0.5)); vec2 e = uPx * lw;
      vec3 pc = viewPos(ue), pl = viewPos(ue - vec2(e.x, 0.0)), pr = viewPos(ue + vec2(e.x, 0.0)), pd = viewPos(ue - vec2(0.0, e.y)), pu = viewPos(ue + vec2(0.0, e.y));
      float wc = 1.0 / pc.z, k2 = (abs(1.0 / pl.z + 1.0 / pr.z - 2.0 * wc) + abs(1.0 / pd.z + 1.0 / pu.z - 2.0 * wc)) / abs(wc) / (uPxAngle * lw);
      float far = smoothstep(0.9999, 0.99999, dc), dist = -pc.z;
      float heavy = 0.55 + 0.75 * noise(vUv * res / 41.0 + 3.0);                                                         /* the outline swells and thins */
      float edge = max(smoothstep(uCrease, uCrease * 1.7, k2) * 0.8 * heavy, smoothstep(3.0, 6.0, k2)) * (1.0 - smoothstep(110.0, 380.0, dist) * 0.85) * (1.0 - smoothstep(uFog.x, uFog.y, dist) * 0.97);
      vec3 dx = abs(pr.z - pc.z) < abs(pc.z - pl.z) ? pr - pc : pc - pl, dy = abs(pu.z - pc.z) < abs(pc.z - pd.z) ? pu - pc : pc - pd;
      vec3 n = normalize(mat3(uInvView) * cross(dx, dy)), p = (uInvView * vec4(pc, 1.0)).xyz;
      float t = clamp(1.0 - lum + uShade * 1.2 + (noise3(p * 1.3) - 0.5) * 0.16, 0.0, 1.0);
      t = mix(t * 0.8, pow(t, 0.86), uState);                                                                           /* the first state is paler throughout; the second pushes the darks */
      vec3 a1, b1, a2, b2, a3, b3;
      if (abs(n.y) > 0.72) { a1 = vec3(0.944, 0.0, 0.33); b1 = vec3(-0.33, 0.0, 0.944); a2 = vec3(-0.5, 0.0, 0.866); b2 = vec3(0.866, 0.0, 0.5); a3 = vec3(0.707, 0.0, -0.707); b3 = vec3(0.707, 0.0, 0.707); }
      else { a1 = vec3(0.50, 0.62, 0.60); b1 = vec3(0.55, -0.78, 0.30); a2 = vec3(-0.60, 0.50, -0.62); b2 = vec3(0.50, 0.86, -0.10); a3 = vec3(0.1, 0.99, 0.1); b3 = vec3(0.7, 0.0, -0.7); }
      float l1 = mix(0.11, 0.10, uState), l2 = mix(0.52, 0.36, uState), l3 = mix(0.90, 0.58, uState);
      float ink = 0.0;
      ink = max(ink, hatch(p, a1, b1, smoothstep(l1, l1 + 0.50, t), 1.0));
      ink = max(ink, hatch(p, a2, b2, smoothstep(l2, l2 + 0.40, t) * 0.92, 5.0));
      ink = max(ink, hatch(p, a3, b3, smoothstep(l3, l3 + 0.28, t) * 0.9, 9.0));
      float bite = smoothstep(mix(0.97, 0.80, uState), mix(1.05, 0.95, uState), t);                                      /* deeply bitten: the strokes run together, flecks of paper left between */
      ink = max(ink, bite * step(noise(vUv * res * 0.55) * 0.5 + noise(vUv * res * 0.17) * 0.5, 0.42 + bite * 0.56));
      ink = max(ink, smoothstep(0.30, 0.17, lum - uShade) * mix(0.85, 1.0, uState));                                     /* what is painted dark in a texture (a joint between stones, lettering) is ink */
      ink = mix(ink, smoothstep(uDrawn + 0.035, uDrawn - 0.035, lum - uShade * 0.6), drawn);
      ink *= 1.0 - far;
      ink = max(ink, edge * mix(0.8, 1.0, uState));
      vec2 px = vUv * res; float grain = (hash(floor(px)) - 0.5) * 0.05 + (noise(px * vec2(0.9, 0.06)) - 0.5) * 0.035 + (noise(px * 0.02) - 0.5) * 0.04;
      float tone = 0.035 + 0.05 * uState + 0.05 * smoothstep(0.25, 0.9, t) * (1.0 - far);                                /* plate tone: a film of ink wiped thin */
      vec3 paper = uPaper * (1.0 + grain) * (1.0 - tone) * (1.0 - 0.12 * pow(length(vUv - 0.5) * 1.3, 3.0));
      vec3 inkc = uInk * (1.0 + (noise(px * 0.5) - 0.5) * 0.5);
      vec3 col = mix(paper, inkc, clamp(ink, 0.0, 1.0));
      vec3 kc = c * (0.93 + grain) * (1.0 - clamp(uShade, 0.0, 1.0) * 0.85);
      col = mix(col, mix(kc, inkc, smoothstep(2.5, 5.0, k2) * 0.75), keep);
      gl_FragColor = vec4(mix(col, uPaper * (1.0 + grain), uFade), 1.0);
    }` });
  material.extensions = { derivatives: true };
  return {
    material, uniforms,
    update(camera, time, widthPx, heightPx) {
      uniforms.uTime.value = time; uniforms.uPx.value.set(1 / widthPx, 1 / heightPx);
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse); uniforms.uInvView.value.copy(camera.matrixWorld);
      uniforms.uPxAngle.value = 2 * Math.tan(camera.fov * Math.PI / 360) / heightPx;
    },
    drawn(m) { const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.a = 0.75;'); }; m.customProgramCacheKey = () => 'drawn'; m.needsUpdate = true; return m; },
    keepColour(m) { const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.a = 0.5;'); }; m.customProgramCacheKey = () => 'keepColour'; m.needsUpdate = true; return m; },
  };
}
