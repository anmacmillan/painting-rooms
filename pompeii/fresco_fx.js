/* Roman wall painting post-process (Pompeii Fourth-Style fresco manner):
   Turns the rendered 3D frame into mineral pigment absorbed into trowelled lime plaster (intonaco):
     1. Warm lime-plaster ground with directional trowel sweeps, mineral sand grain and faint hairline craze.
     2. Soft mineral pigment modelling: shadows warm toward Roman burnt umber instead of digital grey/black;
        broad architectural surfaces flatten subtly into velvety fresco fields while close figures retain
        soft classical modelling (after Terentius Neo, MANN 9058, and the Bread Sale, MANN 9071).
     3. Delicate burnt-umber painted contour lines (sinopia / brushwork ink) on architectural and figure edges
        via inverse-depth k2 detection (sky/cloud pixels at depth ~1.0 stay contour-free).
     4. A slender painted Fourth-Style cinnabar-and-ochre fillet border framing the viewport like a panel
        on a Pompeian wall (fades smoothly during melts into the real photographs). */
export function makeFrescoFX(THREE, o = {}) {
  const uniforms = {
    tScene: { value: o.scene || null },
    tDepth: { value: o.depth || null },
    uPx: { value: new THREE.Vector2(1 / 1133, 1 / 744) },
    uInvProj: { value: new THREE.Matrix4() },
    uPxAngle: { value: 0.0014 },
    uAsh: { value: 0 },
    uNight: { value: 0 },
    uFrame: { value: 1 },
    uWet: { value: 1 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
    uniform sampler2D tScene, tDepth;
    uniform vec2 uPx;
    uniform mat4 uInvProj;
    uniform float uPxAngle, uAsh, uNight, uFrame, uWet;
    varying vec2 vUv;

    float hash(vec2 p){
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 34.5);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p){
      return noise(p) * 0.55 + noise(p * 2.13 + 11.7) * 0.30 + noise(p * 4.7 - 5.3) * 0.15;
    }
    vec3 toSrgb(vec3 c){ return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }

    float linZ(float d, float p22, float p23, float p32, float p33){
      float ndc = d * 2.0 - 1.0;
      return max(-(p22 * ndc + p23) / (p32 * ndc + p33), 0.1);
    }

    /* Warm mineral pigment balance: lime-white highlights, burnt-umber shadows, velvety fresco saturation */
    vec3 mineralGrade(vec3 c, float farK, float dist){
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      /* Gentle painterly flattening on walls & sky, softer on near figures (<14 m) */
      float nearFig = 1.0 - smoothstep(4.0, 18.0, dist);
      float stepL = floor(l * 7.5 + 0.5) / 7.5;
      float targetL = mix(l, stepL, mix(0.28, 0.12, nearFig) * (1.0 - uNight * 0.5));
      vec3 flatC = c * (targetL / max(l, 0.004));

      /* Lift harsh digital black shadows into warm Roman umber / lime plaster */
      vec3 shadowTint = mix(vec3(0.26, 0.18, 0.13), vec3(0.11, 0.09, 0.08), uNight);
      vec3 limeTint = mix(vec3(0.95, 0.90, 0.79), vec3(0.55, 0.48, 0.40), uNight * 0.75);
      float shMask = 1.0 - smoothstep(0.04, 0.34, l);
      flatC = mix(flatC, max(flatC, shadowTint * 0.85 + flatC * 0.5), shMask * (1.0 - farK * 0.5));

      /* Gently infuse warm lime plaster undertone and keep earth/cinnabar/ochre/Egyptian-blue lively */
      float sat = max(flatC.r, max(flatC.g, flatC.b)) - min(flatC.r, min(flatC.g, flatC.b));
      vec3 muted = mix(vec3(targetL), flatC, mix(1.08, 0.92, uAsh * 0.7));
      muted = mix(muted, muted * limeTint * 1.06, 0.24 * (1.0 - sat * 0.4));
      return clamp(muted, 0.0, 1.0);
    }

    void main(){
      vec2 res = 1.0 / uPx;
      float p22 = uInvProj[2][2], p23 = uInvProj[2][3], p32 = uInvProj[3][2], p33 = uInvProj[3][3];
      float dc = texture2D(tDepth, vUv).x;
      float farK = smoothstep(0.9997, 0.99995, dc);
      float dist = linZ(dc, p22, p23, p32, p33);

      /* Sample scene with subtle 5-tap fresco brushwork softening on distant flat planes */
      vec3 c0 = toSrgb(texture2D(tScene, vUv).rgb);
      vec2 off = uPx * 1.25;
      vec3 cL = toSrgb(texture2D(tScene, vUv - vec2(off.x, 0.0)).rgb);
      vec3 cR = toSrgb(texture2D(tScene, vUv + vec2(off.x, 0.0)).rgb);
      vec3 cD = toSrgb(texture2D(tScene, vUv - vec2(0.0, off.y)).rgb);
      vec3 cU = toSrgb(texture2D(tScene, vUv + vec2(0.0, off.y)).rgb);

      /* Depth-based inverse-z curvature (k2) for delicate burnt-umber painted contours */
      float dL = linZ(texture2D(tDepth, vUv - vec2(off.x, 0.0)).x, p22, p23, p32, p33);
      float dR = linZ(texture2D(tDepth, vUv + vec2(off.x, 0.0)).x, p22, p23, p32, p33);
      float dD = linZ(texture2D(tDepth, vUv - vec2(0.0, off.y)).x, p22, p23, p32, p33);
      float dU = linZ(texture2D(tDepth, vUv + vec2(0.0, off.y)).x, p22, p23, p32, p33);

      float wc = 1.0 / dist, wl = 1.0 / dL, wr = 1.0 / dR, wd = 1.0 / dD, wu = 1.0 / dU;
      float k2 = (abs(wl + wr - 2.0 * wc) + abs(wd + wu - 2.0 * wc)) / wc / (uPxAngle * 1.25);

      /* Smooth brush blend only where depth is continuous (never blurs across silhouettes) */
      float edgeMask = smoothstep(1.2, 3.2, k2);
      vec3 softC = (c0 * 2.0 + cL + cR + cD + cU) / 6.0;
      vec3 col = mix(softC, c0, max(edgeMask, 0.45));

      /* Apply fresco mineral pigment grade */
      col = mineralGrade(col, farK, dist);

      /* Colour edge accent (subtle sinopia brush line between flat colour fields) */
      float cGrad = length(cR - cL) + length(cU - cD);
      float paintLine = smoothstep(0.28, 0.65, cGrad) * 0.22 * (1.0 - farK * 0.7);
      float geoLine = smoothstep(2.4, 5.8, k2) * (1.0 - farK) * mix(0.46, 0.24, smoothstep(25.0, 95.0, dist));
      float contour = clamp(max(geoLine, paintLine), 0.0, 0.58);
      vec3 umberInk = mix(vec3(0.22, 0.13, 0.09), vec3(0.08, 0.06, 0.05), uNight);
      col = mix(col, umberInk, contour);

      /* Continuous trowelled lime-plaster ground (intonaco) across the whole wall */
      vec2 sp = vUv * res;
      float sweep = fbm(vec2(sp.x * 0.008, sp.y * 0.022));
      float sand = noise(sp * 0.32);
      float patchMottle = fbm(sp * 0.0045 + vec2(3.1, 7.4));
      /* Very fine hairline plaster craze (softened on open sky so it reads as smooth mineral wash) */
      float cr = abs(noise(sp * 0.018 + vec2(sweep * 1.4)) - 0.5);
      float craze = (1.0 - smoothstep(0.0, 0.010, cr)) * 0.048 * (1.0 - farK * 0.72);

      vec3 plasterLight = mix(vec3(0.91, 0.85, 0.74), vec3(0.32, 0.27, 0.23), uNight * 0.8);
      col *= (0.93 + 0.11 * sweep + 0.05 * (sand - 0.5));
      col = mix(col, plasterLight, (0.04 + 0.055 * patchMottle) * (1.0 - uNight * 0.55));
      col = mix(col, umberInk * 1.15, craze * (1.0 - uNight * 0.5));

      /* Subtle warm fresco edge vignette + slender Pompeian Fourth-Style panel border fillet */
      vec2 pv = vUv * res;
      float ex = min(pv.x, res.x - pv.x);
      float ey = min(pv.y, res.y - pv.y);
      float ed = min(ex, ey);
      float vig = smoothstep(0.0, 110.0, ed);
      col = mix(col * vec3(0.84, 0.78, 0.72), col, 0.65 + 0.35 * vig);

      if (uFrame > 0.01) {
        /* Outer cinnabar margin (0..6 px), cream lime line (7..9 px), ochre inner rule (12..13.5 px) */
        float bandRed = 1.0 - smoothstep(5.0, 6.8, ed);
        float lineCream = smoothstep(6.2, 7.2, ed) * (1.0 - smoothstep(8.6, 9.6, ed));
        float lineGold = smoothstep(12.0, 12.8, ed) * (1.0 - smoothstep(13.8, 14.6, ed));
        vec3 redCol = mix(vec3(0.58, 0.19, 0.14), vec3(0.24, 0.10, 0.08), uNight);
        vec3 creamCol = mix(vec3(0.92, 0.86, 0.74), vec3(0.45, 0.39, 0.32), uNight);
        vec3 goldCol = mix(vec3(0.82, 0.63, 0.26), vec3(0.42, 0.32, 0.16), uNight);
        col = mix(col, redCol, bandRed * 0.78 * uFrame);
        col = mix(col, creamCol, lineCream * 0.82 * uFrame);
        col = mix(col, goldCol, lineGold * 0.68 * uFrame);
      }

      gl_FragColor = vec4(col, 1.0);
    }`
  });

  function setSize(w, h, camera) {
    uniforms.uPx.value.set(1 / Math.max(1, w), 1 / Math.max(1, h));
    if (camera) {
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      uniforms.uPxAngle.value = (2 * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, h);
    }
  }
  return { material, uniforms, setSize };
}
