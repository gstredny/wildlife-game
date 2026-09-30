// Small mammals distinguished by their tails, coats, faces, and ears.
import { eye, line, oval, shape } from './paint-shapes.js';
const MAMMALS = {
  raccoon: { coat: '#929088', belly: '#c0b9a6', mask: true, rings: true },
  opossum: { coat: '#8d9294', belly: '#b6b9b2', face: '#e8e6d8', bareTail: true },
  armadillo: { coat: '#a4947b', belly: '#887866', armor: true, bareTail: true, tallEars: true },
  bobcat: { coat: '#be9c73', belly: '#e5c8a3', spots: true, shortTail: true, tufts: true },
  squirrel: { coat: '#a58161', belly: '#cc955e', bushy: true },
  nutria: { coat: '#8d7154', belly: '#b49b77', bareTail: true, teeth: true },
  riverOtter: { coat: '#715e4d', belly: '#b9a88e', otter: true },
  rabbit: { coat: '#b69c7a', belly: '#e6d7bc', rabbit: true, shortTail: true, tallEars: true }
};
function paintMammal(c, size, time, state, animal) {
  c.save(); c.scale(size, size);
  const stride = state.walking ? Math.sin(time * 8) : 0;
  c.translate(0, state.walking ? Math.abs(stride) * -0.02 : 0);
  const tailColor = animal.bareTail ? (animal.armor ? '#9c8c71' : '#c8a8a0') : animal.coat;
  if (animal.bushy) {
    oval(c, -0.65, -0.62, 0.2, 0.38, animal.coat, -0.5);
    oval(c, -0.69, -0.67, 0.12, 0.3, '#c3a284', -0.5);
  } else if (!animal.shortTail) {
    line(c, [[-0.45, -0.38], [-0.75, -0.27], [-1.15, -0.19]], tailColor, animal.otter ? 0.13 : animal.bareTail ? 0.045 : 0.16);
    if (animal.rings) for (let n = 0; n < 4; n++) line(c, [[-0.68 - n * 0.12, -0.28 + n * 0.02], [-0.69 - n * 0.12, -0.2 + n * 0.02]], '#4c4f49', 0.07);
  } else oval(c, -0.47, -0.32, 0.1, 0.08, animal.rabbit ? '#f9f3de' : '#665647');
  for (const [dx, phase] of [[-0.3, 0], [-0.2, 3], [0.17, 3], [0.28, 0]]) {
    line(c, [[dx, -0.29], [dx + Math.sin(time * 8 + phase) * (state.walking ? 0.08 : 0), -0.04]], animal.coat, 0.1);
    oval(c, dx + Math.sin(time * 8 + phase) * (state.walking ? 0.08 : 0) + 0.03, -0.035, 0.09, 0.035, animal.belly);
  }
  oval(c, -0.07, -0.42, 0.48, 0.25, animal.coat);
  oval(c, 0.02, -0.32, 0.34, 0.12, animal.belly);
  if (animal.armor) {
    oval(c, -0.1, -0.49, 0.43, 0.23, animal.coat);
    for (let n = 0; n < 7; n++) line(c, [[-0.3 + n * 0.065, -0.68], [-0.36 + n * 0.065, -0.35]], '#796f60', 0.022);
  }
  if (animal.spots) for (let n = 0; n < 8; n++) oval(c, -0.35 + (n % 4) * 0.13, -0.52 + Math.floor(n / 4) * 0.11, 0.025, 0.02, '#6d5946');
  const headX = animal.rabbit ? 0.26 : 0.4;
  const headY = animal.rabbit ? -0.61 : -0.5;
  const earLength = animal.tallEars ? (animal.rabbit ? 0.27 : 0.19) : 0.09;
  for (const dx of [-0.05, 0.12]) {
    oval(c, headX + dx, headY - 0.16, 0.06, earLength, animal.coat, -0.25);
    oval(c, headX + dx, headY - 0.17, 0.025, earLength * 0.7, '#d4ad9c', -0.25);
    if (animal.tufts) shape(c, [[headX + dx - 0.03, headY - 0.22], [headX + dx, headY - 0.3], [headX + dx + 0.03, headY - 0.22]], '#665646');
  }
  oval(c, headX, headY, 0.2, 0.18, animal.face ?? animal.coat);
  oval(c, headX + 0.13, headY + 0.05, 0.16, 0.09, animal.face ?? animal.belly);
  if (animal.mask) oval(c, headX + 0.04, headY - 0.04, 0.16, 0.065, '#454b48', -0.15);
  eye(c, headX + 0.08, headY - 0.055, time);
  oval(c, headX + 0.26, headY + 0.015, 0.035, 0.026, '#353936');
  if (animal.teeth) {
    c.fillStyle = '#ee913e';
    c.fillRect(headX + 0.19, headY + 0.075, 0.08, 0.055);
  }
  c.restore();
}
export const WOODLAND_PAINTERS = Object.fromEntries(Object.entries(MAMMALS).map(([kind, animal]) =>
  [kind, (c, size, time, state = {}) => paintMammal(c, size, time, state, animal)]));
export const WOODLAND_BOXES = Object.fromEntries(Object.entries(MAMMALS).map(([kind, animal]) =>
  [kind, { left: animal.shortTail ? -0.6 : -1.22, right: 0.72, top: -1.04 }]));
