// Wetland snakes and the backyard green anole.
import { eye, line, oval, shape } from './paint-shapes.js';
function paintCottonmouth(c, size, time, state = {}) {
  c.save(); c.scale(size, size);
  const sway = Math.sin(time * (state.walking ? 5 : 1)) * 0.04;
  line(c, [[-1, -0.04], [-0.66, -0.3 + sway], [-0.24, -0.05], [0.17, -0.36], [0.56, -0.25]], '#625d45', 0.18);
  for (let n = 0; n < 5; n++) oval(c, -0.65 + n * 0.23, -0.19, 0.075, 0.075, '#494d3d');
  oval(c, 0.61, -0.26, 0.21, 0.12, '#716a50');
  eye(c, 0.66, -0.3, time);
  c.restore();
}
function paintWatersnake(c, size, time, state = {}) {
  c.save(); c.scale(size, size);
  const sway = Math.sin(time * (state.walking ? 5 : 1)) * 0.035;
  line(c, [[-1, -0.05], [-0.63, -0.23 + sway], [-0.24, -0.09], [0.17, -0.3], [0.55, -0.19]], '#727e62', 0.12);
  line(c, [[-0.75, -0.15], [-0.27, -0.05], [0.19, -0.24], [0.55, -0.14]], '#c7b983', 0.035);
  oval(c, 0.61, -0.19, 0.15, 0.08, '#839171');
  eye(c, 0.66, -0.22, time);
  c.restore();
}
function paintAnole(c, size, time, state = {}) {
  c.save(); c.scale(size, size);
  line(c, [[-0.28, -0.26], [-0.65, -0.15], [-1.1, -0.05]], '#639447', 0.06);
  for (const x of [-0.2, 0.23]) line(c, [[x, -0.25], [x - 0.09, -0.11], [x + 0.06, -0.03]], '#75a650', 0.05);
  oval(c, 0, -0.29, 0.37, 0.11, '#81b954');
  shape(c, [[0.27, -0.4], [0.62, -0.32], [0.29, -0.21]], '#8cc25b');
  if (state.alert) shape(c, [[0.22, -0.2], [0.39, -0.05], [0.48, -0.25]], '#df8d96');
  eye(c, 0.4, -0.34, time);
  c.restore();
}
export const SCALED_PAINTERS = { cottonmouth: paintCottonmouth, watersnake: paintWatersnake, anole: paintAnole };
export const SCALED_BOXES = {
  cottonmouth: { left: -1.12, right: 0.84, top: -0.48 },
  watersnake: { left: -1.1, right: 0.8, top: -0.4 },
  anole: { left: -1.15, right: 0.66, top: -0.46 }
};
