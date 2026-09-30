// The green darner, monarch, ghost crab, and crawfish.
import { eye, line, oval, shape } from './paint-shapes.js';
function paintDragonfly(c, size, time) {
  c.save(); c.scale(size, size);
  const flutter = Math.sin(time * 18) * 0.1;
  for (const side of [-1, 1]) {
    oval(c, -0.1, -0.42 + side * 0.18, 0.4, 0.09, '#d8eded', side * (0.3 + flutter));
    line(c, [[0, -0.42], [-0.44, -0.42 + side * 0.18]], '#9fbaba', 0.015);
  }
  line(c, [[-0.63, -0.42], [0.12, -0.42]], '#4e9984', 0.07);
  oval(c, 0.07, -0.42, 0.18, 0.1, '#70ac5d');
  oval(c, 0.28, -0.42, 0.11, 0.08, '#8ab777');
  eye(c, 0.29, -0.45, time);
  c.restore();
}
function paintMonarch(c, size, time) {
  c.save(); c.scale(size, size);
  const spread = 0.83 + Math.sin(time * 5) * 0.15;
  for (const side of [-1, 1]) {
    oval(c, side * 0.25, -0.58, 0.27 * spread, 0.36, '#29342d', side * 0.3);
    oval(c, side * 0.24, -0.58, 0.23 * spread, 0.31, '#eaaa40', side * 0.3);
    oval(c, side * 0.21, -0.23, 0.23 * spread, 0.18, '#2e3930');
    oval(c, side * 0.21, -0.23, 0.19 * spread, 0.14, '#df8e37');
    for (let n = 0; n < 3; n++) line(c, [[0, -0.4], [side * (0.18 + n * 0.1), -0.78 + n * 0.12]], '#354135', 0.022);
    for (let n = 0; n < 4; n++) oval(c, side * (0.24 + Math.sin(n) * 0.12), -0.85 + n * 0.1, 0.015, 0.015, '#fff1ce');
  }
  oval(c, 0, -0.43, 0.055, 0.3, '#283931');
  for (const side of [-1, 1]) line(c, [[0, -0.7], [side * 0.1, -0.87]], '#283931', 0.025);
  c.restore();
}
function paintCrab(c, size, time, state = {}) {
  c.save(); c.scale(size, size);
  for (const side of [-1, 1]) {
    for (let n = 0; n < 4; n++) {
      const step = state.walking ? Math.sin(time * 12 + n) * 0.03 : 0;
      line(c, [[side * 0.19, -0.24], [side * (0.35 + n * 0.06), -0.18 - n * 0.035], [side * (0.48 + n * 0.04), -0.03 + step]], '#c9b996', 0.04);
    }
    line(c, [[side * 0.23, -0.29], [side * 0.42, -0.48]], '#c3b58f', 0.055);
    oval(c, side * 0.46, -0.5, 0.12, 0.1, '#e7d9ac');
    line(c, [[side * 0.43, -0.51], [side * 0.53, -0.57]], '#aa987b', 0.02);
    line(c, [[side * 0.1, -0.33], [side * 0.12, -0.55]], '#c4b38d', 0.035);
    eye(c, side * 0.12, -0.55, time);
  }
  oval(c, 0, -0.27, 0.28, 0.18, '#e1d3a9');
  c.restore();
}
// A red swamp crawfish from the side: a curled, segmented tail, then its shell, then big claws out front.
function paintCrawfish(c, size, time, state = {}) {
  c.save(); c.scale(size, size);
  const step = state.walking ? Math.sin(time * 14) * 0.03 : 0;
  for (let n = 0; n < 4; n++) line(c, [[-0.1 + n * 0.1, -0.2], [-0.13 + n * 0.1 + (n % 2 ? step : -step), -0.02]], '#8e3324', 0.03);
  for (let n = 3; n >= 0; n--) oval(c, -0.3 - n * 0.13, -0.25 + n * 0.02, 0.1, 0.09 - n * 0.008, n % 2 ? '#b8452f' : '#a53a27');
  shape(c, [[-0.7, -0.22], [-0.9, -0.34], [-0.93, -0.1]], '#9d3624');
  oval(c, 0, -0.28, 0.26, 0.13, '#c24e33');
  line(c, [[-0.16, -0.34], [0.12, -0.36]], '#9d3624', 0.02);
  const pinch = state.alert ? Math.abs(Math.sin(time * 6)) * 0.06 : 0.02;
  for (const [dy, color] of [[-0.05, '#a53a27'], [0, '#c9553a']]) {
    line(c, [[0.16, -0.26 + dy], [0.36, -0.33 + dy], [0.5, -0.3 + dy]], color, 0.06);
    oval(c, 0.61, -0.3 + dy, 0.13, 0.07, color, -0.1);
    shape(c, [[0.68, -0.34 + dy], [0.92, -0.35 + dy - pinch], [0.72, -0.3 + dy]], color);
    shape(c, [[0.68, -0.27 + dy], [0.9, -0.25 + dy + pinch], [0.72, -0.31 + dy]], color);
  }
  line(c, [[0.22, -0.34], [0.55, -0.52], [0.95, -0.48]], '#8e3324', 0.015);
  eye(c, 0.22, -0.36, time);
  c.restore();
}

export const ARTHROPOD_PAINTERS = { dragonfly: paintDragonfly, monarch: paintMonarch, crab: paintCrab, crawfish: paintCrawfish };
export const ARTHROPOD_BOXES = {
  dragonfly: { left: -0.72, right: 0.42, top: -0.76 },
  monarch: { left: -0.55, right: 0.55, top: -1 },
  crab: { left: -0.72, right: 0.72, top: -0.68 },
  crawfish: { left: -0.95, right: 0.96, top: -0.56 }
};
