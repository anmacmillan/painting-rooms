import { LEVELS, loadScores, loadBook, getStoredAt, setStoredAt } from './shared.js';

export { LEVELS, loadScores, loadBook, getStoredAt, setStoredAt };

export function parseYear(y) {
  const s = String(y || '').trim();
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  return /BC/i.test(s) ? -n : n;
}

/* Kuniyoshi (built & live on main) + Hokusai (coming soon), sorted chronologically with LEVELS. */
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

/* The two older side rooms given their own miniature garden islets on the globe. */
export const SIDE_ISLETS = [
  {
    key: 'rousseau',
    href: 'rousseau/',
    img: 'rousseau/painting.jpg',
    place: 'Jardin des Plantes',
    year: '1908',
    title: 'Five Monkeys',
    by: 'Henri Rousseau',
    era: 'Naïve Jungle · Side Room',
    sideRoom: true,
    swatch: '#2a7b4c',
    /* Placed gently south-west of Paris in our storybook Atlantic/France bay */
    globeLL: [-38, 8],
  },
  {
    key: 'seurat',
    href: 'seurat/',
    img: 'seurat/painting.jpg',
    place: 'La Grande Jatte',
    year: '1884',
    title: 'Sunday on the Island',
    by: 'Georges Seurat',
    era: 'Pointillism · Side Room',
    sideRoom: true,
    swatch: '#6fa86b',
    /* Placed gently west of the Seine in the storybook Channel bay */
    globeLL: [-56, 20],
  },
];

/* Curated storybook spherical coordinates [lonDeg, latDeg] on our friendly miniature globe.
   Europe spans roughly -72°..+68° longitude and -28°..+54° latitude (giving 19+ stops
   generous breathing room like a storybook archipelago), while Japan sits proudly on the
   eastern hemisphere around +142°..+166° longitude so spinning east glides over the Silk Sea
   straight to Edo without endless empty ocean. */
export const STORYBOOK_POS = {
  phidias:    [56, -24],
  pompeii:    [30, -20],
  florence:   [14,  -2],
  caravaggio: [10, -24],
  rubens:     [-16, 28],
  vermeer:    [-6,  42],
  piranesi:   [26, -6],
  hokusai:    [144,  8],
  turner:     [-42, 30],
  kuniyoshi:  [164, 24],
  alice:      [-56, 44],
  monet:      [-26, 10],
  sargent:    [-68, 30],
  vangogh:    [-10, -14],
  munch:      [24,  50],
  klimt:      [44,  22],
};

/* Rich painter-manner visual specification for each island diorama and timeline chip. */
export const ISLAND_DNA = {
  phidias:    { era: 'Classical Frieze',     swatch: '#2e6ea6', base: '#2c6aa0', top: '#eef2f5', accent: '#d8b25c', kind: 'parthenon' },
  pompeii:    { era: 'Roman Fresco',         swatch: '#b8422b', base: '#9e3824', top: '#d97a54', accent: '#f0b84c', kind: 'vesuvius' },
  florence:   { era: 'Early Renaissance',    swatch: '#264b8c', base: '#21427d', top: '#d6b668', accent: '#f2ca52', kind: 'ponte' },
  caravaggio: { era: 'Baroque Chiaroscuro',  swatch: '#2b1e16', base: '#1a120d', top: '#3a271b', accent: '#f6bc4c', kind: 'lantern' },
  rubens:     { era: 'Flemish Baroque',      swatch: '#a63429', base: '#6e2820', top: '#d6a468', accent: '#e5533c', kind: 'spire' },
  vermeer:    { era: 'Dutch Golden Age',     swatch: '#2a5f96', base: '#215080', top: '#e8eef2', accent: '#e8c448', kind: 'delft' },
  piranesi:   { era: 'Roman Etching',        swatch: '#5a4e41', base: '#3d342c', top: '#e2d7c2', accent: '#8c775c', kind: 'carceri' },
  hokusai:    { era: 'Ukiyo-e Woodblock',    swatch: '#1f4e82', base: '#19416e', top: '#e8dfc8', accent: '#d64532', kind: 'wave' },
  turner:     { era: 'Romantic Sublime',     swatch: '#d68a2c', base: '#8c5622', top: '#f0cb78', accent: '#f7a236', kind: 'viaduct' },
  kuniyoshi:  { era: 'Edo Woodblock',        swatch: '#c83428', base: '#1b2238', top: '#313a54', accent: '#e63c28', kind: 'torii' },
  alice:      { era: 'Victorian Engraving',  swatch: '#242220', base: '#181716', top: '#f5f2ea', accent: '#d9ab32', kind: 'alice' },
  monet:      { era: 'Impressionism',        swatch: '#5fa49c', base: '#4c8f96', top: '#b8dfd6', accent: '#f08e7a', kind: 'lilies' },
  sargent:    { era: 'Twilight Aesthetic',   swatch: '#463e6e', base: '#29294d', top: '#435e4e', accent: '#ffad42', kind: 'lanterns' },
  vangogh:    { era: 'Post-Impressionism',   swatch: '#1c448c', base: '#143069', top: '#2b5ca6', accent: '#f7cf46', kind: 'starry' },
  munch:      { era: 'Symbolism',            swatch: '#cf482c', base: '#3a2648', top: '#c4462c', accent: '#f29f42', kind: 'fjord' },
  klimt:      { era: 'Vienna Secession',     swatch: '#c9982a', base: '#8f691b', top: '#f2d46b', accent: '#ffe68c', kind: 'gold' },
  rousseau:   { era: 'Naïve Jungle',         swatch: '#2a7b4c', base: '#1b4f32', top: '#4b9458', accent: '#e86842', kind: 'jungle' },
  seurat:     { era: 'Pointillism',          swatch: '#6fa86b', base: '#518762', top: '#cde09a', accent: '#e85d4a', kind: 'parasol' },
};

export function getGlobeStops() {
  const live = LEVELS.map((l, idx) => ({
    ...l,
    realIdx: idx,
    yrNum: parseYear(l.year),
    globeLL: STORYBOOK_POS[l.key] || [0, 0],
    dna: ISLAND_DNA[l.key],
  }));
  const extras = EXTRA_STOPS.map(e => ({
    ...e,
    realIdx: -1,
    yrNum: parseYear(e.year),
    globeLL: STORYBOOK_POS[e.key] || [155, 16],
    dna: ISLAND_DNA[e.key],
  }));
  return [...live, ...extras].sort((a, b) => a.yrNum - b.yrNum);
}

/* Convert storybook [lonDeg, latDeg] to unit 3D vector on sphere. */
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
