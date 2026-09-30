// Perching birds: each species has its own plumage, crest, bill, and tail markings.
import { eye, line, oval, shape } from './paint-shapes.js';
const BIRDS = {
  cardinal: { body: '#d84940', wing: '#ae302f', crest: true, mask: true, beak: '#eeaa57' },
  blueJay: { body: '#5e9cd5', wing: '#3278bd', crest: true, bars: true, necklace: true },
  mockingbird: { body: '#9caaa9', wing: '#697e82', patch: '#fff', tail: 0.6 },
  dove: { body: '#b6a28a', wing: '#998b7f', spots: true, tail: 0.7 },
  grackle: { body: '#293547', wing: '#343349', tail: 0.85, yellowEye: true },
  hummingbird: { body: '#509456', wing: '#8db3b0', patch: '#de4a55', bill: 0.42, hover: true },
  woodpecker: { body: '#e3dbca', wing: '#2b343b', bars: true, cap: '#dc5046', bill: 0.28 },
  redwing: { body: '#283238', wing: '#192830', patch: '#f14a37', patchEdge: '#f8cc56' },
  meadowlark: { body: '#e7c54b', wing: '#8b8264', necklace: true, spots: true },
  scissortail: { body: '#b6c0c8', wing: '#4e6171', patch: '#edb394', fork: true, tail: 1.1 },
  kingfisher: { body: '#edf0e8', wing: '#5c8f9d', crest: true, necklace: true, bill: 0.4 }
};

function paintBird(c, size, time, state, bird) {
  c.save();
  c.scale(size, size);
  const bob = state.walking ? Math.sin(time * 10) * 0.025 : Math.sin(time * 2) * 0.008;
  c.translate(0, bob);
  const tail = bird.tail ?? 0.4;
  shape(c, [[-0.17, -0.37], [-tail - 0.25, -0.16], [-tail - 0.05, -0.06], [-0.07, -0.25]], bird.wing);
  if (bird.fork) shape(c, [[-0.2, -0.35], [-1.3, 0.03], [-0.87, -0.21]], '#3b4a57');
  for (const dx of [-0.12, 0.13]) {
    const step = state.walking ? Math.sin(time * 9 + dx * 12) * 0.09 : 0;
    line(c, [[dx, -0.3], [dx + step, -0.07], [dx + step + 0.12, -0.02]], '#695849');
  }
  oval(c, 0, -0.46, 0.33, 0.3, bird.body, -0.2);
  oval(c, -0.04, -0.44, 0.26, 0.17, bird.wing, -0.25);
  if (bird.hover) {
    oval(c, -0.08, -0.66, 0.32, 0.09, '#c1d8d8', Math.sin(time * 32) * 0.8 - 0.7);
  }
  if (bird.patch) oval(c, 0.07, -0.53, 0.14, 0.075, bird.patch, -0.25);
  if (bird.patchEdge) line(c, [[-0.04, -0.46], [0.12, -0.48]], bird.patchEdge, 0.045);
  if (bird.bars) for (let n = 0; n < 4; n++) line(c, [[-0.23, -0.55 + n * 0.07], [0.1, -0.6 + n * 0.07]], '#eff5ed', 0.025);
  if (bird.spots) for (let n = 0; n < 3; n++) oval(c, -0.16 + n * 0.09, -0.43, 0.025, 0.02, '#4c4841');
  oval(c, 0.24, -0.73, 0.18, 0.18, bird.body);
  if (bird.crest) shape(c, [[0.05, -0.8], [0.16, -1], [0.34, -0.8]], bird.body);
  if (bird.cap) oval(c, 0.24, -0.87, 0.16, 0.055, bird.cap);
  if (bird.mask) oval(c, 0.34, -0.74, 0.08, 0.115, '#353333');
  if (bird.necklace) line(c, [[0.11, -0.63], [0.22, -0.56], [0.35, -0.6]], '#333b3d', 0.05);
  shape(c, [[0.38, -0.77], [0.4 + (bird.bill ?? 0.16), -0.72], [0.38, -0.67]], bird.beak ?? '#576153');
  if (bird.yellowEye) oval(c, 0.3, -0.78, 0.045, 0.045, '#f3d861');
  eye(c, 0.3, -0.78, time);
  c.restore();
}
export const SONGBIRD_PAINTERS = Object.fromEntries(Object.entries(BIRDS).map(([kind, bird]) =>
  [kind, (c, size, time, state = {}) => paintBird(c, size, time, state, bird)]));
export const SONGBIRD_BOXES = Object.fromEntries(Object.entries(BIRDS).map(([kind, bird]) =>
  [kind, { left: -(bird.tail ?? 0.4) - 0.25, right: 0.8, top: -1.04 }]));
