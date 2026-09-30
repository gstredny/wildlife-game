// The Mexican free-tailed bat, seen from the front with its wings flapping, big ears, and the short tail
// that pokes out behind it.
import { eye, line, oval, shape } from './paint-shapes.js';

export const BAT_BOX = { left: -0.66, right: 0.66, top: -0.9 };

export function paintBat(c, size, time) {
  c.save(); c.scale(size, size);
  c.translate(0, -0.5);
  const lift = Math.cos(time * 12); // 1: wings up, -1: wings down
  for (const side of [-1, 1]) {
    const wing = [[0.06, -0.06], [0.34, -0.3], [0.64, -0.2], [0.52, 0.06], [0.4, 0], [0.28, 0.09], [0.16, 0.03], [0.06, 0.08]];
    shape(c, wing.map(([x, y]) => [side * x, y < 0 ? y * lift : y]), '#4a3b35');
    line(c, [[side * 0.06, -0.06], [side * 0.34, -0.3 * lift], [side * 0.64, -0.2 * lift]], '#2f2622', 0.025);
  }
  line(c, [[0, 0.12], [0, 0.26]], '#5a463d', 0.03);
  oval(c, 0, 0.02, 0.1, 0.15, '#6b5549');
  for (const side of [-1, 1]) shape(c, [[side * 0.03, -0.2], [side * 0.12, -0.32], [side * 0.1, -0.16]], '#5a473e');
  oval(c, 0, -0.15, 0.085, 0.075, '#7a6254');
  for (const side of [-1, 1]) eye(c, side * 0.035, -0.16, time);
  oval(c, 0, -0.11, 0.025, 0.015, '#2f2622');
  c.restore();
}
