/* Klimt sky dome & fullscreen Golden-Period surface shader.
   Emphasises the flat picture plane, hammered gold-leaf metallic sheen,
   drifting gold dust, and crisp Secessionist bronze contours. */

export function makeKlimtSky(THREE) {
  const uniforms = {
    uTime: { value: 0 },
    uDark: { value: 0 },   /* 0 = warm bronze-gold (Tree/Adele), 1 = dark speckled Kiss ground */
    uGlow: { value: 0.4 },
  };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uTime, uDark, uGlow;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }
      void main() {
        vec3 d = normalize(vDir);
        float el = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
        float az01 = atan(d.z, d.x) / 6.2831853 + 0.5;
        /* Warm antique bronze-gold (Act 1-2) vs rich dark olive-bronze speckled ground (The Kiss / Death & Life) */
        vec3 warmLow = vec3(0.56, 0.41, 0.14);
        vec3 warmHigh = vec3(0.28, 0.20, 0.07);
        vec3 darkLow = vec3(0.22, 0.18, 0.08);
        vec3 darkHigh = vec3(0.08, 0.07, 0.04);
        vec3 col = mix(mix(warmLow, warmHigh, smoothstep(0.32, 0.90, el)),
                       mix(darkLow, darkHigh, smoothstep(0.28, 0.88, el)), uDark);

        /* Seamless mottled antique gold-leaf patina (exact integer azimuth wrap — zero vertical seams!) */
        vec2 muv = vec2(az01 * 24.0, d.y * 12.0);
        float pat = noise(muv) * 0.6 + noise(muv * 2.4 + 3.1) * 0.4;
        col += vec3(0.24, 0.17, 0.04) * (pat - 0.48) * (0.95 - 0.35 * uDark);

        /* Faint square gold-leaf patches floating softly in the bronze atmosphere (as in The Kiss) */
        vec2 leafUv = vec2(az01 * 18.0, d.y * 9.0);
        vec2 lcell = floor(leafUv), lf = fract(leafUv);
        float lh = hash(lcell);
        float patchMask = step(0.76, lh) * smoothstep(0.04, 0.12, lf.x) * smoothstep(0.04, 0.12, lf.y)
                        * smoothstep(0.96, 0.88, lf.x) * smoothstep(0.96, 0.88, lf.y);
        col += vec3(0.22, 0.16, 0.04) * patchMask * 0.55;

        /* Subtle ornamental spiral medallions inlaid in the upper sky */
        vec2 sp = fract(vec2(az01 * 8.0, d.y * 4.0)) - 0.5;
        float r = length(sp), a = atan(sp.y, sp.x);
        float spir = sin(r * 26.0 - a * 2.0 - uTime * 0.28);
        float ringMask = smoothstep(0.42, 0.08, r) * smoothstep(0.78, 0.96, spir);
        col += vec3(0.38, 0.28, 0.08) * ringMask * (0.24 + 0.12 * (1.0 - uDark));

        /* Fine Klimt gold-dust stipple drifting in the dark bronze sky */
        vec2 g1 = vec2(az01 * 120.0 + uTime * 0.015, d.y * 62.0 - uTime * 0.04);
        float d1 = hash(floor(g1));
        vec2 f1 = fract(g1) - 0.5;
        float speck = smoothstep(0.30, 0.06, length(f1)) * step(0.84, d1);
        float tw = 0.65 + 0.35 * sin(uTime * 2.6 + d1 * 40.0);
        col += vec3(1.0, 0.84, 0.32) * speck * tw * (0.45 + 0.45 * uDark);

        /* Warm gilded horizon glow drawing the eye forward */
        float hor = exp(-abs(d.y - 0.02) * 8.0);
        col += vec3(0.55, 0.39, 0.11) * hor * (0.42 + 0.22 * uGlow) * (1.0 - 0.42 * uDark);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 18), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return { mesh, uniforms };
}

export function makeKlimtFX(THREE, { sceneTex, depthTex }) {
  const uniforms = {
    tScene: { value: sceneTex },
    tDepth: { value: depthTex },
    uPx: { value: new THREE.Vector2(1 / 1133, 1 / 744) },
    uTime: { value: 0 },
    uMotion: { value: 0 },
    uNear: { value: 0.2 },
    uFar: { value: 1200.0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D tScene, tDepth;
      uniform vec2 uPx;
      uniform float uTime, uMotion, uNear, uFar;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float linDepth(vec2 uv) {
        float z = texture2D(tDepth, uv).x * 2.0 - 1.0;
        return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
      }
      void main() {
        vec3 col = texture2D(tScene, vUv).rgb;

        /* 1. Clean Secessionist dark-bronze silhouette contour on nearby foreground shapes */
        float d0 = linDepth(vUv);
        float dx = abs(linDepth(vUv + vec2(uPx.x * 1.2, 0.0)) - d0);
        float dy = abs(linDepth(vUv + vec2(0.0, uPx.y * 1.2)) - d0);
        float edge = smoothstep(0.10, 0.30, (dx + dy) / max(d0 * 0.35, 0.6)) * smoothstep(140.0, 25.0, d0);
        col = mix(col, vec3(0.12, 0.08, 0.03), edge * 0.36);

        /* 2. Flat ornamental richness — lift chroma, warm golden glow */
        float lum = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(lum), col, 1.15);

        /* 3. Fine hammered gold-leaf micro-sheen & lively metallic glint on golden surfaces */
        float isGold = smoothstep(0.18, 0.42, col.r - col.b) * smoothstep(0.24, 0.56, col.g) * smoothstep(0.28, 0.58, col.r);
        vec2 leafUv = vUv / (uPx * 9.0) + vec2(0.0, uMotion * 0.12);
        vec2 cell = floor(leafUv);
        float h = hash(cell);
        float sheen = (h - 0.5) * 0.065;
        float glint = pow(max(0.0, sin(uTime * 3.1 + h * 48.0 + vUv.x * 16.0)), 22.0);
        col += vec3(1.0, 0.85, 0.32) * isGold * (sheen + glint * 0.28);

        /* 4. Warm Viennese gallery colour grade & gentle framing vignette */
        col *= vec3(1.02, 1.0, 0.94);
        float vig = 1.0 - 0.26 * pow(length((vUv - 0.5) * vec2(1.12, 1.04)), 2.5);
        col *= vig;

        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  return { material, uniforms };
}
