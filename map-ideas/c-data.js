import { LEVELS, loadScores, loadBook, getStoredAt, setStoredAt } from './shared.js';

export { LEVELS, loadScores, loadBook, getStoredAt, setStoredAt };

export function parseYear(y) {
  const s = String(y || '').trim();
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  return /BC/i.test(s) ? -n : n;
}

/* Kuniyoshi (live on main) + Hokusai (coming soon), at exact Edo coordinates. */
const EXTRA_STOPS = [
  {
    key: 'hokusai',
    at: [139.65, 35.62],
    href: '',
    place: 'Edo',
    year: '1831',
    title: 'The Great Wave',
    by: 'Hokusai',
    img: '',
    paintings: 3,
    coin: 'ryō',
    comingSoon: true,
    japan: true,
  },
  {
    key: 'kuniyoshi',
    at: [139.78, 35.71],
    href: 'kuniyoshi/street.html',
    place: 'Edo',
    year: '1844',
    title: 'Takiyasha & the Skeleton',
    by: 'Kuniyoshi',
    img: 'kuniyoshi/images/takiyasha.jpg',
    paintings: 3,
    coin: 'ryō',
    japan: true,
  },
];

/* The two older side rooms at their real Paris coordinates. */
export const SIDE_ISLETS = [
  {
    key: 'rousseau',
    at: [2.36, 48.84],
    href: 'rousseau/',
    img: 'rousseau/painting.jpg',
    place: 'Jardin des Plantes',
    year: '1908',
    title: 'Five Monkeys',
    by: 'Henri Rousseau',
    era: 'Naïve Jungle · Side Room',
    sideRoom: true,
    swatch: '#2a7b4c',
  },
  {
    key: 'seurat',
    at: [2.27, 48.90],
    href: 'seurat/',
    img: 'seurat/painting.jpg',
    place: 'La Grande Jatte',
    year: '1884',
    title: 'Sunday on the Island',
    by: 'Georges Seurat',
    era: 'Pointillism · Side Room',
    sideRoom: true,
    swatch: '#6fa86b',
  },
];

/* Subtle local stem fan-out offsets [dLonDeg, dLatDeg] in warped globe degrees ONLY for
   shared-city / tight-cluster stops so their true pin stays on the exact real city while
   the miniature diorama plinths never collide and the real coastlines breathe around them. */
export const CLUSTER_FAN = {
  sargent:    [-5.8,  2.2],
  alice:      [-0.4,  5.6],
  turner:     [ 4.2, -2.4],
  vermeer:    [-0.4,  4.2],
  rubens:     [ 1.6, -2.6],
  monet:      [-5.2,  1.4],
  seurat:     [ 0.2, -3.6],
  rousseau:   [ 4.8, -1.6],
  caravaggio: [-4.2, -2.6],
  piranesi:   [ 4.0,  2.4],
  hokusai:    [-4.6, -2.6],
  kuniyoshi:  [ 3.6,  2.4],
};

/* Rich painter-manner visual specification for each sculptural diorama and timeline chip. */
export const ISLAND_DNA = {
  phidias:    { era: 'Classical Frieze',     swatch: '#2e6ea6', base: '#2c6aa0', top: '#eef2f5', accent: '#d8b25c', kind: 'parthenon' },
  pompeii:    { era: 'Roman Fresco',         swatch: '#b8422b', base: '#9e3824', top: '#d97a54', accent: '#f0b84c', kind: 'vesuvius' },
  florence:   { era: 'Early Renaissance',    swatch: '#264b8c', base: '#21427d', top: '#d6b668', accent: '#f2ca52', kind: 'ponte' },
  caravaggio: { era: 'Baroque Chiaroscuro',  swatch: '#2b1e16', base: '#1a120d', top: '#2b1d14', accent: '#f6bc4c', kind: 'lantern' },
  rubens:     { era: 'Flemish Baroque',      swatch: '#a63429', base: '#78261e', top: '#d6a468', accent: '#e5533c', kind: 'spire' },
  vermeer:    { era: 'Dutch Golden Age',     swatch: '#2a5f96', base: '#215080', top: '#e8eef2', accent: '#e8c448', kind: 'delft' },
  piranesi:   { era: 'Roman Etching',        swatch: '#4a4138', base: '#342c25', top: '#e2d7c2', accent: '#8c775c', kind: 'carceri' },
  hokusai:    { era: 'Ukiyo-e Woodblock',    swatch: '#1f4e82', base: '#19416e', top: '#e8dfc8', accent: '#d64532', kind: 'wave' },
  turner:     { era: 'Romantic Sublime',     swatch: '#d68a2c', base: '#8c5622', top: '#f0cb78', accent: '#f7a236', kind: 'viaduct' },
  kuniyoshi:  { era: 'Edo Woodblock',        swatch: '#c83428', base: '#1b2238', top: '#2b344d', accent: '#e63c28', kind: 'torii' },
  alice:      { era: 'Victorian Engraving',  swatch: '#242220', base: '#181716', top: '#f5f2ea', accent: '#e0b034', kind: 'alice' },
  monet:      { era: 'Impressionism',        swatch: '#5fa49c', base: '#4c8f96', top: '#b8dfd6', accent: '#f08e7a', kind: 'lilies' },
  sargent:    { era: 'Twilight Aesthetic',   swatch: '#463e6e', base: '#26264a', top: '#3c5848', accent: '#ffad42', kind: 'lanterns' },
  vangogh:    { era: 'Post-Impressionism',   swatch: '#1c448c', base: '#143069', top: '#255299', accent: '#f7cf46', kind: 'starry' },
  munch:      { era: 'Symbolism',            swatch: '#cf482c', base: '#3a2648', top: '#c4462c', accent: '#f29f42', kind: 'fjord' },
  klimt:      { era: 'Vienna Secession',     swatch: '#c9982a', base: '#8f691b', top: '#f2d46b', accent: '#ffe68c', kind: 'gold' },
  rousseau:   { era: 'Naïve Jungle',         swatch: '#2a7b4c', base: '#1b4f32', top: '#4b9458', accent: '#e86842', kind: 'jungle' },
  seurat:     { era: 'Pointillism',          swatch: '#6fa86b', base: '#518762', top: '#cde09a', accent: '#e85d4a', kind: 'parasol' },
};

/* Load warp_lut.json and produce exact [wLon, wLat] matching globe_earth.png. */
export async function loadWarp() {
  const lut = await fetch('./warp_lut.json').then(r => r.json());
  const interp = (val, lo, hi, arr) => {
    const t = Math.max(0, Math.min(1, (val - lo) / (hi - lo))) * (arr.length - 1);
    const i = Math.floor(t);
    if (i >= arr.length - 1) return arr[arr.length - 1];
    const f = t - i;
    return arr[i] * (1 - f) + arr[i + 1] * f;
  };
  return ([lon, lat]) => [
    interp(lon, -180, 180, lut.lonLut),
    interp(lat, -90, 90, lut.latLut),
  ];
}

export function getGlobeStops(warpFn) {
  const attach = (s, realIdx) => {
    const pinLL = warpFn(s.at);
    const fan = CLUSTER_FAN[s.key] || [0, 0];
    const globeLL = [pinLL[0] + fan[0], pinLL[1] + fan[1]];
    return { ...s, realIdx, yrNum: parseYear(s.year), pinLL, globeLL, dna: ISLAND_DNA[s.key] };
  };
  const live = LEVELS.map((l, idx) => attach(l, idx));
  const extras = EXTRA_STOPS.map(e => attach(e, -1));
  const main = [...live, ...extras].sort((a, b) => a.yrNum - b.yrNum);
  const sides = SIDE_ISLETS.map(s => attach(s, -1));
  return { main, sides };
}

/* Convert warped [lonDeg, latDeg] to 3D vector on sphere matching Three.js SphereGeometry UV. */
export function llToVec3(lonDeg, latDeg, radius = 1) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const cl = Math.cos(lat);
  return [
    radius * cl * Math.sin(lon),
    radius * Math.sin(lat),
    radius * cl * Math.cos(lon),
  ];
}
