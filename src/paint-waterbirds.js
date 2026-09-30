// Waterbirds and shorebirds with different necks, bills, legs, and plumage.
import { eye, line, oval, shape } from './paint-shapes.js';
const BIRDS = {
  nightHeron: { body: '#d5d9dc', wing: '#879ca9', head: '#263944', neck: 0.15, bill: '#414b45', redEye: true },
  woodDuck: { body: '#ac7351', wing: '#446875', head: '#3b816b', neck: 0.13, duck: true, crest: true, redEye: true },
  egret: { body: '#fffef2', wing: '#e5eada', head: '#fffef2', neck: 0.46, bill: '#e5b647', longLegs: true },
  pelican: { body: '#8d8b7e', wing: '#6e756e', head: '#ece1af', neck: 0.26, pouch: true, bill: '#dda775' },
  gull: { body: '#f4f5ed', wing: '#adb9c4', head: '#303944', neck: 0.15, bill: '#a9514e' },
  tern: { body: '#f9faf5', wing: '#bec8cc', head: '#f9faf5', neck: 0.12, cap: '#273839', bill: '#edc957', fork: true },
  avocet: { body: '#f7eee1', wing: '#303a3c', head: '#cda575', neck: 0.35, curved: true, longLegs: true },
  plover: { body: '#d1c8b3', wing: '#b7ae98', head: '#ded6c3', neck: 0.1, bands: 1, bill: '#eeb763' },
  killdeer: { body: '#e9e2c9', wing: '#9b8d71', head: '#a39677', neck: 0.1, bands: 2 },
  snowGoose: { body: '#fafaf5', wing: '#e9e9e2', head: '#fafaf5', neck: 0.2, bill: '#ef9a86', legs: '#e39a8f', tips: '#2d3133' },
  whistlingDuck: { body: '#b86d43', wing: '#8c5b3c', head: '#a39a8e', neck: 0.22, bill: '#f06f86', legs: '#f08a9a', belly: '#2a2624' },
  sandhillCrane: { body: '#a3a8a9', wing: '#8e9496', head: '#b5babb', neck: 0.48, longLegs: true, bill: '#3c423f', cap: '#c9443a', legs: '#3f4642' }
};
const TOPS = { egret: -1.34, avocet: -1.24, sandhillCrane: -1.38 };
function paintWaterbird(c, size, time, state, bird) {
  c.save();
  c.scale(size, size);
  const leg = bird.longLegs ? 0.43 : bird.duck ? 0.12 : 0.25;
  const bodyY = -leg - 0.2;
  const headY = bodyY - 0.1 - bird.neck;
  const bob = state.walking ? Math.sin(time * 7) * 0.015 : 0;
  c.translate(0, bob);
  for (const dx of [-0.08, 0.12]) {
    const step = state.walking ? Math.sin(time * 8 + dx * 12) * 0.08 : 0;
    line(c, [[dx, bodyY], [dx + step, -0.03], [dx + step + 0.12, -0.02]], bird.legs ?? (bird.duck || bird.bands ? '#e1a24a' : '#4c5d58'), 0.025);
  }
  shape(c, [[-0.25, bodyY], [-0.5, bodyY + 0.02], [-0.3, bodyY + 0.13]], bird.tips ?? bird.wing);
  oval(c, 0, bodyY, 0.32, 0.19, bird.body);
  if (bird.belly) oval(c, 0.02, bodyY + 0.09, 0.24, 0.09, bird.belly);
  oval(c, -0.07, bodyY - 0.015, 0.24, 0.13, bird.wing);
  if (bird.duck) {
    line(c, [[-0.2, bodyY - 0.06], [0.11, bodyY - 0.12]], '#ece3bd', 0.045);
    oval(c, 0.16, bodyY + 0.07, 0.11, 0.11, '#a45d49');
  }
  line(c, [[0.16, bodyY], [0.07, headY + 0.12], [0.22, headY]], bird.body, bird.longLegs ? 0.075 : 0.13);
  oval(c, 0.22, headY, 0.14, 0.13, bird.head);
  if (bird.crest) {
    shape(c, [[0.1, headY - 0.06], [-0.13, headY + 0.14], [0.24, headY + 0.03]], '#336954');
    line(c, [[-0.07, headY + 0.08], [0.17, headY + 0.03]], '#fff6df', 0.025);
    line(c, [[0.08, headY - 0.09], [0.31, headY - 0.035]], '#fff6df', 0.025);
  }
  if (bird.cap) oval(c, 0.2, headY - 0.085, 0.13, 0.06, bird.cap);
  const reach = bird.pouch ? 0.75 : bird.duck ? 0.47 : 0.62;
  if (bird.curved) line(c, [[0.32, headY + 0.02], [0.5, headY + 0.02], [0.65, headY - 0.02], [0.76, headY - 0.12]], '#303b3d', 0.025);
  else shape(c, [[0.33, headY - 0.02], [reach, headY + 0.03], [0.33, headY + 0.06]], bird.bill ?? '#4a4d42');
  if (bird.pouch) shape(c, [[0.32, headY + 0.03], [0.72, headY + 0.06], [0.4, headY + 0.24]], '#c9a58b');
  if (bird.bands) for (let n = 0; n < bird.bands; n++) line(c, [[0.13, headY + 0.16 + n * 0.08], [0.28, headY + 0.18 + n * 0.08]], '#383e38', 0.05);
  if (bird.redEye) oval(c, 0.26, headY - 0.025, 0.04, 0.035, '#dc4c3f');
  eye(c, 0.26, headY - 0.025, time);
  c.restore();
}
export const WATERBIRD_PAINTERS = Object.fromEntries(Object.entries(BIRDS).map(([kind, bird]) =>
  [kind, (c, size, time, state = {}) => paintWaterbird(c, size, time, state, bird)]));
export const WATERBIRD_BOXES = Object.fromEntries(Object.keys(BIRDS).map(kind =>
  [kind, { left: -0.52, right: 0.8, top: TOPS[kind] ?? -1.12 }]));
