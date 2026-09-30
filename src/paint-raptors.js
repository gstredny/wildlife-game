// The prairie hawks and falcons plus the woodland owl.
import { eye, line, oval, shape } from './paint-shapes.js';
const RAPTORS = {
  hawk: { body: '#c1a17c', wing: '#775e4d', head: '#9a7959', tail: '#bf7451' },
  kestrel: { body: '#d9b995', wing: '#789baa', head: '#b89d85', tail: '#c48b65' },
  barredOwl: { body: '#c6b9a0', wing: '#897f6c', head: '#ded6bd', owl: true },
  whiteTailedHawk: { body: '#eef0ec', wing: '#7b848c', head: '#8d969d', tail: '#f5f5f0', shoulder: '#b8683f' },
  caracara: { body: '#eee5d2', wing: '#2f2a25', head: '#f0e8d6', tail: '#e7dfcc', cap: '#2b2621', face: '#e8793a' }
};
function paintRaptor(c, size, time, state, bird) {
  c.save(); c.scale(size, size);
  c.translate(0, state.walking ? Math.sin(time * 8) * 0.025 : 0);
  for (const dx of [-0.1, 0.13]) line(c, [[dx, -0.26], [dx, -0.04], [dx + 0.13, -0.02]], '#d5ac57', 0.035);
  shape(c, [[-0.05, -0.4], [-0.35, -0.05], [0.14, -0.09]], bird.tail ?? bird.wing);
  oval(c, 0, -0.49, 0.3, 0.32, bird.body);
  oval(c, -0.11, -0.46, 0.19, 0.26, bird.wing, -0.3);
  if (bird.shoulder) oval(c, -0.02, -0.62, 0.11, 0.07, bird.shoulder, -0.3);
  for (let n = 0; n < 4; n++) line(c, [[-0.2, -0.64 + n * 0.1], [-0.01, -0.61 + n * 0.1]], bird.body, 0.022);
  if (bird.owl) {
    oval(c, 0.08, -0.78, 0.29, 0.23, bird.wing);
    for (const dx of [-0.05, 0.2]) { oval(c, dx, -0.78, 0.13, 0.16, bird.head); eye(c, dx, -0.8, time); }
    shape(c, [[0.04, -0.72], [0.12, -0.72], [0.08, -0.62]], '#bda064');
    for (let n = 0; n < 3; n++) line(c, [[0.05, -0.54 + n * 0.08], [0.17, -0.52 + n * 0.08]], '#756c5e', 0.025);
  } else {
    oval(c, 0.21, -0.78, 0.18, 0.17, bird.head);
    if (bird.face) oval(c, 0.31, -0.76, 0.085, 0.07, bird.face);
    if (bird.cap) oval(c, 0.19, -0.86, 0.15, 0.075, bird.cap);
    shape(c, [[0.34, -0.8], [0.5, -0.75], [0.4, -0.62], [0.37, -0.72]], '#dec362');
    if (bird === RAPTORS.kestrel) for (const dx of [0.12, 0.27]) line(c, [[dx, -0.78], [dx - 0.03, -0.61]], '#43463e', 0.035);
    else oval(c, 0.2, -0.44, 0.09, 0.06, '#746351');
    eye(c, 0.26, -0.81, time);
  }
  c.restore();
}
export const RAPTOR_PAINTERS = Object.fromEntries(Object.entries(RAPTORS).map(([kind, bird]) =>
  [kind, (c, size, time, state = {}) => paintRaptor(c, size, time, state, bird)]));
export const RAPTOR_BOXES = Object.fromEntries(Object.keys(RAPTORS).map(kind =>
  [kind, { left: -0.38, right: 0.52, top: -1.03 }]));
