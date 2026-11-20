/* The painted frieze: a post filter for phidias/street.html that renders the three.js world as carved Pentelic marble in shallow relief, painted in a period mineral
   palette over the stone, with raking light, firm shadow in the hollows, a chiselled undercut and bevel where one form passes in front of another, the soft warm
   translucency of marble, and the stone showing through the pigment at ridges and high points.
   At each staging, two uniforms keep the three-step transformation distinct:
     uRelief (0 in the living world -> 1 when pressed flat into the block): flattens depth into a shallow carved slab and deepens the chisel undercuts and marble ridges;
     uBare   (0 in the painted world -> 1 as time takes the paint): sweeps the pigment away from left to right into bare weathered Pentelic marble before the museum photograph. */
export function makeRelief(THREE, o = {}) {
  const uniforms = {
    tScene: { value: o.scene || null },
    tDepth: { value: o.depth || null },
    uPx: { value: new THREE.Vector2(1 / 1100, 1 / 700) },
    uTime: { value: 0 },
    uInvProj: { value: new THREE.Matrix4() },
    uInvView: { value: new THREE.Matrix4() },
    uPxAngle: { value: 0.001 },
    uRelief: { value: 0 },
    uBare: { value: 0 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
    uniform sampler2D tScene, tDepth;
    uniform vec2 uPx;
    uniform float uTime, uPxAngle, uRelief, uBare;
    uniform mat4 uInvProj, uInvView;
    varying vec2 vUv;

    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float noise3(vec3 p){ return mix(noise(p.xz + p.y * 1.7), noise(p.zx * 1.3 - p.y * 2.1 + 31.0), 0.5); }
    vec3 viewPos(vec2 uv){
      float d = texture2D(tDepth, uv).x;
      vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0);
      return v.xyz / v.w;
    }
    /* Convert linear tScene RGB to sRGB [0..1] so all relief math works in perceptual stone and pigment tones, then write straight out */
    vec3 toSrgb(vec3 c){ return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }

    void main(){
      vec2 res = 1.0 / uPx;
      vec2 e1 = uPx * 1.3, e2 = uPx * 2.8, e3 = uPx * 4.5;
      float dc = texture2D(tDepth, vUv).x;
      float far = smoothstep(0.99985, 0.99998, dc);

      vec3 pc = viewPos(vUv);
      vec3 pl = viewPos(vUv - vec2(e1.x, 0.0)), pr = viewPos(vUv + vec2(e1.x, 0.0));
      vec3 pd = viewPos(vUv - vec2(0.0, e1.y)), pu = viewPos(vUv + vec2(0.0, e1.y));
      float dist = max(-pc.z, 0.1);
      float distFade = 1.0 - smoothstep(150.0, 420.0, dist) * 0.75;

      /* Depth silhouette detection: only true depth jumps between distinct overlapping objects (ignores polygon facets on a single surface) */
      float dL = max(-pl.z, 0.1), dR = max(-pr.z, 0.1), dD = max(-pd.z, 0.1), dU = max(-pu.z, 0.1);
      float jumpL = (dL - dist) / dist, jumpR = (dR - dist) / dist, jumpD = (dD - dist) / dist, jumpU = (dU - dist) / dist;
      float maxJumpOut = max(max(jumpL, jumpR), max(jumpD, jumpU)); /* positive when vUv is on the foreground object right inside its silhouette edge */

      /* Raking relief light direction (from upper-left / east across the carved slab) */
      vec2 rakeDir = normalize(vec2(-0.76, 0.65));
      float dLit1 = max(-viewPos(vUv + rakeDir * e2).z, 0.1);
      float dLit2 = max(-viewPos(vUv + rakeDir * e3).z, 0.1);
      float dShad1 = max(-viewPos(vUv - rakeDir * e2).z, 0.1);

      /* Undercut relief shadow: where the current pixel lies on a background surface just behind a closer foreground form */
      float under1 = smoothstep(0.035, 0.18, (dist - dLit1) / dist) * 0.65 + smoothstep(0.04, 0.22, (dist - dLit2) / dist) * 0.35;
      float underAll = smoothstep(0.04, 0.20, (dist - min(min(dL, dR), min(dD, dU))) / dist);
      float undercut = clamp(under1 * 0.8 + underAll * 0.55, 0.0, 1.0) * distFade;

      /* Subtle chiselled marble bevel on the lit outer edge of a foreground form (only at real depth jumps > 5%, never on internal polygon facets) */
      float litEdge = smoothstep(0.055, 0.22, maxJumpOut) * smoothstep(-0.02, 0.08, (dShad1 - dLit1) / dist);
      float fgBevel = litEdge * distFade * (1.0 - far);

      /* Reconstructed 3D surface normal and world position */
      vec3 dx = abs(pr.z - pc.z) < abs(pc.z - pl.z) ? pr - pc : pc - pl;
      vec3 dy = abs(pu.z - pc.z) < abs(pc.z - pd.z) ? pu - pc : pc - pd;
      vec3 nv = normalize(cross(dx, dy));
      vec3 p = (uInvView * vec4(pc, 1.0)).xyz;

      /* Sample scene colour in sRGB and compute local raking relief derivative (models carved drapery flutes, hair locks, ashlar joints) */
      vec3 sc = toSrgb(texture2D(tScene, vUv).rgb);
      vec3 scLit = toSrgb(texture2D(tScene, vUv + rakeDir * e1 * 1.2).rgb);
      vec3 scShad = toSrgb(texture2D(tScene, vUv - rakeDir * e1 * 1.2).rgb);
      vec3 scAvg = (sc * 2.0 + toSrgb(texture2D(tScene, vUv + vec2(e1.x, -e1.y)).rgb) + toSrgb(texture2D(tScene, vUv - vec2(e1.x, -e1.y)).rgb)) * 0.25;

      float lum = dot(sc, vec3(0.299, 0.587, 0.114));
      float lumLit = dot(scLit, vec3(0.299, 0.587, 0.114));
      float lumShad = dot(scShad, vec3(0.299, 0.587, 0.114));

      /* Embossed bas-relief gradient from texture & geometry along the raking light */
      float texSlope = clamp((lumLit - lumShad) * 2.2, -0.55, 0.55);
      float geoSlope = (nv.x * -0.42 + nv.y * 0.34);
      float dRake = texSlope + geoSlope * (0.28 + 0.22 * uRelief);

      /* Marble grain and claw-chisel tool marks, anchored to 3D stone surfaces and the frieze slab */
      vec2 slabUv = vUv * res;
      float g3 = noise3(p * 3.2) * 0.6 + noise3(p * 10.5) * 0.4;
      float gScreen = noise(slabUv * 0.32) * 0.55 + (hash(floor(slabUv * 0.5)) - 0.5) * 0.22;
      float stoneGrain = mix(g3, gScreen, 0.35 + 0.50 * uRelief);
      /* Fine diagonal claw-chisel striations across the dressed marble */
      float chisel = sin(dot(slabUv, vec2(0.82, 0.57)) * 1.4 + stoneGrain * 3.0) * 0.5 + 0.5;
      float chiselTex = (stoneGrain - 0.5) * 0.055 + (chisel - 0.5) * 0.020;

      /* Pentelic marble palette: warm ivory crystal, honey iron-oxide patina/translucency, and deep umber relief hollow */
      vec3 marbleLight  = vec3(0.95, 0.91, 0.83);
      vec3 marbleMid    = vec3(0.84, 0.78, 0.68);
      vec3 marblePatina = vec3(0.74, 0.55, 0.38);
      vec3 marbleHollow = vec3(0.22, 0.17, 0.13);

      /* Separate pigment hue/saturation from lighting so pigment sits as a flat mineral wash over carved stone */
      float maxC = max(scAvg.r, max(scAvg.g, scAvg.b)), minC = min(scAvg.r, min(scAvg.g, scAvg.b));
      float sat = (maxC - minC) / max(maxC, 1e-3);
      float aLum = max(dot(scAvg, vec3(0.299, 0.587, 0.114)), 1e-3);
      vec3 baseHue = clamp(scAvg / aLum * 0.72, 0.0, 1.35);

      /* Carve the lighting into relief planes: raking ridge highlights and firm hollow shadows */
      float reliefTone = clamp(lum + dRake * (0.34 + 0.22 * uRelief) - undercut * 0.42, 0.08, 0.98);
      float steppedTone = mix(reliefTone, floor(reliefTone * 6.0 + 0.5) / 6.0, 0.24 + 0.22 * uRelief);

      /* Pure Pentelic marble relief shaded by steppedTone (with warm honey translucency in the mid-shadows) */
      vec3 carvedStone = mix(marbleHollow, marbleMid, smoothstep(0.08, 0.54, steppedTone));
      carvedStone = mix(carvedStone, marbleLight, smoothstep(0.54, 0.94, steppedTone));
      float sss = smoothstep(0.20, 0.48, steppedTone) * (1.0 - smoothstep(0.48, 0.78, steppedTone));
      carvedStone = mix(carvedStone, marblePatina, sss * 0.28);

      /* Lay the flat mineral pigment over the carved stone:
         - Low-saturation surfaces (white peploi, marble columns, limestone rock, road slabs) stay carved Pentelic stone;
         - Coloured garments, shields, and foliage take rich mineral pigment over the stone shading, letting pale marble show through on the high ridges! */
      float isPainted = smoothstep(0.14, 0.38, sat);
      /* In the living world (uRelief = 0), polychromy is fuller and deeper; in frozen relief (uRelief = 1), the stone shows through more strongly */
      vec3 mineralPigment = baseHue * mix(vec3(0.26, 0.20, 0.16), vec3(1.06, 1.02, 0.95), smoothstep(0.08, 0.88, steppedTone));
      float pLum = dot(mineralPigment, vec3(0.299, 0.587, 0.114));
      mineralPigment = mix(vec3(pLum), mineralPigment, mix(1.24, 0.92, uRelief));

      vec3 col = mix(carvedStone, mineralPigment, isPainted * mix(0.88, 0.70, uRelief));

      /* High ridges of carved folds and chiselled edges let the bare cream Pentelic marble show through the paint */
      float ridgeShow = clamp((smoothstep(0.10, 0.36, dRake) * (0.38 + 0.32 * uRelief) + fgBevel * 0.65 + smoothstep(0.74, 0.95, stoneGrain) * 0.18 * (1.0 + uRelief)), 0.0, 0.85);
      col = mix(col, marbleLight, ridgeShow);

      /* Firm shadow in the carved hollows and undercut channel where one form passes in front of another */
      float hollowDark = clamp(smoothstep(0.06, 0.38, -dRake) * (0.42 + 0.22 * uRelief), 0.0, 0.75);
      col = mix(col, col * vec3(0.46, 0.40, 0.34), hollowDark);
      col = mix(col, marbleHollow, clamp(undercut * (0.68 + 0.22 * uRelief), 0.0, 0.86));

      /* The sky is the frieze's flat Egyptian blue stone ground, dressed with chisel marks and undercut shadow behind the skyline */
      vec3 blueGround = vec3(0.125, 0.275, 0.52) * (1.0 + chiselTex * 1.2);
      blueGround = mix(blueGround, marbleLight, smoothstep(0.76, 0.95, gScreen) * 0.11);
      blueGround = mix(blueGround, vec3(0.05, 0.11, 0.22), clamp(undercut * 0.88, 0.0, 0.88));
      col = mix(col, blueGround, far);

      /* Step 2 at each staging (uRelief > 0): flatten into a framed architectural frieze block with upper crown and lower ledge shadow */
      if (uRelief > 0.01) {
        float frameShadow = smoothstep(0.045, 0.0, vUv.y) * 0.48 + smoothstep(0.955, 1.0, vUv.y) * 0.48;
        col *= 1.0 - frameShadow * uRelief;
      }

      /* Step 3 at each staging (uBare 0 -> 1): pigment drains away from left to right into bare weathered Pentelic marble */
      if (uBare > 0.001) {
        float wave = clamp((uBare * 1.32 - vUv.x * 0.32 + (gScreen - 0.5) * 0.08) / 0.68, 0.0, 1.0);
        float bareK = wave * wave * (3.0 - 2.0 * wave);
        float bTone = clamp(0.66 + dRake * 0.82 + (lum - 0.5) * 0.42 - undercut * 0.55, 0.10, 0.98);
        vec3 bareStone = mix(marbleHollow, marbleMid, smoothstep(0.10, 0.56, bTone));
        bareStone = mix(bareStone, marbleLight, smoothstep(0.56, 0.93, bTone));
        /* Warm orange-ochre iron patina in the carved folds and hollows of the surviving blocks (as on the East V peplos block) */
        float patina = smoothstep(0.24, 0.58, hollowDark + undercut * 0.5) * (1.0 - smoothstep(0.68, 0.96, hollowDark)) * (0.45 + 0.55 * gScreen);
        bareStone = mix(bareStone, marblePatina * 0.95, patina * 0.58);
        col = mix(col, bareStone, bareK);
      }

      col *= 1.0 + chiselTex;
      col *= 1.0 - 0.16 * pow(length(vUv - 0.5) * 1.2, 2.6);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`
  });
  material.extensions = { derivatives: true };
  return {
    material,
    uniforms,
    update(camera, time, widthPx, heightPx, relief = 0, bare = 0) {
      uniforms.uTime.value = time;
      uniforms.uPx.value.set(1 / widthPx, 1 / heightPx);
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      uniforms.uInvView.value.copy(camera.matrixWorld);
      uniforms.uPxAngle.value = 2 * Math.tan(camera.fov * Math.PI / 360) / heightPx;
      uniforms.uRelief.value = relief;
      uniforms.uBare.value = bare;
    }
  };
}
