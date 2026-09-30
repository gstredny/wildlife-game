// The bullfrog, leopard frog, and Gulf Coast toad.
import { eye, line, oval } from './paint-shapes.js';
const FROGS = {
  bullfrog: { skin: '#6f9846', belly: '#ced493' },
  leopardFrog: { skin: '#7d9b5b', belly: '#e0dcb0', spots: true },
  toad: { skin: '#ac9370', belly: '#d7c09a', bumps: true }
};
function paintFrog(c, size, time, state, frog) {
  c.save(); c.scale(size, size);
  const hop = state.walking ? Math.max(0, Math.sin(time * 7)) * 0.08 : 0;
  c.translate(0, -hop);
  oval(c, -0.22, -0.23, 0.32, 0.2, frog.skin, -0.2);
  line(c, [[-0.42, -0.31], [-0.67, -0.09], [-0.26, -0.04]], frog.skin, 0.14);
  oval(c, 0.04, -0.29, 0.43, 0.27, frog.skin);
  oval(c, 0.19, -0.2, 0.28, 0.15, frog.belly);
  for (const x of [0.04, 0.25]) line(c, [[x, -0.29], [x + 0.07, -0.04], [x + 0.22, -0.025]], frog.skin, 0.075);
  if (frog.spots || frog.bumps) for (let n = 0; n < 7; n++) oval(c, -0.3 + (n % 4) * 0.14, -0.39 + Math.floor(n / 4) * 0.13, frog.spots ? 0.065 : 0.03, 0.038, '#4f6743');
  oval(c, 0.3, -0.46, 0.22, 0.2, frog.skin);
  oval(c, 0.34, -0.59, 0.1, 0.12, frog.skin);
  oval(c, 0.37, -0.6, 0.061, 0.065, '#ecd485');
  eye(c, 0.37, -0.6, time);
  line(c, [[0.25, -0.36], [0.48, -0.36]], '#526944', 0.02);
  c.restore();
}
export const FROG_PAINTERS = Object.fromEntries(Object.entries(FROGS).map(([kind, frog]) =>
  [kind, (c, size, time, state = {}) => paintFrog(c, size, time, state, frog)]));
export const FROG_BOXES = Object.fromEntries(Object.keys(FROGS).map(kind =>
  [kind, { left: -0.76, right: 0.55, top: -0.78 }]));
