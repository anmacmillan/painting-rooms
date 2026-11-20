import { LEVELS, loadScores } from '../common/score.js';

export { LEVELS, loadScores };

export const SIDE_ROOMS = [
  { href: '../rousseau/', img: '../rousseau/painting.jpg', name: 'Five Monkeys', place: 'Jardin des Plantes' },
  { href: '../seurat/', img: '../seurat/painting.jpg', name: 'Sunday on the Island', place: 'La Grande Jatte' },
];

/* Forthcoming stops from NOTES.md, used ONLY when the "21-stop preview" toggle is on. */
export const FUTURE_STOPS = [
  { key: 'giotto', at: [11.88, 45.41], place: 'Padua', year: '1305', title: 'The Scrovegni Chapel', by: 'Giotto', paintings: 3, coin: 'ducats', preview: true },
  { key: 'vatican', at: [12.454, 41.903], place: 'Vatican', year: '1510', title: 'The School of Athens', by: 'Raphael & Michelangelo', paintings: 4, coin: 'scudi', preview: true },
  { key: 'holbein', at: [-0.125, 51.507], place: 'London', year: '1533', title: 'The Ambassadors', by: 'Holbein', paintings: 2, coin: 'angels', preview: true },
  { key: 'hogarth', at: [-0.095, 51.515], place: 'London', year: '1751', title: 'Gin Lane & Beer Street', by: 'Hogarth', paintings: 3, coin: 'guineas', preview: true },
  { key: 'hokusai', at: [139.65, 35.62], place: 'Edo', year: '1831', title: 'The Great Wave', by: 'Hokusai', paintings: 3, coin: 'ryō', preview: true, japan: true },
  { key: 'kuniyoshi', at: [139.78, 35.71], place: 'Edo', year: '1844', title: 'Takiyasha & the Skeleton', by: 'Kuniyoshi', paintings: 3, coin: 'ryō', preview: true, japan: true },
  { key: 'rousseau_lvl', at: [2.36, 48.84], place: 'Paris', year: '1908', title: 'The Glasshouse Jungle', by: 'Rousseau', paintings: 3, coin: 'francs', preview: true },
];

export function parseYear(y) {
  const s = String(y || '').trim();
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
  return /BC/i.test(s) ? -n : n;
}

export function getStops(includePreview) {
  const base = LEVELS.map((l, idx) => ({ ...l, realIdx: idx, yrNum: parseYear(l.year) }));
  if (!includePreview) return base;
  const extras = FUTURE_STOPS.map(f => ({ ...f, realIdx: -1, yrNum: parseYear(f.year) }));
  return [...base, ...extras].sort((a, b) => a.yrNum - b.yrNum);
}

export function loadBook() {
  try {
    return JSON.parse(localStorage.getItem('paintingRooms.book')) || {};
  } catch (e) {
    return {};
  }
}

export function getStoredAt() {
  try {
    const raw = localStorage.getItem('paintingRooms.at');
    if (raw === null) return -1;
    const v = Number(raw);
    return Number.isFinite(v) ? v : -1;
  } catch (e) {
    return -1;
  }
}

export function setStoredAt(realIdx) {
  if (realIdx < 0) return;
  try {
    localStorage.setItem('paintingRooms.at', String(realIdx));
  } catch (e) {
    /* private window */
  }
}

/* Smooth Atlantic-to-Edo projection, matching map-ideas/eurasia.json exactly. */
const W_LON = -14.0, E_LON = 150.0, S_LAT = 14.0, N_LAT = 64.0;
export const EURASIA_W = 2200.0;
export const EURASIA_H = 1260.0;

function sp(u) {
  if (u > 20) return u;
  if (u < -20) return 0;
  return Math.log1p(Math.exp(u));
}

function rawX(lon) {
  return 5.2 * lon + 25.5 * (lon - 4.5 * sp((lon - 29.0) / 4.5)) + 16.0 * (4.0 * sp((lon - 125.0) / 4.0));
}

const X0 = rawX(W_LON), X1 = rawX(E_LON);
const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const Y0 = merc(S_LAT), Y1 = merc(N_LAT);

export function projEurasia([lon, lat]) {
  const x = (rawX(lon) - X0) / (X1 - X0) * EURASIA_W;
  const y = (1 - (merc(lat) - Y0) / (Y1 - Y0)) * EURASIA_H;
  return [x, y];
}

/* Artistic era visual DNA for each stop: sky, ground, accent, ink, border motif, and landmark type. */
export const ERA_STYLES = {
  phidias:     { era: 'Classical Antiquity', sky: ['#2e6ea6', '#89bad6'], ground: '#d9b584', accent: '#c04b28', ink: '#251a12', land: 'parthenon',   wash: '#d9b584' },
  pompeii:     { era: 'Roman Fresco',        sky: ['#b0402a', '#e39b66'], ground: '#c45b3e', accent: '#e7b54a', ink: '#29150f', land: 'vesuvius',    wash: '#d89b7e' },
  florence:    { era: 'Early Renaissance',   sky: ['#1f3e78', '#5c7db8'], ground: '#c7a458', accent: '#e5ba4c', ink: '#1e1c26', land: 'ponte',       wash: '#cbb57f' },
  giotto:      { era: 'Proto-Renaissance',   sky: ['#1e3a7a', '#4d6ea8'], ground: '#b99c62', accent: '#e5ba4c', ink: '#1e1c26', land: 'chapel',      wash: '#cbb57f' },
  vatican:     { era: 'High Renaissance',    sky: ['#3d6596', '#b8cde0'], ground: '#d5c199', accent: '#c98836', ink: '#261d14', land: 'dome',        wash: '#d9c49e' },
  holbein:     { era: 'Tudor Court',         sky: ['#2b4b43', '#7a9685'], ground: '#8c694a', accent: '#d8a642', ink: '#1c1814', land: 'tudor',       wash: '#a8b8a4' },
  caravaggio:  { era: 'Baroque Chiaroscuro', sky: ['#17110d', '#3e2918'], ground: '#2a1d14', accent: '#e6a844', ink: '#120d0a', land: 'lantern',     wash: '#a78d6e' },
  rubens:      { era: 'Flemish Baroque',     sky: ['#3e4f68', '#c68a52'], ground: '#7a593a', accent: '#d64532', ink: '#211610', land: 'antwerp',     wash: '#c8a77e' },
  vermeer:     { era: 'Dutch Golden Age',    sky: ['#4b79a1', '#d6e3ea'], ground: '#94866b', accent: '#235789', ink: '#1b222a', land: 'delft',       wash: '#c2ccba' },
  hogarth:     { era: 'Georgian Print',      sky: ['#e6decb', '#f4eedf'], ground: '#c9bfa8', accent: '#363028', ink: '#1b1815', land: 'engraving',   wash: '#d7cebb' },
  piranesi:    { era: 'Roman Etching',       sky: ['#d8ccb4', '#f0e6d2'], ground: '#9e8f76', accent: '#5a432d', ink: '#1b1512', land: 'carceri',     wash: '#d5c7ad' },
  hokusai:     { era: 'Ukiyo-e Woodblock',   sky: ['#e9dfc5', '#d5c8a4'], ground: '#224b78', accent: '#c83e2b', ink: '#16202e', land: 'fuji_wave',   wash: '#c9d7cf' },
  turner:      { era: 'Romantic Sublime',    sky: ['#786352', '#e8ba6c'], ground: '#8c6c46', accent: '#e68c2e', ink: '#2c1f14', land: 'viaduct',     wash: '#dec28d' },
  kuniyoshi:   { era: 'Edo Woodblock',       sky: ['#1e2538', '#4b3b4e'], ground: '#303b48', accent: '#d43d2a', ink: '#12151f', land: 'torii_night', wash: '#c4b8c2' },
  alice:       { era: 'Victorian Engraving', sky: ['#f4eedf', '#f8f4e8'], ground: '#dfd8c7', accent: '#d1a226', ink: '#1c1a18', land: 'wonderland',  wash: '#e5dfd0' },
  monet:       { era: 'Impressionism',       sky: ['#82b8d9', '#f2d9b8'], ground: '#5c938c', accent: '#e67855', ink: '#1d3240', land: 'seine',       wash: '#b9d1c2' },
  sargent:     { era: 'Twilight Aesthetic',  sky: ['#29335c', '#695c84'], ground: '#355446', accent: '#f7a440', ink: '#171a2b', land: 'lanterns',    wash: '#b7b9cb' },
  vangogh:     { era: 'Post-Impressionism',  sky: ['#132d63', '#2d5ea8'], ground: '#2d4745', accent: '#f4c842', ink: '#101d3b', land: 'cypress',     wash: '#aec4d6' },
  munch:       { era: 'Symbolism',           sky: ['#c94c2e', '#f0a64d'], ground: '#3c2b4d', accent: '#e85b3a', ink: '#211426', land: 'fjord',       wash: '#d8b4a0' },
  klimt:       { era: 'Vienna Secession',    sky: ['#b08328', '#edd071'], ground: '#876424', accent: '#f5d76e', ink: '#2a1f0c', land: 'secession',   wash: '#dfc67a' },
  rousseau_lvl:{ era: 'Naïve Jungle',        sky: ['#2a5c46', '#7ba872'], ground: '#1e4532', accent: '#e06040', ink: '#12261c', land: 'jungle',      wash: '#a7c4a0' },
};

export function styleOf(stop) {
  return ERA_STYLES[stop.key] || {
    era: 'Painting Room',
    sky: ['#6b859c', '#d5ccb8'],
    ground: '#c7b590',
    accent: '#c88c32',
    ink: '#221e19',
    land: 'arch',
    wash: '#d9cca8',
  };
}

export function preloadThumbnails(stops) {
  const imgs = new Map();
  for (const s of stops) {
    if (!s.img || imgs.has(s.key)) continue;
    const im = new Image();
    im.src = '../' + s.img;
    imgs.set(s.key, im);
  }
  return imgs;
}
